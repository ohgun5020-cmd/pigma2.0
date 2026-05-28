# Pigma i18n Translation Memory

Updated: 2026-05-08

이 문서는 현재까지 영어로 맞춘 범위, 아직 누락 가능성이 높은 범위, 다음 언어 변형을 만들 때의 기준을 남기는 번역 메모리다.

## Source Of Truth

- UI 런타임 번역 훅: `ui.html`의 `__PIGMA_I18N_UI_LOCALE_STABILIZER__`
- 현재 영어 번역 맵: `ui.html`의 `const translations = new Map(Object.entries({...}))`
- 현재 추출 기준 번역 키 수: 793개
- 다른 언어 초안 맵: `ui.html`의 `englishPhraseTranslationsByLocale` (`es`, `ja`, `zh-CN`, 각 759개 고유 영어 문구 기준)
- 중요 용어 보정 맵: `ui.html`의 `englishPhraseOverridesByLocale`
- 런타임 버튼/토스트 번역 훅: `window.__PIGMA_TRANSLATE_UI_TEXT__`
- 번들 검증 대상: `code.patched.js`
- 소스 패치 후 번들 생성: `build-patched-main.ps1`

## Figma / System Language Behavior

- Figma Plugin API에서 `figma.locale`처럼 사용자의 Figma 앱 언어를 직접 반환하는 안정 API는 확인되지 않았다.
- 현재 플러그인은 UI iframe의 `navigator.language` / `navigator.languages`를 `detectedLocale`로 읽어 메인 플러그인에 전달한다.
- 설정 > 언어 셀렉트의 `자동` 옵션은 `localeMode: "auto"`를 저장하고, 감지값을 `ko`, `en`, `es`, `ja`, `zh-CN` 중 하나로 정규화해 UI 언어로 돌려준다.
- 사용자가 설정 > 언어 셀렉트에서 특정 언어를 직접 바꾸면 `localeMode: "manual"`로 저장되어 이후에는 수동 선택이 우선한다.
- 따라서 “Figma 시스템 언어를 따라가기”는 직접 API 추적이 아니라 런타임 언어 감지 기반 자동 선택으로 처리한다. Desktop 환경에서는 Figma 앱/OS 언어와 `navigator.language`가 일치하는지 실기기에서 한 번 확인한다.

## English Coverage Summary

현재 영어 번역 맵의 대략적인 분포다. 숫자는 `ui.html` 번역 맵을 기준으로 추출한 값이며, `other`에는 모달 문장, 상태 문구, 정규식 동적 문장, 깨진 인코딩 보정 키가 포함된다.

| Area | Count | Notes |
| --- | ---: | --- |
| Navigation / common UI | 91 | Sections, Create, Import, Edit, Settings, Run, Apply, Cancel, Close, Preview, selection states |
| Import / export / PSD | 49 | PSD/AI/EPS/PDF/PPT/SVG import, file picker, export/download labels, ZIP/PSD status |
| AI settings / API | 74 | OpenAI/Gemini settings, API key status, model labels, test/apply messages |
| Review tools | 47 | Accessibility review, design consistency review, typo review/fix, review-note cleanup |
| Layer cleanup | 59 | Unlock locked layers, delete hidden layers, split long frame |
| Align / fix | 28 | Integer pixel snap, button auto-fit, skew correction, corner radius adjustment |
| Text tools | 46 | Translation, text highlight, line-height adjustment, OCR/text overlay related labels |
| Image tools | 105 | Sharpen, auto tone, extract colors, reference search, merge, original size, original image save, prompt edit/generate, extend, upscale |
| Share / video | 47 | Prototype link, AI video, GIF/APNG conversion |
| Other / dynamic | 247 | Modal copy, status text, generated message patterns, corrupted Korean fallback keys |

## Translated Runtime Work

영어 모드에서 실제 실행 중에 보이던 주요 런타임 문구를 다음 소스까지 맞췄다.

| File | Covered English Work |
| --- | --- |
| `ui.html` | I18N UI stabilizer, text/attribute observer, alert/confirm translation patch, processing toast bridge, import file picker locale labels |
| `unlock-locked-layers.js` | Running status, selection error, skipped reason, no locked-layer toast, success toast, selection label |
| `copy-prototype-link.js` | Prototype Link running status, selection validation, success toasts |
| `original-image-download.js` | Original image search/save status, empty-selection toasts, read/prepare errors, download result labels |
| `ai-color-extract.js` | Prepare/apply status, one-target validation, palette name, empty result toast, success toast, browser-analysis failure |
| `ai-color-extract-ui.js` | Init failure, busy labels, processing toast labels, peer-busy error, UI error bridge |
| `ai-image-upscale.js` | Large image task constants, original size fit, bounds-fit, reference search, prompt draft, extend, composite, text overlay, selected fill errors |
| `code.patched.js` | Generated bundle mirrors the source patches above; do not edit only this file unless doing an emergency bundle patch |

## English UI Areas Already Listed In The Map

These are already represented in `ui.html` translation entries and should be reused for other locales:

