;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_DESIGN_CHAT_PATCH__) {
    return;
  }

  const ANNOTATION_CATEGORY_LABEL = "Pigma Design Chat";
  const ANNOTATION_CATEGORY_COLOR = "yellow";
  const ANNOTATION_LABEL_PREFIX = "[Design Chat]";
  const TEXT_PREVIEW_LIMIT = 320;
  const TEXT_PREVIEW_EDGE_LENGTH = 10;
  const TEXT_CONTENT_LIMIT = 2400;
  const SOURCE_EXPORT_EDGE = 1600;
  const originalOnMessage = typeof figma.ui.onmessage === "function" ? figma.ui.onmessage : null;

  const designChatOnMessage = async (message) => {
    if (isDesignChatMessage(message)) {
      if (message.type === "request-ai-design-chat-selection") {
        postSelectionState();
        return;
      }

      if (message.type === "request-ai-design-chat-source") {
        await handleSourceRequest(message);
        return;
      }

      if (message.type === "apply-ai-design-chat-annotation") {
        await handleAnnotationRequest(message);
        return;
      }
    }

    if (typeof originalOnMessage === "function") {
      return originalOnMessage(message);
    }
  };

  globalScope.__PIGMA_AI_DESIGN_CHAT_PATCH__ = true;

  figma.on("selectionchange", () => {
    postSelectionState();
  });
  figma.on("currentpagechange", () => {
    postSelectionState();
  });

  figma.ui.onmessage = designChatOnMessage;

  postSelectionState();

  function isDesignChatMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-design-chat-selection" ||
        message.type === "request-ai-design-chat-source" ||
        message.type === "apply-ai-design-chat-annotation")
    );
  }

  function postSelectionState() {
    let selection = null;
    try {
      selection = buildSelectionState();
    } catch (error) {
      selection = buildSelectionFallbackState();
    }
    figma.ui.postMessage({
      type: "ai-design-chat-selection",
      selection: selection,
    });
  }

  async function handleSourceRequest(message) {
    const clientRequestId = sanitizeText(message && message.clientRequestId);
    try {
      const roots = getSelectedRoots();
      const exportRoots = roots.filter((node) => canExportNode(node));
      const selection = buildSelectionStateFromRoots(roots);
      if (!selection.ready) {
        throw new Error("프레임, 이미지, 텍스트를 먼저 선택해 주세요.");
      }

      if (!exportRoots.length) {
        throw new Error("Could not export the current selection.");
      }

      const exportSelection = buildSelectionStateFromRoots(exportRoots);
      const bytes =
        exportRoots.length === 1
          ? await exportSingleRoot(exportRoots[0], exportSelection)
          : exportSelection.bounds
            ? await exportCombinedRoots(
                exportRoots,
                exportSelection.bounds,
                exportSelection.width || exportSelection.bounds.width,
                exportSelection.height || exportSelection.bounds.height
              )
            : await exportSingleRoot(exportRoots[0], exportSelection);
      if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
        throw new Error("선택 영역 캡처 결과가 비어 있습니다.");
      }

      figma.ui.postMessage({
        type: "ai-design-chat-source-ready",
        clientRequestId,
        selection,
        image: {
          bytes,
          mimeType: "image/png",
          fileName: buildFileName(selection.selectionLabel || "design-chat") + ".png",
        },
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "ai-design-chat-source-error",
        clientRequestId,
        message: normalizeErrorMessage(error, "선택 캡처를 준비하지 못했습니다."),
      });
    }
  }

  async function handleAnnotationRequest(message) {
    const clientRequestId = sanitizeText(message && message.clientRequestId);
    const messageId = sanitizeText(message && message.messageId);
    try {
      const annotationText = clipText(message && message.annotationText, 120);
      if (!annotationText) {
        throw new Error("주석으로 남길 텍스트가 없습니다.");
      }

      const roots = getSelectedRoots();
      const selection = buildSelectionStateFromRoots(roots);
      if (!selection.ready) {
        throw new Error("주석을 남길 선택이 없습니다.");
      }

      const requestedSignature = sanitizeText(message && message.selectionSignature);
      if (requestedSignature && selection.selectionSignature !== requestedSignature) {
        throw new Error("선택이 바뀌어서 주석을 남길 수 없습니다. 다시 질문해 주세요.");
      }

      const annotationNodes = roots.filter((node) => supportsAnnotationsOnNode(node));
      if (!annotationNodes.length) {
        throw new Error("현재 선택에는 주석을 남길 수 있는 노드가 없습니다.");
      }

      const category = await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR);
      let annotationCount = 0;

      for (const node of annotationNodes) {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedAnnotation(annotation, category));
        node.annotations = preserved.concat(buildAnnotation(annotationText, category));
        annotationCount += 1;
      }

      figma.ui.postMessage({
        type: "ai-design-chat-annotation-result",
        clientRequestId,
        messageId,
        selectionSignature: selection.selectionSignature,
        annotationCount,
        annotatedNodeCount: annotationNodes.length,
      });
      figma.notify(`디자인 채팅 주석 ${annotationNodes.length}개를 남겼습니다.`, { timeout: 1800 });
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "주석을 남기지 못했습니다.");
      figma.ui.postMessage({
        type: "ai-design-chat-annotation-error",
        clientRequestId,
        messageId,
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  function buildSelectionState() {
    return buildSelectionStateFromRoots(getSelectedRoots());
  }

  function buildSelectionStateFromRoots(roots) {
    const selectionRoots = Array.isArray(roots) ? roots.filter(Boolean) : [];
    const bounds = combineBounds(selectionRoots.map((node) => getNodeBoundsSafe(node)).filter(Boolean));
    const typeLabels = uniqueStrings(selectionRoots.map((node) => formatNodeType(getNodeTypeSafe(node))), 4);
    const sourceType = resolveSourceType(selectionRoots);
    const captureMode = selectionRoots.length > 1 ? "combined" : sourceType === "text" ? "text" : selectionRoots.length === 1 ? "single" : "idle";

    if (!selectionRoots.length) {
      return {
        ready: false,
        selectionSignature: getSelectionSignature([], ""),
        selectionLabel: "",
        selectionCount: 0,
        selectionTypeLabel: "",
        captureMode: "idle",
        captureModeLabel: "대기",
        width: 0,
        height: 0,
        textPreview: "",
        textContent: "",
        hint: "프레임, 이미지, 텍스트를 선택하면 대화를 시작할 수 있습니다.",
        roots: [],
        annotationTargetCount: 0,
        sourceType: "visual",
        bounds: null,
      };
    }

    const textContent = collectTextContent(selectionRoots, sourceType === "text");

    return {
      ready: true,
      selectionSignature: getSelectionSignature(selectionRoots, textContent),
      selectionLabel: formatSelectionLabel(selectionRoots, textContent),
      selectionCount: selectionRoots.length,
      selectionTypeLabel: typeLabels.join(" · "),
      captureMode,
      captureModeLabel:
        captureMode === "combined" ? "통합 화면" : captureMode === "text" ? "텍스트 단일" : captureMode === "single" ? "단일 선택" : "대기",
      width: bounds ? roundPixel(bounds.width) : 0,
      height: bounds ? roundPixel(bounds.height) : 0,
      textPreview: abbreviateMiddleText(textContent, TEXT_PREVIEW_EDGE_LENGTH),
      textContent,
      hint:
        captureMode === "combined"
          ? "다중 선택을 한 화면으로 묶어 캡처합니다."
          : sourceType === "text"
            ? "선택한 텍스트만 캡처해서 질문합니다."
            : "현재 선택을 그대로 캡처해서 질문합니다.",
      roots: selectionRoots.map((node) => ({
        id: node.id,
        name: safeName(node),
        type: getNodeTypeSafe(node),
      })),
      annotationTargetCount: selectionRoots.filter((node) => supportsAnnotationsOnNode(node)).length,
      sourceType,
      bounds,
    };
  }

  function getSelectedRoots() {
    const selection = Array.from(figma.currentPage.selection || []).filter((node) => isSelectableNode(node));
    if (!selection.length) {
      return [];
    }

    const selectedIds = new Set(selection.map((node) => node.id));
    const roots = selection.filter((node) => !hasSelectedAncestor(node, selectedIds));
    try {
      return roots.sort(compareNodeOrder);
    } catch (error) {
      return roots;
    }
  }

  function isSelectableNode(node) {
    return !!node && node.removed !== true && typeof node.id === "string" && typeof node.type === "string";
  }

  function canExportNode(node) {
    return isSelectableNode(node) && typeof node.exportAsync === "function";
  }

  function hasSelectedAncestor(node, selectedIds) {
    let current = node ? node.parent : null;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (selectedIds.has(current.id)) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function compareNodeOrder(left, right) {
    const leftPath = getNodeIndexPath(left);
    const rightPath = getNodeIndexPath(right);
    const length = Math.max(leftPath.length, rightPath.length);
    for (let index = 0; index < length; index += 1) {
      const leftValue = index < leftPath.length ? leftPath[index] : -1;
      const rightValue = index < rightPath.length ? rightPath[index] : -1;
      if (leftValue !== rightValue) {
        return leftValue - rightValue;
      }
    }
    return safeName(left).localeCompare(safeName(right));
  }

  function getNodeIndexPath(node) {
    const path = [];
    let current = node;
    while (current && current.parent && Array.isArray(current.parent.children)) {
      path.unshift(current.parent.children.indexOf(current));
      current = current.parent;
      if (current.type === "PAGE") {
        break;
      }
    }
    return path;
  }

  function resolveSourceType(roots) {
    const items = Array.isArray(roots) ? roots : [];
    if (!items.length) {
      return "visual";
    }
    const allText = items.every((node) => getNodeTypeSafe(node) === "TEXT");
    if (allText) {
      return "text";
    }
    const hasText = items.some((node) => getNodeTypeSafe(node) === "TEXT");
    return hasText ? "mixed" : "visual";
  }

  function collectTextPreview(roots, directOnly) {
    return abbreviateMiddleText(collectTextContent(roots, directOnly), TEXT_PREVIEW_EDGE_LENGTH);
  }

  function collectTextContent(roots, directOnly) {
    const snippets = [];
    let totalLength = 0;
    const queue = Array.isArray(roots) ? roots.slice() : [];

    while (queue.length > 0 && totalLength < TEXT_CONTENT_LIMIT) {
      const node = queue.shift();
      if (!node || node.visible === false) {
        continue;
      }

      if (getNodeTypeSafe(node) === "TEXT" && typeof node.characters === "string") {
        const snippet = compactText(node.characters);
        if (snippet) {
          snippets.push(snippet);
          totalLength += snippet.length;
        }
      }

      const children = getNodeChildrenSafe(node);
      if (!directOnly && children.length) {
        for (const child of children) {
          queue.push(child);
        }
      }
    }

    return clipText(snippets.join(" · "), TEXT_CONTENT_LIMIT);
  }

  async function exportSingleRoot(root, selection) {
    const exportOptions = {
      format: "PNG",
      useAbsoluteBounds: true,
    };
    const constraint = buildExportConstraint(selection.width, selection.height);
    if (constraint) {
      exportOptions.constraint = constraint;
    }
    return await root.exportAsync(exportOptions);
  }

  async function exportCombinedRoots(roots, bounds, width, height) {
    const tempFrame = figma.createFrame();
    tempFrame.name = "__Pigma Design Chat Capture__";
    tempFrame.x = roundPixel(bounds.x + width + 4000);
    tempFrame.y = roundPixel(bounds.y);
    tempFrame.resize(Math.max(1, roundPixel(width)), Math.max(1, roundPixel(height)));
    tempFrame.fills = [];
    tempFrame.strokes = [];
    tempFrame.clipsContent = true;
    figma.currentPage.appendChild(tempFrame);

    let placedCount = 0;

    try {
      for (const node of roots) {
        const nodeBounds = getNodeBounds(node);
        if (!nodeBounds) {
          continue;
        }
        const bytes = await node.exportAsync({
          format: "PNG",
          useAbsoluteBounds: true,
        });
        if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
          continue;
        }
        const image = figma.createImage(bytes);
        const rect = figma.createRectangle();
        rect.name = safeName(node);
        rect.x = nodeBounds.x - bounds.x;
        rect.y = nodeBounds.y - bounds.y;
        rect.resize(Math.max(1, nodeBounds.width), Math.max(1, nodeBounds.height));
        rect.strokes = [];
        rect.fills = [
          {
            type: "IMAGE",
            scaleMode: "FILL",
            imageHash: image.hash,
          },
        ];
        tempFrame.appendChild(rect);
        placedCount += 1;
      }

      if (!placedCount) {
        throw new Error("통합 캡처에 사용할 선택 레이어를 찾지 못했습니다.");
      }

      const exportOptions = {
        format: "PNG",
        useAbsoluteBounds: false,
      };
      const constraint = buildExportConstraint(width, height);
      if (constraint) {
        exportOptions.constraint = constraint;
      }
      return await tempFrame.exportAsync(exportOptions);
    } finally {
      tempFrame.remove();
    }
  }

  function buildExportConstraint(width, height) {
    const maxEdge = Math.max(Number(width) || 0, Number(height) || 0);
    if (!(maxEdge > SOURCE_EXPORT_EDGE)) {
      return null;
    }
    if ((Number(width) || 0) >= (Number(height) || 0)) {
      return {
        type: "WIDTH",
        value: SOURCE_EXPORT_EDGE,
      };
    }
    return {
      type: "HEIGHT",
      value: SOURCE_EXPORT_EDGE,
    };
  }

  function getSelectionSignature(selection, textContent) {
    const items = Array.from(selection || [])
      .map((node) => {
        const bounds = getNodeBoundsSafe(node);
        const boundsKey = bounds
          ? [
              roundSignatureNumber(bounds.x),
              roundSignatureNumber(bounds.y),
              roundSignatureNumber(bounds.width),
              roundSignatureNumber(bounds.height),
            ].join(":")
          : "";
        return [node.id, getNodeTypeSafe(node), hashSignatureText(safeName(node)), boundsKey, getNodeChildrenSafe(node).length].join("@");
      })
      .sort();
    const text = sanitizeText(textContent);
    return `${figma.currentPage.id}:${hashSignatureText(items.join("|"))}:${text.length}:${hashSignatureText(text)}`;
  }

  function roundSignatureNumber(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function hashSignatureText(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function getNodeBounds(node) {
    if (node && node.absoluteRenderBounds) {
      return cloneBounds(node.absoluteRenderBounds);
    }
    if (node && node.absoluteBoundingBox) {
      return cloneBounds(node.absoluteBoundingBox);
    }
    if (
      node &&
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      typeof node.width === "number" &&
      typeof node.height === "number"
    ) {
      return {
        x: node.x,
        y: node.y,
        width: Math.max(1, node.width),
        height: Math.max(1, node.height),
      };
    }
    return null;
  }

  function getNodeBoundsSafe(node) {
    try {
      return getNodeBounds(node);
    } catch (error) {
      return null;
    }
  }

  function cloneBounds(bounds) {
    return {
      x: Number(bounds.x) || 0,
      y: Number(bounds.y) || 0,
      width: Math.max(1, Number(bounds.width) || 1),
      height: Math.max(1, Number(bounds.height) || 1),
    };
  }

  function combineBounds(boundsList) {
    if (!Array.isArray(boundsList) || !boundsList.length) {
      return null;
    }
    let left = boundsList[0].x;
    let top = boundsList[0].y;
    let right = boundsList[0].x + boundsList[0].width;
    let bottom = boundsList[0].y + boundsList[0].height;

    for (let index = 1; index < boundsList.length; index += 1) {
      const bounds = boundsList[index];
      left = Math.min(left, bounds.x);
      top = Math.min(top, bounds.y);
      right = Math.max(right, bounds.x + bounds.width);
      bottom = Math.max(bottom, bounds.y + bounds.height);
    }

    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    };
  }

  async function ensureAnnotationCategory(requestedColor) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const existing = Array.isArray(categories)
        ? categories.find((category) => category && category.label === ANNOTATION_CATEGORY_LABEL)
        : null;
      const color = typeof requestedColor === "string" && requestedColor.trim() ? requestedColor.trim().toLowerCase() : ANNOTATION_CATEGORY_COLOR;

      if (existing) {
        if (typeof existing.setColor === "function" && existing.color !== color) {
          existing.setColor(color);
        }
        return existing;
      }

      if (typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
        return null;
      }

      return await figma.annotations.addAnnotationCategoryAsync({
        label: ANNOTATION_CATEGORY_LABEL,
        color,
      });
    } catch (error) {
      return null;
    }
  }

  function buildAnnotation(text, category) {
    const annotation = {
      label: `${ANNOTATION_LABEL_PREFIX} ${clipText(text, 120)}`,
    };
    if (category && category.id) {
      annotation.categoryId = category.id;
    }
    return annotation;
  }

  function isManagedAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }
    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }
    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return typeof label === "string" && label.startsWith(ANNOTATION_LABEL_PREFIX);
  }

  function supportsAnnotationsOnNode(node) {
    try {
      return !!node && Array.isArray(node.annotations);
    } catch (error) {
      return false;
    }
  }

  function formatSelectionLabel(roots, textContent) {
    if (!Array.isArray(roots) || !roots.length) {
      return "";
    }
    const textPreview = abbreviateMiddleText(textContent, TEXT_PREVIEW_EDGE_LENGTH);
    if (textPreview && roots.every((node) => getNodeTypeSafe(node) === "TEXT")) {
      return textPreview;
    }
    if (roots.length === 1) {
      return safeName(roots[0]);
    }
    return `${safeName(roots[0])} 외 ${roots.length - 1}개`;
  }

  function formatNodeType(type) {
    switch (String(type || "").toUpperCase()) {
      case "FRAME":
        return "프레임";
      case "GROUP":
        return "그룹";
      case "TEXT":
        return "텍스트";
      case "SECTION":
        return "섹션";
      case "COMPONENT":
        return "컴포넌트";
      case "COMPONENT_SET":
        return "컴포넌트 세트";
      case "INSTANCE":
        return "인스턴스";
      case "VECTOR":
        return "벡터";
      case "RECTANGLE":
        return "사각형";
      case "ELLIPSE":
        return "원형";
      default:
        return String(type || "레이어");
    }
  }

  function uniqueStrings(values, limit) {
    const seen = new Set();
    const result = [];
    for (const value of Array.isArray(values) ? values : []) {
      const text = typeof value === "string" ? value.trim() : "";
      if (!text || seen.has(text)) {
        continue;
      }
      seen.add(text);
      result.push(text);
      if (limit && result.length >= limit) {
        break;
      }
    }
    return result;
  }

  function safeName(node) {
    try {
      if (node && typeof node.name === "string" && node.name.trim()) {
        return node.name.trim();
      }
    } catch (error) {}
    try {
      return String((node && node.type) || "Layer");
    } catch (error) {
      return "Layer";
    }
  }

  function getNodeTypeSafe(node) {
    try {
      return String((node && node.type) || "UNKNOWN");
    } catch (error) {
      return "UNKNOWN";
    }
  }

  function getNodeChildrenSafe(node) {
    try {
      return Array.isArray(node && node.children) ? node.children : [];
    } catch (error) {
      return [];
    }
  }

  function buildSelectionFallbackState() {
    const roots = Array.from(figma.currentPage.selection || []).filter((node) => isSelectableNode(node));
    return buildSelectionStateFromRoots(roots);
  }

  function buildFileName(value) {
    const source = sanitizeText(value) || "design-chat";
    return source.replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "design-chat";
  }

  function clipText(value, maxLength) {
    const text = sanitizeText(value);
    if (!text) {
      return "";
    }
    const limit = Math.max(1, Number(maxLength) || 0);
    if (!limit || text.length <= limit) {
      return text;
    }
    return `${text.slice(0, Math.max(1, limit - 1)).trim()}...`;
  }

  function abbreviateMiddleText(value, edgeLength) {
    const text = sanitizeText(value);
    if (!text) {
      return "";
    }
    const edge = Math.max(1, Number(edgeLength) || TEXT_PREVIEW_EDGE_LENGTH);
    if (text.length <= edge * 2 + 4) {
      return text;
    }
    return `${text.slice(0, edge).trim()}....${text.slice(-edge).trim()}`;
  }

  function sanitizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function roundPixel(value) {
    return Math.max(1, Math.round(Number(value) || 0));
  }

  function normalizeErrorMessage(error, fallback) {
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return fallback;
  }
})();
