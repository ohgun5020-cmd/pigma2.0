$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root "code.js"
$patch = Join-Path $root "psd-import-text-fix.js"
$exportPatch = Join-Path $root "psd-export-boundary.js"
$shapeLayerExportPatch = Join-Path $root "psd-shape-layer-export.js"
$aiSettingsPatch = Join-Path $root "ai-settings-storage.js"
$pigmaWebIntegrationPatch = Join-Path $root "pigma-web-integration.js"
$aiResponsiveMemoryPatch = Join-Path $root "ai-responsive-memory.js"
$aiResponsivePairAnalyzerPatch = Join-Path $root "ai-responsive-pair-analyzer.js"
$aiLlmClientPatch = Join-Path $root "ai-llm-client.js"
$aiDesignChatPatch = Join-Path $root "ai-design-chat.js"
$aiAccessibilityDiagnosisPatch = Join-Path $root "ai-accessibility-diagnosis.js"
$aiDesignConsistencyPatch = Join-Path $root "ai-design-consistency.js"
$aiTypoAuditPatch = Join-Path $root "ai-typo-audit.js"
$aiPixelPerfectPatch = Join-Path $root "ai-pixel-perfect.js"
$skewTransformPatch = Join-Path $root "skew-transform.js"
$cornerRadiusAdjustPatch = Join-Path $root "corner-radius-adjust.js"
$buttonTextAutoSizePatch = Join-Path $root "button-text-auto-size.js"
$selectAllTextPatch = Join-Path $root "select-all-text.js"
$selectColorMatchesPatch = Join-Path $root "select-color-matches.js"
$textLineHeightAdjustPatch = Join-Path $root "text-line-height-adjust.js"
$unlockLockedLayersPatch = Join-Path $root "unlock-locked-layers.js"
$detachLinkedComponentsPatch = Join-Path $root "detach-linked-components.js"
$autoLayoutOffPatch = Join-Path $root "auto-layout-off.js"
$deleteHiddenLayersPatch = Join-Path $root "delete-hidden-layers.js"
$clearFrameGuidesPatch = Join-Path $root "clear-frame-guides.js"
$splitLongFramePatch = Join-Path $root "split-long-frame.js"
$copyPrototypeLinkPatch = Join-Path $root "copy-prototype-link.js"
$aiColorExtractPatch = Join-Path $root "ai-color-extract.js"
$originalImageDownloadPatch = Join-Path $root "original-image-download.js"
$aiImageSharedBridgePatch = Join-Path $root "ai-image-shared-bridge.js"
$destination = Join-Path $root "code.patched.js"
$uiSource = Join-Path $root "ui.html"
$pdfJsInlineAssetCleanup = Join-Path $root "sync-pdfjs-inline-assets.js"
$ghostscriptInlineAssetCleanup = Join-Path $root "sync-ghostscript-inline-assets.js"
$gifEncoderInlineAssetSync = Join-Path $root "sync-gifenc-inline-assets.js"
$apngInlineAssetSync = Join-Path $root "sync-apng-inline-assets.js"
$presentationInlineAssetSync = Join-Path $root "sync-presentation-inline-assets.js"
$uiExternalizer = Join-Path $root "externalize-embedded-ui.js"
$uiVerifier = Join-Path $root "verify-externalized-ui.js"
$textGuardContract = Join-Path $root "text-import-guard.contract.json"
$textGuardVerifier = Join-Path $root "verify-text-import-guard.js"
$textExportGuardContract = Join-Path $root "text-export-guard.contract.json"
$textExportGuardVerifier = Join-Path $root "verify-text-export-guard.js"
$textHighlightBoundsContract = Join-Path $root "text-highlight-bounds.contract.json"
$textHighlightBoundsVerifier = Join-Path $root "verify-text-highlight-bounds.js"
$exportBoundaryContract = Join-Path $root "psd-export-boundary.contract.json"
$exportBoundaryVerifier = Join-Path $root "verify-psd-export-boundary.js"
$shapeLayerExportContract = Join-Path $root "psd-shape-layer-export.contract.json"
$shapeLayerExportVerifier = Join-Path $root "verify-psd-shape-layer-export.js"
$figmaRuntimeSyntaxVerifier = Join-Path $root "verify-figma-runtime-syntax.js"
$messageHandlerVerifier = Join-Path $root "verify-message-handler-pass-through.js"
$uiRuntimeMessageVerifier = Join-Path $root "verify-ui-runtime-message-types.js"
$uiSourceBoundaryVerifier = Join-Path $root "verify-ui-source-boundary.js"
$fontPostScriptMapBuilder = Join-Path $root "build-font-postscript-map.js"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path $source)) {
  throw "Missing source bundle: $source"
}

if (-not (Test-Path $patch)) {
  throw "Missing import patch: $patch"
}

if (-not (Test-Path $exportPatch)) {
  throw "Missing export patch: $exportPatch"
}

if (-not (Test-Path $shapeLayerExportPatch)) {
  throw "Missing PSD shape layer export patch: $shapeLayerExportPatch"
}

if (-not (Test-Path $aiSettingsPatch)) {
  throw "Missing AI settings patch: $aiSettingsPatch"
}

if (-not (Test-Path $pigmaWebIntegrationPatch)) {
  throw "Missing Pigma web integration patch: $pigmaWebIntegrationPatch"
}

if (-not (Test-Path $aiResponsiveMemoryPatch)) {
  throw "Missing AI responsive memory patch: $aiResponsiveMemoryPatch"
}

if (-not (Test-Path $aiResponsivePairAnalyzerPatch)) {
  throw "Missing AI responsive pair analyzer patch: $aiResponsivePairAnalyzerPatch"
}

if (-not (Test-Path $aiLlmClientPatch)) {
  throw "Missing AI LLM client patch: $aiLlmClientPatch"
}

if (-not (Test-Path $aiDesignChatPatch)) {
  throw "Missing AI design chat patch: $aiDesignChatPatch"
}

if (-not (Test-Path $aiAccessibilityDiagnosisPatch)) {
  throw "Missing AI accessibility diagnosis patch: $aiAccessibilityDiagnosisPatch"
}

if (-not (Test-Path $aiDesignConsistencyPatch)) {
  throw "Missing AI design consistency patch: $aiDesignConsistencyPatch"
}

if (-not (Test-Path $aiTypoAuditPatch)) {
  throw "Missing AI typo audit patch: $aiTypoAuditPatch"
}

if (-not (Test-Path $aiPixelPerfectPatch)) {
  throw "Missing AI pixel perfect patch: $aiPixelPerfectPatch"
}

if (-not (Test-Path $skewTransformPatch)) {
  throw "Missing skew transform patch: $skewTransformPatch"
}

if (-not (Test-Path $cornerRadiusAdjustPatch)) {
  throw "Missing corner radius adjust patch: $cornerRadiusAdjustPatch"
}

if (-not (Test-Path $buttonTextAutoSizePatch)) {
  throw "Missing button text auto size patch: $buttonTextAutoSizePatch"
}

if (-not (Test-Path $selectAllTextPatch)) {
  throw "Missing select all text patch: $selectAllTextPatch"
}

if (-not (Test-Path $selectColorMatchesPatch)) {
  throw "Missing select color matches patch: $selectColorMatchesPatch"
}

if (-not (Test-Path $textLineHeightAdjustPatch)) {
  throw "Missing text line height adjust patch: $textLineHeightAdjustPatch"
}

if (-not (Test-Path $unlockLockedLayersPatch)) {
  throw "Missing locked layer unlock patch: $unlockLockedLayersPatch"
}

if (-not (Test-Path $detachLinkedComponentsPatch)) {
  throw "Missing linked component detach patch: $detachLinkedComponentsPatch"
}

if (-not (Test-Path $autoLayoutOffPatch)) {
  throw "Missing auto layout off patch: $autoLayoutOffPatch"
}

if (-not (Test-Path $deleteHiddenLayersPatch)) {
  throw "Missing hidden layer delete patch: $deleteHiddenLayersPatch"
}

if (-not (Test-Path $clearFrameGuidesPatch)) {
  throw "Missing frame guides clear patch: $clearFrameGuidesPatch"
}

if (-not (Test-Path $splitLongFramePatch)) {
  throw "Missing long frame split patch: $splitLongFramePatch"
}

if (-not (Test-Path $copyPrototypeLinkPatch)) {
  throw "Missing copy prototype link patch: $copyPrototypeLinkPatch"
}

if (-not (Test-Path $aiColorExtractPatch)) {
  throw "Missing AI color extract patch: $aiColorExtractPatch"
}

$hasOriginalImageDownloadPatch = Test-Path $originalImageDownloadPatch
if (-not (Test-Path $aiImageSharedBridgePatch)) {
  throw "Missing AI image shared bridge patch: $aiImageSharedBridgePatch"
}

if (-not (Test-Path $uiSource)) {
  throw "Missing UI source: $uiSource"
}

$uiSourceText = [System.IO.File]::ReadAllText($uiSource, [System.Text.Encoding]::UTF8)

if ((-not $hasOriginalImageDownloadPatch) -and $uiSourceText.Contains("run-original-image-download")) {
  throw "UI still references original image download, but the source patch is missing: $originalImageDownloadPatch"
}

if (-not (Test-Path $pdfJsInlineAssetCleanup)) {
  throw "Missing PDF.js inline asset cleanup script: $pdfJsInlineAssetCleanup"
}

if (-not (Test-Path $ghostscriptInlineAssetCleanup)) {
  throw "Missing Ghostscript inline asset cleanup script: $ghostscriptInlineAssetCleanup"
}

if (-not (Test-Path $gifEncoderInlineAssetSync)) {
  throw "Missing GIF encoder inline asset sync script: $gifEncoderInlineAssetSync"
}

if (-not (Test-Path $apngInlineAssetSync)) {
  throw "Missing APNG inline asset sync script: $apngInlineAssetSync"
}

if (-not (Test-Path $presentationInlineAssetSync)) {
  throw "Missing presentation inline asset sync script: $presentationInlineAssetSync"
}

if (-not (Test-Path $uiExternalizer)) {
  throw "Missing UI externalizer script: $uiExternalizer"
}

if (-not (Test-Path $uiVerifier)) {
  throw "Missing UI verifier script: $uiVerifier"
}

if (-not (Test-Path $textGuardContract)) {
  throw "Missing text import guard contract: $textGuardContract"
}

if (-not (Test-Path $textGuardVerifier)) {
  throw "Missing text import guard verifier: $textGuardVerifier"
}

if (-not (Test-Path $textExportGuardContract)) {
  throw "Missing text export guard contract: $textExportGuardContract"
}

if (-not (Test-Path $textExportGuardVerifier)) {
  throw "Missing text export guard verifier: $textExportGuardVerifier"
}

if (-not (Test-Path $textHighlightBoundsContract)) {
  throw "Missing text highlight bounds contract: $textHighlightBoundsContract"
}

if (-not (Test-Path $textHighlightBoundsVerifier)) {
  throw "Missing text highlight bounds verifier: $textHighlightBoundsVerifier"
}

if (-not (Test-Path $exportBoundaryContract)) {
  throw "Missing export boundary contract: $exportBoundaryContract"
}

if (-not (Test-Path $exportBoundaryVerifier)) {
  throw "Missing export boundary verifier: $exportBoundaryVerifier"
}

if (-not (Test-Path $shapeLayerExportContract)) {
  throw "Missing PSD shape layer export contract: $shapeLayerExportContract"
}

if (-not (Test-Path $shapeLayerExportVerifier)) {
  throw "Missing PSD shape layer export verifier: $shapeLayerExportVerifier"
}

if (-not (Test-Path $figmaRuntimeSyntaxVerifier)) {
  throw "Missing Figma runtime syntax verifier: $figmaRuntimeSyntaxVerifier"
}

if (-not (Test-Path $messageHandlerVerifier)) {
  throw "Missing message handler verifier: $messageHandlerVerifier"
}

if (-not (Test-Path $uiRuntimeMessageVerifier)) {
  throw "Missing UI/runtime message verifier: $uiRuntimeMessageVerifier"
}

if (-not (Test-Path $uiSourceBoundaryVerifier)) {
  throw "Missing UI source boundary verifier: $uiSourceBoundaryVerifier"
}

& node $pdfJsInlineAssetCleanup
if ($LASTEXITCODE -ne 0) {
  throw "Failed to remove inline PDF.js assets from ui.html"
}

& node $ghostscriptInlineAssetCleanup
if ($LASTEXITCODE -ne 0) {
  throw "Failed to remove inline Ghostscript assets from ui.html"
}

& node $gifEncoderInlineAssetSync
if ($LASTEXITCODE -ne 0) {
  throw "Failed to sync inline GIF encoder assets into ui.html"
}

& node $apngInlineAssetSync
if ($LASTEXITCODE -ne 0) {
  throw "Failed to sync inline APNG assets into ui.html"
}

& node $presentationInlineAssetSync
if ($LASTEXITCODE -ne 0) {
  throw "Failed to sync inline presentation import runtime into ui.html"
}

& node $uiExternalizer $source
if ($LASTEXITCODE -ne 0) {
  throw "Failed to externalize embedded UI in $source"
}

& node $uiVerifier $source
if ($LASTEXITCODE -ne 0) {
  throw "UI externalization verification failed for $source"
}

$runtimeSyntaxSourceFiles = @(
  $patch,
  $exportPatch,
  $shapeLayerExportPatch,
  $aiSettingsPatch,
  $pigmaWebIntegrationPatch,
  $aiResponsiveMemoryPatch,
  $aiResponsivePairAnalyzerPatch,
  $aiLlmClientPatch,
  $aiDesignChatPatch,
  $aiAccessibilityDiagnosisPatch,
  $aiDesignConsistencyPatch,
  $aiTypoAuditPatch,
  $aiPixelPerfectPatch,
  $skewTransformPatch,
  $cornerRadiusAdjustPatch,
  $buttonTextAutoSizePatch,
  $selectAllTextPatch,
  $selectColorMatchesPatch,
  $textLineHeightAdjustPatch,
  $unlockLockedLayersPatch,
  $detachLinkedComponentsPatch,
  $autoLayoutOffPatch,
  $deleteHiddenLayersPatch,
  $clearFrameGuidesPatch,
  $splitLongFramePatch,
  $copyPrototypeLinkPatch,
  $aiColorExtractPatch,
  $aiImageSharedBridgePatch
)

if ($hasOriginalImageDownloadPatch) {
  $runtimeSyntaxSourceFiles += $originalImageDownloadPatch
}

& node $figmaRuntimeSyntaxVerifier @runtimeSyntaxSourceFiles
if ($LASTEXITCODE -ne 0) {
  throw "Figma runtime syntax verification failed for source patches."
}

& node $messageHandlerVerifier
if ($LASTEXITCODE -ne 0) {
  throw "Message handler pass-through verification failed."
}

& node $uiRuntimeMessageVerifier
if ($LASTEXITCODE -ne 0) {
  throw "UI/runtime message type verification failed."
}

& node $uiSourceBoundaryVerifier
if ($LASTEXITCODE -ne 0) {
  throw "UI source boundary verification failed."
}

function Replace-Exact {
  param(
    [string]$Text,
    [string]$Find,
    [string]$Replace,
    [int]$ExpectedCount,
    [string]$Label
  )

  $count = [regex]::Matches($Text, [regex]::Escape($Find)).Count
  if ($count -ne $ExpectedCount) {
    throw "Expected $ExpectedCount occurrence(s) for $Label but found $count."
  }

  return $Text.Replace($Find, $Replace)
}

function Replace-Section {
  param(
    [string]$Text,
    [string]$StartMarker,
    [string]$EndMarker,
    [string]$Replacement,
    [string]$Label
  )

  $start = $Text.IndexOf($StartMarker)
  if ($start -lt 0) {
    throw "Could not find start marker for $Label."
  }

  $end = $Text.IndexOf($EndMarker, $start + $StartMarker.Length)
  if ($end -lt 0) {
    throw "Could not find end marker for $Label."
  }

  return $Text.Substring(0, $start) + $Replacement + $Text.Substring($end)
}

function Convert-JsUnicodeEscapes {
  param([string]$Text)

  return [regex]::Replace($Text, '\\u([0-9A-Fa-f]{4})', {
    param($Match)
    [string][char]([Convert]::ToInt32($Match.Groups[1].Value, 16))
  })
}

function Collapse-RepeatedSnippetBeforeMarker {
  param(
    [string]$Text,
    [string]$Snippet,
    [string]$Marker
  )

  $pattern = '(?:' + [regex]::Escape($Snippet) + '){2,}(?=' + [regex]::Escape($Marker) + ')'
  return [regex]::Replace($Text, $pattern, $Snippet)
}

$fontPostScriptMapJson = "{}"
if (Test-Path $fontPostScriptMapBuilder) {
  $fontPostScriptMapOutput = & node $fontPostScriptMapBuilder 2>$null
  if ($LASTEXITCODE -eq 0) {
    $candidateFontPostScriptMapJson = ($fontPostScriptMapOutput -join "`n").Trim()
    if (-not [string]::IsNullOrWhiteSpace($candidateFontPostScriptMapJson) -and $candidateFontPostScriptMapJson.TrimStart().StartsWith("{")) {
      $fontPostScriptMapJson = $candidateFontPostScriptMapJson
    }
  }
}

$bundle = [System.IO.File]::ReadAllText($source, [System.Text.Encoding]::UTF8)

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'exportPackageMode:t.exportPackageMode==="bundle-with-rasters"||t.exportPackageMode==="psd-only"?t.exportPackageMode:A.exportPackageMode' `
  -Replace 'exportPackageMode:t.exportPackageMode==="bundle-with-rasters"||t.exportPackageMode==="psd-with-png"?"psd-with-png":t.exportPackageMode==="psd-with-jpg"||t.exportPackageMode==="psd-only"?t.exportPackageMode:A.exportPackageMode' `
  -ExpectedCount 1 `
  -Label 'PSD export package mode variants'

# Allow GROUP containers to reuse the same safe background-splitting path as
# frames when their own appearance can be separated from editable children.
$groupSplitEligibilityFind = 'So=new Set(["FRAME","SECTION","COMPONENT","INSTANCE"])'
$groupSplitEligibilityReplace = 'So=new Set(["GROUP","FRAME","SECTION","COMPONENT","INSTANCE"])'
if ($bundle.Contains($groupSplitEligibilityFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $groupSplitEligibilityFind `
    -Replace $groupSplitEligibilityReplace `
    -ExpectedCount 1 `
    -Label 'group split eligibility'
} elseif ($bundle.Contains($groupSplitEligibilityReplace)) {
  # Already patched in this bundle variant.
} else {
  # Group split eligibility changed in this bundle variant.
}

# Container shadows/glows should not force a full bitmap flatten when the
# exporter can preserve the child stack and carry the effect on the group
# itself. Keep flattening only for effects that must sample the full composite
# or backdrop, such as blur/noise/texture paths.
$containerShadowSplitFind = 'function Fe(e){return!V(e)||e.children.length===0?null:!yo.has(e.type)||re(e)||"clipsContent"in e&&e.clipsContent&&!ht(e)?"flatten":kr(e)?ze(e)||$e(L(e))||$i(L(e))?"flatten":So.has(e.type)&&Ur(e)?"split":"flatten":"group"}'
$containerShadowSplitReplace = 'function Fe(e){return!V(e)||e.children.length===0?null:!yo.has(e.type)||re(e)||"clipsContent"in e&&e.clipsContent&&!ht(e)?"flatten":kr(e)?ze(e)||$i(L(e))?"flatten":So.has(e.type)&&Ur(e)?"split":"flatten":"group"}'
if ($bundle.Contains($containerShadowSplitFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $containerShadowSplitFind `
    -Replace $containerShadowSplitReplace `
    -ExpectedCount 1 `
    -Label 'container shadow preserve split path'
} elseif ($bundle.Contains($containerShadowSplitReplace)) {
  # Already patched in this bundle variant.
} else {
  # Container split heuristic changed in this bundle variant.
}

# Root frames can produce a redundant full-document clip mask that is expensive
# for tall PSD exports while having no visible effect.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function ht(e){' `
  -Replace 'function redundantRootMask(e,t,r){if(e!==r)return!1;let o=gt(e,t);return!!o&&o.x===0&&o.y===0&&o.width===d(t.width)&&o.height===d(t.height)&&o.topLeftRadius===0&&o.topRightRadius===0&&o.bottomRightRadius===0&&o.bottomLeftRadius===0}function containerMask(e,t,r){return redundantRootMask(e,t,r)?null:gt(e,t)}function ht(e){' `
  -ExpectedCount 1 `
  -Label 'root mask helpers'

$selectionPreviewCacheFind = 'P=ne,G={},be=null,F=null,Qt=0;function er(e){'
$selectionPreviewCacheReplace = 'P=ne,G={},be=null,F=null,selectionPreviewCache=null,Qt=0;function er(e){'
if ($bundle.Contains($selectionPreviewCacheFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $selectionPreviewCacheFind `
    -Replace $selectionPreviewCacheReplace `
    -ExpectedCount 1 `
    -Label 'selection preview cache bootstrap'
} elseif ($bundle.Contains($selectionPreviewCacheReplace)) {
  # Already patched in this bundle variant.
} else {
  # Selection preview cache bootstrap changed in this bundle variant.
}

$selectionPreviewLogicFind = @'
function tr(e){return B(b({},e),{summary:w(P.locale,e.summary),detail:w(P.locale,e.detail),warnings:e.warnings.map(t=>w(P.locale,t))})}function rr(){
'@
$selectionPreviewLogicReplace = @'
function tr(e){return B(b({},e),{summary:w(P.locale,e.summary),detail:w(P.locale,e.detail),warnings:e.warnings.map(t=>w(P.locale,t))})}function buildSelectionPreviewEmptyState(e){return{ok:!1,state:{ready:!1,selectionId:null,selectionCount:0,selectionName:"",selectionType:null,summary:"Select one or more frames, groups, or layers to export.",detail:e.textExportMode==="rasterize-text"?"Text export is currently set to rasterize text, so text layers will export as bitmap layers until you change the export defaults.":"The exporter keeps editable text where possible, and multiple selected roots are packaged into a ZIP archive.",documentWidth:null,documentHeight:null,exportNodeCount:0,editableTextCount:0,preservedGroupCount:0,warnings:[],analysisPending:!1}}}function isSelectionPreviewHeavy(e){let t=xe(e);if(t){let r=d(t.width),o=d(t.height);if(o>=Do||r*o>=vo)return!0}if(!V(e)||e.children.length===0)return!1;let n=[e],i=0;for(;n.length>0;){let a=n.pop();if(i+=1,i>400)return!0;if(!V(a))continue;let s=a.children;if(!s||s.length===0)continue;if(s.length>120)return!0;for(let l=0;l<s.length;l+=1){let u=s[l];he(u)&&n.push(u)}}return!1}function shouldUseQuickSelectionPreview(e){if(e.length===0)return!1;if(e.length>=80)return!0;for(let t=0;t<e.length;t+=1)if(isSelectionPreviewHeavy(e[t]))return!0;return!1}function buildQuickSelectionResolution(){let e=figma.currentPage.selection,t=Tt(P.exportSettings),r=Jo(e,t);if(selectionPreviewCache&&selectionPreviewCache.cacheKey===r)return selectionPreviewCache.resolution;if(e.length===0){let y=buildSelectionPreviewEmptyState(t);return selectionPreviewCache={cacheKey:r,resolution:y},y}let o=[],n=[],i=e.length>=80;for(let y=0;y<e.length;y+=1){let m=e[y];if(!he(m)){let T={ok:!1,state:Ye(e,m,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};return selectionPreviewCache={cacheKey:r,resolution:T},T}let C=xe(m);if(!C){let T={ok:!1,state:Ye(e,m,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};return selectionPreviewCache={cacheKey:r,resolution:T},T}o.push(m),n.push(C),!i&&isSelectionPreviewHeavy(m)&&(i=!0)}let a=o[0],s=o.length,l=n[0],u=i?"Large selection detected. Pigma is showing a lightweight preview first to keep Figma responsive. Full layer analysis runs when export starts.":s===1?"Editable text is preserved when fills and typography are compatible. Hidden layers can be ignored or included as hidden PSD layers.":"Each selected root is exported as its own PSD file. When more than one file is ready, the download is packaged as a ZIP archive.",c=i?["Large selection detected. Detailed layer counts will load when export starts."]:[],p={ready:!0,selectionId:s===1?a.id:null,selectionCount:s,selectionName:no(o),selectionType:io(o),summary:s===1?'"'.concat(f(a),'" is ready to export.'):"".concat(s," roots selected and ready to export."),detail:u,documentWidth:s===1?d(l.width):null,documentHeight:s===1?d(l.height):null,exportNodeCount:s,editableTextCount:0,preservedGroupCount:0,warnings:c,analysisPending:i},g={ok:!0,nodes:o,state:p};return selectionPreviewCache={cacheKey:r,resolution:g},g}function buildStartupSelectionResolution(){let e=figma.currentPage.selection,t=Tt(P.exportSettings);if(e.length===0)return buildSelectionPreviewEmptyState(t);let r=[],o=[],n=null;for(let i=0;i<e.length;i+=1){let a=e[i];if(!he(a)){n={ok:!1,state:Ye(e,a,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};break}let s=xe(a);if(!s){n={ok:!1,state:Ye(e,a,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};break}r.push(a),o.push(s)}if(n)return n;let i=r[0],a=r.length,s=o[0];return{ok:!0,nodes:r,state:{ready:!0,selectionId:a===1?i.id:null,selectionCount:a,selectionName:no(r),selectionType:io(r),summary:a===1?'"'.concat(f(i),'" is ready to export.'):"".concat(a," roots selected and ready to export."),detail:"Startup preview keeps the selection summary lightweight. Full layer analysis runs when export starts or when the selection changes.",documentWidth:a===1?d(s.width):null,documentHeight:a===1?d(s.height):null,exportNodeCount:a,editableTextCount:0,preservedGroupCount:0,warnings:["Detailed layer counts are deferred until export starts or the selection changes."],analysisPending:!0}}}function selectionResolutionForUi(){let e=figma.currentPage.selection;return shouldUseQuickSelectionPreview(e)?buildQuickSelectionResolution():rr()}function rr(){
'@
if ($bundle.Contains($selectionPreviewLogicFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $selectionPreviewLogicFind `
    -Replace $selectionPreviewLogicReplace `
    -ExpectedCount 1 `
    -Label 'selection preview guard helpers'
} elseif ($bundle.Contains($selectionPreviewLogicReplace)) {
  # Already patched in this bundle variant.
} else {
  # Selection preview guard helpers changed in this bundle variant.
}

$largeSelectionPreviewFastPathFind = 'if(e.length===0){let y=buildSelectionPreviewEmptyState(t);return selectionPreviewCache={cacheKey:r,resolution:y},y}let o=[],n=[],i=e.length>=80;for(let y=0;y<e.length;y+=1){'
$largeSelectionPreviewFastPathReplace = 'if(e.length===0){let y=buildSelectionPreviewEmptyState(t);return selectionPreviewCache={cacheKey:r,resolution:y},y}if(e.length>=80){let y=e[0],m=e.length,T="Large selection detected. Pigma is showing a lightweight preview first to keep Figma responsive. Full layer analysis runs when export starts.",C={ok:!0,nodes:e,state:{ready:!0,selectionId:null,selectionCount:m,selectionName:y?f(y):"",selectionType:y?String(y.type||"MIXED")+" x "+m:null,summary:"".concat(m," roots selected and ready to export."),detail:T,documentWidth:null,documentHeight:null,exportNodeCount:m,editableTextCount:0,preservedGroupCount:0,warnings:["Large selection detected. Detailed layer counts will load when export starts."],analysisPending:!0}};return selectionPreviewCache={cacheKey:r,resolution:C},C}let o=[],n=[],i=!1;for(let y=0;y<e.length;y+=1){'
if ($bundle.Contains($largeSelectionPreviewFastPathFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $largeSelectionPreviewFastPathFind `
    -Replace $largeSelectionPreviewFastPathReplace `
    -ExpectedCount 1 `
    -Label 'large selection preview fast path'
} elseif ($bundle.Contains($largeSelectionPreviewFastPathReplace)) {
  # Already patched in this bundle variant.
} else {
  # Large selection preview fast path changed in this bundle variant.
}

$selectionPreviewDispatchFind = 'function Ee(){let e=rr();N({type:"selection-state",state:tr(e.state)})}function le(){Qt+=1,F=null}'
$selectionPreviewDispatchReplace = 'function pigmaSelectionDebugState(e){try{let t=figma.currentPage.selection||[],r=t[0],o=r?f(r):"",n=r?r.type:"",i=figma.currentPage&&figma.currentPage.name?figma.currentPage.name:"";return B(b({},e),{detail:"[debug 0429 selection api=".concat(t.length," page=").concat(i," first=").concat(o||"-"," type=").concat(n||"-","] ").concat(e.detail||""),warnings:e.warnings})}catch(t){return B(b({},e),{detail:"[debug 0429 selection read error] ".concat(e.detail||"")})}}function Ee(){let e=selectionResolutionForUi();N({type:"selection-state",state:pigmaSelectionDebugState(tr(e.state))})}function le(){Qt+=1,F=null,selectionPreviewCache=null}function pigmaRefreshRuntimeCaches(){le(),be=null,je.clear(),We=null,Ze=null}'
if ($bundle.Contains($selectionPreviewDispatchFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $selectionPreviewDispatchFind `
    -Replace $selectionPreviewDispatchReplace `
    -ExpectedCount 1 `
    -Label 'selection preview dispatch guard'
} elseif ($bundle.Contains($selectionPreviewDispatchReplace)) {
  # Already patched in this bundle variant.
} else {
  # Selection preview dispatch guard changed in this bundle variant.
}

$startupPreviewRequestFind = 'async function Go(e){var t;if(e.type==="request-preferences"){await zo(e.detectedLocale),Ot(),Ee();return}if(e.type==="update-preferences"){await _o(e.preferences),Ot(),Ee();return}if(e.type==="request-selection-sync"){Ee();return}'
$startupPreviewRequestReplace = 'var pigmaSelectionAccessPromise=null,pigmaSelectionAccessReady=!1;function pigmaStartSelectionAccessPreload(){if(pigmaSelectionAccessReady||typeof figma.loadAllPagesAsync!="function")return Promise.resolve();if(!pigmaSelectionAccessPromise)pigmaSelectionAccessPromise=figma.loadAllPagesAsync().then(()=>{pigmaSelectionAccessReady=!0}).catch(e=>{pigmaSelectionAccessPromise=null,console.warn("[pigma] selection page access preload failed:",e)});return pigmaSelectionAccessPromise}async function pigmaEnsureSelectionAccess(){await pigmaStartSelectionAccessPreload()}async function Go(e){var t,r;if(e.type==="request-preferences"){pigmaStartSelectionAccessPreload(),await zo(e.detectedLocale),Ot(),r=buildStartupSelectionResolution(),N({type:"selection-state",state:typeof pigmaSelectionDebugState=="function"?pigmaSelectionDebugState(tr(r.state)):tr(r.state)});return}if(e.type==="update-preferences"){pigmaStartSelectionAccessPreload(),await _o(e.preferences),Ot(),Ee();return}if(e.type==="request-selection-sync"){pigmaStartSelectionAccessPreload(),Ee();return}'
if ($bundle.Contains($startupPreviewRequestFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $startupPreviewRequestFind `
    -Replace $startupPreviewRequestReplace `
    -ExpectedCount 1 `
    -Label 'startup preview request guard'
} elseif ($bundle.Contains($startupPreviewRequestReplace)) {
  # Already patched in this bundle variant.
} else {
  # Startup preview request guard changed in this bundle variant.
}

$runtimeCacheRefreshFind = 'if(e.type==="request-selection-sync"){pigmaStartSelectionAccessPreload(),Ee();return}if(e.type==="request-export"){await Qo('
$runtimeCacheRefreshReplace = 'if(e.type==="request-selection-sync"){pigmaStartSelectionAccessPreload(),Ee();return}if(e.type==="request-runtime-cache-refresh"){pigmaRefreshRuntimeCaches(),Ee();return}if(e.type==="request-export-cancel"){pigmaCancelActiveExport();return}if(e.type==="request-export"){pigmaRefreshRuntimeCaches(),await Qo('
if ($bundle.Contains($runtimeCacheRefreshFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $runtimeCacheRefreshFind `
    -Replace $runtimeCacheRefreshReplace `
    -ExpectedCount 1 `
    -Label 'runtime cache refresh before export'
} elseif ($bundle.Contains($runtimeCacheRefreshReplace)) {
  # Already patched in this bundle variant.
} else {
  # Runtime cache refresh request guard changed in this bundle variant.
}

$exportCancelHelperFind = 'function N(e){S.postToUi(e)}'
$exportCancelHelperReplace = 'function N(e){S.postToUi(e)}function pigmaExportCancelMessage(){return w(P.locale,"PSD \uB9CC\uB4E4\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.")}function pigmaCancelActiveExport(){var e;let t=be;if(!t)return;t.cancelRequested=!0,t.cancelNotified=!0,be=null,Qe(),le();let r=pigmaExportCancelMessage();N({type:"export-error",message:r,cancelled:!0}),(e=S.notify)==null||e.call(S,r)}function pigmaExportWasCancelled(e){return!!(e&&e.cancelRequested)}function pigmaCleanupCancelledExport(e,t=null){try{t&&qe(t)}catch(r){}Qe(),le();return!0}'
if ($bundle.Contains($exportCancelHelperFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $exportCancelHelperFind `
    -Replace $exportCancelHelperReplace `
    -ExpectedCount 1 `
    -Label 'PSD export cancel helper'
} elseif ($bundle.Contains($exportCancelHelperReplace)) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch PSD export cancel helper.'
}

$figmaColorBurnBlendFind = 'case"COLOR_BURN":return"color burn"'
$figmaColorBurnBlendReplace = 'case"COLOR_BURN":return"linear burn"'
if ($bundle.Contains($figmaColorBurnBlendFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $figmaColorBurnBlendFind `
    -Replace $figmaColorBurnBlendReplace `
    -ExpectedCount 1 `
    -Label 'Figma color burn uses Photoshop linear burn with opacity compensation'
} elseif ($bundle.Contains($figmaColorBurnBlendReplace)) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch Figma color burn blend mapping.'
}

$figmaColorBurnLayerOpacityFind = 'function j(e){return!("opacity"in e)||typeof e.opacity!="number"?1:h(e.opacity,0,1)}'
$figmaColorBurnLayerOpacityReplace = 'function j(e){let t=!("opacity"in e)||typeof e.opacity!="number"?1:h(e.opacity,0,1);return h(t*(e&&e.blendMode==="COLOR_BURN"?.875:1),0,1)}'
if ($bundle.Contains($figmaColorBurnLayerOpacityFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $figmaColorBurnLayerOpacityFind `
    -Replace $figmaColorBurnLayerOpacityReplace `
    -ExpectedCount 1 `
    -Label 'Figma color burn layer opacity compensation'
} elseif ($bundle.Contains($figmaColorBurnLayerOpacityReplace)) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch Figma color burn layer opacity compensation.'
}

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'mask:gt(e,t.documentBounds)' `
  -Replace 'mask:containerMask(e,t.documentBounds,t.root)' `
  -ExpectedCount 2 `
  -Label 'root frame mask usage'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'mask:gt(l,t.documentBounds)' `
  -Replace 'mask:containerMask(l,t.documentBounds,t.root)' `
  -ExpectedCount 1 `
  -Label 'group-preserving frame mask usage'

# Keep transformed masks aligned to their original transform by exporting them
# inside a temporary crop frame. Using the visual bounds as the clone origin
# shifts rotated alpha masks and vector masks.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Ei(e,t,r,o){await dt(e);let n=e.clone();try{return Pi(n,o),bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}finally{n.removed||n.remove()}}' `
  -Replace 'async function Ei(e,t,r,o){await dt(e);let n=e.clone(),i=null;try{if(Pi(n,o),"absoluteTransform"in e&&"relativeTransform"in n){i=figma.createFrame(),i.resize(Math.max(1,d(t.width)),Math.max(1,d(t.height))),i.clipsContent=!0,i.fills=[],i.strokes=[],i.name="__pigma-mask-preview__",i.x=t.x,i.y=t.y,figma.currentPage.appendChild(i),i.appendChild(n),Vr(e,n,t);return await i.exportAsync({format:"PNG",useAbsoluteBounds:!1})}return bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}finally{i&&!i.removed&&i.remove(),n.removed||n.remove()}}' `
  -ExpectedCount 1 `
  -Label 'transformed mask export alignment'

# Alpha masks that also carry layer blur can still clip at the raw render
# bounds because Figma's mask preview bounds are often tighter than the soft
# alpha falloff. Expand the exported mask bounds by the normalized blur radius
# so Photoshop receives the full soft-mask image instead of a hard-cropped one.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function xt(e){if(!("maskType"in e))return"alpha";switch(e.maskType){case"VECTOR":return"vector";case"LUMINANCE":return"luminance";default:return"alpha"}}function Lr(e,t){if(t!=="vector")return v(e);let r=k(e);if(r&&r.width>0&&r.height>0)return{x:r.x,y:r.y,width:r.width,height:r.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let o=ce(e);if(o)return o}return v(e)}' `
  -Replace 'function xt(e){if(!("maskType"in e))return"alpha";switch(e.maskType){case"VECTOR":return"vector";case"LUMINANCE":return"luminance";default:return"alpha"}}function maskPreviewPaddingRadius(e){let t=L(e),r=0;if(t)for(let o of t)o&&o.style==="layer-blur"&&(r=Math.max(r,o.blurType==="PROGRESSIVE"?Math.max(o.startRadius,o.radius):o.radius));return r<=.01?0:Math.ceil(h(r*2.5+8,8,256))}function padExportBounds(e,t){return!e||t<=0?e:{x:e.x-t,y:e.y-t,width:e.width+t*2,height:e.height+t*2,useAbsoluteBounds:!1}}function Lr(e,t){let r=maskPreviewPaddingRadius(e),o=null;if(t!=="vector")return padExportBounds(v(e),r);let n=k(e);if(n&&n.width>0&&n.height>0)o={x:n.x,y:n.y,width:n.width,height:n.height,useAbsoluteBounds:!0};else if("absoluteTransform"in e&&"width"in e&&"height"in e){let i=ce(e);i&&(o=i)}return padExportBounds(o!=null?o:v(e),r)}' `
  -ExpectedCount 1 `
  -Label 'mask preview blur padding'

# Clone exports that use render bounds must keep the original transform inside
# a temporary crop frame. Moving the clone itself to the render-bound origin
# shifts blurred/blended vector and shape layers by the blur padding.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function $r(e,t,r,o){await dt(e);let n=e.clone();try{return Oe(n,o),bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}finally{n.removed||n.remove()}}' `
  -Replace 'async function $r(e,t,r,o){await dt(e);let n=e.clone(),i=null,a=t&&t.useAbsoluteBounds===!1;try{return Oe(n,o),a?(i=figma.createFrame(),i.resize(Math.max(1,d(t.width)),Math.max(1,d(t.height))),i.clipsContent=!0,i.fills=[],i.strokes=[],i.name="__pigma-render-preview__",i.x=t.x,i.y=t.y,figma.currentPage.appendChild(i),i.appendChild(n),Vr(e,n,t),await i.exportAsync({format:"PNG",useAbsoluteBounds:!1})):(bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds}))}finally{i&&!i.removed&&i.remove(),n.removed||n.remove()}}' `
  -ExpectedCount 1 `
  -Label 'render-bound clone crop-frame export'

# Preserve simple frame fills/strokes as editable PSD shape backgrounds even when
# the document switches to long-frame mode.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'let n=Fr(e,t);return!n||r.longFrameMode&&Ne(d(n.width),d(n.height),!1)||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:n.x,y:n.y,width:n.width,height:n.height,nodeTransform:null,shape:n,fill:o.fill,stroke:o.stroke}}' `
  -Replace 'let n=Fr(e,t);return!n||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:n.x,y:n.y,width:n.width,height:n.height,nodeTransform:null,shape:n,fill:o.fill,stroke:o.stroke}}' `
  -ExpectedCount 1 `
  -Label 'long-frame background shape preservation'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function An(e,t,r){if(fe(e)||!pigmaIsShapeBackgroundTransformSafe(e))return null;let o=Di(e);if(!o)return null;let n=Fr(e,t);return!n||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:n.x,y:n.y,width:n.width,height:n.height,nodeTransform:null,shape:n,fill:o.fill,stroke:o.stroke}}' `
  -Replace 'function An(e,t,r){if(fe(e)||!pigmaIsShapeBackgroundTransformSafe(e)||pigmaStrokeRequiresSvg(e))return null;let o=Di(e),n=oa(e),i=n&&((n.normalizePaintOpacity===!0)||(n.normalizePaintBlendMode===!0))?n:null;if(!o)return null;let a=Fr(e,t);return!a||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:i?i.effectiveOpacity:1,visible:!0,blendMode:at(i?i.effectiveBlendMode:"normal"),effects:null,strokeEffect:null,x:a.x,y:a.y,width:a.width,height:a.height,nodeTransform:null,shape:a,fill:o.fill,stroke:o.stroke}}' `
  -ExpectedCount 1 `
  -Label 'background shape fill blend promotion'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'Math.abs(n)<=.001}function Ln(e){' `
  -Replace 'Math.abs(n)<=.001}function pigmaShouldFlattenTransformedClipContainer(e){return V(e)&&e.children&&e.children.length>0&&"clipsContent"in e&&e.clipsContent===!0&&!pigmaIsShapeBackgroundTransformSafe(e)}function Ln(e){' `
  -ExpectedCount 1 `
  -Label 'transformed clipping container flatten helper'

# Preserve Figma gradient handle geometry in the shape fill payload. The UI-side
# PSD writer turns these normalized handle positions into Photoshop angle,
# offset, and scale values so shortened or shifted gradients keep their spacing.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function Ci(e){return e.type==="GRADIENT_LINEAR"||e.type==="GRADIENT_RADIAL"||e.type==="GRADIENT_ANGULAR"||e.type==="GRADIENT_DIAMOND"}function ki(e){var n;if(!Array.isArray(e.gradientStops)||e.gradientStops.length<2)return null;let t=Mi(e.gradientTransform);if(!t)return null;let r=h((n=e.opacity)!=null?n:1,0,1),o=e.gradientStops.slice().sort((i,a)=>i.position-a.position);return{kind:"gradient",gradientType:Bi(e.type),transform:t,colorStops:o.map(i=>({position:h(i.position,0,1),color:ee({r:i.color.r,g:i.color.g,b:i.color.b,a:1})})),opacityStops:o.map(i=>({position:h(i.position,0,1),opacity:h(i.color.a*r,0,1)}))}}function Bi(e){switch(e){case"GRADIENT_LINEAR":return"linear";case"GRADIENT_RADIAL":return"radial";case"GRADIENT_ANGULAR":return"angular";case"GRADIENT_DIAMOND":return"diamond";default:return"linear"}}function Mi(e){if(!Array.isArray(e)||e.length!==2||!Array.isArray(e[0])||!Array.isArray(e[1])||e[0].length!==3||e[1].length!==3)return null;let t=[D(e[0][0]),D(e[1][0]),D(e[0][1]),D(e[1][1]),D(e[0][2]),D(e[1][2])];return t.every(r=>Number.isFinite(r))?t:null}' `
  -Replace 'function Ci(e){return e.type==="GRADIENT_LINEAR"||e.type==="GRADIENT_RADIAL"||e.type==="GRADIENT_ANGULAR"||e.type==="GRADIENT_DIAMOND"}function ki(e){var n;if(!Array.isArray(e.gradientStops)||e.gradientStops.length<2)return null;let t=Mi(e.gradientTransform);if(!t)return null;let r=h((n=e.opacity)!=null?n:1,0,1),o=e.gradientStops.slice().sort((i,a)=>i.position-a.position),s=pigmaGradientHandlePositions(t);return{kind:"gradient",gradientType:Bi(e.type),transform:t,handlePositions:s,colorStops:o.map(i=>({position:h(i.position,0,1),color:ee({r:i.color.r,g:i.color.g,b:i.color.b,a:1})})),opacityStops:o.map(i=>({position:h(i.position,0,1),opacity:h(i.color.a*r,0,1)}))}}function pigmaInvertGradientTransform(e){let[t,n,r,i,a,o]=e,s=t*i-n*r;return Math.abs(s)<1e-6?null:[i/s,-n/s,-r/s,t/s,(r*o-i*a)/s,(n*a-t*o)/s]}function pigmaTransformGradientPoint(e,t,n){let[r,i,a,o,s,l]=e;return{x:D(r*t+a*n+s),y:D(i*t+o*n+l)}}function pigmaGradientHandlePositions(e){let t=pigmaInvertGradientTransform(e);return t?[pigmaTransformGradientPoint(t,0,.5),pigmaTransformGradientPoint(t,1,.5),pigmaTransformGradientPoint(t,0,1)]:null}function Bi(e){switch(e){case"GRADIENT_LINEAR":return"linear";case"GRADIENT_RADIAL":return"radial";case"GRADIENT_ANGULAR":return"angular";case"GRADIENT_DIAMOND":return"diamond";default:return"linear"}}function Mi(e){if(!Array.isArray(e)||e.length!==2||!Array.isArray(e[0])||!Array.isArray(e[1])||e[0].length!==3||e[1].length!==3)return null;let t=[D(e[0][0]),D(e[1][0]),D(e[0][1]),D(e[1][1]),D(e[0][2]),D(e[1][2])];return t.every(r=>Number.isFinite(r))?t:null}' `
  -ExpectedCount 1 `
  -Label 'main gradient handle geometry metadata'

# Keep Figma dashed strokes attached to PSD shape metadata and fallback shape
# previews. Leaf vector/stroke-only layers are bitmap-preserved, but simple
# background shapes can still travel through vectorStroke.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function Di(e){if(te(e))return null;let t="fills"in e&&Array.isArray(e.fills)?wi(e.fills):null,r="strokes"in e&&Array.isArray(e.strokes)?Gr(e.strokes):null,o=null;if(r){let n=Jr(e);if(n===null)return null;o={kind:"solid",color:Ge(r),width:n,position:Or(e)}}return!t&&!o?null:{fill:t,stroke:o}}' `
  -Replace 'function pigmaDashPattern(e){if(!e||!Array.isArray(e.dashPattern))return null;let t=e.dashPattern.map(r=>Number(r)).filter(r=>Number.isFinite(r)&&r>0);return t.length>0?t:null}function pigmaStrokeCapRequiresSvg(e){if(!e||!("strokeCap"in e))return!1;let t=String(e.strokeCap||"NONE").toUpperCase();return t!=="NONE"&&t!=="BUTT"}function pigmaStrokeJoinRequiresSvg(e){if(!e||!("strokeJoin"in e))return!1;let t=String(e.strokeJoin||"MITER").toUpperCase();return t!=="MITER"}function pigmaStrokeRequiresSvg(e){let t="strokes"in e&&Array.isArray(e.strokes)?Gr(e.strokes):null;return!!t&&(!!pigmaDashPattern(e)||pigmaStrokeCapRequiresSvg(e)||pigmaStrokeJoinRequiresSvg(e))}function Di(e){if(te(e))return null;let t="fills"in e&&Array.isArray(e.fills)?wi(e.fills):null,r="strokes"in e&&Array.isArray(e.strokes)?Gr(e.strokes):null,o=null;if(r){let n=Jr(e);if(n===null)return null;o={kind:"solid",color:Ge(r),width:n,position:Or(e),dashPattern:pigmaDashPattern(e)}}return!t&&!o?null:{fill:t,stroke:o}}' `
  -ExpectedCount 1 `
  -Label 'main dashed shape stroke metadata'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function me(e){if(!("strokes"in e)||!Array.isArray(e.strokes))return null;let t=Gr(e.strokes);if(!t)return null;let r=Jr(e);return r===null?null:{blendMode:oe(t.blendMode),color:Ge(t),width:r,position:Or(e)}}' `
  -Replace 'function me(e){if(!("strokes"in e)||!Array.isArray(e.strokes))return null;let t=Gr(e.strokes);if(!t)return null;let r=Jr(e);return r===null?null:{blendMode:oe(t.blendMode),color:Ge(t),width:r,position:Or(e),dashPattern:pigmaDashPattern(e)}}' `
  -ExpectedCount 1 `
  -Label 'main dashed stroke effect metadata'

# Reuse the export-session analysis we already computed for the current selection
# instead of recomputing bounds and layer counts again for each root.
$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function Qo(' `
  -EndMarker 'async function en(' `
  -Replacement 'async function Qo(e,t,r,o){var l;let n=Uo(o);P=b(b({},P),{exportSettings:Tt(t)});let i=rr();if(!i.ok){Qe(),le();let u=tr(i.state);N({type:"export-error",message:u.summary}),(l=S.notify)==null||l.call(S,u.summary,{error:!0});return}let a=i.nodes.length,s=xa(i.nodes,t);be={nodes:i.nodes,roots:i.roots,hiddenLayerMode:e,settings:t,includeCompositePng:r,developerExportExperiments:n,rootCount:a,bundleFileName:s,nextIndex:0,singlePayloadSummary:null},ae("session-start",{rootCount:a,includeCompositePng:r,developerExportExperiments:n}),N({type:"export-bundle-started",fileName:s,rootCount:a}),await se()}' `
  -Label 'export session cache reuse'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'y={ok:!0,nodes:o.map(m=>m.node),state:g}' `
  -Replace 'y={ok:!0,nodes:o.map(m=>m.node),roots:o,state:g}' `
  -ExpectedCount 1 `
  -Label 'selection analysis roots payload'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function se(){' `
  -EndMarker 'async function Nn(' `
  -Replacement 'async function se(){var n,i,a;let e=be;if(!e)return;O=e.developerExportExperiments;let t=e.nextIndex;if(t>=e.rootCount){N({type:"export-finished",fileName:e.bundleFileName,rootCount:e.rootCount}),e.rootCount===1&&e.singlePayloadSummary?(n=S.notify)==null||n.call(S,w(P.locale,"PSD ready: ".concat(e.singlePayloadSummary.exportNodeCount," layers, ").concat(e.singlePayloadSummary.editableTextCount," text candidates"))):(i=S.notify)==null||i.call(S,w(P.locale,"".concat(e.rootCount," PSD files are ready. The download will be packaged as a ZIP archive."))),be=null,Qe(),le();return}let r=(e.roots||e.nodes)[t],o="node"in r?r.node:r,s="node"in r?r:null,u=f(o);ae("build-marker",{patch:"root-preserved-20260319-1949",main:"code.patched.js"});try{let l=await Dn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,s);e.rootCount===1&&(e.singlePayloadSummary={exportNodeCount:l.exportNodeCount,editableTextCount:l.editableTextCount});let c=Xe(l);e.nextIndex+=1,N({type:"export-root-ready",fileName:e.bundleFileName,rootIndex:t+1,rootCount:e.rootCount,payload:c}),qe(l),e.nextIndex>=e.rootCount&&await se()}catch(l){let c=await Nn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(c){e.rootCount===1&&(e.singlePayloadSummary={exportNodeCount:c.exportNodeCount,editableTextCount:c.editableTextCount});let p=Xe(c);e.nextIndex+=1,N({type:"export-root-ready",fileName:e.bundleFileName,rootIndex:t+1,rootCount:e.rootCount,payload:p}),qe(c),e.nextIndex>=e.rootCount&&await se();return}let g=await Tn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(g){e.rootCount===1&&(e.singlePayloadSummary={exportNodeCount:g.exportNodeCount,editableTextCount:g.editableTextCount});let p=Xe(g);e.nextIndex+=1,N({type:"export-root-ready",fileName:e.bundleFileName,rootIndex:t+1,rootCount:e.rootCount,payload:p}),qe(g),e.nextIndex>=e.rootCount&&await se();return}be=null,Qe(),le();let y=w(P.locale,l instanceof Error?e.rootCount>1?''Export failed for "''.concat(u,''" ('').concat(t+1,"/").concat(e.rootCount,"): ").concat(l.message):l.message:"An unknown error happened while building the PSD.");N({type:"export-error",message:y}),(a=S.notify)==null||a.call(S,y,{error:!0})}}' `
  -Label 'export session dispatch'

$exportCancelSePatches = @(
  @{
    Find = 'let e=be;if(!e)return;O=e.developerExportExperiments;'
    Replace = 'let e=be;if(!e)return;if(pigmaExportWasCancelled(e)){pigmaCleanupCancelledExport(e);return}O=e.developerExportExperiments;'
    Label = 'export cancel check at session start'
  },
  @{
    Find = 'let t=e.nextIndex;if(t>=e.rootCount){'
    Replace = 'let t=e.nextIndex;if(pigmaExportWasCancelled(e)){pigmaCleanupCancelledExport(e);return}if(t>=e.rootCount){'
    Label = 'export cancel check before finish'
  },
  @{
    Find = 'let l=await Dn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,s);e.rootCount===1&&'
    Replace = 'let l=await Dn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,s);if(pigmaExportWasCancelled(e)){pigmaCleanupCancelledExport(e,l);return}e.rootCount===1&&'
    Label = 'export cancel check after primary root build'
  },
  @{
    Find = '}catch(l){let c=await Nn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(c){'
    Replace = '}catch(l){if(pigmaExportWasCancelled(e)){pigmaCleanupCancelledExport(e);return}let c=await Nn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(pigmaExportWasCancelled(e)){pigmaCleanupCancelledExport(e,c);return}if(c){'
    Label = 'export cancel check around safe layered retry'
  },
  @{
    Find = 'let g=await Tn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(g){'
    Replace = 'let g=await Tn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(pigmaExportWasCancelled(e)){pigmaCleanupCancelledExport(e,g);return}if(g){'
    Label = 'export cancel check after flattened retry'
  }
)

foreach ($cancelPatch in $exportCancelSePatches) {
  if ($bundle.Contains($cancelPatch.Find)) {
    $bundle = Replace-Exact `
      -Text $bundle `
      -Find $cancelPatch.Find `
      -Replace $cancelPatch.Replace `
      -ExpectedCount 1 `
      -Label $cancelPatch.Label
  } elseif (-not $bundle.Contains($cancelPatch.Replace)) {
    throw "Could not patch $($cancelPatch.Label)."
  }
}

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function Nn(' `
  -EndMarker 'async function Tn(' `
  -Replacement 'async function Nn(e,t,r,o,n,i,a,s=null){let l=s?s.documentBounds:xe(e);if(!l)return null;let u=s?s.analysis:Ie(e,t);return u.exportNodeCount===0||!ir(l,u.containsHeavyEffects)?null:await fr(e,t,r,o,n,i,u,a instanceof Error&&a.message.trim().length>0?a.message.trim():null,s)}' `
  -Label 'safe layered retry reuse'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function Tn(' `
  -EndMarker 'async function Dn(' `
  -Replacement 'async function Tn(e,t,r,o,n,i,a,s=null){let l=s?s.documentBounds:xe(e);if(!l)return null;let u=s?s.analysis:Ie(e,t);if(u.exportNodeCount===0||!nr(l,u.containsHeavyEffects))return null;let c=f(e),p=d(l.width),g=d(l.height),y=new Set(u.warnings);y.add(Xo(c,p,g)),y.add(Ko(c,a instanceof Error&&a.message.trim().length>0?a.message.trim():"unknown error")),N({type:"export-started",rootName:c,rootIndex:o,rootCount:n,total:1}),N({type:"export-progress",rootName:c,rootIndex:o,rootCount:n,current:1,total:1,layerName:c});let m=await e.exportAsync({format:"PNG",useAbsoluteBounds:l.useAbsoluteBounds});return{fileName:He(e,r,o,n),rootName:e.name||"Untitled",documentWidth:p,documentHeight:g,compositePngBytes:i?m:null,nodes:[{kind:"bitmap",id:"".concat(e.id,":safe-root"),name:c,sourceType:"".concat(e.type,"_SAFE_ROOT"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:0,y:0,width:p,height:g,nodeTransform:null,pngBytes:m}],warnings:Array.from(y),exportNodeCount:1,editableTextCount:0,preservedGroupCount:0,hasEditableText:!1,backgroundDebug:[]}}' `
  -Label 'safe flattened retry reuse'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function Dn(' `
  -EndMarker 'async function fr(' `
  -Replacement 'async function Dn(e,t,r,o,n,i,a=null){let s=Date.now(),l=a?a.documentBounds:xe(e);if(!l)throw new Error("Unable to calculate document bounds for the selected root.");let u=a?a.analysis:Ie(e,t);if(u.exportNodeCount===0)throw new Error(t==="ignore-hidden"?"No exportable layers remain after ignoring hidden layers.":"There are no visible exportable layers inside this selection.");let c=lt(l,u.containsHeavyEffects);ae("payload-start",{rootName:f(e),rootIndex:o,rootCount:n,includeCompositePng:i,exportNodeCount:u.exportNodeCount,documentWidth:d(l.width),documentHeight:d(l.height),longFrameMode:c});let p={root:e,documentBounds:l,totalLeaves:u.exportNodeCount,currentLeaf:0,warnings:new Set(u.warnings),editableTextCount:0,preservedGroupCount:0,hiddenLayerMode:t,settings:r,backgroundDebug:[],rootName:f(e),rootIndex:o,rootCount:n,lastProgressPostedAt:0,longFrameMode:c};c&&p.warnings.add(ut(d(l.width),d(l.height),u.containsHeavyEffects)),N({type:"export-started",rootName:p.rootName,rootIndex:p.rootIndex,rootCount:p.rootCount,total:p.totalLeaves});let g=mt(e,t),y=[];for(let m of g){let T=await ct(m,p);T&&y.push(T)}if(!y.length)throw new Error("The exporter could not produce any PSD layers from this selection.");ae("payload-nodes-built",{rootName:p.rootName,nodeCount:y.length,warningCount:p.warnings.size,editableTextCount:p.editableTextCount,durationMs:Date.now()-s});let C=i?await e.exportAsync({format:"PNG",useAbsoluteBounds:l.useAbsoluteBounds}):null;return C&&ae("payload-composite-exported",{rootName:p.rootName,bytes:C.byteLength,durationMs:Date.now()-s}),{fileName:He(e,r,o,n),rootName:e.name||"Untitled",documentWidth:d(l.width),documentHeight:d(l.height),compositePngBytes:C,nodes:y,warnings:Array.from(p.warnings),exportNodeCount:p.totalLeaves,editableTextCount:p.editableTextCount,preservedGroupCount:p.preservedGroupCount,hasEditableText:p.editableTextCount>0,backgroundDebug:p.backgroundDebug}}' `
  -Label 'main export reuse'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function fr(' `
  -EndMarker 'async function mr(' `
  -Replacement 'async function fr(e,t,r,o,n,i,a,s=null,l=null){let u=l?l.documentBounds:xe(e);if(!u)throw new Error("Unable to calculate document bounds for the selected root.");let c=lt(u,a.containsHeavyEffects),p=f(e),g=d(u.width),y=d(u.height),m=new Set(a.warnings);m.add(Wo(p,g,y)),s&&m.add(Zo(p,s));let T={root:e,documentBounds:u,totalLeaves:a.exportNodeCount,currentLeaf:0,warnings:m,editableTextCount:0,preservedGroupCount:0,hiddenLayerMode:t,settings:r,backgroundDebug:[],rootName:p,rootIndex:o,rootCount:n,lastProgressPostedAt:0,longFrameMode:c};c&&T.warnings.add(ut(g,y,a.containsHeavyEffects)),ae("payload-safe-layered-start",{rootName:p,rootIndex:o,rootCount:n,includeCompositePng:i,exportNodeCount:a.exportNodeCount,documentWidth:g,documentHeight:y,longFrameMode:c}),N({type:"export-started",rootName:T.rootName,rootIndex:T.rootIndex,rootCount:T.rootCount,total:T.totalLeaves});let C=t==="ignore-hidden"&&!q(e)?[]:[e];ae("payload-safe-layered-entry",{rootName:p,entryCount:C.length,entryMode:"root-preserved"});let E=[];for(let R of C){let wt=await mr(R,T);wt&&E.push(wt)}if(!E.length)throw new Error("The exporter could not produce any PSD layers from this selection.");let k=i?await e.exportAsync({format:"PNG",useAbsoluteBounds:u.useAbsoluteBounds}):null;return{fileName:He(e,r,o,n),rootName:e.name||"Untitled",documentWidth:g,documentHeight:y,compositePngBytes:k,nodes:E,warnings:Array.from(T.warnings),exportNodeCount:T.currentLeaf,editableTextCount:T.editableTextCount,preservedGroupCount:T.preservedGroupCount,hasEditableText:T.editableTextCount>0,backgroundDebug:T.backgroundDebug}}' `
  -Label 'safe layered export reuse'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function mr(e,t){if(t.hiddenLayerMode==="ignore-hidden"&&!q(e))return null;if(vn(e,t.hiddenLayerMode)){let r=await wn(e,t);if(r)return r}return await xr(e,t)}' `
  -Replace 'async function mr(e,t){if(t.hiddenLayerMode==="ignore-hidden"&&!q(e))return null;if(Cr(e)){let r=await gr(e,t,Ut(e));if(r.length>0)return t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:r}}let r=e===t.root&&V(e)&&e.children.length>0&&Ur(e),o=r||hi(e);if(o){let n=await kn(e,t,Ut(e));if(n)return t.preservedGroupCount+=1,n;let i=await gr(e,t);if(i.length>0)return t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it preserved the child layers without a synthetic background.")),t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:i};t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it was flattened."))}return await xr(e,t)}' `
  -ExpectedCount 1 `
  -Label 'safe layered split frame preserve'

$maskGroupSmartObjectExportReplacement = @'
async function gr(e,t,r=null){
  let o=[],n=ue(e,t.hiddenLayerMode);
  for(let i of n){let a=await Mn(i,t,r);a&&o.push(a)}
  return o
}
async function Mn(e,t,r=null){return e.kind==="node"?await ct(e.node,t,r):await In(e,t,r)}
function pigmaMaskSmartObjectCandidates(e,t){return e.maskedNodes.filter(r=>he(r)&&!(t.hiddenLayerMode==="ignore-hidden"&&!q(r)))}
function pigmaSmartObjectChildContext(e,t){
  return{root:e.root,documentBounds:t,totalLeaves:e.totalLeaves,currentLeaf:e.currentLeaf,warnings:e.warnings,editableTextCount:e.editableTextCount,preservedGroupCount:e.preservedGroupCount,hiddenLayerMode:e.hiddenLayerMode,settings:e.settings,backgroundDebug:e.backgroundDebug,rootName:e.rootName,rootIndex:e.rootIndex,rootCount:e.rootCount,lastProgressPostedAt:e.lastProgressPostedAt,longFrameMode:e.longFrameMode}
}
function pigmaCommitSmartObjectChildContext(e,t){
  e.currentLeaf=t.currentLeaf,e.editableTextCount=t.editableTextCount,e.preservedGroupCount=t.preservedGroupCount,e.lastProgressPostedAt=t.lastProgressPostedAt
}
function pigmaUnionBounds(e,t){
  if(!e)return t;
  if(!t)return e;
  let r=Math.min(e.x,t.x),o=Math.min(e.y,t.y),n=Math.max(e.x+e.width,t.x+t.width),i=Math.max(e.y+e.height,t.y+t.height);
  return{x:r,y:o,width:n-r,height:i-o,useAbsoluteBounds:!1}
}
function pigmaSmartObjectNodeBounds(e){
  if(!e)return null;
  if(Re(e))return ft(e)||v(e);
  if("absoluteTransform"in e&&"width"in e&&"height"in e){let t=ce(e);if(t)return t}
  let r=k(e);
  return r&&r.width>0&&r.height>0?{x:r.x,y:r.y,width:r.width,height:r.height,useAbsoluteBounds:!0}:v(e)
}
function pigmaSmartObjectEntryBounds(e){
  if(!e)return null;
  if(e.kind==="node")return pigmaSmartObjectNodeBounds(e.node);
  if(e.kind==="mask"||e.kind==="mask-group"){
    let t=Lr(e.maskNode,xt(e.maskNode));
    for(let r of e.maskedNodes)t=pigmaUnionBounds(t,pigmaSmartObjectNodeBounds(r));
    return t
  }
  return pigmaSmartObjectNodeBounds(e)
}
function pigmaSmartObjectDocumentBounds(e,t){
  let r=t;
  for(let o of e)r=pigmaUnionBounds(r,pigmaSmartObjectEntryBounds(o));
  return r?{x:r.x,y:r.y,width:r.width,height:r.height,useAbsoluteBounds:!1}:null
}
async function pigmaCloneSmartObjectNode(e,t,r){
  if(!await preloadTreeFontsSafely(e))return null;
  let o=e.clone();
  return t.appendChild(o),Vr(e,o,r),o
}
async function pigmaCloneSmartObjectEntry(e,t,r){
  if(!e)return null;
  if(e.kind==="node"){let o=await pigmaCloneSmartObjectNode(e.node,t,r);return o?{kind:"node",node:o}:null}
  if(e.kind==="mask"||e.kind==="mask-group"){
    let o=await pigmaCloneSmartObjectNode(e.maskNode,t,r);
    if(!o)return null;
    let n=[];
    for(let i of e.maskedNodes){let a=await pigmaCloneSmartObjectNode(i,t,r);a&&n.push(a)}
    return n.length>0?{kind:"mask",maskNode:o,maskedNodes:n}:null
  }
  let o=await pigmaCloneSmartObjectNode(e,t,r);
  return o?{kind:"node",node:o}:null
}
async function pigmaBuildSmartObjectDocument(e,t,r){
  if(!r||!Array.isArray(e)||e.length===0||r.width<=0||r.height<=0)return null;
  let s=pigmaSmartObjectDocumentBounds(e,r);
  if(!s)return null;
  let o=pigmaSmartObjectChildContext(t,s),n=[],i=figma.createFrame();
  try{
    i.clipsContent=!1,i.fills=[],i.strokes=[],i.name="__pigma-smart-object-layer-source__",i.resize(Math.max(1,d(s.width)),Math.max(1,d(s.height))),figma.currentPage.appendChild(i),i.x=s.x,i.y=s.y;
    for(let a of e){let l=await pigmaCloneSmartObjectEntry(a,i,s),u=l&&l.kind?await Mn(l,o,r):l?await ct(l,o,r):null;u&&n.push(u)}
  }finally{i.removed||i.remove()}
  return pigmaCommitSmartObjectChildContext(t,o),n.length>0?{width:Math.max(1,d(s.width)),height:Math.max(1,d(s.height)),offsetX:x(r.x-s.x),offsetY:x(r.y-s.y),visibleWidth:Math.max(1,d(r.width)),visibleHeight:Math.max(1,d(r.height)),documentBounds:s,children:n}:null
}
async function pigmaBuildTransformedClipMask(e,t){
  if(!t||t.width<=0||t.height<=0||!("absoluteTransform"in e)||!("width"in e)||!("height"in e))return null;
  let r=Math.max(1,d(t.width)),o=Math.max(1,d(t.height)),n=figma.createFrame(),i=figma.createRectangle();
  try{
    n.clipsContent=!1,n.fills=[],n.strokes=[],n.name="__pigma-smart-object-clip-mask__",n.resize(r,o),figma.currentPage.appendChild(n),n.x=t.x,n.y=t.y;
    i.name="__pigma-smart-object-clip-shape__",i.fills=[{type:"SOLID",color:{r:1,g:1,b:1},opacity:1}],i.strokes=[],i.resize(Math.max(1,e.width),Math.max(1,e.height));
    "topLeftRadius"in e&&(i.topLeftRadius=e.topLeftRadius,i.topRightRadius=e.topRightRadius,i.bottomRightRadius=e.bottomRightRadius,i.bottomLeftRadius=e.bottomLeftRadius);
    n.appendChild(i),Vr(e,i,t);
    let a=await n.exportAsync({format:"PNG",useAbsoluteBounds:!1});
    return{kind:"bitmap",mode:"alpha",x:0,y:0,width:r,height:o,pngBytes:a}
  }catch(a){return null}
  finally{n.removed||n.remove()}
}
async function pigmaBuildMaskSmartObjectNode(e,t,r,o){
  if(!r||!o||o.length<3||t.longFrameMode)return null;
  let n=Math.max(1,d(r.width)),i=Math.max(1,d(r.height)),a=await pigmaBuildSmartObjectDocument(o,t,r);
  if(!a)return null;
  let s=figma.createFrame();
  try{
    s.clipsContent=!0,s.fills=[],s.strokes=[],s.name="__pigma-mask-smart-object__",s.resize(n,i),figma.currentPage.appendChild(s),s.x=x(r.x),s.y=x(r.y);
    for(let l of o.slice().reverse()){if(!await preloadTreeFontsSafely(l))return null;let u=l.clone();s.appendChild(u),Vr(l,u,r)}
    let c=await s.exportAsync({format:"PNG",useAbsoluteBounds:!1});
    return{kind:"bitmap",id:"".concat(e.maskNode.id,":mask-smart-object"),name:"".concat(f(e.maskNode)," Smart Object"),sourceType:"MASK_SMART_OBJECT",opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:x(r.x-t.documentBounds.x),y:x(r.y-t.documentBounds.y),width:n,height:i,nodeTransform:null,pngBytes:c,smartObject:!0,smartObjectDocument:a}
  }catch(l){return null}
  finally{s.removed||s.remove()}
}
async function pigmaBuildTransformedClipSmartObject(e,t,r=null){
  let o=await qn(e,t,r);
  if(!o||o.kind!=="bitmap")return o;
  let n={x:x(o.x+t.documentBounds.x),y:x(o.y+t.documentBounds.y),width:o.width,height:o.height,useAbsoluteBounds:!1},i=await pigmaBuildSmartObjectDocument(ue(e,t.hiddenLayerMode),t,n);
  if(i){
    let a=await pigmaBuildTransformedClipMask(e,i.documentBounds);
    a?i.children=[{kind:"group",id:"".concat(e.id,":smart-object-clip-group"),name:f(e),sourceType:"TRANSFORMED_CLIP_CONTAINER",opacity:1,visible:!0,blendMode:"pass through",effects:null,strokeEffect:null,mask:a,children:i.children}]:t.warnings.add("\"".concat(f(e),"\" kept full Smart Object layer geometry, but its internal clipping mask could not be rebuilt."));
    delete i.documentBounds,o.smartObject=!0,o.smartObjectDocument=i
  }else t.warnings.add("\"".concat(f(e),"\" was flattened because its transformed clipping container could not build layered Smart Object contents."));
  return o.id="".concat(e.id,":transformed-clip-smart-object"),o.name=f(e),o.sourceType="TRANSFORMED_CLIP_SMART_OBJECT",o
}
async function In(e,t,r=null){
  var s;let o=(s=Lr(e.maskNode,xt(e.maskNode)))!=null?s:r,n=pigmaMaskSmartObjectCandidates(e,t),i=n.length>=3?await pigmaBuildMaskSmartObjectNode(e,t,o,n):null,a=i?[i]:[];
  if(!i)for(let l of e.maskedNodes){let u=await ct(l,t,o);u&&a.push(u)}
  if(a.length===0)return null;
  let c=await Si(e.maskNode,t);
  return c?(t.preservedGroupCount+=1,{kind:"group",id:"".concat(e.maskNode.id,":mask-group"),name:f(e.maskNode),sourceType:"MASK_OBJECT",opacity:1,visible:e.maskNode.visible,blendMode:"pass through",effects:null,strokeEffect:null,mask:c,children:a}):(t.warnings.add("\"".concat(f(e.maskNode),"\" could not be reconstructed as a PSD mask.")),null)
}
'@

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function gr(' `
  -EndMarker 'async function Rn(' `
  -Replacement $maskGroupSmartObjectExportReplacement `
  -Label 'mask group smart object export'

# Long-frame and clone-based export helpers can append detached trees that still
# contain unloaded text fonts. Preload descendant fonts before cloning or
# reparenting those trees so FrameNode/PageNode.appendChild does not throw.
$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function dt(e){' `
  -EndMarker 'async function Hn(' `
  -Replacement 'async function dt(e){let t=[],r=[e];for(;r.length>0;){let o=r.pop();if(o){if(o.type==="TEXT"){t.push(o);continue}"children"in o&&r.push(...o.children)}}await Promise.all(t.map(o=>we(o)))}async function preloadTreeFontsSafely(e){try{return await dt(e),!0}catch(t){return!1}}async function outlineLongFrameFallbackTiles(e,t,r=null){let o="";try{o=await e.exportAsync({format:"SVG_STRING",useAbsoluteBounds:t.useAbsoluteBounds,svgOutlineText:!0,svgIdAttribute:!0,svgSimplifyStroke:!1})}catch(i){return null}if(!o||o.trim().length===0)return null;let n=figma.createNodeFromSvg(o);try{let i=("absoluteBoundingBox"in n?n.absoluteBoundingBox:null)||("absoluteRenderBounds"in n?n.absoluteRenderBounds:null);return i&&("x"in n&&(n.x=x(n.x+(t.x-i.x))),"y"in n&&(n.y=x(n.y+(t.y-i.y)))),await Er(n,t,r)}catch(i){return n.removed||n.remove(),null}}' `
  -Label 'safe font preload helper'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Rn(e,t){if(!Ln(e))return null;let r=An(e,t.documentBounds,t);if(r)return r;if(!Ur(e))return null;let o=Fn(e);if(!o)return null;let n=!!L(e,t.root)||!!fe(e,t.root),i=me(e),a=e.clone();try{try{if(Ii(a),bt(a,o),t.longFrameMode&&De(o)){let l=await Er(a,o);return t.warnings.add(Te("".concat(f(e)," background"),l.length)),Be("".concat(e.id,":background"),"Background","".concat(e.type,"_BACKGROUND"),1,!0,"normal",l)}let s=await Me(a,t,o,{removeSupportedEffects:n,removeSupportedStroke:!!i});return s?{kind:"bitmap",id:"".concat(e.id,":background"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:s.x,y:s.y,width:s.width,height:s.height,nodeTransform:null,pngBytes:s.pngBytes}:null}catch(s){return null}}finally{a.removed||a.remove()}}' `
  -Replace 'async function Rn(e,t){if(!Ln(e))return null;let r=An(e,t.documentBounds,t);if(r)return r;if(!Ur(e))return null;let o=Fn(e);if(!o)return null;if(!await preloadTreeFontsSafely(e))return null;let n=!!L(e,t.root)||!!fe(e,t.root),i=me(e),a=e.clone();try{try{if(Ii(a),bt(a,o),t.longFrameMode&&De(o)){let l=await Er(a,o,t.documentBounds);return t.warnings.add(Te("".concat(f(e)," background"),l.length)),Be("".concat(e.id,":background"),"Background","".concat(e.type,"_BACKGROUND"),1,!0,"normal",l)}let s=await Me(a,t,o,{removeSupportedEffects:n,removeSupportedStroke:!!i});return s?{kind:"bitmap",id:"".concat(e.id,":background"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:s.x,y:s.y,width:s.width,height:s.height,nodeTransform:null,pngBytes:s.pngBytes}:null}catch(s){return null}}finally{a.removed||a.remove()}}' `
  -ExpectedCount 1 `
  -Label 'background clone font preload'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Rn(e,t){if(!Ln(e))return null;let r=An(e,t.documentBounds,t);if(r)return r;if(!Ur(e))return null;let o=Fn(e);if(!o)return null;if(!await preloadTreeFontsSafely(e))return null;let n=!!L(e,t.root)||!!fe(e,t.root),i=me(e),a=e.clone();try{try{if(Ii(a),bt(a,o),t.longFrameMode&&De(o)){let l=await Er(a,o,t.documentBounds);return t.warnings.add(Te("".concat(f(e)," background"),l.length)),Be("".concat(e.id,":background"),"Background","".concat(e.type,"_BACKGROUND"),1,!0,"normal",l)}let s=await Me(a,t,o,{removeSupportedEffects:n,removeSupportedStroke:!!i});return s?{kind:"bitmap",id:"".concat(e.id,":background"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:s.x,y:s.y,width:s.width,height:s.height,nodeTransform:null,pngBytes:s.pngBytes}:null}catch(s){return null}}finally{a.removed||a.remove()}}' `
  -Replace 'async function Rn(e,t){if(!Ln(e))return null;let r=An(e,t.documentBounds,t);if(r)return r;if(!Ur(e))return null;let o=Fn(e);if(!o)return null;if(!await preloadTreeFontsSafely(e))return null;let n=oa(e),i=n&&((n.normalizePaintOpacity===!0)||(n.normalizePaintBlendMode===!0))?n:null,a=!!L(e,t.root)||!!fe(e,t.root),s=me(e),l=e.clone();try{try{if(Ii(l),i&&to(l,i),bt(l,o),t.longFrameMode&&De(o)){let u=await Er(l,o,t.documentBounds);return t.warnings.add(Te("".concat(f(e)," background"),u.length)),Be("".concat(e.id,":background"),"Background","".concat(e.type,"_BACKGROUND"),i?i.effectiveOpacity:1,!0,at(i?i.effectiveBlendMode:"normal"),u)}let c=await Me(l,t,o,{normalizePaintOpacity:(i==null?void 0:i.normalizePaintOpacity)===!0,normalizePaintBlendMode:(i==null?void 0:i.normalizePaintBlendMode)===!0,removeSupportedEffects:a,removeSupportedStroke:!!s});return c?{kind:"bitmap",id:"".concat(e.id,":background"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND"),opacity:i?i.effectiveOpacity:1,visible:!0,blendMode:at(i?i.effectiveBlendMode:"normal"),effects:null,strokeEffect:null,x:c.x,y:c.y,width:c.width,height:c.height,nodeTransform:null,pngBytes:c.pngBytes}:null}catch(c){return null}}finally{l.removed||l.remove()}}' `
  -ExpectedCount 1 `
  -Label 'background bitmap fill blend promotion'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function pt(e,t,r){let o=(r==null?void 0:r.normalizePaintOpacity)===!0||(r==null?void 0:r.normalizePaintBlendMode)===!0||(r==null?void 0:r.removeAllEffects)===!0||(r==null?void 0:r.removeSupportedEffects)===!0||(r==null?void 0:r.removeSupportedStroke)===!0;(o||e.type==="TEXT")&&await dt(e);let n=e.clone();try{return o&&Oe(n,r),await Er(n,t)}finally{n.removed||n.remove()}}' `
  -Replace 'async function pt(e,t,r,o=null){let n=(r==null?void 0:r.normalizePaintOpacity)===!0||(r==null?void 0:r.normalizePaintBlendMode)===!0||(r==null?void 0:r.removeAllEffects)===!0||(r==null?void 0:r.removeSupportedEffects)===!0||(r==null?void 0:r.removeSupportedStroke)===!0,i=await preloadTreeFontsSafely(e);if(!i){let a=await outlineLongFrameFallbackTiles(e,t,o);if(a)return a;return[{x:o?x(t.x-o.x):x(t.x),y:o?x(t.y-o.y):x(t.y),width:Math.max(1,d(t.width)),height:Math.max(1,d(t.height)),pngBytes:await e.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}]}let s=e.clone();try{return n&&Oe(s,r),await Er(s,t,o)}finally{s.removed||s.remove()}}' `
  -ExpectedCount 1 `
  -Label 'long-frame clone font preload'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Er(e,t){let r=figma.createFrame(),o=Math.max(1,d(t.width)),n=Math.max(1,d(t.height)),i=qo(o,n),a=[];try{r.clipsContent=!0,r.fills=[],r.strokes=[],r.name="__pigma-long-frame-tile__",r.resize(o,Math.min(i,n)),figma.currentPage.appendChild(r),r.appendChild(e);for(let s=0;s<n;s+=i){let l=Math.min(i,n-s),u={x:t.x,y:t.y+s,width:t.width,height:l,useAbsoluteBounds:!1};r.resize(o,Math.max(1,l)),r.x=x(u.x),r.y=x(u.y),_r(e,t,u),a.push({x:x(u.x),y:x(u.y),width:o,height:d(l),pngBytes:await r.exportAsync({format:"PNG",useAbsoluteBounds:!1})})}return a}finally{r.removed||r.remove(),e.removed||e.remove()}}' `
  -Replace 'async function Er(e,t,r=null){let o=figma.createFrame(),n=Math.max(1,d(t.width)),i=Math.max(1,d(t.height)),a=qo(n,i),s=[];try{o.clipsContent=!0,o.fills=[],o.strokes=[],o.name="__pigma-long-frame-tile__",o.resize(n,Math.min(a,i)),figma.currentPage.appendChild(o),o.appendChild(e);for(let l=0;l<i;l+=a){let u=Math.min(a,i-l),c={x:t.x,y:t.y+l,width:t.width,height:u,useAbsoluteBounds:!1},p=r?x(c.x-r.x):x(c.x),g=r?x(c.y-r.y):x(c.y);o.resize(n,Math.max(1,u)),o.x=x(c.x),o.y=x(c.y),_r(e,t,c),s.push({x:p,y:g,width:n,height:d(u),pngBytes:await o.exportAsync({format:"PNG",useAbsoluteBounds:!1})})}return s}finally{o.removed||o.remove(),e.removed||e.remove()}}' `
  -ExpectedCount 1 `
  -Label 'long-frame append font preload'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'let i=await pt(e,r);return t.warnings.add(Te(f(e),i.length)),Be(e.id,f(e),e.type,1,e.visible,"normal",i)' `
  -Replace 'let i=await pt(e,r,void 0,t.documentBounds);return t.warnings.add(Te(f(e),i.length)),Be(e.id,f(e),e.type,1,e.visible,"normal",i)' `
  -ExpectedCount 1 `
  -Label 'safe raster tiles use document bounds'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'let s=await pt(e,r);return t.warnings.add(Te(f(e),s.length)),Be(e.id,f(e),e.type,1,e.visible,"normal",s)' `
  -Replace 'let s=await pt(e,r,void 0,t.documentBounds);return t.warnings.add(Te(f(e),s.length)),Be(e.id,f(e),e.type,1,e.visible,"normal",s)' `
  -ExpectedCount 1 `
  -Label 'text fallback tiles use document bounds'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'let m=await pt(e,i,{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0});return t.warnings.add(Te(f(e),m.length)),Be(e.id,f(e),e.type,o?o.effectiveOpacity:j(e),e.visible,at(o?o.effectiveBlendMode:K(e)),m)' `
  -Replace 'let m=await pt(e,i,{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0},t.documentBounds);return t.warnings.add(Te(f(e),m.length)),Be(e.id,f(e),e.type,o?o.effectiveOpacity:j(e),e.visible,at(o?o.effectiveBlendMode:K(e)),m)' `
  -ExpectedCount 1 `
  -Label 'layer raster tiles use document bounds'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Gn(e,t,r=null){var n;if(t.longFrameMode)return t.warnings.add(Vo()),null;let o=e;' `
  -Replace 'async function Gn(e,t,r=null){var n;let o=e;' `
  -ExpectedCount 1 `
  -Label 'allow editable text in long-frame mode'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Ri(e,t,r=null){var s;if(!qr(e,t.root)||!pe(t.root))return null;let o=(s=r!=null?r:tt(e))!=null?s:v(e);if(!o||Sa(o.width,o.height,To))return null;let n=zr(e,t.root);if(!n||n.length===0)return null;let i=t.root.clone(),a=figma.createFrame();try{return a.resize(d(o.width),d(o.height)),a.clipsContent=!0,a.fills=[],a.strokes=[],a.x=o.x,a.y=o.y,a.name="__pigma-background-blur-crop__",figma.currentPage.appendChild(a),a.appendChild(i),Ai(t.root,i,n)?(_r(i,t.documentBounds,o),await a.exportAsync({format:"PNG",useAbsoluteBounds:!1})):null}catch(l){return null}finally{a.removed||a.remove(),i.removed||i.remove()}}' `
  -Replace 'async function Ri(e,t,r=null){var s;if(!qr(e,t.root)||!pe(t.root))return null;let o=(s=r!=null?r:tt(e))!=null?s:v(e);if(!o||Sa(o.width,o.height,To))return null;let n=zr(e,t.root);if(!n||n.length===0)return null;if(!await preloadTreeFontsSafely(t.root))return null;let i=t.root.clone(),a=figma.createFrame();try{return a.resize(d(o.width),d(o.height)),a.clipsContent=!0,a.fills=[],a.strokes=[],a.x=o.x,a.y=o.y,a.name="__pigma-background-blur-crop__",figma.currentPage.appendChild(a),a.appendChild(i),Ai(t.root,i,n)?(_r(i,t.documentBounds,o),await a.exportAsync({format:"PNG",useAbsoluteBounds:!1})):null}catch(l){return null}finally{a.removed||a.remove(),i.removed||i.remove()}}' `
  -ExpectedCount 1 `
  -Label 'background blur clone font preload'

# Layers that keep live Photoshop effects still need transparent padding in the
# exported bitmap preview. Prefer visual render bounds for effect-bearing nodes
# and masks so blur/mask edges do not clip against the geometry bounds.
$effectAwareBitmapBoundsFind = 'function tt(e){var r;if(e.type==="TEXT")return v(e);if(Re(e))return(r=ft(e))!=null?r:v(e);let t=k(e);if(t&&t.width>0&&t.height>0)return{x:t.x,y:t.y,width:t.width,height:t.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let o=ce(e);if(o)return o}return v(e)}'
$effectAwareBitmapBoundsReplace = 'function tt(e){var r;let o=Zr(e)||re(e),n=o?v(e):null;if(e.type==="TEXT")return n!=null?n:v(e);if(Re(e))return n!=null?n:(r=ft(e))!=null?r:v(e);if(n)return n;let t=k(e);if(t&&t.width>0&&t.height>0)return{x:t.x,y:t.y,width:t.width,height:t.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let i=ce(e);if(i)return i}return v(e)}'
if ($bundle.Contains($effectAwareBitmapBoundsFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $effectAwareBitmapBoundsFind `
    -Replace $effectAwareBitmapBoundsReplace `
    -ExpectedCount 1 `
    -Label 'effect-aware bitmap bounds'
} elseif ($bundle.Contains($effectAwareBitmapBoundsReplace)) {
  # Already patched in this bundle variant.
} else {
  # Bitmap bounds helper changed in this bundle variant.
}

# Never ask Photoshop to invalidate exported text layers. The PSD assembly
# now lives in the externalized ui.html runtime, so keep that source of truth
# pinned to disable "Update All Text Layers" on open.
if ($bundle.Contains('invalidateTextLayers:t&&e.hasEditableText')) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find 'invalidateTextLayers:t&&e.hasEditableText' `
    -Replace 'invalidateTextLayers:!1' `
    -ExpectedCount 1 `
    -Label 'bundle text invalidation disabled'
}

$uiBundle = [System.IO.File]::ReadAllText($uiSource, [System.Text.Encoding]::UTF8)
$originalUiBundle = $uiBundle

# Release large PSD/ZIP buffers before the prepared download click. The Figma
# plugin iframe can otherwise hold root PSD bytes, ZIP stream chunks, and the
# final Blob URL at the same time, which is enough to crash large batch exports
# when the ZIP download starts.
$uiDirectPsdDownloadFind = 'Yi(new Blob([Eu(e.bytes)],{type:"image/vnd.adobe.photoshop"}),e.fileName,e.rootName,t,n)'
$uiDirectPsdDownloadReplace = 'let r=new Blob([Eu(e.bytes)],{type:"image/vnd.adobe.photoshop"});br([e]),Yi(r,e.fileName,e.rootName,t,n)'
if ($uiBundle.Contains($uiDirectPsdDownloadFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiDirectPsdDownloadFind `
    -Replace $uiDirectPsdDownloadReplace `
    -ExpectedCount 1 `
    -Label 'ui direct PSD pre-download buffer release'
} elseif ($uiBundle.Contains($uiDirectPsdDownloadReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI direct PSD pre-download buffer release.'
}

$uiLegacyZipDownloadFind = 'Yi(new Blob([Eu(a)],{type:"application/zip"}),e,'
$uiLegacyZipDownloadReplace = 'n={},br(t);let s=new Blob([Eu(a)],{type:"application/zip"});a=new Uint8Array(0),Yi(s,e,'
if ($uiBundle.Contains($uiLegacyZipDownloadFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiLegacyZipDownloadFind `
    -Replace $uiLegacyZipDownloadReplace `
    -ExpectedCount 1 `
    -Label 'ui legacy ZIP pre-download buffer release'
} elseif ($uiBundle.Contains($uiLegacyZipDownloadReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI legacy ZIP pre-download buffer release.'
}

$uiStreamZipFinalizeFind = 'function Wo(){let e,t,n,r=new Promise((i,a)=>{e=i,t=a});return n={zip:new Op((i,a,o)=>{if(i){n.settled||(n.settled=!0,n.rejectFinal(i));return}a&&a.length>0&&n.parts.push(Eu(a)),o&&!n.settled&&(n.settled=!0,n.resolveFinal(new Blob(n.parts,{type:"application/zip"})))}),parts:[],finalBlob:r,resolveFinal:e,rejectFinal:t,settled:!1,ended:!1,usedNames:new Set},n}'
$uiStreamZipFinalizeReplace = 'function Wo(){let e,t,n,r=new Promise((i,a)=>{e=i,t=a});return n={zip:new Op((i,a,o)=>{if(i){n.settled||(n.settled=!0,n.rejectFinal(i));return}a&&a.length>0&&n.parts.push(Eu(a)),o&&!n.settled&&(n.settled=!0,(()=>{let s=new Blob(n.parts,{type:"application/zip"});n.parts=[],n.resolveFinal(s)})())}),parts:[],finalBlob:r,resolveFinal:e,rejectFinal:t,settled:!1,ended:!1,usedNames:new Set},n}'
if ($uiBundle.Contains($uiStreamZipFinalizeFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiStreamZipFinalizeFind `
    -Replace $uiStreamZipFinalizeReplace `
    -ExpectedCount 1 `
    -Label 'ui streaming ZIP chunk release'
} elseif ($uiBundle.Contains($uiStreamZipFinalizeReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI streaming ZIP chunk release.'
}

$uiStreamZipFinalBlobFind = 'async function gm(e){return e.ended||(e.ended=!0,e.zip.end()),await e.finalBlob}'
$uiStreamZipFinalBlobReplace = 'async function gm(e){e.ended||(e.ended=!0,e.zip.end());try{return await e.finalBlob}finally{Vo(e)}}'
if ($uiBundle.Contains($uiStreamZipFinalBlobFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiStreamZipFinalBlobFind `
    -Replace $uiStreamZipFinalBlobReplace `
    -ExpectedCount 1 `
    -Label 'ui streaming ZIP finalizer release'
} elseif ($uiBundle.Contains($uiStreamZipFinalBlobReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI streaming ZIP finalizer release.'
}

$uiPreparedDownloadBlobFind = 'function Yi(e,t,n,r,i){let a=URL.createObjectURL(e);S0(),D.downloadUrl=a,D.downloadName=t,D.downloadSourceName=n,D.downloadMessage=r,At.href=a,At.download=t,TS.hidden=!1,D.busy=!1,D.statusTone="ready",D.statusMessage=i,pigmaTriggerPreparedDownload(a,t)}'
$uiPreparedDownloadBlobReplace = 'function Yi(e,t,n,r,i){let a=URL.createObjectURL(e);e=null;S0(),D.downloadUrl=a,D.downloadName=t,D.downloadSourceName=n,D.downloadMessage=r,At.href=a,At.download=t,TS.hidden=!1,D.busy=!1,D.statusTone="ready",D.statusMessage=i,pigmaTriggerPreparedDownload(a,t)}'
$uiPreparedDownloadBlobCancelReplace = 'function Yi(e,t,n,r,i){let a=URL.createObjectURL(e);e=null,D.exportCancelRequested=!1,D.exportCancelNoticeShown=!1;S0(),D.downloadUrl=a,D.downloadName=t,D.downloadSourceName=n,D.downloadMessage=r,At.href=a,At.download=t,TS.hidden=!1,D.busy=!1,D.statusTone="ready",D.statusMessage=i,pigmaTriggerPreparedDownload(a,t)}'
if ($uiBundle.Contains($uiPreparedDownloadBlobFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiPreparedDownloadBlobFind `
    -Replace $uiPreparedDownloadBlobReplace `
    -ExpectedCount 1 `
    -Label 'ui prepared download local blob release'
} elseif ($uiBundle.Contains($uiPreparedDownloadBlobReplace) -or $uiBundle.Contains($uiPreparedDownloadBlobCancelReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI prepared download local blob release.'
}

$uiBatchZipBuiltFilesFind = 'let n=t.builtFiles.reduce((i,a)=>i+(a.usedFallback?1:0),0),r=await gm(t.archive);if(Vo(t.archive),t.archive=null,t.includeRasterBundle){'
$uiBatchZipBuiltFilesReplace = 'let n=t.builtFiles.reduce((i,a)=>i+(a.usedFallback?1:0),0),r=await gm(t.archive);if(Vo(t.archive),t.archive=null,br(t.builtFiles),t.includeRasterBundle){'
if ($uiBundle.Contains($uiBatchZipBuiltFilesFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiBatchZipBuiltFilesFind `
    -Replace $uiBatchZipBuiltFilesReplace `
    -ExpectedCount 1 `
    -Label 'ui batch ZIP built file release'
} elseif ($uiBundle.Contains($uiBatchZipBuiltFilesReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI batch ZIP built file release.'
}

$uiCancelTranslationFind = Convert-JsUnicodeEscapes '"\uCDE8\uC18C": "Cancel",'
$uiCancelTranslationReplace = '"\uCDE8\uC18C": "Cancel","\uC791\uC5C5 \uC911\uC9C0":"Stop Task","\uCDE8\uC18C \uC911":"Stopping...","\uC911\uC9C0 \uC694\uCCAD\uB428. \uD604\uC7AC \uB2E8\uACC4 \uC815\uB9AC \uC911...":"Stop requested. Cleaning up the current step...","\uD604\uC7AC PSD \uB9CC\uB4E4\uAE30\uB97C \uC911\uC9C0\uD569\uB2C8\uB2E4.":"Stop the current PSD export.","PSD \uB9CC\uB4E4\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.":"PSD export was canceled.","\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C":"Export canceled",'
if ($uiBundle.Contains($uiCancelTranslationFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiCancelTranslationFind `
    -Replace $uiCancelTranslationReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel English translations'
} elseif ($uiBundle.Contains($uiCancelTranslationReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel English translations.'
}

$uiExportCancelStateFind = 'activeExportStartedAt:null};'
$uiExportCancelStateReplace = 'activeExportStartedAt:null,exportCancelRequested:!1,exportCancelNoticeShown:!1};'
if ($uiBundle.Contains($uiExportCancelStateFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportCancelStateFind `
    -Replace $uiExportCancelStateReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel state'
} elseif ($uiBundle.Contains($uiExportCancelStateReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel state.'
}

$uiExportButtonDisabledFind = 'let e=D.selection,t=nn(),n=e.documentWidth!==null&&e.documentHeight!==null,r=e.selectionCount>1,i=D.busy||!e.ready'
$uiExportButtonDisabledReplace = 'let e=D.selection,t=nn(),n=e.documentWidth!==null&&e.documentHeight!==null,r=e.selectionCount>1,i=D.busy?D.exportCancelRequested:!e.ready'
if ($uiBundle.Contains($uiExportButtonDisabledFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportButtonDisabledFind `
    -Replace $uiExportButtonDisabledReplace `
    -ExpectedCount 2 `
    -Label 'ui PSD cancel button enablement'
} elseif ($uiBundle.Contains($uiExportButtonDisabledReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel button enablement.'
}

$uiExportButtonLabelFind = Convert-JsUnicodeEscapes 'mr.disabled=i,mr.setAttribute("aria-busy",D.busy?"true":"false"),mr.title=D.busy?L("PSD \uB9CC\uB4E4\uAE30 \uC791\uC5C5\uC774 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4."):e.ready?L("\uD604\uC7AC \uC120\uD0DD\uC73C\uB85C PSD \uD30C\uC77C\uC744 \uB9CC\uB4ED\uB2C8\uB2E4."):L("\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694."),Wh.hidden=!D.busy,Zh.textContent=D.busy?pigmaExportHasRaster(t.exportPackageMode)?L("ZIP \uB9CC\uB4DC\uB294 \uC911"):L("PSD \uB9CC\uB4DC\uB294 \uC911"):e.ready?pigmaExportHasRaster(t.exportPackageMode)?L("ZIP \uB9CC\uB4E4\uAE30"):L("PSD \uB9CC\uB4E4\uAE30"):L("\uB808\uC774\uC5B4 \uC120\uD0DD \uD544\uC694")'
$uiExportButtonLabelReplace = 'mr.disabled=i,mr.setAttribute("aria-busy",D.busy?"true":"false"),mr.title=D.busy?D.exportCancelRequested?L("\uC911\uC9C0 \uC694\uCCAD\uB428. \uD604\uC7AC \uB2E8\uACC4 \uC815\uB9AC \uC911..."):L("\uD604\uC7AC PSD \uB9CC\uB4E4\uAE30\uB97C \uC911\uC9C0\uD569\uB2C8\uB2E4."):e.ready?L("\uD604\uC7AC \uC120\uD0DD\uC73C\uB85C PSD \uD30C\uC77C\uC744 \uB9CC\uB4ED\uB2C8\uB2E4."):L("\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694."),Wh.hidden=!D.busy,Zh.textContent=D.busy?D.exportCancelRequested?L("\uCDE8\uC18C \uC911"):L("\uC791\uC5C5 \uC911\uC9C0"):e.ready?pigmaExportHasRaster(t.exportPackageMode)?L("ZIP \uB9CC\uB4E4\uAE30"):L("PSD \uB9CC\uB4E4\uAE30"):L("\uB808\uC774\uC5B4 \uC120\uD0DD \uD544\uC694")'
if ($uiBundle.Contains($uiExportButtonLabelFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportButtonLabelFind `
    -Replace $uiExportButtonLabelReplace `
    -ExpectedCount 2 `
    -Label 'ui PSD cancel button label'
} elseif ($uiBundle.Contains($uiExportButtonLabelReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel button label.'
}

$uiExportCancelClickFind = Convert-JsUnicodeEscapes 'mr.onclick=()=>{let e=nn(),t=Fu();Xi(!0),D.busy=!0,D.statusTone="idle",D.statusMessage=L("PSD \uB9CC\uB4E4\uAE30 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4."),Ho(),qn({type:"request-export",hiddenLayerMode:e.hiddenLayerMode,settings:e,includeCompositePng:d1(e),developerExportExperiments:t})}'
$uiExportCancelClickPreviousReplace = 'mr.onclick=()=>{if(D.busy){D.exportCancelRequested||(D.exportCancelRequested=!0,D.statusTone="idle",D.statusMessage=L("\uC911\uC9C0 \uC694\uCCAD\uB428. \uD604\uC7AC \uB2E8\uACC4 \uC815\uB9AC \uC911..."),Ho(),qn({type:"request-export-cancel"}));return}let e=nn(),t=Fu();Xi(!0),D.exportCancelRequested=!1,D.exportCancelNoticeShown=!1,D.busy=!0,D.statusTone="idle",D.statusMessage=L("PSD \uB9CC\uB4E4\uAE30 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4."),Ho(),qn({type:"request-export",hiddenLayerMode:e.hiddenLayerMode,settings:e,includeCompositePng:d1(e),developerExportExperiments:t})}'
$uiExportCancelClickReplace = 'mr.onclick=()=>{if(D.busy){D.exportCancelRequested||(D.exportCancelRequested=!0,D.statusTone="idle",D.statusMessage=L("\uC911\uC9C0 \uC694\uCCAD\uB428. \uD604\uC7AC \uB2E8\uACC4 \uC815\uB9AC \uC911..."),Ho(),qn({type:"request-export-cancel"}));return}let e=nn(),t=Fu();Xi(!0),D.exportCancelRequested=!1,D.exportCancelNoticeShown=!1,D.exportAssemblyFailed=!1,D.busy=!0,D.statusTone="idle",D.statusMessage=L("PSD \uB9CC\uB4E4\uAE30 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4."),Ho(),qn({type:"request-export",hiddenLayerMode:e.hiddenLayerMode,settings:e,includeCompositePng:d1(e),developerExportExperiments:t})}'
if ($uiBundle.Contains($uiExportCancelClickFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportCancelClickFind `
    -Replace $uiExportCancelClickReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel click handler'
} elseif ($uiBundle.Contains($uiExportCancelClickPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportCancelClickPreviousReplace `
    -Replace $uiExportCancelClickReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel click handler assembly reset'
} elseif ($uiBundle.Contains($uiExportCancelClickReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel click handler.'
}

$uiExportRootCancelFind = 'case"export-root-ready":{let n=mh(e.fileName,e.rootCount),r=await om(e.payload,n.rootCount>1,n.includeRasterBundle);n.rootCount>1&&(await e1(n,r),br([r])),n.builtFiles.push(r),n.builtFiles.length<n.rootCount&&qn({type:"request-next-export-root"}),D.statusTone="idle",hu();return}'
$uiExportRootCancelPreviousReplace = 'case"export-root-ready":{let n=mh(e.fileName,e.rootCount),r=await om(e.payload,n.rootCount>1,n.includeRasterBundle);n.rootCount>1&&(await e1(n,r),br([r])),n.builtFiles.push(r);if(D.exportCancelRequested){Xi(!0),qn({type:"request-export-cancel"}),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone="idle",D.statusMessage=L("\u0050\u0053\u0044 \uB9CC\uB4E4\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4."),D.exportCancelNoticeShown||(D.exportCancelNoticeShown=!0,Bt("info",L("\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C"),D.statusMessage)),Le();return}n.builtFiles.length<n.rootCount&&qn({type:"request-next-export-root"}),D.statusTone="idle",hu();return}'
$uiExportRootCancelReplace = 'case"export-root-ready":{let n=mh(e.fileName,e.rootCount),r=null;try{r=await om(e.payload,n.rootCount>1,n.includeRasterBundle),n.rootCount>1&&(await e1(n,r),br([r])),n.builtFiles.push(r)}catch(i){D.exportAssemblyFailed=!0,r&&br([r]),Xi(!0),qn({type:"request-export-cancel"}),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone="error",D.statusMessage=It(D.locale,i instanceof Error?i.message:L("\uBE0C\uB77C\uC6B0\uC800 \u0055\u0049\uC5D0\uC11C \u0050\u0053\u0044 \uC870\uB9BD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.")),Bt("error",L("\u0050\u0053\u0044 \uC870\uB9BD \uC2E4\uD328"),D.statusMessage),Le();return}if(D.exportCancelRequested){Xi(!0),qn({type:"request-export-cancel"}),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone="idle",D.statusMessage=L("\u0050\u0053\u0044 \uB9CC\uB4E4\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4."),D.exportCancelNoticeShown||(D.exportCancelNoticeShown=!0,Bt("info",L("\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C"),D.statusMessage)),Le();return}n.builtFiles.length<n.rootCount&&qn({type:"request-next-export-root"}),D.statusTone="idle",hu();return}'
if ($uiBundle.Contains($uiExportRootCancelFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportRootCancelFind `
    -Replace $uiExportRootCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel after root build'
} elseif ($uiBundle.Contains($uiExportRootCancelPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportRootCancelPreviousReplace `
    -Replace $uiExportRootCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD root build error guard'
} elseif ($uiBundle.Contains($uiExportRootCancelReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel after root build.'
}

$uiExportFinishedCancelFind = 'case"export-finished":{let n=mh(e.fileName,e.rootCount);yn=null,await t1(e.fileName,n);return}'
$uiExportFinishedCancelPreviousReplace = 'case"export-finished":{let n=mh(e.fileName,e.rootCount);if(D.exportCancelRequested){Xi(!0),qn({type:"request-export-cancel"}),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone="idle",D.statusMessage=L("\u0050\u0053\u0044 \uB9CC\uB4E4\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4."),D.exportCancelNoticeShown||(D.exportCancelNoticeShown=!0,Bt("info",L("\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C"),D.statusMessage)),Le();return}yn=null,await t1(e.fileName,n);return}'
$uiExportFinishedCancelReplace = 'case"export-finished":{if(D.exportAssemblyFailed){D.exportAssemblyFailed=!1,Xi(!0);return}let n=mh(e.fileName,e.rootCount);if(D.exportCancelRequested){Xi(!0),qn({type:"request-export-cancel"}),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone="idle",D.statusMessage=L("\u0050\u0053\u0044 \uB9CC\uB4E4\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4."),D.exportCancelNoticeShown||(D.exportCancelNoticeShown=!0,Bt("info",L("\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C"),D.statusMessage)),Le();return}yn=null,await t1(e.fileName,n);return}'
if ($uiBundle.Contains($uiExportFinishedCancelFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportFinishedCancelFind `
    -Replace $uiExportFinishedCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel before final bundle'
} elseif ($uiBundle.Contains($uiExportFinishedCancelPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportFinishedCancelPreviousReplace `
    -Replace $uiExportFinishedCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD final stale assembly guard'
} elseif ($uiBundle.Contains($uiExportFinishedCancelReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel before final bundle.'
}

$uiExportErrorCancelFind = Convert-JsUnicodeEscapes 'case"export-error":wu("error"),Xi(!0),D.busy=!1,D.activeExportStartedAt=null,D.statusTone="error",D.statusMessage=It(D.locale,e.message),Bt("error",L("\uB0B4\uBCF4\uB0B4\uAE30 \uC2E4\uD328"),D.statusMessage),Le()'
$uiExportErrorCancelPreviousReplace = 'case"export-error":wu(e.cancelled?"success":"error"),Xi(!0),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone=e.cancelled?"idle":"error",D.statusMessage=It(D.locale,e.message),e.cancelled?D.exportCancelNoticeShown||(D.exportCancelNoticeShown=!0,Bt("info",L("\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C"),D.statusMessage)):Bt("error",L("\uB0B4\uBCF4\uB0B4\uAE30 \uC2E4\uD328"),D.statusMessage),Le()'
$uiExportErrorCancelReplace = 'case"export-error":if(D.exportAssemblyFailed){D.exportAssemblyFailed=!1;return}wu(e.cancelled?"success":"error"),Xi(!0),D.exportCancelRequested=!1,D.busy=!1,D.activeExportStartedAt=null,D.statusTone=e.cancelled?"idle":"error",D.statusMessage=It(D.locale,e.message),e.cancelled?D.exportCancelNoticeShown||(D.exportCancelNoticeShown=!0,Bt("info",L("\uB0B4\uBCF4\uB0B4\uAE30 \uCDE8\uC18C"),D.statusMessage)):Bt("error",L("\uB0B4\uBCF4\uB0B4\uAE30 \uC2E4\uD328"),D.statusMessage),Le()'
if ($uiBundle.Contains($uiExportErrorCancelFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportErrorCancelFind `
    -Replace $uiExportErrorCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel error result'
} elseif ($uiBundle.Contains($uiExportErrorCancelPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportErrorCancelPreviousReplace `
    -Replace $uiExportErrorCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD stale assembly export-error guard'
} elseif ($uiBundle.Contains($uiExportErrorCancelReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel error result.'
}

$uiExportDownloadReadyCancelFind = 'function Yi(e,t,n,r,i){let a=URL.createObjectURL(e);e=null;S0()'
$uiExportDownloadReadyCancelReplace = 'function Yi(e,t,n,r,i){let a=URL.createObjectURL(e);e=null,D.exportCancelRequested=!1,D.exportCancelNoticeShown=!1;S0()'
if ($uiBundle.Contains($uiExportDownloadReadyCancelFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiExportDownloadReadyCancelFind `
    -Replace $uiExportDownloadReadyCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD cancel reset on download ready'
} elseif ($uiBundle.Contains($uiExportDownloadReadyCancelReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD cancel reset on download ready.'
}

$editableTextParagraphRunsLegacyHelper = 'function editableTextParagraphRuns(e,t){let r=(e||"").replace(/\\r\\n?/g,"\\n").split("\\n"),o=[];for(let n=0;n<r.length;n++){let i=r[n],a=i.length+(n<r.length-1?1:0);a>0&&o.push({length:a,style:{justification:t}})}return o}'
$editableTextParagraphRunsPreviousHelper = 'function editableTextParagraphStyle(e){return{justification:e,autoHyphenate:!1}}function editableTextParagraphRuns(e,t){let r=(e||"").replace(/\\r\\n?/g,"\\n").split("\\n"),o=[];for(let n=0;n<r.length;n++){let i=r[n],a=i.length+(n<r.length-1?1:0);a>0&&o.push({length:a,style:editableTextParagraphStyle(t)})}return o}'
$editableTextParagraphRunsHelper = 'function editableTextParagraphStyle(e){return{justification:e,autoHyphenate:!1}}function editableTextEngineText(e){return(e||"").replace(/\r\n?|\n/g,"\r")}function editableTextParagraphRuns(e,t){let r=editableTextEngineText(e).split("\r"),o=[];for(let n=0;n<r.length;n++){let i=r[n],a=i.length+(n<r.length-1?1:0);a>0&&o.push({length:a,style:editableTextParagraphStyle(t)})}return o}'
$editableTextEngineDataHelper = 'function pigmaEditableTextEngineDataBase64(e){let t=Ff().serializeEngineData(Vf().encodeEngineData(e));return typeof t=="string"?t:Lh.byteArrayToBase64(t)}'
$editableTextIndexHelper = 'var pigmaEditableTextIndexCounter=0;function pigmaResetEditableTextIndexCounter(){pigmaEditableTextIndexCounter=0}function pigmaNextEditableTextIndex(){return pigmaEditableTextIndexCounter++}function pigmaAssignEditableTextIndex(e){return e.index=pigmaNextEditableTextIndex(),e}'
$editableTextEditorBaselineShiftAutoPrevious = 'return u>.25?-we(ae(u,0,r*.22)):0'
$editableTextEditorBaselineShiftAutoTuned = 'return u>.25?-we(ae(u*.9,0,r*.2)):0'
$editableTextVerticalAlignHelper = 'function pigmaEditableTextVerticalJustification(e){switch(e){case"CENTER":return"center";case"BOTTOM":return"bottom";default:return"top"}}function pigmaEditableTextLineCount(e){return Math.max(1,editableTextEngineText(e||"").split("\r").length)}function pigmaEditableTextResolvedLineHeight(e){let t=e&&e.text&&e.text.baseStyle?e.text.baseStyle:{},n=Number(t.lineHeightPx),r=Number(t.fontSize);return Number.isFinite(n)&&n>0?n:Math.max(1,Number.isFinite(r)&&r>0?r*1.2:12)}function pigmaEditableTextEditorBaselineShift(e,t){if(!e||!e.text)return 0;let n=e.text.baseStyle||{},r=Number(n.fontSize);if(!Number.isFinite(r)||r<48||pigmaEditableTextLineCount(e.text.value)!==1)return 0;let i=Number(t&&t.editorBaselineShift);if(Number.isFinite(i))return we(ae(i,-r*.28,r*.12));let a=Number(t&&t.pointAnchorY),o=Number.isFinite(a)?Math.max(0,a-r*.72):0,s=Math.max(0,pigmaEditableTextResolvedLineHeight(e)-r)*.35,u=Math.max(o,s);return u>.25?-we(ae(u*.9,0,r*.2)):0}function pigmaEditableTextBoxVerticalOffset(e,t){if(!e||!e.text||e.text.shapeType!=="box"||!t)return 0;let n=e.text.verticalJustification;if(n!=="center"&&n!=="bottom")return 0;let r=Math.max(0,Number(t[3])-Number(t[1])),i=pigmaEditableTextResolvedLineHeight(e)*pigmaEditableTextLineCount(e.text.value),a=Math.max(0,r-i);return we(n==="bottom"?a:a/2)}function pigmaOffsetEditableTextTransform(e,t){return Math.abs(t)>=.01?[e[0],e[1],e[2],e[3],we(e[4]),we(e[5]+t)]:e}function pigmaEditableTextIsHangulChar(e){let t=e&&e.charCodeAt?e.charCodeAt(0):0;return t>=4352&&t<=4607||t>=12592&&t<=12687||t>=44032&&t<=55215||t>=55216&&t<=55295}function pigmaEditableTextNeedsLgEiTextFallback(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"}function pigmaEditableTextLgEiTextFallbackStyle(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontStyle),n=t==="bold"?"Bold":t==="semibold"||t==="demibold"||t==="demi"?"SemiBold":t==="light"||t==="thin"?"Light":"Regular",r=Object.assign({},e,{fontFamily:"LG EI Text",fontStyle:n,fontWeight:pigmaPhotoshopFontWeight(n)});return r.photoshopFontName=pigmaKnownPhotoshopFontName("LG EI Text",n)||"LGEIText-"+n,r}function pigmaEditableTextPushStyleRun(e,t,n){n>0&&e.push({length:n,style:t})}function pigmaEditableTextStyleRuns(e,t){let n=[],r=0;if(!Array.isArray(e))return n;for(let i of e){let a=Math.max(0,Math.round(Number(i&&i.length)||0));if(a<=0)continue;let o=t.slice(r,r+a),s=i.style||{},u=pigmaEditableTextNeedsLgEiTextFallback(s)?pigmaEditableTextLgEiTextFallbackStyle(s):null,l=null,c=0;for(let f=0;f<o.length;f+=1){let d=u&&pigmaEditableTextIsHangulChar(o.charAt(f))?u:s;l===null?(l=d,c=1):l===d?c+=1:(pigmaEditableTextPushStyleRun(n,l,c),l=d,c=1)}pigmaEditableTextPushStyleRun(n,l,c),r+=a}return n}'
$editableTextVerticalAlignHelper = $editableTextVerticalAlignHelper.Replace('function pigmaOffsetEditableTextTransform(e,t){return Math.abs(t)>=.01?[e[0],e[1],e[2],e[3],we(e[4]),we(e[5]+t)]:e}', 'function pigmaEditableTextLineHeightSafeBoxBounds(e,t){if(!e||!e.text||e.text.shapeType!=="box"||!Array.isArray(t)||t.length<4)return t;let n=Number(t[3])-Number(t[1]);if(!Number.isFinite(n)||n<=0)return t;let r=pigmaEditableTextResolvedLineHeight(e),i=pigmaEditableTextLineCount(e.text.value),a=Number(e.text.baseStyle&&e.text.baseStyle.fontSize),o=Number(e.text.baseStyle&&e.text.baseStyle.lineHeightPx),s=Math.max(1,r)*i,l=Math.max(0,s-n),c=Number.isFinite(a)&&a>0&&(!Number.isFinite(o)||o<=a*1.05),f=Number.isFinite(a)&&a>0?ae(a*.12,2,8):3,d=c&&Number.isFinite(a)&&a>0?ae(a*.24,3,18):f;if(l<=.01&&!c)return t;return[we(t[0]),we(t[1]),we(t[2]),we(t[3]+l+d)]}function pigmaOffsetEditableTextTransform(e,t){return Math.abs(t)>=.01?[e[0],e[1],e[2],e[3],we(e[4]),we(e[5]+t)]:e}')
$editableTextEngineMetadataPrefix = $editableTextParagraphRunsHelper + $editableTextEngineDataHelper + $editableTextIndexHelper + $editableTextVerticalAlignHelper
$editableTextEngineMetadataReplacement = $editableTextEngineMetadataPrefix + 'function g1(e){let t=E1(e),n=w1(e,t),r=ym(e),i=yh(e.text.bounds,r),a=yh(e.text.boundingBox,r),o=e.text.boxBounds?e.text.boxBounds.map(f=>we(f)):null,s=v1(e,n,i,a,o),c=editableTextEngineText(e.text.value),l=editableTextParagraphRuns(c,e.text.justification),u=pigmaEditableTextEditorBaselineShift(e,t),f={text:c,transform:pigmaOffsetEditableTextTransform(n,pigmaEditableTextBoxVerticalOffset(e,o)),antiAlias:"smooth",orientation:"horizontal",gridding:"none",useFractionalGlyphWidths:!0,left:s.layerBounds.left,top:s.layerBounds.top,right:s.layerBounds.right,bottom:s.layerBounds.bottom,bounds:{left:{value:s.textBounds.left,units:"Pixels"},top:{value:s.textBounds.top,units:"Pixels"},right:{value:s.textBounds.right,units:"Pixels"},bottom:{value:s.textBounds.bottom,units:"Pixels"}},boundingBox:{left:{value:s.boundingBox.left,units:"Pixels"},top:{value:s.boundingBox.top,units:"Pixels"},right:{value:s.boundingBox.right,units:"Pixels"},bottom:{value:s.boundingBox.bottom,units:"Pixels"}},paragraphStyle:editableTextParagraphStyle(e.text.justification),paragraphStyleRuns:l,style:kh(e.text.baseStyle,u),styleRuns:pigmaEditableTextStyleRuns(e.text.styleRuns,c).map(d=>({length:d.length,style:kh(d.style,u)}))};return f.shapeType=e.text.shapeType,e.text.pointBase&&(f.pointBase=e.text.pointBase.slice()),o&&(f.boxBounds=o),f}'
$editableTextEngineMetadataReplacement = $editableTextEngineMetadataReplacement.Replace('o=e.text.boxBounds?e.text.boxBounds.map(f=>we(f)):null', 'o=e.text.boxBounds?pigmaEditableTextLineHeightSafeBoxBounds(e,e.text.boxBounds.map(f=>we(f))):null')
$editableTextPreviewSafeBoxBoundsFind = 'function bm(e,t){let n=e.text.boxBounds;if(!n)return[0,0,0,0];'
$editableTextPreviewSafeBoxBoundsReplace = 'function bm(e,t){let n=e.text.boxBounds?pigmaEditableTextLineHeightSafeBoxBounds(e,e.text.boxBounds):null;if(!n)return[0,0,0,0];'
$editableTextBoxAnchorFind = 'function v1(e,t,n,r,i){if(e.text.shapeType!=="box"||!i)return{layerBounds:n,textBounds:n,boundingBox:r};let a=b1(t,i),o=bh(a,n),s=bh(o,r);return{layerBounds:s,textBounds:o,boundingBox:s}}'
$editableTextBoxAnchorPreviousReplace = 'function v1(e,t,n,r,i){if(e.text.shapeType!=="box"||!i)return{layerBounds:n,textBounds:n,boundingBox:r};let a=b1(t,i);return{layerBounds:a,textBounds:a,boundingBox:a}}'
$editableTextBoxAnchorLocalOnlyReplace = 'function v1(e,t,n,r,i){if(e.text.shapeType!=="box"||!i)return{layerBounds:n,textBounds:n,boundingBox:r};let a={left:we(i[0]),top:we(i[1]),right:we(i[2]),bottom:we(i[3])};return{layerBounds:a,textBounds:a,boundingBox:a}}'
$editableTextBoxAnchorReplace = 'function v1(e,t,n,r,i){if(e.text.shapeType!=="box"||!i)return{layerBounds:n,textBounds:n,boundingBox:r};let a={left:we(i[0]),top:we(i[1]),right:we(i[2]),bottom:we(i[3])},o=b1(t,i);return{layerBounds:o,textBounds:a,boundingBox:a}}'
$editableTextPreviewExperimentFind = 'disableEditableTextPreview:t.disableEditableTextPreview===!0'
$editableTextPreviewExperimentReplace = 'disableEditableTextPreview:!1'
$editableTextPreviewGateFind = 'let b=cu(Ki(v.effects),d),P=Sh(v,d),y=t&&v.kind==="text"&&!d.disableEditableTextPreview,F=!t||v.kind!=="text"||y||!!b||P?await Xn(v.pngBytes):null,k=F&&v.kind==="text"?x1(v,F):F;'
$editableTextPreviewGateReplace = 'let b=cu(Ki(v.effects),d),P=Sh(v,d),y=t&&v.kind==="text",F=!t||v.kind!=="text"||y||!!b||P?await Xn(v.pngBytes):null,k=F&&v.kind==="text"?x1(v,F):F;'
$editableTextPreviewAttachFind = 'k&&!d.disableEditableTextPreview&&(T.canvas=k)'
$editableTextPreviewAttachReplace = 'k&&(T.canvas=k)'
$editableTextPreflightSerializeCallLegacy = 'Il.serializeEngineData(qf.encodeEngineData(T.text))'
$editableTextPreflightSerializeCallFixed = 'Ff().serializeEngineData(Vf().encodeEngineData(T.text))'
$editableTextPreflightLegacyFind = 'if(t&&v.kind==="text"&&(T.text=g1(v),k&&!d.disableEditableTextPreview&&(T.canvas=k)),Wn(T,v.effects,v.strokeEffect),P){if(!k)throw new Error("Procedural text effects require a decoded preview canvas.");let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m()'
$editableTextPreflightGuardedFind = 'if(t&&v.kind==="text"){try{T.text=g1(v),Il.serializeEngineData(qf.encodeEngineData(T.text)),k&&!d.disableEditableTextPreview&&(T.canvas=k)}catch(M){let B=k;if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextPreflightFixedFind = 'if(t&&v.kind==="text"){try{T.text=g1(v),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),Ff().serializeEngineData(Vf().encodeEngineData(T.text)),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),k&&!d.disableEditableTextPreview&&(T.canvas=k)}catch(M){let B=k;typeof ji=="function"&&ji("text-engine-fallback",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,reason:M instanceof Error?M.message:String(M)});if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextPreflightNoTxt2Find = 'if(t&&v.kind==="text"){try{T.text=g1(v),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),Ff().serializeEngineData(Vf().encodeEngineData(T.text)),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),k&&(T.canvas=k)}catch(M){let B=k;typeof ji=="function"&&ji("text-engine-fallback",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,reason:M instanceof Error?M.message:String(M)});if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextPreflightReplace = 'if(t&&v.kind==="text"){try{T.text=pigmaAssignEditableTextIndex(g1(v)),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,textIndex:T.text.index,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),T.engineData=pigmaEditableTextEngineDataBase64(T.text),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,textIndex:T.text.index,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k,hasTxt2EngineData:!!T.engineData}),k&&(T.canvas=k)}catch(M){let B=k;typeof ji=="function"&&ji("text-engine-fallback",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,reason:M instanceof Error?M.message:String(M)});if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.engineData=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextIndexAssignFind = 'T.text=g1(v),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k})'
$editableTextIndexAssignReplace = 'T.text=pigmaAssignEditableTextIndex(g1(v)),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,textIndex:T.text.index,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k})'
$editableTextIndexEncodedFind = 'typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k,hasTxt2EngineData:!!T.engineData})'
$editableTextIndexEncodedReplace = 'typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,textIndex:T.text.index,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k,hasTxt2EngineData:!!T.engineData})'
$editableTextPreflightTxt2AssignFind = 'Ff().serializeEngineData(Vf().encodeEngineData(T.text)),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),k&&(T.canvas=k)'
$editableTextPreflightTxt2AssignReplace = 'T.engineData=pigmaEditableTextEngineDataBase64(T.text),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k,hasTxt2EngineData:!!T.engineData}),k&&(T.canvas=k)'
$editableTextPreflightFallbackEngineDataFind = 'T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely'
$editableTextPreflightFallbackEngineDataReplace = 'T.text=void 0,T.engineData=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely'
$editableTextPreflightInstrumentedLegacyFind = $editableTextPreflightReplace.Replace($editableTextPreflightSerializeCallFixed, $editableTextPreflightSerializeCallLegacy)
$editableTextFallbackSummaryFind = 'if(jo&&(D.backgroundDebug=e.backgroundDebug.concat(s.backgroundDebug)),ji("children-built",{rootName:e.rootName,childLayerCount:s.children.length,warningCount:s.warnings.length,linkedFileCount:s.linkedFiles.length}),i={width:e.documentWidth,height:e.documentHeight,children:s.children},e.compositePngBytes){'
$editableTextFallbackSummaryInstrumentedFind = 'let l1=s.warnings.filter(c=>c.includes("text metadata could not be encoded safely")).length;l1>0&&(typeof ji=="function"&&ji("text-engine-fallback-summary",{rootName:e.rootName,fallbackCount:l1,editableTextCount:e.editableTextCount}),typeof Bt=="function"&&Bt("warning","Text metadata fallback","Bitmap fallback: ".concat(l1," text layer(s)")));if(jo&&(D.backgroundDebug=e.backgroundDebug.concat(s.backgroundDebug)),ji("children-built",{rootName:e.rootName,childLayerCount:s.children.length,warningCount:s.warnings.length,linkedFileCount:s.linkedFiles.length,textMetadataFallbackCount:l1}),i={width:e.documentWidth,height:e.documentHeight,children:s.children},e.compositePngBytes){'
$editableTextFallbackSummaryReplace = 'let l1=s.warnings.filter(c=>c.includes("text metadata could not be encoded safely")).length,m1=function countEditableTextLayers(c){let f=0;for(let d of c)d&&(d.text?f+=1:d.children&&(f+=countEditableTextLayers(d.children)));return f}(s.children),n1=!1;l1>0&&(typeof ji=="function"&&ji("text-engine-fallback-summary",{rootName:e.rootName,fallbackCount:l1,editableTextCount:e.editableTextCount,actualTextLayerCount:m1}),typeof Bt=="function"&&Bt("warning","Text metadata fallback","Bitmap fallback: ".concat(l1," text layer(s)")));typeof ji=="function"&&ji("editable-text-build-summary",{rootName:e.rootName,candidateTextLayerCount:e.editableTextCount,actualTextLayerCount:m1,fallbackCount:l1,forcePhotoshopTextRedraw:n1}),typeof Bt=="function"&&e.editableTextCount>0&&Bt("info","Editable text build","PSD text layers: ".concat(m1," / ").concat(e.editableTextCount));if(jo&&(D.backgroundDebug=e.backgroundDebug.concat(s.backgroundDebug)),ji("children-built",{rootName:e.rootName,childLayerCount:s.children.length,warningCount:s.warnings.length,linkedFileCount:s.linkedFiles.length,textMetadataFallbackCount:l1,actualTextLayerCount:m1,forcePhotoshopTextRedraw:n1}),i={width:e.documentWidth,height:e.documentHeight,children:s.children},e.compositePngBytes){'
$editableTextIndexResetFind = 'ji("build-start",{rootName:e.rootName,allowEditableText:t,hasCompositePng:e.compositePngBytes!==null,exportNodeCount:e.exportNodeCount,documentWidth:e.documentWidth,documentHeight:e.documentHeight});let a=e.compositePngBytes?await Ow(e.compositePngBytes):null;'
$editableTextIndexResetReplace = 'ji("build-start",{rootName:e.rootName,allowEditableText:t,hasCompositePng:e.compositePngBytes!==null,exportNodeCount:e.exportNodeCount,documentWidth:e.documentWidth,documentHeight:e.documentHeight}),pigmaResetEditableTextIndexCounter();let a=e.compositePngBytes?await Ow(e.compositePngBytes):null;'
$editableTextRedrawFlagFind = 'n1=t&&m1>0&&l1===0;'
$editableTextRedrawFlagReplace = 'n1=!1;'
$editableTextRedrawNoticeFind = ',n1&&typeof Bt=="function"&&Bt("info","Photoshop text redraw","Editable text redraw enabled for ".concat(m1," layer(s)"))'
$editableTextInvalidateWriteFind = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:n1,noBackground:!0});'
$editableTextInvalidateWriteReplace = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:!1,noBackground:!0});'
$editableTextInvalidateThumbnailWriteFind = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:n1,noBackground:!0,generateThumbnail:!0});'
$editableTextInvalidateThumbnailWriteReplace = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:!1,noBackground:!0,generateThumbnail:!0});'
$editableTextRootFallbackFind = 'catch(r){if(e.hasEditableText)try{'
$editableTextRootFallbackReplace = 'catch(r){typeof ji=="function"&&ji("editable-text-build-root-fallback",{rootName:e.rootName,reason:r instanceof Error?r.message:String(r),editableTextCount:e.editableTextCount});typeof Bt=="function"&&e.hasEditableText&&Bt("warning","Editable text PSD fallback","Root bitmap fallback: ".concat(e.rootName));if(e.hasEditableText)try{'
$singleLinePointTextGuardFind = 'function ni(e){let t=Math.max(1,d(e.width)),r=Math.max(1,d(e.height)),o=I(e);return o?o.width>t*1.2||o.height>r*1.05:!1}'
$singleLinePointTextGuardReplace = 'function ni(e){let t=Math.max(1,d(e.width)),r=I(e);return r?r.width>t*1.2:!1}'
$editableTextBoxResizeModeFind = 'function ri(e,t){return e.textAutoResize==="WIDTH_AND_HEIGHT"?!0:ni(e)?!1:oi(e,t)===1}'
$editableTextBoxResizeModeReplace = 'function ri(e,t){return e.textAutoResize==="WIDTH_AND_HEIGHT"}'
$editableBoxTextPreviewBoundsFind = 'async function zn(e,t,r){var a,s;let o=Ae(e,t.shapeType);if(!o)return null;let n=((a=r==null?void 0:r.riskScore)!=null?a:0)>=No?Wr(t,(s=r==null?void 0:r.riskScore)!=null?s:0):null;if(t.shapeType!=="point"){let l=I(e);if(l&&l.width>0&&l.height>0){let u=Vt(o,{x:l.x,y:l.y,width:l.width,height:l.height,useAbsoluteBounds:!1});return{bounds:ie(u,Se(Ht(t),n)),usedVisualProbe:!1}}return{bounds:ie(o,Se(Ht(t),n)),usedVisualProbe:!1}}let i=await Li(e,o,r);if(i){let l=Se(it(e,t),n);return{bounds:ie(Vt(o,i),l),usedVisualProbe:!0}}return{bounds:ie(o,Se(it(e,t),n)),usedVisualProbe:!1}}'
$editableBoxTextPreviewBoundsReplace = 'function pigmaEditableTextPreviewLineCount(e){return Math.max(1,String(e&&e.value||"").replace(/\r\n?/g,"\n").split("\n").length)}function pigmaEditableTextPreviewLineHeightPadding(e,t){if(!e||e.shapeType==="point"||!t)return null;let n=Number(e.baseStyle&&e.baseStyle.lineHeightPx),r=Number(e.baseStyle&&e.baseStyle.fontSize),o=Number(t.height);if(!Number.isFinite(o)||o<=0)return null;let i=Number.isFinite(n)&&n>0?n:Number.isFinite(r)&&r>0?r*1.2:0;if(!Number.isFinite(i)||i<=0)return null;let a=Math.max(1,i)*pigmaEditableTextPreviewLineCount(e),s=Math.max(0,a-o),l=Number.isFinite(r)&&r>0&&(!Number.isFinite(n)||n<=r*1.05),c=Number.isFinite(r)&&r>0?Math.min(18,Math.max(3,r*.24)):4;if(s<=.01&&!l)return null;let f=l?c:Math.min(8,Math.max(2,r*.12));return{left:0,top:Math.ceil((l?c:f)*.45),right:0,bottom:Math.ceil(s+(l?c:f))}}async function zn(e,t,r){var a,s;let o=Ae(e,t.shapeType);if(!o)return null;let n=((a=r==null?void 0:r.riskScore)!=null?a:0)>=No?Wr(t,(s=r==null?void 0:r.riskScore)!=null?s:0):null;if(t.shapeType!=="point"){let l=pigmaEditableTextPreviewLineHeightPadding(t,o);return{bounds:l?ie(o,l):o,usedVisualProbe:!!l}}let i=await Li(e,o,r);if(i){let l=Se(it(e,t),n);return{bounds:ie(Vt(o,i),l),usedVisualProbe:!0}}return{bounds:ie(o,Se(it(e,t),n)),usedVisualProbe:!1}}'
$editableTextAutoLayoutCloneFind = 'async function $n(e){if(!Wn(e))return null;let t=Zn(e);if(!t)return null;await we(e);let r=e.clone();try{return figma.currentPage.appendChild(r),r.visible=!0,r.textAutoResize="NONE",r.resizeWithoutConstraints(d(t.width),d(t.height)),Xn(e,r,t.x,t.y),Kn(e,r),r}catch(o){throw r.removed||r.remove(),o}}'
$editableTextAutoLayoutCloneReplace = 'function pigmaTextHasAutoLayoutContext(e){let t=e.parent;for(;t&&t.type!=="PAGE"&&t.type!=="DOCUMENT";){if("layoutMode"in t&&t.layoutMode&&t.layoutMode!=="NONE")return!0;t=t.parent}return!1}function pigmaTextUsesFlexibleSizing(e){return"layoutSizingHorizontal"in e&&(e.layoutSizingHorizontal==="FILL"||e.layoutSizingHorizontal==="HUG")||"layoutSizingVertical"in e&&(e.layoutSizingVertical==="FILL"||e.layoutSizingVertical==="HUG")}function pigmaShouldDetachEditableBoxText(e){return e.type==="TEXT"&&e.textAutoResize!=="WIDTH_AND_HEIGHT"&&e.textAutoResize!=="TRUNCATE"&&e.textTruncation!=="ENDING"&&(pigmaTextHasAutoLayoutContext(e)||pigmaTextUsesFlexibleSizing(e))}function pigmaStableEditableTextBounds(e){let t=k(e);if(t&&t.width>0&&t.height>0)return{x:t.x,y:t.y,width:t.width,height:t.height,useAbsoluteBounds:!0};let r=I(e);return r&&r.width>0&&r.height>0?{x:r.x,y:r.y,width:r.width,height:r.height,useAbsoluteBounds:!1}:null}async function $n(e){let t=Wn(e),r=t?Zn(e):pigmaShouldDetachEditableBoxText(e)?pigmaStableEditableTextBounds(e):null;if(!r)return null;await we(e);let o=e.clone();try{return figma.currentPage.appendChild(o),o.visible=!0,o.textAutoResize="NONE",o.resizeWithoutConstraints(d(r.width),d(r.height)),Xn(e,o,r.x,r.y),t&&Kn(e,o),o}catch(n){throw o.removed||o.remove(),n}}'
$runtimePhotoshopFontNameFind = 'function sa(e){let t=la(e);if(t)return t;let r=e.family.replace(/[^A-Za-z0-9]/g,""),o=e.style.replace(/[^A-Za-z0-9]/g,"");return r==="Arial"?o==="Bold"?"Arial-BoldMT":o==="Italic"?"Arial-ItalicMT":o==="BoldItalic"?"Arial-BoldItalicMT":"ArialMT":r?!o||o==="Regular"?"".concat(r,"-Regular"):"".concat(r,"-").concat(o):"ArialMT"}function la(e){let t=e.family.trim().toLowerCase(),r=e.style.trim().toLowerCase();return t==="italianno"&&r==="regular"?"Italianno Regular":null}'
$runtimePhotoshopFontNameReplace = 'function pigmaNormalizePhotoshopFontToken(e){return String(e||"").trim().replace(/[\s_-]+/g,"").toLowerCase()}function pigmaPhotoshopStyleName(e){let t=pigmaNormalizePhotoshopFontToken(e),r={regular:"Regular",roman:"Regular",normal:"Regular",thin:"Thin",extralight:"ExtraLight",ultralight:"ExtraLight",light:"Light",demilight:"DemiLight",semilight:"SemiLight",medium:"Medium",semibold:"SemiBold",demibold:"DemiBold",bold:"Bold",extrabold:"ExtraBold",black:"Black",heavy:"Heavy"}[t];if(r)return r;let o=String(e||"Regular").replace(/[^A-Za-z0-9]+/g,"");return o||"Regular"}function pigmaKnownPhotoshopFontName(e){let t=String(e&&e.family||"").trim(),r=String(e&&e.style||"Regular").trim(),o=t.toLowerCase(),n=pigmaNormalizePhotoshopFontToken(r),i=o==="lg ei headline ttf"?"LGEIHeadlineTTF":o==="lg ei headline"?"LGEIHeadline":"";if(i){let s={regular:"Regular",bold:"Bold",semibold:"Semibold",light:"Light",thin:"Thin"}[n]||pigmaPhotoshopStyleName(r);return"".concat(i,"-").concat(s)}let a={"noto sans kr":"NotoSansKR","noto serif kr":"NotoSerifKR","noto sans sc":"NotoSansSC","noto serif sc":"NotoSerifSC","noto sans tc":"NotoSansTC","noto serif tc":"NotoSerifTC","noto sans jp":"NotoSansJP","noto serif jp":"NotoSerifJP","noto sans hk":"NotoSansHK","noto serif hk":"NotoSerifHK","noto sans cjk kr":"NotoSansCJKkr","noto serif cjk kr":"NotoSerifCJKkr","noto sans cjk sc":"NotoSansCJKsc","noto serif cjk sc":"NotoSerifCJKsc","noto sans cjk tc":"NotoSansCJKtc","noto serif cjk tc":"NotoSerifCJKtc","noto sans cjk jp":"NotoSansCJKjp","noto serif cjk jp":"NotoSerifCJKjp","noto sans cjk hk":"NotoSansCJKhk","noto serif cjk hk":"NotoSerifCJKhk"}[o];if(a){let s=pigmaPhotoshopStyleName(r);a==="NotoSerifKR"&&n==="black"&&(s="Heavy");return"".concat(a,"-").concat(s)}return null}function sa(e){let t=la(e);if(t)return t;let r=pigmaKnownPhotoshopFontName(e);if(r)return r;let o=e.family.replace(/[^A-Za-z0-9]/g,""),n=e.style.replace(/[^A-Za-z0-9]/g,"");return o==="Arial"?n==="Bold"?"Arial-BoldMT":n==="Italic"?"Arial-ItalicMT":n==="BoldItalic"?"Arial-BoldItalicMT":"ArialMT":o?!n||n==="Regular"?"".concat(o,"-Regular"):"".concat(o,"-").concat(n):"ArialMT"}function la(e){let t=e.family.trim().toLowerCase(),r=e.style.trim().toLowerCase();return t==="italianno"&&r==="regular"?"Italianno Regular":null}'
$uiEditableTextFontNameFind = 'function resolveEditableTextFontName(e){let t=typeof(e==null?void 0:e.photoshopFontName)=="string"?e.photoshopFontName.trim():"",n=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",r=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"",i=n.replace(/[^A-Za-z0-9]/g,""),a=r.replace(/[^A-Za-z0-9]/g,""),o=!r||/^regular$/i.test(r),s=i?o?"".concat(i,"-Regular"):"".concat(i,"-").concat(a):"",u=n?o?n:"".concat(n," ").concat(r):"";return n&&/\s/.test(n)&&t===s&&u.length>0?u:t||u||"ArialMT"}'
$uiEditableTextFontNameLgOnlyFind = 'function pigmaLgEiPostScriptFontName(e,t){let n=String(e||"").trim(),r=String(t||"Regular").trim(),i=n==="LG EI Headline TTF"?"LGEIHeadlineTTF":n==="LG EI Headline"?"LGEIHeadline":"";if(!i)return null;let a=r.replace(/[\s_-]+/g,"").toLowerCase(),o={regular:"Regular",bold:"Bold",semibold:"Semibold",light:"Light",thin:"Thin"}[a]||"Regular";return"".concat(i,"-").concat(o)}function resolveEditableTextFontName(e){let t=typeof(e==null?void 0:e.photoshopFontName)=="string"?e.photoshopFontName.trim():"",n=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",r=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"",i=pigmaLgEiPostScriptFontName(n,r);if(i)return i;let a=n.replace(/[^A-Za-z0-9]/g,""),o=r.replace(/[^A-Za-z0-9]/g,""),s=!r||/^regular$/i.test(r),u=a?s?"".concat(a,"-Regular"):"".concat(a,"-").concat(o):"",l=n?s?n:"".concat(n," ").concat(r):"";return n&&/\s/.test(n)&&t===u&&l.length>0?l:t||l||"ArialMT"}'
$uiEditableTextFontNameReplace = 'function pigmaNormalizePhotoshopFontToken(e){return String(e||"").trim().replace(/[\s_-]+/g,"").toLowerCase()}function pigmaPhotoshopStyleName(e){let t=pigmaNormalizePhotoshopFontToken(e),n={regular:"Regular",roman:"Regular",normal:"Regular",thin:"Thin",extralight:"ExtraLight",ultralight:"ExtraLight",light:"Light",demilight:"DemiLight",semilight:"SemiLight",medium:"Medium",semibold:"SemiBold",demibold:"DemiBold",bold:"Bold",extrabold:"ExtraBold",black:"Black",heavy:"Heavy"}[t];if(n)return n;let r=String(e||"Regular").replace(/[^A-Za-z0-9]+/g,"");return r||"Regular"}function pigmaKnownPhotoshopFontName(e,t){let n=String(e||"").trim(),r=String(t||"Regular").trim(),i=n.toLowerCase(),a=pigmaNormalizePhotoshopFontToken(r),o=i==="lg ei headline ttf"?"LGEIHeadlineTTF":i==="lg ei headline"?"LGEIHeadline":"";if(o){let s={regular:"Regular",bold:"Bold",semibold:"Semibold",light:"Light",thin:"Thin"}[a]||pigmaPhotoshopStyleName(r);return"".concat(o,"-").concat(s)}let l={"noto sans kr":"NotoSansKR","noto serif kr":"NotoSerifKR","noto sans sc":"NotoSansSC","noto serif sc":"NotoSerifSC","noto sans tc":"NotoSansTC","noto serif tc":"NotoSerifTC","noto sans jp":"NotoSansJP","noto serif jp":"NotoSerifJP","noto sans hk":"NotoSansHK","noto serif hk":"NotoSerifHK","noto sans cjk kr":"NotoSansCJKkr","noto serif cjk kr":"NotoSerifCJKkr","noto sans cjk sc":"NotoSansCJKsc","noto serif cjk sc":"NotoSerifCJKsc","noto sans cjk tc":"NotoSansCJKtc","noto serif cjk tc":"NotoSerifCJKtc","noto sans cjk jp":"NotoSansCJKjp","noto serif cjk jp":"NotoSerifCJKjp","noto sans cjk hk":"NotoSansCJKhk","noto serif cjk hk":"NotoSerifCJKhk"}[i];if(l){let s=pigmaPhotoshopStyleName(r);l==="NotoSerifKR"&&a==="black"&&(s="Heavy");return"".concat(l,"-").concat(s)}return null}function resolveEditableTextFontName(e){let t=typeof(e==null?void 0:e.photoshopFontName)=="string"?e.photoshopFontName.trim():"",n=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",r=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"",i=pigmaKnownPhotoshopFontName(n,r);if(i)return i;let a=n.replace(/[^A-Za-z0-9]/g,""),o=r.replace(/[^A-Za-z0-9]/g,""),s=!r||/^regular$/i.test(r),u=a?s?"".concat(a,"-Regular"):"".concat(a,"-").concat(o):"",l=n?s?n:"".concat(n," ").concat(r):"";return t||u||l||"ArialMT"}'
$pigmaPhotoshopFontResolverBody = @'
function pigmaNormalizePhotoshopFontToken(e){let t=String(e||"").trim().toLowerCase();try{t=t.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")}catch(r){}return t.replace(/[^a-z0-9]+/g,"")}
function pigmaPhotoshopStyleName(e){let t=pigmaNormalizePhotoshopFontToken(e),r={regular:"Regular",roman:"Regular",normal:"Regular",book:"Regular",thin:"Thin",hairline:"Thin",extralight:"ExtraLight",ultralight:"ExtraLight",light:"Light",demilight:"DemiLight",semilight:"SemiLight",medium:"Medium",semibold:"SemiBold",demibold:"DemiBold",demi:"DemiBold",bold:"Bold",extrabold:"ExtraBold",ultrabold:"ExtraBold",black:"Black",heavy:"Heavy"}[t];if(r)return r;let o=String(e||"Regular").replace(/[^A-Za-z0-9]+/g,"");return o||"Regular"}
function pigmaPhotoshopFontWeight(e){let t=pigmaNormalizePhotoshopFontToken(e);return/black|heavy/.test(t)?900:/extrabold|ultrabold/.test(t)?800:/bold/.test(t)?700:/semibold|demibold|demi/.test(t)?600:/medium/.test(t)?500:/light|demilight|semilight/.test(t)?300:/thin|hairline/.test(t)?100:400}
function pigmaPhotoshopStyleTokens(e){let t=pigmaNormalizePhotoshopFontToken(e||"Regular"),r=pigmaNormalizePhotoshopFontToken(pigmaPhotoshopStyleName(e)),o=[t,r],n={regular:["regular","roman","normal","book"],roman:["regular","roman","normal","book"],normal:["regular","roman","normal","book"],book:["regular","roman","normal","book"],semibold:["semibold","demibold","demi"],demibold:["demibold","semibold","demi"],demi:["demibold","semibold","demi"],extralight:["extralight","ultralight"],ultralight:["ultralight","extralight"],black:["black","heavy"],heavy:["heavy","black"]}[t];return n&&o.push(...n),Array.from(new Set(o.filter(Boolean)))}
function pigmaPhotoshopFamilyTokens(e,t){let r=pigmaNormalizePhotoshopFontToken(e),o=[r];for(let n of pigmaPhotoshopStyleTokens(t)){n&&r.endsWith(n)&&r.length>n.length+2&&o.push(r.slice(0,-n.length))}return Array.from(new Set(o.filter(Boolean)))}
function pigmaMappedPhotoshopFontName(e,t){let r=pigmaPhotoshopFamilyTokens(e,t),o=pigmaPhotoshopStyleTokens(t||"Regular");for(let n of r)for(let i of o){let a=pigmaPhotoshopFontMap[n+"|"+i];if(a)return a}return null}
function pigmaKnownPhotoshopFontName(e,t){let r=typeof e=="object"&&e?String(e.family||"").trim():String(e||"").trim(),o=typeof e=="object"&&e?String(e.style||"Regular").trim():String(t||"Regular").trim(),n=pigmaMappedPhotoshopFontName(r,o);if(n)return n;let i=r.toLowerCase(),a=pigmaNormalizePhotoshopFontToken(o),s=i==="lg ei headline ttf"?"LGEIHeadlineTTF":i==="lg ei headline"?"LGEIHeadline":"",u=pigmaPhotoshopStyleName(o);if(s){let c={regular:"Regular",bold:"Bold",semibold:"Semibold",light:"Light",thin:"Thin"}[a]||u;return"".concat(s,"-").concat(c)}let l={"inter":"Inter","inter display":"InterDisplay","noto sans kr":"NotoSansKR","noto serif kr":"NotoSerifKR","noto sans sc":"NotoSansSC","noto serif sc":"NotoSerifSC","noto sans tc":"NotoSansTC","noto serif tc":"NotoSerifTC","noto sans jp":"NotoSansJP","noto serif jp":"NotoSerifJP","noto sans hk":"NotoSansHK","noto serif hk":"NotoSerifHK","noto sans cjk kr":"NotoSansCJKkr","noto serif cjk kr":"NotoSerifCJKkr","noto sans cjk sc":"NotoSansCJKsc","noto serif cjk sc":"NotoSerifCJKsc","noto sans cjk tc":"NotoSansCJKtc","noto serif cjk tc":"NotoSerifCJKtc","noto sans cjk jp":"NotoSansCJKjp","noto serif cjk jp":"NotoSerifCJKjp","noto sans cjk hk":"NotoSansCJKhk","noto serif cjk hk":"NotoSerifCJKhk"}[i];return l?(l==="NotoSerifKR"&&a==="black"&&(u="Heavy"),"".concat(l,"-").concat(u)):null}
'@
$pigmaPhotoshopFontResolver = ("var pigmaPhotoshopFontMap=" + $fontPostScriptMapJson + ";" + $pigmaPhotoshopFontResolverBody).Replace("`r", "").Replace("`n", "")
$runtimePhotoshopFontNameReplace = $pigmaPhotoshopFontResolver + 'function sa(e){let t=la(e);if(t)return t;let r=pigmaKnownPhotoshopFontName(e);if(r)return r;let o=e.family.replace(/[^A-Za-z0-9]/g,""),n=e.style.replace(/[^A-Za-z0-9]/g,"");return o==="Arial"?n==="Bold"?"Arial-BoldMT":n==="Italic"?"Arial-ItalicMT":n==="BoldItalic"?"Arial-BoldItalicMT":"ArialMT":o?!n||n==="Regular"?"".concat(o,"-Regular"):"".concat(o,"-").concat(n):"ArialMT"}function la(e){let t=e.family.trim().toLowerCase(),r=e.style.trim().toLowerCase();return t==="italianno"&&r==="regular"?"Italianno Regular":null}'
$runtimeTextStyleFontWeightFind = 'function si(e){let t=di(e.fills);return t?{photoshopFontName:sa(e.fontName),fontFamily:e.fontName.family,fontStyle:e.fontName.style,fontSize:Math.max(1,e.fontSize),fillColor:t,lineHeightPx:aa(e.lineHeight,e.fontSize),tracking:ci(e.letterSpacing,e.fontSize),fontCaps:ui(e.textCase),underline:e.textDecoration==="UNDERLINE",strikethrough:e.textDecoration==="STRIKETHROUGH"}:null}'
$runtimeTextStyleFontWeightReplace = 'function si(e){let t=di(e.fills);return t?{photoshopFontName:sa(e.fontName),fontFamily:e.fontName.family,fontStyle:e.fontName.style,fontWeight:pigmaPhotoshopFontWeight(e.fontName.style),fontSize:Math.max(1,e.fontSize),fillColor:t,lineHeightPx:aa(e.lineHeight,e.fontSize),tracking:ci(e.letterSpacing,e.fontSize),fontCaps:ui(e.textCase),underline:e.textDecoration==="UNDERLINE",strikethrough:e.textDecoration==="STRIKETHROUGH"}:null}'
$runtimeTextVerticalJustificationHelperFind = 'function ia(e){switch(e){case"CENTER":return"center";case"RIGHT":return"right";case"JUSTIFIED":return"justify-left";default:return"left"}}'
$runtimeTextVerticalJustificationHelperReplace = $runtimeTextVerticalJustificationHelperFind + 'function pigmaEditableTextVerticalJustification(e){switch(e){case"CENTER":return"center";case"BOTTOM":return"bottom";default:return"top"}}'
$runtimeTextVerticalJustificationFieldFind = 'textTruncation:o.textTruncation,maxLines:o.maxLines,justification:ia(e.textAlignHorizontal),baseStyle'
$runtimeTextVerticalJustificationFieldReplace = 'textTruncation:o.textTruncation,maxLines:o.maxLines,verticalJustification:pigmaEditableTextVerticalJustification(e.textAlignVertical),justification:ia(e.textAlignHorizontal),baseStyle'
$uiEditableTextFontNameBody = @'
function resolveEditableTextFontName(e){let t=typeof(e==null?void 0:e.photoshopFontName)=="string"?e.photoshopFontName.trim():"",n=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",r=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"",i=pigmaKnownPhotoshopFontName(n,r);if(i)return i;let a=n.replace(/[^A-Za-z0-9]/g,""),o=r.replace(/[^A-Za-z0-9]/g,""),s=!r||/^regular$/i.test(r),u=a?s?"".concat(a,"-Regular"):"".concat(a,"-").concat(o):"",l=n?s?n:"".concat(n," ").concat(r):"";return t||u||l||"ArialMT"}
function pigmaEditableTextHasMappedFontFace(e){let t=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",n=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"";return!!pigmaMappedPhotoshopFontName(t,n)}
function pigmaEditableTextIsNotoCjkVariableFont(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return/^noto(sans|serif)(cjk)?(kr|jp|sc|tc|hk)$/.test(t)}
function pigmaEditableTextFontWeight(e){let t=Number(e&&e.fontWeight);return Number.isFinite(t)?t:pigmaPhotoshopFontWeight(e&&e.fontStyle)}
function pigmaEditableTextShouldFauxBold(e){return pigmaEditableTextFontWeight(e)>=600&&!pigmaEditableTextHasMappedFontFace(e)&&!pigmaEditableTextIsNotoCjkVariableFont(e)}
function pigmaEditableTextShouldFauxItalic(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontStyle);return/(italic|oblique)/.test(t)&&!pigmaEditableTextHasMappedFontFace(e)&&!pigmaEditableTextIsNotoCjkVariableFont(e)}
function pigmaEditableTextSyntheticFontStyle(e){return 0}
function pigmaEditableTextFontScript(e){return pigmaEditableTextIsNotoCjkVariableFont(e)?4:0}
function pigmaEditableTextFontType(e){return pigmaEditableTextIsNotoCjkVariableFont(e)?1:0}
function pigmaApplyEditableTextFontFaceStyle(e,t){t&&(pigmaEditableTextShouldFauxBold(e)&&(t.fauxBold=!0),pigmaEditableTextShouldFauxItalic(e)&&(t.fauxItalic=!0))}
function editableTextFontDescriptor(e){return{name:resolveEditableTextFontName(e),script:pigmaEditableTextFontScript(e),type:pigmaEditableTextFontType(e),synthetic:pigmaEditableTextSyntheticFontStyle(e)}}
'@
$uiEditableTextFontNameReplace = ($pigmaPhotoshopFontResolver + $uiEditableTextFontNameBody).Replace("`r", "").Replace("`n", "")
$uiEditableTextNotoVariableStyleFind = 'function pigmaEditableTextHasMappedFontFace(e){let t=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",n=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"";return!!pigmaMappedPhotoshopFontName(t,n)}function pigmaEditableTextFontWeight(e){let t=Number(e&&e.fontWeight);return Number.isFinite(t)?t:pigmaPhotoshopFontWeight(e&&e.fontStyle)}function pigmaEditableTextShouldFauxBold(e){return pigmaEditableTextFontWeight(e)>=600&&!pigmaEditableTextHasMappedFontFace(e)}function pigmaEditableTextShouldFauxItalic(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontStyle);return/(italic|oblique)/.test(t)&&!pigmaEditableTextHasMappedFontFace(e)}function pigmaApplyEditableTextFontFaceStyle(e,t){t&&(pigmaEditableTextShouldFauxBold(e)&&(t.fauxBold=!0),pigmaEditableTextShouldFauxItalic(e)&&(t.fauxItalic=!0))}function editableTextFontDescriptor(e){return{name:resolveEditableTextFontName(e),script:0,type:0,synthetic:0}}'
$uiEditableTextNotoVariableStyleReplace = 'function pigmaEditableTextHasMappedFontFace(e){let t=typeof(e==null?void 0:e.fontFamily)=="string"?e.fontFamily.trim():"",n=typeof(e==null?void 0:e.fontStyle)=="string"?e.fontStyle.trim():"";return!!pigmaMappedPhotoshopFontName(t,n)}function pigmaEditableTextIsNotoCjkVariableFont(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return/^noto(sans|serif)(cjk)?(kr|jp|sc|tc|hk)$/.test(t)}function pigmaEditableTextFontWeight(e){let t=Number(e&&e.fontWeight);return Number.isFinite(t)?t:pigmaPhotoshopFontWeight(e&&e.fontStyle)}function pigmaEditableTextShouldFauxBold(e){return pigmaEditableTextFontWeight(e)>=600&&!pigmaEditableTextHasMappedFontFace(e)&&!pigmaEditableTextIsNotoCjkVariableFont(e)}function pigmaEditableTextShouldFauxItalic(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontStyle);return/(italic|oblique)/.test(t)&&!pigmaEditableTextHasMappedFontFace(e)&&!pigmaEditableTextIsNotoCjkVariableFont(e)}function pigmaEditableTextSyntheticFontStyle(e){return 0}function pigmaEditableTextFontScript(e){return pigmaEditableTextIsNotoCjkVariableFont(e)?4:0}function pigmaEditableTextFontType(e){return pigmaEditableTextIsNotoCjkVariableFont(e)?1:0}function pigmaApplyEditableTextFontFaceStyle(e,t){t&&(pigmaEditableTextShouldFauxBold(e)&&(t.fauxBold=!0),pigmaEditableTextShouldFauxItalic(e)&&(t.fauxItalic=!0))}function editableTextFontDescriptor(e){return{name:resolveEditableTextFontName(e),script:pigmaEditableTextFontScript(e),type:pigmaEditableTextFontType(e),synthetic:pigmaEditableTextSyntheticFontStyle(e)}}'
$uiEditableTextBaselineShiftFind = 'function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize};return e.fillColor&&(n.fillColor=Uw(e.fillColor)),e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(t)>=.01&&(n.baselineShift=t),n}'
$uiEditableTextBaselineShiftLegacyReplace = 'function pigmaEditableTextLineGapBaselineShift(e){let t=Number(e&&e.fontSize),n=Number(e&&e.lineHeightPx);return!Number.isFinite(t)||t<=0||!Number.isFinite(n)||n<=t+.01?0:we(ae(t-n,-t,0))}function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(t),r=Number.isFinite(n)?n:0,i=pigmaEditableTextLineGapBaselineShift(e);return Math.abs(i)>Math.abs(r)?i:we(r)}function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize},r=pigmaEditableTextResolvedBaselineShift(e,t);return pigmaApplyEditableTextFontFaceStyle(e,n),e.fillColor&&(n.fillColor=Uw(e.fillColor)),e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(r)>=.01&&(n.baselineShift=r),n}'
$uiEditableTextBaselineShiftPreviousReplace = 'function pigmaEditableTextLineGapBaselineShift(e){return 0}function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift);return Number.isFinite(n)?we(n):0}function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize},r=pigmaEditableTextResolvedBaselineShift(e,t);return e.fillColor&&(n.fillColor=Uw(e.fillColor)),e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(r)>=.01&&(n.baselineShift=r),n}'
$uiEditableTextBaselineShiftNoEditorReplace = 'function pigmaEditableTextLineGapBaselineShift(e){return 0}function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift);return Number.isFinite(n)?we(n):0}function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize},r=pigmaEditableTextResolvedBaselineShift(e,t);return pigmaApplyEditableTextFontFaceStyle(e,n),e.fillColor&&(n.fillColor=Uw(e.fillColor)),e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(r)>=.01&&(n.baselineShift=r),n}'
$uiEditableTextBaselineShiftEditorPreviousReplace = 'function pigmaEditableTextLineGapBaselineShift(e){return 0}function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0;return we(i+a)}function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize},r=pigmaEditableTextResolvedBaselineShift(e,t);return pigmaApplyEditableTextFontFaceStyle(e,n),e.fillColor&&(n.fillColor=Uw(e.fillColor)),e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(r)>=.01&&(n.baselineShift=r),n}'
$uiEditableTextBaselineShiftLgEiUpwardReplace = 'function pigmaEditableTextLineGapBaselineShift(e){return 0}function pigmaEditableTextIsLgEiFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"||t==="lgeitext"||t==="lgeitextttf"}function pigmaEditableTextFontSizeCategory(e){let t=Number(e&&e.fontSize);return!Number.isFinite(t)||t<=0?0:t<=18?1:t<=24?2:t<=32?3:t<=48?4:5}function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return .8;case 2:return 1.8;case 3:return 3.2;case 4:return 5.2;case 5:return 7.2;default:return 0}}function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.15;case 2:return -.45;case 3:return -.9;case 4:return -1.35;case 5:return -1.8;default:return 0}}function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0,o=Math.abs(a)>=.01?0:pigmaEditableTextLgEiBaselineShift(e);return we(i+a+o)}function pigmaEditableTextResolvedLeading(e){if(!pigmaEditableTextIsLgEiFamily(e))return null;let t=Number(e&&e.lineHeightPx),n=pigmaEditableTextLgEiLeadingDelta(e),r=Number(e&&e.fontSize);if(Number.isFinite(t)&&t>0)return Math.max(1,we(t+n));return Number.isFinite(r)&&r>0?Math.max(1,we(r*1.2+n)):null}function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize},r=pigmaEditableTextResolvedBaselineShift(e,t),i=pigmaEditableTextResolvedLeading(e);return pigmaApplyEditableTextFontFaceStyle(e,n),e.fillColor&&(n.fillColor=Uw(e.fillColor)),i!==null?(n.leading=i,n.autoLeading=!1):e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(r)>=.01&&(n.baselineShift=r),n}'
$uiEditableTextBaselineShiftReplace = 'function pigmaEditableTextLineGapBaselineShift(e){return 0}function pigmaEditableTextIsLgEiFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"||t==="lgeitext"||t==="lgeitextttf"}function pigmaEditableTextFontSizeCategory(e){let t=Number(e&&e.fontSize);return!Number.isFinite(t)||t<=0?0:t<=18?1:t<=24?2:t<=32?3:t<=48?4:5}function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.8;case 2:return -1.8;case 3:return -3.2;case 4:return -5.2;case 5:return -7.2;default:return 0}}function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.15;case 2:return -.45;case 3:return -.9;case 4:return -1.35;case 5:return -1.8;default:return 0}}function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0,o=Math.abs(a)>=.01?0:pigmaEditableTextLgEiBaselineShift(e);return we(i+a+o)}function pigmaEditableTextResolvedLeading(e){if(!pigmaEditableTextIsLgEiFamily(e))return null;let t=Number(e&&e.lineHeightPx),n=pigmaEditableTextLgEiLeadingDelta(e),r=Number(e&&e.fontSize);if(Number.isFinite(t)&&t>0)return Math.max(1,we(t+n));return Number.isFinite(r)&&r>0?Math.max(1,we(r*1.2+n)):null}function kh(e,t=0){let n={font:editableTextFontDescriptor(e),fontSize:e.fontSize},r=pigmaEditableTextResolvedBaselineShift(e,t),i=pigmaEditableTextResolvedLeading(e);return pigmaApplyEditableTextFontFaceStyle(e,n),e.fillColor&&(n.fillColor=Uw(e.fillColor)),i!==null?(n.leading=i,n.autoLeading=!1):e.lineHeightPx!==null?(n.leading=e.lineHeightPx,n.autoLeading=!1):n.autoLeading=!0,e.tracking!==0&&(n.tracking=e.tracking,n.autoKerning=!1),e.fontCaps!==0&&(n.fontCaps=e.fontCaps),e.underline&&(n.underline=!0),e.strikethrough&&(n.strikethrough=!0),Math.abs(r)>=.01&&(n.baselineShift=r),n}'
$uiEditableTextBaselineShiftLgEiDownwardPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftLgEiPerSizePreviousReplace = $uiEditableTextBaselineShiftReplace.Replace('case 1:return -.8;case 2:return -1.8;case 3:return -3.2;case 4:return -5.2;case 5:return -7.2', 'case 1:return -6.4;case 2:return -10.5;case 3:return -10.8;case 4:return -5.2;case 5:return -7.2').Replace('case 1:return -.15;case 2:return -.45;case 3:return -.9;case 4:return -1.35;case 5:return -1.8', 'case 1:return 0;case 2:return -1.3;case 3:return -3.1;case 4:return -1.35;case 5:return -1.8')
$uiEditableTextBaselineShiftLgEiLineHeightPreviousReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.8;case 2:return -1.8;case 3:return -3.2;case 4:return -5.2;case 5:return -7.2;default:return 0}}', 'function pigmaEditableTextLgEiLineHeightPx(e){let t=Number(e&&e.lineHeightPx);return Number.isFinite(t)&&t>0?t:null}function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);return!Number.isFinite(t)||t<=0?0:t<=18?-6.4:t<=24?n===null||n<=t+.5?-8.2:-10.5:t<=32?n>=44&&n<=52?-14.2:-10.8:t<=48?-5.2:-7.2}').Replace('function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.15;case 2:return -.45;case 3:return -.9;case 4:return -1.35;case 5:return -1.8;default:return 0}}', 'function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return 0;case 2:return -1.3;case 3:return -3.1;case 4:return -1.35;case 5:return -1.8;default:return 0}}')
$uiEditableTextBaselineShiftLgEiAutoPreviousReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.8;case 2:return -1.8;case 3:return -3.2;case 4:return -5.2;case 5:return -7.2;default:return 0}}', 'function pigmaEditableTextLgEiLineHeightPx(e){let t=Number(e&&e.lineHeightPx);return Number.isFinite(t)&&t>0?t:null}function pigmaEditableTextLgEiAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=48?-5.2:-7.2}function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);return!Number.isFinite(t)||t<=0?0:n===null?pigmaEditableTextLgEiAutoBaselineShift(t):t<=18?-6.4:t<=24?n<=t+.5?-8.2:-10.5:t<=32?n>=44&&n<=52?-14.2:-10.8:t<=48?-5.2:-7.2}').Replace('function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.15;case 2:return -.45;case 3:return -.9;case 4:return -1.35;case 5:return -1.8;default:return 0}}', 'function pigmaEditableTextLgEiAutoLeadingDelta(t){return t<=18?0:t<=20?-.5:t<=24?0:t<=32?-1.1:t<=48?-1.35:-1.8}function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);if(Number.isFinite(t)&&t>0&&n===null)return pigmaEditableTextLgEiAutoLeadingDelta(t);switch(pigmaEditableTextFontSizeCategory(e)){case 1:return 0;case 2:return -1.3;case 3:return -3.1;case 4:return -1.35;case 5:return -1.8;default:return 0}}')
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.8;case 2:return -1.8;case 3:return -3.2;case 4:return -5.2;case 5:return -7.2;default:return 0}}', 'function pigmaEditableTextLgEiLineHeightPx(e){let t=Number(e&&e.lineHeightPx);return Number.isFinite(t)&&t>0?t:null}function pigmaEditableTextLgEiAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=48?-5.2:-7.2}function pigmaEditableTextLgEiExactBaselineShift(t,n){let r=n/t;return t<=18?r<=1.21?-8.4:-6.4:t<=24?r<=1.21?-10.2:-10.5:t<=32?r<=1.21?-14:n>=44&&n<=52?-14.2:-10.8:t<=48?-5.2:-7.2}function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);return!Number.isFinite(t)||t<=0?0:n===null?pigmaEditableTextLgEiAutoBaselineShift(t):pigmaEditableTextLgEiExactBaselineShift(t,n)}').Replace('function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;switch(pigmaEditableTextFontSizeCategory(e)){case 1:return -.15;case 2:return -.45;case 3:return -.9;case 4:return -1.35;case 5:return -1.8;default:return 0}}', 'function pigmaEditableTextLgEiAutoLeadingDelta(t){return t<=18?0:t<=20?-.5:t<=24?0:t<=32?-1.1:t<=48?-1.35:-1.8}function pigmaEditableTextLgEiExactLeadingDelta(t,n){let r=n/t;return r<=1.21?0:t<=18?0:t<=24?-1.3:t<=32?-3.1:t<=48?-1.35:-1.8}function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);if(!Number.isFinite(t)||t<=0)return 0;return n===null?pigmaEditableTextLgEiAutoLeadingDelta(t):pigmaEditableTextLgEiExactLeadingDelta(t,n)}')
$uiEditableTextBaselineShiftLgEiExactPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=48?-5.2:-7.2}', 'function pigmaEditableTextLgEiAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12:t<=48?-15:t<=56?-18:t<=64?-22:t<=80?-27:t<=96?-33:t<=112?-38:t<=128?-44:-t*.34}').Replace('function pigmaEditableTextLgEiAutoLeadingDelta(t){return t<=18?0:t<=20?-.5:t<=24?0:t<=32?-1.1:t<=48?-1.35:-1.8}', 'function pigmaEditableTextLgEiAutoLeadingDelta(t){return t<=18?0:t<=20?-.5:t<=24?0:t<=32?-1.1:t<=40?-1.6:t<=48?-2.2:t<=56?-2.6:t<=64?-3:t<=80?-3.6:t<=96?-4.6:t<=112?-5.4:t<=128?-6.2:-t*.05}')
$uiEditableTextBaselineShiftLgEiLargeAutoPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextIsLgEiFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"||t==="lgeitext"||t==="lgeitextttf"}', 'function pigmaEditableTextIsLgEiHeadlineFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"}function pigmaEditableTextIsLgEiTextFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeitext"||t==="lgeitextttf"}function pigmaEditableTextIsLgEiFamily(e){return pigmaEditableTextIsLgEiHeadlineFamily(e)||pigmaEditableTextIsLgEiTextFamily(e)}').Replace('function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);return!Number.isFinite(t)||t<=0?0:n===null?pigmaEditableTextLgEiAutoBaselineShift(t):pigmaEditableTextLgEiExactBaselineShift(t,n)}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-16.5:t<=48?-20:t<=56?-28:t<=64?-34:t<=80?-43:t<=96?-52:t<=112?-61:t<=128?-70:-t*.55}function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=18?-5.6:t<=24?-7.6:t<=32?-10.5:t<=40?-9.5:t<=44?-12.5:t<=48?-15.5:t<=56?-22:t<=64?-27:t<=80?-34:t<=96?-41:t<=112?-48:t<=128?-55:-t*.43;if(r<=1.21)return t<=18?-5.8:t<=24?-8.2:t<=32?-11.2:t<=40?-12:t<=44?-14.5:t<=48?-18:t<=56?-25:t<=64?-31:t<=80?-39:t<=96?-47:t<=112?-55:t<=128?-63:-t*.49;return t<=18?-6.2:t<=24?-9:t<=32?-11:t<=40?-14:t<=44?-17:t<=48?-21:t<=56?-28:t<=64?-35:t<=80?-44:t<=96?-53:t<=112?-62:t<=128?-71:-t*.55}function pigmaEditableTextLgEiBaselineShift(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);if(!Number.isFinite(t)||t<=0)return 0;if(pigmaEditableTextIsLgEiTextFamily(e))return n===null?pigmaEditableTextLgEiTextAutoBaselineShift(t):pigmaEditableTextLgEiTextExactBaselineShift(t,n);return n===null?pigmaEditableTextLgEiAutoBaselineShift(t):pigmaEditableTextLgEiExactBaselineShift(t,n)}').Replace('function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);if(!Number.isFinite(t)||t<=0)return 0;return n===null?pigmaEditableTextLgEiAutoLeadingDelta(t):pigmaEditableTextLgEiExactLeadingDelta(t,n)}', 'function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=48?-2.4:t<=56?-3.5:t<=64?-4.3:t<=80?-5.3:t<=96?-6.4:t<=112?-7.5:t<=128?-8.6:-t*.067}function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.5:t<=32?-1:t<=40?-1.3:t<=48?-1.8:t<=56?-2.4:t<=64?-2.9:t<=80?-3.7:t<=96?-4.5:t<=112?-5.3:t<=128?-6.1:-t*.048;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-2:t<=48?-2.9:t<=56?-3.8:t<=64?-4.8:t<=80?-6:t<=96?-7.2:t<=112?-8.4:t<=128?-9.6:-t*.075}function pigmaEditableTextLgEiLeadingDelta(e){if(!pigmaEditableTextIsLgEiFamily(e))return 0;let t=Number(e&&e.fontSize),n=pigmaEditableTextLgEiLineHeightPx(e);if(!Number.isFinite(t)||t<=0)return 0;if(pigmaEditableTextIsLgEiTextFamily(e))return n===null?pigmaEditableTextLgEiTextAutoLeadingDelta(t):pigmaEditableTextLgEiTextExactLeadingDelta(t,n);return n===null?pigmaEditableTextLgEiAutoLeadingDelta(t):pigmaEditableTextLgEiExactLeadingDelta(t,n)}')
$uiEditableTextBaselineShiftLgEiTextPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-16.5:t<=48?-20:t<=56?-28:t<=64?-34:t<=80?-43:t<=96?-52:t<=112?-61:t<=128?-70:-t*.55}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-10.5:t<=47?-12.5:t<=48?-33:t<=56?-42:t<=64?-51:t<=80?-64:t<=96?-77:t<=112?-90:t<=128?-103:-t*.8}').Replace('function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=18?-5.6:t<=24?-7.6:t<=32?-10.5:t<=40?-9.5:t<=44?-12.5:t<=48?-15.5:t<=56?-22:t<=64?-27:t<=80?-34:t<=96?-41:t<=112?-48:t<=128?-55:-t*.43;if(r<=1.21)return t<=18?-5.8:t<=24?-8.2:t<=32?-11.2:t<=40?-12:t<=44?-14.5:t<=48?-18:t<=56?-25:t<=64?-31:t<=80?-39:t<=96?-47:t<=112?-55:t<=128?-63:-t*.49;return t<=18?-6.2:t<=24?-9:t<=32?-11:t<=40?-14:t<=44?-17:t<=48?-21:t<=56?-28:t<=64?-35:t<=80?-44:t<=96?-53:t<=112?-62:t<=128?-71:-t*.55}', 'function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=9?-1.8:t<=18?-2.8:t<=24?-2.8:t<=32?-4.2:t<=40?-7.2:t<=44?-6.4:t<=47?-7.5:t<=48?-25:t<=56?-32:t<=64?-39:t<=80?-49:t<=96?-59:t<=112?-69:t<=128?-79:-t*.62;if(r<=1.21)return t<=18?-5:t<=24?-5.2:t<=32?-6.8:t<=40?-8.8:t<=44?-10:t<=47?-11.5:t<=48?-27:t<=56?-34:t<=64?-41:t<=80?-52:t<=96?-63:t<=112?-74:t<=128?-85:-t*.66;return t<=18?-6.2:t<=24?-9:t<=32?-11:t<=40?-19:t<=44?-21:t<=47?-21:t<=48?-36:t<=56?-45:t<=64?-54:t<=80?-68:t<=96?-82:t<=112?-96:t<=128?-110:-t*.86}').Replace('function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=48?-2.4:t<=56?-3.5:t<=64?-4.3:t<=80?-5.3:t<=96?-6.4:t<=112?-7.5:t<=128?-8.6:-t*.067}', 'function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=44?-1:t<=47?-1.2:t<=48?-4.5:t<=56?-5.8:t<=64?-7:t<=80?-8.8:t<=96?-10.6:t<=112?-12.4:t<=128?-14.2:-t*.11}').Replace('function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.5:t<=32?-1:t<=40?-1.3:t<=48?-1.8:t<=56?-2.4:t<=64?-2.9:t<=80?-3.7:t<=96?-4.5:t<=112?-5.3:t<=128?-6.1:-t*.048;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-2:t<=48?-2.9:t<=56?-3.8:t<=64?-4.8:t<=80?-6:t<=96?-7.2:t<=112?-8.4:t<=128?-9.6:-t*.075}', 'function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.2:t<=32?-.4:t<=40?-.7:t<=44?-.8:t<=47?-1:t<=48?-2.8:t<=56?-3.6:t<=64?-4.5:t<=80?-5.7:t<=96?-6.9:t<=112?-8.1:t<=128?-9.3:-t*.073;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-3.4:t<=44?-3.8:t<=47?-3.4:t<=48?-6:t<=56?-7.4:t<=64?-8.8:t<=80?-11:t<=96?-13.2:t<=112?-15.4:t<=128?-17.6:-t*.138}')
$uiEditableTextBaselineShiftLgEiTextSecondPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-10.5:t<=47?-12.5:t<=48?-33:t<=56?-42:t<=64?-51:t<=80?-64:t<=96?-77:t<=112?-90:t<=128?-103:-t*.8}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-10.5:t<=47?-12.5:t<=48?-26:t<=52?-29:t<=56?-32:t<=60?-35:t<=64?-38:t<=80?-48:t<=96?-58:t<=112?-68:t<=128?-78:-t*.61}').Replace('function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=9?-1.8:t<=18?-2.8:t<=24?-2.8:t<=32?-4.2:t<=40?-7.2:t<=44?-6.4:t<=47?-7.5:t<=48?-25:t<=56?-32:t<=64?-39:t<=80?-49:t<=96?-59:t<=112?-69:t<=128?-79:-t*.62;if(r<=1.21)return t<=18?-5:t<=24?-5.2:t<=32?-6.8:t<=40?-8.8:t<=44?-10:t<=47?-11.5:t<=48?-27:t<=56?-34:t<=64?-41:t<=80?-52:t<=96?-63:t<=112?-74:t<=128?-85:-t*.66;return t<=18?-6.2:t<=24?-9:t<=32?-11:t<=40?-19:t<=44?-21:t<=47?-21:t<=48?-36:t<=56?-45:t<=64?-54:t<=80?-68:t<=96?-82:t<=112?-96:t<=128?-110:-t*.86}', 'function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=9?-1.6:t<=12?-2.2:t<=18?-2.8:t<=24?-2.8:t<=28?-4.2:t<=32?-4.8:t<=40?-6.2:t<=44?-5.8:t<=47?-6.8:t<=48?-18:t<=52?-21:t<=56?-24:t<=60?-27:t<=64?-30:t<=80?-38:t<=96?-46:t<=112?-54:t<=128?-62:-t*.48;if(r<=1.21)return t<=18?-5:t<=24?-5.2:t<=28?-6.5:t<=32?-7.2:t<=40?-7.5:t<=44?-8.6:t<=47?-10:t<=48?-20:t<=52?-23:t<=56?-26:t<=60?-29:t<=64?-32:t<=80?-41:t<=96?-50:t<=112?-59:t<=128?-68:-t*.53;return t<=18?-6.2:t<=24?-9:t<=28?-11:t<=32?-12:t<=40?-15.5:t<=44?-17:t<=47?-17:t<=48?-27:t<=52?-30:t<=56?-33:t<=60?-36:t<=64?-39:t<=80?-50:t<=96?-61:t<=112?-72:t<=128?-83:-t*.65}').Replace('function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=44?-1:t<=47?-1.2:t<=48?-4.5:t<=56?-5.8:t<=64?-7:t<=80?-8.8:t<=96?-10.6:t<=112?-12.4:t<=128?-14.2:-t*.11}', 'function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=44?-1:t<=47?-1.2:t<=48?-3.2:t<=52?-3.8:t<=56?-4.4:t<=60?-5:t<=64?-5.6:t<=80?-7:t<=96?-8.4:t<=112?-9.8:t<=128?-11.2:-t*.087}').Replace('function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.2:t<=32?-.4:t<=40?-.7:t<=44?-.8:t<=47?-1:t<=48?-2.8:t<=56?-3.6:t<=64?-4.5:t<=80?-5.7:t<=96?-6.9:t<=112?-8.1:t<=128?-9.3:-t*.073;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-3.4:t<=44?-3.8:t<=47?-3.4:t<=48?-6:t<=56?-7.4:t<=64?-8.8:t<=80?-11:t<=96?-13.2:t<=112?-15.4:t<=128?-17.6:-t*.138}', 'function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.2:t<=32?-.4:t<=40?-.6:t<=44?-.7:t<=47?-.9:t<=48?-2:t<=52?-2.4:t<=56?-2.8:t<=60?-3:t<=64?-3.2:t<=80?-4.2:t<=96?-5.2:t<=112?-6.2:t<=128?-7.2:-t*.056;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-2.6:t<=44?-3:t<=47?-2.8:t<=48?-4.5:t<=52?-5:t<=56?-5.5:t<=60?-6:t<=64?-6.5:t<=80?-8.2:t<=96?-9.9:t<=112?-11.6:t<=128?-13.3:-t*.104}')
$uiEditableTextBaselineShiftLgEiTextThirdPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-10.5:t<=47?-12.5:t<=48?-26:t<=52?-29:t<=56?-32:t<=60?-35:t<=64?-38:t<=80?-48:t<=96?-58:t<=112?-68:t<=128?-78:-t*.61}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-10.5:t<=47?-12.5:t<=48?-31:t<=52?-35:t<=56?-39:t<=60?-43:t<=64?-47:t<=80?-59:t<=96?-71:t<=112?-83:t<=128?-95:-t*.74}').Replace('function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=9?-1.6:t<=12?-2.2:t<=18?-2.8:t<=24?-2.8:t<=28?-4.2:t<=32?-4.8:t<=40?-6.2:t<=44?-5.8:t<=47?-6.8:t<=48?-18:t<=52?-21:t<=56?-24:t<=60?-27:t<=64?-30:t<=80?-38:t<=96?-46:t<=112?-54:t<=128?-62:-t*.48;if(r<=1.21)return t<=18?-5:t<=24?-5.2:t<=28?-6.5:t<=32?-7.2:t<=40?-7.5:t<=44?-8.6:t<=47?-10:t<=48?-20:t<=52?-23:t<=56?-26:t<=60?-29:t<=64?-32:t<=80?-41:t<=96?-50:t<=112?-59:t<=128?-68:-t*.53;return t<=18?-6.2:t<=24?-9:t<=28?-11:t<=32?-12:t<=40?-15.5:t<=44?-17:t<=47?-17:t<=48?-27:t<=52?-30:t<=56?-33:t<=60?-36:t<=64?-39:t<=80?-50:t<=96?-61:t<=112?-72:t<=128?-83:-t*.65}', 'function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=9?-1.6:t<=12?-2.2:t<=18?-2.8:t<=24?-2.8:t<=28?-4.2:t<=32?-4.8:t<=40?-6.2:t<=44?-5.8:t<=47?-6.8:t<=48?-20:t<=52?-23.5:t<=56?-27:t<=60?-30.5:t<=64?-34:t<=80?-43:t<=96?-52:t<=112?-61:t<=128?-70:-t*.55;if(r<=1.21)return t<=18?-5:t<=24?-5.2:t<=28?-6.5:t<=32?-7.2:t<=40?-7.5:t<=44?-8.6:t<=47?-10:t<=48?-24:t<=52?-28:t<=56?-32:t<=60?-36:t<=64?-40:t<=80?-51:t<=96?-62:t<=112?-73:t<=128?-84:-t*.66;return t<=18?-6.2:t<=24?-9:t<=28?-11:t<=32?-12:t<=40?-15.5:t<=44?-17:t<=47?-17:t<=48?-35:t<=52?-40:t<=56?-45:t<=60?-50:t<=64?-55:t<=80?-69:t<=96?-83:t<=112?-97:t<=128?-111:-t*.87}').Replace('function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=44?-1:t<=47?-1.2:t<=48?-3.2:t<=52?-3.8:t<=56?-4.4:t<=60?-5:t<=64?-5.6:t<=80?-7:t<=96?-8.4:t<=112?-9.8:t<=128?-11.2:-t*.087}', 'function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=44?-1:t<=47?-1.2:t<=48?-4:t<=52?-4.7:t<=56?-5.4:t<=60?-6.1:t<=64?-6.8:t<=80?-8.5:t<=96?-10.2:t<=112?-11.9:t<=128?-13.6:-t*.106}').Replace('function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.2:t<=32?-.4:t<=40?-.6:t<=44?-.7:t<=47?-.9:t<=48?-2:t<=52?-2.4:t<=56?-2.8:t<=60?-3:t<=64?-3.2:t<=80?-4.2:t<=96?-5.2:t<=112?-6.2:t<=128?-7.2:-t*.056;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-2.6:t<=44?-3:t<=47?-2.8:t<=48?-4.5:t<=52?-5:t<=56?-5.5:t<=60?-6:t<=64?-6.5:t<=80?-8.2:t<=96?-9.9:t<=112?-11.6:t<=128?-13.3:-t*.104}', 'function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.2:t<=32?-.4:t<=40?-.6:t<=44?-.7:t<=47?-.9:t<=48?-2.4:t<=52?-2.8:t<=56?-3.2:t<=60?-3.6:t<=64?-4:t<=80?-5.1:t<=96?-6.2:t<=112?-7.3:t<=128?-8.4:-t*.066;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-2.6:t<=44?-3:t<=47?-2.8:t<=48?-5.6:t<=52?-6.3:t<=56?-7:t<=60?-7.7:t<=64?-8.4:t<=80?-10.5:t<=96?-12.6:t<=112?-14.7:t<=128?-16.8:-t*.131}')
$uiEditableTextBaselineShiftLgEiTextTablePreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12.5:t<=44?-10.5:t<=47?-12.5:t<=48?-31:t<=52?-35:t<=56?-39:t<=60?-43:t<=64?-47:t<=80?-59:t<=96?-71:t<=112?-83:t<=128?-95:-t*.74}', 'function pigmaEditableTextLgEiTextRatio(t){return Math.min(2,Math.max(1,Number.isFinite(t)?t:1))}function pigmaEditableTextLgEiTextAutoRatio(t){return t>=48?1.37:1.25}function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,t-48),a=r-1,o=Math.max(0,t-24),s=Math.max(0,t-32),u=Math.max(0,18-t);if(t>=48){let l=20+.875*i+a*(13.333+.542*i)+a*a*(33.333+.417*i);return Math.max(0,we(l))}let l=4.262-.0997*t+.001834*t*t+.3017*o-.00847*o*o+.01426*s+a*(-11.378+.7613*t-.3722*o+.145*s)+a*a*(.4382*t-.5191*o)-.2051*u+.8378*u*a;return Math.max(0,we(l))}function pigmaEditableTextLgEiTextAutoBaselineShift(t){return -pigmaEditableTextLgEiTextBaselineFormula(t,pigmaEditableTextLgEiTextAutoRatio(t))}').Replace('function pigmaEditableTextLgEiTextExactBaselineShift(t,n){let r=n/t;if(r<=1.05)return t<=9?-1.6:t<=12?-2.2:t<=18?-2.8:t<=24?-2.8:t<=28?-4.2:t<=32?-4.8:t<=40?-6.2:t<=44?-5.8:t<=47?-6.8:t<=48?-20:t<=52?-23.5:t<=56?-27:t<=60?-30.5:t<=64?-34:t<=80?-43:t<=96?-52:t<=112?-61:t<=128?-70:-t*.55;if(r<=1.21)return t<=18?-5:t<=24?-5.2:t<=28?-6.5:t<=32?-7.2:t<=40?-7.5:t<=44?-8.6:t<=47?-10:t<=48?-24:t<=52?-28:t<=56?-32:t<=60?-36:t<=64?-40:t<=80?-51:t<=96?-62:t<=112?-73:t<=128?-84:-t*.66;return t<=18?-6.2:t<=24?-9:t<=28?-11:t<=32?-12:t<=40?-15.5:t<=44?-17:t<=47?-17:t<=48?-35:t<=52?-40:t<=56?-45:t<=60?-50:t<=64?-55:t<=80?-69:t<=96?-83:t<=112?-97:t<=128?-111:-t*.87}', 'function pigmaEditableTextLgEiTextExactBaselineShift(t,n){return -pigmaEditableTextLgEiTextBaselineFormula(t,n/t)}').Replace('function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return t<=18?0:t<=20?-.25:t<=24?-.4:t<=32?-.8:t<=40?-1.5:t<=44?-1:t<=47?-1.2:t<=48?-4:t<=52?-4.7:t<=56?-5.4:t<=60?-6.1:t<=64?-6.8:t<=80?-8.5:t<=96?-10.2:t<=112?-11.9:t<=128?-13.6:-t*.106}', 'function pigmaEditableTextLgEiTextLeadingFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,t-48),a=Math.max(0,r-1.05);if(a<=.001)return 0;if(t>=48){let o=a*(12.533+.6*i)+a*a*(-2.667-.5*i);return Math.max(0,we(o))}let o=Math.max(0,t-18),s=Math.max(0,t-32),u=a*(-.133+.4724*o-.01391*o*o+.214*s)+a*a*(-.1045*o+.4179*s);return Math.max(0,we(u))}function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return -pigmaEditableTextLgEiTextLeadingFormula(t,pigmaEditableTextLgEiTextAutoRatio(t))}').Replace('function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){let r=n/t;if(r<=1.05)return 0;if(r<=1.21)return t<=18?0:t<=24?-.2:t<=32?-.4:t<=40?-.6:t<=44?-.7:t<=47?-.9:t<=48?-2.4:t<=52?-2.8:t<=56?-3.2:t<=60?-3.6:t<=64?-4:t<=80?-5.1:t<=96?-6.2:t<=112?-7.3:t<=128?-8.4:-t*.066;return t<=18?0:t<=24?-.7:t<=32?-1.4:t<=40?-2.6:t<=44?-3:t<=47?-2.8:t<=48?-5.6:t<=52?-6.3:t<=56?-7:t<=60?-7.7:t<=64?-8.4:t<=80?-10.5:t<=96?-12.6:t<=112?-14.7:t<=128?-16.8:-t*.131}', 'function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){return -pigmaEditableTextLgEiTextLeadingFormula(t,n/t)}')
$uiEditableTextBaselineShiftLgEiTextFormulaPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('if(t>=48){let l=20+.875*i+a*(13.333+.542*i)+a*a*(33.333+.417*i);return Math.max(0,we(l))}', 'if(t>=48){let l=20+.875*i+Math.min(1.4,Math.max(0,a/.5))*(7-.125*i);return Math.max(0,we(l))}')
$uiEditableTextBaselineShiftLgEiTextRatioPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextAutoRatio(t){return t>=48?1.37:1.25}', 'function pigmaEditableTextLgEiTextAutoRatio(t){return 1.25}').Replace('Math.min(1.4,Math.max(0,a/.5))*(7-.125*i)', 'Math.min(1.2,Math.max(0,a/.5))*(4-.07*i)')
$uiEditableTextBaselineShiftLgEiTextAutoCleanPreviousReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextAutoRatio(t){return 1.25}', 'function pigmaEditableTextLgEiTextAutoRatio(t){return t>=48?1.25:1.25}')
$uiEditableTextBaselineShiftLgEiTextHighRatioPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('if(t>=48){let l=20+.875*i+Math.min(1.2,Math.max(0,a/.5))*(4-.07*i);return Math.max(0,we(l))}', 'if(t>=48){let h=Math.min(1,Math.max(0,a/.25)),q=Math.max(0,(a-.25)/.25),l=20+.875*i+h*(2-.035*i)-q*(8+.15*i);return Math.max(0,we(l))}')
$uiEditableTextBaselineShiftLgEiTextHighRatioStartPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('l=20+.875*i+h*(2-.035*i)-q*(8+.15*i)', 'l=20+.875*i+h*(2-.035*i)-q*(8+.15*i+Math.max(0,5-i)*1.6)')
$uiEditableTextBaselineShiftLgEiTextUnifiedPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftLgEiTextHighRatioStartPreviousReplace = $uiEditableTextBaselineShiftLgEiTextUnifiedPreviousReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextRatio(t){return Math.min(2,Math.max(1,Number.isFinite(t)?t:1))}function pigmaEditableTextLgEiTextAutoRatio(t){return 1.25}function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,t-48),a=r-1,o=Math.max(0,t-24),s=Math.max(0,t-32),u=Math.max(0,18-t);if(t>=48){let h=Math.min(1,Math.max(0,a/.25)),q=Math.max(0,(a-.25)/.25),l=20+.875*i+h*(2-.035*i)-q*(8+.15*i+Math.max(0,5-i)*1.6);return Math.max(0,we(l))}let l=4.262-.0997*t+.001834*t*t+.3017*o-.00847*o*o+.01426*s+a*(-11.378+.7613*t-.3722*o+.145*s)+a*a*(.4382*t-.5191*o)-.2051*u+.8378*u*a;return Math.max(0,we(l))}function pigmaEditableTextLgEiTextAutoBaselineShift(t){return -pigmaEditableTextLgEiTextBaselineFormula(t,pigmaEditableTextLgEiTextAutoRatio(t))}function pigmaEditableTextLgEiTextExactBaselineShift(t,n){return -pigmaEditableTextLgEiTextBaselineFormula(t,n/t)}', 'function pigmaEditableTextLgEiTextRatio(t){return Math.min(2,Math.max(1,Number.isFinite(t)?t:1))}function pigmaEditableTextLgEiTextSmooth(t){return t=t<0?0:t>1?1:t,t*t*(3-2*t)}function pigmaEditableTextLgEiTextClampBaseline(t,n){return we(Math.min(t*1.1,Math.max(-t*.8,n)))}function pigmaEditableTextLgEiTextLowBaseline(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=r-1,a=Math.max(0,t-24),o=Math.max(0,t-32),s=Math.max(0,18-t),u=4.262-.0997*t+.001834*t*t+.3017*a-.00847*a*a+.01426*o+i*(-11.378+.7613*t-.3722*a+.145*o)+i*i*(.4382*t-.5191*a)-.2051*s+.8378*s*i;return u}function pigmaEditableTextLgEiTextBaseBaseline(t){let n=Math.max(0,t-24),r=Math.max(0,t-32),i=Math.max(0,18-t),a=4.262-.0997*t+.001834*t*t+.3017*n-.00847*n*n+.01426*r-.2051*i,o=20+.875*Math.max(0,t-48),s=pigmaEditableTextLgEiTextSmooth(t-47);return a*(1-s)+o*s}function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let a=Math.max(0,t-48),o=pigmaEditableTextLgEiTextSmooth((t-46)/3),s=.55+.65*o+i*(.25+.55*o)+.008*a,u=t*(.45+.2*i)+16*i*(1-pigmaEditableTextLgEiTextSmooth((t-48)/8));return Math.min(i*t*s,u)}function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextBaseBaseline(t);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,i);let a=pigmaEditableTextLgEiTextLowBaseline(t,r),o=i-pigmaEditableTextLgEiTextLineHeightPressure(t,r),s=pigmaEditableTextLgEiTextSmooth((t-46)/3);return pigmaEditableTextLgEiTextClampBaseline(t,a*(1-s)+o*s)}function pigmaEditableTextLgEiTextAutoPressure(t){let n=pigmaEditableTextLgEiTextSmooth((t-40)/24),r=Math.max(0,t-48);return n*(2.2+.22*r)}function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25),r=pigmaEditableTextLgEiTextBaseBaseline(t)-pigmaEditableTextLgEiTextAutoPressure(t),i=pigmaEditableTextLgEiTextSmooth((t-40)/24);return -pigmaEditableTextLgEiTextClampBaseline(t,n*(1-i)+r*i)}function pigmaEditableTextLgEiTextExactBaselineShift(t,n){return -pigmaEditableTextLgEiTextBaselineFormula(t,n/t)}').Replace('function pigmaEditableTextLgEiTextLeadingFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,t-48),a=Math.max(0,r-1.05);if(a<=.001)return 0;if(t>=48){let o=a*(12.533+.6*i)+a*a*(-2.667-.5*i);return Math.max(0,we(o))}let o=Math.max(0,t-18),s=Math.max(0,t-32),u=a*(-.133+.4724*o-.01391*o*o+.214*s)+a*a*(-.1045*o+.4179*s);return Math.max(0,we(u))}function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return -pigmaEditableTextLgEiTextLeadingFormula(t,pigmaEditableTextLgEiTextAutoRatio(t))}function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){return -pigmaEditableTextLgEiTextLeadingFormula(t,n/t)}', 'function pigmaEditableTextLgEiTextLeadingFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-18),o=Math.max(0,t-32),s=i*(-.133+.4724*a-.01391*a*a+.214*o)+i*i*(-.1045*a+.4179*o),u=Math.max(0,t-48),l=i*(.18*t+.15*u)+i*i*(.03*t+.04*u),c=pigmaEditableTextLgEiTextSmooth((t-46)/6);return Math.max(0,we(s*(1-c)+l*c))}function pigmaEditableTextLgEiTextAutoLeadingDelta(t){return -pigmaEditableTextLgEiTextLeadingFormula(t,1.18)}function pigmaEditableTextLgEiTextExactLeadingDelta(t,n){return -pigmaEditableTextLgEiTextLeadingFormula(t,n/t)}')
$uiEditableTextBaselineShiftLgEiTextUnifiedNoCapPreviousReplace = $uiEditableTextBaselineShiftReplace.Replace('s=.55+.65*o+i*(.25+.55*o)+.008*a,u=t*(.45+.2*i)+16*i*(1-pigmaEditableTextLgEiTextSmooth((t-48)/8));return Math.min(i*t*s,u)', 's=.55+.65*o+i*(.25+.55*o)+.008*a;return i*t*s')
$uiEditableTextBaselineShiftLgEiTextEditorGatePreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let a=Math.max(0,t-48),o=pigmaEditableTextLgEiTextSmooth((t-46)/3),s=.55+.65*o+i*(.25+.55*o)+.008*a,u=t*(.45+.2*i)+16*i*(1-pigmaEditableTextLgEiTextSmooth((t-48)/8));return Math.min(i*t*s,u)}', 'function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-48),o=16+.15*a;return i*o}').Replace('function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-40),o=Math.max(0,t-48),s=2+a*.18+o*.05;return i*Math.min(8,s)}', 'function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-48),o=16+.15*a;return i*o}').Replace('let a=pigmaEditableTextLgEiTextLowBaseline(t,r),o=i-pigmaEditableTextLgEiTextLineHeightPressure(t,r),s=pigmaEditableTextLgEiTextSmooth((t-46)/3);return pigmaEditableTextLgEiTextClampBaseline(t,a*(1-s)+o*s)', 'let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r);return pigmaEditableTextLgEiTextClampBaseline(t,a)').Replace('let a=pigmaEditableTextLgEiTextLowBaseline(t,r),o=i+pigmaEditableTextLgEiTextLineHeightPressure(t,r),s=pigmaEditableTextLgEiTextSmooth(t-47);return pigmaEditableTextLgEiTextClampBaseline(t,a*(1-s)+o*s)', 'let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r);return pigmaEditableTextLgEiTextClampBaseline(t,a)').Replace('if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,i);let a=', 'if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r));let a=').Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25),r=pigmaEditableTextLgEiTextBaseBaseline(t)-pigmaEditableTextLgEiTextAutoPressure(t),i=pigmaEditableTextLgEiTextSmooth((t-40)/24);return -pigmaEditableTextLgEiTextClampBaseline(t,n*(1-i)+r*i)}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}').Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25),r=pigmaEditableTextLgEiTextBaseBaseline(t)+pigmaEditableTextLgEiTextLineHeightPressure(t,1.18),i=pigmaEditableTextLgEiTextSmooth(t-47);return -pigmaEditableTextLgEiTextClampBaseline(t,n*(1-i)+r*i)}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}').Replace('function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0,o=Math.abs(a)>=.01?0:pigmaEditableTextLgEiBaselineShift(e);return we(i+a+o)}', 'function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0,o=pigmaEditableTextLgEiBaselineShift(e);if(pigmaEditableTextIsLgEiTextFamily(e)&&Math.abs(o)>=.01)return we(i+o);return we(i+a+(Math.abs(a)>=.01?0:o))}')
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('if(pigmaEditableTextIsLgEiTextFamily(e)&&Math.abs(o)>=.01)return we(i+o)', 'if(pigmaEditableTextIsLgEiFamily(e)&&Math.abs(o)>=.01)return we(i+o)')
$uiEditableTextBaselineShiftLgEiTextExactLowPreviousReplace = $uiEditableTextBaselineShiftReplace.Replace('if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r));let a=', 'if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,i);let a=')
$uiEditableTextBaselineShiftLgEiTextLowBaselinePreviousReplace = $uiEditableTextBaselineShiftLgEiTextExactLowPreviousReplace.Replace('function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-48),o=16+.15*a;return i*o}', 'function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-40),o=Math.max(0,t-48),s=2+a*.18+o*.05;return i*Math.min(8,s)}').Replace('let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r);return pigmaEditableTextLgEiTextClampBaseline(t,a)', 'let a=pigmaEditableTextLgEiTextLowBaseline(t,r),o=i+pigmaEditableTextLgEiTextLineHeightPressure(t,r),s=pigmaEditableTextLgEiTextSmooth(t-47);return pigmaEditableTextLgEiTextClampBaseline(t,a*(1-s)+o*s)').Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25),r=pigmaEditableTextLgEiTextBaseBaseline(t)+pigmaEditableTextLgEiTextLineHeightPressure(t,1.18),i=pigmaEditableTextLgEiTextSmooth(t-47);return -pigmaEditableTextLgEiTextClampBaseline(t,n*(1-i)+r*i)}')
$uiEditableTextBaselineShiftLgEiTextHighlightPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-48),o=16+.15*a;return i*o}', 'function pigmaEditableTextLgEiTextLineHeightPressure(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.max(0,r-1.05);if(i<=.001)return 0;let a=Math.max(0,t-48),o=22+.2*a,s=36+.4*a;return Math.max(0,i*o-i*i*s)}function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}').Replace('function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextBaseBaseline(t);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r));let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r);return pigmaEditableTextLgEiTextClampBaseline(t,a)}', 'function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextLargeLowRatioDrift(t,r);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r)+i);let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r)+i;return pigmaEditableTextLgEiTextClampBaseline(t,a)}').Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18)+pigmaEditableTextLgEiTextLargeLowRatioDrift(t,1.25);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}')
$uiEditableTextBaselineShiftLgEiText65To128PreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}', 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}function pigmaEditableTextLgEiTextLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(i<=.001)return 0;let a=Math.max(0,t-64),o=7+.16*a,s=Math.min(.2,Math.max(0,r-1.05)),u=s*(16+1.4*a),l=Math.max(0,r-1.25),c=pigmaEditableTextLgEiTextSmooth((t-96)/32)*l*(22+.45*a);return i*(o+u+c)}function pigmaEditableTextLgEiTextAutoLargeSizeDrift(t){let n=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(n<=.001)return 0;let r=Math.max(0,t-64);return n*(3.2+.48*r)}').Replace('function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextLargeLowRatioDrift(t,r);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r)+i);let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r)+i;return pigmaEditableTextLgEiTextClampBaseline(t,a)}', 'function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextLargeLowRatioDrift(t,r)+pigmaEditableTextLgEiTextLargeSizeDrift(t,r);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r)+i);let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r)+i;return pigmaEditableTextLgEiTextClampBaseline(t,a)}').Replace('function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18)+pigmaEditableTextLgEiTextLargeLowRatioDrift(t,1.25);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}', 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18)+pigmaEditableTextLgEiTextLargeLowRatioDrift(t,1.25)+pigmaEditableTextLgEiTextAutoLargeSizeDrift(t);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}')
$uiEditableTextBaselineShiftLgEiHeadlineFormulaPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiAutoBaselineShift(t){return t<=8?-2.5:t<=11?-3:t<=18?-3.4:t<=20?-4.2:t<=24?-4.8:t<=26?-5.8:t<=32?-7.8:t<=40?-12:t<=48?-15:t<=56?-18:t<=64?-22:t<=80?-27:t<=96?-33:t<=112?-38:t<=128?-44:-t*.34}function pigmaEditableTextLgEiExactBaselineShift(t,n){let r=n/t;return t<=18?r<=1.21?-8.4:-6.4:t<=24?r<=1.21?-10.2:-10.5:t<=32?r<=1.21?-14:n>=44&&n<=52?-14.2:-10.8:t<=48?-5.2:-7.2}', 'function pigmaEditableTextLgEiHeadlineRatio(t){return Math.min(2,Math.max(1,Number.isFinite(t)?t:1))}function pigmaEditableTextLgEiHeadlineSmooth(t){return t=t<0?0:t>1?1:t,t*t*(3-2*t)}function pigmaEditableTextLgEiHeadlineClampBaseline(t,n){return we(Math.min(t*1.1,Math.max(-t*.8,n)))}function pigmaEditableTextLgEiHeadlineAutoBaseline(t){let n=Math.max(0,t-18),r=Math.max(0,t-32),i=Math.max(0,t-48),a=Math.max(0,t-64),o=2.047+.07135*t+.25079*n+.13021*r-.03945*i-.06677*a;return pigmaEditableTextLgEiHeadlineClampBaseline(t,o)}function pigmaEditableTextLgEiHeadlineExactLowBaseline(t){let n=8.4+1.8*pigmaEditableTextLgEiHeadlineSmooth((t-18)/2)+3.8*pigmaEditableTextLgEiHeadlineSmooth((t-24)/4),r=5.2+2*pigmaEditableTextLgEiHeadlineSmooth((t-48)/8),i=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8);return pigmaEditableTextLgEiHeadlineClampBaseline(t,n*(1-i)+r*i)}function pigmaEditableTextLgEiHeadlineLineHeightPressure(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1.21);if(i<=.001)return 0;let a=pigmaEditableTextLgEiHeadlineSmooth((t-18)/8),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8);return i*(-7*(1-a)+1.2*a*(1-o))}function pigmaEditableTextLgEiHeadlineBaselineFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=pigmaEditableTextLgEiHeadlineExactLowBaseline(t)+pigmaEditableTextLgEiHeadlineLineHeightPressure(t,r);return pigmaEditableTextLgEiHeadlineClampBaseline(t,i)}function pigmaEditableTextLgEiAutoBaselineShift(t){return -pigmaEditableTextLgEiHeadlineAutoBaseline(t)}function pigmaEditableTextLgEiExactBaselineShift(t,n){return -pigmaEditableTextLgEiHeadlineBaselineFormula(t,n/t)}').Replace('function pigmaEditableTextLgEiAutoLeadingDelta(t){return t<=18?0:t<=20?-.5:t<=24?0:t<=32?-1.1:t<=40?-1.6:t<=48?-2.2:t<=56?-2.6:t<=64?-3:t<=80?-3.6:t<=96?-4.6:t<=112?-5.4:t<=128?-6.2:-t*.05}function pigmaEditableTextLgEiExactLeadingDelta(t,n){let r=n/t;return r<=1.21?0:t<=18?0:t<=24?-1.3:t<=32?-3.1:t<=48?-1.35:-1.8}', 'function pigmaEditableTextLgEiHeadlineLeadingFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1.21);if(i<=.001)return 0;let a=Math.min(14,Math.max(0,t-18)),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/16),s=Math.max(0,t-48),u=i*(.75*a*(1-.55*o)+.08*s);return Math.max(0,we(u))}function pigmaEditableTextLgEiAutoLeadingDelta(t){let n=.07*Math.max(0,t-18)+.02*Math.max(0,t-32)-.03*Math.max(0,t-64)+.025*Math.max(0,t-80);return -we(Math.max(0,n))}function pigmaEditableTextLgEiExactLeadingDelta(t,n){return -pigmaEditableTextLgEiHeadlineLeadingFormula(t,n/t)}')
$uiEditableTextBaselineShiftLgEiHeadlineSecondPreviousReplace = $uiEditableTextBaselineShiftReplace
$uiEditableTextBaselineShiftReplace = $uiEditableTextBaselineShiftReplace.Replace('function pigmaEditableTextLgEiHeadlineAutoBaseline(t){let n=Math.max(0,t-18),r=Math.max(0,t-32),i=Math.max(0,t-48),a=Math.max(0,t-64),o=2.047+.07135*t+.25079*n+.13021*r-.03945*i-.06677*a;return pigmaEditableTextLgEiHeadlineClampBaseline(t,o)}', 'function pigmaEditableTextLgEiHeadlineAutoBaseline(t){let n=Math.max(0,t-18),r=Math.max(0,t-32),i=Math.max(0,t-48),a=Math.max(0,t-64),o=2.047+.07135*t+.25079*n+.13021*r-.03945*i-.06677*a,s=5.5*pigmaEditableTextLgEiHeadlineSmooth((t-46)/2)*(1-pigmaEditableTextLgEiHeadlineSmooth((t-52)/4))+.8*pigmaEditableTextLgEiHeadlineSmooth((t-56)/8);return pigmaEditableTextLgEiHeadlineClampBaseline(t,o-s)}').Replace('function pigmaEditableTextLgEiHeadlineExactLowBaseline(t){let n=8.4+1.8*pigmaEditableTextLgEiHeadlineSmooth((t-18)/2)+3.8*pigmaEditableTextLgEiHeadlineSmooth((t-24)/4),r=5.2+2*pigmaEditableTextLgEiHeadlineSmooth((t-48)/8),i=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8);return pigmaEditableTextLgEiHeadlineClampBaseline(t,n*(1-i)+r*i)}', 'function pigmaEditableTextLgEiHeadlineExactLowBaseline(t){let n=8.4+1.8*pigmaEditableTextLgEiHeadlineSmooth((t-18)/2)+3.8*pigmaEditableTextLgEiHeadlineSmooth((t-24)/4),r=5.2+2*pigmaEditableTextLgEiHeadlineSmooth((t-48)/8),i=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8),a=5.5*(1-pigmaEditableTextLgEiHeadlineSmooth((t-30)/8)),o=3.5*pigmaEditableTextLgEiHeadlineSmooth((t-34)/8)*(1-pigmaEditableTextLgEiHeadlineSmooth((t-48)/8));return pigmaEditableTextLgEiHeadlineClampBaseline(t,n*(1-i)+r*i+a-o)}').Replace('function pigmaEditableTextLgEiHeadlineLineHeightPressure(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1.21);if(i<=.001)return 0;let a=pigmaEditableTextLgEiHeadlineSmooth((t-18)/8),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8);return i*(-7*(1-a)+1.2*a*(1-o))}', 'function pigmaEditableTextLgEiHeadlineLineHeightPressure(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1.05),a=Math.max(0,r-1.21);if(i<=.001)return 0;let o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8),s=1-o,u=-(32*i*o+20*a*s);return u}')
$uiBackgroundClipHelperFind = 'function Eu(e){return e.buffer instanceof ArrayBuffer&&e.byteOffset===0&&e.byteLength===e.buffer.byteLength?e.buffer:e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}async function vm('
$uiBackgroundClipHelperLegacyReplace = 'function Eu(e){return e.buffer instanceof ArrayBuffer&&e.byteOffset===0&&e.byteLength===e.buffer.byteLength?e.buffer:e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}function pigmaIsBackgroundClipBaseLayer(e){return!!(e&&typeof e=="object"&&typeof e.name=="string"&&(e.name==="Background"||e.name.indexOf("Background ")===0))}function pigmaApplyContainerClipToBackground(e){if(!Array.isArray(e)||e.length<2)return!1;let t=e.findIndex(pigmaIsBackgroundClipBaseLayer);if(t!==0)return!1;let n=!1;for(let r=t+1;r<e.length;r+=1){let i=e[r];if(i&&typeof i=="object"){i.clipping=!0,n=!0}}return n}async function vm('
$uiBackgroundClipHelperReplace = @'
function Eu(e){return e.buffer instanceof ArrayBuffer&&e.byteOffset===0&&e.byteLength===e.buffer.byteLength?e.buffer:e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}
function pigmaIsBackgroundClipBaseLayer(e){return!!(e&&typeof e=="object"&&typeof e.name=="string"&&(e.name==="Background"||e.name.indexOf("Background ")===0))}
function pigmaIsBaseImageSimulationLayer(e){return!!(e&&typeof e=="object"&&typeof e.name=="string"&&/(^|\/\s*)base image simulation$/i.test(e.name))}
function pigmaFindContainerClipBaseIndex(e){let t=e.findIndex(pigmaIsBaseImageSimulationLayer);if(t>=0)return t;let n=e.findIndex(pigmaIsBackgroundClipBaseLayer);return n===0?n:-1}
function pigmaIsLayerGroup(e){return!!(e&&typeof e=="object"&&Array.isArray(e.children))}
function pigmaAccumulateSourceBounds(e,t){if(!e||typeof e!="object"||e.visible===!1)return;if(e.mask&&typeof e.mask.x=="number"&&typeof e.mask.y=="number"&&typeof e.mask.width=="number"&&typeof e.mask.height=="number"){t.push({x:e.mask.x,y:e.mask.y,width:e.mask.width,height:e.mask.height});return}typeof e.x=="number"&&typeof e.y=="number"&&typeof e.width=="number"&&typeof e.height=="number"&&t.push({x:e.x,y:e.y,width:e.width,height:e.height});if(Array.isArray(e.children))for(let n of e.children)pigmaAccumulateSourceBounds(n,t)}
function pigmaSourceGroupBounds(e){let t=[];pigmaAccumulateSourceBounds(e,t);if(t.length===0)return null;let n=Math.min(...t.map(r=>r.x)),i=Math.min(...t.map(r=>r.y)),a=Math.max(...t.map(r=>r.x+r.width)),o=Math.max(...t.map(r=>r.y+r.height));return{x:Math.floor(n),y:Math.floor(i),width:Math.max(1,Math.ceil(a-n)),height:Math.max(1,Math.ceil(o-i)),mask:e&&e.mask&&e.mask.kind==="rounded-rect"?e.mask:null}}
function pigmaApplyLocalRoundedMask(e,t){if(!t||t.kind!=="rounded-rect")return;let n=e.getContext("2d");if(!n)throw new Error("Unable to create a 2D canvas for a smart object clip mask.");n.save(),n.globalCompositeOperation="destination-in",n.fillStyle="#ffffff",Cu(n,e.width,e.height,t),n.fill(),n.restore()}
async function pigmaRenderClipBaseSmartObjectCanvas(e,t,n){let r=pigmaSourceGroupBounds(e);if(!r||t<=0||n<=0)return null;let i=await Rw(t,n,[e]),a=it(Math.max(1,Math.round(r.width)),Math.max(1,Math.round(r.height)),"clip base smart object"),o=a.getContext("2d");if(!o)throw new Error("Unable to create a 2D canvas for a smart object clip base.");o.drawImage(i,r.x,r.y,r.width,r.height,0,0,a.width,a.height),pigmaApplyLocalRoundedMask(a,r.mask),typeof Qt=="function"&&Qt(i);return{canvas:a,bounds:r}}
async function pigmaBuildClipBaseSmartObject(e,t,n){let r=e&&e.__pigmaSourceGroup;if(!r)return null;let i=await pigmaRenderClipBaseSmartObjectCanvas(r,t,n);if(!i)return null;let a=tn(),o=tn(),s=await l1(i.canvas),u=i.bounds.x,l=i.bounds.y,c=i.canvas.width,f=i.canvas.height,d={name:e.name,left:u,top:l,right:u+c,bottom:l+f,opacity:typeof e.opacity=="number"?e.opacity:1,hidden:!!e.hidden,blendMode:e.blendMode||"normal",canvas:i.canvas,placedLayer:{id:a,placed:o,type:"raster",comp:qi,compInfo:Zo(),transform:[u,l,u+c,l,u+c,l+f,u,l+f],width:c,height:f,resolution:{value:72,units:"Density"}}};return e.effects&&(d.effects=e.effects),e.effectsOpen&&(d.effectsOpen=e.effectsOpen),{layer:d,linkedFiles:[Du(a,"".concat(qo(e.name||"clip-base"),".png"),s)],warnings:["\"".concat(Su(e.name||"base image simulation"),"\" was converted to a raster Smart Object so Photoshop clipping masks can target a single pixel layer.")]}}
async function pigmaApplyContainerClipToBackground(e,t=0,n=0){let r={applied:!1,linkedFiles:[],warnings:[]};if(!Array.isArray(e)||e.length<2)return r;let i=pigmaFindContainerClipBaseIndex(e);if(i<0)return r;let a=e[i];if(pigmaIsLayerGroup(a)){let l=await pigmaBuildClipBaseSmartObject(a,t,n);if(!l){r.warnings.push("\"".concat(Su(a&&a.name?a.name:"clip base"),"\" stayed as a group, so Pigma skipped automatic clipping masks for this container to avoid hiding clipped layers in Photoshop."));return r}e[i]=l.layer,r.linkedFiles.push(...l.linkedFiles),r.warnings.push(...l.warnings)}let o=e.findIndex(pigmaIsBackgroundClipBaseLayer),s=o>=0&&o<i?o:i;for(let l=s+1;l<e.length;l+=1){let u=e[l];if(u&&typeof u=="object"){u.clipping=!0,r.applied=!0}}return r}
async function vm(
'@
$uiBackgroundClipGroupFind = 'if(v.kind==="group"){let M=await vm(v.children,t,n.concat(v.name),r,i,a,(h=v.mask)!=null?h:o);if(M.children.length===0){m();continue}let B={name:v.name,opacity:v.opacity,hidden:!v.visible,blendMode:v.blendMode,opened:!1,children:M.children};v.mask&&(B.mask=await Qm(v.mask)),Wn(B,v.effects,v.strokeEffect),u.push(...M.linkedFiles),l.push(...M.backgroundDebug),c.push(...M.warnings),s.push(B),m();continue}'
$uiBackgroundClipGroupLegacyReplace = 'if(v.kind==="group"){let M=await vm(v.children,t,n.concat(v.name),r,i,a,(h=v.mask)!=null?h:o);if(M.children.length===0){m();continue}v.mask&&pigmaApplyContainerClipToBackground(M.children);let B={name:v.name,opacity:v.opacity,hidden:!v.visible,blendMode:v.blendMode,opened:!1,children:M.children};v.mask&&(B.mask=await Qm(v.mask)),Wn(B,v.effects,v.strokeEffect),u.push(...M.linkedFiles),l.push(...M.backgroundDebug),c.push(...M.warnings),s.push(B),m();continue}'
$uiBackgroundClipGroupReplace = 'if(v.kind==="group"){let M=await vm(v.children,t,n.concat(v.name),r,i,a,(h=v.mask)!=null?h:o);if(M.children.length===0){m();continue}let A=v.mask?await pigmaApplyContainerClipToBackground(M.children,r,i):{linkedFiles:[],warnings:[]},B={name:v.name,opacity:v.opacity,hidden:!v.visible,blendMode:v.blendMode,opened:!1,children:M.children};try{Object.defineProperty(B,"__pigmaSourceGroup",{value:v,enumerable:!1})}catch(O){}v.mask&&(B.mask=await Qm(v.mask)),Wn(B,v.effects,v.strokeEffect),u.push(...M.linkedFiles,...A.linkedFiles),l.push(...M.backgroundDebug),c.push(...M.warnings,...A.warnings),s.push(B),m();continue}'
$psdCompositePreviewFind = 'function d1(e){return e.exportPackageMode==="bundle-with-rasters"}'
$psdCompositePreviewReplace = 'function d1(e){return e.exportPackageMode==="bundle-with-rasters"||e.exportPackageMode==="psd-only"}'
$psdThumbnailWriteFind = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:!1,noBackground:!0});'
$psdThumbnailWriteReplace = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:!1,noBackground:!0,generateThumbnail:!0});'
$psdThumbnailMatteFind = 'function ex(e){var t=(0,Oe.createCanvas)(10,10),n=1;e.width>e.height?(t.width=160,t.height=Math.floor(e.height*(t.width/e.width)),n=t.width/e.width):(t.height=160,t.width=Math.floor(e.width*(t.height/e.height)),n=t.height/e.height);var r=t.getContext("2d");return r.scale(n,n),e.imageData?r.drawImage((0,Oe.imageDataToCanvas)(e.imageData),0,0):e.canvas&&r.drawImage(e.canvas,0,0),t}'
$psdThumbnailMatteReplace = 'function ex(e){var t=(0,Oe.createCanvas)(10,10),n=1;e.width>e.height?(t.width=160,t.height=Math.floor(e.height*(t.width/e.width)),n=t.width/e.width):(t.height=160,t.width=Math.floor(e.width*(t.height/e.height)),n=t.height/e.height);var r=t.getContext("2d");return r.fillStyle="#fff",r.fillRect(0,0,t.width,t.height),r.scale(n,n),e.imageData?r.drawImage((0,Oe.imageDataToCanvas)(e.imageData),0,0):e.canvas&&r.drawImage(e.canvas,0,0),t}'
$uiSelectionBridgeStartupFind = 'qn({type:"request-preferences",detectedLocale:w0()});m0();Le();'
$uiSelectionBridgeStartupReplace = 'function pigmaRequestSelectionBridge(){qn({type:"request-ai-design-chat-selection"})}qn({type:"request-preferences",detectedLocale:w0()});pigmaRequestSelectionBridge();setTimeout(pigmaRequestSelectionBridge,250);setTimeout(pigmaRequestSelectionBridge,1e3);m0();Le();'
$uiSelectionBridgeTabFind = 'D.activeTab=t,D.unavailableModalOpen=!1,Le()'
$uiSelectionBridgeTabReplace = 'D.activeTab=t,D.unavailableModalOpen=!1,Le(),t==="main"&&pigmaRequestSelectionBridge()'
$uiSelectionBridgeTabDuplicate = 't==="main"&&pigmaRequestSelectionBridge(),t==="main"&&pigmaRequestSelectionBridge()'
$uiAiSelectionStateBridgeFind = 'async function KS(e){switch(e.type){case"preferences":'
$uiAiSelectionStateBridgeReplace = 'function pigmaSelectionFromAiChat(e){let t=e&&typeof e=="object"?e:{},n=Math.max(0,Number(t.selectionCount)||0),r=Math.max(0,Math.round(Number(t.width)||0)),i=Math.max(0,Math.round(Number(t.height)||0)),a=typeof t.selectionLabel=="string"?t.selectionLabel.trim():"",o=typeof t.selectionTypeLabel=="string"?t.selectionTypeLabel.trim():"",s=!!(t.ready&&n>0);return{ready:s,selectionId:n===1&&typeof t.selectionSignature=="string"?t.selectionSignature:null,selectionCount:n,selectionName:s?a||"Selection":"",selectionType:s?o||"Selection":null,summary:s?''"''.concat(a||"Selection",''" is ready to export.''):"Select one or more frames, groups, or layers to export.",detail:s?"AI selection bridge loaded the current Figma selection for PSD export.":"The exporter is waiting for a Figma selection.",documentWidth:s&&r>0?r:null,documentHeight:s&&i>0?i:null,exportNodeCount:s?n:0,editableTextCount:0,preservedGroupCount:0,warnings:[],analysisPending:s}}function pigmaKeepAiSelection(e){return!!(D&&D.selection&&D.selection.ready&&D.selection.detail==="AI selection bridge loaded the current Figma selection for PSD export."&&e&&e.selectionCount===0)}async function KS(e){switch(e.type){case"ai-design-chat-selection":{let t=pigmaSelectionFromAiChat(e.selection);D.selection=t,D.warnings=t.warnings.slice(),D.busy||(D.statusTone=t.ready?"ready":"idle",D.statusMessage=t.ready&&t.detail.trim().length>0?t.detail:Ch(t)),Le();return}case"preferences":'
$uiAiSelectionStateOverwriteFind = 'case"selection-state":D.selection=e.state,D.warnings=e.state.warnings.slice(),D.busy||(D.statusTone=e.state.ready?"ready":"idle",D.statusMessage=e.state.ready&&e.state.detail.trim().length>0?e.state.detail:Ch(e.state)),Le();return;'
$uiAiSelectionStateOverwriteReplace = 'case"selection-state":if(pigmaKeepAiSelection(e.state)){Le();return}D.selection=e.state,D.warnings=e.state.warnings.slice(),D.busy||(D.statusTone=e.state.ready?"ready":"idle",D.statusMessage=e.state.ready&&e.state.detail.trim().length>0?e.state.detail:Ch(e.state)),Le();return;'
$nativeShadowStackFind = 'function Wn(e,t,n){let r=V1(t,n);r&&(e.effects=r,e.effectsOpen=!0)}function V1(e,t){let n={scale:100},r=!1,i=e?$1(e):Tm(),a=H1(t),o=i.dropShadow.map(c=>Ph(c)).filter(Boolean),s=i.innerShadow.map(c=>Ph(c)).filter(Boolean),u=i.outerGlow.map(c=>tw(c)).filter(Boolean),l=i.innerGlow.map(c=>nw(c)).filter(Boolean);return o.length>0&&(n.dropShadow=o,r=!0),s.length>0&&(n.innerShadow=s,r=!0),u.length>0&&(n.outerGlow=u[0],r=!0),l.length>0&&(n.innerGlow=l[0],r=!0),a&&(n.stroke=[a],r=!0),r?n:null}function Tm()'
$nativeShadowStackReplace = @'
function Wn(e,t,n){let r=V1(t,n);r&&(e.effects=r,e.effectsOpen=!0)}
function pigmaEffectUnitValue(e,t=0){return e&&typeof e.value=="number"?e.value:t}
function pigmaNativeShadowOffset(e){let t=pigmaEffectUnitValue(e.distance,0),n=Number.isFinite(e.angle)?e.angle:120,r=n*Math.PI/180;return{x:-Math.cos(r)*t,y:Math.sin(r)*t}}
function pigmaNativeShadowStack(e){let t=e.map(n=>Ph(n)).filter(Boolean);return t}
function pigmaMergeNativeShadowStack(e){let t=0,n=0,r=0,i=0,a=0,o=0,s=0,u=0,l=0,c=0,f=e[0];for(let d of e){let p=ae(typeof d.opacity=="number"?d.opacity:1,0,1),h=pigmaEffectUnitValue(d.size,0),g=pigmaEffectUnitValue(d.distance,0),v=Math.max(.001,p*(1+h+g)),m=pigmaNativeShadowOffset(d),b=d.color||{r:0,g:0,b:0};t+=m.x*v,n+=m.y*v,r+=v,i=Math.max(i,h),a=Math.max(a,pigmaEffectUnitValue(d.choke,0)),c=Math.max(c,g),o+=p,s+=b.r*p,u+=b.g*p,l+=b.b*p}let d=ae(o/e.length,0,1),p=o>0?{r:jn(s/o),g:jn(u/o),b:jn(l/o)}:f.color,h=r>0?t/r:0,g=r>0?n/r:0,v=Math.hypot(h,g),m=c>0&&v<c*.35,b=m?0:v,y=m?Math.max(i,c+i):Math.max(i,v*.35);return Object.assign({},f,{color:p,opacity:d,angle:m?120:rw(h,g),distance:wn(b),size:wn(y),choke:wn(a),useGlobalLight:!1})}
function pigmaNativeDropShadowList(e){return e?$1(e).dropShadow.map(t=>Ph(t)).filter(Boolean):[]}
function pigmaRemoveDropShadowEffect(e){if(!e.effects||!e.effects.dropShadow)return;let t=Object.assign({},e.effects);delete t.dropShadow;let n=Object.keys(t).filter(r=>r!=="scale"&&t[r]!==void 0&&(!Array.isArray(t[r])||t[r].length>0));if(n.length===0){delete e.effects,delete e.effectsOpen;return}e.effects=t}
function pigmaLegacyShadowAngle(e){let t=Object.assign({},e);return Number.isFinite(t.angle)&&t.angle>180&&(t.angle-=360),t}
function pigmaExplodeDropShadowLayer(e,t){let n=pigmaNativeDropShadowList(e.effects);if(n.length<2)return null;let r=Object.assign({},t,{name:"Content"});pigmaRemoveDropShadowEffect(r);let i=n.map((a,o)=>Object.assign({},t,{name:"Drop Shadow ".concat(o+1),opacity:t.opacity,fillOpacity:0,blendMode:"normal",effects:{scale:100,dropShadow:[pigmaLegacyShadowAngle(a)]},effectsOpen:!0}));return{name:e.name,hidden:!e.visible,blendMode:"pass through",opened:!1,children:[r,...i]}}
function V1(e,t){let n={scale:100},r=!1,i=e?$1(e):Tm(),a=H1(t),o=pigmaNativeShadowStack(i.dropShadow),s=pigmaNativeShadowStack(i.innerShadow),u=i.outerGlow.map(c=>tw(c)).filter(Boolean),l=i.innerGlow.map(c=>nw(c)).filter(Boolean);return o.length>0&&(n.dropShadow=o,r=!0),s.length>0&&(n.innerShadow=s,r=!0),u.length>0&&(n.outerGlow=u[0],r=!0),l.length>0&&(n.innerGlow=l[0],r=!0),a&&(n.stroke=[a],r=!0),r?n:null}
function Tm()
'@
$importEffectUnitFind = 'function rt(e){if(!e||!Number.isFinite(e.value))return 0;switch(e.units){case"Points":return Number(e.value);case"Picas":return Number(e.value)*12;case"Millimeters":return Number(e.value)*72/25.4;case"Centimeters":return Number(e.value)*72/2.54;case"Inches":return Number(e.value)*72;default:return Number(e.value)}}function Zp(e,t){return Number.isFinite(e)?Number(e):t}function Zl(e)'
$importEffectUnitReplace = 'function rt(e){if(Number.isFinite(e))return Number(e);if(!e||!Number.isFinite(e.value))return 0;let t=Number(e.value);switch(e.units){case"Points":case"Pixels":return t;case"Picas":return t*12;case"Millimeters":return t*72/25.4;case"Centimeters":return t*72/2.54;case"Inches":return t*72;default:return t}}function Zp(e,t){return Number.isFinite(e)?Number(e):t}function Zl(e)'
$importOpacityUnitFind = 'function xS(e){let t=typeof e.name=="string"?e.name.trim():"";return t.length>0?t:"Layer"}function dr(e){return Number.isFinite(e)?Math.min(1,Math.max(0,Number(e))):1}function mo(e,t,n)'
$importOpacityUnitReplace = 'function xS(e){let t=typeof e.name=="string"?e.name.trim():"";return t.length>0?t:"Layer"}function dr(e){let t=null;if(Number.isFinite(e))t=Number(e);else if(e&&Number.isFinite(e.value)){t=Number(e.value);let r=typeof e.units=="string"?e.units.toLowerCase():"";r.includes("percent")&&(t=t/100)}return t===null?1:Math.min(1,Math.max(0,t>1?(t<=100?t/100:t/255):t))}function mo(e,t,n)'
$bitmapLayerNativeEffectsFind = 'let T={name:v.name,left:v.x,top:v.y,opacity:v.opacity,hidden:!v.visible,blendMode:wr(v.blendMode)};if(!(t&&v.kind==="text"))'
$bitmapLayerNativeEffectsReplace = 'let T={name:v.name,left:v.x,top:v.y,opacity:v.opacity,hidden:!v.visible,blendMode:wr(v.blendMode)};Wn(T,v.effects,v.strokeEffect);if(!(t&&v.kind==="text"))'
$uiMaskedSmartObjectLayerHelperMarker = 'async function pigmaApplyContainerClipToBackground('
$uiMaskedSmartObjectLayerHelper = @'
async function pigmaBuildLayeredSmartObjectFile(e,t,n,r=[]){let i=e&&e.smartObjectDocument;if(!i||!Array.isArray(i.children)||i.children.length===0)return null;let a=Math.max(1,Math.round(Number(i.width)||t.width||1)),o=Math.max(1,Math.round(Number(i.height)||t.height||1)),s=await vm(i.children,n,r.concat(e.name||"Smart Object"),a,o,!1,null);if(s.children.length===0)return null;let u={width:a,height:o,children:s.children};s.linkedFiles.length>0&&(u.linkedFiles=s.linkedFiles);let l=(0,Lh.writePsdUint8Array)(u,{invalidateTextLayers:!1,noBackground:!0,generateThumbnail:!0});return{bytes:l,warnings:s.warnings}}
function pigmaBuildSmartObjectPreviewCanvas(e,t){let n=e&&e.smartObjectDocument;if(!n)return{canvas:t,offsetX:0,offsetY:0,width:t.width,height:t.height};let r=Math.max(1,Math.round(Number(n.width)||t.width||1)),i=Math.max(1,Math.round(Number(n.height)||t.height||1)),a=Math.max(0,Math.round(Number(n.offsetX)||0)),o=Math.max(0,Math.round(Number(n.offsetY)||0));if(r===t.width&&i===t.height&&a===0&&o===0)return{canvas:t,offsetX:0,offsetY:0,width:t.width,height:t.height};let s=it(r,i,"smart object preview"),u=s.getContext("2d");if(!u)throw new Error("Unable to create a 2D canvas for a Smart Object preview.");return u.drawImage(t,a,o),{canvas:s,offsetX:a,offsetY:o,width:r,height:i}}
async function pigmaBuildRasterSmartObjectLayer(e,t,n,r=[]){let i=tn(),a=tn(),o=pigmaBuildSmartObjectPreviewCanvas(e,t),s=await l1(o.canvas),u=await pigmaBuildLayeredSmartObjectFile(e,t,n,r),l=u?Du(i,"".concat(qo(e.name||"masked-smart-object"),".psd"),u.bytes):Du(i,"".concat(qo(e.name||"masked-smart-object"),".png"),s);u&&(l.type="8BPS",l.creator="8BIM");let c=e.x-o.offsetX,f=e.y-o.offsetY,d=o.width,p=o.height,h={name:e.name,left:c,top:f,right:c+d,bottom:f+p,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),canvas:o.canvas,placedLayer:{id:i,placed:a,type:"raster",comp:qi,compInfo:Zo(),transform:[c,f,c+d,f,c+d,f+p,c,f+p],width:d,height:p,resolution:{value:72,units:"Density"}}};return Wn(h,e.effects,e.strokeEffect),{layer:h,linkedFiles:[l],warnings:u?u.warnings:[]}}
'@
$uiMaskedSmartObjectLayerHelperLegacy = @'
async function pigmaBuildRasterSmartObjectLayer(e,t){let n=tn(),r=tn(),i=await l1(t),a=e.x,o=e.y,s=e.width,u=e.height,l={name:e.name,left:a,top:o,right:a+s,bottom:o+u,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),canvas:t,placedLayer:{id:n,placed:r,type:"raster",comp:qi,compInfo:Zo(),transform:[a,o,a+s,o,a+s,o+u,a,o+u],width:t.width,height:t.height,resolution:{value:72,units:"Density"}}};return Wn(l,e.effects,e.strokeEffect),{layer:l,linkedFiles:[Du(n,"".concat(qo(e.name||"masked-smart-object"),".png"),i)],warnings:[]}}
'@
$uiMaskedSmartObjectLayerHelperPreviousLayered = @'
async function pigmaBuildLayeredSmartObjectFile(e,t,n,r=[]){let i=e&&e.smartObjectDocument;if(!i||!Array.isArray(i.children)||i.children.length===0)return null;let a=Math.max(1,Math.round(Number(i.width)||t.width||1)),o=Math.max(1,Math.round(Number(i.height)||t.height||1)),s=await vm(i.children,n,r.concat(e.name||"Smart Object"),a,o,!1,null);if(s.children.length===0)return null;let u={width:a,height:o,children:s.children};s.linkedFiles.length>0&&(u.linkedFiles=s.linkedFiles);let l=(0,Lh.writePsdUint8Array)(u,{invalidateTextLayers:!1,noBackground:!0,generateThumbnail:!0});return{bytes:l,warnings:s.warnings}}
async function pigmaBuildRasterSmartObjectLayer(e,t,n,r=[]){let i=tn(),a=tn(),o=await l1(t),s=await pigmaBuildLayeredSmartObjectFile(e,t,n,r),u=s?Du(i,"".concat(qo(e.name||"masked-smart-object"),".psd"),s.bytes):Du(i,"".concat(qo(e.name||"masked-smart-object"),".png"),o);s&&(u.type="8BPS",u.creator="8BIM");let l=e.x,c=e.y,f=e.width,d=e.height,p={name:e.name,left:l,top:c,right:l+f,bottom:c+d,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),canvas:t,placedLayer:{id:i,placed:a,type:"raster",comp:qi,compInfo:Zo(),transform:[l,c,l+f,c,l+f,c+d,l,c+d],width:t.width,height:t.height,resolution:{value:72,units:"Density"}}};return Wn(p,e.effects,e.strokeEffect),{layer:p,linkedFiles:[u],warnings:s?s.warnings:[]}}
'@
$uiMaskedSmartObjectBitmapFind = 'let b=cu(Ki(v.effects),d),P=Sh(v,d),y=t&&v.kind==="text",F=!t||v.kind!=="text"||y||!!b||P?await Xn(v.pngBytes):null,k=F&&v.kind==="text"?x1(v,F):F;if(du(b)){'
$uiMaskedSmartObjectBitmapReplace = 'let b=cu(Ki(v.effects),d),P=Sh(v,d),y=t&&v.kind==="text",F=!t||v.kind!=="text"||y||!!b||P?await Xn(v.pngBytes):null,k=F&&v.kind==="text"?x1(v,F):F;if(v.smartObject===!0){if(!k)throw new Error("Raster smart object export requires a decoded preview canvas.");let M=await pigmaBuildRasterSmartObjectLayer(v,k,t,n);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}if(du(b)){'
$uiMaskedSmartObjectBitmapLegacyReplace = 'let b=cu(Ki(v.effects),d),P=Sh(v,d),y=t&&v.kind==="text",F=!t||v.kind!=="text"||y||!!b||P?await Xn(v.pngBytes):null,k=F&&v.kind==="text"?x1(v,F):F;if(v.smartObject===!0){if(!k)throw new Error("Raster smart object export requires a decoded preview canvas.");let M=await pigmaBuildRasterSmartObjectLayer(v,k);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}if(du(b)){'
$preserveMultiShadowFind = 'function V1(e,t){let n={scale:100},r=!1,i=e?$1(e):Tm(),a=H1(t),o=i.dropShadow.map(c=>Ph(c)).filter(Boolean),s=i.innerShadow.map(c=>Ph(c)).filter(Boolean),u=i.outerGlow.map(c=>tw(c)).filter(Boolean),l=i.innerGlow.map(c=>nw(c)).filter(Boolean);return o.length>0&&(n.dropShadow=o,r=!0),s.length>0&&(n.innerShadow=s,r=!0),u.length>0&&(n.outerGlow=u[0],r=!0),l.length>0&&(n.innerGlow=l[0],r=!0),a&&(n.stroke=[a],r=!0),r?n:null}'
$preserveMultiShadowReplace = 'function V1(e,t){let n={scale:100},r=!1,i=e?$1(e):Tm(),a=H1(t),o=pigmaNativeShadowStack(i.dropShadow),s=pigmaNativeShadowStack(i.innerShadow),u=i.outerGlow.map(c=>tw(c)).filter(Boolean),l=i.innerGlow.map(c=>nw(c)).filter(Boolean);return o.length>0&&(n.dropShadow=o,r=!0),s.length>0&&(n.innerShadow=s,r=!0),u.length>0&&(n.outerGlow=u[0],r=!0),l.length>0&&(n.innerGlow=l[0],r=!0),a&&(n.stroke=[a],r=!0),r?n:null}'
$shadowMergeAntiCancelFind = 'function pigmaMergeNativeShadowStack(e){let t=0,n=0,r=0,i=0,a=0,o=0,s=0,u=0,l=0,c=e[0];for(let f of e){let d=ae(typeof f.opacity=="number"?f.opacity:1,0,1),p=pigmaEffectUnitValue(f.size,0),h=pigmaEffectUnitValue(f.distance,0),g=Math.max(.001,d*(1+p+h)),v=pigmaNativeShadowOffset(f),m=f.color||{r:0,g:0,b:0};t+=v.x*g,n+=v.y*g,r+=g,i=Math.max(i,p),a=Math.max(a,pigmaEffectUnitValue(f.choke,0)),o+=d,s+=m.r*d,u+=m.g*d,l+=m.b*d}let d=ae(o,0,1),p=o>0?{r:jn(s/o),g:jn(u/o),b:jn(l/o)}:c.color,h=r>0?t/r:0,g=r>0?n/r:0,v=Math.hypot(h,g);return Object.assign({},c,{color:p,opacity:d,angle:rw(h,g),distance:wn(v),size:wn(i),choke:wn(a),useGlobalLight:!1})}'
$shadowMergeAntiCancelReplace = 'function pigmaMergeNativeShadowStack(e){let t=0,n=0,r=0,i=0,a=0,o=0,s=0,u=0,l=0,c=0,f=e[0];for(let d of e){let p=ae(typeof d.opacity=="number"?d.opacity:1,0,1),h=pigmaEffectUnitValue(d.size,0),g=pigmaEffectUnitValue(d.distance,0),v=Math.max(.001,p*(1+h+g)),m=pigmaNativeShadowOffset(d),b=d.color||{r:0,g:0,b:0};t+=m.x*v,n+=m.y*v,r+=v,i=Math.max(i,h),a=Math.max(a,pigmaEffectUnitValue(d.choke,0)),c=Math.max(c,g),o+=p,s+=b.r*p,u+=b.g*p,l+=b.b*p}let d=ae(o/e.length,0,1),p=o>0?{r:jn(s/o),g:jn(u/o),b:jn(l/o)}:f.color,h=r>0?t/r:0,g=r>0?n/r:0,v=Math.hypot(h,g),m=c>0&&v<c*.35,b=m?0:v,y=m?Math.max(i,c+i):Math.max(i,v*.35);return Object.assign({},f,{color:p,opacity:d,angle:m?120:rw(h,g),distance:wn(b),size:wn(y),choke:wn(a),useGlobalLight:!1})}'
$shadowCarrierHelpersFind = $shadowMergeAntiCancelReplace + 'function V1(e,t){'
$shadowCarrierHelpersReplace = $shadowMergeAntiCancelReplace + 'function pigmaNativeDropShadowList(e){return e?$1(e).dropShadow.map(t=>Ph(t)).filter(Boolean):[]}function pigmaRemoveDropShadowEffect(e){if(!e.effects||!e.effects.dropShadow)return;let t=Object.assign({},e.effects);delete t.dropShadow;let n=Object.keys(t).filter(r=>r!=="scale"&&t[r]!==void 0&&(!Array.isArray(t[r])||t[r].length>0));if(n.length===0){delete e.effects,delete e.effectsOpen;return}e.effects=t}function pigmaLegacyShadowAngle(e){let t=Object.assign({},e);return Number.isFinite(t.angle)&&t.angle>180&&(t.angle-=360),t}function pigmaExplodeDropShadowLayer(e,t){let n=pigmaNativeDropShadowList(e.effects);if(n.length<2)return null;let r=Object.assign({},t,{name:"Content"});pigmaRemoveDropShadowEffect(r);let i=n.map((a,o)=>Object.assign({},t,{name:"Drop Shadow ".concat(o+1),opacity:t.opacity,fillOpacity:0,blendMode:"normal",effects:{scale:100,dropShadow:[pigmaLegacyShadowAngle(a)]},effectsOpen:!0}));return{name:e.name,hidden:!e.visible,blendMode:"pass through",opened:!1,children:[r,...i]}}function V1(e,t){'
$shadowCarrierV1Marker = 'function V1(e,t){'
$shadowCarrierHelperBlock = 'function pigmaNativeDropShadowList(e){return e?$1(e).dropShadow.map(t=>Ph(t)).filter(Boolean):[]}function pigmaRemoveDropShadowEffect(e){if(!e.effects||!e.effects.dropShadow)return;let t=Object.assign({},e.effects);delete t.dropShadow;let n=Object.keys(t).filter(r=>r!=="scale"&&t[r]!==void 0&&(!Array.isArray(t[r])||t[r].length>0));if(n.length===0){delete e.effects,delete e.effectsOpen;return}e.effects=t}function pigmaLegacyShadowAngle(e){let t=Object.assign({},e);return Number.isFinite(t.angle)&&t.angle>180&&(t.angle-=360),t}function pigmaExplodeDropShadowLayer(e,t){let n=pigmaNativeDropShadowList(e.effects);if(n.length<2)return null;let r=Object.assign({},t,{name:"Content"});pigmaRemoveDropShadowEffect(r);let i=n.map((a,o)=>Object.assign({},t,{name:"Drop Shadow ".concat(o+1),opacity:t.opacity,fillOpacity:0,blendMode:"normal",effects:{scale:100,dropShadow:[pigmaLegacyShadowAngle(a)]},effectsOpen:!0}));return{name:e.name,hidden:!e.visible,blendMode:"pass through",opened:!1,children:[r,...i]}}'
$nativeShadowStackMergedFunctionFind = 'function pigmaNativeShadowStack(e){let t=e.map(n=>Ph(n)).filter(Boolean);return t.length<=1?t:[pigmaMergeNativeShadowStack(t)]}'
$nativeShadowStackUnmergedFunctionFind = 'function pigmaNativeShadowStack(e){let t=e.map(n=>Ph(n)).filter(Boolean);return t}'
$nativeShadowStackPreserveFunctionReplace = 'function pigmaNativeShadowStack(e){let t=e.map(n=>Ph(n)).filter(Boolean);return t}'
$shadowExplodeLayerFunctionFind = 'function pigmaLegacyShadowAngle(e){let t=Object.assign({},e);return Number.isFinite(t.angle)&&t.angle>180&&(t.angle-=360),t}function pigmaExplodeDropShadowLayer(e,t){let n=pigmaNativeDropShadowList(e.effects);if(n.length<2)return null;let r=Object.assign({},t,{name:"Content"});pigmaRemoveDropShadowEffect(r);let i=n.map((a,o)=>Object.assign({},t,{name:"Drop Shadow ".concat(o+1),opacity:t.opacity,fillOpacity:0,blendMode:"normal",effects:{scale:100,dropShadow:[pigmaLegacyShadowAngle(a)]},effectsOpen:!0}));return{name:e.name,hidden:!e.visible,blendMode:"pass through",opened:!1,children:[r,...i]}}'
$shadowExplodeLayerFunctionUnnormalizedFind = 'function pigmaExplodeDropShadowLayer(e,t){let n=pigmaNativeDropShadowList(e.effects);if(n.length<2)return null;let r=Object.assign({},t,{name:"Content"});pigmaRemoveDropShadowEffect(r);let i=n.map((a,o)=>Object.assign({},t,{name:"Drop Shadow ".concat(o+1),opacity:t.opacity,fillOpacity:0,blendMode:"normal",effects:{scale:100,dropShadow:[a]},effectsOpen:!0}));return{name:e.name,hidden:!e.visible,blendMode:"pass through",opened:!1,children:[r,...i]}}'
$shadowExplodeLayerFunctionCanvasGuardFind = 'function pigmaExplodeDropShadowLayer(e,t){let n=pigmaNativeDropShadowList(e.effects);if(n.length<2||!t.canvas)return null;let r=Object.assign({},t,{name:"Content"});pigmaRemoveDropShadowEffect(r);let i=n.map((a,o)=>Object.assign({},t,{name:"Drop Shadow ".concat(o+1),opacity:t.opacity,fillOpacity:0,blendMode:"normal",effects:{scale:100,dropShadow:[a]},effectsOpen:!0}));return{name:e.name,hidden:!e.visible,blendMode:"pass through",opened:!1,children:[r,...i]}}'
$shadowExplodeLayerFunctionDisable = 'function pigmaExplodeDropShadowLayer(e,t){return null}'
$psdMultiEffectsLfx2Find = 'W("lfx2",function(e){return e.effects!==void 0&&!Ml(e.effects)},function(e,t,n){var r=(0,x.readUint32)(e);if(r!==0)throw new Error("Invalid lfx2 version");var i=(0,E.readVersionAndDescriptor)(e);t.effects=(0,E.parseEffects)(i,!!e.logMissingFeatures),(0,x.skipBytes)(e,n())},function(e,t,n,r){var i=(0,E.serializeEffects)(t.effects,!!r.logMissingFeatures,!0);(0,w.writeUint32)(e,0),(0,E.writeVersionAndDescriptor)(e,"","null",i)})'
$psdMultiEffectsLfx2AlwaysFind = 'W("lfx2",function(e){return e.effects!==void 0},function(e,t,n){var r=(0,x.readUint32)(e);if(r!==0)throw new Error("Invalid lfx2 version");var i=(0,E.readVersionAndDescriptor)(e);t.effects=(0,E.parseEffects)(i,!!e.logMissingFeatures),(0,x.skipBytes)(e,n())},function(e,t,n,r){var i=(0,E.serializeEffects)(t.effects,!!r.logMissingFeatures,!0);(0,w.writeUint32)(e,0),(0,E.writeVersionAndDescriptor)(e,"","null",i)})'
$psdMultiEffectsLfx2DisabledFind = 'W("lfx2",function(e){return!1},function(e,t,n){var r=(0,x.readUint32)(e);if(r!==0)throw new Error("Invalid lfx2 version");var i=(0,E.readVersionAndDescriptor)(e);t.effects=(0,E.parseEffects)(i,!!e.logMissingFeatures),(0,x.skipBytes)(e,n())},function(e,t,n,r){var i=(0,E.serializeEffects)(t.effects,!!r.logMissingFeatures,!0);(0,w.writeUint32)(e,0),(0,E.writeVersionAndDescriptor)(e,"","null",i)})'
$psdMultiEffectsLfx2Replace = $psdMultiEffectsLfx2DisabledFind
$psdMultiEffectsLmfxFind = 'W("lmfx",function(e){return e.effects!==void 0&&Ml(e.effects)},function(e,t,n){var r=(0,x.readUint32)(e);if(r!==0)throw new Error("Invalid lmfx version");var i=(0,E.readVersionAndDescriptor)(e);t.effects=(0,E.parseEffects)(i,!!e.logMissingFeatures),(0,x.skipBytes)(e,n())},function(e,t,n,r){var i=(0,E.serializeEffects)(t.effects,!!r.logMissingFeatures,!0);(0,w.writeUint32)(e,0),(0,E.writeVersionAndDescriptor)(e,"","null",i)})'
$psdMultiEffectsLmfxDisabledFind = 'W("lmfx",function(e){return!1},function(e,t,n){var r=(0,x.readUint32)(e);if(r!==0)throw new Error("Invalid lmfx version");var i=(0,E.readVersionAndDescriptor)(e);t.effects=(0,E.parseEffects)(i,!!e.logMissingFeatures),(0,x.skipBytes)(e,n())},function(e,t,n,r){var i=(0,E.serializeEffects)(t.effects,!!r.logMissingFeatures,!0);(0,w.writeUint32)(e,0),(0,E.writeVersionAndDescriptor)(e,"","null",i)})'
$psdMultiEffectsLmfxReplace = $psdMultiEffectsLmfxFind
$psdMultiEffectsLegacyFind = 'W("lrFX",xe("effects"),function(e,t,n){t.effects||(t.effects=(0,Zf.readEffects)(e)),(0,x.skipBytes)(e,n())},function(e,t){(0,Zf.writeEffects)(e,t.effects)})'
$psdMultiEffectsLegacyGuardedFind = 'W("lrFX",function(e){return e.effects!==void 0&&!Ml(e.effects)},function(e,t,n){t.effects||(t.effects=(0,Zf.readEffects)(e)),(0,x.skipBytes)(e,n())},function(e,t){(0,Zf.writeEffects)(e,t.effects)})'
$psdMultiEffectsLegacyReplace = 'W("lrFX",xe("effects"),function(e,t,n){t.effects||(t.effects=(0,Zf.readEffects)(e)),(0,x.skipBytes)(e,n())},function(e,t){(0,Zf.writeEffects)(e,Ml(t.effects)?function(n){var r={};for(var i in n)if(Object.prototype.hasOwnProperty.call(n,i)){var a=n[i];r[i]=Array.isArray(a)&&a.length>1?[a[0]]:a}return r}(t.effects):t.effects)})'
$psdMultiEffectsLfx2LengthFind = 'l==="GdFl"||l==="lmfx"||l==="lrFX"||l==="cinf"'
$psdMultiEffectsLfx2LengthReplace = 'l==="GdFl"||l==="lfx2"||l==="lmfx"||l==="lrFX"||l==="cinf"'
$shadowCarrierPushFind = 's.push(T),m();continue}return{children:s,linkedFiles:u,backgroundDebug:l,warnings:c}}function editableTextParagraphRuns'
$shadowCarrierPushReplace = '{let M=pigmaExplodeDropShadowLayer(v,T);s.push(M||T),m();continue}}return{children:s,linkedFiles:u,backgroundDebug:l,warnings:c}}function editableTextParagraphRuns'
$shadowCarrierBrokenPushFind = 's.push(T),m();continue}{let M=pigmaExplodeDropShadowLayer(v,T);s.push(M||T),m()}return{children:s,linkedFiles:u,backgroundDebug:l,warnings:c}}function editableTextParagraphRuns'
$shadowCarrierBrokenPushReplace = $shadowCarrierPushReplace
$shadowCarrierMissingLoopCloseFind = '{let M=pigmaExplodeDropShadowLayer(v,T);s.push(M||T),m();continue}return{children:s,linkedFiles:u,backgroundDebug:l,warnings:c}}function editableTextParagraphRuns'
$shadowCarrierMissingLoopCloseReplace = $shadowCarrierPushReplace
$shadowCarrierVectorPushFind = 'if(v.kind==="vector"){let M=await aw(v,r,i,f.imageExportMode,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}'
$shadowCarrierVectorPushReplace = 'if(v.kind==="vector"){let M=await aw(v,r,i,f.imageExportMode,d,o),B=pigmaExplodeDropShadowLayer(v,M.layer);s.push(B||M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}'
$shadowCarrierShapePushFind = 'let V=B1(v,r,i,N);if(N&&B){let A=await bt(v,V,N,d,o);s.push(A.layer),u.push(...A.linkedFiles),c.push(...A.warnings)}else s.push(V);m();continue'
$shadowCarrierShapePushReplace = 'let V=B1(v,r,i,N);if(N&&B){let A=await bt(v,V,N,d,o),O=pigmaExplodeDropShadowLayer(v,A.layer);s.push(O||A.layer),u.push(...A.linkedFiles),c.push(...A.warnings)}else{let A=pigmaExplodeDropShadowLayer(v,V);s.push(A||V)}m();continue'
$editableTextMissingCloseFind = 'if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){'
$editableTextMissingCloseReplace = 'if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}}Wn(T,v.effects,v.strokeEffect);if(P){'
if ($uiBundle.Contains('invalidateTextLayers:t&&e.hasEditableText')) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find 'invalidateTextLayers:t&&e.hasEditableText' `
    -Replace 'invalidateTextLayers:!1' `
    -ExpectedCount 1 `
    -Label 'ui text invalidation disabled'
}

# Keep editable text layer metadata closer to what Photoshop expects so it does
# not feel compelled to rebuild the text engine data on open. Some bundle
# variants no longer expose the older g1/v1 markers, so keep this patch optional.
if ($bundle.Contains($runtimePhotoshopFontNameFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $runtimePhotoshopFontNameFind `
    -Replace $runtimePhotoshopFontNameReplace `
    -ExpectedCount 1 `
    -Label 'runtime Photoshop font name resolver'
} elseif ($bundle.Contains('function pigmaKnownPhotoshopFontName(')) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch runtime Photoshop font name resolver.'
}
$runtimeFontMapStart = $bundle.IndexOf('var pigmaPhotoshopFontMap=')
$runtimeFontMapEnd = if ($runtimeFontMapStart -ge 0) { $bundle.IndexOf(';function pigmaNormalizePhotoshopFontToken', $runtimeFontMapStart) } else { -1 }
if ($runtimeFontMapStart -ge 0 -and $runtimeFontMapEnd -gt $runtimeFontMapStart) {
  $bundle = $bundle.Substring(0, $runtimeFontMapStart) + 'var pigmaPhotoshopFontMap=' + $fontPostScriptMapJson + $bundle.Substring($runtimeFontMapEnd)
}

if ($bundle.Contains($runtimeTextStyleFontWeightFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $runtimeTextStyleFontWeightFind `
    -Replace $runtimeTextStyleFontWeightReplace `
    -ExpectedCount 1 `
    -Label 'runtime editable text font weight metadata'
} elseif ($bundle.Contains('fontWeight:pigmaPhotoshopFontWeight')) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch runtime editable text font weight metadata.'
}

if ($bundle.Contains($runtimeTextVerticalJustificationHelperFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $runtimeTextVerticalJustificationHelperFind `
    -Replace $runtimeTextVerticalJustificationHelperReplace `
    -ExpectedCount 1 `
    -Label 'runtime editable text vertical justification helper'
} elseif ($bundle.Contains('function pigmaEditableTextVerticalJustification(')) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch runtime editable text vertical justification helper.'
}

if ($bundle.Contains($runtimeTextVerticalJustificationFieldFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $runtimeTextVerticalJustificationFieldFind `
    -Replace $runtimeTextVerticalJustificationFieldReplace `
    -ExpectedCount 1 `
    -Label 'runtime editable text vertical justification payload'
} elseif ($bundle.Contains($runtimeTextVerticalJustificationFieldReplace)) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch runtime editable text vertical justification payload.'
}

if ($bundle.Contains($singleLinePointTextGuardFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $singleLinePointTextGuardFind `
    -Replace $singleLinePointTextGuardReplace `
    -ExpectedCount 1 `
    -Label 'single-line editable text point mode'
} elseif ($bundle.Contains($singleLinePointTextGuardReplace)) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch single-line editable text point mode.'
}

if ($bundle.Contains($editableTextBoxResizeModeFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextBoxResizeModeFind `
    -Replace $editableTextBoxResizeModeReplace `
    -ExpectedCount 1 `
    -Label 'editable text box resize mode guard'
} elseif ($bundle.Contains($editableTextBoxResizeModeReplace)) {
  # Already patched in this bundle variant.
} else {
  throw 'Could not patch editable text box resize mode guard.'
}

if ($bundle.Contains($editableBoxTextPreviewBoundsFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableBoxTextPreviewBoundsFind `
    -Replace $editableBoxTextPreviewBoundsReplace `
    -ExpectedCount 1 `
    -Label 'main editable box text preview bounds'
} elseif (-not $bundle.Contains($editableBoxTextPreviewBoundsReplace)) {
  throw 'Could not patch main editable box text preview bounds.'
}

if ($bundle.Contains($editableTextAutoLayoutCloneFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextAutoLayoutCloneFind `
    -Replace $editableTextAutoLayoutCloneReplace `
    -ExpectedCount 1 `
    -Label 'editable text auto-layout clone prep'
} elseif (-not $bundle.Contains($editableTextAutoLayoutCloneReplace)) {
  throw 'Could not patch editable text auto-layout clone prep.'
}

if ($bundle.Contains($editableTextParagraphRunsLegacyHelper)) {
  $bundle = $bundle.Replace($editableTextParagraphRunsLegacyHelper, $editableTextParagraphRunsHelper)
}
if ($bundle.Contains($editableTextParagraphRunsPreviousHelper)) {
  $bundle = $bundle.Replace($editableTextParagraphRunsPreviousHelper, $editableTextParagraphRunsHelper)
}
if ($bundle.Contains('function g1(e){') -and $bundle.Contains('function v1(')) {
  $bundle = Replace-Section `
    -Text $bundle `
    -StartMarker 'function g1(e){' `
    -EndMarker 'function v1(' `
    -Replacement $editableTextEngineMetadataReplacement `
    -Label 'editable text engine metadata'
}
$bundle = Collapse-RepeatedSnippetBeforeMarker `
  -Text $bundle `
  -Snippet $editableTextEngineMetadataPrefix `
  -Marker 'function g1(e){'

if ($bundle.Contains($editableTextBoxAnchorFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextBoxAnchorFind `
    -Replace $editableTextBoxAnchorReplace `
    -ExpectedCount 1 `
    -Label 'editable text box bounds anchor'
} elseif ($bundle.Contains($editableTextBoxAnchorPreviousReplace)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextBoxAnchorPreviousReplace `
    -Replace $editableTextBoxAnchorReplace `
    -ExpectedCount 1 `
    -Label 'editable text box bounds anchor previous patch'
} elseif ($bundle.Contains($editableTextBoxAnchorLocalOnlyReplace)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextBoxAnchorLocalOnlyReplace `
    -Replace $editableTextBoxAnchorReplace `
    -ExpectedCount 1 `
    -Label 'editable text box bounds anchor local-only patch'
} elseif ($bundle.Contains('function v1(') -and -not $bundle.Contains($editableTextBoxAnchorReplace)) {
  throw 'Could not patch editable text box bounds anchor.'
}

if ($bundle.Contains($editableTextPreviewSafeBoxBoundsFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreviewSafeBoxBoundsFind `
    -Replace $editableTextPreviewSafeBoxBoundsReplace `
    -ExpectedCount 1 `
    -Label 'editable text preview safe line-height box bounds'
} elseif ($bundle.Contains('function bm(e,t){') -and -not $bundle.Contains($editableTextPreviewSafeBoxBoundsReplace)) {
  throw 'Could not patch editable text preview safe line-height box bounds.'
}

if ($bundle.Contains($editableTextPreflightLegacyFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightLegacyFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'editable text preflight fallback legacy'
} elseif ($bundle.Contains($editableTextPreflightGuardedFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightGuardedFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'editable text preflight fallback guarded'
} elseif ($bundle.Contains($editableTextPreflightInstrumentedLegacyFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightInstrumentedLegacyFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'editable text preflight fallback instrumented legacy'
} elseif ($bundle.Contains($editableTextPreflightNoTxt2Find)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightNoTxt2Find `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'editable text Txt2 engine data'
} elseif ($bundle.Contains($editableTextPreflightFixedFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightFixedFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'editable text preflight fallback fixed'
}
if ($bundle.Contains($editableTextPreflightTxt2AssignFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightTxt2AssignFind `
    -Replace $editableTextPreflightTxt2AssignReplace `
    -ExpectedCount 1 `
    -Label 'editable text Txt2 engine data assignment'
}
if ($bundle.Contains($editableTextPreflightFallbackEngineDataFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightFallbackEngineDataFind `
    -Replace $editableTextPreflightFallbackEngineDataReplace `
    -ExpectedCount 1 `
    -Label 'editable text fallback engineData clear'
}
if ($bundle.Contains($editableTextIndexAssignFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextIndexAssignFind `
    -Replace $editableTextIndexAssignReplace `
    -ExpectedCount 1 `
    -Label 'editable text unique TextIndex assignment'
}
if ($bundle.Contains($editableTextIndexEncodedFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextIndexEncodedFind `
    -Replace $editableTextIndexEncodedReplace `
    -ExpectedCount 1 `
    -Label 'editable text unique TextIndex encoded log'
}

if ($bundle.Contains($editableTextPreviewExperimentFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreviewExperimentFind `
    -Replace $editableTextPreviewExperimentReplace `
    -ExpectedCount 1 `
    -Label 'editable text preview experiment disabled'
} elseif ($bundle.Contains($editableTextPreviewExperimentReplace)) {
  # Already patched in this bundle variant.
}
if ($bundle.Contains($editableTextPreviewGateFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreviewGateFind `
    -Replace $editableTextPreviewGateReplace `
    -ExpectedCount 1 `
    -Label 'editable text preview decode forced'
}
if ($bundle.Contains($editableTextPreviewAttachFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreviewAttachFind `
    -Replace $editableTextPreviewAttachReplace `
    -ExpectedCount 1 `
    -Label 'editable text preview canvas forced'
}

# Bitmap/image layers use the generic T canvas layer path. That path used to
# skip native PSD layer styles, so Figma shadows survived on groups/vectors/text
# but disappeared from Photoshop image layers as if effects never existed.
if ($bundle.Contains($bitmapLayerNativeEffectsFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $bitmapLayerNativeEffectsFind `
    -Replace $bitmapLayerNativeEffectsReplace `
    -ExpectedCount 1 `
    -Label 'bitmap layer native effects attach'
}

if ($uiBundle.Contains('function g1(e){') -and $uiBundle.Contains('function v1(')) {
  if ($uiBundle.Contains($editableTextParagraphRunsLegacyHelper)) {
    $uiBundle = $uiBundle.Replace($editableTextParagraphRunsLegacyHelper, $editableTextParagraphRunsHelper)
  }
  if ($uiBundle.Contains($editableTextParagraphRunsPreviousHelper)) {
    $uiBundle = $uiBundle.Replace($editableTextParagraphRunsPreviousHelper, $editableTextParagraphRunsHelper)
  }
  $uiBundle = Replace-Section `
    -Text $uiBundle `
    -StartMarker 'function g1(e){' `
    -EndMarker 'function v1(' `
    -Replacement $editableTextEngineMetadataReplacement `
    -Label 'ui editable text engine metadata'
}
$uiBundle = Collapse-RepeatedSnippetBeforeMarker `
  -Text $uiBundle `
  -Snippet $editableTextEngineMetadataPrefix `
  -Marker 'function g1(e){'

if ($uiBundle.Contains($editableTextBoxAnchorFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextBoxAnchorFind `
    -Replace $editableTextBoxAnchorReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text box bounds anchor'
} elseif ($uiBundle.Contains($editableTextBoxAnchorPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextBoxAnchorPreviousReplace `
    -Replace $editableTextBoxAnchorReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text box bounds anchor previous patch'
} elseif ($uiBundle.Contains($editableTextBoxAnchorLocalOnlyReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextBoxAnchorLocalOnlyReplace `
    -Replace $editableTextBoxAnchorReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text box bounds anchor local-only patch'
} elseif (-not $uiBundle.Contains($editableTextBoxAnchorReplace)) {
  throw 'Could not patch UI editable text box bounds anchor.'
}

if ($uiBundle.Contains($editableTextPreviewSafeBoxBoundsFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreviewSafeBoxBoundsFind `
    -Replace $editableTextPreviewSafeBoxBoundsReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preview safe line-height box bounds'
} elseif ($uiBundle.Contains('function bm(e,t){') -and -not $uiBundle.Contains($editableTextPreviewSafeBoxBoundsReplace)) {
  throw 'Could not patch UI editable text preview safe line-height box bounds.'
}

if ($uiBundle.Contains($editableTextPreflightLegacyFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightLegacyFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preflight fallback legacy'
} elseif ($uiBundle.Contains($editableTextPreflightGuardedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightGuardedFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preflight fallback guarded'
} elseif ($uiBundle.Contains($editableTextPreflightInstrumentedLegacyFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightInstrumentedLegacyFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preflight fallback instrumented legacy'
} elseif ($uiBundle.Contains($editableTextPreflightNoTxt2Find)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightNoTxt2Find `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text Txt2 engine data'
} elseif ($uiBundle.Contains($editableTextPreflightFixedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightFixedFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preflight fallback fixed'
}
if ($uiBundle.Contains($editableTextPreflightTxt2AssignFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightTxt2AssignFind `
    -Replace $editableTextPreflightTxt2AssignReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text Txt2 engine data assignment'
}
if ($uiBundle.Contains($editableTextPreflightFallbackEngineDataFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightFallbackEngineDataFind `
    -Replace $editableTextPreflightFallbackEngineDataReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text fallback engineData clear'
}
if ($uiBundle.Contains($editableTextIndexAssignFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextIndexAssignFind `
    -Replace $editableTextIndexAssignReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text unique TextIndex assignment'
}
if ($uiBundle.Contains($editableTextIndexEncodedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextIndexEncodedFind `
    -Replace $editableTextIndexEncodedReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text unique TextIndex encoded log'
}

if ($uiBundle.Contains($editableTextPreviewExperimentFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreviewExperimentFind `
    -Replace $editableTextPreviewExperimentReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preview experiment disabled'
} elseif ($uiBundle.Contains($editableTextPreviewExperimentReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI editable text preview experiment flag.'
}
if ($uiBundle.Contains($editableTextPreviewGateFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreviewGateFind `
    -Replace $editableTextPreviewGateReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preview decode forced'
} elseif ($uiBundle.Contains($editableTextPreviewGateReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI editable text preview decode gate.'
}
if ($uiBundle.Contains($editableTextPreviewAttachFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreviewAttachFind `
    -Replace $editableTextPreviewAttachReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preview canvas forced'
} elseif ($uiBundle.Contains($editableTextPreviewAttachReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI editable text preview canvas attach.'
}

if ($uiBundle.Contains($editableTextMissingCloseFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextMissingCloseFind `
    -Replace $editableTextMissingCloseReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text missing close repair'
}

if ($uiBundle.Contains($bitmapLayerNativeEffectsFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $bitmapLayerNativeEffectsFind `
    -Replace $bitmapLayerNativeEffectsReplace `
    -ExpectedCount 1 `
    -Label 'ui bitmap layer native effects attach'
}

$uiColorDodgeShapeOpacityFind = 'function B1(e,t,n,r=null){var a,o;let i={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),vectorOrigination:iw(e),vectorMask:{fillStartsWithAllPixels:!1,paths:[Lw(e,t,n)]}};return r&&(i.canvas=r,i.usingAlignedRendering=!0),e.fill&&(i.fillOpacity=Em(e.fill),i.vectorFill=Dm(e.fill,e.width,e.height,e.nodeTransform)),i.vectorStroke={fillEnabled:!!e.fill,strokeEnabled:!!e.stroke,lineWidth:{value:e.stroke?e.stroke.width:1,units:"Pixels"},lineAlignment:e.stroke?e.stroke.position:"center",opacity:e.stroke?e.stroke.color.a/255:1,content:{type:"color",color:Sr(_1(e.fill,(o=(a=e.stroke)==null?void 0:a.color)!=null?o:null))},resolution:72},Wn(i,e.effects,e.strokeEffect),i}'
$uiColorDodgeShapeOpacityPreviousReplace = 'function pigmaShapeUsesLayerOpacityForFill(e){return e&&String(e.blendMode||"").toLowerCase()==="color dodge"}function pigmaShapeFillOpacity(e){return Em(e&&e.fill)}function pigmaShapeLayerOpacity(e){let t=typeof e.opacity=="number"?e.opacity:1,n=pigmaShapeFillOpacity(e);return pigmaShapeUsesLayerOpacityForFill(e)?ae(t*n,0,1):t}function pigmaShapeLayerFillOpacity(e){return pigmaShapeUsesLayerOpacityForFill(e)?1:pigmaShapeFillOpacity(e)}function B1(e,t,n,r=null){var a,o;let i={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:pigmaShapeLayerOpacity(e),hidden:!e.visible,blendMode:wr(e.blendMode),vectorOrigination:iw(e),vectorMask:{fillStartsWithAllPixels:!1,paths:[Lw(e,t,n)]}};return r&&(i.canvas=r,i.usingAlignedRendering=!0),e.fill&&(i.fillOpacity=pigmaShapeLayerFillOpacity(e),i.vectorFill=Dm(e.fill,e.width,e.height,e.nodeTransform)),i.vectorStroke={fillEnabled:!!e.fill,strokeEnabled:!!e.stroke,lineWidth:{value:e.stroke?e.stroke.width:1,units:"Pixels"},lineAlignment:e.stroke?e.stroke.position:"center",opacity:e.stroke?e.stroke.color.a/255:1,content:{type:"color",color:Sr(_1(e.fill,(o=(a=e.stroke)==null?void 0:a.color)!=null?o:null))},resolution:72},Wn(i,e.effects,e.strokeEffect),i}'
$uiColorDodgeShapeOpacityReplace = 'function pigmaShapeUsesLayerOpacityForFill(e){return e&&String(e.blendMode||"").toLowerCase()==="color dodge"}function pigmaShapeFillOpacity(e){return Em(e&&e.fill)}function pigmaShapeLayerOpacity(e){let t=typeof e.opacity=="number"?e.opacity:1,n=pigmaShapeFillOpacity(e);return pigmaShapeUsesLayerOpacityForFill(e)?ae(t*n,0,1):t}function pigmaShapeLayerFillOpacity(e){return pigmaShapeUsesLayerOpacityForFill(e)?1:pigmaShapeFillOpacity(e)}function B1(e,t,n,r=null){var a,o;let i={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:pigmaShapeLayerOpacity(e),hidden:!e.visible,blendMode:wr(e.blendMode),vectorOrigination:iw(e),vectorMask:{fillStartsWithAllPixels:!1,paths:[Lw(e,t,n)]}};return r&&(i.canvas=r),e.fill&&(i.fillOpacity=pigmaShapeLayerFillOpacity(e),i.vectorFill=Dm(e.fill,e.width,e.height,e.nodeTransform)),i.vectorStroke={fillEnabled:!!e.fill,strokeEnabled:!!e.stroke,lineWidth:{value:e.stroke?e.stroke.width:1,units:"Pixels"},lineAlignment:e.stroke?e.stroke.position:"center",opacity:e.stroke?e.stroke.color.a/255:1,content:{type:"color",color:Sr(_1(e.fill,(o=(a=e.stroke)==null?void 0:a.color)!=null?o:null))},resolution:72},Wn(i,e.effects,e.strokeEffect),i}'
$uiShapePreviewVectorMetadataFind = 'let V=B1(v,r,i,N);if(N&&B){let A=await bt(v,V,N,d,o),O=pigmaExplodeDropShadowLayer(v,A.layer);s.push(O||A.layer),u.push(...A.linkedFiles),c.push(...A.warnings)}else{let A=pigmaExplodeDropShadowLayer(v,V);s.push(A||V)}m();continue}'
$uiShapePreviewVectorMetadataReplace = 'let V=N?ku(v,N,v.x,v.y):B1(v,r,i,null);if(N&&B){let A=await bt(v,V,N,d,o),O=pigmaExplodeDropShadowLayer(v,A.layer);s.push(O||A.layer),u.push(...A.linkedFiles),c.push(...A.warnings)}else{let A=pigmaExplodeDropShadowLayer(v,V);s.push(A||V)}m();continue}'
$uiVectorPreviewMetadataReplace = 'function Qo(e){let t=e!=null?e:{};return{disableShapePreviewCanvas:t.disableShapePreviewCanvas===!0,forceBitmapVectorPreview:t.forceBitmapVectorPreview===!0,disableEditableTextPreview:!1,disableLayerBlur:t.disableLayerBlur===!0,disableProgressiveLayerBlur:t.disableProgressiveLayerBlur===!0,disableBackgroundBlur:t.disableBackgroundBlur===!0,disableNoise:t.disableNoise===!0,disableTexture:t.disableTexture===!0}}'
$uiVectorPreviewMetadataLegacyReplace = 'function Qo(e){let t=e!=null?e:{};return{disableShapePreviewCanvas:t.disableShapePreviewCanvas===!0,forceBitmapVectorPreview:!0,disableEditableTextPreview:!1,disableLayerBlur:t.disableLayerBlur===!0,disableProgressiveLayerBlur:t.disableProgressiveLayerBlur===!0,disableBackgroundBlur:t.disableBackgroundBlur===!0,disableNoise:t.disableNoise===!0,disableTexture:t.disableTexture===!0}}'
$uiNativeShapeBeforeBitmapFind = 'async function aw(e,t,n,r,i,a=null){if(i.forceBitmapVectorPreview){let f=await Xn(e.pngBytes);return{layer:ku(e,f,e.x+e.previewOffsetX,e.y+e.previewOffsetY,null),linkedFiles:[],warnings:[]}}let o=await ow(e),s=o.canvas,u=gw(e.svgString,e.width,e.height),l=cu(Ki(e.effects),i),c=e.previewOffsetX!==0||e.previewOffsetY!==0||o.visibleWidth!==e.width||o.visibleHeight!==e.height;if(du(l)){'
$uiNativeShapeBeforeBitmapReplace = 'async function aw(e,t,n,r,i,a=null){let pigmaGradientShapeSvg=e.fill&&e.fill.kind==="gradient",pigmaForceSvgSmartObject=e.forceSvgSmartObject===!0||pigmaGradientShapeSvg,pigmaNativeShapeCandidate=e.strategy==="shape"&&e.fill&&!pigmaForceSvgSmartObject&&gw(e.svgString,e.width,e.height);if(i.forceBitmapVectorPreview&&!pigmaNativeShapeCandidate){let f=await Xn(e.pngBytes);return{layer:ku(e,f,e.x+e.previewOffsetX,e.y+e.previewOffsetY,null),linkedFiles:[],warnings:[]}}let o=await ow(e),s=o.canvas,u=pigmaNativeShapeCandidate,l=cu(Ki(e.effects),i),c=e.previewOffsetX!==0||e.previewOffsetY!==0||o.visibleWidth!==e.width||o.visibleHeight!==e.height;if(du(l)){'
$uiNativeShapeSizeGuardFind = 'function gw(e,t,n){if(t>512||n>512||t*n>18e4)return!1;'
$uiNativeShapeSizeGuardReplace = 'function gw(e,t,n){if(t<=0||n<=0)return!1;'
$uiNativeShapeTransformGuardFind = 'function gw(e,t,n){if(t<=0||n<=0)return!1;let i=new DOMParser().parseFromString(e,"image/svg+xml");if(i.querySelector("parsererror"))return!1;let a=i.documentElement;if(a.tagName.toLowerCase()!=="svg")return!1;let o=Array.from(a.querySelectorAll("*")).filter(u=>{let l=u.tagName.toLowerCase();return l!=="defs"&&l!=="title"&&l!=="desc"});if(o.length===0||o.length>6)return!1;let s=0;for(let u of o){let l=u.tagName.toLowerCase();if(l!=="path"&&l!=="rect"&&l!=="ellipse"&&l!=="circle"||u.hasAttribute("transform"))return!1;if(l==="path"){let c=u.getAttribute("d")||"";if(!c||/[Aa]/.test(c))return!1;let f=c.match(/[MmLlHhVvCcSsQqTtZz]/g)||[];if(s+=f.length,f.length>40)return!1}else if(l==="ellipse"||l==="circle")try{Zm(u)}catch(c){return!1}}return s<=60}'
$uiNativeShapeTransformGuardPreviousReplace = 'function pigmaSvgTransformIsNativeShapeSafe(e){if(!e||e.trim().length===0)return!0;let t=e.trim(),n=/([a-zA-Z]+)\(([^)]*)\)/g,r,i=0,a=!1;for(;(r=n.exec(t));){if(t.slice(i,r.index).trim().length>0)return!1;let o=r[1].toLowerCase(),s=qm(r[2]);if(o==="matrix"){if(s.length!==6)return!1}else if(o==="translate"||o==="scale"){if(s.length<1||s.length>2)return!1}else return!1;i=n.lastIndex,a=!0}return a&&t.slice(i).trim().length===0}function gw(e,t,n){if(t<=0||n<=0)return!1;let i=new DOMParser().parseFromString(e,"image/svg+xml");if(i.querySelector("parsererror"))return!1;let a=i.documentElement;if(a.tagName.toLowerCase()!=="svg")return!1;let o=Array.from(a.querySelectorAll("*")).filter(u=>{let l=u.tagName.toLowerCase();return l!=="defs"&&l!=="title"&&l!=="desc"});if(o.length===0||o.length>6)return!1;let s=0;for(let u of o){let l=u.tagName.toLowerCase();if(l!=="path"&&l!=="rect"&&l!=="ellipse"&&l!=="circle")return!1;if(!pigmaSvgTransformIsNativeShapeSafe(u.getAttribute("transform")))return!1;if(l==="path"){let c=u.getAttribute("d")||"";if(!c||/[Aa]/.test(c))return!1;let f=c.match(/[MmLlHhVvCcSsQqTtZz]/g)||[];if(s+=f.length,f.length>40)return!1}else if(l==="ellipse"||l==="circle")try{Zm(u)}catch(c){return!1}}return s<=60}'
$uiNativeShapeTransformGuardReplace = 'function pigmaSvgTransformIsNativeShapeSafe(e){if(!e||e.trim().length===0)return!0;let t=e.trim(),n=/([a-zA-Z]+)\(([^)]*)\)/g,r,i=0,a=!1;for(;(r=n.exec(t));){if(t.slice(i,r.index).trim().length>0)return!1;let o=r[1].toLowerCase(),s=qm(r[2]);if(o==="matrix"){if(s.length!==6)return!1}else if(o==="translate"||o==="scale"){if(s.length<1||s.length>2)return!1}else if(o==="rotate"){if(s.length!==1&&s.length!==3)return!1}else return!1;i=n.lastIndex,a=!0}return a&&t.slice(i).trim().length===0}function pigmaSvgElementIsNativeShapeSafe(e,t){let n=e.tagName.toLowerCase();if(n==="defs"||n==="title"||n==="desc"||n==="metadata"||n==="style")return!0;if(!pigmaSvgTransformIsNativeShapeSafe(e.getAttribute("transform")))return!1;if(n==="svg"||n==="g"){for(let r of Array.from(e.children))if(!pigmaSvgElementIsNativeShapeSafe(r,t))return!1;return!0}if(n!=="path"&&n!=="rect"&&n!=="ellipse"&&n!=="circle")return!1;if(t.count+=1,t.count>6)return!1;if(n==="path"){let r=e.getAttribute("d")||"";if(!r||/[Aa]/.test(r))return!1;let i=r.match(/[MmLlHhVvCcSsQqTtZz]/g)||[];return t.commands+=i.length,!(i.length>40||t.commands>60)}else if(n==="ellipse"||n==="circle")try{Zm(e)}catch(r){return!1}return!0}function gw(e,t,n){if(t<=0||n<=0)return!1;let r=new DOMParser().parseFromString(e,"image/svg+xml");if(r.querySelector("parsererror"))return!1;let i=r.documentElement;if(i.tagName.toLowerCase()!=="svg")return!1;let a={count:0,commands:0};return pigmaSvgElementIsNativeShapeSafe(i,a)&&a.count>0&&a.count<=6&&a.commands<=60}'
$uiNativeShapeTransformParserFind = 'function ww(e,t){var n,r,i,a,o;switch(e){case"matrix":if(t.length!==6)throw new Error("Invalid SVG matrix() transform.");return{a:t[0],b:t[1],c:t[2],d:t[3],e:t[4],f:t[5]};case"translate":return{a:1,b:0,c:0,d:1,e:(n=t[0])!=null?n:0,f:(r=t[1])!=null?r:0};case"scale":return{a:(i=t[0])!=null?i:1,b:0,c:0,d:(o=(a=t[1])!=null?a:t[0])!=null?o:1,e:0,f:0};default:throw new Error("Unsupported SVG transform: ".concat(e,"()."))}}'
$uiNativeShapeTransformParserReplace = 'function pigmaSvgTransformTranslate(e,t){return{a:1,b:0,c:0,d:1,e:e,f:t}}function pigmaSvgTransformRotate(e,t,n){let r=e*Math.PI/180,i=Math.cos(r),a=Math.sin(r),o={a:i,b:a,c:-a,d:i,e:0,f:0};return Number.isFinite(t)&&Number.isFinite(n)?Mu(Mu(pigmaSvgTransformTranslate(t,n),o),pigmaSvgTransformTranslate(-t,-n)):o}function ww(e,t){var n,r,i,a,o;switch(e){case"matrix":if(t.length!==6)throw new Error("Invalid SVG matrix() transform.");return{a:t[0],b:t[1],c:t[2],d:t[3],e:t[4],f:t[5]};case"translate":return{a:1,b:0,c:0,d:1,e:(n=t[0])!=null?n:0,f:(r=t[1])!=null?r:0};case"scale":return{a:(i=t[0])!=null?i:1,b:0,c:0,d:(o=(a=t[1])!=null?a:t[0])!=null?o:1,e:0,f:0};case"rotate":if(t.length!==1&&t.length!==3)throw new Error("Invalid SVG rotate() transform.");return pigmaSvgTransformRotate(t[0],t[1],t[2]);default:throw new Error("Unsupported SVG transform: ".concat(e,"()."))}}'
$uiNativeShapePreviewAlignmentFind = 'if(e.strategy==="shape"&&!l&&e.fill&&!c&&u)try{let f=Sh(e,i),d=sw(e,f?s:null,t,n),p=f?await bt(e,d,s,i,a):{layer:d,linkedFiles:[],warnings:[]};return{layer:p.layer,linkedFiles:p.linkedFiles,warnings:p.warnings}}catch(f){}'
$uiNativeShapePreviewAlignmentReplace = 'if(e.strategy==="shape"&&!l&&e.fill&&u)try{let f=Sh(e,i),d=sw(e,f?s:null,t,n),p=f?await bt(e,d,s,i,a):{layer:d,linkedFiles:[],warnings:[]};return{layer:p.layer,linkedFiles:p.linkedFiles,warnings:p.warnings}}catch(f){}if(pigmaForceSvgSmartObject&&!l)try{let f=lw(e,s,o.visibleWidth,o.visibleHeight),d=await bt(e,f.layer,s,i,a);return{layer:d.layer,linkedFiles:f.linkedFiles.concat(d.linkedFiles),warnings:f.warnings.concat(d.warnings)}}catch(f){}'
if ($uiBundle.Contains($uiColorDodgeShapeOpacityFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiColorDodgeShapeOpacityFind `
    -Replace $uiColorDodgeShapeOpacityReplace `
    -ExpectedCount 1 `
    -Label 'ui color dodge shape fill opacity mapping'
} elseif ($uiBundle.Contains($uiColorDodgeShapeOpacityPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiColorDodgeShapeOpacityPreviousReplace `
    -Replace $uiColorDodgeShapeOpacityReplace `
    -ExpectedCount 1 `
    -Label 'ui shape preview unknown metadata strip'
} elseif ($uiBundle.Contains($uiColorDodgeShapeOpacityReplace)) {
  # Already patched in this UI bundle variant.
} elseif ($uiBundle.Contains('function pigmaPsdLineDashSet(')) {
  # Already upgraded to the dashed stroke variant, which includes the color
  # dodge shape opacity mapping.
} else {
  throw 'Could not patch UI color dodge shape fill opacity mapping.'
}

$uiShapePreviewDashFind = 'function Cw(e){let t=it(e.width,e.height,"shape preview"),n=t.getContext("2d");if(!n)throw new Error("Unable to create a 2D canvas for a shape preview.");if(Cu(n,e.width,e.height,e.shape),e.fill){let r=Xm(n,e.fill,e.width,e.height,e.nodeTransform);r&&(n.globalAlpha=Ym(e.fill),n.fillStyle=r,n.fill())}return e.stroke&&e.stroke.width>0&&(n.globalAlpha=e.stroke.color.a/255,n.lineWidth=e.stroke.width,n.strokeStyle=Tu(e.stroke.color),n.stroke()),t}'
$uiShapePreviewDashReplace = 'function Cw(e){let t=it(e.width,e.height,"shape preview"),n=t.getContext("2d");if(!n)throw new Error("Unable to create a 2D canvas for a shape preview.");if(Cu(n,e.width,e.height,e.shape),e.fill){let r=Xm(n,e.fill,e.width,e.height,e.nodeTransform);r&&(n.globalAlpha=Ym(e.fill),n.fillStyle=r,n.fill())}return e.stroke&&e.stroke.width>0&&(n.globalAlpha=e.stroke.color.a/255,n.lineWidth=e.stroke.width,n.strokeStyle=Tu(e.stroke.color),Array.isArray(e.stroke.dashPattern)&&e.stroke.dashPattern.length>0&&n.setLineDash(e.stroke.dashPattern),n.stroke()),t}'
if ($uiBundle.Contains($uiShapePreviewDashFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiShapePreviewDashFind `
    -Replace $uiShapePreviewDashReplace `
    -ExpectedCount 1 `
    -Label 'ui dashed shape preview canvas'
} elseif ($uiBundle.Contains($uiShapePreviewDashReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI dashed shape preview canvas.'
}

$uiShapeVectorStrokeDashFind = 'function pigmaShapeLayerOpacity(e){let t=typeof e.opacity=="number"?e.opacity:1,n=pigmaShapeFillOpacity(e);return pigmaShapeUsesLayerOpacityForFill(e)?ae(t*n,0,1):t}function pigmaShapeLayerFillOpacity(e){return pigmaShapeUsesLayerOpacityForFill(e)?1:pigmaShapeFillOpacity(e)}function B1(e,t,n,r=null){var a,o;let i={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:pigmaShapeLayerOpacity(e),hidden:!e.visible,blendMode:wr(e.blendMode),vectorOrigination:iw(e),vectorMask:{fillStartsWithAllPixels:!1,paths:[Lw(e,t,n)]}};return r&&(i.canvas=r),e.fill&&(i.fillOpacity=pigmaShapeLayerFillOpacity(e),i.vectorFill=Dm(e.fill,e.width,e.height,e.nodeTransform)),i.vectorStroke={fillEnabled:!!e.fill,strokeEnabled:!!e.stroke,lineWidth:{value:e.stroke?e.stroke.width:1,units:"Pixels"},lineAlignment:e.stroke?e.stroke.position:"center",opacity:e.stroke?e.stroke.color.a/255:1,content:{type:"color",color:Sr(_1(e.fill,(o=(a=e.stroke)==null?void 0:a.color)!=null?o:null))},resolution:72},Wn(i,e.effects,e.strokeEffect),i}'
$uiShapeVectorStrokeDashReplace = 'function pigmaShapeLayerOpacity(e){let t=typeof e.opacity=="number"?e.opacity:1,n=pigmaShapeFillOpacity(e);return pigmaShapeUsesLayerOpacityForFill(e)?ae(t*n,0,1):t}function pigmaShapeLayerFillOpacity(e){return pigmaShapeUsesLayerOpacityForFill(e)?1:pigmaShapeFillOpacity(e)}function pigmaPsdLineDashSet(e){return e&&Array.isArray(e.dashPattern)&&e.dashPattern.length>0?e.dashPattern.map(t=>({value:t,units:"Pixels"})):void 0}function pigmaApplyPsdLineDash(e,t){let n=pigmaPsdLineDashSet(t);return n&&(e.lineDashSet=n,e.lineDashOffset={value:0,units:"Pixels"}),e}function B1(e,t,n,r=null){var a,o;let i={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:pigmaShapeLayerOpacity(e),hidden:!e.visible,blendMode:wr(e.blendMode),vectorOrigination:iw(e),vectorMask:{fillStartsWithAllPixels:!1,paths:[Lw(e,t,n)]}};return r&&(i.canvas=r),e.fill&&(i.fillOpacity=pigmaShapeLayerFillOpacity(e),i.vectorFill=Dm(e.fill,e.width,e.height,e.nodeTransform)),i.vectorStroke=pigmaApplyPsdLineDash({fillEnabled:!!e.fill,strokeEnabled:!!e.stroke,lineWidth:{value:e.stroke?e.stroke.width:1,units:"Pixels"},lineAlignment:e.stroke?e.stroke.position:"center",opacity:e.stroke?e.stroke.color.a/255:1,content:{type:"color",color:Sr(_1(e.fill,(o=(a=e.stroke)==null?void 0:a.color)!=null?o:null))},resolution:72},e.stroke),Wn(i,e.effects,e.strokeEffect),i}'
if ($uiBundle.Contains($uiShapeVectorStrokeDashFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiShapeVectorStrokeDashFind `
    -Replace $uiShapeVectorStrokeDashReplace `
    -ExpectedCount 1 `
    -Label 'ui dashed PSD vector stroke metadata'
} elseif ($uiBundle.Contains($uiShapeVectorStrokeDashReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI dashed PSD vector stroke metadata.'
}

if ($uiBundle.Contains($uiShapePreviewVectorMetadataFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiShapePreviewVectorMetadataFind `
    -Replace $uiShapePreviewVectorMetadataReplace `
    -ExpectedCount 1 `
    -Label 'ui shape preview rasterized layer metadata'
} elseif ($uiBundle.Contains($uiShapePreviewVectorMetadataReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI shape preview rasterized layer metadata.'
}

if ($uiBundle.Contains($uiVectorPreviewMetadataLegacyReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiVectorPreviewMetadataLegacyReplace `
    -Replace $uiVectorPreviewMetadataReplace `
    -ExpectedCount 1 `
    -Label 'ui vector preview respects bitmap toggle'
} elseif ($uiBundle.Contains($uiVectorPreviewMetadataReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI vector preview bitmap toggle.'
}

if ($uiBundle.Contains($uiNativeShapeBeforeBitmapFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiNativeShapeBeforeBitmapFind `
    -Replace $uiNativeShapeBeforeBitmapReplace `
    -ExpectedCount 1 `
    -Label 'ui vector export native Photoshop shape before bitmap mode'
} elseif ($uiBundle.Contains($uiNativeShapeBeforeBitmapReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI native Photoshop shape vector export.'
}

if ($uiBundle.Contains($uiNativeShapeSizeGuardFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiNativeShapeSizeGuardFind `
    -Replace $uiNativeShapeSizeGuardReplace `
    -ExpectedCount 1 `
    -Label 'ui native Photoshop shape size guard'
} elseif ($uiBundle.Contains($uiNativeShapeSizeGuardReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI native Photoshop shape size guard.'
}

if ($uiBundle.Contains($uiNativeShapeTransformGuardFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiNativeShapeTransformGuardFind `
    -Replace $uiNativeShapeTransformGuardReplace `
    -ExpectedCount 1 `
    -Label 'ui native Photoshop shape SVG transform guard'
} elseif ($uiBundle.Contains($uiNativeShapeTransformGuardPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiNativeShapeTransformGuardPreviousReplace `
    -Replace $uiNativeShapeTransformGuardReplace `
    -ExpectedCount 1 `
    -Label 'ui native Photoshop shape SVG group transform guard'
} elseif ($uiBundle.Contains($uiNativeShapeTransformGuardReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI native Photoshop shape SVG transform guard.'
}

if ($uiBundle.Contains($uiNativeShapeTransformParserFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiNativeShapeTransformParserFind `
    -Replace $uiNativeShapeTransformParserReplace `
    -ExpectedCount 1 `
    -Label 'ui native Photoshop shape SVG rotate transform parser'
} elseif ($uiBundle.Contains($uiNativeShapeTransformParserReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI native Photoshop shape SVG transform parser.'
}

if ($uiBundle.Contains($uiNativeShapePreviewAlignmentFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiNativeShapePreviewAlignmentFind `
    -Replace $uiNativeShapePreviewAlignmentReplace `
    -ExpectedCount 1 `
    -Label 'ui native Photoshop shape preview alignment gate'
} elseif ($uiBundle.Contains($uiNativeShapePreviewAlignmentReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI native Photoshop shape preview alignment gate.'
}

if ($uiBundle.Contains($uiSelectionBridgeStartupFind) -and -not $uiBundle.Contains('function pigmaRequestSelectionBridge()')) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiSelectionBridgeStartupFind `
    -Replace $uiSelectionBridgeStartupReplace `
    -ExpectedCount 1 `
    -Label 'ui startup ai selection bridge request'
}

if ($uiBundle.Contains($uiSelectionBridgeTabReplace)) {
  # Already patched in this UI bundle variant.
} elseif ($uiBundle.Contains($uiSelectionBridgeTabFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiSelectionBridgeTabFind `
    -Replace $uiSelectionBridgeTabReplace `
    -ExpectedCount 1 `
    -Label 'ui main tab ai selection bridge request'
}
while ($uiBundle.Contains($uiSelectionBridgeTabDuplicate)) {
  $uiBundle = $uiBundle.Replace($uiSelectionBridgeTabDuplicate, 't==="main"&&pigmaRequestSelectionBridge()')
}

if ($uiBundle.Contains($uiAiSelectionStateBridgeFind) -and -not $uiBundle.Contains('function pigmaSelectionFromAiChat(')) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiAiSelectionStateBridgeFind `
    -Replace $uiAiSelectionStateBridgeReplace `
    -ExpectedCount 1 `
    -Label 'ui ai selection state bridge'
}

if ($uiBundle.Contains($uiAiSelectionStateOverwriteFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiAiSelectionStateOverwriteFind `
    -Replace $uiAiSelectionStateOverwriteReplace `
    -ExpectedCount 1 `
    -Label 'ui ai selection empty overwrite guard'
}

if ($uiBundle.Contains($nativeShadowStackMergedFunctionFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $nativeShadowStackMergedFunctionFind `
    -Replace $nativeShadowStackPreserveFunctionReplace `
    -ExpectedCount 1 `
    -Label 'ui keep merged native shadow stack entries'
} elseif ($uiBundle.Contains($nativeShadowStackUnmergedFunctionFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $nativeShadowStackUnmergedFunctionFind `
    -Replace $nativeShadowStackPreserveFunctionReplace `
    -ExpectedCount 1 `
    -Label 'ui restore merged native shadow stack entries'
}

if ($uiBundle.Contains($shadowExplodeLayerFunctionDisable)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowExplodeLayerFunctionDisable `
    -Replace $shadowExplodeLayerFunctionFind `
    -ExpectedCount 1 `
    -Label 'ui enable bitmap shadow carrier split'
}

if ($uiBundle.Contains($shadowExplodeLayerFunctionUnnormalizedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowExplodeLayerFunctionUnnormalizedFind `
    -Replace $shadowExplodeLayerFunctionFind `
    -ExpectedCount 1 `
    -Label 'ui normalize legacy shadow carrier angles'
}

if ($uiBundle.Contains($shadowExplodeLayerFunctionCanvasGuardFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowExplodeLayerFunctionCanvasGuardFind `
    -Replace $shadowExplodeLayerFunctionFind `
    -ExpectedCount 1 `
    -Label 'ui allow vector shadow carrier split'
}

if ($uiBundle.Contains($preserveMultiShadowFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $preserveMultiShadowFind `
    -Replace $preserveMultiShadowReplace `
    -ExpectedCount 1 `
    -Label 'ui preserve multiple native shadows'
}

if ($uiBundle.Contains($shadowMergeAntiCancelFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowMergeAntiCancelFind `
    -Replace $shadowMergeAntiCancelReplace `
    -ExpectedCount 1 `
    -Label 'ui anti-cancel native shadow merge'
}

if ($uiBundle.Contains($shadowCarrierHelpersFind) -and -not $uiBundle.Contains('function pigmaExplodeDropShadowLayer(')) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierHelpersFind `
    -Replace $shadowCarrierHelpersReplace `
    -ExpectedCount 1 `
    -Label 'ui native shadow carrier helpers'
}

if ((-not $uiBundle.Contains('function pigmaExplodeDropShadowLayer(')) -and $uiBundle.Contains($shadowCarrierV1Marker)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierV1Marker `
    -Replace ($shadowCarrierHelperBlock + $shadowCarrierV1Marker) `
    -ExpectedCount 1 `
    -Label 'ui native shadow carrier helpers before V1'
}

if ($uiBundle.Contains($shadowCarrierBrokenPushFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierBrokenPushFind `
    -Replace $shadowCarrierBrokenPushReplace `
    -ExpectedCount 1 `
    -Label 'ui bitmap native shadow carrier layers repair'
}

if ($uiBundle.Contains($shadowCarrierMissingLoopCloseFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierMissingLoopCloseFind `
    -Replace $shadowCarrierMissingLoopCloseReplace `
    -ExpectedCount 1 `
    -Label 'ui bitmap native shadow carrier loop close repair'
}

if ($uiBundle.Contains($shadowCarrierPushFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierPushFind `
    -Replace $shadowCarrierPushReplace `
    -ExpectedCount 1 `
    -Label 'ui bitmap native shadow carrier layers'
}

if ($uiBundle.Contains($shadowCarrierVectorPushFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierVectorPushFind `
    -Replace $shadowCarrierVectorPushReplace `
    -ExpectedCount 1 `
    -Label 'ui vector native shadow carrier layers'
}

if ($uiBundle.Contains($shadowCarrierShapePushFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $shadowCarrierShapePushFind `
    -Replace $shadowCarrierShapePushReplace `
    -ExpectedCount 1 `
    -Label 'ui shape native shadow carrier layers'
}

if ($uiBundle.Contains($editableTextFallbackSummaryFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextFallbackSummaryFind `
    -Replace $editableTextFallbackSummaryReplace `
    -ExpectedCount 1 `
    -Label 'ui text metadata fallback summary'
} elseif ($uiBundle.Contains($editableTextFallbackSummaryInstrumentedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextFallbackSummaryInstrumentedFind `
    -Replace $editableTextFallbackSummaryReplace `
    -ExpectedCount 1 `
    -Label 'ui text metadata fallback summary instrumented'
}

if ($uiBundle.Contains($editableTextRedrawFlagFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextRedrawFlagFind `
    -Replace $editableTextRedrawFlagReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text redraw flag disabled'
}

if ($uiBundle.Contains($editableTextRedrawNoticeFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextRedrawNoticeFind `
    -Replace '' `
    -ExpectedCount 1 `
    -Label 'ui editable text redraw notice removed'
}

if ($uiBundle.Contains($editableTextIndexResetFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextIndexResetFind `
    -Replace $editableTextIndexResetReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text TextIndex reset'
} elseif (-not $uiBundle.Contains('pigmaResetEditableTextIndexCounter();let a=e.compositePngBytes')) {
  throw 'Could not patch UI editable text TextIndex reset.'
}

if ($uiBundle.Contains($editableTextInvalidateWriteFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextInvalidateWriteFind `
    -Replace $editableTextInvalidateWriteReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text invalidation disabled'
}

if ($uiBundle.Contains($editableTextInvalidateThumbnailWriteFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextInvalidateThumbnailWriteFind `
    -Replace $editableTextInvalidateThumbnailWriteReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text thumbnail invalidation disabled'
}

if ($uiBundle.Contains($psdCompositePreviewFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdCompositePreviewFind `
    -Replace $psdCompositePreviewReplace `
    -ExpectedCount 1 `
    -Label 'ui psd composite preview export'
}

if ($uiBundle.Contains($psdThumbnailWriteFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdThumbnailWriteFind `
    -Replace $psdThumbnailWriteReplace `
    -ExpectedCount 1 `
    -Label 'ui psd thumbnail generation'
}

if ($uiBundle.Contains($psdThumbnailMatteFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdThumbnailMatteFind `
    -Replace $psdThumbnailMatteReplace `
    -ExpectedCount 1 `
    -Label 'ui psd thumbnail matte'
}

if ($uiBundle.Contains($psdMultiEffectsLfx2DisabledFind)) {
  # Already disabled; carrier shadow layers use legacy lrFX for Photoshop UI compatibility.
} elseif ($uiBundle.Contains($psdMultiEffectsLfx2Find)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdMultiEffectsLfx2Find `
    -Replace $psdMultiEffectsLfx2Replace `
    -ExpectedCount 1 `
    -Label 'ui psd disable lfx2 shadow writer'
} elseif ($uiBundle.Contains($psdMultiEffectsLfx2AlwaysFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdMultiEffectsLfx2AlwaysFind `
    -Replace $psdMultiEffectsLfx2Replace `
    -ExpectedCount 1 `
    -Label 'ui psd disable lfx2 shadow writer'
} elseif ($uiBundle.Contains($psdMultiEffectsLfx2Replace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD multi effects lfx2 writer.'
}

if ($uiBundle.Contains($psdMultiEffectsLmfxFind)) {
  # Already matches Photoshop-authored multi shadow PSDs.
} elseif ($uiBundle.Contains($psdMultiEffectsLmfxDisabledFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdMultiEffectsLmfxDisabledFind `
    -Replace $psdMultiEffectsLmfxReplace `
    -ExpectedCount 1 `
    -Label 'ui psd multi effects restore lmfx writer'
} elseif ($uiBundle.Contains($psdMultiEffectsLmfxReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD multi effects lmfx writer.'
}

if ($uiBundle.Contains($psdMultiEffectsLegacyFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdMultiEffectsLegacyFind `
    -Replace $psdMultiEffectsLegacyReplace `
    -ExpectedCount 1 `
    -Label 'ui psd multi effects legacy lrFX fallback'
} elseif ($uiBundle.Contains($psdMultiEffectsLegacyGuardedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdMultiEffectsLegacyGuardedFind `
    -Replace $psdMultiEffectsLegacyReplace `
    -ExpectedCount 1 `
    -Label 'ui psd multi effects legacy lrFX fallback'
} elseif ($uiBundle.Contains($psdMultiEffectsLegacyReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD multi effects legacy lrFX guard.'
}

if ($uiBundle.Contains($psdMultiEffectsLfx2LengthFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $psdMultiEffectsLfx2LengthFind `
    -Replace $psdMultiEffectsLfx2LengthReplace `
    -ExpectedCount 1 `
    -Label 'ui psd lfx2 long section length'
}

if ($uiBundle.Contains($nativeShadowStackFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $nativeShadowStackFind `
    -Replace $nativeShadowStackReplace `
    -ExpectedCount 1 `
    -Label 'ui native shadow stack flattening'
} elseif ($uiBundle.Contains('function pigmaNativeShadowStack(')) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI native shadow stack flattening.'
}

if ($uiBundle.Contains($importEffectUnitFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $importEffectUnitFind `
    -Replace $importEffectUnitReplace `
    -ExpectedCount 1 `
    -Label 'ui psd import effect unit normalization'
} elseif ($uiBundle.Contains('function rt(e){if(Number.isFinite(e))return Number(e);')) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD import effect unit normalization.'
}

if ($uiBundle.Contains($importOpacityUnitFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $importOpacityUnitFind `
    -Replace $importOpacityUnitReplace `
    -ExpectedCount 1 `
    -Label 'ui psd import opacity unit normalization'
} elseif ($uiBundle.Contains('function dr(e){let t=null;if(Number.isFinite(e))')) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD import opacity unit normalization.'
}

if ($uiBundle.Contains($editableTextRootFallbackFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextRootFallbackFind `
    -Replace $editableTextRootFallbackReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text root fallback logging'
}

if ($uiBundle.Contains($uiEditableTextFontNameFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextFontNameFind `
    -Replace $uiEditableTextFontNameReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text Photoshop font names'
} elseif ($uiBundle.Contains($uiEditableTextFontNameLgOnlyFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextFontNameLgOnlyFind `
    -Replace $uiEditableTextFontNameReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text Photoshop font names from LG-only resolver'
} elseif ($uiBundle.Contains('function pigmaKnownPhotoshopFontName(') -and -not $uiBundle.Contains('var pigmaPhotoshopFontMap=')) {
  $uiBundle = Replace-Section `
    -Text $uiBundle `
    -StartMarker 'function pigmaNormalizePhotoshopFontToken' `
    -EndMarker 'function pigmaEditableTextLineGapBaselineShift' `
    -Replacement $uiEditableTextFontNameReplace `
    -Label 'ui editable text Photoshop font names from legacy resolver'
} elseif ($uiBundle.Contains('var pigmaPhotoshopFontMap=') -and -not $uiBundle.Contains('function editableTextFontDescriptor(')) {
  $uiBundle = Replace-Section `
    -Text $uiBundle `
    -StartMarker 'var pigmaPhotoshopFontMap=' `
    -EndMarker 'function pigmaEditableTextLineGapBaselineShift' `
    -Replacement $uiEditableTextFontNameReplace `
    -Label 'ui editable text Photoshop font descriptor recovery'
} elseif ($uiBundle.Contains('var pigmaPhotoshopFontMap=') -and -not $uiBundle.Contains('function pigmaApplyEditableTextFontFaceStyle(')) {
  $uiBundle = Replace-Section `
    -Text $uiBundle `
    -StartMarker 'var pigmaPhotoshopFontMap=' `
    -EndMarker 'function pigmaEditableTextLineGapBaselineShift' `
    -Replacement $uiEditableTextFontNameReplace `
    -Label 'ui editable text Photoshop font face style recovery'
} elseif ($uiBundle.Contains('var pigmaPhotoshopFontMap=') -and ($uiBundle.Contains('function pigmaEditableTextIsNotoKrVariableFont(') -or -not $uiBundle.Contains('function pigmaEditableTextFontScript('))) {
  $uiBundle = Replace-Section `
    -Text $uiBundle `
    -StartMarker 'var pigmaPhotoshopFontMap=' `
    -EndMarker 'function pigmaEditableTextLineGapBaselineShift' `
    -Replacement $uiEditableTextFontNameReplace `
    -Label 'ui editable text Noto CJK Photoshop font descriptor metadata'
} elseif ($uiBundle.Contains('var pigmaPhotoshopFontMap=')) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI editable text Photoshop font name resolver.'
}
$uiFontMapStart = $uiBundle.IndexOf('var pigmaPhotoshopFontMap=')
$uiFontMapEnd = if ($uiFontMapStart -ge 0) { $uiBundle.IndexOf(';function pigmaNormalizePhotoshopFontToken', $uiFontMapStart) } else { -1 }
if ($uiFontMapStart -ge 0 -and $uiFontMapEnd -gt $uiFontMapStart) {
  $uiBundle = $uiBundle.Substring(0, $uiFontMapStart) + 'var pigmaPhotoshopFontMap=' + $fontPostScriptMapJson + $uiBundle.Substring($uiFontMapEnd)
}

if ($uiBundle.Contains($uiEditableTextBaselineShiftFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftFind `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text baseline shift'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLegacyReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLegacyReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text remove line-gap baseline shift'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text font face style application'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftNoEditorReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftNoEditorReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text editor baseline compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftEditorPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftEditorPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI size compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiUpwardReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiUpwardReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI downward compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiDownwardPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiDownwardPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI per-size compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiPerSizePreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiPerSizePreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI line-height compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiLineHeightPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiLineHeightPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI auto-size compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiAutoPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiAutoPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI exact line-height compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiExactPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiExactPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI large auto compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiLargeAutoPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiLargeAutoPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text family compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 8-64 compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextSecondPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextSecondPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 64-first compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextThirdPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextThirdPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 48-64 final compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextTablePreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextTablePreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text formula compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextFormulaPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextFormulaPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text high-ratio formula compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextRatioPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextRatioPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text ratio-softened formula compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextAutoCleanPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextAutoCleanPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text auto-ratio cleanup'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextHighRatioPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextHighRatioPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text high-ratio 150pct compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextHighRatioStartPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextHighRatioStartPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 48px 150pct start compensation'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextUnifiedNoCapPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextUnifiedNoCapPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text line-height pressure cap'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextEditorGatePreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextEditorGatePreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text editor baseline gate override'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextExactLowPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextExactLowPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text exact 100pct low-baseline tuning'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextLowBaselinePreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextLowBaselinePreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text low-baseline line-height tuning'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiTextHighlightPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiTextHighlightPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 0605-18 highlight tuning'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiHeadlineFormulaPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiHeadlineFormulaPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Headline ratio formula tuning'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftLgEiHeadlineSecondPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextBaselineShiftLgEiHeadlineSecondPreviousReplace `
    -Replace $uiEditableTextBaselineShiftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Headline 0605-2 screenshot tuning'
} elseif ($uiBundle.Contains($uiEditableTextBaselineShiftReplace)) {
  # Already patched in this UI bundle variant.
} elseif ($uiBundle.Contains('function pigmaEditableTextLineGapBaselineShift(')) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI editable text baseline shift.'
}
$uiBundle = $uiBundle.Replace(
  'if(pigmaEditableTextIsLgEiTextFamily(e)&&Math.abs(o)>=.01)return we(i+o)',
  'if(pigmaEditableTextIsLgEiFamily(e)&&Math.abs(o)>=.01)return we(i+o)'
)
$uiBundle = $uiBundle.Replace(
  'function pigmaEditableTextIsLgEiHeadlineFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"}',
  'function pigmaEditableTextIsLgEiHeadlineFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeiheadline"||t==="lgeiheadlinettf"||t==="caveat"||t==="crimsontext"||t==="figmahand"||t==="pacifico"||t==="playfairdisplay"||t==="sourceserifpro"}'
)
$uiBundle = $uiBundle.Replace(
  'function pigmaEditableTextIsLgEiTextFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeitext"||t==="lgeitextttf"}',
  'function pigmaEditableTextIsLgEiTextFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeitext"||t==="lgeitextttf"||t==="inter"||t==="interdisplay"||t==="anonymouspro"||t==="ibmplexmono"||t==="roboto"||t==="robotomono"||t==="segoeui"}'
)
$uiBundle = $uiBundle.Replace(
  'function pigmaEditableTextIsLgEiTextFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeitext"||t==="lgeitextttf"||t==="inter"||t==="interdisplay"}',
  'function pigmaEditableTextIsLgEiTextFamily(e){let t=pigmaNormalizePhotoshopFontToken(e&&e.fontFamily);return t==="lgeitext"||t==="lgeitextttf"||t==="inter"||t==="interdisplay"||t==="anonymouspro"||t==="ibmplexmono"||t==="roboto"||t==="robotomono"||t==="segoeui"}'
)
$uiBundle = $uiBundle.Replace(
  'function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0,o=pigmaEditableTextLgEiBaselineShift(e);if(pigmaEditableTextIsLgEiFamily(e)&&Math.abs(o)>=.01)return we(i+o);return we(i+a+(Math.abs(a)>=.01?0:o))}',
  'function pigmaEditableTextResolvedBaselineShift(e,t=0){let n=Number(e&&e.baselineShift),r=Number(t),i=Number.isFinite(n)?n:0,a=Number.isFinite(r)?r:0,o=pigmaEditableTextLgEiBaselineShift(e);if(pigmaEditableTextIsLgEiHeadlineFamily(e)){let s=Number(e&&e.fontSize),u=pigmaEditableTextLgEiLineHeightPx(e);if(Number.isFinite(s)&&s>0&&u!==null&&u/s<=1.05&&Math.abs(a)>=.01)return we(i+a)}if(pigmaEditableTextIsLgEiFamily(e)&&Math.abs(o)>=.01)return we(i+o);return we(i+a+(Math.abs(a)>=.01?0:o))}'
)

$uiEditableTextLgEiTextLargeSizeDriftFind = 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}'
$uiEditableTextLgEiTextLargeSizeDriftReplace = 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}function pigmaEditableTextLgEiTextLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(i<=.001)return 0;let a=Math.max(0,t-64),o=7+.16*a,s=Math.min(.2,Math.max(0,r-1.05)),u=s*(16+1.4*a),l=Math.max(0,r-1.25),c=pigmaEditableTextLgEiTextSmooth((t-96)/32)*l*(22+.45*a);return i*(o+u+c)}function pigmaEditableTextLgEiTextAutoLargeSizeDrift(t){let n=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(n<=.001)return 0;let r=Math.max(0,t-64);return n*(3.2+.48*r)}'
if ($uiBundle.Contains($uiEditableTextLgEiTextLargeSizeDriftFind) -and -not $uiBundle.Contains('function pigmaEditableTextLgEiTextLargeSizeDrift(')) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiTextLargeSizeDriftFind `
    -Replace $uiEditableTextLgEiTextLargeSizeDriftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 65-128 drift helpers'
}

$uiEditableTextLgEiTextLargeSizeDriftPreviousReplace = 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}function pigmaEditableTextLgEiTextLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(i<=.001)return 0;let a=Math.max(0,t-64),o=7+.16*a,s=Math.min(.2,Math.max(0,r-1.05)),u=s*(16+1.4*a);return i*(o+u)}function pigmaEditableTextLgEiTextAutoLargeSizeDrift(t){let n=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(n<=.001)return 0;let r=Math.max(0,t-64);return n*(3.2+.48*r)}'
if ($uiBundle.Contains($uiEditableTextLgEiTextLargeSizeDriftPreviousReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiTextLargeSizeDriftPreviousReplace `
    -Replace $uiEditableTextLgEiTextLargeSizeDriftReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 119-128 high-ratio drift'
}

$uiEditableTextLgEiTextLargeSizeDriftCurrentFind = 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}function pigmaEditableTextLgEiTextLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(i<=.001)return 0;let a=Math.max(0,t-64),o=7+.16*a,s=Math.min(.2,Math.max(0,r-1.05)),u=s*(16+1.4*a),l=Math.max(0,r-1.25),c=pigmaEditableTextLgEiTextSmooth((t-96)/32)*l*(22+.45*a);return i*(o+u+c)}function pigmaEditableTextLgEiTextAutoLargeSizeDrift(t){let n=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(n<=.001)return 0;let r=Math.max(0,t-64);return n*(3.2+.48*r)}'
$uiEditableTextLgEiTextLargeSizeDriftTunedReplace = 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}function pigmaEditableTextLgEiTextLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(i<=.001)return 0;let a=Math.max(0,t-64),o=7+.16*a,s=Math.min(.2,Math.max(0,r-1.05)),u=s*(16+1.4*a),l=Math.max(0,r-1.25),c=pigmaEditableTextLgEiTextSmooth((t-88)/32)*l*(34+.65*a),f=pigmaEditableTextLgEiTextSmooth((t-72)/56)*Math.max(0,1.5-r)*(36+.36*a);return i*(o+u+c+f)}function pigmaEditableTextLgEiTextAutoLargeSizeDrift(t){let n=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(n<=.001)return 0;let r=Math.max(0,t-64),i=pigmaEditableTextLgEiTextSmooth((t-88)/40)*(8+.18*r);return n*(3.2+.48*r+i)}'
if ($uiBundle.Contains($uiEditableTextLgEiTextLargeSizeDriftCurrentFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiTextLargeSizeDriftCurrentFind `
    -Replace $uiEditableTextLgEiTextLargeSizeDriftTunedReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 65-128 tuned drift'
}
$uiEditableTextLgEiTextLargeSizeDriftTunedPreviousFind = 'function pigmaEditableTextLgEiTextLargeLowRatioDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=Math.min(1,Math.max(0,(1.45-r)/.45)),a=Math.min(3,Math.max(0,t-52)*.24);return a*i}function pigmaEditableTextLgEiTextLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(i<=.001)return 0;let a=Math.max(0,t-64),o=7+.16*a,s=Math.min(.2,Math.max(0,r-1.05)),u=s*(16+1.4*a),l=Math.max(0,r-1.25),c=pigmaEditableTextLgEiTextSmooth((t-88)/32)*l*(34+.65*a),f=pigmaEditableTextLgEiTextSmooth((t-72)/56)*Math.max(0,1.5-r)*(30+.3*a);return i*(o+u+c+f)}function pigmaEditableTextLgEiTextAutoLargeSizeDrift(t){let n=pigmaEditableTextLgEiTextSmooth((t-64)/2);if(n<=.001)return 0;let r=Math.max(0,t-64),i=pigmaEditableTextLgEiTextSmooth((t-88)/40)*(8+.18*r);return n*(3.2+.48*r+i)}'
if ($uiBundle.Contains($uiEditableTextLgEiTextLargeSizeDriftTunedPreviousFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiTextLargeSizeDriftTunedPreviousFind `
    -Replace $uiEditableTextLgEiTextLargeSizeDriftTunedReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 65-128 tuned drift refresh'
}

$uiEditableTextLgEiText65FormulaFind = 'function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextLargeLowRatioDrift(t,r);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r)+i);let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r)+i;return pigmaEditableTextLgEiTextClampBaseline(t,a)}'
$uiEditableTextLgEiText65FormulaReplace = 'function pigmaEditableTextLgEiTextBaselineFormula(t,n){let r=pigmaEditableTextLgEiTextRatio(n),i=pigmaEditableTextLgEiTextLargeLowRatioDrift(t,r)+pigmaEditableTextLgEiTextLargeSizeDrift(t,r);if(r<=1.05)return pigmaEditableTextLgEiTextClampBaseline(t,pigmaEditableTextLgEiTextLowBaseline(t,r)+i);let a=pigmaEditableTextLgEiTextLowBaseline(t,r)+pigmaEditableTextLgEiTextLineHeightPressure(t,r)+i;return pigmaEditableTextLgEiTextClampBaseline(t,a)}'
if ($uiBundle.Contains($uiEditableTextLgEiText65FormulaFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiText65FormulaFind `
    -Replace $uiEditableTextLgEiText65FormulaReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 65-128 exact baseline drift'
}

$uiEditableTextLgEiText65AutoFind = 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18)+pigmaEditableTextLgEiTextLargeLowRatioDrift(t,1.25);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}'
$uiEditableTextLgEiText65AutoReplace = 'function pigmaEditableTextLgEiTextAutoBaselineShift(t){let n=pigmaEditableTextLgEiTextLowBaseline(t,1.25)+Math.min(3,Math.max(0,t-48)*.18)+pigmaEditableTextLgEiTextLargeLowRatioDrift(t,1.25)+pigmaEditableTextLgEiTextAutoLargeSizeDrift(t);return -pigmaEditableTextLgEiTextClampBaseline(t,n)}'
if ($uiBundle.Contains($uiEditableTextLgEiText65AutoFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiText65AutoFind `
    -Replace $uiEditableTextLgEiText65AutoReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Text 65-128 auto baseline drift'
}

$uiEditableTextLgEiHeadlineFormulaStart = 'function pigmaEditableTextLgEiHeadlineRatio('
$uiEditableTextLgEiHeadlineFormulaEnd = 'function pigmaEditableTextLgEiTextRatio('
$uiEditableTextLgEiHeadlineFormulaReplace = 'function pigmaEditableTextLgEiHeadlineRatio(t){return Math.min(2,Math.max(1,Number.isFinite(t)?t:1))}function pigmaEditableTextLgEiHeadlineSmooth(t){return t=t<0?0:t>1?1:t,t*t*(3-2*t)}function pigmaEditableTextLgEiHeadlineClampBaseline(t,n){return we(Math.min(t*1.1,Math.max(-t*.8,n)))}function pigmaEditableTextLgEiHeadlineAutoRatio(t){return 1.125+.055*pigmaEditableTextLgEiHeadlineSmooth((t-8)/56)}function pigmaEditableTextLgEiHeadlineBaseBaseline(t){let n=8.4+1.8*pigmaEditableTextLgEiHeadlineSmooth((t-18)/2)+3.8*pigmaEditableTextLgEiHeadlineSmooth((t-24)/4),r=5.2+2*pigmaEditableTextLgEiHeadlineSmooth((t-48)/8),i=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8),a=5.5*(1-pigmaEditableTextLgEiHeadlineSmooth((t-30)/8)),o=3.5*pigmaEditableTextLgEiHeadlineSmooth((t-34)/8)*(1-pigmaEditableTextLgEiHeadlineSmooth((t-48)/8));return n*(1-i)+r*i+a-o}function pigmaEditableTextLgEiHeadlineLineHeightPressure(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let a=Math.max(0,r-1.25),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8),s=1-o,u=Math.max(0,t-48),l=18*s+26*o+.12*u,c=14*s+18*o+.1*Math.max(0,t-64);return -(i*l+a*c)}function pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,t-64),a=pigmaEditableTextLgEiHeadlineSmooth(i/16);if(a<=.001)return 0;let o=Math.max(0,r-1),s=Math.max(0,r-1.25);return -a*(o*(4+.08*i)+s*(6+.1*i))}function pigmaEditableTextLgEiHeadlineBaselineFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=pigmaEditableTextLgEiHeadlineBaseBaseline(t)+pigmaEditableTextLgEiHeadlineLineHeightPressure(t,r)+pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,r);return pigmaEditableTextLgEiHeadlineClampBaseline(t,i)}function pigmaEditableTextLgEiAutoBaselineShift(t){return -pigmaEditableTextLgEiHeadlineBaselineFormula(t,pigmaEditableTextLgEiHeadlineAutoRatio(t))}function pigmaEditableTextLgEiExactBaselineShift(t,n){return -pigmaEditableTextLgEiHeadlineBaselineFormula(t,n/t)}function pigmaEditableTextLgEiHeadlineLeadingFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let a=Math.max(0,t-18),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/16),s=Math.max(0,t-48),u=i*(.42*Math.min(18,a)*(1-.45*o)+.16*s)+Math.max(0,r-1.25)*(.18*Math.min(32,a)+.08*s);return Math.max(0,we(u))}function pigmaEditableTextLgEiAutoLeadingDelta(t){return -pigmaEditableTextLgEiHeadlineLeadingFormula(t,pigmaEditableTextLgEiHeadlineAutoRatio(t))}function pigmaEditableTextLgEiExactLeadingDelta(t,n){return -pigmaEditableTextLgEiHeadlineLeadingFormula(t,n/t)}'
$uiEditableTextLgEiHeadlineFormulaReplace = $uiEditableTextLgEiHeadlineFormulaReplace.Replace('function pigmaEditableTextLgEiHeadlineLineHeightPressure(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let a=Math.max(0,r-1.25),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/8),s=1-o,u=Math.max(0,t-48),l=18*s+26*o+.12*u,c=14*s+18*o+.1*Math.max(0,t-64);return -(i*l+a*c)}', 'function pigmaEditableTextLgEiHeadlineLineHeightPressure(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let rise=pigmaEditableTextLgEiHeadlineSmooth(i/.1),fall=1-.42*pigmaEditableTextLgEiHeadlineSmooth((r-1.33)/.17),size=2.4+.075*t+.018*Math.max(0,t-96);return size*rise*fall}')
$uiEditableTextLgEiHeadlineFormulaReplace = $uiEditableTextLgEiHeadlineFormulaReplace.Replace('let rise=pigmaEditableTextLgEiHeadlineSmooth(i/.1),fall=1-.42*pigmaEditableTextLgEiHeadlineSmooth((r-1.33)/.17),size=2.4+.075*t+.018*Math.max(0,t-96);return size*rise*fall', 'let rise=pigmaEditableTextLgEiHeadlineSmooth(i/.1),fall=1-.42*pigmaEditableTextLgEiHeadlineSmooth((r-1.33)/.17),large=pigmaEditableTextLgEiHeadlineSmooth((t-64)/27),size=2.4+.075*t+.018*Math.max(0,t-96),baseLift=large*rise*(.105*t-1.1),ratioLift=large*Math.max(0,r-1.11)/.39*(.095*t+.04*Math.max(0,t-96));return size*rise*fall+baseLift+ratioLift')
$uiEditableTextLgEiHeadlineFormulaReplace = $uiEditableTextLgEiHeadlineFormulaReplace.Replace('function pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,t-64),a=pigmaEditableTextLgEiHeadlineSmooth(i/16);if(a<=.001)return 0;let o=Math.max(0,r-1),s=Math.max(0,r-1.25);return -a*(o*(4+.08*i)+s*(6+.1*i))}', 'function pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,n){return 0}')
$uiEditableTextLgEiHeadlineFormulaReplace = $uiEditableTextLgEiHeadlineFormulaReplace.Replace('function pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,n){return 0}function pigmaEditableTextLgEiHeadlineBaselineFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=pigmaEditableTextLgEiHeadlineBaseBaseline(t)+pigmaEditableTextLgEiHeadlineLineHeightPressure(t,r)+pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,r);return pigmaEditableTextLgEiHeadlineClampBaseline(t,i)}', 'function pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,n){return 0}function pigmaEditableTextLgEiHeadlineInterp(t,n,r){for(let i=1;i<n.length;i+=1)if(t<=n[i]){let a=(t-n[i-1])/(n[i]-n[i-1]);return a=pigmaEditableTextLgEiHeadlineSmooth(a),r[i-1]*(1-a)+r[i]*a}return r[r.length-1]}function pigmaEditableTextLgEiHeadlineRatioInterp(t,n){let r=[1,1.11,1.2,1.25,1.33,1.5];if(t<=r[0])return n[0];for(let i=1;i<r.length;i+=1)if(t<=r[i]){let a=(t-r[i-1])/(r[i]-r[i-1]);return n[i-1]*(1-a)+n[i]*a}return n[n.length-1]}function pigmaEditableTextLgEiHeadlineMidSizeCorrection(t,n){if(t<32||t>64)return 0;let r=pigmaEditableTextLgEiHeadlineRatio(n),i=[32,33,34,35,36,37,38,39,40,41,42,43,44,45,55,56,57,64],a=pigmaEditableTextLgEiHeadlineInterp(t,i,[-7,-5.5,-5,-4,-1.5,0,2.5,5.5,6.5,7,7.5,8,8,8.5,0,-.5,0,0]),o=pigmaEditableTextLgEiHeadlineInterp(t,i,[-6,-6,-6.5,-4.5,-3.5,-1.5,1,2,2.5,3,3,4,4,3.5,4,4,4,0]),s=pigmaEditableTextLgEiHeadlineInterp(t,i,[-6,-6,-4.5,-3.5,-2.5,1,1,2,3,3.5,3.5,5,5,4.5,4.5,4.5,4.5,0]),u=pigmaEditableTextLgEiHeadlineInterp(t,i,[-5.5,-5.5,-4.5,-1.5,-1,0,1,2.5,3.5,4,4.5,5.5,5.5,5,5.5,5,5,0]),l=pigmaEditableTextLgEiHeadlineInterp(t,i,[-5,-5,-4,-.5,-.5,2,1.5,3,4,5,5,6,6.5,6,6.5,6,6.5,0]),c=pigmaEditableTextLgEiHeadlineInterp(t,i,[-3.5,-2.5,-.5,0,1.5,3.5,4.5,7.5,8.5,9.5,9.5,10,10,11,9,8.5,9,0]);return pigmaEditableTextLgEiHeadlineRatioInterp(r,[a,o,s,u,l,c])}function pigmaEditableTextLgEiHeadlineBaselineFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=pigmaEditableTextLgEiHeadlineBaseBaseline(t)+pigmaEditableTextLgEiHeadlineLineHeightPressure(t,r)+pigmaEditableTextLgEiHeadlineLargeSizeDrift(t,r)+pigmaEditableTextLgEiHeadlineMidSizeCorrection(t,r);return pigmaEditableTextLgEiHeadlineClampBaseline(t,i)}')
$uiEditableTextLgEiHeadlineFormulaStartIndex = $uiBundle.IndexOf($uiEditableTextLgEiHeadlineFormulaStart)
$uiEditableTextLgEiHeadlineFormulaEndIndex = if ($uiEditableTextLgEiHeadlineFormulaStartIndex -ge 0) { $uiBundle.IndexOf($uiEditableTextLgEiHeadlineFormulaEnd, $uiEditableTextLgEiHeadlineFormulaStartIndex) } else { -1 }
if ($uiEditableTextLgEiHeadlineFormulaStartIndex -ge 0 -and $uiEditableTextLgEiHeadlineFormulaEndIndex -gt $uiEditableTextLgEiHeadlineFormulaStartIndex) {
  $uiBundle = $uiBundle.Substring(0, $uiEditableTextLgEiHeadlineFormulaStartIndex) + $uiEditableTextLgEiHeadlineFormulaReplace + $uiBundle.Substring($uiEditableTextLgEiHeadlineFormulaEndIndex)
} elseif ($uiBundle.Contains($uiEditableTextLgEiHeadlineFormulaStart)) {
  throw 'Could not patch UI editable text LG EI Headline ratio formula boundaries.'
}
$uiBundle = $uiBundle.Replace(
  'function pigmaEditableTextLgEiExactBaselineShift(t,n){return -pigmaEditableTextLgEiHeadlineBaselineFormula(t,n/t)}',
  'function pigmaEditableTextLgEiHeadlineExactCorrection(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=pigmaEditableTextLgEiHeadlineSmooth((t-64)/27);return i*pigmaEditableTextLgEiHeadlineRatioInterp(r,[0,-5.2,0,4.4,5.4,11.2])}function pigmaEditableTextLgEiExactBaselineShift(t,n){return -pigmaEditableTextLgEiHeadlineBaselineFormula(t,n/t)-pigmaEditableTextLgEiHeadlineExactCorrection(t,n/t)}'
)
$uiEditableTextLgEiHeadlineMidSizeCurrent = 'function pigmaEditableTextLgEiHeadlineMidSizeCorrection(t,n){if(t<32||t>64)return 0;let r=pigmaEditableTextLgEiHeadlineRatio(n),i=[32,33,34,35,36,37,38,39,40,41,42,43,44,45,55,56,57,64],a=pigmaEditableTextLgEiHeadlineInterp(t,i,[-7,-5.5,-5,-4,-1.5,0,2.5,5.5,6.5,7,7.5,8,8,8.5,0,-.5,0,0]),o=pigmaEditableTextLgEiHeadlineInterp(t,i,[-6,-6,-6.5,-4.5,-3.5,-1.5,1,2,2.5,3,3,4,4,3.5,4,4,4,0]),s=pigmaEditableTextLgEiHeadlineInterp(t,i,[-6,-6,-4.5,-3.5,-2.5,1,1,2,3,3.5,3.5,5,5,4.5,4.5,4.5,4.5,0]),u=pigmaEditableTextLgEiHeadlineInterp(t,i,[-5.5,-5.5,-4.5,-1.5,-1,0,1,2.5,3.5,4,4.5,5.5,5.5,5,5.5,5,5,0]),l=pigmaEditableTextLgEiHeadlineInterp(t,i,[-5,-5,-4,-.5,-.5,2,1.5,3,4,5,5,6,6.5,6,6.5,6,6.5,0]),c=pigmaEditableTextLgEiHeadlineInterp(t,i,[-3.5,-2.5,-.5,0,1.5,3.5,4.5,7.5,8.5,9.5,9.5,10,10,11,9,8.5,9,0]);return pigmaEditableTextLgEiHeadlineRatioInterp(r,[a,o,s,u,l,c])}'
$uiEditableTextLgEiHeadlineMidSizeSmoothed = 'function pigmaEditableTextLgEiHeadlineMidSizeCorrection(t,n){if(t<30||t>64)return 0;let r=pigmaEditableTextLgEiHeadlineRatio(n),i=[32,33,34,35,36,37,38,39,40,41,42,43,44,45,55,56,57,64],a=pigmaEditableTextLgEiHeadlineInterp(t,i,[-7,-5.5,-5,-4,-1.5,0,2.5,5.5,6.5,7,7.5,8,8,8.5,0,-.5,0,0]),o=pigmaEditableTextLgEiHeadlineInterp(t,i,[-6,-6,-6.5,-4.5,-3.5,-1.5,1,2,2.5,3,3,4,4,3.5,4,4,4,0]),s=pigmaEditableTextLgEiHeadlineInterp(t,i,[-6,-6,-4.5,-3.5,-2.5,1,1,2,3,3.5,3.5,5,5,4.5,4.5,4.5,4.5,0]),u=pigmaEditableTextLgEiHeadlineInterp(t,i,[-5.5,-5.5,-4.5,-1.5,-1,0,1,2.5,3.5,4,4.5,5.5,5.5,5,5.5,5,5,0]),l=pigmaEditableTextLgEiHeadlineInterp(t,i,[-5,-5,-4,-.5,-.5,2,1.5,3,4,5,5,6,6.5,6,6.5,6,6.5,0]),c=pigmaEditableTextLgEiHeadlineInterp(t,i,[-3.5,-2.5,-.5,0,1.5,3.5,4.5,7.5,8.5,9.5,9.5,10,10,11,9,8.5,9,0]),f=pigmaEditableTextLgEiHeadlineSmooth((t-30)/2);return f*pigmaEditableTextLgEiHeadlineRatioInterp(r,[a,o,s,u,l,c])}'
if ($uiBundle.Contains($uiEditableTextLgEiHeadlineMidSizeCurrent)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiHeadlineMidSizeCurrent `
    -Replace $uiEditableTextLgEiHeadlineMidSizeSmoothed `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Headline mid-size smooth ramp'
} elseif (-not $uiBundle.Contains($uiEditableTextLgEiHeadlineMidSizeSmoothed)) {
  throw 'Could not patch UI editable text LG EI Headline mid-size smooth ramp.'
}
$uiEditableTextLgEiHeadlineLeadingCurrent = 'function pigmaEditableTextLgEiHeadlineLeadingFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1);if(i<=.001)return 0;let a=Math.max(0,t-18),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/16),s=Math.max(0,t-48),u=i*(.42*Math.min(18,a)*(1-.45*o)+.16*s)+Math.max(0,r-1.25)*(.18*Math.min(32,a)+.08*s);return Math.max(0,we(u))}function pigmaEditableTextLgEiAutoLeadingDelta(t){return -pigmaEditableTextLgEiHeadlineLeadingFormula(t,pigmaEditableTextLgEiHeadlineAutoRatio(t))}function pigmaEditableTextLgEiExactLeadingDelta(t,n){return -pigmaEditableTextLgEiHeadlineLeadingFormula(t,n/t)}'
$uiEditableTextLgEiHeadlineLeadingLegacy = 'function pigmaEditableTextLgEiHeadlineLeadingFormula(t,n){let r=pigmaEditableTextLgEiHeadlineRatio(n),i=Math.max(0,r-1.21);if(i<=.001)return 0;let a=Math.min(14,Math.max(0,t-18)),o=pigmaEditableTextLgEiHeadlineSmooth((t-32)/16),s=Math.max(0,t-48),u=i*(.75*a*(1-.55*o)+.08*s);return Math.max(0,we(u))}function pigmaEditableTextLgEiAutoLeadingDelta(t){let n=.07*Math.max(0,t-18)+.02*Math.max(0,t-32)-.03*Math.max(0,t-64)+.025*Math.max(0,t-80);return -we(Math.max(0,n))}function pigmaEditableTextLgEiExactLeadingDelta(t,n){return -pigmaEditableTextLgEiHeadlineLeadingFormula(t,n/t)}'
$uiBundle = $uiBundle.Replace(
  $uiEditableTextLgEiHeadlineLeadingCurrent + 'function pigmaEditableTextLgEiTextRatio(',
  'function pigmaEditableTextLgEiTextRatio('
)
if ($uiBundle.Contains($uiEditableTextLgEiHeadlineLeadingLegacy)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiEditableTextLgEiHeadlineLeadingLegacy `
    -Replace $uiEditableTextLgEiHeadlineLeadingCurrent `
    -ExpectedCount 1 `
    -Label 'ui editable text LG EI Headline leading formula'
} elseif (-not $uiBundle.Contains($uiEditableTextLgEiHeadlineLeadingCurrent)) {
  throw 'Could not patch UI editable text LG EI Headline leading formula.'
}

if ($uiBundle.Contains($uiBackgroundClipHelperFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiBackgroundClipHelperFind `
    -Replace $uiBackgroundClipHelperReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD background clipping helper'
} elseif ($uiBundle.Contains($uiBackgroundClipHelperLegacyReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiBackgroundClipHelperLegacyReplace `
    -Replace $uiBackgroundClipHelperReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD background clipping smart object helper'
} elseif ($uiBundle.Contains('function pigmaBuildClipBaseSmartObject(')) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD background clipping helper.'
}

if ($uiBundle.Contains($uiMaskedSmartObjectLayerHelperLegacy)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiMaskedSmartObjectLayerHelperLegacy `
    -Replace $uiMaskedSmartObjectLayerHelper `
    -ExpectedCount 1 `
    -Label 'ui PSD masked smart object layered helper'
} elseif ($uiBundle.Contains($uiMaskedSmartObjectLayerHelperPreviousLayered)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiMaskedSmartObjectLayerHelperPreviousLayered `
    -Replace $uiMaskedSmartObjectLayerHelper `
    -ExpectedCount 1 `
    -Label 'ui PSD masked smart object padded preview helper'
} elseif ($uiBundle.Contains('async function pigmaBuildLayeredSmartObjectFile(')) {
  # Already patched in this UI bundle variant.
} elseif (-not $uiBundle.Contains('async function pigmaBuildRasterSmartObjectLayer(')) {
  if ($uiBundle.Contains($uiMaskedSmartObjectLayerHelperMarker)) {
    $uiBundle = Replace-Exact `
      -Text $uiBundle `
      -Find $uiMaskedSmartObjectLayerHelperMarker `
      -Replace ($uiMaskedSmartObjectLayerHelper + "`n" + $uiMaskedSmartObjectLayerHelperMarker) `
      -ExpectedCount 1 `
      -Label 'ui PSD masked smart object layer helper'
  } else {
    throw 'Could not patch UI PSD masked smart object layer helper.'
  }
}

if ($uiBundle.Contains($uiMaskedSmartObjectBitmapFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiMaskedSmartObjectBitmapFind `
    -Replace $uiMaskedSmartObjectBitmapReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD masked bitmap smart object path'
} elseif ($uiBundle.Contains($uiMaskedSmartObjectBitmapLegacyReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiMaskedSmartObjectBitmapLegacyReplace `
    -Replace $uiMaskedSmartObjectBitmapReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD masked bitmap layered smart object path'
} elseif ($uiBundle.Contains($uiMaskedSmartObjectBitmapReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD masked bitmap smart object path.'
}

$uiBackgroundClipSmartObjectBaseFind = 'async function pigmaApplyContainerClipToBackground(e,t=0,n=0){let r={applied:!1,linkedFiles:[],warnings:[]};if(!Array.isArray(e)||e.length<2)return r;let i=pigmaFindContainerClipBaseIndex(e);if(i<0)return r;let a=e[i];if(pigmaIsLayerGroup(a)){let o=await pigmaBuildClipBaseSmartObject(a,t,n);if(!o){r.warnings.push("\"".concat(Su(a&&a.name?a.name:"clip base"),"\" stayed as a group, so Pigma skipped automatic clipping masks for this container to avoid hiding clipped layers in Photoshop."));return r}e[i]=o.layer,r.linkedFiles.push(...o.linkedFiles),r.warnings.push(...o.warnings)}for(let o=i+1;o<e.length;o+=1){let s=e[o];if(s&&typeof s=="object"){s.clipping=!0,r.applied=!0}}return r}'
$uiBackgroundClipSmartObjectBaseReplace = 'async function pigmaApplyContainerClipToBackground(e,t=0,n=0){let r={applied:!1,linkedFiles:[],warnings:[]};if(!Array.isArray(e)||e.length<2)return r;let i=pigmaFindContainerClipBaseIndex(e);if(i<0)return r;let a=e[i];if(pigmaIsLayerGroup(a)){let l=await pigmaBuildClipBaseSmartObject(a,t,n);if(!l){r.warnings.push("\"".concat(Su(a&&a.name?a.name:"clip base"),"\" stayed as a group, so Pigma skipped automatic clipping masks for this container to avoid hiding clipped layers in Photoshop."));return r}e[i]=l.layer,r.linkedFiles.push(...l.linkedFiles),r.warnings.push(...l.warnings)}let o=e.findIndex(pigmaIsBackgroundClipBaseLayer),s=o>=0&&o<i?o:i;for(let l=s+1;l<e.length;l+=1){let u=e[l];if(u&&typeof u=="object"){u.clipping=!0,r.applied=!0}}return r}'
if ($uiBundle.Contains($uiBackgroundClipSmartObjectBaseFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiBackgroundClipSmartObjectBaseFind `
    -Replace $uiBackgroundClipSmartObjectBaseReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD background clips base image simulation'
} elseif ($uiBundle.Contains($uiBackgroundClipSmartObjectBaseReplace)) {
  # Already patched in this UI bundle variant.
} elseif ($uiBundle.Contains('async function pigmaApplyContainerClipToBackground(e,t=0,n=0)') -and $uiBundle.Contains('pigmaBuildClipBaseSmartObject(')) {
  # Existing 2.5 snapshot variant already routes group clip bases through smart objects.
} else {
  throw 'Could not patch UI PSD background clip base image simulation.'
}

if ($uiBundle.Contains($uiBackgroundClipGroupFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiBackgroundClipGroupFind `
    -Replace $uiBackgroundClipGroupReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD frame children clip to background'
} elseif ($uiBundle.Contains($uiBackgroundClipGroupLegacyReplace)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $uiBackgroundClipGroupLegacyReplace `
    -Replace $uiBackgroundClipGroupReplace `
    -ExpectedCount 1 `
    -Label 'ui PSD frame children clip to smart object base'
} elseif ($uiBundle.Contains($uiBackgroundClipGroupReplace)) {
  # Already patched in this UI bundle variant.
} else {
  throw 'Could not patch UI PSD frame children clip to background.'
}

$bundle = $bundle.Replace($editableTextEditorBaselineShiftAutoPrevious, $editableTextEditorBaselineShiftAutoTuned)
$uiBundle = $uiBundle.Replace($editableTextEditorBaselineShiftAutoPrevious, $editableTextEditorBaselineShiftAutoTuned)
$uiBundle = $uiBundle.Replace($uiEditableTextNotoVariableStyleFind, $uiEditableTextNotoVariableStyleReplace)

if ($uiBundle -ne $originalUiBundle) {
  [System.IO.File]::WriteAllText($uiSource, $uiBundle, $utf8NoBom)
}

# Keep exported PSD folders collapsed by default instead of opening every group.
$expandedFolderToken = 'opened:!0,children:M.children'
$collapsedFolderToken = 'opened:!1,children:M.children'
$expandedFolderCount = [regex]::Matches($bundle, [regex]::Escape($expandedFolderToken)).Count
$collapsedFolderCount = [regex]::Matches($bundle, [regex]::Escape($collapsedFolderToken)).Count

if ($expandedFolderCount -eq 1) {
  $bundle = $bundle.Replace($expandedFolderToken, $collapsedFolderToken)
} elseif ($collapsedFolderCount -eq 1) {
  # Already collapsed in this bundle variant.
} else {
  # Some runtime bundles no longer expose the old folder-open token.
}

# Boost layer blur modestly so Photoshop output lands closer to Figma's visual
# scale, and avoid baking editable shadow pixels into native shape/vector
# layers when a preview canvas is not required for procedural effects. Some
# newer bundle variants already inline or rename these helpers, so treat the
# old token set as optional.
$layerBlurHelperFind = 'function fi(e,t,n){if(t<=.01)return e;'
$layerBlurHelperReplace = 'function effectiveLayerBlurRadius(e){return e<=.01?0:e*1.25}function fi(e,t,n){if(t<=.01)return e;'
if ($bundle.Contains($layerBlurHelperFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $layerBlurHelperFind `
    -Replace $layerBlurHelperReplace `
    -ExpectedCount 1 `
    -Label 'layer blur radius helper'
} elseif ($bundle.Contains('function effectiveLayerBlurRadius(')) {
  # Already patched in this bundle variant.
} else {
  # Helper name/path changed in this bundle variant.
}

$layerBlurPreviewFind = 'function _m(e,t,n,r,i){var f;let a=Nm(n),o=a>0?jm(t,a,"".concat(r," padding")):t,s=(i==null?void 0:i.allowDeferredPreview)===!0&&yr(o.width,o.height,yu),u=s?o:fi(o,en(n),r),l=e.x-a,c=e.y-a;return{sourceCanvas:o,blurredCanvas:u,left:l,top:c,right:l+o.width,bottom:c+o.height,warning:s?dm((f=i==null?void 0:i.warningName)!=null?f:e.name):null}}'
$layerBlurPreviewReplace = 'function _m(e,t,n,r,i){var f;let a=Nm(n),o=a>0?jm(t,a,"".concat(r," padding")):t,s=(i==null?void 0:i.allowDeferredPreview)===!0&&yr(o.width,o.height,yu),u=s?o:fi(o,effectiveLayerBlurRadius(en(n)),r),l=e.x-a,c=e.y-a;return{sourceCanvas:o,blurredCanvas:u,left:l,top:c,right:l+o.width,bottom:c+o.height,warning:s?dm((f=i==null?void 0:i.warningName)!=null?f:e.name):null}}'
if ($bundle.Contains($layerBlurPreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $layerBlurPreviewFind `
    -Replace $layerBlurPreviewReplace `
    -ExpectedCount 1 `
    -Label 'layer blur preview radius mapping'
} elseif ($bundle.Contains($layerBlurPreviewReplace)) {
  # Already patched in this bundle variant.
} else {
  # Preview radius helper path changed in this bundle variant.
}

$layerBlurPaddingFind = 'function Nm(e){let t=en(e);return t<=.01?0:Math.ceil(ae(t*2.25+4,4,192))}'
$layerBlurPaddingReplace = 'function Nm(e){let t=effectiveLayerBlurRadius(en(e));return t<=.01?0:Math.ceil(ae(t*2.25+4,4,192))}'
if ($bundle.Contains($layerBlurPaddingFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $layerBlurPaddingFind `
    -Replace $layerBlurPaddingReplace `
    -ExpectedCount 1 `
    -Label 'layer blur padding radius mapping'
} elseif ($bundle.Contains($layerBlurPaddingReplace)) {
  # Already patched in this bundle variant.
} else {
  # Padding helper path changed in this bundle variant.
}

$vectorBlurPreviewFind = 'c=i?l?t:fi(t,en(i),"vector smart object blur preview"):t'
$vectorBlurPreviewReplace = 'c=i?l?t:fi(t,effectiveLayerBlurRadius(en(i)),"vector smart object blur preview"):t'
if ($bundle.Contains($vectorBlurPreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $vectorBlurPreviewFind `
    -Replace $vectorBlurPreviewReplace `
    -ExpectedCount 1 `
    -Label 'vector smart object blur preview mapping'
} elseif ($bundle.Contains($vectorBlurPreviewReplace)) {
  # Already patched in this bundle variant.
} else {
  # Vector smart object blur preview mapping changed in this bundle variant.
}

$photoshopLayerBlurFind = 'function zm(e){return Gm(en(e))}'
$photoshopLayerBlurReplace = 'function zm(e){return Gm(effectiveLayerBlurRadius(en(e)))}'
if ($bundle.Contains($photoshopLayerBlurFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $photoshopLayerBlurFind `
    -Replace $photoshopLayerBlurReplace `
    -ExpectedCount 1 `
    -Label 'photoshop layer blur radius mapping'
} elseif ($bundle.Contains($photoshopLayerBlurReplace)) {
  # Already patched in this bundle variant.
} else {
  # Photoshop layer blur radius mapping changed in this bundle variant.
}

$progressiveBlurPreviewFind = 'a=fi(i,en(n),"progressive blur preview")'
$progressiveBlurPreviewReplace = 'a=fi(i,effectiveLayerBlurRadius(en(n)),"progressive blur preview")'
if ($bundle.Contains($progressiveBlurPreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $progressiveBlurPreviewFind `
    -Replace $progressiveBlurPreviewReplace `
    -ExpectedCount 1 `
    -Label 'progressive blur preview mapping'
} elseif ($bundle.Contains($progressiveBlurPreviewReplace)) {
  # Already patched in this bundle variant.
} else {
  # Progressive blur preview mapping changed in this bundle variant.
}

$progressiveBlurMaskFind = 'function Hm(e,t,n){let r=en(n),i=Math.hypot((ae(n.endOffset.x,0,1)-ae(n.startOffset.x,0,1))*Math.max(1,e-1),(ae(n.endOffset.y,0,1)-ae(n.startOffset.y,0,1))*Math.max(1,t-1)),a=r*.35,o=i>0?i*.08:a,s=Math.min(6,Math.max(1.5,r*.2));return ae(Math.min(a,o),s,20)}'
$progressiveBlurMaskReplace = 'function Hm(e,t,n){let r=effectiveLayerBlurRadius(en(n)),i=Math.hypot((ae(n.endOffset.x,0,1)-ae(n.startOffset.x,0,1))*Math.max(1,e-1),(ae(n.endOffset.y,0,1)-ae(n.startOffset.y,0,1))*Math.max(1,t-1)),a=r*.35,o=i>0?i*.08:a,s=Math.min(6,Math.max(1.5,r*.2));return ae(Math.min(a,o),s,20)}'
if ($bundle.Contains($progressiveBlurMaskFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $progressiveBlurMaskFind `
    -Replace $progressiveBlurMaskReplace `
    -ExpectedCount 1 `
    -Label 'progressive blur mask mapping'
} elseif ($bundle.Contains($progressiveBlurMaskReplace)) {
  # Already patched in this bundle variant.
} else {
  # Progressive blur mask mapping changed in this bundle variant.
}

$progressiveBlurPaddingFind = 'function mw(e,t,n){let r=en(n),i=Hm(e,t,n);return Math.ceil(ae(r*2.25+i*2+4,8,192))}'
$progressiveBlurPaddingReplace = 'function mw(e,t,n){let r=effectiveLayerBlurRadius(en(n)),i=Hm(e,t,n);return Math.ceil(ae(r*2.25+i*2+4,8,192))}'
if ($bundle.Contains($progressiveBlurPaddingFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $progressiveBlurPaddingFind `
    -Replace $progressiveBlurPaddingReplace `
    -ExpectedCount 1 `
    -Label 'progressive blur padding mapping'
} elseif ($bundle.Contains($progressiveBlurPaddingReplace)) {
  # Already patched in this bundle variant.
} else {
  # Progressive blur padding mapping changed in this bundle variant.
}

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function oa(e){var u;if(V(e)&&e.children.length>0||te(e)||X(e,"strokes")||!("fills"in e)||!Array.isArray(e.fills))return null;let t=e.fills.filter(c=>W(c));if(t.length!==1)return null;let r=t[0];if(r.type!=="IMAGE"||!r.imageHash)return null;let o=h((u=r.opacity)!=null?u:1,0,1),n=!St(o,1),i=!st(r.blendMode);if(!n&&!i)return null;let a="blendMode"in e?e.blendMode:void 0,s=!st(a),l=i&&!s;return{normalizePaintOpacity:n||l,normalizePaintBlendMode:l,effectiveOpacity:h(j(e)*o,0,1),effectiveBlendMode:l?oe(r.blendMode):K(e),warning:i&&s?''"''.concat(f(e),''" uses both layer and image-fill blend modes, so only the layer blend stayed editable in the PSD.''):null}}' `
  -Replace 'function oa(e){var u;if(!("fills"in e)||!Array.isArray(e.fills))return null;let t=e.fills.filter(c=>W(c));if(t.length!==1)return null;let r=t[0],o=r.type==="IMAGE"&&!!r.imageHash,n=o?h((u=r.opacity)!=null?u:1,0,1):1,i=o&&!St(n,1),a=!st(r.blendMode);if(!i&&!a)return null;let s="blendMode"in e?e.blendMode:void 0,l=!st(s),c=a,p=c?oe(r.blendMode):K(e),g=l&&c&&K(e)!==p;return{normalizePaintOpacity:i||c&&o,normalizePaintBlendMode:c,effectiveOpacity:o?h(j(e)*n*pigmaColorBurnOpacityScale(r),0,1):h(j(e)*pigmaColorBurnOpacityScale(r),0,1),effectiveBlendMode:p,warning:g?''"''.concat(f(e),''" collapses Figma layer/fill blend modes into the fill blend for PSD export.''):null}}' `
  -ExpectedCount 1 `
  -Label 'single-fill blend mode promotion'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function to(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map(n=>na(n,t))}' `
  -Replace 'function pigmaVisibleFillEntries(e){return!("fills"in e)||!Array.isArray(e.fills)?[]:e.fills.map((t,r)=>({paint:t,index:r})).filter(t=>W(t.paint))}function pigmaFillOpacity(e){var t;return h((t=e.opacity)!=null?t:1,0,1)}function pigmaPaintNeedsDedicatedLayer(e){return!st(e.blendMode)||!St(pigmaFillOpacity(e),1)}function pigmaMultiFillBlendInfo(e,t=null){let r=pigmaVisibleFillEntries(e);if(r.length<2||e.type==="TEXT"||te(e,t))return null;let o=r.filter(n=>pigmaPaintNeedsDedicatedLayer(n.paint));return o.length===0?null:{entries:r,warning:"\"".concat(f(e),"\" uses multiple visible fills with blend or opacity overrides, so PSD export split them into separate child layers.")}}function pigmaFillBlendMode(e){return at(!st(e.blendMode)?oe(e.blendMode):"normal")}function pigmaFillChildName(e,t,r,o){return r?o==="background"?"Background Fill ".concat(t+1):"".concat(f(e)," Fill ").concat(t+1):o==="background"?"Background":f(e)}function pigmaIsolateFillOnClone(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map((n,i)=>i===t?B(b({},n),{blendMode:"NORMAL",opacity:1,visible:!0}):B(b({},n),{blendMode:"NORMAL",opacity:1,visible:!1}))}async function pigmaExportFillBitmapChild(e,t,r,o,n,i,a,s="node"){let l=e.clone();try{pigmaIsolateFillOnClone(l,o.index),s==="background"&&"children"in l&&Ii(l),Oe(l,a),bt(l,r);let u=x(r.x-t.documentBounds.x),c=x(r.y-t.documentBounds.y),p=d(r.width),g=d(r.height);return{kind:"bitmap",id:"".concat(e.id,":").concat(s==="background"?"background-fill":"fill",":").concat(o.index+1),name:pigmaFillChildName(e,n,i,s),sourceType:"".concat(e.type,s==="background"?"_BACKGROUND_FILL":"_FILL"),opacity:pigmaFillOpacity(o.paint),visible:!0,blendMode:pigmaFillBlendMode(o.paint),effects:null,strokeEffect:null,x:u,y:c,width:p,height:g,nodeTransform:de(e,t.documentBounds,u,c),pngBytes:await l.exportAsync({format:"PNG",useAbsoluteBounds:r.useAbsoluteBounds})}}finally{l.removed||l.remove()}}async function pigmaExportMultiFillGroup(e,t,r,o=null){let n=pigmaMultiFillBlendInfo(e,t.root);if(!n||t.longFrameMode)return null;let i=o!=null?o:tt(e);if(!i)return null;let a=L(e,t.root);if(progressiveBlurShouldRasterize(a))return null;t.currentLeaf+=1,Y(t,f(e));let s=await hr(e,t,r),l=s.effects,u=_(l),c=me(e),p={removeSupportedEffects:s.removeSupportedEffects||!!u,removeSupportedStroke:!!c},g=[];await dt(e);for(let y=0;y<n.entries.length;y+=1){let m=await pigmaExportFillBitmapChild(e,t,i,n.entries[y],y,n.entries.length>1,p,"node");m&&g.push(m)}return g.length<2?null:(n.warning&&t.warnings.add(n.warning),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:l,strokeEffect:c,mask:null,children:g})}async function pigmaExportMultiFillBackgroundGroup(e,t,r){let o=pigmaMultiFillBlendInfo(e,t.root);if(!o||t.longFrameMode||!Ln(e)||!Ur(e))return null;let n=Fn(e);if(!n)return null;let i=L(e,t.root);if(progressiveBlurShouldRasterize(i))return null;let a=me(e),s=Hi(i),l=Vi(i),u={removeSupportedEffects:!!i,removeSupportedStroke:!!a},c=[];t.currentLeaf+=1,Y(t,"".concat(f(e)," Background"));await dt(e);for(let p=0;p<o.entries.length;p+=1){let g=await pigmaExportFillBitmapChild(e,t,n,o.entries[p],p,o.entries.length>1,u,"background");g&&c.push(g)}return c.length<2?null:(o.warning&&t.warnings.add(o.warning),{backgroundLayer:{kind:"group",id:"".concat(e.id,":background-stack"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_GROUP"),opacity:1,visible:!0,blendMode:"normal",effects:s,strokeEffect:a,mask:null,children:c},groupEffects:l,groupStrokeEffect:null})}function to(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map(n=>na(n,t))}' `
  -ExpectedCount 1 `
  -Label 'multi-fill blend decomposition helpers'

$multiFillHelpersPatched = @'
function pigmaVisibleFillEntries(e){return!("fills"in e)||!Array.isArray(e.fills)?[]:e.fills.map((t,r)=>({paint:t,index:r})).filter(t=>W(t.paint))}
function pigmaPsdFillStackEntries(e){return e.slice().reverse()}
function pigmaColorBurnOpacityScale(e){return e&&e.blendMode==="COLOR_BURN"?.875:1}
function pigmaFillOpacity(e){var t;return h(((t=e.opacity)!=null?t:1)*pigmaColorBurnOpacityScale(e),0,1)}
function pigmaPaintNeedsDedicatedLayer(e){return!st(e.blendMode)||!St(pigmaFillOpacity(e),1)}
function pigmaMultiFillBlendInfo(e,t=null){let r=pigmaVisibleFillEntries(e);if(r.length<2||e.type==="TEXT")return null;let o=te(e,t),n=r.filter(i=>pigmaPaintNeedsDedicatedLayer(i.paint));if(!o&&n.length===0)return null;return{entries:r,mode:o?"baked-fx":"split",warning:o?"\"".concat(f(e),"\" uses multiple visible fills plus unsupported effects, so PSD export kept separate fill layers and added one baked effects layer."):"\"".concat(f(e),"\" uses multiple visible fills with blend or opacity overrides, so PSD export split them into separate child layers.")}}
function pigmaFillBlendMode(e){return at(!st(e.blendMode)?oe(e.blendMode):"normal")}
function pigmaFillChildName(e,t,r,o){return r?o==="background"?"Background Fill ".concat(t+1):"".concat(f(e)," Fill ").concat(t+1):o==="background"?"Background":f(e)}
function pigmaFxChildName(e,t){return t==="background"?"Background Effects":"Effects"}
function pigmaBaseFillBounds(e,t=null){let r=k(e);if(r&&r.width>0&&r.height>0)return{x:r.x,y:r.y,width:r.width,height:r.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let o=ce(e);if(o)return{x:o.x,y:o.y,width:o.width,height:o.height,useAbsoluteBounds:!0}}return t!=null?t:v(e)}
function pigmaIsolateFillOnClone(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map((n,i)=>i===t?B(b({},n),{blendMode:"NORMAL",opacity:1,visible:!0}):B(b({},n),{blendMode:"NORMAL",opacity:1,visible:!1}))}
function pigmaHideAllFillsOnClone(e){if(!("fills"in e)||!Array.isArray(e.fills))return;let t=e,r=e.fills;t.fills=r.map(o=>B(b({},o),{blendMode:"NORMAL",opacity:1,visible:!1}))}
async function pigmaExportFillBitmapChild(e,t,r,o,n,i,a,s="node"){let l=e.clone();try{pigmaIsolateFillOnClone(l,o.index),s==="background"&&"children"in l&&Ii(l),Oe(l,a),bt(l,r);let u=x(r.x-t.documentBounds.x),c=x(r.y-t.documentBounds.y),p=d(r.width),g=d(r.height);return{kind:"bitmap",id:"".concat(e.id,":").concat(s==="background"?"background-fill":"fill",":").concat(o.index+1),name:pigmaFillChildName(e,o.index,i,s),sourceType:"".concat(e.type,s==="background"?"_BACKGROUND_FILL":"_FILL"),opacity:pigmaFillOpacity(o.paint),visible:!0,blendMode:pigmaFillBlendMode(o.paint),effects:null,strokeEffect:null,x:u,y:c,width:p,height:g,nodeTransform:de(e,t.documentBounds,u,c),pngBytes:await l.exportAsync({format:"PNG",useAbsoluteBounds:r.useAbsoluteBounds})}}finally{l.removed||l.remove()}}
async function pigmaExportFxBitmapChild(e,t,r,o,n="node"){let i=e.clone();try{pigmaHideAllFillsOnClone(i),n==="background"&&"children"in i&&Ii(i),Oe(i,o),bt(i,r);let a=x(r.x-t.documentBounds.x),s=x(r.y-t.documentBounds.y),l=d(r.width),u=d(r.height);return{kind:"bitmap",id:"".concat(e.id,":").concat(n==="background"?"background-fx":"fx"),name:pigmaFxChildName(e,n),sourceType:"".concat(e.type,n==="background"?"_BACKGROUND_FX":"_FX"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:a,y:s,width:l,height:u,nodeTransform:de(e,t.documentBounds,a,s),pngBytes:await i.exportAsync({format:"PNG",useAbsoluteBounds:r.useAbsoluteBounds})}}finally{i.removed||i.remove()}}
async function pigmaExportMultiFillGroup(e,t,r,o=null){let n=pigmaMultiFillBlendInfo(e,t.root);if(!n||t.longFrameMode)return null;let i=o!=null?o:tt(e),a=n.mode==="baked-fx"?tt(e):i,s=n.mode==="baked-fx"?pigmaBaseFillBounds(e,i):i;if(!a||!s)return null;let l=L(e,t.root);if(n.mode!=="baked-fx"&&progressiveBlurShouldRasterize(l))return null;let u=me(e),c=null,p=null,g={removeSupportedStroke:!!u},y=[],m=pigmaPsdFillStackEntries(n.entries);t.currentLeaf+=1,Y(t,f(e)),await dt(e),n.mode==="baked-fx"?g.removeAllEffects=!0:(c=await hr(e,t,r),p=c.effects,g.removeSupportedEffects=c.removeSupportedEffects||!!_(p));for(let T=0;T<m.length;T+=1){let E=await pigmaExportFillBitmapChild(e,t,s,m[T],T,n.entries.length>1,g,"node");E&&y.push(E)}if(n.mode==="baked-fx"){let T=await pigmaExportFxBitmapChild(e,t,a,{removeSupportedStroke:!!u},"node");T&&y.push(T)}let d=n.entries.length+(n.mode==="baked-fx"?1:0);return y.length<d?null:(n.warning&&t.warnings.add(n.warning),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:n.mode==="baked-fx"?null:p,strokeEffect:u,mask:null,children:y})}
async function pigmaExportMultiFillBackgroundGroup(e,t,r){let o=pigmaMultiFillBlendInfo(e,t.root);if(!o||t.longFrameMode||!Ln(e)||!Ur(e))return null;let n=Fn(e),i=o.mode==="baked-fx"?tt(e):n;if(!n||!i)return null;let a=L(e,t.root);if(o.mode!=="baked-fx"&&progressiveBlurShouldRasterize(a))return null;let s=me(e),l=null,u=null,c={removeSupportedStroke:!!s},p=[],g=pigmaPsdFillStackEntries(o.entries);t.currentLeaf+=1,Y(t,"".concat(f(e)," Background")),await dt(e),o.mode==="baked-fx"?c.removeAllEffects=!0:(l=Hi(a),u=Vi(a),c.removeSupportedEffects=!!a);for(let y=0;y<g.length;y+=1){let m=await pigmaExportFillBitmapChild(e,t,n,g[y],y,o.entries.length>1,c,"background");m&&p.push(m)}if(o.mode==="baked-fx"){let y=await pigmaExportFxBitmapChild(e,t,i,{removeSupportedStroke:!!s},"background");y&&p.push(y)}let d=o.entries.length+(o.mode==="baked-fx"?1:0);return p.length<d?null:(o.warning&&t.warnings.add(o.warning),{backgroundLayer:{kind:"group",id:"".concat(e.id,":background-stack"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_GROUP"),opacity:1,visible:!0,blendMode:"normal",effects:o.mode==="baked-fx"?null:l,strokeEffect:s,mask:null,children:p},groupEffects:o.mode==="baked-fx"?null:u,groupStrokeEffect:null})}
function to(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map(n=>na(n,t))}
'@

$multiFillHelpersPattern = 'function pigmaVisibleFillEntries\(e\)\{.*?function to\(e,t\)\{if\(!\("fills"in e\)\|\|!Array\.isArray\(e\.fills\)\)return;let r=e,o=e\.fills;r\.fills=o\.map\(n=>na\(n,t\)\)\}'
$multiFillHelpersRegex = [regex]::new($multiFillHelpersPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
$multiFillHelpersMatchCount = $multiFillHelpersRegex.Matches($bundle).Count
if ($multiFillHelpersMatchCount -eq 1) {
  $bundle = $multiFillHelpersRegex.Replace(
    $bundle,
    [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $multiFillHelpersPatched },
    1
  )
} elseif (-not $bundle.Contains('function pigmaBaseFillBounds')) {
  throw "Could not upgrade multi-fill helpers to baked-fx variant. Matches found: $multiFillHelpersMatchCount"
}

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function Nr(e){if(re(e)||te(e)||X(e,"strokes")||fe(e))return{strategy:"smart-object",fill:null};let t=Ti(e);return t?{strategy:"shape",fill:t}:{strategy:"smart-object",fill:null}}' `
  -Replace 'function pigmaShapeFillRequiresSvg(e){return e&&e.kind==="gradient"}function pigmaVectorRequiresSvgSmartObject(e,t){return pigmaShapeFillRequiresSvg(t)||pigmaStrokeRequiresSvg(e)}function Nr(e){if(re(e)||te(e)||fe(e))return{strategy:"smart-object",fill:null};let t=Ti(e);return t?pigmaVectorRequiresSvgSmartObject(e,t)?{strategy:"smart-object",fill:t,forceSvgSmartObject:!0}:{strategy:"shape",fill:t,forceSvgSmartObject:!1}:pigmaStrokeRequiresSvg(e)?{strategy:"smart-object",fill:null,forceSvgSmartObject:!0}:{strategy:"smart-object",fill:null}}' `
  -ExpectedCount 1 `
  -Label 'gradient-filled shape strategy uses SVG smart object'

$shapeNativeSizeGuardFind = 'function gw(e,t,n){if(t>512||n>512||t*n>18e4)return!1;'
$shapeNativeSizeGuardReplace = 'function gw(e,t,n){if(t<=0||n<=0)return!1;'
$shapeNativeTransformGuardFind = $uiNativeShapeTransformGuardFind
$shapeNativeTransformGuardReplace = $uiNativeShapeTransformGuardReplace
if ($bundle.Contains($shapeNativeSizeGuardFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $shapeNativeSizeGuardFind `
    -Replace $shapeNativeSizeGuardReplace `
    -ExpectedCount 1 `
    -Label 'native Photoshop shape size guard'
} elseif ($bundle.Contains($shapeNativeSizeGuardReplace)) {
  # Already patched in this bundle variant.
} else {
  # Native shape size gate is owned by the externalized UI in this bundle variant.
}

if ($bundle.Contains($shapeNativeTransformGuardFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $shapeNativeTransformGuardFind `
    -Replace $shapeNativeTransformGuardReplace `
    -ExpectedCount 1 `
    -Label 'native Photoshop shape SVG transform guard'
} elseif ($bundle.Contains($uiNativeShapeTransformGuardPreviousReplace)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $uiNativeShapeTransformGuardPreviousReplace `
    -Replace $shapeNativeTransformGuardReplace `
    -ExpectedCount 1 `
    -Label 'native Photoshop shape SVG group transform guard'
} elseif ($bundle.Contains($shapeNativeTransformGuardReplace)) {
  # Already patched in this bundle variant.
} else {
  # Native shape transform gate is owned by the externalized UI in this bundle variant.
}

if ($bundle.Contains($uiNativeShapeTransformParserFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $uiNativeShapeTransformParserFind `
    -Replace $uiNativeShapeTransformParserReplace `
    -ExpectedCount 1 `
    -Label 'native Photoshop shape SVG rotate transform parser'
} elseif ($bundle.Contains($uiNativeShapeTransformParserReplace)) {
  # Already patched in this bundle variant.
} else {
  # Native shape transform parser is owned by the externalized UI in this bundle variant.
}

$shapeVectorPreviewFind = 'if(e.strategy==="shape"&&!l&&e.fill&&!c&&u)try{let f=sw(e,s,t,n),d=await bt(e,f,s,i,a);return{layer:d.layer,linkedFiles:d.linkedFiles,warnings:d.warnings}}catch(f){}'
$shapeVectorPreviewLegacyReplace = 'if(e.strategy==="shape"&&!l&&e.fill&&!c&&u)try{let f=Sh(e,i),d=sw(e,f?s:null,t,n),p=f?await bt(e,d,s,i,a):{layer:d,linkedFiles:[],warnings:[]};return{layer:p.layer,linkedFiles:p.linkedFiles,warnings:p.warnings}}catch(f){}'
$shapeVectorPreviewReplace = 'if(e.strategy==="shape"&&!l&&e.fill&&u)try{let f=Sh(e,i),d=sw(e,f?s:null,t,n),p=f?await bt(e,d,s,i,a):{layer:d,linkedFiles:[],warnings:[]};return{layer:p.layer,linkedFiles:p.linkedFiles,warnings:p.warnings}}catch(f){}if(pigmaForceSvgSmartObject&&!l)try{let f=lw(e,s,o.visibleWidth,o.visibleHeight),d=await bt(e,f.layer,s,i,a);return{layer:d.layer,linkedFiles:f.linkedFiles.concat(d.linkedFiles),warnings:f.warnings.concat(d.warnings)}}catch(f){}'
if ($bundle.Contains($shapeVectorPreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $shapeVectorPreviewFind `
    -Replace $shapeVectorPreviewReplace `
    -ExpectedCount 1 `
    -Label 'shape vector preview canvas gate'
} elseif ($bundle.Contains($shapeVectorPreviewLegacyReplace)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $shapeVectorPreviewLegacyReplace `
    -Replace $shapeVectorPreviewReplace `
    -ExpectedCount 1 `
    -Label 'shape vector preview canvas gate'
} elseif ($bundle.Contains($shapeVectorPreviewReplace)) {
  # Already patched in this bundle variant.
} else {
  # Shape vector preview canvas gate changed in this bundle variant.
}

$conditionalShapePreviewFind = 'function sw(e,t,n,r){if(!e.fill)throw new Error("Shape vector export requires a supported fill.");let i=Aw(bw(e.svgString,e.width,e.height),e.x,e.y,n,r);if(i.length===0)throw new Error("The SVG did not contain any shape paths.");let a={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),fillOpacity:Em(e.fill),canvas:t,vectorFill:Dm(e.fill,e.width,e.height,e.nodeTransform),vectorMask:{paths:i}};return Wn(a,e.effects,e.strokeEffect),a}'
$conditionalShapePreviewLegacyReplace = 'function sw(e,t,n,r){if(!e.fill)throw new Error("Shape vector export requires a supported fill.");let i=Aw(bw(e.svgString,e.width,e.height),e.x,e.y,n,r);if(i.length===0)throw new Error("The SVG did not contain any shape paths.");let a={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),fillOpacity:Em(e.fill),vectorFill:Dm(e.fill,e.width,e.height,e.nodeTransform),vectorMask:{paths:i}};return t&&(a.canvas=t),Wn(a,e.effects,e.strokeEffect),a}'
$conditionalShapePreviewReplace = 'function pigmaShapeUsesLayerOpacityForFill(e){return e&&String(e.blendMode||"").toLowerCase()==="color dodge"}function pigmaShapeFillOpacity(e){return Em(e&&e.fill)}function pigmaShapeLayerOpacity(e){let t=typeof e.opacity=="number"?e.opacity:1,n=pigmaShapeFillOpacity(e);return pigmaShapeUsesLayerOpacityForFill(e)?ae(t*n,0,1):t}function pigmaShapeLayerFillOpacity(e){return pigmaShapeUsesLayerOpacityForFill(e)?1:pigmaShapeFillOpacity(e)}function sw(e,t,n,r){if(!e.fill)throw new Error("Shape vector export requires a supported fill.");let i=Aw(bw(e.svgString,e.width,e.height),e.x,e.y,n,r);if(i.length===0)throw new Error("The SVG did not contain any shape paths.");let a={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:pigmaShapeLayerOpacity(e),hidden:!e.visible,blendMode:wr(e.blendMode),fillOpacity:pigmaShapeLayerFillOpacity(e),vectorFill:Dm(e.fill,e.width,e.height,e.nodeTransform),vectorMask:{paths:i}};return t&&(a.canvas=t),Wn(a,e.effects,e.strokeEffect),a}'
if ($bundle.Contains($conditionalShapePreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $conditionalShapePreviewFind `
    -Replace $conditionalShapePreviewReplace `
    -ExpectedCount 1 `
    -Label 'conditional shape vector preview canvas'
} elseif ($bundle.Contains($conditionalShapePreviewLegacyReplace)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $conditionalShapePreviewLegacyReplace `
    -Replace $conditionalShapePreviewReplace `
    -ExpectedCount 1 `
    -Label 'color dodge shape fill opacity mapping'
} elseif ($bundle.Contains($conditionalShapePreviewReplace)) {
  # Already patched in this bundle variant.
} else {
  # Conditional shape vector preview canvas changed in this bundle variant.
}

# Stroke-only vector-like nodes can render outside their geometry box. Use
# render bounds for those previews when Figma exposes them, and only fall back
# to geometry + stroke padding when render bounds are unavailable.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function ft(e){let t=ce(e);return t||v(e)}' `
  -Replace 'function ft(e){let t=me(e),r=Re(e)?Nr(e):null,o=Re(e)&&!!t&&!(r!=null&&r.fill),n=o?I(e):null;if(n&&n.width>0&&n.height>0)return{x:n.x,y:n.y,width:n.width,height:n.height,useAbsoluteBounds:!1};let i=ce(e);if(!i)return v(e);if(!o)return{x:i.x,y:i.y,width:i.width,height:i.height,useAbsoluteBounds:!0};let a=Math.max(3,Math.ceil(t.width/2)+2);return{x:i.x-a,y:i.y-a,width:i.width+a*2,height:i.height+a*2,useAbsoluteBounds:!1}}' `
  -ExpectedCount 1 `
  -Label 'stroke-only vector render bounds'

# Keep stroke-only vectors visible in Photoshop by preserving their stroke pixels
# in the preview PNG. Removing supported strokes works for filled shapes, but it
# can leave LINE/stroke-only vectors effectively transparent when PSD cannot
# reconstruct them natively.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function Jn(e,t){if(O.forceBitmapVectorPreview)return null;let r=ft(e);if(!r)return null;let o=L(e,t.root),n=_(o),i=me(e),a=await Me(e,t,o||i||n?r:void 0,o||i||n?{removeSupportedEffects:!0,removeSupportedStroke:!!i}:void 0);if(!a)return null;let s=x(r.x-t.documentBounds.x),l=x(r.y-t.documentBounds.y),u=d(r.width),c=d(r.height),p=x(a.x-s),g=x(a.y-l),y="";try{y=await e.exportAsync({format:"SVG_STRING",useAbsoluteBounds:r.useAbsoluteBounds,svgOutlineText:!0,svgIdAttribute:!0,svgSimplifyStroke:!1})}catch(T){return null}if(!y||y.trim().length===0)return null;let m=Nr(e);return{kind:"vector",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:ro(e),effects:o,strokeEffect:i,x:s,y:l,width:u,height:c,nodeTransform:de(e,t.documentBounds,s,l),pngBytes:a.pngBytes,strategy:m.strategy,svgString:y,fill:m.fill,previewOffsetX:p,previewOffsetY:g}}' `
  -Replace 'async function Jn(e,t){if(O.forceBitmapVectorPreview)return null;let r=ft(e);if(!r)return null;let o=L(e,t.root),n=_(o),i=me(e),a=Nr(e),s=oa(e),l="fills"in e&&Array.isArray(e.fills)?e.fills.some(W):!1,u=(e.type==="LINE"||e.type==="VECTOR")&&!!i&&!l;if(u)return null;let c=!!i&&!(a!=null&&a.fill)&&!I(e)?Math.max(3,Math.ceil(i.width/2)+2):0,p=c?{x:r.x-c,y:r.y-c,width:r.width+c*2,height:r.height+c*2,useAbsoluteBounds:!1}:r,g=await Me(e,t,o||i||n||s?p:void 0,o||i||n||s?{normalizePaintOpacity:(s==null?void 0:s.normalizePaintOpacity)===!0,normalizePaintBlendMode:(s==null?void 0:s.normalizePaintBlendMode)===!0,removeSupportedEffects:!0,removeSupportedStroke:!!i&&a.strategy==="shape"&&!!a.fill}:void 0);if(!g)return null;let y=x(r.x-t.documentBounds.x),m=x(r.y-t.documentBounds.y),T=d(r.width),C=d(r.height),E=x(g.x-y),R=x(g.y-m),N="";try{N=await e.exportAsync({format:"SVG_STRING",useAbsoluteBounds:r.useAbsoluteBounds,svgOutlineText:!0,svgIdAttribute:!0,svgSimplifyStroke:!1})}catch(F){return null}if(!N||N.trim().length===0)return null;return{kind:"vector",id:e.id,name:f(e),sourceType:e.type,opacity:s?s.effectiveOpacity:j(e),visible:e.visible,blendMode:at(s?s.effectiveBlendMode:K(e)),effects:o,strokeEffect:a.strategy==="shape"&&a.fill?i:null,x:y,y:m,width:T,height:C,nodeTransform:de(e,t.documentBounds,y,m),pngBytes:g.pngBytes,strategy:a.strategy,forceSvgSmartObject:a.forceSvgSmartObject===!0,svgString:N,fill:a.fill,previewOffsetX:E,previewOffsetY:R}}' `
  -ExpectedCount 1 `
  -Label 'stroke-only vector preview preservation'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'let a=yt(e)||(o==null?void 0:o.normalizePaintOpacity)===!0||(o==null?void 0:o.normalizePaintBlendMode)===!0?await $r(e,n,t,o):await e.exportAsync({format:"PNG",useAbsoluteBounds:n.useAbsoluteBounds});return{x:x(n.x-t.documentBounds.x),y:x(n.y-t.documentBounds.y),width:d(n.width),height:d(n.height),pngBytes:a}}' `
  -Replace 'let a=yt(e)||(o==null?void 0:o.normalizePaintOpacity)===!0||(o==null?void 0:o.normalizePaintBlendMode)===!0||(o==null?void 0:o.removeAllEffects)===!0||(o==null?void 0:o.removeSupportedEffects)===!0||(o==null?void 0:o.removeSupportedStroke)===!0?await $r(e,n,t,o):await e.exportAsync({format:"PNG",useAbsoluteBounds:n.useAbsoluteBounds});return{x:x(n.x-t.documentBounds.x),y:x(n.y-t.documentBounds.y),width:d(n.width),height:d(n.height),pngBytes:a}}' `
  -ExpectedCount 1 `
  -Label 'bitmap export honors supported effect removal'

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'function _(e){let t=Kr(e);return t&&zi(t)>0?t:null}' `
  -Replace 'function pigmaLayerBlurShouldRasterize(e){return!!_(e)}function progressiveBlurShouldRasterize(e){return pigmaLayerBlurShouldRasterize(e)}function _(e){let t=Kr(e);return t&&zi(t)>0?t:null}' `
  -ExpectedCount 1 `
  -Label 'layer blur bitmap helper'

# Figma incremental mode now requires loadAllPagesAsync() before registering a
# documentchange handler. Keep startup immediate, then enable document tracking
# asynchronously only when that preload succeeds.
$documentChangeBootstrapFind = 'figma.on("selectionchange",()=>{vt()});figma.on("currentpagechange",()=>{vt(!0)});figma.on("documentchange",()=>{figma.currentPage.selection.length>0&&vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};vt(!0);'
$documentChangeBootstrapReplace = 'function pigmaShouldSkipSelectionSync(){try{return typeof globalThis!="undefined"&&Number(globalThis.__PIGMA_SELECT_ALL_TEXT_SKIP_SELECTION_SYNC_UNTIL__||0)>Date.now()}catch(e){return!1}}figma.on("selectionchange",()=>{if(pigmaShouldSkipSelectionSync())return;vt(!0)});figma.on("currentpagechange",()=>{vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};vt(!0);setTimeout(()=>{vt(!0)},250);async function initDocumentChangeTracking(){if(typeof pigmaEnsureSelectionAccess!="function")return;try{await pigmaEnsureSelectionAccess(),figma.on("documentchange",()=>{figma.currentPage.selection.length>0&&vt(!0)})}catch(e){console.warn("[pigma] documentchange tracking disabled:",e)}}initDocumentChangeTracking();'
if ($bundle.Contains($documentChangeBootstrapFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $documentChangeBootstrapFind `
    -Replace $documentChangeBootstrapReplace `
    -ExpectedCount 1 `
    -Label 'incremental mode documentchange bootstrap'
} elseif ($bundle.Contains($documentChangeBootstrapReplace)) {
  # Already patched in this bundle variant.
} else {
  # Incremental mode documentchange bootstrap changed in this bundle variant.
}

$startupBootstrapFind = 'figma.on("selectionchange",()=>{vt()});figma.on("currentpagechange",()=>{vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};vt(!0);'
$startupBootstrapReplace = 'function pigmaShouldSkipSelectionSync(){try{return typeof globalThis!="undefined"&&Number(globalThis.__PIGMA_SELECT_ALL_TEXT_SKIP_SELECTION_SYNC_UNTIL__||0)>Date.now()}catch(e){return!1}}figma.on("selectionchange",()=>{if(pigmaShouldSkipSelectionSync())return;vt(!0)});figma.on("currentpagechange",()=>{vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};typeof pigmaStartSelectionAccessPreload=="function"&&pigmaStartSelectionAccessPreload();vt(!0);setTimeout(()=>{vt(!0)},250);'
if ($bundle.Contains($startupBootstrapFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $startupBootstrapFind `
    -Replace $startupBootstrapReplace `
    -ExpectedCount 1 `
    -Label 'startup bootstrap eager selection sync'
} elseif ($bundle.Contains($startupBootstrapReplace)) {
  # Already patched in this bundle variant.
} else {
  # Startup bootstrap changed in this bundle variant.
}

$textImportWalkerFind = 'function cr(e,t,r){var c,p;if(e.type!=="TEXT"||t.kind!=="text")return;let o=t.text.shapeType==="box"?(c=k(e))!=null?c:I(e):(p=I(e))!=null?p:k(e),n=k(r),i=o&&n?o.x-n.x:e.x,a=o&&n?o.y-n.y:e.y,s=x(t.x-i),l=x(t.y-a);if(s===0&&l===0)return;let u=e.relativeTransform;e.relativeTransform=[[u[0][0],u[0][1],u[0][2]+s],[u[1][0],u[1][1],u[1][2]+l]]}'
$textImportWalkerReplace = 'function cr(e,t,r){/*PIGMA_TEXT_IMPORT_GUARD::BROAD_TEXT_UPDATES_DISABLED_IN_BUNDLE*/return;}'
if ($bundle.Contains($textImportWalkerReplace)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $textImportWalkerReplace `
    -Replace $textImportWalkerFind `
    -ExpectedCount 1 `
    -Label 'restore scoped text layer updates in import walker'
} elseif ($bundle.Contains($textImportWalkerFind)) {
  # Keep the original import-time text rebase logic enabled.
} else {
  # Text import walker changed in this bundle variant.
}

$importSourceIdTagFind = 'function ve(e,t,r){e.name=t.name||(t.kind==="group"?"Group":"Layer"),e.visible=t.visible,"opacity"in e&&typeof e.opacity=="number"&&(e.opacity=h(t.opacity,0,1)),"blendMode"in e&&(e.blendMode=J(t.blendMode,r)),bn(e,t.effects),Pn(e,t.strokeEffect)}'
$importSourceIdTagReplace = 'function ve(e,t,r){e.name=t.name||(t.kind==="group"?"Group":"Layer"),e.visible=t.visible,"opacity"in e&&typeof e.opacity=="number"&&(e.opacity=h(t.opacity,0,1)),"blendMode"in e&&(e.blendMode=J(t.blendMode,r)),bn(e,t.effects),Pn(e,t.strokeEffect),function(o,n){/*PIGMA_TEXT_IMPORT_GUARD::SOURCE_ID_TAGGING*/if(!o||typeof o.setPluginData!="function"||!n||n.id==null)return;try{o.setPluginData("__pigmaImportSourceId",String(n.id)),o.setPluginData("__pigmaImportSourceKind",String(n.kind||""))}catch(i){}}(e,t)}'
if ($bundle.Contains($importSourceIdTagFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $importSourceIdTagFind `
    -Replace $importSourceIdTagReplace `
    -ExpectedCount 1 `
    -Label 'import source id tagging'
} elseif ($bundle.Contains($importSourceIdTagReplace)) {
  # Already patched in this bundle variant.
} else {
  # Import source id tagging changed in this bundle variant.
}

$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'if(n==="split"){let l=await kn(e,t,(a=Ut(e))!=null?a:r);if(l)return t.preservedGroupCount+=1,l;t.warnings.add(''"''.concat(f(e),''" could not separate its background cleanly, so it was flattened.''))}if(e.type==="TEXT"&&t.settings.textExportMode!=="rasterize-text"){' `
  -Replace 'if(n==="split"){let l=await kn(e,t,(a=Ut(e))!=null?a:r);if(l)return t.preservedGroupCount+=1,l;let u=await gr(e,t,r);if(u.length>0)return t.warnings.add(''"''.concat(f(e),''" could not separate its background cleanly, so it preserved the child layers without a synthetic background.'')),t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:u};t.warnings.add(''"''.concat(f(e),''" could not separate its background cleanly, so it was flattened.''))}if(progressiveBlurShouldRasterize(L(e,t.root)))return await qn(e,t,r);if(e.type==="TEXT"&&t.settings.textExportMode!=="rasterize-text"){' `
  -ExpectedCount 1 `
  -Label 'layer blur raster path in main export walker'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function kn(' `
  -EndMarker 'function Bn(' `
  -Replacement 'async function kn(e,t,r=null){let o=await gr(e,t,r),n=await pigmaExportMultiFillBackgroundGroup(e,t,r);if(n)return n.backgroundLayer&&(o.push(n.backgroundLayer)),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:n.groupEffects,strokeEffect:n.groupStrokeEffect,mask:containerMask(e,t.documentBounds,t.root),children:o};let i=L(e,t.root),a=me(e),s=await Rn(e,t),l=Bn(s,i,a);return!l.backgroundLayer&&o.length===0?null:(l.backgroundLayer&&(o.push(l.backgroundLayer),(l.backgroundLayer.kind==="bitmap"||l.backgroundLayer.kind==="shape")&&ha(t.backgroundDebug,ga(e,l.backgroundLayer,o.length-1,o.length))),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:l.groupEffects,strokeEffect:l.groupStrokeEffect,mask:containerMask(e,t.documentBounds,t.root),children:o})}' `
  -Label 'multi-fill background group split export'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function qn(' `
  -EndMarker 'async function Jn(' `
  -Replacement 'async function qn(e,t,r=null){var g,y;let o=oa(e),n=e.type==="TEXT"?Gi(e,t.documentBounds):null,i=(g=n!=null?n:tt(e))!=null?g:v(e),a=o!=null&&o.warning?o.warning:null;if(a&&t.warnings.add(a),!t.longFrameMode){let T=await pigmaExportMultiFillGroup(e,t,r,i);if(T)return T}if(t.longFrameMode&&i&&pe(e)&&De(i)){t.currentLeaf+=1,Y(t,f(e));let T=await pt(e,i,{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0});return t.warnings.add(Te(f(e),T.length)),Be(e.id,f(e),e.type,o?o.effectiveOpacity:j(e),e.visible,at(o?o.effectiveBlendMode:K(e)),T)}let s=await hr(e,t,r),l=s.effects,u=_(l),c=me(e),p=progressiveBlurShouldRasterize(l),d=Re(e)?Nr(e):null,m=!!c&&Re(e)&&!(d!=null&&d.fill),h=o||l||c||u?p?{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0}:{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0,removeSupportedEffects:s.removeSupportedEffects||!!u,removeSupportedStroke:!!c&&!m}:void 0,Bounds=p?(n!=null?n:v(e)):n!=null?n:(o||l||c||u)&&(y=tt(e))!=null?y:void 0;p&&t.warnings.add(''"''.concat(f(e),''" kept its layer blur as a bitmap layer for closer Photoshop matching.''));let E=n&&e.type==="TEXT"?await Qn(e,t,n,h):await Me(e,t,Bounds,h);return E?{kind:"bitmap",id:e.id,name:f(e),sourceType:e.type,opacity:o?o.effectiveOpacity:j(e),visible:e.visible,blendMode:at(o?o.effectiveBlendMode:K(e)),effects:p?null:l,strokeEffect:p||m?null:c,x:E.x,y:E.y,width:E.width,height:E.height,nodeTransform:de(e,t.documentBounds,E.x,E.y),pngBytes:E.pngBytes}:null}' `
  -Label 'layer blur bitmap flatten export'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function xr(' `
  -EndMarker 'function Xe(' `
  -Replacement 'async function xr(e,t){var n,i;let r=e.type==="TEXT"&&(n=ge(e,!1))!=null?n:v(e);if(!r)return t.warnings.add(''"''.concat(f(e),''" was skipped because it has no exportable bounds.'')),null;let a=oa(e),s=a!=null&&a.warning?a.warning:null;s&&t.warnings.add(s);let l=await hr(e,t,null),u=l.effects,c=_(u),p=me(e),g=progressiveBlurShouldRasterize(u),y=Re(e)?Nr(e):null,m=!!p&&Re(e)&&!(y!=null&&y.fill),h=a||u||p||c?g?{normalizePaintOpacity:(a==null?void 0:a.normalizePaintOpacity)===!0,normalizePaintBlendMode:(a==null?void 0:a.normalizePaintBlendMode)===!0}:{normalizePaintOpacity:(a==null?void 0:a.normalizePaintOpacity)===!0,normalizePaintBlendMode:(a==null?void 0:a.normalizePaintBlendMode)===!0,removeSupportedEffects:l.removeSupportedEffects||!!c,removeSupportedStroke:!!p&&!m}:void 0,T=g?((i=v(e))!=null?i:r):a||u||p||c?((i=tt(e))!=null?i:r):r;if(t.longFrameMode&&pe(e)&&De(r)){t.currentLeaf+=1,Y(t,f(e));let C=await pt(e,r,h,t.documentBounds);return t.warnings.add(Te(f(e),C.length)),Be(e.id,f(e),e.type,a?a.effectiveOpacity:j(e),e.visible,at(a?a.effectiveBlendMode:K(e)),C)}g&&t.warnings.add(''"''.concat(f(e),''" kept its layer blur as a bitmap layer for closer Photoshop matching.''));let E=await Me(e,t,T,h);return E?{kind:"bitmap",id:e.id,name:f(e),sourceType:e.type,opacity:a?a.effectiveOpacity:j(e),visible:e.visible,blendMode:at(a?a.effectiveBlendMode:K(e)),effects:g?null:u,strokeEffect:g||m?null:p,x:E.x,y:E.y,width:E.width,height:E.height,nodeTransform:de(e,t.documentBounds,E.x,E.y),pngBytes:E.pngBytes}:null}' `
  -Label 'safe layered bitmap live effects export'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function ct(' `
  -EndMarker 'async function Cn(' `
  -Replacement 'async function ct(e,t,r=null){var i,a,s;if(t.hiddenLayerMode==="ignore-hidden"&&!q(e))return null;if(pigmaShouldFlattenTransformedClipContainer(e)){t.warnings.add("\"".concat(f(e),"\" was wrapped as a layered smart object because PSD cannot preserve transformed clipping containers directly."));return await pigmaBuildTransformedClipSmartObject(e,t,r)}let o=e.type==="TEXT"?await Hn(e):null;if(o&&!o.ok)return t.warnings.add(o.reason),await Cn(e,t);let n=Fe(e);if(n==="group"){let l=e,u=await gr(l,t,(i=Ut(l))!=null?i:r);if(u.length>0)return t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(l,t.documentBounds,t.root),children:u}}if(n==="split"){let l=await kn(e,t,(a=Ut(e))!=null?a:r);if(l)return t.preservedGroupCount+=1,l;let u=await gr(e,t,r);if(u.length>0)return t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it preserved the child layers without a synthetic background.")),t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:u};t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it was flattened."))}if(progressiveBlurShouldRasterize(L(e,t.root)))return await qn(e,t,r);if(e.type==="TEXT"&&t.settings.textExportMode!=="rasterize-text"){let l=await Gn(e,t,r);if(l)return _(l.effects)||(t.editableTextCount+=1),l}if(Re(e)){let l=(s=ft(e))!=null?s:v(e),u=!t.longFrameMode?await pigmaExportMultiFillGroup(e,t,r,l):null;if(u)return t.preservedGroupCount+=1,u;if(t.longFrameMode&&!!l&&Ne(d(l.width),d(l.height),!1))t.warnings.add(jo(f(e)));else{let c=await Jn(e,t);if(c)return c;t.warnings.add("\"".concat(f(e),"\" could not keep its SVG/vector data, so it fell back to a bitmap layer."))}}if(V(e)&&e.children.length>0){let l=L(e);_(l)?t.warnings.add(Mr(e,"past")):ze(e)?t.warnings.add(Ir(e,"past")):$e(l)?t.warnings.add(Rr(e,"past")):Pt(l)?t.warnings.add(Ar(e,"past")):t.warnings.add(Br(e,"past"))}return await qn(e,t,r)}' `
  -Label 'multi-fill group preempts vector export'

$importPatch = [System.IO.File]::ReadAllText($patch, [System.Text.Encoding]::UTF8)
$exportPatchContent = [System.IO.File]::ReadAllText($exportPatch, [System.Text.Encoding]::UTF8)
$shapeLayerExportPatchContent = [System.IO.File]::ReadAllText($shapeLayerExportPatch, [System.Text.Encoding]::UTF8)
$aiSettingsPatchContent = [System.IO.File]::ReadAllText($aiSettingsPatch, [System.Text.Encoding]::UTF8)
$pigmaWebIntegrationPatchContent = [System.IO.File]::ReadAllText($pigmaWebIntegrationPatch, [System.Text.Encoding]::UTF8)
$aiResponsiveMemoryPatchContent = [System.IO.File]::ReadAllText($aiResponsiveMemoryPatch, [System.Text.Encoding]::UTF8)
$aiResponsivePairAnalyzerPatchContent = [System.IO.File]::ReadAllText($aiResponsivePairAnalyzerPatch, [System.Text.Encoding]::UTF8)
$aiLlmClientPatchContent = [System.IO.File]::ReadAllText($aiLlmClientPatch, [System.Text.Encoding]::UTF8)
$aiDesignChatPatchContent = [System.IO.File]::ReadAllText($aiDesignChatPatch, [System.Text.Encoding]::UTF8)
$aiAccessibilityDiagnosisPatchContent = [System.IO.File]::ReadAllText($aiAccessibilityDiagnosisPatch, [System.Text.Encoding]::UTF8)
$aiDesignConsistencyPatchContent = [System.IO.File]::ReadAllText($aiDesignConsistencyPatch, [System.Text.Encoding]::UTF8)
$aiTypoAuditPatchContent = [System.IO.File]::ReadAllText($aiTypoAuditPatch, [System.Text.Encoding]::UTF8)
$aiPixelPerfectPatchContent = [System.IO.File]::ReadAllText($aiPixelPerfectPatch, [System.Text.Encoding]::UTF8)
$skewTransformPatchContent = [System.IO.File]::ReadAllText($skewTransformPatch, [System.Text.Encoding]::UTF8)
$cornerRadiusAdjustPatchContent = [System.IO.File]::ReadAllText($cornerRadiusAdjustPatch, [System.Text.Encoding]::UTF8)
$buttonTextAutoSizePatchContent = [System.IO.File]::ReadAllText($buttonTextAutoSizePatch, [System.Text.Encoding]::UTF8)
$selectAllTextPatchContent = [System.IO.File]::ReadAllText($selectAllTextPatch, [System.Text.Encoding]::UTF8)
$selectColorMatchesPatchContent = [System.IO.File]::ReadAllText($selectColorMatchesPatch, [System.Text.Encoding]::UTF8)
$textLineHeightAdjustPatchContent = [System.IO.File]::ReadAllText($textLineHeightAdjustPatch, [System.Text.Encoding]::UTF8)
$unlockLockedLayersPatchContent = [System.IO.File]::ReadAllText($unlockLockedLayersPatch, [System.Text.Encoding]::UTF8)
$detachLinkedComponentsPatchContent = [System.IO.File]::ReadAllText($detachLinkedComponentsPatch, [System.Text.Encoding]::UTF8)
$autoLayoutOffPatchContent = [System.IO.File]::ReadAllText($autoLayoutOffPatch, [System.Text.Encoding]::UTF8)
$deleteHiddenLayersPatchContent = [System.IO.File]::ReadAllText($deleteHiddenLayersPatch, [System.Text.Encoding]::UTF8)
$clearFrameGuidesPatchContent = [System.IO.File]::ReadAllText($clearFrameGuidesPatch, [System.Text.Encoding]::UTF8)
$splitLongFramePatchContent = [System.IO.File]::ReadAllText($splitLongFramePatch, [System.Text.Encoding]::UTF8)
$copyPrototypeLinkPatchContent = [System.IO.File]::ReadAllText($copyPrototypeLinkPatch, [System.Text.Encoding]::UTF8)
$aiColorExtractPatchContent = [System.IO.File]::ReadAllText($aiColorExtractPatch, [System.Text.Encoding]::UTF8)
$aiImageSharedBridgePatchContent = [System.IO.File]::ReadAllText($aiImageSharedBridgePatch, [System.Text.Encoding]::UTF8)
$originalImageDownloadPatchContent = ""
if ($hasOriginalImageDownloadPatch) {
  $originalImageDownloadPatchContent = [System.IO.File]::ReadAllText($originalImageDownloadPatch, [System.Text.Encoding]::UTF8)
}
$patchedRuntimeParts = @(
  $bundle,
  $importPatch,
  $exportPatchContent,
  $shapeLayerExportPatchContent,
  $aiSettingsPatchContent,
  $pigmaWebIntegrationPatchContent,
  $aiResponsiveMemoryPatchContent,
  $aiResponsivePairAnalyzerPatchContent,
  $aiLlmClientPatchContent,
  $aiAccessibilityDiagnosisPatchContent,
  $aiDesignConsistencyPatchContent,
  $aiTypoAuditPatchContent,
  $aiPixelPerfectPatchContent,
  $skewTransformPatchContent,
  $cornerRadiusAdjustPatchContent,
  $buttonTextAutoSizePatchContent,
  $selectAllTextPatchContent,
  $selectColorMatchesPatchContent,
  $textLineHeightAdjustPatchContent,
  $unlockLockedLayersPatchContent,
  $detachLinkedComponentsPatchContent,
  $autoLayoutOffPatchContent,
  $deleteHiddenLayersPatchContent,
  $clearFrameGuidesPatchContent,
  $splitLongFramePatchContent,
  $copyPrototypeLinkPatchContent,
  $aiColorExtractPatchContent,
  $aiImageSharedBridgePatchContent
)

if ($hasOriginalImageDownloadPatch -and $originalImageDownloadPatchContent.Trim().Length -gt 0) {
  $patchedRuntimeParts += $originalImageDownloadPatchContent
}

$patchedRuntimeParts += $aiDesignChatPatchContent

[System.IO.File]::WriteAllText($destination, [string]::Join("`r`n", $patchedRuntimeParts), $utf8NoBom)

& node $uiExternalizer $destination
if ($LASTEXITCODE -ne 0) {
  throw "Failed to externalize embedded UI in $destination"
}

& node $uiVerifier $destination
if ($LASTEXITCODE -ne 0) {
  throw "UI externalization verification failed for $destination"
}

& node $textGuardVerifier
if ($LASTEXITCODE -ne 0) {
  throw "Text import guard verification failed."
}

& node $textExportGuardVerifier
if ($LASTEXITCODE -ne 0) {
  throw "Text export guard verification failed."
}

& node $textHighlightBoundsVerifier
if ($LASTEXITCODE -ne 0) {
  throw "Text highlight bounds verification failed."
}

& node $exportBoundaryVerifier
if ($LASTEXITCODE -ne 0) {
  throw "PSD export boundary verification failed."
}

& node $shapeLayerExportVerifier
if ($LASTEXITCODE -ne 0) {
  throw "PSD shape layer export verification failed."
}

& node -c $destination
if ($LASTEXITCODE -ne 0) {
  throw "Generated bundle syntax check failed for $destination."
}
