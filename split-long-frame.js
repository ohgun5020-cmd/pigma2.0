;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_SPLIT_LONG_FRAME_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const MAX_SEGMENT_AXIS = 8000;
  const MIN_SECTION_AXIS = 120;
  const MIN_SEGMENT_AXIS = 48;
  const SECTION_OVERLAP_TOLERANCE = 1;
  const OUTPUT_OFFSET = 96;
  const OUTPUT_GAP = 48;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isSplitLongFrameMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uD504\uB808\uC784 \uB098\uB204\uAE30\uAC00 \uC774\uBBF8 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.");
        return;
      }

      await runSplitLongFrame();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_SPLIT_LONG_FRAME_PATCH__ = true;
  globalScope.__PIGMA_SPLIT_LONG_FRAME_API__ = {
    createFramesForNode: createSplitLongFrames,
  };

  function isSplitLongFrameMessage(message) {
    return !!message && message.type === "run-split-long-frame";
  }

  async function runSplitLongFrame() {
    isRunning = true;
    postStatus("running", "\uAE34 \uD504\uB808\uC784\uC744 \uC139\uC158\uBCC4\uB85C \uB098\uB204\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = splitSelectedLongFrame();
      figma.ui.postMessage({
        type: "split-long-frame-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uD504\uB808\uC784 \uB098\uB204\uAE30\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "split-long-frame-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2600 });
    } finally {
      isRunning = false;
    }
  }

  function splitSelectedLongFrame() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (selection.length !== 1) {
      throw new Error("\uB098\uB20C \uD504\uB808\uC784 \uD558\uB098\uB9CC \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const output = createSplitLongFrames(selection[0], {
      selectCreatedFrames: true,
      scrollIntoView: true,
    });
    return output.result;
  }

  function createSplitLongFrames(root, options) {
    const normalizedOptions = options && typeof options === "object" ? options : {};
    if (!hasChildren(root) || !hasUsableSize(root)) {
      throw new Error("\uC790\uC2DD \uB808\uC774\uC5B4\uAC00 \uC788\uB294 \uD504\uB808\uC784, \uCEF4\uD3EC\uB10C\uD2B8, \uC139\uC158\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const direction = normalizedOptions.direction === "horizontal" || normalizedOptions.direction === "vertical" ? normalizedOptions.direction : inferDirection(root);
    const rootAxis = getMainSize(root, direction);
    const rootCross = getCrossSize(root, direction);
    const maxSegmentAxis = getMaxSegmentAxis(normalizedOptions);
    const outputOffset = getNumberOption(normalizedOptions, "outputOffset", OUTPUT_OFFSET);
    const outputGap = getNumberOption(normalizedOptions, "outputGap", OUTPUT_GAP);
    const entries = collectDirectChildEntries(root, direction);
    if (!entries.length) {
      throw new Error("\uB098\uB204\uAE30\uC5D0 \uC0AC\uC6A9\uD560 \uC790\uC2DD \uB808\uC774\uC5B4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    let anchors = buildSectionAnchors(entries, rootAxis, rootCross);
    if (anchors.length < 2) {
      anchors = buildSectionAnchors(collectNestedAnchorEntries(root, direction), rootAxis, rootCross);
    }
    let segments = anchors.length >= 2 ? buildSectionSegments(anchors, rootAxis) : buildChunkSegments(rootAxis, maxSegmentAxis);
    segments = expandLargeSegments(segments, maxSegmentAxis);

    if (segments.length < 2) {
      throw new Error("\uB098\uB20C \uC139\uC158\uC774 \uBD80\uC871\uD558\uAC70\uB098 \uC774\uBBF8 PSD\uC6A9\uC73C\uB85C \uCDA9\uBD84\uD788 \uC9E7\uC2B5\uB2C8\uB2E4.");
    }

    const rootPageBox = getAbsoluteBox(root);
    const rootPageX = rootPageBox ? rootPageBox.x : getNumberProperty(root, "x", 0);
    const rootPageY = rootPageBox ? rootPageBox.y : getNumberProperty(root, "y", 0);
    const createdFrames = [];
    const skipped = [];
    const warnings = [];
    let cursor = 0;

    try {
      for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const frame = figma.createFrame();
        frame.name = buildFrameName(root, segment, index, segments.length);
        setFrameSize(frame, direction === "vertical" ? root.width : segment.length, direction === "vertical" ? segment.length : root.height);
        copyFrameAppearance(root, frame);
        trySet(frame, "clipsContent", true);

        if (direction === "vertical") {
          frame.x = rootPageX + root.width + outputOffset;
          frame.y = rootPageY + cursor;
        } else {
          frame.x = rootPageX + cursor;
          frame.y = rootPageY + root.height + outputOffset;
        }

        figma.currentPage.appendChild(frame);

        const cloneResult = cloneSegmentChildren(root, frame, entries, segment, direction);
        appendAll(skipped, cloneResult.skipped);
        appendAll(warnings, cloneResult.warnings);

        createdFrames.push({
          node: frame,
          name: frame.name,
          width: roundNumber(frame.width),
          height: roundNumber(frame.height),
          clonedLayerCount: cloneResult.clonedLayerCount,
        });

        cursor += segment.length + outputGap;
      }
    } catch (error) {
      cleanupCreatedFrames(createdFrames);
      throw error;
    }

    const selectionTargets = [];
    for (let index = 0; index < createdFrames.length; index += 1) {
      selectionTargets.push(createdFrames[index].node);
    }
    if (normalizedOptions.selectCreatedFrames === true) {
      figma.currentPage.selection = selectionTargets;
    }
    if (normalizedOptions.scrollIntoView === true && selectionTargets.length) {
      figma.viewport.scrollAndZoomIntoView(selectionTargets);
    }

    return {
      frames: selectionTargets,
      result: buildResult(root, direction, segments, createdFrames, skipped, warnings, anchors.length, maxSegmentAxis),
    };
  }

  function collectDirectChildEntries(root, direction) {
    const entries = [];
    for (let index = 0; index < root.children.length; index += 1) {
      const child = root.children[index];
      if (!child || child.removed) {
        continue;
      }

      const bounds = getLocalBounds(root, child);
      if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
        continue;
      }

      const mainStart = direction === "vertical" ? bounds.y : bounds.x;
      const mainLength = direction === "vertical" ? bounds.height : bounds.width;
      const crossStart = direction === "vertical" ? bounds.x : bounds.y;
      const crossLength = direction === "vertical" ? bounds.width : bounds.height;

      entries.push({
        node: child,
        order: index,
        name: safeName(child),
        localX: getNumberProperty(child, "x", bounds.x),
        localY: getNumberProperty(child, "y", bounds.y),
        width: getNumberProperty(child, "width", bounds.width),
        height: getNumberProperty(child, "height", bounds.height),
        mainStart,
        mainEnd: mainStart + mainLength,
        mainLength,
        crossStart,
        crossEnd: crossStart + crossLength,
        crossLength,
      });
    }

    entries.sort((a, b) => a.order - b.order);
    return entries;
  }

  function collectNestedAnchorEntries(root, direction) {
    const entries = [];
    const stack = [];
    let order = 0;

    for (let index = root.children.length - 1; index >= 0; index -= 1) {
      stack.push({
        node: root.children[index],
        depth: 1,
      });
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const node = current && current.node;
      if (!node || node.removed) {
        continue;
      }

      const bounds = getLocalBounds(root, node);
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        const mainStart = direction === "vertical" ? bounds.y : bounds.x;
        const mainLength = direction === "vertical" ? bounds.height : bounds.width;
        const crossStart = direction === "vertical" ? bounds.x : bounds.y;
        const crossLength = direction === "vertical" ? bounds.width : bounds.height;
        entries.push({
          node,
          order,
          name: safeName(node),
          localX: bounds.x,
          localY: bounds.y,
          width: bounds.width,
          height: bounds.height,
          mainStart,
          mainEnd: mainStart + mainLength,
          mainLength,
          crossStart,
          crossEnd: crossStart + crossLength,
          crossLength,
        });
        order += 1;
      }

      if (current.depth >= 3 || !hasChildren(node)) {
        continue;
      }

      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push({
          node: node.children[index],
          depth: current.depth + 1,
        });
      }
    }

    entries.sort((a, b) => a.mainStart - b.mainStart || a.order - b.order);
    return entries;
  }

  function buildSectionAnchors(entries, rootAxis, rootCross) {
    const candidates = [];
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (!isAnchorCandidate(entry, rootAxis, rootCross)) {
        continue;
      }

      candidates.push({
        start: clamp(entry.mainStart, 0, rootAxis),
        end: clamp(entry.mainEnd, 0, rootAxis),
        label: entry.name,
        nodeId: entry.node.id,
      });
    }

    candidates.sort((a, b) => a.start - b.start || a.end - b.end);

    const anchors = [];
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (candidate.end - candidate.start < MIN_SECTION_AXIS) {
        continue;
      }

      const previous = anchors.length > 0 ? anchors[anchors.length - 1] : null;
      if (previous && shouldMergeSectionAnchor(previous, candidate)) {
        previous.end = Math.max(previous.end, candidate.end);
        if (!previous.label && candidate.label) {
          previous.label = candidate.label;
        }
        continue;
      }

      anchors.push(candidate);
    }

    return anchors;
  }

  function shouldMergeSectionAnchor(previous, candidate) {
    if (!previous || !candidate) {
      return false;
    }

    const overlap = previous.end - candidate.start;
    if (overlap <= SECTION_OVERLAP_TOLERANCE) {
      return false;
    }

    const previousLength = Math.max(1, previous.end - previous.start);
    const candidateLength = Math.max(1, candidate.end - candidate.start);
    const smallerLength = Math.min(previousLength, candidateLength);
    if (overlap >= smallerLength * 0.65) {
      return true;
    }

    return candidate.end <= previous.end + SECTION_OVERLAP_TOLERANCE;
  }

  function isAnchorCandidate(entry, rootAxis, rootCross) {
    if (!entry || entry.mainLength < MIN_SECTION_AXIS) {
      return false;
    }

    if (entry.node.visible === false) {
      return false;
    }

    if (entry.mainLength >= rootAxis * 0.85) {
      return false;
    }

    if (entry.crossLength < Math.max(32, rootCross * 0.08)) {
      return false;
    }

    return true;
  }

  function buildSectionSegments(anchors, rootAxis) {
    const segments = [];
    for (let index = 0; index < anchors.length; index += 1) {
      const anchor = anchors[index];
      const next = index < anchors.length - 1 ? anchors[index + 1] : null;
      const start = index === 0 ? 0 : anchor.start;
      const end = next ? next.start : rootAxis;
      appendSegment(segments, {
        start,
        end,
        label: anchor.label,
        mode: "section",
      }, rootAxis);
    }

    return segments;
  }

  function buildChunkSegments(rootAxis, maxSegmentAxis) {
    const segments = [];
    let start = 0;
    while (start < rootAxis - 0.5) {
      const end = Math.min(rootAxis, start + maxSegmentAxis);
      appendSegment(segments, {
        start,
        end,
        label: "\uBD84\uD560",
        mode: "chunk",
      }, rootAxis);
      start = end;
    }
    return segments;
  }

  function expandLargeSegments(segments, maxSegmentAxis) {
    const expanded = [];
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      if (segment.length <= maxSegmentAxis) {
        expanded.push(segment);
        continue;
      }

      let partStart = segment.start;
      let partIndex = 1;
      while (partStart < segment.end - 0.5) {
        const partEnd = Math.min(segment.end, partStart + maxSegmentAxis);
        appendSegment(expanded, {
          start: partStart,
          end: partEnd,
          label: segment.label + " " + partIndex,
          mode: segment.mode,
        }, segment.end);
        partStart = partEnd;
        partIndex += 1;
      }
    }

    return expanded;
  }

  function getMaxSegmentAxis(options) {
    const value = options && typeof options.maxSegmentAxis === "number" ? options.maxSegmentAxis : MAX_SEGMENT_AXIS;
    if (!isFiniteNumber(value)) {
      return MAX_SEGMENT_AXIS;
    }
    return Math.max(MIN_SEGMENT_AXIS, Math.round(value));
  }

  function getNumberOption(options, key, fallback) {
    const value = options && typeof options[key] === "number" ? options[key] : fallback;
    if (!isFiniteNumber(value) || value < 0) {
      return fallback;
    }
    return value;
  }

  function appendSegment(segments, source, axisLimit) {
    const start = clamp(source.start, 0, axisLimit);
    const end = clamp(source.end, 0, axisLimit);
    const length = end - start;
    if (length < MIN_SEGMENT_AXIS) {
      return;
    }

    segments.push({
      start,
      end,
      length,
      label: source.label || "\uC139\uC158",
      mode: source.mode || "section",
    });
  }

  function cloneSegmentChildren(root, frame, entries, segment, direction) {
    const skipped = [];
    const warnings = [];
    let clonedLayerCount = 0;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (!overlapsSegment(entry, segment)) {
        continue;
      }

      let clone = null;
      try {
        clone = entry.node.clone();
        frame.appendChild(clone);
        positionClone(clone, entry, segment, direction);
        const trimResult = trimCloneToSegmentIfNeeded(clone, entry, segment, direction);
        if (trimResult.warning) {
          warnings.push({
            nodeName: entry.name,
            reason: trimResult.warning,
          });
        }
        clonedLayerCount += 1;
      } catch (error) {
        removeNodeQuietly(clone);
        skipped.push({
          nodeId: entry.node.id,
          nodeName: entry.name,
          nodeType: String(entry.node.type || "UNKNOWN"),
          reason: normalizeErrorMessage(error, "\uD574\uB2F9 \uB808\uC774\uC5B4\uB97C \uBCF5\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
        });
      }
    }

    return {
      clonedLayerCount,
      skipped,
      warnings,
    };
  }

  function removeNodeQuietly(node) {
    try {
      if (node && !node.removed) {
        node.remove();
      }
    } catch (error) {
      /* empty */
    }
  }

  function overlapsSegment(entry, segment) {
    return entry.mainEnd > segment.start + 0.5 && entry.mainStart < segment.end - 0.5;
  }

  function positionClone(clone, entry, segment, direction) {
    const wasLocked = tryUnlock(clone);
    const mainOffset = direction === "vertical" ? segment.start : 0;
    const crossOffset = direction === "horizontal" ? segment.start : 0;

    if (direction === "vertical") {
      trySet(clone, "x", entry.localX);
      trySet(clone, "y", entry.localY - mainOffset);
    } else {
      trySet(clone, "x", entry.localX - crossOffset);
      trySet(clone, "y", entry.localY);
    }

    restoreLocked(clone, wasLocked);
  }

  function trimCloneToSegmentIfNeeded(clone, entry, segment, direction) {
    if (entry.mainLength <= segment.length + 1) {
      return {};
    }

    if (!canResize(clone)) {
      return {
        warning: "\uC6D0\uBCF8\uBCF4\uB2E4 \uAE34 \uB808\uC774\uC5B4\uB77C \uD074\uB9AC\uD551\uB9CC \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
      };
    }

    if (String(clone.type || "") === "INSTANCE" && hasChildren(clone)) {
      return {
        warning: "\uC778\uC2A4\uD134\uC2A4 \uB0B4\uBD80\uB294 \uC790\uC2DD \uC704\uCE58\uB97C \uC870\uC815\uD560 \uC218 \uC5C6\uC5B4 \uD074\uB9AC\uD551\uB9CC \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
      };
    }

    const overlapStart = Math.max(entry.mainStart, segment.start);
    const overlapEnd = Math.min(entry.mainEnd, segment.end);
    const overlapLength = overlapEnd - overlapStart;
    if (overlapLength < MIN_SEGMENT_AXIS) {
      return {};
    }

    const cropOffset = overlapStart - entry.mainStart;
    const outputMain = overlapStart - segment.start;
    const wasLocked = tryUnlock(clone);
    const childShift = shiftCloneChildren(clone, cropOffset, direction);

    trySet(clone, "clipsContent", true);
    setNodeAxisPosition(clone, direction, outputMain, getCrossLocalPosition(entry, direction));
    resizeNodeByAxis(clone, direction, overlapLength, getCrossSizeFromEntry(entry, direction));
    restoreLocked(clone, wasLocked);

    if (hasChildren(clone) && childShift.failedCount > 0) {
      return {
        warning: "\uC77C\uBD80 \uC790\uC2DD \uB808\uC774\uC5B4\uB294 \uC139\uC158 \uC704\uCE58\uC5D0 \uB9DE\uAC8C \uC774\uB3D9\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      };
    }

    return {};
  }

  function shiftCloneChildren(clone, cropOffset, direction) {
    if (!hasChildren(clone) || Math.abs(cropOffset) < 0.5) {
      return {
        movedCount: 0,
        failedCount: 0,
      };
    }

    trySet(clone, "layoutMode", "NONE");

    let movedCount = 0;
    let failedCount = 0;
    for (let index = 0; index < clone.children.length; index += 1) {
      const child = clone.children[index];
      const wasLocked = tryUnlock(child);
      try {
        if (direction === "vertical") {
          child.y = child.y - cropOffset;
        } else {
          child.x = child.x - cropOffset;
        }
        movedCount += 1;
      } catch (error) {
        failedCount += 1;
      }
      restoreLocked(child, wasLocked);
    }

    return {
      movedCount,
      failedCount,
    };
  }

  function inferDirection(root) {
    if (root.height >= root.width * 1.25) {
      return "vertical";
    }

    if (root.width >= root.height * 1.25) {
      return "horizontal";
    }

    return root.height >= root.width ? "vertical" : "horizontal";
  }

  function getLocalBounds(root, child) {
    const rootBox = getAbsoluteBox(root);
    const childBox = getAbsoluteBox(child);
    if (rootBox && childBox) {
      return {
        x: childBox.x - rootBox.x,
        y: childBox.y - rootBox.y,
        width: childBox.width,
        height: childBox.height,
      };
    }

    const width = getNumberProperty(child, "width", 0);
    const height = getNumberProperty(child, "height", 0);
    if (width <= 0 || height <= 0) {
      return null;
    }

    return {
      x: getNumberProperty(child, "x", 0),
      y: getNumberProperty(child, "y", 0),
      width,
      height,
    };
  }

  function getAbsoluteBox(node) {
    try {
      const box = node.absoluteBoundingBox;
      if (box && isFiniteNumber(box.x) && isFiniteNumber(box.y) && isFiniteNumber(box.width) && isFiniteNumber(box.height)) {
        return box;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children);
  }

  function hasUsableSize(node) {
    return getNumberProperty(node, "width", 0) > 1 && getNumberProperty(node, "height", 0) > 1;
  }

  function getMainSize(node, direction) {
    return direction === "vertical" ? node.height : node.width;
  }

  function getCrossSize(node, direction) {
    return direction === "vertical" ? node.width : node.height;
  }

  function getCrossSizeFromEntry(entry, direction) {
    return direction === "vertical" ? entry.width : entry.height;
  }

  function getCrossLocalPosition(entry, direction) {
    return direction === "vertical" ? entry.localX : entry.localY;
  }

  function setNodeAxisPosition(node, direction, main, cross) {
    if (direction === "vertical") {
      trySet(node, "x", cross);
      trySet(node, "y", main);
    } else {
      trySet(node, "x", main);
      trySet(node, "y", cross);
    }
  }

  function resizeNodeByAxis(node, direction, mainLength, crossLength) {
    const width = direction === "vertical" ? crossLength : mainLength;
    const height = direction === "vertical" ? mainLength : crossLength;
    resizeNode(node, width, height);
  }

  function setFrameSize(frame, width, height) {
    resizeNode(frame, width, height);
  }

  function resizeNode(node, width, height) {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(safeWidth, safeHeight);
      return;
    }

    if (typeof node.resize === "function") {
      node.resize(safeWidth, safeHeight);
    }
  }

  function canResize(node) {
    return !!node && (typeof node.resizeWithoutConstraints === "function" || typeof node.resize === "function");
  }

  function copyFrameAppearance(source, frame) {
    assignArrayProperty(frame, "fills", readProperty(source, "fills"), []);
    assignArrayProperty(frame, "strokes", readProperty(source, "strokes"), []);
    assignArrayProperty(frame, "effects", readProperty(source, "effects"), null);
    assignArrayProperty(frame, "exportSettings", readProperty(source, "exportSettings"), null);
    assignScalarProperty(frame, "strokeWeight", readProperty(source, "strokeWeight"));
    assignScalarProperty(frame, "cornerRadius", readProperty(source, "cornerRadius"));
  }

  function assignArrayProperty(target, key, value, fallback) {
    try {
      if (Array.isArray(value)) {
        target[key] = JSON.parse(JSON.stringify(value));
      } else if (Array.isArray(fallback)) {
        target[key] = JSON.parse(JSON.stringify(fallback));
      }
    } catch (error) {
      try {
        if (Array.isArray(fallback)) {
          target[key] = fallback;
        }
      } catch (innerError) {
        /* empty */
      }
    }
  }

  function assignScalarProperty(target, key, value) {
    if (value === undefined || value === null || typeof value === "symbol") {
      return;
    }

    trySet(target, key, value);
  }

  function readProperty(node, key) {
    try {
      return node[key];
    } catch (error) {
      return undefined;
    }
  }

  function trySet(node, key, value) {
    try {
      if (node && key in node) {
        node[key] = value;
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function tryUnlock(node) {
    try {
      if (node && node.locked === true) {
        node.locked = false;
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function restoreLocked(node, wasLocked) {
    if (!wasLocked) {
      return;
    }

    try {
      node.locked = true;
    } catch (error) {
      /* empty */
    }
  }

  function buildFrameName(root, segment, index, total) {
    const number = String(index + 1).padStart(2, "0");
    const label = sanitizeName(segment.label || "\uC139\uC158");
    return safeName(root) + " / split " + number + "-" + String(total).padStart(2, "0") + " " + label;
  }

  function sanitizeName(name) {
    const cleaned = String(name || "")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) {
      return "\uC139\uC158";
    }
    return cleaned.length > 42 ? cleaned.slice(0, 42).trim() : cleaned;
  }

  function buildResult(root, direction, segments, createdFrames, skipped, warnings, anchorCount, maxSegmentAxis) {
    const frames = [];
    for (let index = 0; index < createdFrames.length && index < RESULT_PREVIEW_LIMIT; index += 1) {
      frames.push({
        nodeId: createdFrames[index].node.id,
        name: createdFrames[index].name,
        width: createdFrames[index].width,
        height: createdFrames[index].height,
        clonedLayerCount: createdFrames[index].clonedLayerCount,
      });
    }

    return {
      summary: {
        rootName: safeName(root),
        direction,
        directionLabel: direction === "vertical" ? "\uC138\uB85C" : "\uAC00\uB85C",
        sourceChildCount: root.children.length,
        sectionAnchorCount: anchorCount,
        segmentCount: segments.length,
        createdFrameCount: createdFrames.length,
        skippedLayerCount: skipped.length,
        warningCount: warnings.length,
        maxSegmentAxis: maxSegmentAxis,
        originalWidth: roundNumber(root.width),
        originalHeight: roundNumber(root.height),
      },
      frames,
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
      warnings: warnings.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const count = summary.createdFrameCount || 0;
    const skippedCount = summary.skippedLayerCount || 0;
    let message = "\uD504\uB808\uC784 " + count + "\uAC1C\uB85C \uB098\uB220\uC2B5\uB2C8\uB2E4.";
    if (skippedCount > 0) {
      message += " \uBCF5\uC81C \uC2E4\uD328 " + skippedCount + "\uAC1C\uAC00 \uC788\uC2B5\uB2C8\uB2E4.";
    }
    figma.notify(message, { timeout: 3000 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "split-long-frame-status",
      status,
      message,
    });
  }

  function normalizeErrorMessage(error, fallback) {
    if (error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    return fallback;
  }

  function appendAll(target, source) {
    for (let index = 0; index < source.length; index += 1) {
      target.push(source[index]);
    }
  }

  function cleanupCreatedFrames(createdFrames) {
    for (let index = 0; index < createdFrames.length; index += 1) {
      const frame = createdFrames[index] && createdFrames[index].node ? createdFrames[index].node : null;
      if (frame && !frame.removed) {
        try {
          frame.remove();
        } catch (error) {
        }
      }
    }
  }

  function safeName(node) {
    try {
      const name = node && typeof node.name === "string" ? node.name.trim() : "";
      return name || "\uC774\uB984 \uC5C6\uC74C";
    } catch (error) {
      return "\uC774\uB984 \uC5C6\uC74C";
    }
  }

  function getNumberProperty(node, key, fallback) {
    try {
      const value = node[key];
      return isFiniteNumber(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function isFiniteNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function clamp(value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  function roundNumber(value) {
    return Math.round(value * 100) / 100;
  }
})();
