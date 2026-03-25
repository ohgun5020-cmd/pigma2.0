$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root "code.js"
$patch = Join-Path $root "psd-import-text-fix.js"
$exportPatch = Join-Path $root "psd-export-boundary.js"
$aiSettingsPatch = Join-Path $root "ai-settings-storage.js"
$aiLlmClientPatch = Join-Path $root "ai-llm-client.js"
$aiDesignReadPatch = Join-Path $root "ai-design-read.js"
$aiAccessibilityDiagnosisPatch = Join-Path $root "ai-accessibility-diagnosis.js"
$aiDesignConsistencyPatch = Join-Path $root "ai-design-consistency.js"
$aiRegroupRenamePatch = Join-Path $root "ai-regroup-rename.js"
$aiTypoAuditPatch = Join-Path $root "ai-typo-audit.js"
$aiPixelPerfectPatch = Join-Path $root "ai-pixel-perfect.js"
$deleteHiddenLayersPatch = Join-Path $root "delete-hidden-layers.js"
$destination = Join-Path $root "code.patched.js"
$uiSource = Join-Path $root "ui.html"
$uiExternalizer = Join-Path $root "externalize-embedded-ui.js"
$uiVerifier = Join-Path $root "verify-externalized-ui.js"
$textGuardContract = Join-Path $root "text-import-guard.contract.json"
$textGuardVerifier = Join-Path $root "verify-text-import-guard.js"
$textExportGuardContract = Join-Path $root "text-export-guard.contract.json"
$textExportGuardVerifier = Join-Path $root "verify-text-export-guard.js"
$exportBoundaryContract = Join-Path $root "psd-export-boundary.contract.json"
$exportBoundaryVerifier = Join-Path $root "verify-psd-export-boundary.js"
$figmaRuntimeSyntaxVerifier = Join-Path $root "verify-figma-runtime-syntax.js"
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

if (-not (Test-Path $aiSettingsPatch)) {
  throw "Missing AI settings patch: $aiSettingsPatch"
}

if (-not (Test-Path $aiLlmClientPatch)) {
  throw "Missing AI LLM client patch: $aiLlmClientPatch"
}

if (-not (Test-Path $aiDesignReadPatch)) {
  throw "Missing AI design read patch: $aiDesignReadPatch"
}

if (-not (Test-Path $aiAccessibilityDiagnosisPatch)) {
  throw "Missing AI accessibility diagnosis patch: $aiAccessibilityDiagnosisPatch"
}

if (-not (Test-Path $aiDesignConsistencyPatch)) {
  throw "Missing AI design consistency patch: $aiDesignConsistencyPatch"
}

if (-not (Test-Path $aiRegroupRenamePatch)) {
  throw "Missing AI regroup/rename patch: $aiRegroupRenamePatch"
}

if (-not (Test-Path $aiTypoAuditPatch)) {
  throw "Missing AI typo audit patch: $aiTypoAuditPatch"
}

if (-not (Test-Path $aiPixelPerfectPatch)) {
  throw "Missing AI pixel perfect patch: $aiPixelPerfectPatch"
}

if (-not (Test-Path $deleteHiddenLayersPatch)) {
  throw "Missing hidden layer delete patch: $deleteHiddenLayersPatch"
}

