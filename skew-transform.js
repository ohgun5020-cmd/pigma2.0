;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_SKEW_TRANSFORM_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const MAX_SKEW_DEGREES = 90;
  const MAX_TANGENT_SKEW_DEGREES = 89.9;
  const MAX_ROTATION_DEGREES = 180;
  const TRANSFORM_PRECISION = 1000000;
  const SKEW_PLUGIN_DATA_KEY = "__pigmaSkewTransform";
  const SKEW_EPSILON_DEGREES = 0.05;
  let activeSession = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isSkewTransformMessage(message)) {
      await handleSkewTransformMessage(message);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_SKEW_TRANSFORM_PATCH__ = true;

  function isSkewTransformMessage(message) {
    return (
      !!message &&
      (message.type === "request-skew-transform-session" ||
        message.type === "preview-skew-transform" ||
        message.type === "apply-skew-transform" ||
        message.type === "cancel-skew-transform")
    );
  }

  async function handleSkewTransformMessage(message) {
    const clientRequestId = typeof message.clientRequestId === "string" ? message.clientRequestId : "";
    try {
      if (message.type === "request-skew-transform-session") {
        if (activeSession) {
          restoreSkewSession(activeSession);
          activeSession = null;
        }
        activeSession = createSkewSession();
        figma.ui.postMessage({
          type: "skew-transform-session-result",
          clientRequestId,
          session: serializeSkewSession(activeSession),
        });
        return;
      }

      const session = getActiveSkewSession(message.sessionId);
      if (message.type === "preview-skew-transform") {
        const result = applySkewToSession(
          session,
          message.horizontalDegrees,
          message.verticalDegrees,
          message.rotationDegrees,
          false
        );
        figma.ui.postMessage({
          type: "skew-transform-preview-result",
          clientRequestId,
          sessionId: session.sessionId,
          result,
        });
        return;
      }

      if (message.type === "apply-skew-transform") {
        const result = applySkewToSession(
          session,
          message.horizontalDegrees,
          message.verticalDegrees,
          message.rotationDegrees,
          true
        );
        activeSession = null;
        figma.ui.postMessage({
          type: "skew-transform-apply-result",
          clientRequestId,
          sessionId: session.sessionId,
          result,
        });
        figma.notify(buildSkewApplyToast(result), { timeout: 1800 });
        return;
      }

      if (message.type === "cancel-skew-transform") {
        const result = restoreSkewSession(session);
        activeSession = null;
        figma.ui.postMessage({
          type: "skew-transform-cancel-result",
          clientRequestId,
          sessionId: session.sessionId,
          result,
        });
      }
    } catch (error) {
      const messageText = normalizeSkewError(error, "스큐 조정을 처리하지 못했습니다.");
      figma.ui.postMessage({
        type: "skew-transform-error",
        clientRequestId,
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2400 });
    }
  }

  function createSkewSession() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("스큐를 적용할 프레임, 그룹, 레이어를 먼저 선택해주세요.");
    }

    const targets = [];
    const skipped = [];
    const seen = {};
    const selectedIds = buildSelectedSkewIdSet(selection);

    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (hasSelectedSkewAncestor(node, selectedIds)) {
        skipped.push(buildSkippedSkewNode(node, "상위 선택에 포함되어 별도 적용하지 않았습니다."));
        continue;
      }
      const result = collectSkewTargetsForSelectionNode(node, seen);
      appendSkewTargetResult(result, targets, skipped);
    }

    if (!targets.length) {
      const reason = skipped.length ? skipped[0].reason : "선택 항목에서 변형 가능한 레이어를 찾지 못했습니다.";
      throw new Error(reason);
    }

    const initialValues = estimateSessionSkewValues(targets);
    return {
      sessionId: "skew-transform-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      selectionCount: selection.length,
      targets,
      skipped,
      horizontalDegrees: initialValues.horizontalDegrees,
      verticalDegrees: initialValues.verticalDegrees,
      rotationDegrees: initialValues.rotationDegrees,
      initialValues,
    };
  }

  function buildSelectedSkewIdSet(selection) {
    const result = {};
    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (node && typeof node.id === "string") {
        result[node.id] = true;
      }
    }
    return result;
  }

  function hasSelectedSkewAncestor(node, selectedIds) {
    let current = node && node.parent ? node.parent : null;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (current.id && selectedIds[current.id]) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function appendSkewTargetResult(result, targets, skipped) {
    if (!result) {
      return;
    }
    if (Array.isArray(result.targets) && result.targets.length) {
      for (let index = 0; index < result.targets.length; index += 1) {
        targets.push(result.targets[index]);
      }
    }
    if (Array.isArray(result.skipped) && result.skipped.length) {
      for (let index = 0; index < result.skipped.length; index += 1) {
        skipped.push(result.skipped[index]);
      }
    }
  }

  function collectSkewTargetsForSelectionNode(node, seen) {
    const direct = buildSkewTarget(node, seen);
    if (!direct.target) {
      return {
        targets: [],
        skipped: direct.skipped ? [direct.skipped] : [],
      };
    }

    if (hasMeaningfulSkewTarget(direct.target) || !isSkewContainerNode(node)) {
      return {
        targets: [direct.target],
        skipped: [],
      };
    }

    const nested = collectNestedSkewTargets(node, seen);
    if (nested.targets.length) {
      return nested;
    }

    return {
      targets: [direct.target],
      skipped: nested.skipped,
    };
  }

  function collectNestedSkewTargets(root, seen) {
    const targets = [];
    const skipped = [];
    const stack = [];
    if (isSkewContainerNode(root)) {
      for (let index = root.children.length - 1; index >= 0; index -= 1) {
        stack.push(root.children[index]);
      }
    }

    while (stack.length) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      const result = buildSkewTarget(node, seen);
      if (result.target && hasMeaningfulSkewTarget(result.target)) {
        targets.push(result.target);
        continue;
      }
      if (result.skipped) {
        skipped.push(result.skipped);
      }

      if (isSkewContainerNode(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return {
      targets,
      skipped,
    };
  }

  function isSkewContainerNode(node) {
    return !!(node && "children" in node && Array.isArray(node.children) && node.children.length);
  }

  function hasMeaningfulSkewTarget(target) {
    if (!target) {
      return false;
    }
    if (target.hasStoredSkewData) {
      return true;
    }
    return hasMeaningfulSkewValues(target.initialValues);
  }

  function hasMeaningfulSkewValues(values) {
    if (!values) {
      return false;
    }
    return (
      Math.abs(Number(values.horizontalDegrees) || 0) > SKEW_EPSILON_DEGREES ||
      Math.abs(Number(values.verticalDegrees) || 0) > SKEW_EPSILON_DEGREES
    );
  }

  function buildSkewTarget(node, seen) {
    if (!node || node.removed || !node.id || seen[node.id]) {
      return {};
    }
    seen[node.id] = true;

    const nodeName = safeSkewName(node);
    const nodeType = String(node.type || "UNKNOWN");
    if (node.type === "PAGE" || node.type === "DOCUMENT") {
      return {
        skipped: buildSkippedSkewNode(node, "페이지나 문서는 스큐를 적용할 수 없습니다."),
      };
    }
    if ("locked" in node && node.locked === true) {
      return {
        skipped: buildSkippedSkewNode(node, "잠긴 레이어입니다."),
      };
    }
    if (hasLockedSkewAncestor(node)) {
      return {
        skipped: buildSkippedSkewNode(node, "상위 레이어가 잠겨 있습니다."),
      };
    }
    if (!("relativeTransform" in node) || !Array.isArray(node.relativeTransform)) {
      return {
        skipped: buildSkippedSkewNode(node, "transform을 직접 수정할 수 없는 레이어입니다."),
      };
    }

    const width = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const height = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(width > 0) || !(height > 0)) {
      return {
        skipped: buildSkippedSkewNode(node, "레이어 크기가 비어 있습니다."),
      };
    }

    const originalTransform = copySkewTransform(node.relativeTransform);
    if (!originalTransform) {
      return {
        skipped: buildSkippedSkewNode(node, "기존 transform을 읽지 못했습니다."),
      };
    }

    const target = {
      node,
      nodeId: node.id,
      nodeName,
      nodeType,
      width,
      height,
      originalTransform,
      baseTransform: null,
      initialValues: {
        horizontalDegrees: 0,
        verticalDegrees: 0,
        rotationDegrees: 0,
      },
    };
    const storedState = readSkewPluginState(node);
    target.baseTransform =
      storedState && storedState.baseTransform ? copySkewTransform(storedState.baseTransform) : buildDeskewedTransform(target);
    target.initialValues = storedState ? normalizeStoredSkewValues(storedState) : estimateSkewValues(target);
    target.hasStoredSkewData = !!storedState;

    return {
      target,
    };
  }

  function hasLockedSkewAncestor(node) {
    let current = node && node.parent ? node.parent : null;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if ("locked" in current && current.locked === true) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function copySkewTransform(transform) {
    if (!Array.isArray(transform) || transform.length < 2) {
      return null;
    }
    const row0 = Array.isArray(transform[0]) ? transform[0] : null;
    const row1 = Array.isArray(transform[1]) ? transform[1] : null;
    if (!row0 || !row1 || row0.length < 3 || row1.length < 3) {
      return null;
    }
    return [
      [toFiniteSkewNumber(row0[0], 1), toFiniteSkewNumber(row0[1], 0), toFiniteSkewNumber(row0[2], 0)],
      [toFiniteSkewNumber(row1[0], 0), toFiniteSkewNumber(row1[1], 1), toFiniteSkewNumber(row1[2], 0)],
    ];
  }

  function getActiveSkewSession(sessionId) {
    if (!activeSession) {
      throw new Error("스큐 조정 세션이 만료되었습니다. 다시 실행해주세요.");
    }
    if (sessionId && sessionId !== activeSession.sessionId) {
      throw new Error("다른 스큐 조정 세션이 실행 중입니다.");
    }
    return activeSession;
  }

  function applySkewToSession(session, horizontalDegrees, verticalDegrees, rotationDegrees, persistState) {
    const horizontal = clampSkewDegrees(horizontalDegrees);
    const vertical = clampSkewDegrees(verticalDegrees);
    const rotation = clampRotationDegrees(rotationDegrees);
    const shouldPersistState = persistState === true;
    const applied = [];
    const skipped = session.skipped.slice(0);

    for (let index = 0; index < session.targets.length; index += 1) {
      const target = session.targets[index];
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
        target.node.relativeTransform = buildSkewedTransform(target, horizontal, vertical, rotation);
        if (shouldPersistState) {
          writeSkewPluginState(target, horizontal, vertical, rotation);
        }
        applied.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
        });
      } catch (error) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          reason: normalizeSkewError(error, "이 레이어에는 스큐를 적용하지 못했습니다."),
        });
      }
    }

    session.horizontalDegrees = horizontal;
    session.verticalDegrees = vertical;
    session.rotationDegrees = rotation;
    return buildSkewResult(session, applied, skipped);
  }

  function clearSkewInSession(session) {
    const cleaned = [];
    const skipped = session.skipped.slice(0);
    for (let index = 0; index < session.targets.length; index += 1) {
      const target = session.targets[index];
      if (!target.node || target.node.removed) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          reason: "?덉씠?닿? ???댁긽 議댁옱?섏? ?딆뒿?덈떎.",
        });
        continue;
      }

      try {
        target.node.relativeTransform = buildDeskewedTransform(target);
        clearSkewPluginState(target.node);
        cleaned.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
        });
      } catch (error) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          reason: normalizeSkewError(error, "?ㅽ걧 ?뺣━瑜??곸슜?섏? 紐삵뻽?듬땲??"),
        });
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionCount: session.selectionCount,
        targetCount: session.targets.length,
        cleanedCount: cleaned.length,
        skippedCount: skipped.length,
      },
      cleaned: cleaned.slice(0, 24),
      skipped: skipped.slice(0, 24),
    };
  }

  function restoreSkewSession(session) {
    const restored = [];
    const skipped = [];
    for (let index = 0; index < session.targets.length; index += 1) {
      const target = session.targets[index];
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
        target.node.relativeTransform = copySkewTransform(target.originalTransform);
        restored.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
        });
      } catch (error) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
          reason: normalizeSkewError(error, "원래 transform으로 되돌리지 못했습니다."),
        });
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionCount: session.selectionCount,
        targetCount: session.targets.length,
        restoredCount: restored.length,
        skippedCount: skipped.length,
      },
      restored,
      skipped,
    };
  }

  function buildSkewedTransform(target, horizontalDegrees, verticalDegrees, rotationDegrees) {
    const original = target.baseTransform || target.originalTransform;
    const kx = Math.tan((clampSkewTangentDegrees(horizontalDegrees) * Math.PI) / 180);
    const ky = Math.tan((clampSkewTangentDegrees(verticalDegrees) * Math.PI) / 180);
    const rotationDelta = ((clampRotationDegrees(rotationDegrees) - getTransformRotationDegrees(original)) * Math.PI) / 180;
    const cos = Math.cos(rotationDelta);
    const sin = Math.sin(rotationDelta);
    const cx = target.width / 2;
    const cy = target.height / 2;

    const anchorX = original[0][0] * cx + original[0][1] * cy + original[0][2];
    const anchorY = original[1][0] * cx + original[1][1] * cy + original[1][2];
    const skew00 = 1 + kx * ky;
    const skew01 = kx;
    const skew10 = ky;
    const skew11 = 1;
    const local00 = cos * skew00 - sin * skew10;
    const local01 = cos * skew01 - sin * skew11;
    const local10 = sin * skew00 + cos * skew10;
    const local11 = sin * skew01 + cos * skew11;
    const local02 = cx - (local00 * cx + local01 * cy);
    const local12 = cy - (local10 * cx + local11 * cy);

    const a = original[0][0];
    const c = original[0][1];
    const tx = original[0][2];
    const b = original[1][0];
    const d = original[1][1];
    const ty = original[1][2];

    const next00 = a * local00 + c * local10;
    const next01 = a * local01 + c * local11;
    let next02 = a * local02 + c * local12 + tx;
    const next10 = b * local00 + d * local10;
    const next11 = b * local01 + d * local11;
    let next12 = b * local02 + d * local12 + ty;
    next02 += anchorX - (next00 * cx + next01 * cy + next02);
    next12 += anchorY - (next10 * cx + next11 * cy + next12);

    return [
      [roundSkewTransformValue(next00), roundSkewTransformValue(next01), roundSkewTransformValue(next02)],
      [roundSkewTransformValue(next10), roundSkewTransformValue(next11), roundSkewTransformValue(next12)],
    ];
  }

  function buildDeskewedTransform(target) {
    const original = target.originalTransform;
    const a = original[0][0];
    const c = original[0][1];
    const tx = original[0][2];
    const b = original[1][0];
    const d = original[1][1];
    const ty = original[1][2];
    const cx = target.width / 2;
    const cy = target.height / 2;
    const centerX = a * cx + c * cy + tx;
    const centerY = b * cx + d * cy + ty;
    const xScale = Math.hypot(a, b);
    const yScale = Math.hypot(c, d);
    const epsilon = 0.000001;
    if (xScale <= epsilon && yScale <= epsilon) {
      throw new Error("?ㅽ걧 ?뺣━???꾪븳 蹂??異뺤쓣 怨꾩궛?섏? 紐삵뻽?듬땲??");
    }

    const determinant = a * d - b * c;
    const orientation = determinant < 0 ? -1 : 1;
    let nextA = 1;
    let nextB = 0;
    let nextC = 0;
    let nextD = 1;

    if (xScale > epsilon) {
      const ux = a / xScale;
      const uy = b / xScale;
      nextA = ux * xScale;
      nextB = uy * xScale;
      nextC = -uy * yScale * orientation;
      nextD = ux * yScale * orientation;
    } else {
      const vx = c / yScale;
      const vy = d / yScale;
      nextA = vy * xScale * orientation;
      nextB = -vx * xScale * orientation;
      nextC = vx * yScale;
      nextD = vy * yScale;
    }

    return [
      [
        roundSkewTransformValue(nextA),
        roundSkewTransformValue(nextC),
        roundSkewTransformValue(centerX - nextA * cx - nextC * cy),
      ],
      [
        roundSkewTransformValue(nextB),
        roundSkewTransformValue(nextD),
        roundSkewTransformValue(centerY - nextB * cx - nextD * cy),
      ],
    ];
  }

  function estimateSessionSkewValues(targets) {
    if (!targets.length) {
      return {
        horizontalDegrees: 0,
        verticalDegrees: 0,
        rotationDegrees: 0,
      };
    }
    let horizontalTotal = 0;
    let verticalTotal = 0;
    let rotationTotal = 0;
    let count = 0;
    for (let index = 0; index < targets.length; index += 1) {
      const values = targets[index].initialValues;
      if (!values) {
        continue;
      }
      horizontalTotal += values.horizontalDegrees;
      verticalTotal += values.verticalDegrees;
      rotationTotal += values.rotationDegrees;
      count += 1;
    }
    if (!count) {
      return {
        horizontalDegrees: 0,
        verticalDegrees: 0,
        rotationDegrees: 0,
      };
    }
    return {
      horizontalDegrees: clampSkewDegrees(horizontalTotal / count),
      verticalDegrees: clampSkewDegrees(verticalTotal / count),
      rotationDegrees: clampRotationDegrees(rotationTotal / count),
    };
  }

  function estimateSkewValues(target) {
    const local = multiplySkewTransforms(invertSkewTransform(target.baseTransform), target.originalTransform);
    if (!local) {
      return {
        horizontalDegrees: 0,
        verticalDegrees: 0,
        rotationDegrees: getTransformRotationDegrees(target.baseTransform),
      };
    }
    const horizontal = Math.atan(toFiniteSkewNumber(local[0][1], 0)) * (180 / Math.PI);
    const vertical = Math.atan(toFiniteSkewNumber(local[1][0], 0)) * (180 / Math.PI);
    return {
      horizontalDegrees: clampSkewDegrees(horizontal),
      verticalDegrees: clampSkewDegrees(vertical),
      rotationDegrees: getTransformRotationDegrees(target.baseTransform),
    };
  }

  function readSkewPluginState(node) {
    if (!node || typeof node.getPluginData !== "function") {
      return null;
    }
    let raw = "";
    try {
      raw = node.getPluginData(SKEW_PLUGIN_DATA_KEY);
    } catch (error) {
      return null;
    }
    if (!raw || typeof raw !== "string") {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      const values = normalizeStoredSkewState(parsed);
      if (!hasMeaningfulSkewValues(values) && Math.abs(values.rotationDegrees) <= SKEW_EPSILON_DEGREES) {
        return null;
      }
      return values;
    } catch (error) {
      return null;
    }
  }

  function normalizeStoredSkewValues(state) {
    const source = state && typeof state === "object" ? state : {};
    return {
      horizontalDegrees: clampSkewDegrees(source.horizontalDegrees),
      verticalDegrees: clampSkewDegrees(source.verticalDegrees),
      rotationDegrees: clampRotationDegrees(source.rotationDegrees),
    };
  }

  function normalizeStoredSkewState(state) {
    const values = normalizeStoredSkewValues(state);
    const baseTransform = copySkewTransform(state && state.baseTransform);
    if (baseTransform) {
      values.baseTransform = baseTransform;
    }
    return values;
  }

  function writeSkewPluginState(target, horizontalDegrees, verticalDegrees, rotationDegrees) {
    const node = target && target.node ? target.node : null;
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }
    const state = {
      version: 1,
      horizontalDegrees: clampSkewDegrees(horizontalDegrees),
      verticalDegrees: clampSkewDegrees(verticalDegrees),
      rotationDegrees: clampRotationDegrees(rotationDegrees),
      baseTransform: copySkewTransform(target.baseTransform),
      updatedAt: new Date().toISOString(),
    };

    if (!hasMeaningfulSkewValues(state) && Math.abs(state.rotationDegrees) <= SKEW_EPSILON_DEGREES) {
      clearSkewPluginState(node);
      return;
    }

    try {
      node.setPluginData(SKEW_PLUGIN_DATA_KEY, JSON.stringify(state));
    } catch (error) {
      // Metadata is only used to restore the UI values; the transform itself was already applied.
    }
  }

  function clearSkewPluginState(node) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }
    try {
      node.setPluginData(SKEW_PLUGIN_DATA_KEY, "");
    } catch (error) {
      // Ignore metadata cleanup failures.
    }
  }

  function invertSkewTransform(transform) {
    if (!transform) {
      return null;
    }
    const a = transform[0][0];
    const c = transform[0][1];
    const tx = transform[0][2];
    const b = transform[1][0];
    const d = transform[1][1];
    const ty = transform[1][2];
    const determinant = a * d - b * c;
    if (Math.abs(determinant) <= 0.000001) {
      return null;
    }
    const nextA = d / determinant;
    const nextC = -c / determinant;
    const nextB = -b / determinant;
    const nextD = a / determinant;
    return [
      [nextA, nextC, -(nextA * tx + nextC * ty)],
      [nextB, nextD, -(nextB * tx + nextD * ty)],
    ];
  }

  function multiplySkewTransforms(left, right) {
    if (!left || !right) {
      return null;
    }
    const a0 = left[0][0];
    const c0 = left[0][1];
    const tx0 = left[0][2];
    const b0 = left[1][0];
    const d0 = left[1][1];
    const ty0 = left[1][2];
    const a1 = right[0][0];
    const c1 = right[0][1];
    const tx1 = right[0][2];
    const b1 = right[1][0];
    const d1 = right[1][1];
    const ty1 = right[1][2];
    return [
      [a0 * a1 + c0 * b1, a0 * c1 + c0 * d1, a0 * tx1 + c0 * ty1 + tx0],
      [b0 * a1 + d0 * b1, b0 * c1 + d0 * d1, b0 * tx1 + d0 * ty1 + ty0],
    ];
  }

  function buildSkewResult(session, applied, skipped) {
    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionCount: session.selectionCount,
        targetCount: session.targets.length,
        appliedCount: applied.length,
        skippedCount: skipped.length,
        horizontalDegrees: session.horizontalDegrees,
        verticalDegrees: session.verticalDegrees,
        rotationDegrees: session.rotationDegrees,
      },
      applied: applied.slice(0, 24),
      skipped: skipped.slice(0, 24),
    };
  }

  function serializeSkewSession(session) {
    return {
      sessionId: session.sessionId,
      summary: {
        selectionCount: session.selectionCount,
        targetCount: session.targets.length,
        skippedCount: session.skipped.length,
      },
      values: {
        horizontalDegrees: session.horizontalDegrees,
        verticalDegrees: session.verticalDegrees,
        rotationDegrees: session.rotationDegrees,
      },
      targets: session.targets.slice(0, 24).map(function (target) {
        return {
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          nodeType: target.nodeType,
        };
      }),
      skipped: session.skipped.slice(0, 24),
    };
  }

  function buildSkippedSkewNode(node, reason) {
    return {
      nodeId: node && typeof node.id === "string" ? node.id : "",
      nodeName: safeSkewName(node),
      nodeType: String((node && node.type) || "UNKNOWN"),
      reason,
    };
  }

  function clampSkewDegrees(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }
    return Math.max(-MAX_SKEW_DEGREES, Math.min(MAX_SKEW_DEGREES, Math.round(number * 10) / 10));
  }

  function clampRotationDegrees(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }
    return Math.max(-MAX_ROTATION_DEGREES, Math.min(MAX_ROTATION_DEGREES, Math.round(number * 10) / 10));
  }

  function clampSkewTangentDegrees(value) {
    const number = clampSkewDegrees(value);
    return Math.max(-MAX_TANGENT_SKEW_DEGREES, Math.min(MAX_TANGENT_SKEW_DEGREES, number));
  }

  function getTransformRotationDegrees(transform) {
    if (!transform) {
      return 0;
    }
    return clampRotationDegrees((Math.atan2(toFiniteSkewNumber(transform[1][0], 0), toFiniteSkewNumber(transform[0][0], 1)) * 180) / Math.PI);
  }

  function toFiniteSkewNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function roundSkewTransformValue(value) {
    return Math.round((Number(value) || 0) * TRANSFORM_PRECISION) / TRANSFORM_PRECISION;
  }

  function safeSkewName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }
    return node && node.type ? String(node.type) : "Layer";
  }

  function normalizeSkewError(error, fallback) {
    if (error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return fallback;
  }

  function buildSkewApplyToast(result) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount = Number(summary.appliedCount) || 0;
    const skippedCount = Number(summary.skippedCount) || 0;
    if (appliedCount <= 0) {
      return "스큐를 적용할 수 있는 레이어가 없습니다.";
    }
    return skippedCount > 0
      ? "스큐 조정 완료 (" + appliedCount + "개 적용, " + skippedCount + "개 제외)"
      : "스큐 조정 완료 (" + appliedCount + "개 적용)";
  }
  function buildSkewClearToast(result) {
    const summary = result && result.summary ? result.summary : {};
    const cleanedCount = Number(summary.cleanedCount) || 0;
    const skippedCount = Number(summary.skippedCount) || 0;
    if (cleanedCount <= 0) {
      return "정리할 수 있는 스큐 레이어가 없습니다.";
    }
    return skippedCount > 0
      ? "스큐 정리 완료 (" + cleanedCount + "개 정리, " + skippedCount + "개 제외)"
      : "스큐 정리 완료 (" + cleanedCount + "개 정리)";
  }
})();
