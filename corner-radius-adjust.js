;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_CORNER_RADIUS_ADJUST_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const LAST_VALUE_STORAGE_KEY = "pigma:corner-radius-adjust:last-value:v1";
  const FORMULA_PERCENT_RADIUS = 25;
  const MAX_PERCENT_RADIUS = 50;
  const AUTO_RADIUS_SOFT_CAP_START_SIDE = 96;
  const AUTO_RADIUS_SOFT_CAP_GROWTH = 1.3;
  const AUTO_RADIUS_ASPECT_DAMPING_POWER = 0.18;
  const AUTO_RADIUS_ASPECT_DAMPING_MIN = 0.72;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isCornerRadiusAdjustMessage(message)) {
      await handleCornerRadiusAdjustMessage(message);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_CORNER_RADIUS_ADJUST_PATCH__ = true;

  function isCornerRadiusAdjustMessage(message) {
    return (
      !!message &&
      (message.type === "request-corner-radius-adjust-session" ||
        message.type === "apply-corner-radius-adjust")
    );
  }

  async function handleCornerRadiusAdjustMessage(message) {
    const clientRequestId = typeof message.clientRequestId === "string" ? message.clientRequestId : "";

    try {
      await ensureCornerRadiusSelectionAccess();

      if (message.type === "request-corner-radius-adjust-session") {
        const analysis = analyzeCornerRadiusSelection();
        const storedValue = await readLastCornerRadiusValue();
        const session = Object.assign({}, analysis, {
          lastValue: storedValue,
          defaultValue: analysis.defaultValue || storedValue || "auto",
        });
        figma.ui.postMessage({
          type: "corner-radius-adjust-session-result",
          clientRequestId,
          session,
        });
        return;
      }

      if (message.type === "apply-corner-radius-adjust") {
        const result = await applyCornerRadiusToSelection(message.radiusValue);
        figma.ui.postMessage({
          type: "corner-radius-adjust-result",
          clientRequestId,
          result,
        });
        figma.notify(buildCornerRadiusToast(result), { timeout: 1800 });
      }
    } catch (error) {
      const messageText = normalizeCornerRadiusError(error, "라운드 값 조정에 실패했습니다.");
      figma.ui.postMessage({
        type: "corner-radius-adjust-error",
        clientRequestId,
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2400 });
    }
  }

  async function ensureCornerRadiusSelectionAccess() {
    if (typeof figma.loadAllPagesAsync !== "function") {
      return;
    }
    try {
      await figma.loadAllPagesAsync();
    } catch (error) {
      console.warn("[pigma] corner radius selection preload failed:", error);
    }
  }

  function analyzeCornerRadiusSelection() {
    const selection = getCornerRadiusSelection();
    const collection = collectCornerRadiusTargets(selection);
    const currentValues = collection.targets
      .map((target) => target.currentRadius)
      .filter((value) => typeof value === "number" && Number.isFinite(value));
    const firstValue = currentValues.length ? currentValues[0] : null;
    const allSame =
      firstValue !== null &&
      currentValues.length === collection.targets.length &&
      currentValues.every((value) => Math.abs(value - firstValue) <= 0.001);

    return {
      selectionCount: selection.length,
      targetCount: collection.targets.length,
      skippedCount: collection.skipped.length,
      defaultValue: allSame ? formatCornerRadiusNumber(firstValue) : "",
      targets: collection.targets.map(serializeCornerRadiusTarget).slice(0, 24),
      skipped: collection.skipped.slice(0, 24),
    };
  }

  async function applyCornerRadiusToSelection(rawRadiusValue) {
    const spec = parseCornerRadiusSpec(rawRadiusValue);
    const selection = getCornerRadiusSelection();
    if (!selection.length) {
      throw new Error("라운드 값을 적용할 사각형, 프레임, 그룹을 먼저 선택해 주세요.");
    }

    const collection = collectCornerRadiusTargets(selection);
    if (!collection.targets.length) {
      const reason = collection.skipped.length
        ? collection.skipped[0].reason
        : "선택 항목에서 라운드 값을 적용할 수 있는 사각형을 찾지 못했습니다.";
      throw new Error(reason);
    }

    const applied = [];
    const skipped = collection.skipped.slice(0);

    for (let index = 0; index < collection.targets.length; index += 1) {
      const target = collection.targets[index];
      if (!target.node || target.node.removed) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          reason: "레이어가 더 이상 존재하지 않습니다.",
        });
        continue;
      }

      try {
        const radius = resolveCornerRadiusForTarget(spec, target);
        setCornerRadius(target.node, radius);
        applied.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          from: target.currentRadius === null ? "mixed" : formatCornerRadiusPx(target.currentRadius),
          to: formatCornerRadiusPx(radius),
        });
      } catch (error) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          reason: normalizeCornerRadiusError(error, "이 레이어의 라운드 값을 바꾸지 못했습니다."),
        });
      }
    }

    if (!applied.length) {
      const reason = skipped.length
        ? skipped[0].reason
        : "라운드 값을 적용할 수 있는 사각형을 찾지 못했습니다.";
      throw new Error(reason);
    }

    await writeLastCornerRadiusValue(formatCornerRadiusSpec(spec));

    return {
      processedAt: new Date().toISOString(),
      inputValue: formatCornerRadiusSpec(spec),
      summary: {
        selectionCount: selection.length,
        targetCount: collection.targets.length,
        appliedCount: applied.length,
        skippedCount: skipped.length,
      },
      applied: applied.slice(0, 24),
      skipped: skipped.slice(0, 24),
    };
  }

  function getCornerRadiusSelection() {
    return Array.from(figma.currentPage.selection || []);
  }

  function collectCornerRadiusTargets(selection) {
    const targets = [];
    const skipped = [];
    const seen = {};
    const selectedIds = buildSelectedCornerRadiusIdSet(selection);

    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (hasSelectedCornerRadiusAncestor(node, selectedIds)) {
        skipped.push(buildSkippedCornerRadiusNode(node, "상위 선택 항목에 포함되어 별도로 적용하지 않았습니다."));
        continue;
      }

      const result = collectCornerRadiusTargetsForSelectionNode(node, seen);
      appendCornerRadiusTargetResult(result, targets, skipped);
    }

    return { targets, skipped };
  }

  function collectCornerRadiusTargetsForSelectionNode(node, seen) {
    const direct = buildCornerRadiusTarget(node, seen);
    if (!isCornerRadiusContainerNode(node)) {
      return {
        targets: direct.target ? [direct.target] : [],
        skipped: direct.skipped ? [direct.skipped] : [],
      };
    }

    const nested = collectNestedCornerRadiusTargets(node, seen);
    const targets = [];
    const skipped = [];

    if (direct.target && shouldApplyCornerRadiusToDirectNode(node)) {
      targets.push(direct.target);
    }

    if (nested.targets.length) {
      targets.push(...nested.targets);
    }

    if (direct.target && !targets.length) {
      targets.push(direct.target);
    }

    if (direct.skipped) {
      skipped.push(direct.skipped);
    }
    if (nested.skipped.length) {
      skipped.push(...nested.skipped);
    }

    if (targets.length) {
      return {
        targets,
        skipped,
      };
    }

    return {
      targets: [],
      skipped,
    };
  }

  function collectNestedCornerRadiusTargets(root, seen) {
    const targets = [];
    const skipped = [];
    const stack = [];

    if (isCornerRadiusContainerNode(root)) {
      for (let index = root.children.length - 1; index >= 0; index -= 1) {
        stack.push(root.children[index]);
      }
    }

    while (stack.length) {
      const node = stack.pop();
      const result = buildCornerRadiusTarget(node, seen);
      if (result.target) {
        targets.push(result.target);
        continue;
      }
      if (result.skipped) {
        skipped.push(result.skipped);
      }
      if (isCornerRadiusContainerNode(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return { targets, skipped };
  }

  function buildCornerRadiusTarget(node, seen) {
    if (!node || node.removed || !node.id || seen[node.id]) {
      return {};
    }
    seen[node.id] = true;

    if (node.type === "PAGE" || node.type === "DOCUMENT") {
      return {
        skipped: buildSkippedCornerRadiusNode(node, "페이지나 문서에는 라운드 값을 적용할 수 없습니다."),
      };
    }
    if ("locked" in node && node.locked === true) {
      return {
        skipped: buildSkippedCornerRadiusNode(node, "잠긴 레이어입니다."),
      };
    }
    if (hasLockedCornerRadiusAncestor(node)) {
      return {
        skipped: buildSkippedCornerRadiusNode(node, "상위 레이어가 잠겨 있습니다."),
      };
    }
    if (!isCornerRadiusEditableNode(node)) {
      return {};
    }

    const width = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const height = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(width > 0) || !(height > 0)) {
      return {
        skipped: buildSkippedCornerRadiusNode(node, "레이어 크기가 비어 있습니다."),
      };
    }

    return {
      target: {
        node,
        nodeId: node.id,
        nodeName: safeCornerRadiusName(node),
        nodeType: String(node.type || "UNKNOWN"),
        width,
        height,
        currentRadius: readUniformCornerRadius(node),
      },
    };
  }

  function appendCornerRadiusTargetResult(result, targets, skipped) {
    if (!result) {
      return;
    }
    if (Array.isArray(result.targets)) {
      targets.push(...result.targets);
    }
    if (Array.isArray(result.skipped)) {
      skipped.push(...result.skipped);
    }
  }

  function buildSelectedCornerRadiusIdSet(selection) {
    const result = {};
    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (node && typeof node.id === "string") {
        result[node.id] = true;
      }
    }
    return result;
  }

  function hasSelectedCornerRadiusAncestor(node, selectedIds) {
    let current = node && node.parent ? node.parent : null;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (current.id && selectedIds[current.id]) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function hasLockedCornerRadiusAncestor(node) {
    let current = node && node.parent ? node.parent : null;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if ("locked" in current && current.locked === true) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function isCornerRadiusContainerNode(node) {
    return !!(node && "children" in node && Array.isArray(node.children) && node.children.length);
  }

  function isCornerRadiusEditableNode(node) {
    return !!(
      node &&
      typeof node === "object" &&
      "width" in node &&
      "height" in node &&
      ("cornerRadius" in node ||
        "topLeftRadius" in node ||
        "topRightRadius" in node ||
        "bottomRightRadius" in node ||
        "bottomLeftRadius" in node)
    );
  }

  function shouldApplyCornerRadiusToDirectNode(node) {
    if (!node) {
      return false;
    }
    if (node.type === "RECTANGLE") {
      return true;
    }
    if ("clipsContent" in node && node.clipsContent === true) {
      return true;
    }
    return hasVisibleCornerRadiusPaint(node);
  }

  function hasVisibleCornerRadiusPaint(node) {
    return hasVisiblePaintArray(node && node.fills) || hasVisiblePaintArray(node && node.strokes);
  }

  function hasVisiblePaintArray(paints) {
    if (!Array.isArray(paints)) {
      return false;
    }
    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false) {
        continue;
      }
      const opacity = typeof paint.opacity === "number" && Number.isFinite(paint.opacity) ? paint.opacity : 1;
      if (opacity > 0) {
        return true;
      }
    }
    return false;
  }

  function parseCornerRadiusSpec(rawValue) {
    const raw = String(rawValue == null ? "" : rawValue).trim().toLowerCase();
    if (!raw) {
      throw new Error("라운드 값을 입력해 주세요. 예: 6, 12px, 25%, auto");
    }

    if (raw === "auto" || raw === "quarter" || raw === "formula") {
      return {
        mode: "auto",
        value: FORMULA_PERCENT_RADIUS,
      };
    }

    if (raw === "pill" || raw === "capsule" || raw === "max" || raw === "full") {
      return {
        mode: "percent",
        value: MAX_PERCENT_RADIUS,
      };
    }

    const percentMatch = raw.match(/^(\d+(?:\.\d+)?)\s*%$/);
    if (percentMatch) {
      const value = Number(percentMatch[1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("퍼센트 라운드 값은 0% 이상이어야 합니다.");
      }
      return {
        mode: "percent",
        value: Math.min(value, MAX_PERCENT_RADIUS),
      };
    }

    const pxMatch = raw.replace(",", ".").match(/^(\d+(?:\.\d+)?)\s*(?:px)?$/);
    if (pxMatch) {
      const value = Number(pxMatch[1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("px 라운드 값은 0 이상이어야 합니다.");
      }
      return {
        mode: "px",
        value,
      };
    }

    throw new Error("라운드 값 형식을 확인해 주세요. 예: 6, 12px, 25%, auto");
  }

  function resolveCornerRadiusForTarget(spec, target) {
    const minSide = Math.max(0, Math.min(Number(target.width) || 0, Number(target.height) || 0));
    const maxRadius = minSide > 0 ? minSide / 2 : Number.POSITIVE_INFINITY;
    const rawRadius =
      spec.mode === "auto"
        ? resolveAutoCornerRadiusForTarget(target)
        : spec.mode === "percent"
          ? minSide * (spec.value / 100)
          : spec.value;
    return roundCornerRadius(Math.max(0, Math.min(rawRadius, maxRadius)));
  }

  function resolveAutoCornerRadiusForTarget(target) {
    const width = Math.max(0, Number(target && target.width) || 0);
    const height = Math.max(0, Number(target && target.height) || 0);
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    if (!(shortSide > 0)) {
      return 0;
    }

    const baseRadius = shortSide * (FORMULA_PERCENT_RADIUS / 100);
    const softCappedRadius =
      shortSide <= AUTO_RADIUS_SOFT_CAP_START_SIDE
        ? baseRadius
        : AUTO_RADIUS_SOFT_CAP_START_SIDE * (FORMULA_PERCENT_RADIUS / 100) +
          Math.sqrt(shortSide - AUTO_RADIUS_SOFT_CAP_START_SIDE) * AUTO_RADIUS_SOFT_CAP_GROWTH;
    const aspectRatio = longSide / shortSide;
    const aspectDamping =
      shortSide <= AUTO_RADIUS_SOFT_CAP_START_SIDE || !(aspectRatio > 1)
        ? 1
        : Math.max(
            AUTO_RADIUS_ASPECT_DAMPING_MIN,
            1 / Math.pow(aspectRatio, AUTO_RADIUS_ASPECT_DAMPING_POWER)
          );

    return Math.min(baseRadius, softCappedRadius) * aspectDamping;
  }

  function setCornerRadius(node, radius) {
    let wrote = false;

    if ("cornerRadius" in node) {
      node.cornerRadius = radius;
      wrote = true;
    }
    if ("topLeftRadius" in node) {
      node.topLeftRadius = radius;
      wrote = true;
    }
    if ("topRightRadius" in node) {
      node.topRightRadius = radius;
      wrote = true;
    }
    if ("bottomRightRadius" in node) {
      node.bottomRightRadius = radius;
      wrote = true;
    }
    if ("bottomLeftRadius" in node) {
      node.bottomLeftRadius = radius;
      wrote = true;
    }

    if (!wrote) {
      throw new Error("이 레이어는 라운드 값을 직접 수정할 수 없습니다.");
    }
  }

  function readUniformCornerRadius(node) {
    if ("cornerRadius" in node && typeof node.cornerRadius === "number" && Number.isFinite(node.cornerRadius)) {
      return roundCornerRadius(node.cornerRadius);
    }

    const values = ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"]
      .filter((key) => key in node)
      .map((key) => node[key])
      .filter((value) => typeof value === "number" && Number.isFinite(value));

    if (!values.length || values.length < 4) {
      return null;
    }

    const first = values[0];
    return values.every((value) => Math.abs(value - first) <= 0.001) ? roundCornerRadius(first) : null;
  }

  function serializeCornerRadiusTarget(target) {
    return {
      nodeId: target.nodeId,
      nodeName: target.nodeName,
      nodeType: target.nodeType,
      width: roundCornerRadius(target.width),
      height: roundCornerRadius(target.height),
      currentRadius: target.currentRadius,
    };
  }

  function buildSkippedCornerRadiusNode(node, reason) {
    return {
      nodeId: node && node.id ? node.id : "",
      nodeName: safeCornerRadiusName(node),
      nodeType: node && node.type ? String(node.type) : "UNKNOWN",
      reason,
    };
  }

  async function readLastCornerRadiusValue() {
    try {
      const value = await figma.clientStorage.getAsync(LAST_VALUE_STORAGE_KEY);
      return typeof value === "string" && value.trim() ? value.trim() : "";
    } catch (error) {
      return "";
    }
  }

  async function writeLastCornerRadiusValue(value) {
    try {
      await figma.clientStorage.setAsync(LAST_VALUE_STORAGE_KEY, value);
    } catch (error) {}
  }

  function formatCornerRadiusSpec(spec) {
    if (spec.mode === "auto") {
      return "auto";
    }
    return spec.mode === "percent" ? formatCornerRadiusNumber(spec.value) + "%" : formatCornerRadiusNumber(spec.value);
  }

  function formatCornerRadiusPx(value) {
    return formatCornerRadiusNumber(value) + "px";
  }

  function formatCornerRadiusNumber(value) {
    const rounded = roundCornerRadius(value);
    return Math.abs(rounded % 1) < 0.001 ? String(Math.round(rounded)) : String(rounded);
  }

  function roundCornerRadius(value) {
    return Math.round(Number(value) || 0);
  }

  function safeCornerRadiusName(node) {
    const name = node && typeof node.name === "string" ? node.name.trim() : "";
    return name || "Layer";
  }

  function buildCornerRadiusToast(result) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount = Number(summary.appliedCount) || 0;
    const skippedCount = Number(summary.skippedCount) || 0;
    return skippedCount > 0
      ? `라운드 값 적용 ${appliedCount}개, 제외 ${skippedCount}개`
      : `라운드 값 적용 ${appliedCount}개`;
  }

  function normalizeCornerRadiusError(error, fallback) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return fallback;
  }
})();