if (-not (Test-Path $uiSource)) {
  throw "Missing UI source: $uiSource"
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

if (-not (Test-Path $exportBoundaryContract)) {
  throw "Missing export boundary contract: $exportBoundaryContract"
}

if (-not (Test-Path $exportBoundaryVerifier)) {
  throw "Missing export boundary verifier: $exportBoundaryVerifier"
}

if (-not (Test-Path $figmaRuntimeSyntaxVerifier)) {
  throw "Missing Figma runtime syntax verifier: $figmaRuntimeSyntaxVerifier"
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
  $aiSettingsPatch,
  $aiLlmClientPatch,
  $aiDesignReadPatch,
  $aiAccessibilityDiagnosisPatch,
  $aiDesignConsistencyPatch,
  $aiRegroupRenamePatch,
  $aiTypoAuditPatch,
  $aiPixelPerfectPatch,
  $deleteHiddenLayersPatch
)

& node $figmaRuntimeSyntaxVerifier @runtimeSyntaxSourceFiles
if ($LASTEXITCODE -ne 0) {
  throw "Figma runtime syntax verification failed for source patches."
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

function Collapse-RepeatedSnippetBeforeMarker {
  param(
    [string]$Text,
    [string]$Snippet,
    [string]$Marker
  )

  $pattern = '(?:' + [regex]::Escape($Snippet) + '){2,}(?=' + [regex]::Escape($Marker) + ')'
  return [regex]::Replace($Text, $pattern, $Snippet)
}

$bundle = [System.IO.File]::ReadAllText($source, [System.Text.Encoding]::UTF8)

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
function tr(e){return B(b({},e),{summary:w(P.locale,e.summary),detail:w(P.locale,e.detail),warnings:e.warnings.map(t=>w(P.locale,t))})}function buildSelectionPreviewEmptyState(e){return{ok:!1,state:{ready:!1,selectionId:null,selectionCount:0,selectionName:"",selectionType:null,summary:"Select one or more frames, groups, or layers to export.",detail:e.textExportMode==="rasterize-text"?"Text export is currently set to rasterize text, so text layers will export as bitmap layers until you change the export defaults.":"The exporter keeps editable text where possible, and multiple selected roots are packaged into a ZIP archive.",documentWidth:null,documentHeight:null,exportNodeCount:0,editableTextCount:0,preservedGroupCount:0,warnings:[],analysisPending:!1}}}function isSelectionPreviewHeavy(e){let t=xe(e);if(t){let r=d(t.width),o=d(t.height);if(o>=Do||r*o>=vo)return!0}if(!V(e)||e.children.length===0)return!1;let n=[e],i=0;for(;n.length>0;){let a=n.pop();if(i+=1,i>400)return!0;if(!V(a))continue;let s=a.children;if(!s||s.length===0)continue;if(s.length>120)return!0;for(let l=0;l<s.length;l+=1){let u=s[l];he(u)&&n.push(u)}}return!1}function shouldUseQuickSelectionPreview(e){if(e.length===0)return!1;for(let t=0;t<e.length;t+=1)if(isSelectionPreviewHeavy(e[t]))return!0;return!1}function buildQuickSelectionResolution(){let e=figma.currentPage.selection,t=Tt(P.exportSettings),r=Jo(e,t);if(selectionPreviewCache&&selectionPreviewCache.cacheKey===r)return selectionPreviewCache.resolution;if(e.length===0){let y=buildSelectionPreviewEmptyState(t);return selectionPreviewCache={cacheKey:r,resolution:y},y}let o=[],n=[],i=!1;for(let y=0;y<e.length;y+=1){let m=e[y];if(!he(m)){let T={ok:!1,state:Ye(e,m,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};return selectionPreviewCache={cacheKey:r,resolution:T},T}let C=xe(m);if(!C){let T={ok:!1,state:Ye(e,m,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};return selectionPreviewCache={cacheKey:r,resolution:T},T}o.push(m),n.push(C),!i&&isSelectionPreviewHeavy(m)&&(i=!0)}let a=o[0],s=o.length,l=n[0],u=i?"Large selection detected. Pigma is showing a lightweight preview first to keep Figma responsive. Full layer analysis runs when export starts.":s===1?"Editable text is preserved when fills and typography are compatible. Hidden layers can be ignored or included as hidden PSD layers.":"Each selected root is exported as its own PSD file. When more than one file is ready, the download is packaged as a ZIP archive.",c=i?["Large selection detected. Detailed layer counts will load when export starts."]:[],p={ready:!0,selectionId:s===1?a.id:null,selectionCount:s,selectionName:no(o),selectionType:io(o),summary:s===1?'"'.concat(f(a),'" is ready to export.'):"".concat(s," roots selected and ready to export."),detail:u,documentWidth:s===1?d(l.width):null,documentHeight:s===1?d(l.height):null,exportNodeCount:s,editableTextCount:0,preservedGroupCount:0,warnings:c,analysisPending:i},g={ok:!0,nodes:o,state:p};return selectionPreviewCache={cacheKey:r,resolution:g},g}function buildStartupSelectionResolution(){let e=figma.currentPage.selection,t=Tt(P.exportSettings);if(e.length===0)return buildSelectionPreviewEmptyState(t);let r=[],o=[],n=null;for(let i=0;i<e.length;i+=1){let a=e[i];if(!he(a)){n={ok:!1,state:Ye(e,a,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};break}let s=xe(a);if(!s){n={ok:!1,state:Ye(e,a,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};break}r.push(a),o.push(s)}if(n)return n;let i=r[0],a=r.length,s=o[0];return{ok:!0,nodes:r,state:{ready:!0,selectionId:a===1?i.id:null,selectionCount:a,selectionName:no(r),selectionType:io(r),summary:a===1?'"'.concat(f(i),'" is ready to export.'):"".concat(a," roots selected and ready to export."),detail:"Startup preview keeps the selection summary lightweight. Full layer analysis runs when export starts or when the selection changes.",documentWidth:a===1?d(s.width):null,documentHeight:a===1?d(s.height):null,exportNodeCount:a,editableTextCount:0,preservedGroupCount:0,warnings:["Detailed layer counts are deferred until export starts or the selection changes."],analysisPending:!0}}}function selectionResolutionForUi(){let e=figma.currentPage.selection;return shouldUseQuickSelectionPreview(e)?buildQuickSelectionResolution():rr()}function rr(){
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

$selectionPreviewDispatchFind = 'function Ee(){let e=rr();N({type:"selection-state",state:tr(e.state)})}function le(){Qt+=1,F=null}'
$selectionPreviewDispatchReplace = 'function Ee(){let e=selectionResolutionForUi();N({type:"selection-state",state:tr(e.state)})}function le(){Qt+=1,F=null,selectionPreviewCache=null}'
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
$startupPreviewRequestReplace = 'async function Go(e){var t,r;if(e.type==="request-preferences"){await zo(e.detectedLocale),Ot(),r=buildStartupSelectionResolution(),N({type:"selection-state",state:tr(r.state)});return}if(e.type==="update-preferences"){await _o(e.preferences),Ot(),Ee();return}if(e.type==="request-selection-sync"){Ee();return}'
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

# Stroke-only vectors can still clip when exporting the cloned node directly
# because Figma rasterizes against the node geometry before the visual stroke
# extent is fully represented. Export them through a temporary crop frame that
# matches the chosen preview bounds instead.
$bundle = Replace-Exact `
  -Text $bundle `
  -Find 'async function $r(e,t,r,o){await dt(e);let n=e.clone();try{return Oe(n,o),bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}finally{n.removed||n.remove()}}' `
  -Replace 'async function $r(e,t,r,o){await dt(e);let n=e.clone(),i=null,a=Re(e)?Nr(e):null,s=Re(e)&&!!me(e)&&!(a!=null&&a.fill)&&"relativeTransform"in n;try{return Oe(n,o),s?(i=figma.createFrame(),i.resize(Math.max(1,d(t.width)),Math.max(1,d(t.height))),i.clipsContent=!0,i.fills=[],i.strokes=[],i.name="__pigma-vector-preview__",i.x=t.x,i.y=t.y,figma.currentPage.appendChild(i),i.appendChild(n),Vr(e,n,t),await i.exportAsync({format:"PNG",useAbsoluteBounds:!1})):(bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds}))}finally{i&&!i.removed&&i.remove(),n.removed||n.remove()}}' `
  -ExpectedCount 1 `
  -Label 'stroke-only vector crop-frame export'

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
  -Find 'function An(e,t,r){if(fe(e))return null;let o=Di(e);if(!o)return null;let n=Fr(e,t);return!n||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:n.x,y:n.y,width:n.width,height:n.height,nodeTransform:null,shape:n,fill:o.fill,stroke:o.stroke}}' `
  -Replace 'function An(e,t,r){if(fe(e))return null;let o=Di(e),n=oa(e),i=n&&((n.normalizePaintOpacity===!0)||(n.normalizePaintBlendMode===!0))?n:null;if(!o)return null;let a=Fr(e,t);return!a||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:i?i.effectiveOpacity:1,visible:!0,blendMode:at(i?i.effectiveBlendMode:"normal"),effects:null,strokeEffect:null,x:a.x,y:a.y,width:a.width,height:a.height,nodeTransform:null,shape:a,fill:o.fill,stroke:o.stroke}}' `
  -ExpectedCount 1 `
  -Label 'background shape fill blend promotion'

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
$editableTextParagraphRunsHelper = 'function editableTextParagraphRuns(e,t){let r=(e||"").replace(/\\r\\n?/g,"\\n").split("\\n"),o=[];for(let n=0;n<r.length;n++){let i=r[n],a=i.length+(n<r.length-1?1:0);a>0&&o.push({length:a,style:{justification:t}})}return o}'
$editableTextEngineMetadataReplacement = $editableTextParagraphRunsHelper + 'function g1(e){let t=E1(e),n=w1(e,t),r=ym(e),i=yh(e.text.bounds,r),a=yh(e.text.boundingBox,r),o=e.text.boxBounds?bm(e,i):null,s=v1(e,n,i,a,o),l=editableTextParagraphRuns(e.text.value,e.text.justification),u={text:e.text.value,transform:n,antiAlias:"smooth",orientation:"horizontal",gridding:"none",useFractionalGlyphWidths:!0,left:s.layerBounds.left,top:s.layerBounds.top,right:s.layerBounds.right,bottom:s.layerBounds.bottom,bounds:{left:{value:s.textBounds.left,units:"Pixels"},top:{value:s.textBounds.top,units:"Pixels"},right:{value:s.textBounds.right,units:"Pixels"},bottom:{value:s.textBounds.bottom,units:"Pixels"}},boundingBox:{left:{value:s.boundingBox.left,units:"Pixels"},top:{value:s.boundingBox.top,units:"Pixels"},right:{value:s.boundingBox.right,units:"Pixels"},bottom:{value:s.boundingBox.bottom,units:"Pixels"}},paragraphStyle:{justification:e.text.justification},paragraphStyleRuns:l,style:kh(e.text.baseStyle,t.boxBaselineShift),styleRuns:e.text.styleRuns.map(c=>({length:c.length,style:kh(c.style,t.boxBaselineShift)}))};return u.shapeType=e.text.shapeType,e.text.pointBase&&(u.pointBase=e.text.pointBase.slice()),o&&(u.boxBounds=o),u}'
$editableTextPreflightSerializeCallLegacy = 'Il.serializeEngineData(qf.encodeEngineData(T.text))'
$editableTextPreflightSerializeCallFixed = 'Ff().serializeEngineData(Vf().encodeEngineData(T.text))'
$editableTextPreflightLegacyFind = 'if(t&&v.kind==="text"&&(T.text=g1(v),k&&!d.disableEditableTextPreview&&(T.canvas=k)),Wn(T,v.effects,v.strokeEffect),P){if(!k)throw new Error("Procedural text effects require a decoded preview canvas.");let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m()'
$editableTextPreflightGuardedFind = 'if(t&&v.kind==="text"){try{T.text=g1(v),Il.serializeEngineData(qf.encodeEngineData(T.text)),k&&!d.disableEditableTextPreview&&(T.canvas=k)}catch(M){let B=k;if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextPreflightFixedFind = 'if(t&&v.kind==="text"){try{T.text=g1(v),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),Ff().serializeEngineData(Vf().encodeEngineData(T.text)),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),k&&!d.disableEditableTextPreview&&(T.canvas=k)}catch(M){let B=k;typeof ji=="function"&&ji("text-engine-fallback",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,reason:M instanceof Error?M.message:String(M)});if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextPreflightReplace = 'if(t&&v.kind==="text"){try{T.text=g1(v),typeof ji=="function"&&ji("text-engine-preflight",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),Ff().serializeEngineData(Vf().encodeEngineData(T.text)),typeof ji=="function"&&ji("text-engine-encoded",{layerName:v.name,paragraphRunCount:T.text.paragraphStyleRuns?T.text.paragraphStyleRuns.length:0,styleRunCount:T.text.styleRuns?T.text.styleRuns.length:0,textLength:T.text.text.length,hasPreviewCanvas:!!k}),k&&!d.disableEditableTextPreview&&(T.canvas=k)}catch(M){let B=k;typeof ji=="function"&&ji("text-engine-fallback",{layerName:v.name,fontFamily:v.text.baseStyle.fontFamily,fontStyle:v.text.baseStyle.fontStyle,shapeType:v.text.shapeType,justification:v.text.justification,reason:M instanceof Error?M.message:String(M)});if(!B){let N=await Xn(v.pngBytes);B=v.kind==="text"?x1(v,N):N}if(!B)throw M;T.text=void 0,T.canvas=B,c.push("\"".concat(Su(v.name),"\" text metadata could not be encoded safely (").concat(M instanceof Error?M.message:String(M),"), so it fell back to a bitmap layer."))}Wn(T,v.effects,v.strokeEffect);if(P){if(!k){if(T.canvas instanceof HTMLCanvasElement)k=T.canvas;else throw new Error("Procedural text effects require a decoded preview canvas.")}let M=await bt(v,T,k,d,o);s.push(M.layer),u.push(...M.linkedFiles),c.push(...M.warnings),m();continue}s.push(T),m();continue}s.push(T),m()'
$editableTextPreflightInstrumentedLegacyFind = $editableTextPreflightReplace.Replace($editableTextPreflightSerializeCallFixed, $editableTextPreflightSerializeCallLegacy)
$editableTextFallbackSummaryFind = 'if(jo&&(D.backgroundDebug=e.backgroundDebug.concat(s.backgroundDebug)),ji("children-built",{rootName:e.rootName,childLayerCount:s.children.length,warningCount:s.warnings.length,linkedFileCount:s.linkedFiles.length}),i={width:e.documentWidth,height:e.documentHeight,children:s.children},e.compositePngBytes){'
$editableTextFallbackSummaryInstrumentedFind = 'let l1=s.warnings.filter(c=>c.includes("text metadata could not be encoded safely")).length;l1>0&&(typeof ji=="function"&&ji("text-engine-fallback-summary",{rootName:e.rootName,fallbackCount:l1,editableTextCount:e.editableTextCount}),typeof Bt=="function"&&Bt("warning","Text metadata fallback","Bitmap fallback: ".concat(l1," text layer(s)")));if(jo&&(D.backgroundDebug=e.backgroundDebug.concat(s.backgroundDebug)),ji("children-built",{rootName:e.rootName,childLayerCount:s.children.length,warningCount:s.warnings.length,linkedFileCount:s.linkedFiles.length,textMetadataFallbackCount:l1}),i={width:e.documentWidth,height:e.documentHeight,children:s.children},e.compositePngBytes){'
$editableTextFallbackSummaryReplace = 'let l1=s.warnings.filter(c=>c.includes("text metadata could not be encoded safely")).length,m1=function countEditableTextLayers(c){let f=0;for(let d of c)d&&(d.text?f+=1:d.children&&(f+=countEditableTextLayers(d.children)));return f}(s.children),n1=t&&m1>0&&l1===0;l1>0&&(typeof ji=="function"&&ji("text-engine-fallback-summary",{rootName:e.rootName,fallbackCount:l1,editableTextCount:e.editableTextCount,actualTextLayerCount:m1}),typeof Bt=="function"&&Bt("warning","Text metadata fallback","Bitmap fallback: ".concat(l1," text layer(s)")));typeof ji=="function"&&ji("editable-text-build-summary",{rootName:e.rootName,candidateTextLayerCount:e.editableTextCount,actualTextLayerCount:m1,fallbackCount:l1,forcePhotoshopTextRedraw:n1}),typeof Bt=="function"&&e.editableTextCount>0&&Bt("info","Editable text build","PSD text layers: ".concat(m1," / ").concat(e.editableTextCount)),n1&&typeof Bt=="function"&&Bt("info","Photoshop text redraw","Editable text redraw enabled for ".concat(m1," layer(s)"));if(jo&&(D.backgroundDebug=e.backgroundDebug.concat(s.backgroundDebug)),ji("children-built",{rootName:e.rootName,childLayerCount:s.children.length,warningCount:s.warnings.length,linkedFileCount:s.linkedFiles.length,textMetadataFallbackCount:l1,actualTextLayerCount:m1,forcePhotoshopTextRedraw:n1}),i={width:e.documentWidth,height:e.documentHeight,children:s.children},e.compositePngBytes){'
$editableTextInvalidateWriteFind = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:!1,noBackground:!0});'
$editableTextInvalidateWriteReplace = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:n1,noBackground:!0});'
$editableTextRootFallbackFind = 'catch(r){if(e.hasEditableText)try{'
$editableTextRootFallbackReplace = 'catch(r){typeof ji=="function"&&ji("editable-text-build-root-fallback",{rootName:e.rootName,reason:r instanceof Error?r.message:String(r),editableTextCount:e.editableTextCount});typeof Bt=="function"&&e.hasEditableText&&Bt("warning","Editable text PSD fallback","Root bitmap fallback: ".concat(e.rootName));if(e.hasEditableText)try{'
$psdCompositePreviewFind = 'function d1(e){return e.exportPackageMode==="bundle-with-rasters"}'
$psdCompositePreviewReplace = 'function d1(e){return e.exportPackageMode==="bundle-with-rasters"||e.exportPackageMode==="psd-only"}'
$psdThumbnailWriteFind = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:n1,noBackground:!0});'
$psdThumbnailWriteReplace = 'let u=(0,Lh.writePsdUint8Array)(i,{invalidateTextLayers:n1,noBackground:!0,generateThumbnail:!0});'
$psdThumbnailMatteFind = 'function ex(e){var t=(0,Oe.createCanvas)(10,10),n=1;e.width>e.height?(t.width=160,t.height=Math.floor(e.height*(t.width/e.width)),n=t.width/e.width):(t.height=160,t.width=Math.floor(e.width*(t.height/e.height)),n=t.height/e.height);var r=t.getContext("2d");return r.scale(n,n),e.imageData?r.drawImage((0,Oe.imageDataToCanvas)(e.imageData),0,0):e.canvas&&r.drawImage(e.canvas,0,0),t}'
$psdThumbnailMatteReplace = 'function ex(e){var t=(0,Oe.createCanvas)(10,10),n=1;e.width>e.height?(t.width=160,t.height=Math.floor(e.height*(t.width/e.width)),n=t.width/e.width):(t.height=160,t.width=Math.floor(e.width*(t.height/e.height)),n=t.height/e.height);var r=t.getContext("2d");return r.fillStyle="#fff",r.fillRect(0,0,t.width,t.height),r.scale(n,n),e.imageData?r.drawImage((0,Oe.imageDataToCanvas)(e.imageData),0,0):e.canvas&&r.drawImage(e.canvas,0,0),t}'
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
  -Snippet $editableTextParagraphRunsHelper `
  -Marker 'function g1(e){'

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
} elseif ($bundle.Contains($editableTextPreflightFixedFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $editableTextPreflightFixedFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'editable text preflight fallback fixed'
}

if ($uiBundle.Contains('function g1(e){') -and $uiBundle.Contains('function v1(')) {
  $uiBundle = Replace-Section `
    -Text $uiBundle `
    -StartMarker 'function g1(e){' `
    -EndMarker 'function v1(' `
    -Replacement $editableTextEngineMetadataReplacement `
    -Label 'ui editable text engine metadata'
}
$uiBundle = Collapse-RepeatedSnippetBeforeMarker `
  -Text $uiBundle `
  -Snippet $editableTextParagraphRunsHelper `
  -Marker 'function g1(e){'

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
} elseif ($uiBundle.Contains($editableTextPreflightFixedFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextPreflightFixedFind `
    -Replace $editableTextPreflightReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text preflight fallback fixed'
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

