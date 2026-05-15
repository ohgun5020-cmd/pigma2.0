;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_BUTTON_TEXT_AUTO_SIZE_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  const BUTTON_RULES = [
    { fontSize: 12, lineHeight: 16, paddingY: 6, height: 28 },
    { fontSize: 13, lineHeight: 18, paddingY: 7, height: 32 },
    { fontSize: 14, lineHeight: 20, paddingY: 10, height: 40 },
    { fontSize: 15, lineHeight: 22, paddingY: 11, height: 44 },
    { fontSize: 16, lineHeight: 24, paddingY: 12, height: 48 },
    { fontSize: 18, lineHeight: 28, paddingY: 14, height: 56 },
  ];
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isButtonTextAutoSizeMessage(message)) {
      await runButtonTextAutoSize();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_BUTTON_TEXT_AUTO_SIZE_PATCH__ = true;

  function isButtonTextAutoSizeMessage(message) {
    return !!message && message.type === "run-button-text-auto-size";
  }

  async function runButtonTextAutoSize() {
    if (isRunning) {
      postStatus("running", "\uBC84\uD2BC \uD14D\uC2A4\uD2B8 \uD06C\uAE30\uC5D0 \uB9DE\uCDB0 \uBC15\uC2A4\uB97C \uC870\uC808\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
      return;
    }

    isRunning = true;
    postStatus("running", "\uBC84\uD2BC \uD14D\uC2A4\uD2B8 \uD06C\uAE30\uC5D0 \uB9DE\uB294 \uBC15\uC2A4 \uD06C\uAE30\uB97C \uACC4\uC0B0\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = await applyButtonTextAutoSize();
      figma.ui.postMessage({
        type: "button-text-auto-size-result",
        result,
      });
      figma.notify(buildResultToast(result), { timeout: 2200 });
    } catch (error) {
      const message = normalizeErrorMessage(
        error,
        "\uBC84\uD2BC \uD14D\uC2A4\uD2B8 \uC624\uD1A0 \uC0AC\uC774\uC988\uB97C \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
      );
      figma.ui.postMessage({
        type: "button-text-auto-size-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "button-text-auto-size-status",
      status,
      message,
    });
  }

  async function applyButtonTextAutoSize() {
    await ensureSelectionAccess();

    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uD14D\uC2A4\uD2B8\uB098 \uD14D\uC2A4\uD2B8+\uBC15\uC2A4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
    }

    const textNodes = collectTextNodesFromSelection(selection);
    if (!textNodes.length) {
      throw new Error("\uBC84\uD2BC \uD06C\uAE30\uB97C \uB9DE\uCD9C \uD14D\uC2A4\uD2B8\uB97C \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
    }

    const boxNodes = collectBoxNodesFromSelection(selection);
    const usedBoxIds = {};
    const resized = [];
    const created = [];
    const skipped = [];

    for (let index = 0; index < textNodes.length; index += 1) {
      const textNode = textNodes[index];
      try {
        const result = await fitSingleButtonText(textNode, boxNodes, usedBoxIds);
        if (result && result.mode === "created") {
          created.push(result.entry);
        } else if (result && result.mode === "resized") {
          resized.push(result.entry);
        }
      } catch (error) {
        skipped.push({
          nodeId: safeNodeId(textNode),
          nodeName: safeName(textNode),
          nodeType: safeNodeType(textNode),
          reason: normalizeErrorMessage(error, "\uC774 \uD14D\uC2A4\uD2B8\uB294 \uBC15\uC2A4 \uD06C\uAE30\uB97C \uB9DE\uCD9C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."),
        });
      }
    }

    if (!resized.length && !created.length) {
      const reason = skipped.length
        ? skipped[0].reason
        : "\uC801\uC6A9\uD560 \uD14D\uC2A4\uD2B8\uB098 \uBC15\uC2A4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
      throw new Error(reason);
    }

    restoreSelection(textNodes, resized, created);

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionCount: selection.length,
        textCount: textNodes.length,
        resizedBoxCount: resized.length,
        createdBoxCount: created.length,
        skippedCount: skipped.length,
      },
      resized: resized.slice(0, RESULT_PREVIEW_LIMIT),
      created: created.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function collectTextNodesFromSelection(selection) {
    const textNodes = [];
    for (let index = 0; index < selection.length; index += 1) {
      collectDescendantNodes(selection[index], textNodes, (node) => node && node.type === "TEXT" && !node.removed);
    }
    return textNodes;
  }

  function collectBoxNodesFromSelection(selection) {
    const boxNodes = [];
    for (let index = 0; index < selection.length; index += 1) {
      collectDescendantNodes(selection[index], boxNodes, isResizableBoxNode);
    }
    return boxNodes;
  }

  function collectDescendantNodes(node, list, predicate) {
    if (!node || node.removed) {
      return;
    }
    if (predicate(node)) {
      appendUniqueNode(list, node);
    }
    const children = Array.isArray(node.children) ? node.children : [];
    for (let index = 0; index < children.length; index += 1) {
      collectDescendantNodes(children[index], list, predicate);
    }
  }

  async function fitSingleButtonText(textNode, boxNodes, usedBoxIds) {
    await loadFontsForTextNode(textNode);

    const fontSize = resolveUniformFontSize(textNode);
    if (!(fontSize > 0)) {
      throw new Error("\uD14D\uC2A4\uD2B8\uC758 \uD3F0\uD2B8 \uD06C\uAE30\uAC00 \uC11E\uC5EC \uC788\uC5B4 \uAE30\uC900 \uB192\uC774\uB97C \uACC4\uC0B0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    }

    const metrics = resolveButtonMetrics(fontSize);
    const beforeTextSize = {
      width: roundMetric(getNodeWidth(textNode)),
      height: roundMetric(getNodeHeight(textNode)),
    };
    const beforeLineHeight = describeLineHeight(textNode.lineHeight, fontSize);

    const textBounds = getAbsoluteBounds(textNode);
    if (!textBounds || textBounds.width <= 0 || textBounds.height <= 0) {
      throw new Error("\uD14D\uC2A4\uD2B8\uC758 \uBC14\uC6B4\uB4DC\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const targetRect = buildTargetButtonRect(textBounds, metrics);
    const pairedBox = findBestBoxForText(textNode, boxNodes, usedBoxIds);

    if (pairedBox) {
      const beforeBoxSize = {
        width: roundMetric(getNodeWidth(pairedBox)),
        height: roundMetric(getNodeHeight(pairedBox)),
      };

      applyRectToBox(pairedBox, textNode, targetRect);
      if (safeNodeId(pairedBox)) {
        usedBoxIds[safeNodeId(pairedBox)] = true;
      }

      return {
        mode: "resized",
        entry: {
          nodeId: safeNodeId(pairedBox),
          nodeName: safeName(pairedBox),
          textNodeId: safeNodeId(textNode),
          textNodeName: safeName(textNode),
          fontSize: roundMetric(fontSize),
          lineHeight: beforeLineHeight,
          paddingY: targetRect.paddingY,
          paddingX: targetRect.paddingX,
          from: formatSize(beforeBoxSize),
          to: formatSize({ width: targetRect.width, height: targetRect.height }),
          textFrom: formatSize(beforeTextSize) + " / " + beforeLineHeight,
          textTo: formatSize({ width: getNodeWidth(textNode), height: getNodeHeight(textNode) }) + " / " + beforeLineHeight,
        },
      };
    }

    const createdBox = createBoxBehindText(textNode, targetRect, metrics);
    centerTextInBox(textNode, createdBox, targetRect);
    return {
      mode: "created",
      entry: {
        nodeId: safeNodeId(createdBox),
        nodeName: safeName(createdBox),
        textNodeId: safeNodeId(textNode),
        textNodeName: safeName(textNode),
        fontSize: roundMetric(fontSize),
        lineHeight: beforeLineHeight,
        paddingY: targetRect.paddingY,
        paddingX: targetRect.paddingX,
        to: formatSize({ width: targetRect.width, height: targetRect.height }),
        textFrom: formatSize(beforeTextSize) + " / " + beforeLineHeight,
        textTo: formatSize({ width: getNodeWidth(textNode), height: getNodeHeight(textNode) }) + " / " + beforeLineHeight,
      },
    };
  }

  function resolveButtonMetrics(fontSize) {
    const roundedSize = Math.round(Number(fontSize) || 0);
    for (let index = 0; index < BUTTON_RULES.length; index += 1) {
      if (BUTTON_RULES[index].fontSize === roundedSize) {
        return buildMetrics(BUTTON_RULES[index]);
      }
    }

    const lineHeight = Math.max(12, roundToEven(roundedSize * 2 - 8));
    const paddingY = Math.max(4, Math.round(lineHeight / 2));
    return buildMetrics({
      fontSize: roundedSize,
      lineHeight,
      paddingY,
      height: lineHeight + paddingY * 2,
    });
  }

  function buildMetrics(rule) {
    const height = Math.max(1, Math.round(Number(rule.height) || Number(rule.lineHeight) + Number(rule.paddingY) * 2));
    return {
      fontSize: Number(rule.fontSize) || 0,
      lineHeight: Math.max(1, Math.round(Number(rule.lineHeight) || 0)),
      paddingY: Math.max(0, Math.round(Number(rule.paddingY) || 0)),
      paddingX: Math.max(12, Math.round(height / 2)),
      height,
    };
  }

  function buildTargetButtonRect(textBounds, metrics) {
    const paddingX = resolveTargetHorizontalPadding(metrics);
    const paddingY = resolveTargetVerticalPadding(metrics);
    const width = Math.max(1, Math.ceil(textBounds.width + paddingX * 2));
    const height = Math.max(1, Math.ceil(textBounds.height + paddingY * 2));
    return {
      x: roundMetric(textBounds.x - paddingX),
      y: roundMetric(textBounds.y - paddingY),
      width,
      height,
      paddingX,
      paddingY,
    };
  }

  function resolveTargetHorizontalPadding(metrics) {
    const fontSize = Number(metrics && metrics.fontSize) || 0;
    const paddingX = Math.max(0, Number(metrics && metrics.paddingX) || 0);
    if (fontSize > 0 && fontSize <= 18) {
      return paddingX + 4;
    }
    return Math.max(18, Math.min(44, Math.round(fontSize * 0.7)));
  }

  function resolveTargetVerticalPadding(metrics) {
    const fontSize = Number(metrics && metrics.fontSize) || 0;
    const paddingY = Math.max(0, Number(metrics && metrics.paddingY) || 0);
    if (fontSize > 0 && fontSize <= 18) {
      return paddingY + 3;
    }
    return Math.max(14, Math.min(34, Math.round(fontSize * 0.62)));
  }

  function findBestBoxForText(textNode, boxNodes, usedBoxIds) {
    const textBounds = getAbsoluteBounds(textNode);
    if (!textBounds) {
      return null;
    }

    let best = null;
    let bestScore = -Infinity;

    for (let index = 0; index < boxNodes.length; index += 1) {
      const box = boxNodes[index];
      if (!box || box.removed || box === textNode) {
        continue;
      }
      const boxId = safeNodeId(box);
      if (boxId && usedBoxIds[boxId]) {
        continue;
      }
      if (!canPairTextAndBox(textNode, box)) {
        continue;
      }

      const boxBounds = getAbsoluteBounds(box);
      if (!boxBounds) {
        continue;
      }

      const overlapRatio = getOverlapRatio(textBounds, boxBounds);
      const contains = containsBounds(boxBounds, textBounds);
      const centerDistance = getCenterDistance(textBounds, boxBounds);
      const sizePenalty = getBoxSizePenalty(textBounds, boxBounds);
      const singleBoxBoost = boxNodes.length === 1 ? 20000 : 0;
      const score = overlapRatio * 10000 + (contains ? 8000 : 0) + singleBoxBoost - centerDistance - sizePenalty;

      if (score > bestScore) {
        bestScore = score;
        best = box;
      }
    }

    if (!best) {
      return null;
    }

    if (boxNodes.length === 1) {
      return best;
    }

    return bestScore > -500 ? best : null;
  }

  function canPairTextAndBox(textNode, boxNode) {
    if (!textNode || !boxNode) {
      return false;
    }
    if (textNode.parent === boxNode) {
      return true;
    }
    if (textNode.parent && boxNode.parent && textNode.parent === boxNode.parent) {
      return true;
    }
    if (isAncestorNode(boxNode, textNode)) {
      return true;
    }
    const commonAncestor = findNearestCommonAncestor(textNode, boxNode);
    return !!commonAncestor && commonAncestor.type !== "PAGE" && commonAncestor.type !== "DOCUMENT";
  }

  function isAncestorNode(ancestor, node) {
    let parent = node && node.parent ? node.parent : null;
    while (parent) {
      if (parent === ancestor) {
        return true;
      }
      parent = parent.parent || null;
    }
    return false;
  }

  function findNearestCommonAncestor(firstNode, secondNode) {
    const ancestors = [];
    let parent = firstNode && firstNode.parent ? firstNode.parent : null;
    while (parent) {
      ancestors.push(parent);
      parent = parent.parent || null;
    }

    parent = secondNode && secondNode.parent ? secondNode.parent : null;
    while (parent) {
      for (let index = 0; index < ancestors.length; index += 1) {
        if (ancestors[index] === parent) {
          return parent;
        }
      }
      parent = parent.parent || null;
    }
    return null;
  }

  function applyRectToBox(boxNode, textNode, targetRect) {
    if (textNode.parent === boxNode) {
      if (isAutoLayoutParent(boxNode)) {
        applyAutoLayoutButtonPadding(boxNode, {
          paddingX: targetRect.paddingX,
          paddingY: targetRect.paddingY,
        });
        setEnumProperty(boxNode, "primaryAxisAlignItems", "CENTER");
        setEnumProperty(boxNode, "counterAxisAlignItems", "CENTER");
        setNodeAbsoluteRect(boxNode, targetRect);
        return;
      }

      setNodeAbsoluteRect(boxNode, targetRect);
      centerTextInBox(textNode, boxNode, targetRect);
      return;
    }

    setNodeAbsoluteRect(boxNode, targetRect);
    moveNodeBehindText(boxNode, textNode);
    centerTextInBox(textNode, boxNode, targetRect);
  }

  function createBoxBehindText(textNode, targetRect, metrics) {
    const parent = textNode && textNode.parent && "appendChild" in textNode.parent ? textNode.parent : figma.currentPage;
    const rect = figma.createRectangle();
    rect.name = "Button Text Auto Size Box";
    rect.fills = [buildDefaultBoxFill(textNode)];
    rect.strokes = [];
    rect.cornerRadius = Math.min(8, Math.max(4, Math.round(metrics.height / 4)));
    resizeNode(rect, targetRect.width, targetRect.height);

    if ("layoutPositioning" in rect && isAutoLayoutParent(parent)) {
      try {
        rect.layoutPositioning = "ABSOLUTE";
      } catch (error) {}
    }

    insertNodeBehindText(parent, rect, textNode);
    setNodeAbsoluteRect(rect, targetRect);
    return rect;
  }

  function insertNodeBehindText(parent, node, textNode) {
    if (!parent || !("appendChild" in parent)) {
      figma.currentPage.appendChild(node);
      return;
    }

    const children = Array.isArray(parent.children) ? parent.children : [];
    const textIndex = children.indexOf(textNode);
    if (textIndex >= 0 && typeof parent.insertChild === "function") {
      parent.insertChild(textIndex, node);
      return;
    }

    parent.appendChild(node);
  }

  function moveNodeBehindText(node, textNode) {
    const parent = node && node.parent ? node.parent : null;
    if (!parent || parent !== textNode.parent || typeof parent.insertChild !== "function") {
      return;
    }
    const children = Array.isArray(parent.children) ? parent.children : [];
    const textIndex = children.indexOf(textNode);
    if (textIndex >= 0) {
      parent.insertChild(textIndex, node);
    }
  }

  function setNodeAbsoluteRect(node, rect) {
    resizeNode(node, rect.width, rect.height);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      setNodeAbsolutePosition(node, rect.x, rect.y);
      const bounds = getPlacementBounds(node) || getAbsoluteBounds(node);
      if (!bounds || (Math.abs(bounds.x - rect.x) < 0.01 && Math.abs(bounds.y - rect.y) < 0.01)) {
        return;
      }
    }
  }

  function centerTextInBox(textNode, boxNode, fallbackRect) {
    if (!textNode || textNode.removed) {
      return;
    }
    if (isAutoLayoutParent(textNode.parent) && !isAbsoluteLayoutChild(textNode)) {
      return;
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const boxRect = getAbsoluteBounds(boxNode) || fallbackRect;
      const textRenderBounds = getAbsoluteBounds(textNode);
      if (!boxRect || !textRenderBounds) {
        return;
      }
      const boxCenterX = boxRect.x + boxRect.width / 2;
      const boxCenterY = boxRect.y + boxRect.height / 2;
      const textCenterX = textRenderBounds.x + textRenderBounds.width / 2;
      const textCenterY = textRenderBounds.y + textRenderBounds.height / 2;
      const dx = boxCenterX - textCenterX;
      const dy = boxCenterY - textCenterY;
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
        return;
      }
      moveNodeByAbsoluteDelta(textNode, dx, dy);
    }
  }

  function getPlacementBounds(node) {
    if (!node) {
      return null;
    }
    const bounds = node.absoluteBoundingBox || node.absoluteRenderBounds || null;
    if (!bounds) {
      return null;
    }
    return {
      x: Number(bounds.x) || 0,
      y: Number(bounds.y) || 0,
      width: Math.max(0, Number(bounds.width) || 0),
      height: Math.max(0, Number(bounds.height) || 0),
    };
  }

  function isAbsoluteLayoutChild(node) {
    return !!node && "layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE";
  }

  function setNodeAbsolutePosition(node, x, y) {
    const parent = node && node.parent ? node.parent : null;
    const localPoint = absolutePointToLocal(parent, x, y);
    if (node && "x" in node) {
      node.x = roundMetric(localPoint.x);
    }
    if (node && "y" in node) {
      node.y = roundMetric(localPoint.y);
    }
  }

  function moveNodeByAbsoluteDelta(node, dx, dy) {
    const parent = node && node.parent ? node.parent : null;
    const localDelta = absoluteDeltaToLocal(parent, dx, dy);
    if (node && "x" in node) {
      node.x = roundMetric((Number(node.x) || 0) + localDelta.x);
    }
    if (node && "y" in node) {
      node.y = roundMetric((Number(node.y) || 0) + localDelta.y);
    }
  }

  function absolutePointToLocal(parent, x, y) {
    if (!parent || !("absoluteTransform" in parent)) {
      return { x, y };
    }
    const inverse = invertTransform(parent.absoluteTransform);
    if (!inverse) {
      return { x, y };
    }
    return {
      x: inverse[0][0] * x + inverse[0][1] * y + inverse[0][2],
      y: inverse[1][0] * x + inverse[1][1] * y + inverse[1][2],
    };
  }

  function absoluteDeltaToLocal(parent, dx, dy) {
    if (!parent || !("absoluteTransform" in parent)) {
      return { x: dx, y: dy };
    }
    const inverse = invertTransform(parent.absoluteTransform);
    if (!inverse) {
      return { x: dx, y: dy };
    }
    return {
      x: inverse[0][0] * dx + inverse[0][1] * dy,
      y: inverse[1][0] * dx + inverse[1][1] * dy,
    };
  }

  function invertTransform(matrix) {
    if (!matrix || !matrix[0] || !matrix[1]) {
      return null;
    }
    const a = Number(matrix[0][0]) || 0;
    const b = Number(matrix[0][1]) || 0;
    const c = Number(matrix[1][0]) || 0;
    const d = Number(matrix[1][1]) || 0;
    const tx = Number(matrix[0][2]) || 0;
    const ty = Number(matrix[1][2]) || 0;
    const det = a * d - b * c;
    if (Math.abs(det) < 0.000001) {
      return null;
    }
    const invDet = 1 / det;
    return [
      [d * invDet, -b * invDet, (b * ty - d * tx) * invDet],
      [-c * invDet, a * invDet, (c * tx - a * ty) * invDet],
    ];
  }

  function buildDefaultBoxFill(textNode) {
    const textColor = getFirstSolidFill(textNode);
    if (textColor && getLuminance(textColor.color) > 0.72) {
      return {
        type: "SOLID",
        color: { r: 0.067, g: 0.094, b: 0.153 },
        opacity: 1,
      };
    }

    return {
      type: "SOLID",
      color: { r: 0.953, g: 0.961, b: 0.973 },
      opacity: 1,
    };
  }

  function getFirstSolidFill(node) {
    if (!node || !("fills" in node) || !Array.isArray(node.fills)) {
      return null;
    }
    for (let index = 0; index < node.fills.length; index += 1) {
      const fill = node.fills[index];
      if (fill && fill.type === "SOLID" && fill.visible !== false && fill.color) {
        return fill;
      }
    }
    return null;
  }

  function getLuminance(color) {
    const r = normalizeColorChannel(color && color.r);
    const g = normalizeColorChannel(color && color.g);
    const b = normalizeColorChannel(color && color.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function normalizeColorChannel(value) {
    const channel = Math.max(0, Math.min(1, Number(value) || 0));
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  }

  function isResizableBoxNode(node) {
    return (
      !!node &&
      node.type !== "TEXT" &&
      node.type !== "PAGE" &&
      node.type !== "DOCUMENT" &&
      node.type !== "GROUP" &&
      !node.removed &&
      typeof node.resize === "function" &&
      typeof getNodeWidth(node) === "number" &&
      typeof getNodeHeight(node) === "number" &&
      "x" in node &&
      "y" in node
    );
  }

  function isAutoLayoutParent(node) {
    return !!node && "layoutMode" in node && node.layoutMode && node.layoutMode !== "NONE";
  }

  function applyAutoLayoutButtonPadding(node, metrics) {
    setNumericProperty(node, "paddingTop", metrics.paddingY);
    setNumericProperty(node, "paddingBottom", metrics.paddingY);
    setNumericProperty(node, "paddingLeft", metrics.paddingX);
    setNumericProperty(node, "paddingRight", metrics.paddingX);
    setEnumProperty(node, "primaryAxisAlignItems", "CENTER");
    setEnumProperty(node, "counterAxisAlignItems", "CENTER");
    setEnumProperty(node, "primaryAxisSizingMode", "FIXED");
    setEnumProperty(node, "counterAxisSizingMode", "FIXED");
  }

  function setNumericProperty(node, key, value) {
    if (!node || !(key in node)) {
      return;
    }
    try {
      node[key] = value;
    } catch (error) {}
  }

  function setEnumProperty(node, key, value) {
    if (!node || !(key in node)) {
      return;
    }
    try {
      node[key] = value;
    } catch (error) {}
  }

  function resizeNode(node, width, height) {
    const nextWidth = Math.max(1, roundMetric(width));
    const nextHeight = Math.max(1, roundMetric(height));
    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(nextWidth, nextHeight);
      return;
    }
    node.resize(nextWidth, nextHeight);
  }

  function getAbsoluteBounds(node) {
    if (!node) {
      return null;
    }
    const bounds =
      node.type === "TEXT"
        ? node.absoluteRenderBounds || node.absoluteBoundingBox || null
        : node.absoluteBoundingBox || node.absoluteRenderBounds || null;
    if (!bounds) {
      return null;
    }
    return {
      x: Number(bounds.x) || 0,
      y: Number(bounds.y) || 0,
      width: Math.max(0, Number(bounds.width) || 0),
      height: Math.max(0, Number(bounds.height) || 0),
    };
  }

  function containsBounds(outer, inner) {
    return (
      outer.x <= inner.x + 0.5 &&
      outer.y <= inner.y + 0.5 &&
      outer.x + outer.width >= inner.x + inner.width - 0.5 &&
      outer.y + outer.height >= inner.y + inner.height - 0.5
    );
  }

  function getOverlapRatio(a, b) {
    const left = Math.max(a.x, b.x);
    const top = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    const overlap = Math.max(0, right - left) * Math.max(0, bottom - top);
    return overlap / Math.max(1, a.width * a.height);
  }

  function getCenterDistance(a, b) {
    const ax = a.x + a.width / 2;
    const ay = a.y + a.height / 2;
    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getBoxSizePenalty(textBounds, boxBounds) {
    const textArea = Math.max(1, textBounds.width * textBounds.height);
    const boxArea = Math.max(1, boxBounds.width * boxBounds.height);
    const areaRatio = boxArea / textArea;
    return Math.min(6000, Math.max(0, areaRatio - 1) * 35);
  }

  async function loadFontsForTextNode(node) {
    const fonts = [];
    const characters = typeof node.characters === "string" ? node.characters : "";
    if (characters.length > 0 && typeof node.getRangeAllFontNames === "function") {
      const rangeFonts = node.getRangeAllFontNames(0, characters.length);
      for (let index = 0; index < rangeFonts.length; index += 1) {
        appendFontName(fonts, rangeFonts[index]);
      }
    } else {
      appendFontName(fonts, node.fontName);
    }

    for (let index = 0; index < fonts.length; index += 1) {
      await figma.loadFontAsync(fonts[index]);
    }
  }

  function appendFontName(fonts, fontName) {
    if (!fontName || fontName === figma.mixed || typeof fontName !== "object") {
      return;
    }
    if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
      return;
    }
    const key = fontName.family + "\u0000" + fontName.style;
    for (let index = 0; index < fonts.length; index += 1) {
      if (fonts[index].family + "\u0000" + fonts[index].style === key) {
        return;
      }
    }
    fonts.push(fontName);
  }

  function resolveUniformFontSize(node) {
    if (typeof node.fontSize === "number" && Number.isFinite(node.fontSize)) {
      return node.fontSize;
    }
    const characters = typeof node.characters === "string" ? node.characters : "";
    if (!characters.length || typeof node.getRangeFontSize !== "function") {
      return null;
    }
    const first = node.getRangeFontSize(0, 1);
    if (typeof first !== "number" || !Number.isFinite(first)) {
      return null;
    }
    for (let index = 1; index < characters.length; index += 1) {
      const next = node.getRangeFontSize(index, index + 1);
      if (typeof next !== "number" || Math.abs(next - first) > 0.001) {
        return null;
      }
    }
    return first;
  }

  async function ensureSelectionAccess() {
    if (typeof figma.loadAllPagesAsync !== "function") {
      return;
    }
    try {
      await figma.loadAllPagesAsync();
    } catch (error) {
      console.warn("[pigma] button text auto size selection preload failed:", error);
    }
  }

  function restoreSelection(textNodes, resized, created) {
    const nextSelection = [];
    appendUniqueNodeList(nextSelection, textNodes);
    appendResultNodes(nextSelection, resized);
    appendResultNodes(nextSelection, created);
    if (nextSelection.length) {
      figma.currentPage.selection = nextSelection;
    }
  }

  function appendResultNodes(list, entries) {
    if (typeof figma.getNodeById !== "function") {
      return;
    }
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (entry && entry.nodeId) {
        let node = null;
        try {
          node = figma.getNodeById(entry.nodeId);
        } catch (error) {
          node = null;
        }
        if (node && !node.removed) {
          appendUniqueNode(list, node);
        }
      }
    }
  }

  function appendUniqueNodeList(list, nodes) {
    for (let index = 0; index < nodes.length; index += 1) {
      appendUniqueNode(list, nodes[index]);
    }
  }

  function appendUniqueNode(list, node) {
    if (!node || node.removed) {
      return;
    }
    for (let index = 0; index < list.length; index += 1) {
      if (list[index] === node) {
        return;
      }
    }
    list.push(node);
  }

  function buildResultToast(result) {
    const summary = result && result.summary ? result.summary : {};
    const resizedCount = Number(summary.resizedBoxCount) || 0;
    const createdCount = Number(summary.createdBoxCount) || 0;
    const skippedCount = Number(summary.skippedCount) || 0;
    let message = "\uBC84\uD2BC \uD14D\uC2A4\uD2B8 \uC624\uD1A0 \uC0AC\uC774\uC988 \uC644\uB8CC";
    message += " (\uC870\uC808 " + resizedCount + "\uAC1C, \uC0DD\uC131 " + createdCount + "\uAC1C";
    if (skippedCount > 0) {
      message += ", \uC81C\uC678 " + skippedCount + "\uAC1C";
    }
    return message + ")";
  }

  function describeLineHeight(lineHeight, fontSize) {
    if (lineHeight && typeof lineHeight === "object") {
      if (lineHeight.unit === "PIXELS" && typeof lineHeight.value === "number") {
        return roundMetric(lineHeight.value) + "px";
      }
      if (lineHeight.unit === "PERCENT" && typeof lineHeight.value === "number") {
        return roundMetric((fontSize * lineHeight.value) / 100) + "px";
      }
      if (lineHeight.unit === "AUTO") {
        return "auto";
      }
    }
    return "mixed";
  }

  function formatSize(size) {
    return roundMetric(size.width) + " x " + roundMetric(size.height) + "px";
  }

  function getNodeWidth(node) {
    return typeof node.width === "number" ? node.width : 0;
  }

  function getNodeHeight(node) {
    return typeof node.height === "number" ? node.height : 0;
  }

  function roundMetric(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function roundToEven(value) {
    return Math.round((Number(value) || 0) / 2) * 2;
  }

  function safeNodeId(node) {
    try {
      return node && typeof node.id === "string" ? node.id : "";
    } catch (error) {
      return "";
    }
  }

  function safeName(node) {
    try {
      if (node && typeof node.name === "string" && node.name.trim()) {
        return node.name.trim();
      }
      return String((node && node.type) || "Layer");
    } catch (error) {
      return "Layer";
    }
  }

  function safeNodeType(node) {
    try {
      return String((node && node.type) || "UNKNOWN");
    } catch (error) {
      return "UNKNOWN";
    }
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