- Common: Sections, Create, Import, Edit, Settings, Run, Selection, Ready, Idle, Complete, Error
- Import: Select File, No file selected, Import PSD / AI / EPS / PDF / PPT / SVG, Import to Figma
- Export: PSD download, ZIP download, export settings, hidden layers, editable text, bitmap text
- AI settings: Apply AI Settings, API Connection, OpenAI, Gemini, model fields, API test states
- AI chat: AI Design Chat, Current Selection, Capture, Recapture, Send, User, suggested questions
- Design assist: PC -> MO, MO -> PC, draft generation, dry-run, mobile/desktop draft states
- Review: Accessibility Review, Design Consistency Review, Typo Review, Auto Fix, Clear Review Notes
- Layer cleanup: Unlock Locked Layers, Delete Hidden Layers, Split Long Frame
- Align/fix: Snap to Integer Pixels, Auto-fit Button Size, Skew Correction, Corner Radius Adjust
- Text: Text Translation, Text Highlight, Adjust Text Line Height, text extraction / text overlay
- Image adjust: Sharpen, Auto Tone, Extract Colors, Find Reference Images, Merge Images, Save Original Image
- Image generate/extend: Prompt Edit / Generate, Extend Image, Upscale, output size selection
- Share/other: Copy Prototype Link, copied/ready/error states
- Video: AI video generation, local video import, GIF/APNG conversion, motion analysis, rendering progress

## Known Missing / Audit Targets

다음은 영어 모드에서 아직 한국어가 새어 나올 가능성이 높은 영역이다. 다음 작업 때 우선순위로 보면 된다.

| Priority | Area | Files / Clues | What To Fix |
| --- | --- | --- | --- |
| P0 | Review panel runtime text | `ui-ai-correction.js` | `textContent`, `setStatus`, `panelTitle`, `selectionSummary`에 남은 한국어를 `translateUiMessage`로 감싸거나 source-level English로 전환 |
| P0 | Design chat runtime text | `ai-design-chat-ui.js` | capture/recapture status, `사용자`, recommended question strings |
| P0 | Native Figma toasts still Korean | `delete-hidden-layers.js`, `split-long-frame.js`, `corner-radius-adjust.js`, `button-text-auto-size.js`, `text-line-height-adjust.js`, `skew-transform.js` | `figma.notify`, `postStatus`, `throw new Error` fallback messages를 English/source-level or locale-aware helper로 정리 |
| P0 | AI review backend messages | `ai-accessibility-diagnosis.js`, `ai-design-consistency.js`, `ai-pixel-perfect.js` | backend summary/error/apply messages and Dev Mode annotation result text |
| P1 | PSD import/export native messages | `psd-import-text-fix.js`, `psd-export-boundary.js`, generated base bundle area in `code.js` | Korean fallback maps and Figma native alerts/toasts need locale-aware routing |
| P1 | Mojibake strings | `ui.html`, `skew-transform.js`, generated `code.patched.js` | Broken Korean keys are currently patched in the English stabilizer, but should eventually be normalized at the source |
| P1 | Other languages | `ui.html` | Spanish/Japanese/Chinese now share the English stabilizer coverage through `englishPhraseTranslationsByLocale`; review machine-translation tone and dynamic generated messages |
| P2 | Dynamic generated messages | many UI scripts | Counts, names, provider labels, retry messages need pattern translators instead of one-off string pairs |

## Rules For New Language Variants

Use Korean as the canonical source key until the codebase has a real i18n layer.

1. Keep existing Korean source keys stable when possible.
2. Convert the current English-only map into a locale map:

```js
const translationsByLocale = {
  en: { "선택 없음": "No selection" },
  es: { "선택 없음": "Sin seleccion" },
  ja: { "선택 없음": "選択なし" },
  "zh-CN": { "선택 없음": "未选择" },
};
```

3. Replace `isEnglishUi()` checks with `getActiveLocale()` and `translateUiText(value, locale)`.
4. For plugin backend messages, prefer message IDs plus params:

```js
postStatus("running", { key: "unlockLockedLayers.finding" });
notifyLocalized("unlockLockedLayers.empty");
```

5. If message IDs are too large a refactor, keep source-level English for Figma native toasts and add UI translation only for browser DOM text.
6. For every new locale, test these surfaces:

- Main panel labels and buttons
- Modal titles, descriptions, input placeholders
- Processing toast labels
- Figma native `figma.notify`
- `window.alert` / `window.confirm`
- Disabled button labels and busy states
- Error panels and empty states
- Dynamic count messages such as `N applied`, `N skipped`, `N files selected`

## Useful Audit Commands

Use these after each i18n pass.

```powershell
node --check code.patched.js
node --check unlock-locked-layers.js
node verify-externalized-ui.js code.patched.js
node verify-figma-runtime-syntax.js
git diff --check
```

Find possible Korean runtime leaks in source patch files:

```powershell
rg -n --glob "*.js" --glob "!code.patched.js" --glob "!code.js" --glob "!vendor/**" "figma\\.notify|postStatus\\(|throw new Error|setStatus\\(|textContent" .
```

Find the UI translation hook:

```powershell
rg -n "__PIGMA_ENGLISH_UI_LOCALE_STABILIZER__|__PIGMA_TRANSLATE_UI_TEXT__|function findTranslation" ui.html
```