if ($uiBundle.Contains($editableTextInvalidateWriteFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextInvalidateWriteFind `
    -Replace $editableTextInvalidateWriteReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text redraw write option'
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

if ($uiBundle.Contains($editableTextRootFallbackFind)) {
  $uiBundle = Replace-Exact `
    -Text $uiBundle `
    -Find $editableTextRootFallbackFind `
    -Replace $editableTextRootFallbackReplace `
    -ExpectedCount 1 `
    -Label 'ui editable text root fallback logging'
}

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
  -Replace 'function oa(e){var u;if(!("fills"in e)||!Array.isArray(e.fills))return null;let t=e.fills.filter(c=>W(c));if(t.length!==1)return null;let r=t[0],o=r.type==="IMAGE"&&!!r.imageHash,n=o?h((u=r.opacity)!=null?u:1,0,1):1,i=o&&!St(n,1),a=!st(r.blendMode);if(!i&&!a)return null;let s="blendMode"in e?e.blendMode:void 0,l=!st(s),c=a,p=c?oe(r.blendMode):K(e),g=l&&c&&K(e)!==p;return{normalizePaintOpacity:i||c&&o,normalizePaintBlendMode:c,effectiveOpacity:o?h(j(e)*n,0,1):j(e),effectiveBlendMode:p,warning:g?''"''.concat(f(e),''" collapses Figma layer/fill blend modes into the fill blend for PSD export.''):null}}' `
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
function pigmaFillOpacity(e){var t;return h((t=e.opacity)!=null?t:1,0,1)}
function pigmaPaintNeedsDedicatedLayer(e){return!st(e.blendMode)||!St(pigmaFillOpacity(e),1)}
function pigmaMultiFillBlendInfo(e,t=null){let r=pigmaVisibleFillEntries(e);if(r.length<2||e.type==="TEXT")return null;let o=te(e,t),n=r.filter(i=>pigmaPaintNeedsDedicatedLayer(i.paint));if(!o&&n.length===0)return null;return{entries:r,mode:o?"baked-fx":"split",warning:o?"\"".concat(f(e),"\" uses multiple visible fills plus unsupported effects, so PSD export kept separate fill layers and added one baked effects layer."):"\"".concat(f(e),"\" uses multiple visible fills with blend or opacity overrides, so PSD export split them into separate child layers.")}}
function pigmaFillBlendMode(e){return at(!st(e.blendMode)?oe(e.blendMode):"normal")}
function pigmaFillChildName(e,t,r,o){return r?o==="background"?"Background Fill ".concat(t+1):"".concat(f(e)," Fill ").concat(t+1):o==="background"?"Background":f(e)}
function pigmaFxChildName(e,t){return t==="background"?"Background Effects":"Effects"}
function pigmaBaseFillBounds(e,t=null){let r=k(e);if(r&&r.width>0&&r.height>0)return{x:r.x,y:r.y,width:r.width,height:r.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let o=ce(e);if(o)return{x:o.x,y:o.y,width:o.width,height:o.height,useAbsoluteBounds:!0}}return t!=null?t:v(e)}
function pigmaIsolateFillOnClone(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map((n,i)=>i===t?B(b({},n),{blendMode:"NORMAL",opacity:1,visible:!0}):B(b({},n),{blendMode:"NORMAL",opacity:1,visible:!1}))}
function pigmaHideAllFillsOnClone(e){if(!("fills"in e)||!Array.isArray(e.fills))return;let t=e,r=e.fills;t.fills=r.map(o=>B(b({},o),{blendMode:"NORMAL",opacity:1,visible:!1}))}
async function pigmaExportFillBitmapChild(e,t,r,o,n,i,a,s="node"){let l=e.clone();try{pigmaIsolateFillOnClone(l,o.index),s==="background"&&"children"in l&&Ii(l),Oe(l,a),bt(l,r);let u=x(r.x-t.documentBounds.x),c=x(r.y-t.documentBounds.y),p=d(r.width),g=d(r.height);return{kind:"bitmap",id:"".concat(e.id,":").concat(s==="background"?"background-fill":"fill",":").concat(o.index+1),name:pigmaFillChildName(e,n,i,s),sourceType:"".concat(e.type,s==="background"?"_BACKGROUND_FILL":"_FILL"),opacity:pigmaFillOpacity(o.paint),visible:!0,blendMode:pigmaFillBlendMode(o.paint),effects:null,strokeEffect:null,x:u,y:c,width:p,height:g,nodeTransform:de(e,t.documentBounds,u,c),pngBytes:await l.exportAsync({format:"PNG",useAbsoluteBounds:r.useAbsoluteBounds})}}finally{l.removed||l.remove()}}
async function pigmaExportFxBitmapChild(e,t,r,o,n="node"){let i=e.clone();try{pigmaHideAllFillsOnClone(i),n==="background"&&"children"in i&&Ii(i),Oe(i,o),bt(i,r);let a=x(r.x-t.documentBounds.x),s=x(r.y-t.documentBounds.y),l=d(r.width),u=d(r.height);return{kind:"bitmap",id:"".concat(e.id,":").concat(n==="background"?"background-fx":"fx"),name:pigmaFxChildName(e,n),sourceType:"".concat(e.type,n==="background"?"_BACKGROUND_FX":"_FX"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:a,y:s,width:l,height:u,nodeTransform:de(e,t.documentBounds,a,s),pngBytes:await i.exportAsync({format:"PNG",useAbsoluteBounds:r.useAbsoluteBounds})}}finally{i.removed||i.remove()}}
async function pigmaExportMultiFillGroup(e,t,r,o=null){let n=pigmaMultiFillBlendInfo(e,t.root);if(!n||t.longFrameMode)return null;let i=o!=null?o:tt(e),a=n.mode==="baked-fx"?tt(e):i,s=n.mode==="baked-fx"?pigmaBaseFillBounds(e,i):i;if(!a||!s)return null;let l=L(e,t.root);if(n.mode!=="baked-fx"&&progressiveBlurShouldRasterize(l))return null;let u=me(e),c=null,p=null,g={removeSupportedStroke:!!u},y=[];t.currentLeaf+=1,Y(t,f(e)),await dt(e),n.mode==="baked-fx"?g.removeAllEffects=!0:(c=await hr(e,t,r),p=c.effects,g.removeSupportedEffects=c.removeSupportedEffects||!!_(p));for(let m=0;m<n.entries.length;m+=1){let T=await pigmaExportFillBitmapChild(e,t,s,n.entries[m],m,n.entries.length>1,g,"node");T&&y.push(T)}if(n.mode==="baked-fx"){let m=await pigmaExportFxBitmapChild(e,t,a,{removeSupportedStroke:!!u},"node");m&&y.push(m)}let d=n.entries.length+(n.mode==="baked-fx"?1:0);return y.length<d?null:(n.warning&&t.warnings.add(n.warning),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:n.mode==="baked-fx"?null:p,strokeEffect:u,mask:null,children:y})}
async function pigmaExportMultiFillBackgroundGroup(e,t,r){let o=pigmaMultiFillBlendInfo(e,t.root);if(!o||t.longFrameMode||!Ln(e)||!Ur(e))return null;let n=Fn(e),i=o.mode==="baked-fx"?tt(e):n;if(!n||!i)return null;let a=L(e,t.root);if(o.mode!=="baked-fx"&&progressiveBlurShouldRasterize(a))return null;let s=me(e),l=null,u=null,c={removeSupportedStroke:!!s},p=[];t.currentLeaf+=1,Y(t,"".concat(f(e)," Background")),await dt(e),o.mode==="baked-fx"?c.removeAllEffects=!0:(l=Hi(a),u=Vi(a),c.removeSupportedEffects=!!a);for(let g=0;g<o.entries.length;g+=1){let y=await pigmaExportFillBitmapChild(e,t,n,o.entries[g],g,o.entries.length>1,c,"background");y&&p.push(y)}if(o.mode==="baked-fx"){let g=await pigmaExportFxBitmapChild(e,t,i,{removeSupportedStroke:!!s},"background");g&&p.push(g)}let d=o.entries.length+(o.mode==="baked-fx"?1:0);return p.length<d?null:(o.warning&&t.warnings.add(o.warning),{backgroundLayer:{kind:"group",id:"".concat(e.id,":background-stack"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_GROUP"),opacity:1,visible:!0,blendMode:"normal",effects:o.mode==="baked-fx"?null:l,strokeEffect:s,mask:null,children:p},groupEffects:o.mode==="baked-fx"?null:u,groupStrokeEffect:null})}
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
  -Replace 'function Nr(e){if(re(e)||te(e)||fe(e))return{strategy:"smart-object",fill:null};let t=Ti(e);return t?{strategy:"shape",fill:t}:{strategy:"smart-object",fill:null}}' `
  -ExpectedCount 1 `
  -Label 'filled shape strategy keeps supported strokes'

$shapeVectorPreviewFind = 'if(e.strategy==="shape"&&!l&&e.fill&&!c&&u)try{let f=sw(e,s,t,n),d=await bt(e,f,s,i,a);return{layer:d.layer,linkedFiles:d.linkedFiles,warnings:d.warnings}}catch(f){}'
$shapeVectorPreviewReplace = 'if(e.strategy==="shape"&&!l&&e.fill&&!c&&u)try{let f=Sh(e,i),d=sw(e,f?s:null,t,n),p=f?await bt(e,d,s,i,a):{layer:d,linkedFiles:[],warnings:[]};return{layer:p.layer,linkedFiles:p.linkedFiles,warnings:p.warnings}}catch(f){}'
if ($bundle.Contains($shapeVectorPreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $shapeVectorPreviewFind `
    -Replace $shapeVectorPreviewReplace `
    -ExpectedCount 1 `
    -Label 'shape vector preview canvas gate'
} elseif ($bundle.Contains($shapeVectorPreviewReplace)) {
  # Already patched in this bundle variant.
} else {
  # Shape vector preview canvas gate changed in this bundle variant.
}

$conditionalShapePreviewFind = 'function sw(e,t,n,r){if(!e.fill)throw new Error("Shape vector export requires a supported fill.");let i=Aw(bw(e.svgString,e.width,e.height),e.x,e.y,n,r);if(i.length===0)throw new Error("The SVG did not contain any shape paths.");let a={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),fillOpacity:Em(e.fill),canvas:t,vectorFill:Dm(e.fill,e.width,e.height,e.nodeTransform),vectorMask:{paths:i}};return Wn(a,e.effects,e.strokeEffect),a}'
$conditionalShapePreviewReplace = 'function sw(e,t,n,r){if(!e.fill)throw new Error("Shape vector export requires a supported fill.");let i=Aw(bw(e.svgString,e.width,e.height),e.x,e.y,n,r);if(i.length===0)throw new Error("The SVG did not contain any shape paths.");let a={name:e.name,left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height,opacity:e.opacity,hidden:!e.visible,blendMode:wr(e.blendMode),fillOpacity:Em(e.fill),vectorFill:Dm(e.fill,e.width,e.height,e.nodeTransform),vectorMask:{paths:i}};return t&&(a.canvas=t),Wn(a,e.effects,e.strokeEffect),a}'
if ($bundle.Contains($conditionalShapePreviewFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $conditionalShapePreviewFind `
    -Replace $conditionalShapePreviewReplace `
    -ExpectedCount 1 `
    -Label 'conditional shape vector preview canvas'
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
  -Replace 'async function Jn(e,t){if(O.forceBitmapVectorPreview)return null;let r=ft(e);if(!r)return null;let o=L(e,t.root),n=_(o),i=me(e),a=Nr(e),s=oa(e),l="fills"in e&&Array.isArray(e.fills)?e.fills.some(W):!1,u=(e.type==="LINE"||e.type==="VECTOR")&&!!i&&!l;if(u)return null;let c=!!i&&!(a!=null&&a.fill)&&!I(e)?Math.max(3,Math.ceil(i.width/2)+2):0,p=c?{x:r.x-c,y:r.y-c,width:r.width+c*2,height:r.height+c*2,useAbsoluteBounds:!1}:r,g=await Me(e,t,o||i||n||s?p:void 0,o||i||n||s?{normalizePaintOpacity:(s==null?void 0:s.normalizePaintOpacity)===!0,normalizePaintBlendMode:(s==null?void 0:s.normalizePaintBlendMode)===!0,removeSupportedEffects:!0,removeSupportedStroke:!!i&&!!a.fill}:void 0);if(!g)return null;let y=x(r.x-t.documentBounds.x),m=x(r.y-t.documentBounds.y),T=d(r.width),C=d(r.height),E=x(g.x-y),R=x(g.y-m),N="";try{N=await e.exportAsync({format:"SVG_STRING",useAbsoluteBounds:r.useAbsoluteBounds,svgOutlineText:!0,svgIdAttribute:!0,svgSimplifyStroke:!1})}catch(F){return null}if(!N||N.trim().length===0)return null;return{kind:"vector",id:e.id,name:f(e),sourceType:e.type,opacity:s?s.effectiveOpacity:j(e),visible:e.visible,blendMode:at(s?s.effectiveBlendMode:K(e)),effects:o,strokeEffect:a.fill?i:null,x:y,y:m,width:T,height:C,nodeTransform:de(e,t.documentBounds,y,m),pngBytes:g.pngBytes,strategy:a.strategy,svgString:N,fill:a.fill,previewOffsetX:E,previewOffsetY:R}}' `
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
  -Replace 'function progressiveBlurShouldRasterize(e){let t=_(e);return!!t&&t.blurType==="PROGRESSIVE"}function _(e){let t=Kr(e);return t&&zi(t)>0?t:null}' `
  -ExpectedCount 1 `
  -Label 'progressive blur bitmap helper'

# Figma incremental mode now requires loadAllPagesAsync() before registering a
# documentchange handler. Keep startup immediate, then enable document tracking
# asynchronously only when that preload succeeds.
$documentChangeBootstrapFind = 'figma.on("selectionchange",()=>{vt()});figma.on("currentpagechange",()=>{vt(!0)});figma.on("documentchange",()=>{figma.currentPage.selection.length>0&&vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};vt(!0);'
$documentChangeBootstrapReplace = 'figma.on("selectionchange",()=>{vt()});figma.on("currentpagechange",()=>{vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};async function initDocumentChangeTracking(){if(typeof figma.loadAllPagesAsync!="function")return;try{await figma.loadAllPagesAsync(),figma.on("documentchange",()=>{figma.currentPage.selection.length>0&&vt(!0)})}catch(e){console.warn("[pigma] documentchange tracking disabled:",e)}}initDocumentChangeTracking();'
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
$startupBootstrapReplace = 'figma.on("selectionchange",()=>{vt()});figma.on("currentpagechange",()=>{vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};'
if ($bundle.Contains($startupBootstrapFind)) {
  $bundle = Replace-Exact `
    -Text $bundle `
    -Find $startupBootstrapFind `
    -Replace $startupBootstrapReplace `
    -ExpectedCount 1 `
    -Label 'startup bootstrap without eager selection sync'
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
  -Label 'progressive blur raster path in main export walker'

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
  -Replacement 'async function qn(e,t,r=null){var g,y;let o=oa(e),n=e.type==="TEXT"?Gi(e,t.documentBounds):null,i=(g=n!=null?n:tt(e))!=null?g:v(e),a=o!=null&&o.warning?o.warning:null;if(a&&t.warnings.add(a),!t.longFrameMode){let T=await pigmaExportMultiFillGroup(e,t,r,i);if(T)return T}if(t.longFrameMode&&i&&pe(e)&&De(i)){t.currentLeaf+=1,Y(t,f(e));let T=await pt(e,i,{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0});return t.warnings.add(Te(f(e),T.length)),Be(e.id,f(e),e.type,o?o.effectiveOpacity:j(e),e.visible,at(o?o.effectiveBlendMode:K(e)),T)}let s=await hr(e,t,r),l=s.effects,u=_(l),c=me(e),p=progressiveBlurShouldRasterize(l),d=Re(e)?Nr(e):null,m=(e.type==="LINE"||e.type==="VECTOR")&&!!c&&!(d!=null&&d.fill),h=o||l||c||u?p?{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0}:{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0,removeSupportedEffects:s.removeSupportedEffects||!!u,removeSupportedStroke:!!c&&!m}:void 0,Bounds=p?(n!=null?n:v(e)):n!=null?n:(o||l||c||u)&&(y=tt(e))!=null?y:void 0;p&&t.warnings.add(''"''.concat(f(e),''" kept its progressive blur as a bitmap layer for closer Photoshop matching.''));let E=n&&e.type==="TEXT"?await Qn(e,t,n,h):await Me(e,t,Bounds,h);return E?{kind:"bitmap",id:e.id,name:f(e),sourceType:e.type,opacity:o?o.effectiveOpacity:j(e),visible:e.visible,blendMode:at(o?o.effectiveBlendMode:K(e)),effects:p?null:l,strokeEffect:p||m?null:c,x:E.x,y:E.y,width:E.width,height:E.height,nodeTransform:de(e,t.documentBounds,E.x,E.y),pngBytes:E.pngBytes}:null}' `
  -Label 'progressive blur bitmap flatten export'

$bundle = Replace-Section `
  -Text $bundle `
  -StartMarker 'async function ct(' `
  -EndMarker 'async function Cn(' `
  -Replacement 'async function ct(e,t,r=null){var i,a,s;if(t.hiddenLayerMode==="ignore-hidden"&&!q(e))return null;let o=e.type==="TEXT"?await Hn(e):null;if(o&&!o.ok)return t.warnings.add(o.reason),await Cn(e,t);let n=Fe(e);if(n==="group"){let l=e,u=await gr(l,t,(i=Ut(l))!=null?i:r);if(u.length>0)return t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(l,t.documentBounds,t.root),children:u}}if(n==="split"){let l=await kn(e,t,(a=Ut(e))!=null?a:r);if(l)return t.preservedGroupCount+=1,l;let u=await gr(e,t,r);if(u.length>0)return t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it preserved the child layers without a synthetic background.")),t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:u};t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it was flattened."))}if(progressiveBlurShouldRasterize(L(e,t.root)))return await qn(e,t,r);if(e.type==="TEXT"&&t.settings.textExportMode!=="rasterize-text"){let l=await Gn(e,t,r);if(l)return _(l.effects)||(t.editableTextCount+=1),l}if(Re(e)){let l=(s=ft(e))!=null?s:v(e),u=!t.longFrameMode?await pigmaExportMultiFillGroup(e,t,r,l):null;if(u)return t.preservedGroupCount+=1,u;if(t.longFrameMode&&!!l&&Ne(d(l.width),d(l.height),!1))t.warnings.add(jo(f(e)));else{let c=await Jn(e,t);if(c)return c;t.warnings.add("\"".concat(f(e),"\" could not keep its SVG/vector data, so it fell back to a bitmap layer."))}}if(V(e)&&e.children.length>0){let l=L(e);_(l)?t.warnings.add(Mr(e,"past")):ze(e)?t.warnings.add(Ir(e,"past")):$e(l)?t.warnings.add(Rr(e,"past")):Pt(l)?t.warnings.add(Ar(e,"past")):t.warnings.add(Br(e,"past"))}return await qn(e,t,r)}' `
  -Label 'multi-fill group preempts vector export'

$importPatch = [System.IO.File]::ReadAllText($patch, [System.Text.Encoding]::UTF8)
$exportPatchContent = [System.IO.File]::ReadAllText($exportPatch, [System.Text.Encoding]::UTF8)
$aiSettingsPatchContent = [System.IO.File]::ReadAllText($aiSettingsPatch, [System.Text.Encoding]::UTF8)
$aiLlmClientPatchContent = [System.IO.File]::ReadAllText($aiLlmClientPatch, [System.Text.Encoding]::UTF8)
$aiDesignReadPatchContent = [System.IO.File]::ReadAllText($aiDesignReadPatch, [System.Text.Encoding]::UTF8)
$aiAccessibilityDiagnosisPatchContent = [System.IO.File]::ReadAllText($aiAccessibilityDiagnosisPatch, [System.Text.Encoding]::UTF8)
$aiDesignConsistencyPatchContent = [System.IO.File]::ReadAllText($aiDesignConsistencyPatch, [System.Text.Encoding]::UTF8)
$aiRegroupRenamePatchContent = [System.IO.File]::ReadAllText($aiRegroupRenamePatch, [System.Text.Encoding]::UTF8)
$aiTypoAuditPatchContent = [System.IO.File]::ReadAllText($aiTypoAuditPatch, [System.Text.Encoding]::UTF8)
$aiPixelPerfectPatchContent = [System.IO.File]::ReadAllText($aiPixelPerfectPatch, [System.Text.Encoding]::UTF8)
$deleteHiddenLayersPatchContent = [System.IO.File]::ReadAllText($deleteHiddenLayersPatch, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($destination, $bundle + "`r`n" + $importPatch + "`r`n" + $exportPatchContent + "`r`n" + $aiSettingsPatchContent + "`r`n" + $aiLlmClientPatchContent + "`r`n" + $aiDesignReadPatchContent + "`r`n" + $aiAccessibilityDiagnosisPatchContent + "`r`n" + $aiDesignConsistencyPatchContent + "`r`n" + $aiRegroupRenamePatchContent + "`r`n" + $aiTypoAuditPatchContent + "`r`n" + $aiPixelPerfectPatchContent + "`r`n" + $deleteHiddenLayersPatchContent, $utf8NoBom)

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

& node $exportBoundaryVerifier
if ($LASTEXITCODE -ne 0) {
  throw "PSD export boundary verification failed."
}

& node -c $destination
if ($LASTEXITCODE -ne 0) {
  throw "Generated bundle syntax check failed for $destination."
}
