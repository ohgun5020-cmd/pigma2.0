"use strict";(()=>{var so=Object.defineProperty,lo=Object.defineProperties;var uo=Object.getOwnPropertyDescriptors;var Ct=Object.getOwnPropertySymbols;var co=Object.prototype.hasOwnProperty,po=Object.prototype.propertyIsEnumerable;var kt=(e,t,r)=>t in e?so(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,b=(e,t)=>{for(var r in t||(t={}))co.call(t,r)&&kt(e,r,t[r]);if(Ct)for(var r of Ct(t))po.call(t,r)&&kt(e,r,t[r]);return e},B=(e,t)=>lo(e,uo(t));var A={psdVersion:"max-compatibility",textExportMode:"editable-text",imageExportMode:"bitmap-only",hiddenLayerMode:"ignore-hidden",exportPackageMode:"psd-only",fileNamePattern:"{frame-name}.psd"},$={psdVersion:"max-compatibility",textExportMode:"editable-text",imageExportMode:"smart-object-if-possible",hiddenLayerMode:"ignore-hidden",exportPackageMode:"psd-only",fileNamePattern:"{frame-name}.psd"},U={psdVersion:"max-compatibility",textExportMode:"rasterize-text",imageExportMode:"smart-object-if-possible",hiddenLayerMode:"ignore-hidden",exportPackageMode:"psd-only",fileNamePattern:"{frame-name}.psd"},H={psdVersion:"max-compatibility",textExportMode:"rasterize-text",imageExportMode:"bitmap-only",hiddenLayerMode:"ignore-hidden",exportPackageMode:"psd-only",fileNamePattern:"{frame-name}.psd"},Mt="ko",ne={locale:Mt,localeMode:"auto",exportSettings:A};function It(e){return e?B(b({},e),{imageExportMode:e.imageExportMode===U.imageExportMode?A.imageExportMode:e.imageExportMode}):{}}function Rt(e){if(!e)return{};let t=typeof e.fileNamePattern=="string"&&e.fileNamePattern.trim().length>0?e.fileNamePattern.trim():H.fileNamePattern,r=e.psdVersion==="max-compatibility"?e.psdVersion:H.psdVersion,o=e.textExportMode==="editable-text"||e.textExportMode==="rasterize-text"?e.textExportMode:H.textExportMode,n=e.imageExportMode==="smart-object-if-possible"||e.imageExportMode==="bitmap-only"?e.imageExportMode:H.imageExportMode;return r!==H.psdVersion||o!==H.textExportMode||n!==H.imageExportMode||t!==H.fileNamePattern?e:B(b({},e),{imageExportMode:A.imageExportMode})}function At(e){if(!e)return{};let t=typeof e.fileNamePattern=="string"&&e.fileNamePattern.trim().length>0?e.fileNamePattern.trim():$.fileNamePattern,r=e.psdVersion==="max-compatibility"?e.psdVersion:$.psdVersion,o=e.textExportMode==="editable-text"||e.textExportMode==="rasterize-text"?e.textExportMode:$.textExportMode,n=e.imageExportMode==="smart-object-if-possible"||e.imageExportMode==="bitmap-only"?e.imageExportMode:$.imageExportMode;return r!==$.psdVersion||o!==$.textExportMode||n!==$.imageExportMode||t!==$.fileNamePattern?e:B(b({},e),{imageExportMode:A.imageExportMode})}function Lt(e){if(!e)return{};let t=typeof e.fileNamePattern=="string"&&e.fileNamePattern.trim().length>0?e.fileNamePattern.trim():U.fileNamePattern,r=e.psdVersion==="max-compatibility"?e.psdVersion:U.psdVersion,o=e.textExportMode==="editable-text"||e.textExportMode==="rasterize-text"?e.textExportMode:U.textExportMode,n=e.imageExportMode==="smart-object-if-possible"||e.imageExportMode==="bitmap-only"?e.imageExportMode:U.imageExportMode;return r!==U.psdVersion||o!==U.textExportMode||n!==U.imageExportMode||t!==U.fileNamePattern?e:B(b({},e),{textExportMode:A.textExportMode})}function Ft(e){let t=e!=null?e:{};return{psdVersion:t.psdVersion==="max-compatibility"?t.psdVersion:A.psdVersion,textExportMode:t.textExportMode==="editable-text"||t.textExportMode==="rasterize-text"?t.textExportMode:A.textExportMode,imageExportMode:t.imageExportMode==="smart-object-if-possible"||t.imageExportMode==="bitmap-only"?t.imageExportMode:A.imageExportMode,hiddenLayerMode:t.hiddenLayerMode==="preserve-hidden"||t.hiddenLayerMode==="ignore-hidden"?t.hiddenLayerMode:A.hiddenLayerMode,exportPackageMode:t.exportPackageMode==="bundle-with-rasters"||t.exportPackageMode==="psd-only"?t.exportPackageMode:A.exportPackageMode,fileNamePattern:typeof t.fileNamePattern=="string"&&t.fileNamePattern.trim().length>0?t.fileNamePattern.trim():A.fileNamePattern}}var fo={"?대낫???뚯씪???ш린???쒖떆?⑸땲??":"내보내기 파일이 여기에 표시됩니다.","?꾨젅???먮뒗 ?덉씠?대? ?좏깮?섏꽭??":"프레임 또는 레이어를 선택하세요.","?몄뀡 ?쒖옉":"세션 시작","?좏깮 ?湲?以묒엯?덈떎.":"선택 대기 중입니다.","PSD 留뚮뱾湲?以鍮?以묒엯?덈떎.":"PSD 만들기 준비 중입니다.","PSD 留뚮뱾湲??묒뾽??吏꾪뻾 以묒엯?덈떎.":"PSD 만들기 작업이 진행 중입니다.","PSD 媛?몄삤湲?以鍮?以묒엯?덈떎.":"PSD 가져오기 준비 중입니다.","PSD ???筌띻퀣肉?揶쎛?紐꾩궎疫?餓Β??餓λ쵐???덈뼄.":"PSD 파일들을 선택했습니다.","PSD 揶쎛?紐꾩궎疫?餓Β??餓λ쵐???덈뼄.":"PSD 파일을 선택했습니다.","PSD 媛?몄삤湲곗뿉 ?ㅽ뙣?덉뒿?덈떎.":"PSD 가져오기에 실패했습니다.","PSD 媛?몄삤湲??ㅽ뙣":"PSD 가져오기 실패","PSD 媛?몄삤湲??쒖옉":"PSD 가져오기 시작","PSD 臾띠쓬 ?꾨즺":"PSD 묶음 완료","PSD 鈺곌퀡????쎈솭":"PSD 조립 실패","PSD 議곕┰ ?ㅽ뙣":"PSD 조립 실패","PSD 議곕┰ 以묒엯?덈떎.":"PSD 조립 중입니다.","?????용┛ ??쎈솭":"플러그인 패널 오류","?⑥씪 ?⑹꽦 ?대?吏":"단일 합성 이미지","?꾨젅?? 洹몃９, ?덉씠?대? 癒쇱? ?좏깮?섏꽭??":"프레임, 그룹, 레이어를 먼저 선택하세요.","?꾨즺":"완료","?꾩옱 ?좏깮?쇰줈 PSD ?뚯씪??留뚮벊?덈떎.":"현재 선택으로 PSD 파일을 만듭니다.","?꾪뿕 硫붾え":"위험 메모","?紐꾩춿 揶쎛????용뮞??鈺곌퀡?????쎈솭????筌?PSD嚥??袁れ넎??뤿???щ빍??":"편집 가능한 텍스트 조립이 실패해 대체 PSD로 전환했습니다.","?泥?PSD ?ы븿":"대체 PSD 포함","?대낫?닿린 ?꾨즺":"내보내기 완료","?대낫?닿린 ?명듃 ?꾨즺":"내보내기 세트 완료","?대낫?닿린 ?ㅽ뙣":"내보내기 실패","?덉씠??援ъ“ ?좎?":"레이어 구조 유지","?됰슢??怨? UI?癒?퐣 筌ㅼ뮇伊???쇱뒲嚥≪뮆諭??얜씈???餓Β??쑵釉?쭪? 筌륁궢六??щ빍??":"브라우저 UI에서 최종 다운로드 묶음을 준비하지 못했습니다.","?됰슢??怨? UI?癒?퐣 PSD 鈺곌퀡?????쎈솭??됰뮸??덈뼄.":"브라우저 UI에서 PSD 조립에 실패했습니다.","?뚮윭洹몄씤":"플러그인","?띿뒪???꾨낫":"텍스트 후보","?몄뀡 湲곕줉???ш린???쒖떆?⑸땲??":"세션 기록이 여기에 표시됩니다.","?몄쭛 媛???띿뒪??議곕┰???ㅽ뙣???泥?PSD濡??꾪솚?섏뿀?듬땲??":"편집 가능한 텍스트 조립이 실패해 대체 PSD로 전환했습니다.","?명듃":"세트","?명솚??硫붾え媛 ?ш린???쒖떆?⑸땲??":"호환성 메모가 여기에 표시됩니다.","?붾쾭洹?異붿쟻???ш린???쒖떆?⑸땲??":"디버그 추적이 여기에 표시됩니다.","?쒓컙 ?놁쓬":"시간 없음","?쒖쇅 ??異붿텧":"제외 후 추출","?얜씈??餓Β????쎈솭":"다운로드 오류","?ㅻ쪟":"오류","?щ윭 猷⑦듃 ?ш린":"여러 루트 크기","?ъ쟾 ?먭? ?붾㈃.":"사전 점검 화면.","?ъ쟾 ?먭?.":"사전 점검.","1珥?誘몃쭔":"1초 미만","理쒓렐 ?대낫?닿린 ?놁쓬":"최근 내보내기 없음","理쒓렐 ?뚯씪???ш린???쒖떆?⑸땲??":"최근 파일이 여기에 표시됩니다.","寃쎄퀬 ?놁쓬":"경고 없음","諛곌꼍 異붿쟻 ?놁쓬":"배경 추적 없음","釉뚮씪?곗? UI?먯꽌 理쒖쥌 ?ㅼ슫濡쒕뱶 臾띠쓬??以鍮꾪븯吏 紐삵뻽?듬땲??":"브라우저 UI에서 최종 다운로드 묶음을 준비하지 못했습니다.","釉뚮씪?곗? UI?먯꽌 PSD 議곕┰???ㅽ뙣?덉뒿?덈떎.":"브라우저 UI에서 PSD 조립에 실패했습니다.","臾띠쓬 以鍮??ㅽ뙣":"묶음 준비 실패","濡쒓렇 ?놁쓬":"로그 없음","異붿텧 ???④? ?좎?":"추출 후 숨김 유지","PNG+JPG ?ы븿":"PNG+JPG 포함","?щ윭 PSD瑜? ?좏깮?섎㈃ ?꾩뿉?? ?꾨옒濡? ?먮룞 ?대?留곗뿬 媛?몄샃?덈떎.":"여러 PSD를 선택하면 한 페이지 안에 아래로 자동 이어 붙여 가져옵니다.","?쇨렇留덈줈 媛?몄삤湲?":"피그마로 가져오기"},Da=Object.entries(fo).reduce((e,[t,r])=>{let o=e.get(r);return o?o.push(t):e.set(r,[t]),e},new Map),mo={"PSD 媛?몄삤湲??꾨즺":"PSD 가져오기 완료","PSD 揶쎛?紐꾩궎疫꿸퀣肉???쎈솭??됰뮸??덈뼄.":"PSD 가져오기에 실패했습니다.","PSD ?⑹꽦 ?대?吏瑜?李얠? 紐삵뻽?듬땲??":"PSD 합성 이미지를 찾지 못했습니다.","PSD ??밴쉐 ???筌왖??筌≪뼚? 筌륁궢六??щ빍??":"PSD 합성 이미지를 찾지 못했습니다.","媛?몄삱 ???덈뒗 PSD ?뚯씪???놁뒿?덈떎.":"가져올 수 있는 PSD 파일이 없습니다.","媛?몄삱 ???덈뒗 PSD ?덉씠?대? 李얠? 紐삵뻽?듬땲??":"가져올 수 있는 PSD 레이어를 찾지 못했습니다.","吏?먯븯吏 ?딆뒗 PSD 諛곗튂 諛⑹떇?낅땲??":"지원하지 않는 PSD 배치 방식입니다.","蹂듭썝 媛?ν븳 PSD ?덉씠?닿? ?놁뼱 ?⑹꽦 ?대?吏 ???μ쑝濡?媛?몄샃?덈떎.":"복원 가능한 PSD 레이어가 없어 합성 이미지 한 장으로 가져옵니다."},Bt={"Select one or more frames, groups, or layers to export.":{ko:"내보낼 프레임, 그룹 또는 레이어를 하나 이상 선택하세요.",ja:"書き出すフレーム、グループ、またはレイヤーを1つ以上選択してください。","zh-CN":"请选择一个或多个要导出的画板、组或图层。"},"The exporter keeps editable text where possible, and multiple selected roots are packaged into a ZIP archive.":{ko:"가능한 경우 편집 가능한 텍스트를 유지하며, 여러 루트를 선택하면 ZIP 묶음으로 준비됩니다.",ja:"可能な限り編集可能テキストを保持し、複数のルートを選択すると ZIP にまとめられます。","zh-CN":"会在可能时保留可编辑文本，选择多个根节点时会打包为 ZIP。"},"This selection cannot be exported by Figma.":{ko:"이 선택 항목은 Figma에서 내보낼 수 없습니다.",ja:"この選択項目は Figma で書き出せません。","zh-CN":"此选择内容无法通过 Figma 导出。"},"Try a visible frame, group, text layer, or image layer.":{ko:"보이는 프레임, 그룹, 텍스트 레이어 또는 이미지 레이어를 선택해보세요.",ja:"表示されているフレーム、グループ、テキストレイヤー、または画像レイヤーを試してください。","zh-CN":"请尝试选择可见的画板、组、文本图层或图像图层。"},"This selection does not have exportable bounds.":{ko:"이 선택 항목에는 내보낼 수 있는 경계가 없습니다.",ja:"この選択項目には書き出し可能な境界がありません。","zh-CN":"此选择内容没有可导出的边界。"},"No exportable content was found inside this selection.":{ko:"이 선택 안에서 내보낼 수 있는 콘텐츠를 찾지 못했습니다.",ja:"この選択内に書き出し可能なコンテンツが見つかりませんでした。","zh-CN":"在此选择中未找到可导出的内容。"},"Masks or empty containers can still block export. Hidden layers can be preserved or ignored from the export defaults.":{ko:"마스크나 빈 컨테이너도 내보내기를 막을 수 있습니다. 숨김 레이어는 내보내기 기본값에서 유지하거나 무시할 수 있습니다.",ja:"マスクや空のコンテナも書き出しを妨げることがあります。非表示レイヤーは書き出しデフォルトで保持または無視できます。","zh-CN":"蒙版或空容器也可能阻止导出。隐藏图层可在导出默认值中保留或忽略。"},"Editable text is preserved when fills and typography are compatible. Hidden layers can be ignored or included as hidden PSD layers.":{ko:"채우기와 타이포그래피가 호환되면 편집 가능한 텍스트를 유지합니다. 숨김 레이어는 무시하거나 PSD 안에서 숨김 상태로 포함할 수 있습니다.",ja:"塗りとタイポグラフィが互換なら編集可能テキストを保持します。非表示レイヤーは無視することも、PSDで非表示のまま含めることもできます。","zh-CN":"当填充和排版兼容时会保留可编辑文本。隐藏图层可以忽略，也可以作为隐藏的 PSD 图层包含。"},"Text export is currently set to rasterize text, so text layers will export as bitmap layers until you change the export defaults.":{ko:"현재 텍스트 내보내기 설정이 비트맵 고정으로 되어 있어, 내보내기 기본값을 바꾸기 전까지 텍스트 레이어는 비트맵 레이어로 내보내집니다.",ja:"現在のテキスト書き出し設定はラスタライズ固定のため、書き出しデフォルトを変更するまでテキストレイヤーはビットマップレイヤーとして書き出されます。","zh-CN":"当前文本导出设置为栅格化文本，因此在更改导出默认值之前，文本图层都会导出为位图图层。"},"Each selected root is exported as its own PSD file. When more than one file is ready, the download is packaged as a ZIP archive.":{ko:"선택한 각 루트는 개별 PSD 파일로 내보내집니다. 두 개 이상 준비되면 ZIP으로 묶어 다운로드합니다.",ja:"選択した各ルートは個別の PSD ファイルとして書き出されます。2つ以上になると ZIP にまとめてダウンロードします。","zh-CN":"每个选中的根节点都会导出为单独的 PSD 文件。准备好的文件超过一个时会打包为 ZIP 下载。"},"An unknown error happened while building the PSD.":{ko:"PSD를 구성하는 중 알 수 없는 오류가 발생했습니다.",ja:"PSD の生成中に不明なエラーが発生しました。","zh-CN":"构建 PSD 时发生未知错误。"},"Unable to calculate document bounds for the selected root.":{ko:"선택한 루트의 문서 경계를 계산할 수 없습니다.",ja:"選択したルートのドキュメント境界を計算できません。","zh-CN":"无法计算所选根节点的文档边界。"},"No exportable layers remain after ignoring hidden layers.":{ko:"숨김 레이어를 제외하고 나면 내보낼 수 있는 레이어가 남지 않습니다.",ja:"非表示レイヤーを除外すると、書き出し可能なレイヤーが残りません。","zh-CN":"忽略隐藏图层后，没有剩余可导出的图层。"},"There are no visible exportable layers inside this selection.":{ko:"이 선택 안에는 보이는 내보내기 가능 레이어가 없습니다.",ja:"この選択内には表示されている書き出し可能レイヤーがありません。","zh-CN":"此选择中没有可见的可导出图层。"},"The exporter could not produce any PSD layers from this selection.":{ko:"이 선택에서 PSD 레이어를 생성하지 못했습니다.",ja:"この選択から PSD レイヤーを生成できませんでした。","zh-CN":"无法从此选择生成任何 PSD 图层。"},"Missing composite raster bytes for bundle packaging.":{ko:"묶음 패키징에 필요한 합성 래스터 바이트가 없습니다.",ja:"バンドル作成に必要な合成ラスターのバイトがありません。","zh-CN":"缺少用于打包的合成栅格字节数据。"},"Document bounds are required to place PSD vector paths.":{ko:"PSD 벡터 경로를 배치하려면 문서 경계가 필요합니다.",ja:"PSD のベクターパスを配置するにはドキュメント境界が必要です。","zh-CN":"放置 PSD 矢量路径需要文档边界。"},"Expected an SVG root element.":{ko:"SVG 루트 요소가 필요합니다.",ja:"SVG のルート要素が必要です。","zh-CN":"需要 SVG 根元素。"},"Invalid SVG matrix() transform.":{ko:"유효하지 않은 SVG matrix() 변환입니다.",ja:"無効な SVG matrix() 変換です。","zh-CN":"无效的 SVG matrix() 变换。"},"Invalid SVG rect dimensions.":{ko:"유효하지 않은 SVG rect 크기입니다.",ja:"無効な SVG rect サイズです。","zh-CN":"无效的 SVG rect 尺寸。"},"Raster smart object blur export requires Layer Blur metadata.":{ko:"래스터 스마트 오브젝트 블러 내보내기에는 Layer Blur 메타데이터가 필요합니다.",ja:"ラスターのスマートオブジェクトぼかしを書き出すには Layer Blur のメタデータが必要です。","zh-CN":"导出栅格智能对象模糊需要 Layer Blur 元数据。"},"Shape vector export requires a solid fill.":{ko:"도형 벡터 내보내기에는 단색 채우기가 필요합니다.",ja:"シェイプのベクター書き出しには単色塗りが必要です。","zh-CN":"形状矢量导出需要纯色填充。"},"The SVG did not contain any shape paths.":{ko:"SVG 안에 도형 경로가 없습니다.",ja:"SVG にシェイプパスが含まれていませんでした。","zh-CN":"SVG 中不包含任何形状路径。"},"The SVG path started without a command.":{ko:"SVG 경로가 명령 없이 시작되었습니다.",ja:"SVG パスがコマンドなしで開始されました。","zh-CN":"SVG 路径在没有命令的情况下开始。"},"The SVG viewBox was empty.":{ko:"SVG viewBox가 비어 있습니다.",ja:"SVG の viewBox が空でした。","zh-CN":"SVG viewBox 为空。"},"The exported SVG did not have an <svg> root.":{ko:"내보낸 SVG에 <svg> 루트가 없습니다.",ja:"書き出された SVG に <svg> ルートがありませんでした。","zh-CN":"导出的 SVG 没有 <svg> 根节点。"},"Unexpected end of SVG path data.":{ko:"SVG 경로 데이터가 예상보다 일찍 끝났습니다.",ja:"SVG パスデータが途中で終了しました。","zh-CN":"SVG 路径数据意外结束。"}},xo=[{pattern:/^Export failed for "(.+)" \((\d+)\/(\d+)\): (.+)$/,replace:(e,t)=>({ko:'"'.concat(t[1],'" 내보내기에 실패했습니다. (').concat(t[2],"/").concat(t[3],"): ").concat(w(e,t[4])),ja:'"'.concat(t[1],'" の書き出しに失敗しました。(').concat(t[2],"/").concat(t[3],"): ").concat(w(e,t[4])),"zh-CN":'"'.concat(t[1],'" 导出失败。(').concat(t[2],"/").concat(t[3],"): ").concat(w(e,t[4]))})[e]},{pattern:/^PSD ready: (\d+) layers, (\d+) editable text layers$/,replace:(e,t)=>({ko:"PSD 준비됨: 레이어 ".concat(t[1],"개, 편집 가능 텍스트 ").concat(t[2],"개"),ja:"PSD の準備完了: レイヤー ".concat(t[1],"枚、編集可能テキスト ").concat(t[2],"件"),"zh-CN":"PSD 已准备好：".concat(t[1]," 个图层，").concat(t[2]," 个可编辑文本图层")})[e]},{pattern:/^(\d+) PSD files are ready\. The download will be packaged as a ZIP archive\.$/,replace:(e,t)=>({ko:"PSD ".concat(t[1],"개가 준비되었습니다. 다운로드는 ZIP 묶음으로 제공됩니다."),ja:"PSD が ".concat(t[1]," 個準備できました。ダウンロードは ZIP にまとめられます。"),"zh-CN":"".concat(t[1]," 个 PSD 已准备好。下载内容将打包为 ZIP。")})[e]},{pattern:/^(\d+) roots selected: (\d+) PSD layers, (\d+) editable text layers, (\d+) preserved groups\.$/,replace:(e,t)=>({ko:"".concat(t[1],"개 루트 선택됨: PSD 레이어 ").concat(t[2],"개, 편집 가능 텍스트 ").concat(t[3],"개, 유지된 그룹 ").concat(t[4],"개"),ja:"".concat(t[1]," 個のルートを選択: PSD レイヤー ").concat(t[2]," 枚、編集可能テキスト ").concat(t[3]," 件、保持されたグループ ").concat(t[4]," 件"),"zh-CN":"已选择 ".concat(t[1]," 个根节点：").concat(t[2]," 个 PSD 图层，").concat(t[3]," 个可编辑文本图层，").concat(t[4]," 个保留的组")})[e]},{pattern:/^"(.+)" is ready: (\d+) PSD layers, (\d+) editable text layers, (\d+) preserved groups\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'" 준비 완료: PSD 레이어 ').concat(t[2],"개, 편집 가능 텍스트 ").concat(t[3],"개, 유지된 그룹 ").concat(t[4],"개"),ja:'"'.concat(t[1],'" の準備完了: PSD レイヤー ').concat(t[2]," 枚、編集可能テキスト ").concat(t[3]," 件、保持されたグループ ").concat(t[4]," 件"),"zh-CN":"“".concat(t[1],"”已就绪：").concat(t[2]," 个 PSD 图层，").concat(t[3]," 个可编辑文本图层，").concat(t[4]," 个保留的组")})[e]},{pattern:/^"(.+)" is not ready for batch export\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"은(는) 일괄 내보내기 준비가 되지 않았습니다.'),ja:'"'.concat(t[1],'" は一括書き出しの準備ができていません。'),"zh-CN":"“".concat(t[1],"”尚未准备好进行批量导出。")})[e]},{pattern:/^"(.+)" could not separate its background cleanly, so it was flattened\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"의 배경을 깔끔하게 분리하지 못해 평면화되었습니다.'),ja:'"'.concat(t[1],'" の背景をきれいに分離できなかったため、フラット化されました。'),"zh-CN":"无法干净地分离“".concat(t[1],"”的背景，因此已被扁平化。")})[e]},{pattern:/^"(.+)" could not keep its SVG\/vector data, so it fell back to a bitmap layer\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"의 SVG/벡터 데이터를 유지하지 못해 비트맵 레이어로 대체되었습니다.'),ja:'"'.concat(t[1],'" の SVG/ベクターデータを保持できず、ビットマップレイヤーにフォールバックしました。'),"zh-CN":"“".concat(t[1],"”无法保留 SVG/矢量数据，因此回退为位图图层。")})[e]},{pattern:/^"(.+)" could not be reconstructed as a PSD mask\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"을(를) PSD 마스크로 복원하지 못했습니다.'),ja:'"'.concat(t[1],'" を PSD マスクとして再構築できませんでした。'),"zh-CN":"无法将“".concat(t[1],"”重建为 PSD 蒙版。")})[e]},{pattern:/^"(.+)" uses masking and will export as a flattened bitmap layer\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"은(는) 마스킹을 사용하므로 평면화된 비트맵 레이어로 내보내집니다.'),ja:'"'.concat(t[1],'" はマスクを使用しているため、フラット化されたビットマップレイヤーとして書き出されます。'),"zh-CN":"“".concat(t[1],"”使用了蒙版，因此会导出为扁平化的位图图层。")})[e]},{pattern:/^"(.+)" uses Layer Blur, so it will preserve the blur as a Photoshop Smart Filter and rasterize the text instead of keeping an editable text layer\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"은(는) Layer Blur를 사용하므로 블러는 Photoshop 스마트 필터로 유지되고, 텍스트는 편집 가능한 레이어 대신 래스터화됩니다.'),ja:'"'.concat(t[1],'" は Layer Blur を使用しているため、ぼかしは Photoshop のスマートフィルターとして保持され、テキストは編集可能レイヤーではなくラスタライズされます。'),"zh-CN":"“".concat(t[1],"”使用了 Layer Blur，因此模糊会保留为 Photoshop 智能滤镜，而文本会被栅格化，不再保留为可编辑文本图层。")})[e]},{pattern:/^"(.+)" uses both layer and image-fill blend modes, so only the layer blend stayed editable in the PSD\.$/,replace:(e,t)=>({ko:'"'.concat(t[1],'"은(는) 레이어와 이미지 채우기 블렌드 모드를 함께 사용하므로 PSD에서는 레이어 블렌드만 편집 가능한 상태로 유지되었습니다.'),ja:'"'.concat(t[1],'" はレイヤーと画像塗りの両方にブレンドモードを使っているため、PSD ではレイヤーブレンドのみが編集可能なまま保持されました。'),"zh-CN":"“".concat(t[1],"”同时使用了图层与图像填充混合模式，因此在 PSD 中只有图层混合保留为可编辑。")})[e]},{pattern:/^Unable to encode (.+) preview in the browser UI\.$/,replace:(e,t)=>({ko:"브라우저 UI에서 ".concat(t[1]," 미리보기를 인코딩할 수 없습니다."),ja:"ブラウザ UI で ".concat(t[1]," プレビューをエンコードできません。"),"zh-CN":"无法在浏览器 UI 中编码 ".concat(t[1]," 预览。")})[e]}];function Gt(e,t=Mt){if(!e)return t;let r=e.trim().toLowerCase();return r==="ko"||r.startsWith("ko-")?"ko":r==="ja"||r.startsWith("ja-")?"ja":r==="en"||r.startsWith("en-")?"en":r==="es"||r.startsWith("es-")?"es":r==="zh"||r==="zh-cn"||r==="zh-hans"||r.startsWith("zh-cn")||r.startsWith("zh-hans")?"zh-CN":t}function go(e){var t;return(t=mo[e])!=null?t:e}function w(e,t){var i;if(!t)return t;let r=go(t);if(e==="ko"||e==="en")return r;let o=(i=Bt[r])!=null?i:Bt[t];if(o){let a=o[e];if(a)return a}if(e==="es")return r;for(let a of xo){let s=a.pattern.exec(r);if(s)return a.replace(e,s)}let n=r.match(/^([^:]+): (.+)$/);if(n){let a=w(e,n[2]);if(a!==n[2])return"".concat(n[1],": ").concat(a)}return r}var Xt={disableShapePreviewCanvas:!1,forceBitmapVectorPreview:!1,disableEditableTextPreview:!1,disableLayerBlur:!1,disableProgressiveLayerBlur:!1,disableBackgroundBlur:!1,disableNoise:!1,disableTexture:!1},ho=new Set(["COMPONENT","COMPONENT_SET","FRAME","INSTANCE","SECTION","TEXT"]),yo=new Set(["GROUP","SECTION","FRAME","COMPONENT","COMPONENT_SET","INSTANCE"]),So=new Set(["GROUP","FRAME","SECTION","COMPONENT","INSTANCE"]),bo=["fontName","fontSize","lineHeight","letterSpacing","fills","textDecoration","textCase"],Kt=["fontName"],je=new Map,We=null,Ze=null,O=b({},Xt),Eo=80,Po=70,No=70,To=12e6,Do=6e3,vo=12e6,wo=4e3,Co=8e6,ko=4e6,Bo=512,Yt=2048,Mo=1e4,Io=16e6,Ro=8e3,Ao=12e6,Lo={monotone:{primaryAlphaScale:.64,secondaryAlphaScale:1,overlayOpacityScale:1},duotone:{primaryAlphaScale:.56,secondaryAlphaScale:.48,overlayOpacityScale:1},multitone:{primaryAlphaScale:1,secondaryAlphaScale:1,overlayOpacityScale:.6}},qt="pigma:ui-preferences:v2",Fo="pigma:ui-preferences:v1",Jt="pigma:ui-preferences-flags:v1",S={closePlugin:()=>{figma.closePlugin()},notify:(e,t)=>figma.notify(e,t),postToUi:()=>{}},P=ne,G={},be=null,F=null,selectionPreviewCache=null,Qt=0;function er(e){return S=b(b({},S),e),{handleUiMessage:Go,invalidateSelectionCache:le,postSelectionState:Ee}}async function Go(e){var t,r;if(e.type==="request-preferences"){await zo(e.detectedLocale),Ot(),r=buildStartupSelectionResolution(),N({type:"selection-state",state:tr(r.state)});return}if(e.type==="update-preferences"){await _o(e.preferences),Ot(),Ee();return}if(e.type==="request-selection-sync"){Ee();return}if(e.type==="request-export"){await Qo(e.hiddenLayerMode,Tt(e.settings),e.includeCompositePng===!0,e.developerExportExperiments);return}if(e.type==="request-next-export-root"){await se();return}if(e.type==="request-import"){await en(e.payload);return}if(e.type==="request-import-batch"){await tn(e.batch);return}e.type==="close-plugin"&&((t=S.closePlugin)==null||t.call(S))}function N(e){S.postToUi(e)}function ae(e,t){console.info("[pigma-export][plugin]",b({stage:e},t))}function Oo(e){let t=e!=null?e:{};return{disableShapePreviewCanvas:t.disableShapePreviewCanvas===!0,forceBitmapVectorPreview:t.forceBitmapVectorPreview===!0,disableEditableTextPreview:t.disableEditableTextPreview===!0,disableLayerBlur:t.disableLayerBlur===!0,disableProgressiveLayerBlur:t.disableProgressiveLayerBlur===!0,disableBackgroundBlur:t.disableBackgroundBlur===!0,disableNoise:t.disableNoise===!0,disableTexture:t.disableTexture===!0}}function Uo(e){return O=Oo(e),O}function Qe(){O=b({},Xt)}function Ot(){N({type:"preferences",preferences:P})}function Ee(){let e=selectionResolutionForUi();N({type:"selection-state",state:tr(e.state)})}function le(){Qt+=1,F=null,selectionPreviewCache=null}async function zo(e){let t=Ho(e);try{G=$o(await figma.clientStorage.getAsync(Jt))}catch(r){G={}}try{let r=await figma.clientStorage.getAsync(qt);if(r!=null)P=Pe(r,t,!1,G.imageExportModeExplicit!==!0,G.textExportModeExplicit!==!0);else{let o=await figma.clientStorage.getAsync(Fo);P=Pe(o,t,!0,G.imageExportModeExplicit!==!0,G.textExportModeExplicit!==!0)}await et()}catch(r){G={},P=Pe(null,t),await et()}}async function _o(e){var t,r;if(e.exportSettings){let o=Object.prototype.hasOwnProperty.call(e.exportSettings,"imageExportMode"),n=Object.prototype.hasOwnProperty.call(e.exportSettings,"textExportMode");(o||n)&&(G=b(b(b({},G),o?{imageExportModeExplicit:!0}:{}),n?{textExportModeExplicit:!0}:{}))}P=Pe({locale:(t=e.locale)!=null?t:P.locale,localeMode:(r=e.localeMode)!=null?r:P.localeMode,exportSettings:e.exportSettings?b(b({},P.exportSettings),e.exportSettings):P.exportSettings}),await et()}async function et(){try{await figma.clientStorage.setAsync(qt,P),await figma.clientStorage.setAsync(Jt,G)}catch(e){}}function Pe(e,t=null,r=!1,o=!1,n=!1){var y;let i=e,a=r?It(i==null?void 0:i.exportSettings):i==null?void 0:i.exportSettings,s=o?Rt(a):a,l=n?Lt(s):s,u=o?At(l):l,c=(i==null?void 0:i.locale)==="ko"||(i==null?void 0:i.locale)==="en"||(i==null?void 0:i.locale)==="es"||(i==null?void 0:i.locale)==="ja"||(i==null?void 0:i.locale)==="zh-CN",p=c?i.locale:null,g=(i==null?void 0:i.localeMode)==="auto"||(i==null?void 0:i.localeMode)==="manual"?i.localeMode:c?"manual":"auto";return{locale:g==="auto"?(y=t!=null?t:p)!=null?y:ne.locale:p!=null?p:ne.locale,localeMode:g,exportSettings:Tt(u)}}function $o(e){let t=e;return b(b({},typeof(t==null?void 0:t.imageExportModeExplicit)=="boolean"?{imageExportModeExplicit:t.imageExportModeExplicit}:{}),typeof(t==null?void 0:t.textExportModeExplicit)=="boolean"?{textExportModeExplicit:t.textExportModeExplicit}:{})}function Ho(e){return e?Gt(e,ne.locale):null}function tr(e){return B(b({},e),{summary:w(P.locale,e.summary),detail:w(P.locale,e.detail),warnings:e.warnings.map(t=>w(P.locale,t))})}function buildSelectionPreviewEmptyState(e){return{ok:!1,state:{ready:!1,selectionId:null,selectionCount:0,selectionName:"",selectionType:null,summary:"Select one or more frames, groups, or layers to export.",detail:e.textExportMode==="rasterize-text"?"Text export is currently set to rasterize text, so text layers will export as bitmap layers until you change the export defaults.":"The exporter keeps editable text where possible, and multiple selected roots are packaged into a ZIP archive.",documentWidth:null,documentHeight:null,exportNodeCount:0,editableTextCount:0,preservedGroupCount:0,warnings:[],analysisPending:!1}}}function isSelectionPreviewHeavy(e){let t=xe(e);if(t){let r=d(t.width),o=d(t.height);if(o>=Do||r*o>=vo)return!0}if(!V(e)||e.children.length===0)return!1;let n=[e],i=0;for(;n.length>0;){let a=n.pop();if(i+=1,i>400)return!0;if(!V(a))continue;let s=a.children;if(!s||s.length===0)continue;if(s.length>120)return!0;for(let l=0;l<s.length;l+=1){let u=s[l];he(u)&&n.push(u)}}return!1}function shouldUseQuickSelectionPreview(e){if(e.length===0)return!1;for(let t=0;t<e.length;t+=1)if(isSelectionPreviewHeavy(e[t]))return!0;return!1}function buildQuickSelectionResolution(){let e=figma.currentPage.selection,t=Tt(P.exportSettings),r=Jo(e,t);if(selectionPreviewCache&&selectionPreviewCache.cacheKey===r)return selectionPreviewCache.resolution;if(e.length===0){let y=buildSelectionPreviewEmptyState(t);return selectionPreviewCache={cacheKey:r,resolution:y},y}let o=[],n=[],i=!1;for(let y=0;y<e.length;y+=1){let m=e[y];if(!he(m)){let T={ok:!1,state:Ye(e,m,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};return selectionPreviewCache={cacheKey:r,resolution:T},T}let C=xe(m);if(!C){let T={ok:!1,state:Ye(e,m,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};return selectionPreviewCache={cacheKey:r,resolution:T},T}o.push(m),n.push(C),!i&&isSelectionPreviewHeavy(m)&&(i=!0)}let a=o[0],s=o.length,l=n[0],u=i?"Large selection detected. Pigma is showing a lightweight preview first to keep Figma responsive. Full layer analysis runs when export starts.":s===1?"Editable text is preserved when fills and typography are compatible. Hidden layers can be ignored or included as hidden PSD layers.":"Each selected root is exported as its own PSD file. When more than one file is ready, the download is packaged as a ZIP archive.",c=i?["Large selection detected. Detailed layer counts will load when export starts."]:[],p={ready:!0,selectionId:s===1?a.id:null,selectionCount:s,selectionName:no(o),selectionType:io(o),summary:s===1?'"'.concat(f(a),'" is ready to export.'):"".concat(s," roots selected and ready to export."),detail:u,documentWidth:s===1?d(l.width):null,documentHeight:s===1?d(l.height):null,exportNodeCount:s,editableTextCount:0,preservedGroupCount:0,warnings:c,analysisPending:i},g={ok:!0,nodes:o,state:p};return selectionPreviewCache={cacheKey:r,resolution:g},g}function buildStartupSelectionResolution(){let e=figma.currentPage.selection,t=Tt(P.exportSettings);if(e.length===0)return buildSelectionPreviewEmptyState(t);let r=[],o=[],n=null;for(let i=0;i<e.length;i+=1){let a=e[i];if(!he(a)){n={ok:!1,state:Ye(e,a,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};break}let s=xe(a);if(!s){n={ok:!1,state:Ye(e,a,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};break}r.push(a),o.push(s)}if(n)return n;let i=r[0],a=r.length,s=o[0];return{ok:!0,nodes:r,state:{ready:!0,selectionId:a===1?i.id:null,selectionCount:a,selectionName:no(r),selectionType:io(r),summary:a===1?'"'.concat(f(i),'" is ready to export.'):"".concat(a," roots selected and ready to export."),detail:"Startup preview keeps the selection summary lightweight. Full layer analysis runs when export starts or when the selection changes.",documentWidth:a===1?d(s.width):null,documentHeight:a===1?d(s.height):null,exportNodeCount:a,editableTextCount:0,preservedGroupCount:0,warnings:["Detailed layer counts are deferred until export starts or the selection changes."],analysisPending:!0}}}function selectionResolutionForUi(){let e=figma.currentPage.selection;return shouldUseQuickSelectionPreview(e)?buildQuickSelectionResolution():rr()}function rr(){let e=figma.currentPage.selection,t=Tt(P.exportSettings),r=Jo(e,t);if((F==null?void 0:F.cacheKey)===r)return F.resolution;if(e.length===0){let m={ok:!1,state:{ready:!1,selectionId:null,selectionCount:0,selectionName:"",selectionType:null,summary:"Select one or more frames, groups, or layers to export.",detail:t.textExportMode==="rasterize-text"?"Text export is currently set to rasterize text, so text layers will export as bitmap layers until you change the export defaults.":"The exporter keeps editable text where possible, and multiple selected roots are packaged into a ZIP archive.",documentWidth:null,documentHeight:null,exportNodeCount:0,editableTextCount:0,preservedGroupCount:0,warnings:[]}};return F={cacheKey:r,resolution:m},m}let o=[],n=new Set,i=0,a=0,s=0;for(let m of e){if(!he(m)){let R={ok:!1,state:Ye(e,m,"This selection cannot be exported by Figma.","Try a visible frame, group, text layer, or image layer.")};return F={cacheKey:r,resolution:R},R}let T=m,C=xe(T);if(!C){let R={ok:!1,state:Ye(e,T,"This selection does not have exportable bounds.","Try a visible frame, group, text layer, or image layer.")};return F={cacheKey:r,resolution:R},R}let E=Ie(T,t.hiddenLayerMode);if(E.exportNodeCount===0){let R={ok:!1,state:Ye(e,T,"No exportable content was found inside this selection.","Masks or empty containers can still block export. Hidden layers can be preserved or ignored from the export defaults.",Array.from(E.warnings),C)};return F={cacheKey:r,resolution:R},R}lt(C,E.containsHeavyEffects)&&E.warnings.add(ut(d(C.width),d(C.height),E.containsHeavyEffects)),o.push({node:T,documentBounds:C,analysis:E}),i+=E.exportNodeCount,a+=E.editableTextCount,s+=E.preservedGroupCount;for(let R of E.warnings)n.add(Nt(f(T),R,e.length>1))}let l=o[0],u=o.length,c=ua(a,t),p={exportNodeCount:i,editableTextCount:c,preservedGroupCount:s,containsHeavyEffects:o.some(m=>m.analysis.containsHeavyEffects),warnings:n},g={ready:!0,selectionId:u===1?l.node.id:null,selectionCount:u,selectionName:no(o.map(m=>m.node)),selectionType:io(o.map(m=>m.node)),summary:fa(f(l.node),p,u),detail:ca(o,u,t,a),documentWidth:u===1?d(l.documentBounds.width):null,documentHeight:u===1?d(l.documentBounds.height):null,exportNodeCount:i,editableTextCount:c,preservedGroupCount:s,warnings:Array.from(n)},y={ok:!0,nodes:o.map(m=>m.node),roots:o,state:g};return F={cacheKey:r,resolution:y},y}function or(e){return e?{height:wo,area:Co}:{height:Do,area:vo}}function Ne(e,t,r){let o=or(r);return t>=o.height||e*t>=o.area}function lt(e,t){return Ne(d(e.width),d(e.height),t)}function ut(e,t,r){let o=or(r);return"This export is treated as a long frame (".concat(e," x ").concat(t,"px). Pigma will switch oversized layers to a lower-memory raster path once the document exceeds ").concat(o.height,"px tall or ").concat(o.area.toLocaleString("en-US")," pixels.")}function Vo(){return"Long-frame mode rasterizes editable text layers to keep export memory stable."}function jo(e){return'"'.concat(e,'" switches to a raster export in long-frame mode to keep memory usage stable.')}function Te(e,t){return'"'.concat(e,'" was split into ').concat(t," raster tiles in long-frame mode to keep memory usage stable.")}function nr(e,t){let r=d(e.width),o=d(e.height),n=r*o,i=t?{height:Ro,area:Ao}:{height:Mo,area:Io};return o>=i.height||n>=i.area}function ir(e,t){return nr(e,t)}function Wo(e,t,r){return'"'.concat(e,'" switched to a safe layered bitmap export (').concat(t," x ").concat(r,"px) so very large documents keep a PSD layer stack without triggering the heavier editable reconstruction path.")}function Zo(e,t){return'"'.concat(e,'" retried with the safe layered bitmap export after layered reconstruction failed (').concat(t,").")}function Xo(e,t,r){return'"'.concat(e,'" switched to a safe flattened export (').concat(t," x ").concat(r,"px) so very large documents finish as a complete PSD instead of failing during heavy layer reconstruction.")}function Ko(e,t){return'"'.concat(e,'" retried as a safe flattened PSD after layered export failed (').concat(t,").")}function Yo(e,t){return ze(e)||Xr(e)||!!fe(e,t)}function De(e){return Ne(d(e.width),d(e.height),!1)&&d(e.height)>Yt}function qo(e,t){let r=Math.max(1,d(e)),o=Math.max(1,d(t)),n=Math.floor(ko/r),i=Math.max(1,n),a=Math.max(Bo,Math.min(Yt,i));return Math.min(o,a)}function Jo(e,t){let r=e.map(o=>o.id).join(",");return[Qt,figma.currentPage.id,t.hiddenLayerMode,t.textExportMode,r].join("|")}async function Qo(e,t,r,o){var l;let n=Uo(o);P=b(b({},P),{exportSettings:Tt(t)});let i=rr();if(!i.ok){Qe(),le();let u=tr(i.state);N({type:"export-error",message:u.summary}),(l=S.notify)==null||l.call(S,u.summary,{error:!0});return}let a=i.nodes.length,s=xa(i.nodes,t);be={nodes:i.nodes,roots:i.roots,hiddenLayerMode:e,settings:t,includeCompositePng:r,developerExportExperiments:n,rootCount:a,bundleFileName:s,nextIndex:0,singlePayloadSummary:null},ae("session-start",{rootCount:a,includeCompositePng:r,developerExportExperiments:n}),N({type:"export-bundle-started",fileName:s,rootCount:a}),await se()}async function en(e){var t,r;N({type:"import-started",fileName:e.fileName,rootName:e.rootName,mode:e.mode});try{let o=ar(e.placement,e.rootName),n=nn(e,o),i=0;if(e.mode==="flatten-image"||e.nodes.length===0){if(!e.compositePngBytes||e.compositePngBytes.length===0)throw new Error("PSD 합성 이미지를 찾지 못했습니다.");let a=Q({kind:"bitmap",name:e.rootName,x:0,y:0,width:e.documentWidth,height:e.documentHeight,opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,pngBytes:e.compositePngBytes});n.appendChild(a),i=1}else i=await lr(e.nodes,n,e.warnings);o!==figma.currentPage&&await figma.setCurrentPageAsync(o),o.selection=[n],figma.viewport.scrollAndZoomIntoView([n]),N({type:"import-finished",rootName:e.rootName,importedNodeCount:i,warningCount:e.warnings.length}),(t=S.notify)==null||t.call(S,w(P.locale,"PSD 가져오기 완료"))}catch(o){let n=w(P.locale,o instanceof Error?o.message:"PSD 가져오기에 실패했습니다.");N({type:"import-error",message:n}),(r=S.notify)==null||r.call(S,n,{error:!0})}}async function tn(e){var o,n;let t=e.items.filter(i=>{var a,s;return i&&i.documentWidth>0&&i.documentHeight>0&&(i.mode==="flatten-image"||i.nodes.length>0||((s=(a=i.compositePngBytes)==null?void 0:a.length)!=null?s:0)>0)}),r=t.every(i=>i.mode==="flatten-image")?"flatten-image":"keep-layers";N({type:"import-started",fileName:e.fileName,rootName:e.rootName,mode:r});try{if(t.length===0)throw new Error("가져올 수 있는 PSD 파일이 없습니다.");if(e.arrangement!=="stitch-vertical")throw new Error("지원하지 않는 PSD 배치 방식입니다.");let i=Math.max(0,x(e.gap)),a=Math.max(...t.map(m=>d(m.documentWidth)),1),s=Math.max(1,t.reduce((m,T,C)=>{let E=d(T.documentHeight);return m+E+(C>0?i:0)},0)),l=ar(e.placement,e.rootName),u=sr(e.placement,a,s),c=figma.createFrame();c.name=e.rootName.trim().length>0?e.rootName:"PSD stitch",c.resize(a,s),c.clipsContent=!1,c.fills=[],c.strokes=[],c.x=u.x,c.y=u.y,l.appendChild(c);let p=0,g=0;for(let m of t){let T=Math.max(1,d(m.documentWidth)),C=Math.max(1,d(m.documentHeight)),E=figma.createFrame();E.name=m.rootName.trim().length>0?m.rootName:"PSD section",E.resize(T,C),E.clipsContent=!1,E.fills=[],E.strokes=[],E.x=0,E.y=g,c.appendChild(E),p+=await rn(m,E),g+=C+i}l!==figma.currentPage&&await figma.setCurrentPageAsync(l),l.selection=[c],figma.viewport.scrollAndZoomIntoView([c]);let y=Array.from(new Set(t.flatMap(m=>m.warnings.filter(Boolean)))).length;N({type:"import-finished",rootName:e.rootName,importedNodeCount:p,warningCount:y}),(o=S.notify)==null||o.call(S,w(P.locale,"PSD 媛?몄삤湲??꾨즺"))}catch(i){let a=w(P.locale,i instanceof Error?i.message:"PSD 媛?몄삤湲곗뿉 ?ㅽ뙣?덉뒿?덈떎.");N({type:"import-error",message:a}),(n=S.notify)==null||n.call(S,a,{error:!0})}}async function rn(e,t){if(e.mode==="flatten-image"||e.nodes.length===0){if(!e.compositePngBytes||e.compositePngBytes.length===0)throw new Error("PSD ?⑹꽦 ?대?吏瑜?李얠? 紐삵뻽?듬땲??");let r=Q({kind:"bitmap",name:e.rootName,x:0,y:0,width:e.documentWidth,height:e.documentHeight,opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,pngBytes:e.compositePngBytes});return t.appendChild(r),1}return lr(e.nodes,t,e.warnings)}function ar(e,t){if(e==="current-page")return figma.currentPage;let r=figma.createPage();return r.parent||figma.root.appendChild(r),r.name=on(t),r}function on(e){let t=e.trim();return t.length>0?"".concat(t," import"):"PSD import"}function nn(e,t){let r=figma.createFrame();r.name=e.rootName,r.resize(Math.max(1,d(e.documentWidth)),Math.max(1,d(e.documentHeight))),r.clipsContent=!1,r.fills=[],r.strokes=[];let o=sr(e.placement,e.documentWidth,e.documentHeight);return r.x=o.x,r.y=o.y,t.appendChild(r),r}function sr(e,t,r){return e==="new-page"?{x:0,y:0}:{x:x(figma.viewport.center.x-t/2),y:x(figma.viewport.center.y-r/2)}}async function lr(e,t,r){let o=0;for(let n of e){let i=await ur(n,r);i&&(t.appendChild(i.node),cr(i.node,n,t),o+=i.count)}return o}async function ur(e,t){if(e.kind==="group"){if(e.width<=0||e.height<=0)return null;let r=figma.createFrame();r.resize(Math.max(1,d(e.width)),Math.max(1,d(e.height))),r.clipsContent=!1,r.fills=[],r.strokes=[],r.x=x(e.x),r.y=x(e.y),ve(r,e,!0);let o=1;for(let n of e.children){let i=await ur(n,t);i&&(r.appendChild(i.node),cr(i.node,n,r),o+=i.count)}return{node:r,count:o}}if(e.kind==="text"){let r=await sn(e,t);return r?{node:r,count:1}:null}return e.kind==="shape"?{node:an(e),count:1}:e.width<=0||e.height<=0||e.pngBytes.length===0?null:{node:Q(e),count:1}}function cr(e,t,r){var c,p;if(e.type!=="TEXT"||t.kind!=="text")return;let o=t.text.shapeType==="box"?(c=k(e))!=null?c:I(e):(p=I(e))!=null?p:k(e),n=k(r),i=o&&n?o.x-n.x:e.x,a=o&&n?o.y-n.y:e.y,s=x(t.x-i),l=x(t.y-a);if(s===0&&l===0)return;let u=e.relativeTransform;e.relativeTransform=[[u[0][0],u[0][1],u[0][2]+s],[u[1][0],u[1][1],u[1][2]+l]]}function Q(e){let t=figma.createRectangle();t.resize(Math.max(1,d(e.width)),Math.max(1,d(e.height))),t.x=x(e.x),t.y=x(e.y),t.strokes=[],t.cornerRadius=0;let r=figma.createImage(e.pngBytes);return t.fills=[{type:"IMAGE",imageHash:r.hash,scaleMode:"FILL"}],ve(t,e,!1),t}function an(e){let t=figma.createRectangle();return t.resize(Math.max(1,d(e.width)),Math.max(1,d(e.height))),t.x=x(e.x),t.y=x(e.y),t.fills=hn(e.fill),t.strokes=[],yn(t,e.shape,e.width,e.height),Sn(t,e.stroke),ve(t,e,!1),t}async function sn(e,t){if(e.width<=0||e.height<=0)return e.pngBytes.length>0?Q(e):null;let r=figma.createText();try{let o=await ln(e,t);if(o.length===0)return r.removed||r.remove(),e.pngBytes.length>0?Q(e):null;await Ce(o[0].fontName),r.fontName=o[0].fontName,r.characters=e.text.value,r.autoRename=!1;for(let n of o)cn(r,n);return dn(r,e),pn(r,e),ve(r,e,!1),r}catch(o){return r.removed||r.remove(),e.pngBytes.length>0?(t.push('"'.concat(e.name,'" editable text could not be reconstructed (').concat(o instanceof Error?o.message:"unknown error","), so a bitmap preview was imported instead.")),Q(e)):null}}async function ln(e,t){let r=await dr(),o=new Map,n=[],i=0;for(let a of e.text.styleRuns){let s=Math.max(0,Math.round(a.length));if(s<=0||i>=e.text.value.length)continue;let l=Math.min(e.text.value.length,i+s),u="".concat(a.style.photoshopFontName,"\0").concat(a.style.fontFamily,"\0").concat(a.style.fontStyle),c=o.get(u);if(!c){let p=un(a.style,r);c=p.fontName,o.set(u,c),p.exact||t.push('"'.concat(e.name,'" uses Photoshop font "').concat(a.style.photoshopFontName,'", so "').concat(c.family," ").concat(c.style,'" was used in Figma.'))}await Ce(c),n.push({start:i,end:l,fontName:c,style:a.style}),i=l}return n}function un(e,t){var a,s;let r=Z(e.fontFamily),o=Z(e.fontStyle),n=Z(e.photoshopFontName),i=null;for(let l of t){let u=l.fontName,c=Z(u.family),p=Z(u.style),g=Z("".concat(u.family).concat(u.style)),y=Z("".concat(u.family,"Regular")),m=0;c===r?m+=100:r.length>0&&(c.includes(r)||r.includes(c))&&(m+=60),p===o?m+=40:o.length>0&&(p.includes(o)||o.includes(p))&&(m+=20),n.length>0&&g===n?m+=120:n.length>0&&y===n&&(m+=100);let T=c===r&&p===o;(!i||m>i.score||m===i.score&&T&&!i.exact)&&(i={fontName:u,score:m,exact:T})}return i&&i.score>0?{fontName:i.fontName,exact:i.exact}:{fontName:(s=(a=t[0])==null?void 0:a.fontName)!=null?s:{family:"Inter",style:"Regular"},exact:!1}}function Z(e){return e.trim().toLowerCase().replace(/[^a-z0-9]/g,"")}async function dr(){return We||(We=figma.listAvailableFontsAsync()),await We}function cn(e,t){e.setRangeFontName(t.start,t.end,t.fontName),e.setRangeFontSize(t.start,t.end,Math.max(1,t.style.fontSize)),e.setRangeLineHeight(t.start,t.end,fn(t.style.lineHeightPx)),e.setRangeLetterSpacing(t.start,t.end,mn(t.style.tracking,t.style.fontSize)),e.setRangeTextCase(t.start,t.end,xn(t.style.fontCaps)),e.setRangeTextDecoration(t.start,t.end,t.style.strikethrough?"STRIKETHROUGH":t.style.underline?"UNDERLINE":"NONE"),e.setRangeFills(t.start,t.end,pr(t.style.fillColor))}function dn(e,t){var r,o,n,i,a,s,l,u;if(e.textAlignHorizontal=gn(t.text.justification),e.textAlignVertical="TOP",t.text.shapeType==="box"){let c=Math.max(1,d(((o=(r=t.text.boxBounds)==null?void 0:r[2])!=null?o:t.width)-((i=(n=t.text.boxBounds)==null?void 0:n[0])!=null?i:0))),p=Math.max(1,d(((s=(a=t.text.boxBounds)==null?void 0:a[3])!=null?s:t.height)-((u=(l=t.text.boxBounds)==null?void 0:l[1])!=null?u:0)));if(t.text.sizingMode==="auto-height"){e.textAutoResize="HEIGHT",e.resizeWithoutConstraints(c,Math.max(1,d(e.height)));return}e.textAutoResize="NONE",e.resizeWithoutConstraints(c,p);return}e.textAutoResize="WIDTH_AND_HEIGHT"}function pn(e,t){let[r,o,n,i,a,s]=t.text.transform,l=Math.hypot(r,o),u=Math.hypot(n,i),c=l>1e-4?r/l:1,p=l>1e-4?o/l:0,g=u>1e-4?n/u:0,y=u>1e-4?i/u:1;e.relativeTransform=[[c,g,x(Number.isFinite(a)?a:t.x)],[p,y,x(Number.isFinite(s)?s:t.y)]]}function fn(e){return e===null||!Number.isFinite(e)||e<=0?{unit:"AUTO"}:{unit:"PIXELS",value:e}}function mn(e,t){return{unit:"PIXELS",value:t>0?e/1e3*t:0}}function xn(e){switch(e){case 2:return"UPPER";case 1:return"SMALL_CAPS";default:return"ORIGINAL"}}function gn(e){switch(e){case"center":case"justify-center":return"CENTER";case"right":case"justify-right":return"RIGHT";case"justify-all":case"justify-left":return"JUSTIFIED";default:return"LEFT"}}function pr(e){return!e||e.a<=0?[]:[{type:"SOLID",color:{r:e.r/255,g:e.g/255,b:e.b/255},opacity:h(e.a/255,0,1)}]}function hn(e){return e?e.kind==="solid"?pr(e.color):[]:[]}function yn(e,t,r,o){let n=Math.min(r,o)/2;e.cornerRadius=0,t.kind==="rounded-rect"&&(e.topLeftRadius=h(t.topLeftRadius,0,n),e.topRightRadius=h(t.topRightRadius,0,n),e.bottomRightRadius=h(t.bottomRightRadius,0,n),e.bottomLeftRadius=h(t.bottomLeftRadius,0,n))}function Sn(e,t){if(!t){e.strokes=[];return}e.strokes=[{type:"SOLID",color:{r:t.color.r/255,g:t.color.g/255,b:t.color.b/255},opacity:h(t.color.a/255,0,1)}],e.strokeWeight=Math.max(0,t.width),e.strokeAlign=t.position==="inside"?"INSIDE":t.position==="outside"?"OUTSIDE":"CENTER"}function ve(e,t,r){e.name=t.name||(t.kind==="group"?"Group":"Layer"),e.visible=t.visible,"opacity"in e&&typeof e.opacity=="number"&&(e.opacity=h(t.opacity,0,1)),"blendMode"in e&&(e.blendMode=J(t.blendMode,r)),bn(e,t.effects),Pn(e,t.strokeEffect),function(o,n){/*PIGMA_TEXT_IMPORT_GUARD::SOURCE_ID_TAGGING*/if(!o||typeof o.setPluginData!="function"||!n||n.id==null)return;try{o.setPluginData("__pigmaImportSourceId",String(n.id)),o.setPluginData("__pigmaImportSourceKind",String(n.kind||""))}catch(i){}}(e,t)}function bn(e,t){if(!("effects"in e))return;let r=e;r.effects=En(t)}function En(e){if(!e)return[];let t=[];for(let r of e)switch(r.style){case"drop-shadow":t.push({type:"DROP_SHADOW",color:ye(r.color),offset:{x:r.offsetX,y:r.offsetY},radius:r.blur,spread:r.spread,visible:!0,blendMode:J(r.blendMode,!1),showShadowBehindNode:r.showBehindTransparentAreas});break;case"inner-shadow":t.push({type:"INNER_SHADOW",color:ye(r.color),offset:{x:r.offsetX,y:r.offsetY},radius:r.blur,spread:r.spread,visible:!0,blendMode:J(r.blendMode,!1)});break;case"outer-glow":t.push({type:"DROP_SHADOW",color:ye(r.color),offset:{x:0,y:0},radius:r.blur,spread:r.spread,visible:!0,blendMode:J(r.blendMode,!1),showShadowBehindNode:!0});break;case"inner-glow":t.push({type:"INNER_SHADOW",color:ye(r.color),offset:{x:0,y:0},radius:r.blur,spread:r.spread,visible:!0,blendMode:J(r.blendMode,!1)});break;case"layer-blur":t.push({type:"LAYER_BLUR",blurType:"NORMAL",radius:r.blurType==="PROGRESSIVE"?Math.max(r.startRadius,r.radius):r.radius,visible:!0});break;case"background-blur":t.push({type:"BACKGROUND_BLUR",blurType:"NORMAL",radius:r.radius,visible:!0});break;case"noise":case"texture":break}return t}function ye(e){return{r:h(e.r/255,0,1),g:h(e.g/255,0,1),b:h(e.b/255,0,1),a:h(e.a/255,0,1)}}function Pn(e,t){if(!t||!("strokes"in e)||!("strokeWeight"in e)||!("strokeAlign"in e))return;let r=e;r.strokes=[{type:"SOLID",color:{r:t.color.r/255,g:t.color.g/255,b:t.color.b/255},opacity:h(t.color.a/255,0,1),blendMode:J(t.blendMode,!1)}],r.strokeWeight=Math.max(0,t.width),r.strokeAlign=t.position==="inside"?"INSIDE":t.position==="outside"?"OUTSIDE":"CENTER"}function J(e,t){switch(e){case"pass through":return t?"PASS_THROUGH":"NORMAL";case"darken":return"DARKEN";case"multiply":return"MULTIPLY";case"linear burn":return"LINEAR_BURN";case"color burn":return"COLOR_BURN";case"lighten":return"LIGHTEN";case"screen":return"SCREEN";case"linear dodge":return"LINEAR_DODGE";case"color dodge":return"COLOR_DODGE";case"overlay":return"OVERLAY";case"soft light":return"SOFT_LIGHT";case"hard light":return"HARD_LIGHT";case"difference":return"DIFFERENCE";case"exclusion":return"EXCLUSION";case"hue":return"HUE";case"saturation":return"SATURATION";case"color":return"COLOR";case"luminosity":return"LUMINOSITY";default:return"NORMAL"}}async function se(){var n,i,a;let e=be;if(!e)return;O=e.developerExportExperiments;let t=e.nextIndex;if(t>=e.rootCount){N({type:"export-finished",fileName:e.bundleFileName,rootCount:e.rootCount}),e.rootCount===1&&e.singlePayloadSummary?(n=S.notify)==null||n.call(S,w(P.locale,"PSD ready: ".concat(e.singlePayloadSummary.exportNodeCount," layers, ").concat(e.singlePayloadSummary.editableTextCount," text candidates"))):(i=S.notify)==null||i.call(S,w(P.locale,"".concat(e.rootCount," PSD files are ready. The download will be packaged as a ZIP archive."))),be=null,Qe(),le();return}let r=(e.roots||e.nodes)[t],o="node"in r?r.node:r,s="node"in r?r:null,u=f(o);ae("build-marker",{patch:"root-preserved-20260319-1949",main:"code.patched.js"});try{let l=await Dn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,s);e.rootCount===1&&(e.singlePayloadSummary={exportNodeCount:l.exportNodeCount,editableTextCount:l.editableTextCount});let c=Xe(l);e.nextIndex+=1,N({type:"export-root-ready",fileName:e.bundleFileName,rootIndex:t+1,rootCount:e.rootCount,payload:c}),qe(l),e.nextIndex>=e.rootCount&&await se()}catch(l){let c=await Nn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(c){e.rootCount===1&&(e.singlePayloadSummary={exportNodeCount:c.exportNodeCount,editableTextCount:c.editableTextCount});let p=Xe(c);e.nextIndex+=1,N({type:"export-root-ready",fileName:e.bundleFileName,rootIndex:t+1,rootCount:e.rootCount,payload:p}),qe(c),e.nextIndex>=e.rootCount&&await se();return}let g=await Tn(o,e.hiddenLayerMode,e.settings,t+1,e.rootCount,e.includeCompositePng,l,s);if(g){e.rootCount===1&&(e.singlePayloadSummary={exportNodeCount:g.exportNodeCount,editableTextCount:g.editableTextCount});let p=Xe(g);e.nextIndex+=1,N({type:"export-root-ready",fileName:e.bundleFileName,rootIndex:t+1,rootCount:e.rootCount,payload:p}),qe(g),e.nextIndex>=e.rootCount&&await se();return}be=null,Qe(),le();let y=w(P.locale,l instanceof Error?e.rootCount>1?'Export failed for "'.concat(u,'" (').concat(t+1,"/").concat(e.rootCount,"): ").concat(l.message):l.message:"An unknown error happened while building the PSD.");N({type:"export-error",message:y}),(a=S.notify)==null||a.call(S,y,{error:!0})}}async function Nn(e,t,r,o,n,i,a,s=null){let l=s?s.documentBounds:xe(e);if(!l)return null;let u=s?s.analysis:Ie(e,t);return u.exportNodeCount===0||!ir(l,u.containsHeavyEffects)?null:await fr(e,t,r,o,n,i,u,a instanceof Error&&a.message.trim().length>0?a.message.trim():null,s)}async function Tn(e,t,r,o,n,i,a,s=null){let l=s?s.documentBounds:xe(e);if(!l)return null;let u=s?s.analysis:Ie(e,t);if(u.exportNodeCount===0||!nr(l,u.containsHeavyEffects))return null;let c=f(e),p=d(l.width),g=d(l.height),y=new Set(u.warnings);y.add(Xo(c,p,g)),y.add(Ko(c,a instanceof Error&&a.message.trim().length>0?a.message.trim():"unknown error")),N({type:"export-started",rootName:c,rootIndex:o,rootCount:n,total:1}),N({type:"export-progress",rootName:c,rootIndex:o,rootCount:n,current:1,total:1,layerName:c});let m=await e.exportAsync({format:"PNG",useAbsoluteBounds:l.useAbsoluteBounds});return{fileName:He(e,r,o,n),rootName:e.name||"Untitled",documentWidth:p,documentHeight:g,compositePngBytes:i?m:null,nodes:[{kind:"bitmap",id:"".concat(e.id,":safe-root"),name:c,sourceType:"".concat(e.type,"_SAFE_ROOT"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:0,y:0,width:p,height:g,nodeTransform:null,pngBytes:m}],warnings:Array.from(y),exportNodeCount:1,editableTextCount:0,preservedGroupCount:0,hasEditableText:!1,backgroundDebug:[]}}async function Dn(e,t,r,o,n,i,a=null){let s=Date.now(),l=a?a.documentBounds:xe(e);if(!l)throw new Error("Unable to calculate document bounds for the selected root.");let u=a?a.analysis:Ie(e,t);if(u.exportNodeCount===0)throw new Error(t==="ignore-hidden"?"No exportable layers remain after ignoring hidden layers.":"There are no visible exportable layers inside this selection.");let c=lt(l,u.containsHeavyEffects);ae("payload-start",{rootName:f(e),rootIndex:o,rootCount:n,includeCompositePng:i,exportNodeCount:u.exportNodeCount,documentWidth:d(l.width),documentHeight:d(l.height),longFrameMode:c});let p={root:e,documentBounds:l,totalLeaves:u.exportNodeCount,currentLeaf:0,warnings:new Set(u.warnings),editableTextCount:0,preservedGroupCount:0,hiddenLayerMode:t,settings:r,backgroundDebug:[],rootName:f(e),rootIndex:o,rootCount:n,lastProgressPostedAt:0,longFrameMode:c};c&&p.warnings.add(ut(d(l.width),d(l.height),u.containsHeavyEffects)),N({type:"export-started",rootName:p.rootName,rootIndex:p.rootIndex,rootCount:p.rootCount,total:p.totalLeaves});let g=mt(e,t),y=[];for(let m of g){let T=await ct(m,p);T&&y.push(T)}if(!y.length)throw new Error("The exporter could not produce any PSD layers from this selection.");ae("payload-nodes-built",{rootName:p.rootName,nodeCount:y.length,warningCount:p.warnings.size,editableTextCount:p.editableTextCount,durationMs:Date.now()-s});let C=i?await e.exportAsync({format:"PNG",useAbsoluteBounds:l.useAbsoluteBounds}):null;return C&&ae("payload-composite-exported",{rootName:p.rootName,bytes:C.byteLength,durationMs:Date.now()-s}),{fileName:He(e,r,o,n),rootName:e.name||"Untitled",documentWidth:d(l.width),documentHeight:d(l.height),compositePngBytes:C,nodes:y,warnings:Array.from(p.warnings),exportNodeCount:p.totalLeaves,editableTextCount:p.editableTextCount,preservedGroupCount:p.preservedGroupCount,hasEditableText:p.editableTextCount>0,backgroundDebug:p.backgroundDebug}}async function fr(e,t,r,o,n,i,a,s=null,l=null){let u=l?l.documentBounds:xe(e);if(!u)throw new Error("Unable to calculate document bounds for the selected root.");let c=lt(u,a.containsHeavyEffects),p=f(e),g=d(u.width),y=d(u.height),m=new Set(a.warnings);m.add(Wo(p,g,y)),s&&m.add(Zo(p,s));let T={root:e,documentBounds:u,totalLeaves:a.exportNodeCount,currentLeaf:0,warnings:m,editableTextCount:0,preservedGroupCount:0,hiddenLayerMode:t,settings:r,backgroundDebug:[],rootName:p,rootIndex:o,rootCount:n,lastProgressPostedAt:0,longFrameMode:c};c&&T.warnings.add(ut(g,y,a.containsHeavyEffects)),ae("payload-safe-layered-start",{rootName:p,rootIndex:o,rootCount:n,includeCompositePng:i,exportNodeCount:a.exportNodeCount,documentWidth:g,documentHeight:y,longFrameMode:c}),N({type:"export-started",rootName:T.rootName,rootIndex:T.rootIndex,rootCount:T.rootCount,total:T.totalLeaves});let C=t==="ignore-hidden"&&!q(e)?[]:[e];ae("payload-safe-layered-entry",{rootName:p,entryCount:C.length,entryMode:"root-preserved"});let E=[];for(let R of C){let wt=await mr(R,T);wt&&E.push(wt)}if(!E.length)throw new Error("The exporter could not produce any PSD layers from this selection.");let k=i?await e.exportAsync({format:"PNG",useAbsoluteBounds:u.useAbsoluteBounds}):null;return{fileName:He(e,r,o,n),rootName:e.name||"Untitled",documentWidth:g,documentHeight:y,compositePngBytes:k,nodes:E,warnings:Array.from(T.warnings),exportNodeCount:T.currentLeaf,editableTextCount:T.editableTextCount,preservedGroupCount:T.preservedGroupCount,hasEditableText:T.editableTextCount>0,backgroundDebug:T.backgroundDebug}}async function mr(e,t){if(t.hiddenLayerMode==="ignore-hidden"&&!q(e))return null;if(Cr(e)){let r=await gr(e,t,Ut(e));if(r.length>0)return t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:r}}let r=e===t.root&&V(e)&&e.children.length>0&&Ur(e),o=r||hi(e);if(o){let n=await kn(e,t,Ut(e));if(n)return t.preservedGroupCount+=1,n;let i=await gr(e,t);if(i.length>0)return t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it preserved the child layers without a synthetic background.")),t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:i};t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it was flattened."))}return await xr(e,t)}function vn(e,t){if(!Cr(e))return!1;let r=ue(e,t);return r.length===0?!1:r.every(o=>o.kind==="node")}async function wn(e,t){let r=[],o=ue(e,t.hiddenLayerMode);for(let n of o){if(n.kind!=="node")return await xr(e,t);let i=await mr(n.node,t);i&&r.push(i)}return r.length===0?null:(t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:r})}async function xr(e,t){var n;let r=e.type==="TEXT"&&(n=ge(e,!1))!=null?n:v(e);if(!r)return t.warnings.add('"'.concat(f(e),'" was skipped because it has no exportable bounds.')),null;if(t.longFrameMode&&pe(e)&&De(r)){t.currentLeaf+=1,Y(t,f(e));let i=await pt(e,r,void 0,t.documentBounds);return t.warnings.add(Te(f(e),i.length)),Be(e.id,f(e),e.type,1,e.visible,"normal",i)}let o=await Me(e,t,r);return o?{kind:"bitmap",id:e.id,name:f(e),sourceType:e.type,opacity:1,visible:e.visible,blendMode:"normal",effects:null,strokeEffect:null,x:o.x,y:o.y,width:o.width,height:o.height,nodeTransform:de(e,t.documentBounds,o.x,o.y),pngBytes:o.pngBytes}:null}function Xe(e){return B(b({},e),{warnings:e.warnings.map(t=>w(P.locale,t))})}async function ct(e,t,r=null){var i,a,s;if(t.hiddenLayerMode==="ignore-hidden"&&!q(e))return null;let o=e.type==="TEXT"?await Hn(e):null;if(o&&!o.ok)return t.warnings.add(o.reason),await Cn(e,t);let n=Fe(e);if(n==="group"){let l=e,u=await gr(l,t,(i=Ut(l))!=null?i:r);if(u.length>0)return t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(l,t.documentBounds,t.root),children:u}}if(n==="split"){let l=await kn(e,t,(a=Ut(e))!=null?a:r);if(l)return t.preservedGroupCount+=1,l;let u=await gr(e,t,r);if(u.length>0)return t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it preserved the child layers without a synthetic background.")),t.preservedGroupCount+=1,{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:null,strokeEffect:null,mask:containerMask(e,t.documentBounds,t.root),children:u};t.warnings.add("\"".concat(f(e),"\" could not separate its background cleanly, so it was flattened."))}if(progressiveBlurShouldRasterize(L(e,t.root)))return await qn(e,t,r);if(e.type==="TEXT"&&t.settings.textExportMode!=="rasterize-text"){let l=await Gn(e,t,r);if(l)return _(l.effects)||(t.editableTextCount+=1),l}if(Re(e)){let l=(s=ft(e))!=null?s:v(e),u=!t.longFrameMode?await pigmaExportMultiFillGroup(e,t,r,l):null;if(u)return t.preservedGroupCount+=1,u;if(t.longFrameMode&&!!l&&Ne(d(l.width),d(l.height),!1))t.warnings.add(jo(f(e)));else{let c=await Jn(e,t);if(c)return c;t.warnings.add("\"".concat(f(e),"\" could not keep its SVG/vector data, so it fell back to a bitmap layer."))}}if(V(e)&&e.children.length>0){let l=L(e);_(l)?t.warnings.add(Mr(e,"past")):ze(e)?t.warnings.add(Ir(e,"past")):$e(l)?t.warnings.add(Rr(e,"past")):Pt(l)?t.warnings.add(Ar(e,"past")):t.warnings.add(Br(e,"past"))}return await qn(e,t,r)}async function Cn(e,t){var a;let r=e.type==="TEXT"&&(a=ge(e,!1))!=null?a:v(e);if(!r)return t.warnings.add('"'.concat(f(e),'" was skipped because it has no exportable bounds.')),null;if(t.currentLeaf+=1,Y(t,f(e)),t.longFrameMode&&pe(e)&&De(r)){let s=await pt(e,r,void 0,t.documentBounds);return t.warnings.add(Te(f(e),s.length)),Be(e.id,f(e),e.type,1,e.visible,"normal",s)}let o=await e.exportAsync({format:"PNG",useAbsoluteBounds:r.useAbsoluteBounds}),n=x(r.x-t.documentBounds.x),i=x(r.y-t.documentBounds.y);return{kind:"bitmap",id:e.id,name:f(e),sourceType:e.type,opacity:1,visible:e.visible,blendMode:"normal",effects:null,strokeEffect:null,x:n,y:i,width:d(r.width),height:d(r.height),nodeTransform:de(e,t.documentBounds,n,i),pngBytes:o}}async function kn(e,t,r=null){let o=await gr(e,t,r),n=await pigmaExportMultiFillBackgroundGroup(e,t,r);if(n)return n.backgroundLayer&&(o.push(n.backgroundLayer)),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:n.groupEffects,strokeEffect:n.groupStrokeEffect,mask:containerMask(e,t.documentBounds,t.root),children:o};let i=L(e,t.root),a=me(e),s=await Rn(e,t),l=Bn(s,i,a);return!l.backgroundLayer&&o.length===0?null:(l.backgroundLayer&&(o.push(l.backgroundLayer),(l.backgroundLayer.kind==="bitmap"||l.backgroundLayer.kind==="shape")&&ha(t.backgroundDebug,ga(e,l.backgroundLayer,o.length-1,o.length))),{kind:"group",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:K(e),effects:l.groupEffects,strokeEffect:l.groupStrokeEffect,mask:containerMask(e,t.documentBounds,t.root),children:o})}function Bn(e,t,r){if(!e)return{backgroundLayer:null,groupEffects:t,groupStrokeEffect:r};let o=Hi(t),n=Vi(t);if(!o&&!r)return{backgroundLayer:e,groupEffects:n,groupStrokeEffect:null};if(e.kind==="group")return{backgroundLayer:e,groupEffects:null,groupStrokeEffect:null};let i=e.kind==="shape"&&e.stroke?null:r;return{backgroundLayer:B(b({},e),{effects:o,strokeEffect:i}),groupEffects:n,groupStrokeEffect:null}}async function gr(e,t,r=null){let o=[],n=ue(e,t.hiddenLayerMode);for(let i of n){let a=await Mn(i,t,r);a&&o.push(a)}return o}async function Mn(e,t,r=null){return e.kind==="node"?await ct(e.node,t,r):await In(e,t,r)}async function In(e,t,r=null){var a;let o=(a=Lr(e.maskNode,xt(e.maskNode)))!=null?a:r,n=[];for(let s of e.maskedNodes){let l=await ct(s,t,o);l&&n.push(l)}if(n.length===0)return null;let i=await Si(e.maskNode,t);return i?(t.preservedGroupCount+=1,{kind:"group",id:"".concat(e.maskNode.id,":mask-group"),name:f(e.maskNode),sourceType:"MASK_OBJECT",opacity:1,visible:e.maskNode.visible,blendMode:"pass through",effects:null,strokeEffect:null,mask:i,children:n}):(t.warnings.add('"'.concat(f(e.maskNode),'" could not be reconstructed as a PSD mask.')),null)}async function Rn(e,t){if(!Ln(e))return null;let r=An(e,t.documentBounds,t);if(r)return r;if(!Ur(e))return null;let o=Fn(e);if(!o)return null;if(!await preloadTreeFontsSafely(e))return null;let n=oa(e),i=n&&((n.normalizePaintOpacity===!0)||(n.normalizePaintBlendMode===!0))?n:null,a=!!L(e,t.root)||!!fe(e,t.root),s=me(e),l=e.clone();try{try{if(Ii(l),i&&to(l,i),bt(l,o),t.longFrameMode&&De(o)){let u=await Er(l,o,t.documentBounds);return t.warnings.add(Te("".concat(f(e)," background"),u.length)),Be("".concat(e.id,":background"),"Background","".concat(e.type,"_BACKGROUND"),i?i.effectiveOpacity:1,!0,at(i?i.effectiveBlendMode:"normal"),u)}let c=await Me(l,t,o,{normalizePaintOpacity:(i==null?void 0:i.normalizePaintOpacity)===!0,normalizePaintBlendMode:(i==null?void 0:i.normalizePaintBlendMode)===!0,removeSupportedEffects:a,removeSupportedStroke:!!s});return c?{kind:"bitmap",id:"".concat(e.id,":background"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND"),opacity:i?i.effectiveOpacity:1,visible:!0,blendMode:at(i?i.effectiveBlendMode:"normal"),effects:null,strokeEffect:null,x:c.x,y:c.y,width:c.width,height:c.height,nodeTransform:null,pngBytes:c.pngBytes}:null}catch(c){return null}}finally{l.removed||l.remove()}}function An(e,t,r){if(fe(e))return null;let o=Di(e),n=oa(e),i=n&&((n.normalizePaintOpacity===!0)||(n.normalizePaintBlendMode===!0))?n:null;if(!o)return null;let a=Fr(e,t);return!a||!o.fill&&!o.stroke?null:{kind:"shape",id:"".concat(e.id,":background-shape"),name:"Background",sourceType:"".concat(e.type,"_BACKGROUND_SHAPE"),opacity:i?i.effectiveOpacity:1,visible:!0,blendMode:at(i?i.effectiveBlendMode:"normal"),effects:null,strokeEffect:null,x:a.x,y:a.y,width:a.width,height:a.height,nodeTransform:null,shape:a,fill:o.fill,stroke:o.stroke}}function Ln(e){return X(e,"fills")||X(e,"strokes")?!0:te(e)}function Fn(e){let t=k(e);if(t&&t.width>0&&t.height>0)return{x:t.x,y:t.y,width:t.width,height:t.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let r=ce(e);if(r)return r}return v(e)}function tt(e){var r;let o=Zr(e)||re(e),n=o?v(e):null;if(e.type==="TEXT")return n!=null?n:v(e);if(Re(e))return n!=null?n:(r=ft(e))!=null?r:v(e);if(n)return n;let t=k(e);if(t&&t.width>0&&t.height>0)return{x:t.x,y:t.y,width:t.width,height:t.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let i=ce(e);if(i)return i}return v(e)}function Ut(e){if(!ht(e))return null;let t=k(e);if(t&&t.width>0&&t.height>0)return{x:t.x,y:t.y,width:t.width,height:t.height,useAbsoluteBounds:!0};if("absoluteTransform"in e&&"width"in e&&"height"in e){let r=ce(e);if(r)return r}return null}async function hr(e,t,r=null){let o=L(e,t.root);if(!_e(o))return{effects:o,removeSupportedEffects:!!o};if(t.longFrameMode){t.warnings.add($t(f(e)));let a=jt(o);return{effects:a,removeSupportedEffects:!!a}}let i=await Ri(e,t,r);if(!i){t.warnings.add($t(f(e)));let a=jt(o);return{effects:a,removeSupportedEffects:!!a}}return{effects:_i(o,i),removeSupportedEffects:!0}}async function Gn(e,t,r=null){var n;let o=e;try{try{o=(n=await $n(e))!=null?n:e}catch(y){t.warnings.add('"'.concat(f(e),'" could not prepare its editable text clone because Figma could not load one of its fonts, so export continued without the point-text auto-fix.')),o=e}let i=Tr(o,t.documentBounds);if(!i){let y=Pr(o);return y.supported||t.warnings.add(y.reason),null}let a=jr(o,i),s=await hr(e,t,r),l=s.effects,u=_(l),c=me(e);u&&t.warnings.add(eo(f(e)));let p=await zn(o,i,{riskScore:a,removeSupportedEffects:s.removeSupportedEffects||!!u,removeSupportedStroke:!!c});if(!p)return null;_n(i,p.bounds,t.documentBounds,p.usedVisualProbe);let g=await On(o,t,i,p.bounds,{removeSupportedEffects:s.removeSupportedEffects||!!u,removeSupportedStroke:!!c});return g?{kind:"text",id:e.id,name:f(e),sourceType:e.type,opacity:j(e),visible:e.visible,blendMode:ro(e),effects:l,strokeEffect:c,x:g.x,y:g.y,width:g.width,height:g.height,nodeTransform:de(o,t.documentBounds,g.x,g.y),pngBytes:g.pngBytes,text:i}:null}finally{o!==e&&!o.removed&&o.remove()}}async function On(e,t,r,o,n){t.currentLeaf+=1,Y(t,f(e));let i=yt(e)||(n==null?void 0:n.normalizePaintOpacity)===!0||(n==null?void 0:n.normalizePaintBlendMode)===!0||(n==null?void 0:n.removeAllEffects)===!0||(n==null?void 0:n.removeSupportedEffects)===!0||(n==null?void 0:n.removeSupportedStroke)===!0,a=Un(e,r.shapeType,o),s=r.shapeType==="point"||a?await Hr(e,o,n,i):i?await $r(e,o,t,n):await e.exportAsync({format:"PNG",useAbsoluteBounds:o.useAbsoluteBounds});return{x:x(o.x-t.documentBounds.x),y:x(o.y-t.documentBounds.y),width:d(o.width),height:d(o.height),pngBytes:s}}function Un(e,t,r){if(t==="point")return!0;let o=Ae(e,t);return o?Math.abs(o.x-r.x)>.5||Math.abs(o.y-r.y)>.5||Math.abs(o.width-r.width)>.5||Math.abs(o.height-r.height)>.5:!0}async function zn(e,t,r){var a,s;let o=Ae(e,t.shapeType);if(!o)return null;let n=((a=r==null?void 0:r.riskScore)!=null?a:0)>=No?Wr(t,(s=r==null?void 0:r.riskScore)!=null?s:0):null;if(t.shapeType!=="point"){let l=I(e);if(l&&l.width>0&&l.height>0){let u=Vt(o,{x:l.x,y:l.y,width:l.width,height:l.height,useAbsoluteBounds:!1});return{bounds:ie(u,Se(Ht(t),n)),usedVisualProbe:!1}}return{bounds:ie(o,Se(Ht(t),n)),usedVisualProbe:!1}}let i=await Li(e,o,r);if(i){let l=Se(it(e,t),n);return{bounds:ie(Vt(o,i),l),usedVisualProbe:!0}}return{bounds:ie(o,Se(it(e,t),n)),usedVisualProbe:!1}}function Se(e,t){return t?{left:Math.max(e.left,t.left),top:Math.max(e.top,t.top),right:Math.max(e.right,t.right),bottom:Math.max(e.bottom,t.bottom)}:e}function _n(e,t,r,o){let n=x(t.x-r.x),i=x(t.y-r.y),a=x(n+t.width),s=x(i+t.height);e.bounds={left:n,top:i,right:a,bottom:s},e.boundingBox={left:n,top:i,right:a,bottom:s},e.hasVisualBoundsProbe=o}async function $n(e){if(!Wn(e))return null;let t=Zn(e);if(!t)return null;await we(e);let r=e.clone();try{return figma.currentPage.appendChild(r),r.visible=!0,r.textAutoResize="NONE",r.resizeWithoutConstraints(d(t.width),d(t.height)),Xn(e,r,t.x,t.y),Kn(e,r),r}catch(o){throw r.removed||r.remove(),o}}async function we(e){if(!e.characters||e.characters.length===0)return;let t=new Map;for(let r of e.getStyledTextSegments(Kt)){let o=r.fontName,n=ke(o);t.has(n)||t.set(n,o)}await Promise.all(Array.from(t.values(),r=>Ce(r)))}async function dt(e){let t=[],r=[e];for(;r.length>0;){let o=r.pop();if(o){if(o.type==="TEXT"){t.push(o);continue}"children"in o&&r.push(...o.children)}}await Promise.all(t.map(o=>we(o)))}async function preloadTreeFontsSafely(e){try{return await dt(e),!0}catch(t){return!1}}async function outlineLongFrameFallbackTiles(e,t,r=null){let o="";try{o=await e.exportAsync({format:"SVG_STRING",useAbsoluteBounds:t.useAbsoluteBounds,svgOutlineText:!0,svgIdAttribute:!0,svgSimplifyStroke:!1})}catch(i){return null}if(!o||o.trim().length===0)return null;let n=figma.createNodeFromSvg(o);try{let i=("absoluteBoundingBox"in n?n.absoluteBoundingBox:null)||("absoluteRenderBounds"in n?n.absoluteRenderBounds:null);return i&&("x"in n&&(n.x=x(n.x+(t.x-i.x))),"y"in n&&(n.y=x(n.y+(t.y-i.y)))),await Er(n,t,r)}catch(i){return n.removed||n.remove(),null}}async function Hn(e){if(!e.characters||e.characters.length===0)return{ok:!0};let t=new Map;for(let o of e.getStyledTextSegments(Kt)){let n=o.fontName,i=ke(n);t.has(i)||t.set(i,n)}let r=await Vn();for(let[o,n]of t)if(!r.has(o))return{ok:!1,reason:'"'.concat(f(e),'" uses "').concat(yr(n),'", which is not available in this Figma session, so it fell back to a flattened bitmap layer.')};try{return await Promise.all(Array.from(t.values(),o=>Ce(o))),{ok:!0}}catch(o){return{ok:!1,reason:'"'.concat(f(e),'" uses a font that Figma could not prepare for text editing (').concat(jn(o),"), so it fell back to a flattened bitmap layer.")}}}async function Ce(e){let t=ke(e),r=je.get(t);if(r){await r;return}let o=figma.loadFontAsync(e).catch(n=>{throw je.delete(t),new Error('font "'.concat(yr(e),'": ').concat(Sr(n)))});je.set(t,o),await o}function ke(e){return"".concat(e.family,"\0").concat(e.style)}async function Vn(){return Ze||(Ze=dr().then(e=>new Set(e.map(t=>ke(t.fontName))))),await Ze}function yr(e){return"".concat(e.family," ").concat(e.style).trim()}function jn(e){let t=Sr(e);return t.length>0?t:"unknown font loading error"}function Sr(e){return e instanceof Error&&typeof e.message=="string"&&e.message.trim().length>0?e.message.trim():typeof e=="string"&&e.trim().length>0?e.trim():"unknown error"}function Wn(e){if(e.textAutoResize!=="WIDTH_AND_HEIGHT")return!1;let t=k(e),r=I(e);if(!t||!r)return!1;let o=br(t,r),n=Le(e),i=n.ok?n.baseStyle.fontSize:16,a=Math.max(2,d(i*.02));return o.left>=a||o.top>=a||o.right>=a||o.bottom>=a}function Zn(e){let t=k(e),r=I(e),o=t&&r?Yn(t,r):t!=null?t:r;if(!o)return null;let n=Le(e),i=n.ok?n.baseStyle.fontSize:16,a={left:d(Math.max(4,i*.04)),top:d(Math.max(4,i*.03)),right:d(Math.max(8,i*.1)),bottom:d(Math.max(10,i*.12))};return{x:o.x-a.left,y:o.y-a.top,width:o.width+a.left+a.right,height:o.height+a.top+a.bottom,useAbsoluteBounds:!1}}function Xn(e,t,r,o){if("relativeTransform"in t){t.relativeTransform=[[e.absoluteTransform[0][0],e.absoluteTransform[0][1],r],[e.absoluteTransform[1][0],e.absoluteTransform[1][1],o]];return}let n=t;n.x=r,n.y=o}function Kn(e,t){let r=I(e),o=I(t);if(!r||!o)return;let n=x(r.x-o.x),i=x(r.y-o.y);if(n===0&&i===0)return;if("relativeTransform"in t){let s=t.relativeTransform;t.relativeTransform=[[s[0][0],s[0][1],s[0][2]+n],[s[1][0],s[1][1],s[1][2]+i]];return}let a=t;a.x+=n,a.y+=i}function br(e,t){let r=e.x+e.width,o=e.y+e.height,n=t.x+t.width,i=t.y+t.height;return{left:Math.max(0,e.x-t.x),top:Math.max(0,e.y-t.y),right:Math.max(0,n-r),bottom:Math.max(0,i-o)}}function Yn(e,t){let r=Math.min(e.x,t.x),o=Math.min(e.y,t.y),n=Math.max(e.x+e.width,t.x+t.width),i=Math.max(e.y+e.height,t.y+t.height);return{x:r,y:o,width:n-r,height:i-o}}function Be(e,t,r,o,n,i,a){return{kind:"group",id:"".concat(e,":tiles"),name:t,sourceType:r,opacity:o,visible:n,blendMode:i,effects:null,strokeEffect:null,mask:null,children:a.map((s,l)=>({kind:"bitmap",id:"".concat(e,":tile:").concat(l+1),name:"".concat(t," Tile ").concat(l+1),sourceType:"".concat(r,"_TILE"),opacity:1,visible:!0,blendMode:"normal",effects:null,strokeEffect:null,x:s.x,y:s.y,width:s.width,height:s.height,nodeTransform:null,pngBytes:s.pngBytes}))}}async function pt(e,t,r,o=null){let n=(r==null?void 0:r.normalizePaintOpacity)===!0||(r==null?void 0:r.normalizePaintBlendMode)===!0||(r==null?void 0:r.removeAllEffects)===!0||(r==null?void 0:r.removeSupportedEffects)===!0||(r==null?void 0:r.removeSupportedStroke)===!0,i=await preloadTreeFontsSafely(e);if(!i){let a=await outlineLongFrameFallbackTiles(e,t,o);if(a)return a;return[{x:o?x(t.x-o.x):x(t.x),y:o?x(t.y-o.y):x(t.y),width:Math.max(1,d(t.width)),height:Math.max(1,d(t.height)),pngBytes:await e.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}]}let s=e.clone();try{return n&&Oe(s,r),await Er(s,t,o)}finally{s.removed||s.remove()}}async function Er(e,t,r=null){let o=figma.createFrame(),n=Math.max(1,d(t.width)),i=Math.max(1,d(t.height)),a=qo(n,i),s=[];try{o.clipsContent=!0,o.fills=[],o.strokes=[],o.name="__pigma-long-frame-tile__",o.resize(n,Math.min(a,i)),figma.currentPage.appendChild(o),o.appendChild(e);for(let l=0;l<i;l+=a){let u=Math.min(a,i-l),c={x:t.x,y:t.y+l,width:t.width,height:u,useAbsoluteBounds:!1},p=r?x(c.x-r.x):x(c.x),g=r?x(c.y-r.y):x(c.y);o.resize(n,Math.max(1,u)),o.x=x(c.x),o.y=x(c.y),_r(e,t,c),s.push({x:p,y:g,width:n,height:d(u),pngBytes:await o.exportAsync({format:"PNG",useAbsoluteBounds:!1})})}return s}finally{o.removed||o.remove(),e.removed||e.remove()}}async function qn(e,t,r=null){var g,y;let o=oa(e),n=e.type==="TEXT"?Gi(e,t.documentBounds):null,i=(g=n!=null?n:tt(e))!=null?g:v(e),a=o!=null&&o.warning?o.warning:null;if(a&&t.warnings.add(a),!t.longFrameMode){let T=await pigmaExportMultiFillGroup(e,t,r,i);if(T)return T}if(t.longFrameMode&&i&&pe(e)&&De(i)){t.currentLeaf+=1,Y(t,f(e));let T=await pt(e,i,{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0});return t.warnings.add(Te(f(e),T.length)),Be(e.id,f(e),e.type,o?o.effectiveOpacity:j(e),e.visible,at(o?o.effectiveBlendMode:K(e)),T)}let s=await hr(e,t,r),l=s.effects,u=_(l),c=me(e),p=progressiveBlurShouldRasterize(l),d=Re(e)?Nr(e):null,m=(e.type==="LINE"||e.type==="VECTOR")&&!!c&&!(d!=null&&d.fill),h=o||l||c||u?p?{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0}:{normalizePaintOpacity:(o==null?void 0:o.normalizePaintOpacity)===!0,normalizePaintBlendMode:(o==null?void 0:o.normalizePaintBlendMode)===!0,removeSupportedEffects:s.removeSupportedEffects||!!u,removeSupportedStroke:!!c&&!m}:void 0,Bounds=p?(n!=null?n:v(e)):n!=null?n:(o||l||c||u)&&(y=tt(e))!=null?y:void 0;p&&t.warnings.add('"'.concat(f(e),'" kept its progressive blur as a bitmap layer for closer Photoshop matching.'));let E=n&&e.type==="TEXT"?await Qn(e,t,n,h):await Me(e,t,Bounds,h);return E?{kind:"bitmap",id:e.id,name:f(e),sourceType:e.type,opacity:o?o.effectiveOpacity:j(e),visible:e.visible,blendMode:at(o?o.effectiveBlendMode:K(e)),effects:p?null:l,strokeEffect:p||m?null:c,x:E.x,y:E.y,width:E.width,height:E.height,nodeTransform:de(e,t.documentBounds,E.x,E.y),pngBytes:E.pngBytes}:null}async function Jn(e,t){if(O.forceBitmapVectorPreview)return null;let r=ft(e);if(!r)return null;let o=L(e,t.root),n=_(o),i=me(e),a=Nr(e),s=oa(e),l="fills"in e&&Array.isArray(e.fills)?e.fills.some(W):!1,u=(e.type==="LINE"||e.type==="VECTOR")&&!!i&&!l;if(u)return null;let c=!!i&&!(a!=null&&a.fill)&&!I(e)?Math.max(3,Math.ceil(i.width/2)+2):0,p=c?{x:r.x-c,y:r.y-c,width:r.width+c*2,height:r.height+c*2,useAbsoluteBounds:!1}:r,g=await Me(e,t,o||i||n||s?p:void 0,o||i||n||s?{normalizePaintOpacity:(s==null?void 0:s.normalizePaintOpacity)===!0,normalizePaintBlendMode:(s==null?void 0:s.normalizePaintBlendMode)===!0,removeSupportedEffects:!0,removeSupportedStroke:!!i&&!!a.fill}:void 0);if(!g)return null;let y=x(r.x-t.documentBounds.x),m=x(r.y-t.documentBounds.y),T=d(r.width),C=d(r.height),E=x(g.x-y),R=x(g.y-m),N="";try{N=await e.exportAsync({format:"SVG_STRING",useAbsoluteBounds:r.useAbsoluteBounds,svgOutlineText:!0,svgIdAttribute:!0,svgSimplifyStroke:!1})}catch(F){return null}if(!N||N.trim().length===0)return null;return{kind:"vector",id:e.id,name:f(e),sourceType:e.type,opacity:s?s.effectiveOpacity:j(e),visible:e.visible,blendMode:at(s?s.effectiveBlendMode:K(e)),effects:o,strokeEffect:a.fill?i:null,x:y,y:m,width:T,height:C,nodeTransform:de(e,t.documentBounds,y,m),pngBytes:g.pngBytes,strategy:a.strategy,svgString:N,fill:a.fill,previewOffsetX:E,previewOffsetY:R}}async function Qn(e,t,r,o){t.currentLeaf+=1,Y(t,f(e));let n=yt(e)||(o==null?void 0:o.normalizePaintOpacity)===!0||(o==null?void 0:o.normalizePaintBlendMode)===!0||(o==null?void 0:o.removeAllEffects)===!0||(o==null?void 0:o.removeSupportedEffects)===!0||(o==null?void 0:o.removeSupportedStroke)===!0,i=await Hr(e,r,o,n);return{x:x(r.x-t.documentBounds.x),y:x(r.y-t.documentBounds.y),width:d(r.width),height:d(r.height),pngBytes:i}}async function Me(e,t,r,o){let n=r!=null?r:v(e);if(!n)return t.warnings.add('"'.concat(f(e),'" was skipped because it has no exportable bounds.')),null;t.currentLeaf+=1,Y(t,f(e));let a=yt(e)||(o==null?void 0:o.normalizePaintOpacity)===!0||(o==null?void 0:o.normalizePaintBlendMode)===!0||(o==null?void 0:o.removeAllEffects)===!0||(o==null?void 0:o.removeSupportedEffects)===!0||(o==null?void 0:o.removeSupportedStroke)===!0?await $r(e,n,t,o):await e.exportAsync({format:"PNG",useAbsoluteBounds:n.useAbsoluteBounds});return{x:x(n.x-t.documentBounds.x),y:x(n.y-t.documentBounds.y),width:d(n.width),height:d(n.height),pngBytes:a}}function Y(e,t){let r=Date.now();!(e.currentLeaf>=e.totalLeaves)&&r-e.lastProgressPostedAt<Eo||(e.lastProgressPostedAt=r,N({type:"export-progress",rootName:e.rootName,rootIndex:e.rootIndex,rootCount:e.rootCount,current:e.currentLeaf,total:e.totalLeaves,layerName:t}))}function Ie(e,t){let r={exportNodeCount:0,editableTextCount:0,preservedGroupCount:0,containsHeavyEffects:!1,warnings:new Set},o=mt(e,t);for(let n of o)rt(n,r,t,e);return r}function rt(e,t,r,o){if(r==="ignore-hidden"&&!q(e))return;Yo(e,o)&&(t.containsHeavyEffects=!0),te(e,o)&&t.warnings.add(yi(e));let n=Fe(e);if(n==="group"){let i=ue(e,r);if(i.length>0){t.preservedGroupCount+=1;for(let a of i)zt(a,t,r,o);return}}if(n==="split"){t.preservedGroupCount+=1,t.exportNodeCount+=1;let i=ue(e,r);for(let a of i)zt(a,t,r,o);return}if(t.exportNodeCount+=1,t.exportNodeCount+=Wi(L(e,o)),e.type==="TEXT"){let i=Pr(e);i.supported?fe(e,o)?t.warnings.add(eo(f(e))):t.editableTextCount+=1:t.warnings.add(i.reason)}else if(Re(e))Nr(e).strategy==="smart-object"&&t.warnings.add('"'.concat(f(e),'" is a complex vector, so it will export as a smart object instead of a native PSD shape layer.'));else if(V(e)&&e.children.length>0){let i=L(e);_(i)?t.warnings.add(Mr(e,"future")):ze(e)?t.warnings.add(Ir(e,"future")):$e(i)?t.warnings.add(Rr(e,"future")):Pt(i)?t.warnings.add(Ar(e,"future")):t.warnings.add(Br(e,"future"))}re(e)&&t.warnings.add('"'.concat(f(e),'" uses masking and will export as a flattened bitmap layer.'))}function zt(e,t,r,o){if(e.kind==="node"){rt(e.node,t,r,o);return}t.preservedGroupCount+=1,t.exportNodeCount+=1;for(let n of e.maskedNodes)rt(n,t,r,o)}function Pr(e){if(!e.characters||e.characters.length===0)return{supported:!1,reason:'"'.concat(f(e),'" is empty, so it falls back to a bitmap layer.')};let t=Le(e);if(!t.ok)return{supported:!1,reason:'"'.concat(f(e),'" falls back to bitmap: ').concat(t.reason)};let r=Dr(e,t.baseStyle);return r.ok?{supported:!0}:{supported:!1,reason:'"'.concat(f(e),'" falls back to bitmap: ').concat(r.reason)}}function Re(e){return e.type==="VECTOR"||e.type==="BOOLEAN_OPERATION"||e.type==="RECTANGLE"||e.type==="ELLIPSE"||e.type==="POLYGON"||e.type==="STAR"||e.type==="LINE"}function Nr(e){if(re(e)||te(e)||fe(e))return{strategy:"smart-object",fill:null};let t=Ti(e);return t?{strategy:"shape",fill:t}:{strategy:"smart-object",fill:null}}function ft(e){let t=me(e),r=Re(e)?Nr(e):null,o=Re(e)&&!!t&&!(r!=null&&r.fill),n=o?I(e):null;if(n&&n.width>0&&n.height>0)return{x:n.x,y:n.y,width:n.width,height:n.height,useAbsoluteBounds:!1};let i=ce(e);if(!i)return v(e);if(!o)return{x:i.x,y:i.y,width:i.width,height:i.height,useAbsoluteBounds:!0};let a=Math.max(3,Math.ceil(t.width/2)+2);return{x:i.x-a,y:i.y-a,width:i.width+a*2,height:i.height+a*2,useAbsoluteBounds:!1}}function ce(e){let t=ei(e.absoluteTransform,e.width,e.height);if(t.length===0)return null;let r=t.map(l=>l.x),o=t.map(l=>l.y),n=Math.min(...r),i=Math.min(...o),a=Math.max(...r),s=Math.max(...o);return!Number.isFinite(n)||!Number.isFinite(i)||!Number.isFinite(a)||!Number.isFinite(s)?null:{x:n,y:i,width:a-n,height:s-i,useAbsoluteBounds:!0}}function ei(e,t,r){return[{x:0,y:0},{x:t,y:0},{x:t,y:r},{x:0,y:r}].map(n=>({x:e[0][0]*n.x+e[0][1]*n.y+e[0][2],y:e[1][0]*n.x+e[1][1]*n.y+e[1][2]}))}function de(e,t,r,o){if(!("absoluteTransform"in e)||!("width"in e)||!("height"in e))return null;let n=oo(e.absoluteTransform,t);return{matrix:[n[0],n[1],n[2],n[3],D(n[4]-r),D(n[5]-o)],width:d(e.width),height:d(e.height)}}function Tr(e,t){let r=Le(e);if(!r.ok)return null;let o=Dr(e,r.baseStyle);if(!o.ok)return null;let n=Ae(e,o.shapeType);if(!n)return null;let i=oo(e.absoluteTransform,t),a=x(n.x-t.x),s=x(n.y-t.y),l=x(a+n.width),u=x(s+n.height);return{value:r.value,transform:i,bounds:{left:a,top:s,right:l,bottom:u},boundingBox:{left:a,top:s,right:l,bottom:u},hasVisualBoundsProbe:!1,sizingMode:o.sizingMode,shapeType:o.shapeType,pointBase:o.pointBase,boxBounds:o.boxBounds,textTruncation:o.textTruncation,maxLines:o.maxLines,justification:ia(e.textAlignHorizontal),baseStyle:r.baseStyle,styleRuns:r.styleRuns}}function Dr(e,t){if(e.textAutoResize==="TRUNCATE")return{ok:!1,reason:"truncate mode is not mapped safely to editable Photoshop text yet"};if(e.textTruncation==="ENDING")return{ok:!1,reason:"ellipsis truncation is not mapped safely to editable Photoshop text yet"};let r=d(e.width),o=d(e.height),n=ti(e);return ri(e,t)?{ok:!0,sizingMode:n,shapeType:"point",pointBase:[0,0],boxBounds:null,textTruncation:"disabled",maxLines:e.maxLines}:e.textAutoResize==="HEIGHT"?{ok:!0,sizingMode:n,shapeType:"box",pointBase:null,boxBounds:[0,0,r,o],textTruncation:"disabled",maxLines:e.maxLines}:{ok:!0,sizingMode:n,shapeType:"box",pointBase:null,boxBounds:[0,0,r,o],textTruncation:"disabled",maxLines:e.maxLines}}function ti(e){return e.textAutoResize==="WIDTH_AND_HEIGHT"?"auto-width":e.textAutoResize==="HEIGHT"?"auto-height":"fixed"}function ri(e,t){return e.textAutoResize==="WIDTH_AND_HEIGHT"?!0:ni(e)?!1:oi(e,t)===1}function oi(e,t){let r=ai(e.characters);if(r>1)return r;let o=ii(t),n=d(e.height);if(!_t(n,o))return 2;let i=I(e);return i&&!_t(i.height,o)?2:1}function _t(e,t){return e<=t*1.45}function ni(e){let t=Math.max(1,d(e.width)),r=Math.max(1,d(e.height)),o=I(e);return o?o.width>t*1.2||o.height>r*1.05:!1}function ii(e){return e.lineHeightPx!==null&&e.lineHeightPx>0?e.lineHeightPx:Math.max(e.fontSize,e.fontSize*1.2)}function ai(e){return Math.max(1,e.replace(/\r\n?/g,"\n").split("\n").length)}function vr(e){return e.replace(/\r\n?/g,"\n").replace(/\s+/g,"").length}function Ae(e,t){return t==="point"?ge(e,!1):v(e)}function Le(e){let t=e.getStyledTextSegments([...bo]);if(t.length===0)return{ok:!1,reason:"the text node has no style segments"};let r=[],o="";for(let n of t){let i=si(n);if(!i)return{ok:!1,reason:"it uses unsupported fills or text styling for editable export"};o+=li(e.characters.slice(n.start,n.end),n.textCase),r.push({length:n.end-n.start,style:i})}return{ok:!0,value:o,baseStyle:r[0].style,styleRuns:r}}function si(e){let t=di(e.fills);return t?{photoshopFontName:sa(e.fontName),fontFamily:e.fontName.family,fontStyle:e.fontName.style,fontSize:Math.max(1,e.fontSize),fillColor:t,lineHeightPx:aa(e.lineHeight,e.fontSize),tracking:ci(e.letterSpacing,e.fontSize),fontCaps:ui(e.textCase),underline:e.textDecoration==="UNDERLINE",strikethrough:e.textDecoration==="STRIKETHROUGH"}:null}function li(e,t){switch(t){case"UPPER":return e.toLocaleUpperCase();case"LOWER":return e.toLocaleLowerCase();case"TITLE":return e.replace(new RegExp("\\b(\\p{L})(\\p{L}*)","gu"),(r,o,n)=>o.toLocaleUpperCase()+n.toLocaleLowerCase());default:return e}}function ui(e){switch(e){case"UPPER":return 2;case"SMALL_CAPS":case"SMALL_CAPS_FORCED":return 1;default:return 0}}function ci(e,t){return t<=0?0:e.unit==="PIXELS"?Math.round(e.value/t*1e3):Math.round(e.value/100*500)}function di(e){let t=e.filter(o=>W(o));if(t.length!==1)return null;let r=t[0];return r.type!=="SOLID"?null:{r:z(r.color.r*255),g:z(r.color.g*255),b:z(r.color.b*255),a:z((r.opacity!==void 0?r.opacity:1)*255)}}function mt(e,t){return t==="ignore-hidden"&&!q(e)?[]:!V(e)||e.children.length===0?[e]:Cr(e)||hi(e)?[e]:pi(e,t)}function pi(e,t){return ot(e).filter(o=>!(!he(o)||t==="ignore-hidden"&&!q(o)))}function ue(e,t){let r=fi(e).filter(n=>!(!he(n)||t==="ignore-hidden"&&!q(n))),o=[];for(let n=0;n<r.length;n+=1){let i=r[n];if(!re(i)){o.push({kind:"node",node:i});continue}let a=[],s=n+1;for(;s<r.length;s+=1){let l=r[s];if(mi(l))break;a.push(l)}if(a.length===0){o.push({kind:"node",node:i});continue}o.push({kind:"mask-group",maskNode:i,maskedNodes:a.reverse()}),n=s-1}return o.reverse()}function ot(e){let t=e.children.slice();return wr(e)?t:t.reverse()}function fi(e){let t=e.children.slice();return wr(e)?t.reverse():t}function wr(e){return"itemReverseZIndex"in e&&e.itemReverseZIndex===!0}function mi(e){return re(e)||xi(e)||gi(e)}function xi(e){return V(e)?e.children.some(t=>he(t)&&re(t)):!1}function gi(e){return"clipsContent"in e&&e.clipsContent===!0}function Fe(e){return!V(e)||e.children.length===0?null:!yo.has(e.type)||re(e)||"clipsContent"in e&&e.clipsContent&&!ht(e)?"flatten":kr(e)?ze(e)||$i(L(e))?"flatten":So.has(e.type)&&Ur(e)?"split":"flatten":"group"}function Cr(e){return Fe(e)==="group"}function hi(e){return Fe(e)==="split"}function kr(e){return X(e,"fills")||X(e,"strokes")||Zr(e)}function Br(e,t){let r=f(e),o=t==="future"?"will flatten into one bitmap layer":"was flattened";if((e.type==="INSTANCE"||e.type==="COMPONENT")&&kr(e)){let n=e.type==="INSTANCE"?"instance":"component";return'"'.concat(r,'" ').concat(o," because Photoshop cannot preserve Figma ").concat(n," structure once the container also renders its own appearance.")}return'"'.concat(r,'" ').concat(o," because the container renders its own appearance.")}function Mr(e,t){let r=t==="future"?"will flatten into one bitmap layer":"was flattened";return'"'.concat(f(e),'" ').concat(r," because Layer Blur on a container with children must apply to the whole group composite, and that editable group Smart Filter path is not implemented yet.")}function Ir(e,t){let r=t==="future"?"will flatten into one bitmap layer":"was flattened";return'"'.concat(f(e),'" ').concat(r," because Background Blur on a container with children must sample the whole backdrop behind the group composite, and that editable reconstruction path is not implemented yet.")}function Rr(e,t){let r=t==="future"?"will flatten into one bitmap layer":"was flattened";return'"'.concat(f(e),'" ').concat(r," because Photoshop does not reliably reopen container shadow/glow exported as folder layer effects, so this container is rasterized for compatibility.")}function Ar(e,t){let r=t==="future"?"will flatten into one bitmap layer":"was flattened";return'"'.concat(f(e),'" ').concat(r," because top-level Noise or Texture on a container with children must apply to the whole group composite, and that editable reconstruction path is not implemented yet.")}function yi(e){return Xr(e)?'"'.concat(f(e),'" uses Glass, which cannot stay editable in the PSD yet, so it will be baked into raster pixels.'):'"'.concat(f(e),'" uses Figma effects that cannot stay editable in the PSD, so they will be baked into raster pixels.')}function $t(e){return'"'.concat(e,'" uses Background Blur, but Pigma could not isolate a clean editable backdrop snapshot inside the selected export root, so that blur was baked into raster pixels.')}async function Si(e,t){let r=await bi(e,t);return r?{kind:"bitmap",mode:xt(e),x:r.x,y:r.y,width:r.width,height:r.height,pngBytes:r.pngBytes}:null}async function bi(e,t){let r=xt(e),o=Lr(e,r);if(!o)return t.warnings.add('"'.concat(f(e),'" could not provide mask bounds for export.')),null;t.currentLeaf+=1,Y(t,"".concat(f(e)," (Mask)"));let n=await Ei(e,o,t,r);return{x:x(o.x-t.documentBounds.x),y:x(o.y-t.documentBounds.y),width:d(o.width),height:d(o.height),pngBytes:n}}async function Ei(e,t,r,o){await dt(e);let n=e.clone(),i=null;try{if(Pi(n,o),"absoluteTransform"in e&&"relativeTransform"in n){i=figma.createFrame(),i.resize(Math.max(1,d(t.width)),Math.max(1,d(t.height))),i.clipsContent=!0,i.fills=[],i.strokes=[],i.name="__pigma-mask-preview__",i.x=t.x,i.y=t.y,figma.currentPage.appendChild(i),i.appendChild(n),Vr(e,n,t);return await i.exportAsync({format:"PNG",useAbsoluteBounds:!1})}return bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds})}finally{i&&!i.removed&&i.remove(),n.removed||n.remove()}}function Pi(e,t){e.visible=!0,"isMask"in e&&(e.isMask=!1),t==="vector"&&("opacity"in e&&typeof e.opacity=="number"&&(e.opacity=1),"blendMode"in e&&(e.blendMode="NORMAL"),Qr(e),to(e,{normalizePaintOpacity:!0,normalizePaintBlendMode:!0}))}function xt(e){if(!("maskType"in e))return"alpha";switch(e.maskType){case"VECTOR":return"vector";case"LUMINANCE":return"luminance";default:return"alpha"}}function maskPreviewPaddingRadius(e){let t=L(e),r=0;if(t)for(let o of t)o&&o.style==="layer-blur"&&(r=Math.max(r,o.blurType==="PROGRESSIVE"?Math.max(o.startRadius,o.radius):o.radius));return r<=.01?0:Math.ceil(h(r*2.5+8,8,256))}function padExportBounds(e,t){return!e||t<=0?e:{x:e.x-t,y:e.y-t,width:e.width+t*2,height:e.height+t*2,useAbsoluteBounds:!1}}function Lr(e,t){let r=maskPreviewPaddingRadius(e),o=null;if(t!=="vector")return padExportBounds(v(e),r);let n=k(e);if(n&&n.width>0&&n.height>0)o={x:n.x,y:n.y,width:n.width,height:n.height,useAbsoluteBounds:!0};else if("absoluteTransform"in e&&"width"in e&&"height"in e){let i=ce(e);i&&(o=i)}return padExportBounds(o!=null?o:v(e),r)}function gt(e,t){return Fr(e,t,!0)}function Fr(e,t,r=!1){if(r&&!ht(e))return null;let o=k(e);if(!o||o.width<=0||o.height<=0)return null;let n=Ni(e,o.width,o.height);return{kind:"rounded-rect",x:x(o.x-t.x),y:x(o.y-t.y),width:d(o.width),height:d(o.height),topLeftRadius:n.topLeftRadius,topRightRadius:n.topRightRadius,bottomRightRadius:n.bottomRightRadius,bottomLeftRadius:n.bottomLeftRadius}}function redundantRootMask(e,t,r){if(e!==r)return!1;let o=gt(e,t);return!!o&&o.x===0&&o.y===0&&o.width===d(t.width)&&o.height===d(t.height)&&o.topLeftRadius===0&&o.topRightRadius===0&&o.bottomRightRadius===0&&o.bottomLeftRadius===0}function containerMask(e,t,r){return redundantRootMask(e,t,r)?null:gt(e,t)}function ht(e){if(!("clipsContent"in e)||e.clipsContent!==!0||!("width"in e)||!("height"in e))return!1;let t=k(e);return!!t&&t.width>0&&t.height>0}function Ni(e,t,r){let o=Math.min(t,r)/2,n={topLeftRadius:0,topRightRadius:0,bottomRightRadius:0,bottomLeftRadius:0};return!("topLeftRadius"in e)||!("topRightRadius"in e)||!("bottomRightRadius"in e)||!("bottomLeftRadius"in e)?n:{topLeftRadius:h(e.topLeftRadius,0,o),topRightRadius:h(e.topRightRadius,0,o),bottomRightRadius:h(e.bottomRightRadius,0,o),bottomLeftRadius:h(e.bottomLeftRadius,0,o)}}function Ti(e){return te(e)||X(e,"strokes")||!("fills"in e)||!Array.isArray(e.fills)?null:vi(e.fills)}function Di(e){if(te(e))return null;let t="fills"in e&&Array.isArray(e.fills)?wi(e.fills):null,r="strokes"in e&&Array.isArray(e.strokes)?Gr(e.strokes):null,o=null;if(r){let n=Jr(e);if(n===null)return null;o={kind:"solid",color:Ge(r),width:n,position:Or(e)}}return!t&&!o?null:{fill:t,stroke:o}}function vi(e){let t=e.filter(o=>W(o));if(t.length!==1)return null;let r=t[0];return r.type==="SOLID"?{kind:"solid",color:Ge(r)}:Ci(r)?ki(r):null}function wi(e){let t=e.filter(o=>W(o));if(t.length!==1)return null;let r=t[0];return r.type!=="SOLID"?null:{kind:"solid",color:Ge(r)}}function Gr(e){let t=e.filter(o=>W(o));if(t.length!==1)return null;let r=t[0];return r.type!=="SOLID"?null:r}function Ci(e){return e.type==="GRADIENT_LINEAR"||e.type==="GRADIENT_RADIAL"||e.type==="GRADIENT_ANGULAR"||e.type==="GRADIENT_DIAMOND"}function ki(e){var n;if(!Array.isArray(e.gradientStops)||e.gradientStops.length<2)return null;let t=Mi(e.gradientTransform);if(!t)return null;let r=h((n=e.opacity)!=null?n:1,0,1),o=e.gradientStops.slice().sort((i,a)=>i.position-a.position);return{kind:"gradient",gradientType:Bi(e.type),transform:t,colorStops:o.map(i=>({position:h(i.position,0,1),color:ee({r:i.color.r,g:i.color.g,b:i.color.b,a:1})})),opacityStops:o.map(i=>({position:h(i.position,0,1),opacity:h(i.color.a*r,0,1)}))}}function Bi(e){switch(e){case"GRADIENT_LINEAR":return"linear";case"GRADIENT_RADIAL":return"radial";case"GRADIENT_ANGULAR":return"angular";case"GRADIENT_DIAMOND":return"diamond";default:return"linear"}}function Mi(e){if(!Array.isArray(e)||e.length!==2||!Array.isArray(e[0])||!Array.isArray(e[1])||e[0].length!==3||e[1].length!==3)return null;let t=[D(e[0][0]),D(e[1][0]),D(e[0][1]),D(e[1][1]),D(e[0][2]),D(e[1][2])];return t.every(r=>Number.isFinite(r))?t:null}function Ge(e){return ee({r:e.color.r,g:e.color.g,b:e.color.b,a:e.opacity!==void 0?e.opacity:1})}function ee(e){return{r:z(e.r*255),g:z(e.g*255),b:z(e.b*255),a:z(e.a*255)}}function Or(e){if(!("strokeAlign"in e))return"center";switch(e.strokeAlign){case"INSIDE":return"inside";case"OUTSIDE":return"outside";default:return"center"}}function X(e,t){let r=Oi(e,t);return r==null?!1:Array.isArray(r)?r.some(o=>W(o)):!0}function Ur(e){return"clone"in e&&typeof e.clone=="function"}function pe(e){return"clone"in e&&typeof e.clone=="function"}function zr(e,t){let r=[],o=e;for(;o&&o!==t;){let n=o.parent&&"children"in o.parent?o.parent:null;if(!n)return null;let i=o.id,a=n.children.findIndex(s=>s.id===i);if(a<0)return null;r.unshift(a),o=n}return o===t?r:null}function Ii(e){"opacity"in e&&(e.opacity=1),"blendMode"in e&&(e.blendMode="NORMAL");for(let t of e.children)nt(t)}function nt(e){if("opacity"in e&&typeof e.opacity=="number"){e.opacity=0;return}e.visible=!1}async function Ri(e,t,r=null){var s;if(!qr(e,t.root)||!pe(t.root))return null;let o=(s=r!=null?r:tt(e))!=null?s:v(e);if(!o||Sa(o.width,o.height,To))return null;let n=zr(e,t.root);if(!n||n.length===0)return null;if(!await preloadTreeFontsSafely(t.root))return null;let i=t.root.clone(),a=figma.createFrame();try{return a.resize(d(o.width),d(o.height)),a.clipsContent=!0,a.fills=[],a.strokes=[],a.x=o.x,a.y=o.y,a.name="__pigma-background-blur-crop__",figma.currentPage.appendChild(a),a.appendChild(i),Ai(t.root,i,n)?(_r(i,t.documentBounds,o),await a.exportAsync({format:"PNG",useAbsoluteBounds:!1})):null}catch(l){return null}finally{a.removed||a.remove(),i.removed||i.remove()}}function Ai(e,t,r){let o=e,n=t;for(let i=0;i<r.length;i+=1){if(!("children"in o)||!("children"in n))return!1;let a=o.children[r[i]],s=n.children[r[i]];if(!a||!s)return!1;let l=ot(o),u=ot(n),c=l.findIndex(p=>p.id===a.id);if(c<0)return!1;for(let p=0;p<c;p+=1)nt(u[p]);if(i===r.length-1)return nt(s),!0;o=a,n=s}return!1}function _r(e,t,r){let o=x(t.x-r.x),n=x(t.y-r.y);if("relativeTransform"in e){let i=e,a=i.relativeTransform;i.relativeTransform=[[a[0][0],a[0][1],o],[a[1][0],a[1][1],n]];return}if("x"in e&&"y"in e){let i=e;i.x=o,i.y=n}}async function $r(e,t,r,o){await dt(e);let n=e.clone(),i=null,a=Re(e)?Nr(e):null,s=Re(e)&&!!me(e)&&!(a!=null&&a.fill)&&"relativeTransform"in n;try{return Oe(n,o),s?(i=figma.createFrame(),i.resize(Math.max(1,d(t.width)),Math.max(1,d(t.height))),i.clipsContent=!0,i.fills=[],i.strokes=[],i.name="__pigma-vector-preview__",i.x=t.x,i.y=t.y,figma.currentPage.appendChild(i),i.appendChild(n),Vr(e,n,t),await i.exportAsync({format:"PNG",useAbsoluteBounds:!1})):(bt(n,t),await n.exportAsync({format:"PNG",useAbsoluteBounds:t.useAbsoluteBounds}))}finally{i&&!i.removed&&i.remove(),n.removed||n.remove()}}async function Hr(e,t,r,o){await we(e);let n=e.clone(),i=figma.createFrame();try{return i.resize(d(t.width),d(t.height)),i.clipsContent=!0,i.fills=[],i.strokes=[],i.name="__pigma-text-preview-padding__",i.x=t.x,i.y=t.y,figma.currentPage.appendChild(i),i.appendChild(n),o&&Oe(n,r),Vr(e,n,t),await i.exportAsync({format:"PNG",useAbsoluteBounds:!1})}finally{i.removed||i.remove(),n.removed||n.remove()}}async function Li(e,t,r){await we(e);let o=e.clone(),n=figma.createFrame();try{n.resize(d(t.width),d(t.height)),n.clipsContent=!1,n.fills=[],n.strokes=[],n.name="__pigma-text-visual-probe__",n.x=t.x,n.y=t.y,figma.currentPage.appendChild(n),n.appendChild(o),Oe(o,r),Vr(e,o,t);let i=figma.flatten([o],n),a=v(i);return a||null}catch(i){return null}finally{n.removed||n.remove(),o.removed||o.remove()}}function yt(e){return!q(e)||Fi(e)}function Fi(e){return"opacity"in e&&typeof e.opacity=="number"&&!St(e.opacity,1)?!0:"blendMode"in e?e.blendMode!=="NORMAL"&&e.blendMode!=="PASS_THROUGH":!1}function Oe(e,t){e.visible=!0,"opacity"in e&&typeof e.opacity=="number"&&(e.opacity=1),"blendMode"in e&&(e.blendMode="NORMAL"),t!=null&&t.removeAllEffects&&Qr(e),t!=null&&t.removeSupportedEffects&&ta(e),t!=null&&t.removeSupportedStroke&&ra(e),(t!=null&&t.normalizePaintOpacity||t!=null&&t.normalizePaintBlendMode)&&to(e,t)}function q(e){let t=e;for(;t;){if("visible"in t&&t.visible===!1)return!1;t=t.parent}return!0}function St(e,t){return Math.abs(e-t)<1e-4}function bt(e,t){if(e.parent!==figma.currentPage&&figma.currentPage.appendChild(e),"relativeTransform"in e){let r=e,o=r.relativeTransform;r.relativeTransform=[[o[0][0],o[0][1],t.x],[o[1][0],o[1][1],t.y]];return}if("x"in e&&"y"in e){let r=e;r.x=t.x,r.y=t.y}}function Vr(e,t,r){if("relativeTransform"in t){t.relativeTransform=[[e.absoluteTransform[0][0],e.absoluteTransform[0][1],e.absoluteTransform[0][2]-r.x],[e.absoluteTransform[1][0],e.absoluteTransform[1][1],e.absoluteTransform[1][2]-r.y]];return}let o=t,n=e;o.x=n.x-r.x,o.y=n.y-r.y}function it(e,t){let r=Math.max(1,t.baseStyle.fontSize),o=k(e),n=I(e),i=o?o.x+o.width:null,a=o?o.y+o.height:null,s=n?n.x+n.width:null,l=n?n.y+n.height:null,u=o&&n?Math.max(0,o.x-n.x):0,c=o&&n?Math.max(0,o.y-n.y):0,p=i!==null&&s!==null?Math.max(0,s-i):0,g=a!==null&&l!==null?Math.max(0,l-a):0;return{left:d(h(r*.1+u,6,r*.45)),top:d(h(r*.08+c,6,r*.3)),right:d(h(r*.16+p,10,r*.55)),bottom:d(h(r*.24+g,12,r*.7))}}function Ht(e){let t=Math.max(1,e.baseStyle.fontSize),r=vr(e.value),o=r<=1?1.4:r<=3?1.1:1;return{left:d(t*.06*o),top:d(t*.05),right:d(t*.12*o),bottom:d(t*.11*o)}}function jr(e,t){let r=Math.max(1,t.baseStyle.fontSize),o=vr(t.value),i=Math.max(1,t.bounds.right-t.bounds.left)/r,a=t.value.replace(/\s+/g,""),s=0;r>=400?s+=35:r>=240?s+=22:r>=120&&(s+=10),o<=1?s+=25:o<=3&&(s+=14),i<=.3?s+=20:i<=.55&&(s+=10),t.shapeType==="point"&&(s+=8),/[fgjkpqty]/i.test(a)&&(s+=12),/[^\u0000-\u00ff]/.test(a)&&(s+=10);let l=k(e),u=I(e);if(l&&u){let c=br(l,u);(c.left>0||c.top>0||c.right>0||c.bottom>0)&&(s+=10)}return h(s,0,100)}function Gi(e,t){let r=Tr(e,t);if(!r)return null;let o=jr(e,r);if(o<Po)return null;let n=Ae(e,r.shapeType);if(!n)return null;let i=r.shapeType==="point"?it(e,r):{left:0,top:0,right:0,bottom:0},a=Wr(r,o);return ie(n,{left:Math.max(i.left,a.left),top:Math.max(i.top,a.top),right:Math.max(i.right,a.right),bottom:Math.max(i.bottom,a.bottom)})}function Wr(e,t){let r=Math.max(1,e.baseStyle.fontSize),o=h(t/100,0,1);return{left:d(r*(.05+o*.2)),top:d(r*(.04+o*.1)),right:d(r*(.08+o*.3)),bottom:d(r*(.12+o*.16))}}function ie(e,t){return{x:e.x-t.left,y:e.y-t.top,width:e.width+t.left+t.right,height:e.height+t.top+t.bottom,useAbsoluteBounds:!1}}function Vt(e,t){let r=Math.min(e.x,t.x),o=Math.min(e.y,t.y),n=Math.max(e.x+e.width,t.x+t.width),i=Math.max(e.y+e.height,t.y+t.height);return{x:r,y:o,width:n-r,height:i-o,useAbsoluteBounds:!1}}function Oi(e,t){return t==="fills"?"fills"in e?e.fills:null:"strokes"in e?e.strokes:null}function Ui(e){return"visible"in e&&e.visible===!1?!1:e.type==="LAYER_BLUR"?O.disableLayerBlur?!1:!(O.disableProgressiveLayerBlur&&e.blurType==="PROGRESSIVE"):e.type==="BACKGROUND_BLUR"?!O.disableBackgroundBlur:e.type==="NOISE"?!O.disableNoise:e.type==="TEXTURE"?!O.disableTexture:!0}function Ue(e){if(!("effects"in e))return null;let t=e.effects;return Array.isArray(t)?t.filter(r=>Ui(r)):null}function Zr(e){let t=Ue(e);return!!t&&t.length>0}function ze(e){let t=Ue(e);return t?t.some(r=>r.type==="BACKGROUND_BLUR"):!1}function Xr(e){let t=Ue(e);return t?t.some(r=>r.type==="GLASS"):!1}function L(e,t=null){let r=Ue(e);if(!r||r.length===0)return null;let o=[],n=r.filter(a=>a.type==="DROP_SHADOW"&&Ke(a)).length,i=r.filter(a=>a.type==="INNER_SHADOW"&&Ke(a)).length;for(let a of r){if(a.type==="LAYER_BLUR"){if(Kr(o))return null;let u=Ki(a);if(!u)return null;o.push(u);continue}if(a.type==="BACKGROUND_BLUR"){if(_e(o))return null;let u=Yi(a,e,t);if(!u)return null;o.push(u);continue}if(a.type==="NOISE"){let u=qi(a);if(!u)return null;o.push(u);continue}if(a.type==="TEXTURE"){let u=ea(a);if(!u)return null;o.push(u);continue}if(a.type!=="DROP_SHADOW"&&a.type!=="INNER_SHADOW")return null;if(Ke(a)&&(a.type==="DROP_SHADOW"&&n===1||a.type==="INNER_SHADOW"&&i===1)){let u=Xi(a);if(!u)return null;o.push(u);continue}let l=Zi(a);if(!l)return null;o.push(l)}return ji(o)&&o.length>0?o:null}function fe(e,t=null){return _(L(e,t))}function progressiveBlurShouldRasterize(e){let t=_(e);return!!t&&t.blurType==="PROGRESSIVE"}function _(e){let t=Kr(e);return t&&zi(t)>0?t:null}function Kr(e){var t;return e&&(t=e.find(r=>r.style==="layer-blur"))!=null?t:null}function zi(e){return e.blurType==="PROGRESSIVE"?Math.max(e.startRadius,e.radius):e.radius}function _e(e){var t;return e&&(t=e.find(r=>r.style==="background-blur"))!=null?t:null}function _i(e,t){return e?e.map(r=>r.style==="background-blur"?B(b({},r),{backdropPngBytes:t}):r):null}function jt(e){if(!e)return null;let t=e.filter(r=>r.style!=="background-blur");return t.length>0?t:null}function Et(e){return e?e.filter(t=>t.style==="noise"):[]}function Yr(e){return e?e.filter(t=>t.style==="texture"):[]}function Pt(e){return Et(e).length>0||Yr(e).length>0}function $i(e){return!!_(e)||!!_e(e)||Pt(e)}function $e(e){return!!(e!=null&&e.some(t=>t.style==="drop-shadow"||t.style==="inner-shadow"||t.style==="outer-glow"||t.style==="inner-glow"))}function Hi(e){if(!e)return null;let t=e.filter(r=>r.style==="drop-shadow"||r.style==="inner-shadow"||r.style==="outer-glow"||r.style==="inner-glow");return t.length>0?t:null}function Vi(e){if(!e)return null;let t=e.filter(r=>r.style!=="drop-shadow"&&r.style!=="inner-shadow"&&r.style!=="outer-glow"&&r.style!=="inner-glow");return t.length>0?t:null}function ji(e){let t=_(e),r=_e(e),o=Et(e),n=Yr(e);return!t&&!r&&o.length===0&&n.length===0?!0:r?e.length===1:!(t&&(o.length>0||n.length>0)||o.length>0&&n.length>0||n.some(i=>i.clipToShape!==!0)||(o.length>0||n.length>0)&&$e(e))}function Wi(e){return Et(e).length}function te(e,t=null){return Zr(e)&&L(e,t)===null}function Zi(e){return!e.color||!e.offset?null:{style:e.type==="DROP_SHADOW"?"drop-shadow":"inner-shadow",blendMode:oe(e.blendMode),color:ee(e.color),offsetX:x(e.offset.x),offsetY:x(e.offset.y),blur:M(Math.max(0,e.radius)),spread:M(typeof e.spread=="number"?e.spread:0),showBehindTransparentAreas:e.type==="DROP_SHADOW"&&e.showShadowBehindNode===!0}}function Xi(e){return e.color?{style:e.type==="DROP_SHADOW"?"outer-glow":"inner-glow",blendMode:oe(e.blendMode),color:ee(e.color),blur:M(Math.max(0,e.radius)),spread:M(typeof e.spread=="number"?e.spread:0)}:null}function Ki(e){return e.blurType==="PROGRESSIVE"?{style:"layer-blur",blurType:"PROGRESSIVE",radius:M(Math.max(0,e.radius)),startRadius:M(Math.max(0,e.startRadius)),startOffset:Zt(e.startOffset),endOffset:Zt(e.endOffset)}:e.blurType!=="NORMAL"?null:{style:"layer-blur",blurType:"NORMAL",radius:M(Math.max(0,e.radius))}}function Yi(e,t,r){return e.blurType!=="NORMAL"||!qr(t,r)?null:{style:"background-blur",radius:M(Math.max(0,e.radius)),backdropPngBytes:null}}function qi(e){let t={style:"noise",noiseType:e.noiseType.toLowerCase(),blendMode:oe(e.blendMode),primaryColor:ee(e.color),secondaryColor:"secondaryColor"in e?ee(e.secondaryColor):null,noiseSize:M(Math.max(0,e.noiseSize)),density:h(e.density,0,1),opacity:h("opacity"in e?e.opacity:e.color.a,0,1)};return Ji(t)}function Ji(e){let t=Lo[e.noiseType];return B(b({},e),{primaryColor:Wt(e.primaryColor,t.primaryAlphaScale),secondaryColor:e.secondaryColor?Wt(e.secondaryColor,t.secondaryAlphaScale):null,density:Qi(e.density),opacity:D(h(e.opacity*t.overlayOpacityScale,0,1))})}function Qi(e){return D(h(e-e*e*.12,0,1))}function Wt(e,t){return t===1?e:B(b({},e),{a:z(e.a*t)})}function ea(e){return{style:"texture",noiseSize:M(Math.max(0,e.noiseSize)),radius:M(Math.max(0,e.radius)),clipToShape:e.clipToShape===!0}}function qr(e,t){if(!t||e===t||!he(e)||Re(e)||V(e)&&e.children.length>0||!V(t)||!pe(t))return!1;let r=zr(e,t);return!!r&&r.length>0}function Ke(e){return Math.abs(e.offset.x)<.01&&Math.abs(e.offset.y)<.01}function me(e){if(!("strokes"in e)||!Array.isArray(e.strokes))return null;let t=Gr(e.strokes);if(!t)return null;let r=Jr(e);return r===null?null:{blendMode:oe(t.blendMode),color:Ge(t),width:r,position:Or(e)}}function Jr(e){if(!("strokeWeight"in e)||typeof e.strokeWeight!="number"||e.strokeWeight<=0)return null;if(!("strokeTopWeight"in e)||!("strokeBottomWeight"in e)||!("strokeLeftWeight"in e)||!("strokeRightWeight"in e))return M(e.strokeWeight);let t=[e.strokeTopWeight,e.strokeRightWeight,e.strokeBottomWeight,e.strokeLeftWeight];if(t.some(o=>typeof o!="number"||!Number.isFinite(o)||o<=0))return null;let r=t[0];return t.some(o=>Math.abs(o-r)>.01)||Math.abs(e.strokeWeight-r)>.01?null:M(r)}function ta(e){!("effects"in e)||!Array.isArray(e.effects)||(e.effects=e.effects.filter(t=>"visible"in t&&t.visible===!1?!0:t.type!=="DROP_SHADOW"&&t.type!=="INNER_SHADOW"&&t.type!=="LAYER_BLUR"&&t.type!=="BACKGROUND_BLUR"))}function Qr(e){!("effects"in e)||!Array.isArray(e.effects)||(e.effects=e.effects.filter(t=>"visible"in t&&t.visible===!1))}function eo(e){return'"'.concat(e,'" uses Layer Blur, so it will preserve the blur as a Photoshop Smart Filter and rasterize the text instead of keeping an editable text layer.')}function ra(e){if(!("strokes"in e)||!Array.isArray(e.strokes))return;let t=e;t.strokes=e.strokes.filter(r=>!W(r))}function W(e){return!("visible"in e)||e.visible!==!1}function re(e){return"isMask"in e&&e.isMask}function xe(e){let t=ho.has(e.type);return ge(e,t)}function v(e){let t=e.type==="TEXT";return ge(e,t)}function ge(e,t){let r=t?k(e):I(e),o=t?I(e):k(e),n=r!=null?r:o;return!n||n.width<=0||n.height<=0?null:{x:n.x,y:n.y,width:n.width,height:n.height,useAbsoluteBounds:t}}function k(e){return"absoluteBoundingBox"in e?e.absoluteBoundingBox:null}function I(e){return"absoluteRenderBounds"in e?e.absoluteRenderBounds:null}function he(e){return"exportAsync"in e}function V(e){return"children"in e}function j(e){return!("opacity"in e)||typeof e.opacity!="number"?1:h(e.opacity,0,1)}function oa(e){var u;if(!("fills"in e)||!Array.isArray(e.fills))return null;let t=e.fills.filter(c=>W(c));if(t.length!==1)return null;let r=t[0],o=r.type==="IMAGE"&&!!r.imageHash,n=o?h((u=r.opacity)!=null?u:1,0,1):1,i=o&&!St(n,1),a=!st(r.blendMode);if(!i&&!a)return null;let s="blendMode"in e?e.blendMode:void 0,l=!st(s),c=a,p=c?oe(r.blendMode):K(e),g=l&&c&&K(e)!==p;return{normalizePaintOpacity:i||c&&o,normalizePaintBlendMode:c,effectiveOpacity:o?h(j(e)*n,0,1):j(e),effectiveBlendMode:p,warning:g?'"'.concat(f(e),'" collapses Figma layer/fill blend modes into the fill blend for PSD export.'):null}}function pigmaVisibleFillEntries(e){return!("fills"in e)||!Array.isArray(e.fills)?[]:e.fills.map((t,r)=>({paint:t,index:r})).filter(t=>W(t.paint))}
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
function to(e,t){if(!("fills"in e)||!Array.isArray(e.fills))return;let r=e,o=e.fills;r.fills=o.map(n=>na(n,t))}function na(e,t){if(!W(e))return e;let r=e;return t.normalizePaintOpacity&&e.opacity!==void 0&&!St(e.opacity,1)&&(r=B(b({},r),{opacity:1})),t.normalizePaintBlendMode&&e.blendMode!==void 0&&!st(e.blendMode)&&(r=B(b({},r),{blendMode:"NORMAL"})),r}function K(e){return"blendMode"in e?oe(e.blendMode):"normal"}function ro(e){return at(K(e))}function at(e){return e==="pass through"?"normal":e}function oe(e){switch(e){case"DARKEN":return"darken";case"MULTIPLY":return"multiply";case"LINEAR_BURN":return"linear burn";case"COLOR_BURN":return"color burn";case"LIGHTEN":return"lighten";case"SCREEN":return"screen";case"LINEAR_DODGE":return"linear dodge";case"COLOR_DODGE":return"color dodge";case"OVERLAY":return"overlay";case"SOFT_LIGHT":return"soft light";case"HARD_LIGHT":return"hard light";case"DIFFERENCE":return"difference";case"EXCLUSION":return"exclusion";case"HUE":return"hue";case"SATURATION":return"saturation";case"COLOR":return"color";case"LUMINOSITY":return"luminosity";case"PASS_THROUGH":return"pass through";default:return"normal"}}function st(e){return e===void 0||e==="NORMAL"||e==="PASS_THROUGH"}function ia(e){switch(e){case"CENTER":return"center";case"RIGHT":return"right";case"JUSTIFIED":return"justify-left";default:return"left"}}function aa(e,t){return e.unit==="AUTO"?null:e.unit==="PIXELS"?e.value:t*e.value/100}function oo(e,t){return[D(e[0][0]),D(e[1][0]),D(e[0][1]),D(e[1][1]),D(e[0][2]-t.x),D(e[1][2]-t.y)]}function sa(e){let t=la(e);if(t)return t;let r=e.family.replace(/[^A-Za-z0-9]/g,""),o=e.style.replace(/[^A-Za-z0-9]/g,"");return r==="Arial"?o==="Bold"?"Arial-BoldMT":o==="Italic"?"Arial-ItalicMT":o==="BoldItalic"?"Arial-BoldItalicMT":"ArialMT":r?!o||o==="Regular"?"".concat(r,"-Regular"):"".concat(r,"-").concat(o):"ArialMT"}function la(e){let t=e.family.trim().toLowerCase(),r=e.style.trim().toLowerCase();return t==="italianno"&&r==="regular"?"Italianno Regular":null}function Ye(e,t,r,o,n=[],i){let a=e.length,s=a>1,l=f(t);return{ready:!1,selectionId:s?null:t.id,selectionCount:a,selectionName:no(e),selectionType:io(e),summary:s?'"'.concat(l,'" is not ready for batch export.'):r,detail:s?"".concat(o,' Remove "').concat(l,'" from the selection or export it separately.'):o,documentWidth:s?null:i?d(i.width):null,documentHeight:s?null:i?d(i.height):null,exportNodeCount:0,editableTextCount:0,preservedGroupCount:0,warnings:n.map(u=>Nt(l,u,s))}}function no(e){return e.length===0?"":f(e[0])}function io(e){if(e.length===0)return null;let t=Array.from(new Set(e.map(r=>r.type)));return e.length===1?t[0]:t.length===1?"".concat(t[0]," x ").concat(e.length):"Mixed x ".concat(e.length)}function Nt(e,t,r){return r?"".concat(e,": ").concat(t):t}function ua(e,t){return t.textExportMode==="rasterize-text"?0:e}function ca(e,t,r,o){let n=da(e);return n?Nt(n.rootName,n.warning,t>1):o>0&&r.textExportMode==="rasterize-text"?"Text export is currently set to rasterize text, so text layers will export as bitmap layers until you change the export defaults.":t===1?"Editable text is preserved when fills and typography are compatible. Hidden layers can be ignored or included as hidden PSD layers.":"Each selected root is exported as its own PSD file. When more than one file is ready, the download is packaged as a ZIP archive."}function da(e){let t=null;for(let r of e)for(let o of r.analysis.warnings){let n=pa(o);if((!t||n<t.priority)&&(t={rootName:f(r.node),warning:o,priority:n},n===0))return t}return t}function pa(e){let t=e.toLowerCase();return t.includes("flatten into one bitmap layer")||t.includes("flattened bitmap layer")||t.includes("fell back to a bitmap layer")?0:t.includes("mask")?1:t.includes("smart object")?2:3}function fa(e,t,r=1){return r>1?"".concat(r," roots selected: ").concat(t.exportNodeCount," PSD layers, ").concat(t.editableTextCount," editable text layers, ").concat(t.preservedGroupCount," preserved groups."):'"'.concat(e,'" is ready: ').concat(t.exportNodeCount," PSD layers, ").concat(t.editableTextCount," editable text layers, ").concat(t.preservedGroupCount," preserved groups.")}function ma(e){return"pigma-export-".concat(e,"-files.zip")}function xa(e,t){return e.length===1?He(e[0],t,1,1):ma(e.length)}function f(e){return e.name&&e.name.length>0?e.name:e.type}function qe(e){for(let t of e.nodes)ao(t);e.nodes=[],e.compositePngBytes=null,e.backgroundDebug=[],e.warnings=[]}function ao(e){var t;if(e.kind==="group"){for(let r of e.children)ao(r);e.children=[],((t=e.mask)==null?void 0:t.kind)==="bitmap"&&(e.mask.pngBytes=new Uint8Array(0));return}if(e.kind!=="shape"&&(e.pngBytes=new Uint8Array(0)),e.kind==="vector"&&(e.svgString=""),e.effects)for(let r of e.effects)r.style==="background-blur"&&(r.backdropPngBytes=null)}function ga(e,t,r,o){return{stage:"plugin-export",sourceNodeId:e.id,sourceNodeName:f(e),sourceNodeType:e.type,backgroundNodeId:t.id,backgroundKind:t.kind,groupPath:ya(e),x:t.x,y:t.y,width:t.width,height:t.height,orderIndex:r,siblingCount:o,parentNodeId:e.id,parentNodeName:f(e),note:"컨테이너 fill에서 가상 배경을 만들고 내보내기 모델의 마지막 자식으로 추가했습니다."}}function ha(e,t){e.push(t),console.info("[background-trace][plugin-export]",t)}function ya(e){let t=[],r=e;for(;r&&r.type!=="PAGE"&&r.type!=="DOCUMENT";)"name"in r&&typeof r.name=="string"&&r.name.length>0&&t.unshift(r.name),r=r.parent;return t}function Je(e){let t=e.replace(/[<>:"/\\|?*]/g," "),r=Array.from(t,o=>o.charCodeAt(0)<32?" ":o).join("").trim();return r.length>0?r:"figma-export"}function Tt(e){return Ft(e)}function He(e,t,r,o){let n=Je(e.name||"figma-export"),i={"frame-name":n,"page-name":Je(figma.currentPage.name||"page"),index:o>1?String(r).padStart(2,"0"):String(r)},a=t.fileNamePattern.replace(/\{([a-z-]+)\}/gi,(l,u)=>{var p;let c=String(u).toLowerCase();return(p=i[c])!=null?p:l}),s=Je(a.replace(/\.psd$/i,"").trim()||n);return"".concat(s,".psd")}function Zt(e){return{x:D(h(e.x,0,1)),y:D(h(e.y,0,1))}}function z(e){return h(Math.round(e),0,255)}function d(e){return Math.max(1,Math.round(e))}function M(e){return Math.round(e*100)/100}function x(e){return Math.round(e)}function D(e){return Math.round(e*1e4)/1e4}function Sa(e,t,r){return e>0&&t>0&&e*t>r}function h(e,t,r){return Math.min(r,Math.max(t,e))}var ba=270,Ea=560,Pa=60;figma.showUI(__html__,{width:ba,height:Ea,themeColors:!0});var Dt=er({closePlugin:()=>{figma.closePlugin()},notify:(e,t)=>figma.notify(e,t),postToUi:e=>{figma.ui.postMessage(e)}}),Ve=null;function vt(e=!1){e&&Dt.invalidateSelectionCache(),Ve&&clearTimeout(Ve),Ve=setTimeout(()=>{Ve=null,Dt.postSelectionState()},Pa)}figma.on("selectionchange",()=>{vt()});figma.on("currentpagechange",()=>{vt(!0)});figma.ui.onmessage=e=>{Dt.handleUiMessage(e)};})();

;(()=>{
  // PIGMA_TEXT_IMPORT_GUARD::SOURCE_OF_TRUTH
  // Keep PSD import text guard rules in this file so rebuilds do not depend on
  // ad-hoc edits inside the generated runtime bundle.
  // PIGMA_TEXT_IMPORT_GUARD::BROAD_TEXT_UPDATES_DISABLED_IN_BUNDLE
  // PIGMA_TEXT_IMPORT_GUARD::SOURCE_ID_MATCHING
  // PIGMA_TEXT_IMPORT_GUARD::SOURCE_ID_TAGGING
  const originalOnMessage = figma.ui.onmessage;
  const DEFAULT_BATCH_FRAME_GAP = 100;
  const IMPORT_SOURCE_ID_KEY = "__pigmaImportSourceId";
  const IMPORT_SYNTHETIC_ROOT_KEY = "__pigmaSyntheticImportRoot";
  const IMPORT_POSTPROCESS_DEBUG = true;
  let availableFontsPromise = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (!isImportMessage(message)) {
      return originalOnMessage(message);
    }

    await prepareImportPayload(message);
    await originalOnMessage(message);

    try {
      await Promise.resolve();
      if (message.type === "request-import") {
        fixSingleImport(message.payload, getSelectedImportRoot());
      } else {
        fixBatchImport(message.batch, getSelectedImportRoot());
      }
    } catch (error) {
      console.warn("[pigma-import-text-fix]", error);
    }
  };

  function isImportMessage(message) {
    return !!message && (message.type === "request-import" || message.type === "request-import-batch");
  }

  async function prepareImportPayload(message) {
    if (message.type === "request-import") {
      prepareImportPayloadItem(message.payload);
      return;
    }

    if (!message.batch || !Array.isArray(message.batch.items)) {
      return;
    }

    for (const item of message.batch.items) {
      prepareImportPayloadItem(item);
    }
  }

  function prepareImportPayloadItem(payload) {
    normalizeImportRoot(payload);
  }

  function getNormalizedPayloadNodes(payload) {
    if (!payload || payload.mode === "flatten-image" || !Array.isArray(payload.nodes)) {
      return null;
    }

    if (payload.nodes.length !== 1) {
      return payload.nodes;
    }

    return getCollapsedRootChildren(payload, payload.nodes[0]) || payload.nodes;
  }

  function getSelectedImportRoot() {
    return figma.currentPage.selection.length > 0 ? figma.currentPage.selection[0] : null;
  }

  function downgradeTextNodes(payload, availableFonts) {
    if (!payload || payload.mode === "flatten-image" || !Array.isArray(payload.nodes)) {
      return;
    }

    const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
    if (!Array.isArray(payload.warnings)) {
      payload.warnings = warnings;
    }

    const forceRasterizeAllTextPayload = shouldForceRasterizeAllTextPayload(payload);
    const forceRasterizeMultiTextPayload = !forceRasterizeAllTextPayload && shouldRasterizeMultiTextPayload(payload);

    if (forceRasterizeAllTextPayload) {
      warnings.push("This PSD was imported with bitmap text layers because editable text reconstruction is disabled to prevent cross-layer text updates.");
    } else if (forceRasterizeMultiTextPayload) {
      warnings.push("This PSD was imported with bitmap text layers because multi-text editable reconstruction is disabled to avoid cross-layer text updates.");
    }

    payload.nodes = payload.nodes.map(node =>
      downgradeNode(node, availableFonts, warnings, forceRasterizeAllTextPayload || forceRasterizeMultiTextPayload)
    );
  }

  function shouldForceRasterizeAllTextPayload(payload) {
    const payloadNodes = getNormalizedPayloadNodes(payload);
    return countImportedTextNodes(payloadNodes) > 0;
  }

  // Legacy bitmap fallback helper kept for emergency debugging only.
  function shouldRasterizeMultiTextPayload(payload) {
    const payloadNodes = getNormalizedPayloadNodes(payload);
    return countImportedTextNodes(payloadNodes) > 1;
  }

  function normalizeImportRoot(payload) {
    const normalizedNodes = getNormalizedPayloadNodes(payload);
    if (normalizedNodes) {
      payload.nodes = normalizedNodes;
    }
  }

  function getCollapsedRootChildren(payload, node) {
    if (!shouldCollapseRootGroup(payload, node)) {
      return null;
    }

    const children = node.children.slice();
    const documentWidth = normalizeDimension(payload.documentWidth, 0);
    const documentHeight = normalizeDimension(payload.documentHeight, 0);
    const rootMatchesDocumentSize =
      documentWidth > 0 &&
      documentHeight > 0 &&
      dimensionsMatch(node.width, documentWidth) &&
      dimensionsMatch(node.height, documentHeight) &&
      isNearOrigin(node.x) &&
      isNearOrigin(node.y);

    if (rootMatchesDocumentSize) {
      return children;
    }

    const preferredCanvasBounds = findPreferredCanvasBounds(children);
    const preferredMatchesDocumentSize =
      !!preferredCanvasBounds &&
      documentWidth > 0 &&
      documentHeight > 0 &&
      dimensionsMatch(preferredCanvasBounds.width, documentWidth) &&
      dimensionsMatch(preferredCanvasBounds.height, documentHeight);

    if (!preferredCanvasBounds || !preferredMatchesDocumentSize) {
      return null;
    }

    const deltaX = -preferredCanvasBounds.x;
    const deltaY = -preferredCanvasBounds.y;
    return children.map(child => offsetImportedNode(child, deltaX, deltaY));
  }

  function shouldCollapseRootGroup(payload, node) {
    if (!node || node.kind !== "group" || !Array.isArray(node.children) || node.children.length === 0) {
      return false;
    }

    const payloadName = normalizeLayerName(payload.rootName);
    const nodeName = normalizeLayerName(node.name);
    if (payloadName.length === 0 || payloadName !== nodeName) {
      return false;
    }

    if (!node.visible || !isNeutralOpacity(node.opacity) || !isNeutralBlendMode(node.blendMode)) {
      return false;
    }

    if (node.effects !== null || node.strokeEffect !== null) {
      return false;
    }

    if (!isPositiveDimension(node.width) || !isPositiveDimension(node.height)) {
      return false;
    }

    return true;
  }

  function dimensionsMatch(value, expected) {
    return isPositiveDimension(value) && isPositiveDimension(expected) && Math.abs(Number(value) - Number(expected)) <= 1;
  }

  function isNearOrigin(value) {
    return Math.abs(Number(value) || 0) <= 1;
  }

  function normalizeLayerName(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  }

  function isNeutralOpacity(value) {
    const opacity = Number.isFinite(value) ? Number(value) : 1;
    return Math.abs(opacity - 1) <= 0.001;
  }

  function isNeutralBlendMode(value) {
    return value === "normal" || value === "pass through";
  }

  function isPositiveDimension(value) {
    return Number.isFinite(value) && Number(value) > 0;
  }

  function normalizeDimension(preferredValue, fallbackValue) {
    if (isPositiveDimension(preferredValue)) {
      return Math.max(1, Math.round(Number(preferredValue)));
    }

    if (isPositiveDimension(fallbackValue)) {
      return Math.max(1, Math.round(Number(fallbackValue)));
    }

    return 1;
  }

  function offsetImportedNode(node, deltaX, deltaY) {
    if (!node) {
      return node;
    }

    const shiftedNode = Object.assign({}, node, {
      x: roundNumber((Number(node.x) || 0) + deltaX),
      y: roundNumber((Number(node.y) || 0) + deltaY)
    });

    if (node.kind === "text" && node.text) {
      shiftedNode.text = offsetTextMetadata(node.text, deltaX, deltaY);
    }

    return shiftedNode;
  }

  function offsetTextMetadata(text, deltaX, deltaY) {
    const transform = Array.isArray(text.transform) ? text.transform.slice(0, 6) : null;
    return Object.assign({}, text, {
      transform: transform && transform.length >= 6
        ? [
            transform[0],
            transform[1],
            transform[2],
            transform[3],
            roundNumber((Number(transform[4]) || 0) + deltaX),
            roundNumber((Number(transform[5]) || 0) + deltaY)
          ]
        : text.transform,
      bounds: offsetBounds(text.bounds, deltaX, deltaY),
      boundingBox: offsetBounds(text.boundingBox, deltaX, deltaY)
    });
  }

  function offsetBounds(bounds, deltaX, deltaY) {
    if (!bounds) {
      return bounds;
    }

    return {
      left: roundNumber((Number(bounds.left) || 0) + deltaX),
      top: roundNumber((Number(bounds.top) || 0) + deltaY),
      right: roundNumber((Number(bounds.right) || 0) + deltaX),
      bottom: roundNumber((Number(bounds.bottom) || 0) + deltaY)
    };
  }

  function findPreferredCanvasBounds(nodes) {
    return collectPayloadVisibleBounds(nodes, 0, 0);
  }

  function collectPayloadVisibleBounds(nodes, offsetX, offsetY) {
    if (!Array.isArray(nodes)) {
      return null;
    }

    let bounds = null;
    for (const node of nodes) {
      if (!node || node.visible === false) {
        continue;
      }

      const absoluteX = roundNumber((Number(node.x) || 0) + offsetX);
      const absoluteY = roundNumber((Number(node.y) || 0) + offsetY);

      if (node.kind === "group" && Array.isArray(node.children)) {
        bounds = mergeRectBounds(bounds, collectPayloadVisibleBounds(node.children, absoluteX, absoluteY));
        continue;
      }

      if (!isPositiveDimension(node.width) || !isPositiveDimension(node.height)) {
        continue;
      }

      const width = Math.max(1, Math.round(Number(node.width)));
      const height = Math.max(1, Math.round(Number(node.height)));
      bounds = mergeRectBounds(bounds, {
        x: absoluteX,
        y: absoluteY,
        width,
        height
      });
    }

    return bounds;
  }

  function isBackgroundLikeName(value) {
    if (typeof value !== "string") {
      return false;
    }

    return /\b(background|bg|backdrop|canvas)\b/i.test(value.trim());
  }

  function roundNumber(value) {
    return Number.isFinite(value) ? Math.round(Number(value)) : 0;
  }

  function downgradeNode(node, availableFonts, warnings, forceRasterizeText) {
    if (!node) {
      return node;
    }

    if (node.kind === "group" && Array.isArray(node.children)) {
      node.children = node.children.map(child => downgradeNode(child, availableFonts, warnings, forceRasterizeText));
      return node;
    }

    if (node.kind !== "text") {
      return node;
    }

    if (forceRasterizeText && getByteLength(node.pngBytes) === 0) {
      return node;
    }

    if (!forceRasterizeText && !shouldRasterizeTextNode(node, availableFonts)) {
      return node;
    }

    if (!forceRasterizeText) {
      warnings.push(buildRasterizeWarning(node));
    }
    return {
      kind: "bitmap",
      name: node.name,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      opacity: node.opacity,
      visible: node.visible,
      blendMode: node.blendMode,
      effects: node.effects,
      strokeEffect: node.strokeEffect,
      pngBytes: node.pngBytes
    };
  }

  // Legacy bitmap fallback helper kept for emergency debugging only.
  function shouldRasterizeTextNode(node, availableFonts) {
    if (!node || node.kind !== "text" || getByteLength(node.pngBytes) === 0 || !node.text) {
      return false;
    }

    if (isLargeSingleGlyphText(node)) {
      return true;
    }

    const styleRuns = Array.isArray(node.text.styleRuns) ? node.text.styleRuns : [];
    if (styleRuns.length === 0) {
      return false;
    }

    return styleRuns.some(run => !findExactFontMatch(run.style, availableFonts));
  }

  function buildRasterizeWarning(node) {
    const quotedName = typeof node.name === "string" && node.name.trim().length > 0 ? `"${node.name}"` : "This text layer";
    if (isLargeSingleGlyphText(node)) {
      return `${quotedName} was imported as a bitmap to preserve a large single-glyph Photoshop text layer.`;
    }
    return `${quotedName} was imported as a bitmap because an exact Figma font match was not available.`;
  }

  function isLargeSingleGlyphText(node) {
    if (!node || node.kind !== "text" || !node.text || typeof node.text.value !== "string") {
      return false;
    }

    const glyphCount = node.text.value.replace(/\s+/g, "").length;
    if (glyphCount !== 1) {
      return false;
    }

    const baseStyle = node.text.baseStyle || {};
    const fontSize = Number.isFinite(baseStyle.fontSize) ? Number(baseStyle.fontSize) : 0;
    const width = Number.isFinite(node.width) ? Number(node.width) : 0;
    const height = Number.isFinite(node.height) ? Number(node.height) : 0;
    return fontSize >= 72 || width >= 160 || height >= 160;
  }

  function findExactFontMatch(style, availableFonts) {
    if (!style || !Array.isArray(availableFonts)) {
      return null;
    }

    const targetFamily = normalizeFontToken(style.fontFamily);
    const targetStyle = normalizeFontToken(style.fontStyle);
    if (targetFamily.length === 0 || targetStyle.length === 0) {
      return null;
    }

    for (const entry of availableFonts) {
      if (!entry || !entry.fontName) {
        continue;
      }

      const family = normalizeFontToken(entry.fontName.family);
      const fontStyle = normalizeFontToken(entry.fontName.style);
      if (family === targetFamily && fontStyle === targetStyle) {
        return entry.fontName;
      }
    }

    return null;
  }

  async function getAvailableFonts() {
    if (!availableFontsPromise) {
      availableFontsPromise = figma.listAvailableFontsAsync().catch(error => {
        availableFontsPromise = null;
        throw error;
      });
    }

    return availableFontsPromise;
  }

  async function getAvailableFontsSafely() {
    try {
      return await getAvailableFonts();
    } catch (error) {
      console.warn("[pigma-import-text-fix] failed to read available fonts", error);
      return [];
    }
  }

  function normalizeFontToken(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  }

  function fixSingleImport(payload, root) {
    if (!payload || !hasChildren(root)) {
      debugImportPostprocess("single-skip", "missing-root");
      return;
    }

    markSyntheticImportRoot(root);
    const importRoot = flattenImportedDuplicateRoot(root, payload) || root;
    debugImportPostprocess(
      "single-root",
      [
        `selected=${safeNodeName(root)}`,
        `removed=${!!root.removed}`,
        `result=${safeNodeName(importRoot)}`,
        `resultParent=${safeNodeName(importRoot && importRoot.parent)}`
      ].join(" | ")
    );

    const payloadNodes = getNormalizedPayloadNodes(payload);
    if (!payloadNodes || payload.mode === "flatten-image") {
      setExpandedRecursively(importRoot, false);
      selectImportedNodes([importRoot]);
      return;
    }

    if (shouldApplyScopedTextFixes(payloadNodes, importRoot)) {
      applyTextFixes(payloadNodes, importRoot);
    }
    setExpandedRecursively(importRoot, false);
    selectImportedNodes([importRoot]);
  }

  function fixBatchImport(batch, root) {
    if (!batch || !hasChildren(root) || !Array.isArray(batch.items)) {
      debugImportPostprocess("batch-skip", "missing-root");
      return;
    }

    const items = batch.items.filter(isBatchItemImportable);
    const sections = separateStitchedBatchSections(batch, root, items);
    const count = Math.min(items.length, sections.length);
    const normalizedSections = [];

    for (let index = 0; index < count; index += 1) {
      const item = items[index];
      const section = sections[index];
      if (!item || !hasChildren(section)) {
        continue;
      }

      markSyntheticImportRoot(section);
      const importSection = flattenImportedDuplicateRoot(section, item) || section;
      normalizedSections.push(importSection);

      const payloadNodes = getNormalizedPayloadNodes(item);
      if (!payloadNodes || item.mode === "flatten-image") {
        setExpandedRecursively(importSection, false);
        continue;
      }

      if (shouldApplyScopedTextFixes(payloadNodes, importSection)) {
        applyTextFixes(payloadNodes, importSection);
      }
      setExpandedRecursively(importSection, false);
    }

    if (!root.removed) {
      setExpandedRecursively(root, false);
    }

    selectImportedNodes(normalizedSections);
    debugImportPostprocess("batch-root", `sections=${normalizedSections.length} | rootRemoved=${!!root.removed}`);
  }

  function separateStitchedBatchSections(batch, root, items) {
    if (!shouldSeparateStitchedBatchRoot(batch, root, items)) {
      return Array.from(root.children);
    }

    const parentNode = root && root.parent && hasChildren(root.parent) ? root.parent : null;
    if (!parentNode) {
      return Array.from(root.children);
    }

    const rootBounds = getAbsoluteBounds(root, true);
    const sections = Array.from(root.children);
    const insertionIndex = Math.max(0, Array.from(parentNode.children).indexOf(root));

    for (let index = 0; index < sections.length; index += 1) {
      reparentSceneNode(sections[index], parentNode, insertionIndex + index, 0, 0);
    }

    arrangeBatchSectionsVertically(sections, rootBounds, getBatchFrameGap(batch));

    try {
      root.remove();
    } catch (error) {
      console.warn("[pigma-import-text-fix] failed to remove stitched batch root", error);
    }

    selectImportedBatchSections(sections);
    return sections;
  }

  function shouldSeparateStitchedBatchRoot(batch, root, items) {
    if (!batch || !hasChildren(root)) {
      return false;
    }

    const arrangement = typeof batch.arrangement === "string" ? batch.arrangement : "stitch-vertical";
    if (arrangement !== "stitch-vertical") {
      return false;
    }

    const rootName = normalizeLayerName(root.name);
    if (!rootName.endsWith("stitched")) {
      return false;
    }

    const sections = Array.from(root.children).filter(node => {
      return node && isPositiveDimension(node.width) && isPositiveDimension(node.height);
    });

    if (sections.length < 2) {
      return false;
    }

    if (Array.isArray(items) && items.length > 1 && sections.length < items.length) {
      return false;
    }

    return true;
  }

  function getBatchFrameGap(batch) {
    const gap = Number(batch == null ? void 0 : batch.gap);
    if (Number.isFinite(gap) && gap > 0) {
      return Math.max(0, Math.round(gap));
    }

    return DEFAULT_BATCH_FRAME_GAP;
  }

  function arrangeBatchSectionsVertically(sections, rootBounds, gap) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return;
    }

    const anchorBounds = rootBounds || getAbsoluteBounds(sections[0], true);
    if (!anchorBounds) {
      return;
    }

    const targetX = roundNumber(anchorBounds.x);
    let targetY = roundNumber(anchorBounds.y);
    const itemGap = Math.max(0, Math.round(gap));

    for (const section of sections) {
      const bounds = getAbsoluteBounds(section, true);
      if (!bounds) {
        continue;
      }

      translateSceneNode(section, targetX - bounds.x, targetY - bounds.y);
      targetY += Math.max(1, roundNumber(bounds.height)) + itemGap;
    }
  }

  function selectImportedBatchSections(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return;
    }

    const selectable = sections.filter(node => node && node.parent === figma.currentPage);
    if (selectable.length === 0) {
      return;
    }

    try {
      figma.currentPage.selection = selectable;
    } catch (error) {
      // Ignore selection assignment failures in restricted contexts.
    }
  }

  function flattenImportedDuplicateRoot(root, payload) {
    if (!hasChildren(root)) {
      return root;
    }

    if (isSyntheticImportRoot(root)) {
      const releasedNodes = releaseSyntheticImportRoot(root);
      debugImportPostprocess(
        "synthetic-root",
        `root=${safeNodeName(root)} | released=${releasedNodes.length} | remaining=${hasChildren(root) ? root.children.length : 0}`
      );
      if (releasedNodes.length > 0) {
        return preferPrimaryImportedNode(releasedNodes, payload);
      }
      return root.removed ? null : root;
    }

    const payloadWrapper = getPayloadDuplicateRootWrapper(payload);
    const wrapper = findDuplicateImportedWrapper(root);
    if (!wrapper || !hasChildren(wrapper) || !canFlattenImportedDuplicateRoot(root, wrapper, payloadWrapper)) {
      return root;
    }

    const rootBounds = getAbsoluteBounds(root, true);
    const preferredCanvasBounds = findPreferredSceneCanvasBounds(Array.from(wrapper.children), root);
    const deltaX = rootBounds && preferredCanvasBounds ? roundNumber(rootBounds.x - preferredCanvasBounds.x) : 0;
    const deltaY = rootBounds && preferredCanvasBounds ? roundNumber(rootBounds.y - preferredCanvasBounds.y) : 0;
    const wrapperIndex = Array.from(root.children).indexOf(wrapper);
    const children = Array.from(wrapper.children);

    for (let index = 0; index < children.length; index += 1) {
      reparentSceneNode(children[index], root, Math.max(0, wrapperIndex) + index, deltaX, deltaY);
    }

    wrapper.remove();
    return root;
  }

  function releaseSyntheticImportRoot(root) {
    if (!isSyntheticImportRoot(root) || !hasChildren(root)) {
      return [];
    }

    const parentNode = root.parent && hasChildren(root.parent) ? root.parent : null;
    if (!parentNode) {
      return [];
    }

    const children = Array.from(root.children);
    if (children.length === 0) {
      return [];
    }

    const rootIndex = Math.max(0, Array.from(parentNode.children).indexOf(root));
    for (let index = 0; index < children.length; index += 1) {
      reparentSceneNode(children[index], parentNode, rootIndex + index, 0, 0);
    }

    root.remove();
    return children.filter(node => node && !node.removed);
  }

  function preferPrimaryImportedNode(nodes, payload) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return null;
    }

    const targetName = normalizeLayerName(payload && payload.rootName);
    if (targetName.length > 0) {
      const exactMatch = nodes.find(node => normalizeLayerName(node.name) === targetName);
      if (exactMatch) {
        return exactMatch;
      }
    }

    return nodes[0];
  }

  function debugImportPostprocess(label, detail) {
    if (!IMPORT_POSTPROCESS_DEBUG) {
      return;
    }

    try {
      figma.notify(`[pigma] ${label}: ${detail}`, { timeout: 2500 });
    } catch (error) {
      // Ignore notification failures in restricted contexts.
    }
  }

  function safeNodeName(node) {
    if (!node) {
      return "null";
    }

    if ("name" in node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name;
    }

    return node.type || "node";
  }

  function selectImportedNodes(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    const selectable = nodes.filter(node => node && !node.removed);
    if (selectable.length === 0) {
      return;
    }

    try {
      figma.currentPage.selection = selectable;
    } catch (error) {
      // Ignore selection assignment failures in restricted contexts.
    }
  }

  function getPayloadDuplicateRootWrapper(payload) {
    if (!payload || payload.mode === "flatten-image" || !Array.isArray(payload.nodes) || payload.nodes.length !== 1) {
      return null;
    }

    const node = payload.nodes[0];
    return shouldCollapseRootGroup(payload, node) ? node : null;
  }

  function canFlattenImportedDuplicateRoot(root, wrapper, payloadWrapper) {
    if (!hasChildren(root) || !hasChildren(wrapper) || !isNeutralSceneWrapper(wrapper)) {
      return false;
    }

    if (payloadWrapper && isSyntheticImportRoot(root)) {
      return true;
    }

    const rootBounds = getAbsoluteBounds(root, true);
    const wrapperBounds = getAbsoluteBounds(wrapper, true);
    if (!rootBounds || !wrapperBounds) {
      return false;
    }

    const sameSize =
      dimensionsMatch(wrapperBounds.width, rootBounds.width) &&
      dimensionsMatch(wrapperBounds.height, rootBounds.height);
    const sameOrigin =
      Math.abs(wrapperBounds.x - rootBounds.x) <= 2 &&
      Math.abs(wrapperBounds.y - rootBounds.y) <= 2;

    if (sameSize && sameOrigin) {
      return true;
    }

    const preferredCanvasBounds = findPreferredSceneCanvasBounds(Array.from(wrapper.children), root);
    return !!preferredCanvasBounds &&
      dimensionsMatch(preferredCanvasBounds.width, rootBounds.width) &&
      dimensionsMatch(preferredCanvasBounds.height, rootBounds.height);
  }

  function findDuplicateImportedWrapper(root) {
    if (!hasChildren(root)) {
      return null;
    }

    const rootName = normalizeLayerName(root.name);
    if (rootName.length === 0) {
      return null;
    }

    const candidates = Array.from(root.children).filter(node => {
      return hasChildren(node) && normalizeLayerName(node.name) === rootName;
    });

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((left, right) => {
      const leftArea = (Number(left.width) || 0) * (Number(left.height) || 0);
      const rightArea = (Number(right.width) || 0) * (Number(right.height) || 0);
      return rightArea - leftArea;
    });

    return candidates[0];
  }

  function isNeutralSceneWrapper(node) {
    if (!node || node.visible === false || node.clipsContent === true) {
      return false;
    }

    if ("opacity" in node && !isNeutralOpacity(node.opacity)) {
      return false;
    }

    if ("blendMode" in node && !isNeutralBlendMode(normalizeSceneBlendMode(node.blendMode))) {
      return false;
    }

    if ("effects" in node && Array.isArray(node.effects) && node.effects.some(isVisibleSceneStyle)) {
      return false;
    }

    if ("fills" in node && Array.isArray(node.fills) && node.fills.some(isVisibleSceneStyle)) {
      return false;
    }

    if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.some(isVisibleSceneStyle)) {
      return false;
    }

    return true;
  }

  function normalizeSceneBlendMode(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/_/g, " ") : "";
  }

  function isVisibleSceneStyle(style) {
    if (!style || style.visible === false) {
      return false;
    }

    if ("opacity" in style && Number.isFinite(style.opacity) && Number(style.opacity) <= 0.001) {
      return false;
    }

    return true;
  }

  function markSyntheticImportRoot(node) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }

    try {
      node.setPluginData(IMPORT_SYNTHETIC_ROOT_KEY, "1");
    } catch (error) {
      // Ignore plugin data failures in restricted contexts.
    }
  }

  function isSyntheticImportRoot(node) {
    if (!node || typeof node.getPluginData !== "function") {
      return false;
    }

    try {
      return node.getPluginData(IMPORT_SYNTHETIC_ROOT_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function reparentSceneNode(node, parentNode, index, deltaX, deltaY) {
    if (!node || !parentNode || !hasChildren(parentNode)) {
      return;
    }

    const beforeBounds = getAbsoluteBounds(node, true);
    parentNode.insertChild(index, node);

    const afterBounds = getAbsoluteBounds(node, true);
    const baseX = beforeBounds ? beforeBounds.x : afterBounds ? afterBounds.x : 0;
    const baseY = beforeBounds ? beforeBounds.y : afterBounds ? afterBounds.y : 0;
    const desiredX = roundNumber(baseX + deltaX);
    const desiredY = roundNumber(baseY + deltaY);

    if (!afterBounds) {
      return;
    }

    translateSceneNode(node, desiredX - afterBounds.x, desiredY - afterBounds.y);
  }

  function translateSceneNode(node, deltaX, deltaY) {
    if (!node || (deltaX === 0 && deltaY === 0)) {
      return;
    }

    if (Array.isArray(node.relativeTransform) && node.relativeTransform.length === 2) {
      const transform = node.relativeTransform;
      node.relativeTransform = [
        [transform[0][0], transform[0][1], roundNumber(transform[0][2] + deltaX)],
        [transform[1][0], transform[1][1], roundNumber(transform[1][2] + deltaY)]
      ];
      return;
    }

    if ("x" in node && "y" in node) {
      node.x = roundNumber((Number(node.x) || 0) + deltaX);
      node.y = roundNumber((Number(node.y) || 0) + deltaY);
    }
  }

  function findPreferredSceneCanvasBounds(nodes, root) {
    return collectSceneVisibleBounds(nodes);
  }

  function collectSceneVisibleBounds(nodes) {
    if (!Array.isArray(nodes)) {
      return null;
    }

    let bounds = null;
    for (const node of nodes) {
      if (!node || node.visible === false) {
        continue;
      }

      if (hasChildren(node)) {
        bounds = mergeRectBounds(bounds, collectSceneVisibleBounds(Array.from(node.children)));
      }

      const nodeBounds = getAbsoluteBounds(node, true);
      if (!nodeBounds || !isPositiveDimension(nodeBounds.width) || !isPositiveDimension(nodeBounds.height)) {
        continue;
      }

      bounds = mergeRectBounds(bounds, {
        x: roundNumber(nodeBounds.x),
        y: roundNumber(nodeBounds.y),
        width: Math.max(1, Math.round(Number(nodeBounds.width))),
        height: Math.max(1, Math.round(Number(nodeBounds.height)))
      });
    }

    return bounds;
  }

  function mergeRectBounds(currentBounds, nextBounds) {
    if (!nextBounds) {
      return currentBounds;
    }

    if (!currentBounds) {
      return {
        x: roundNumber(nextBounds.x),
        y: roundNumber(nextBounds.y),
        width: Math.max(1, Math.round(Number(nextBounds.width))),
        height: Math.max(1, Math.round(Number(nextBounds.height)))
      };
    }

    const left = Math.min(currentBounds.x, roundNumber(nextBounds.x));
    const top = Math.min(currentBounds.y, roundNumber(nextBounds.y));
    const right = Math.max(currentBounds.x + currentBounds.width, roundNumber(nextBounds.x) + Math.max(1, Math.round(Number(nextBounds.width))));
    const bottom = Math.max(currentBounds.y + currentBounds.height, roundNumber(nextBounds.y) + Math.max(1, Math.round(Number(nextBounds.height))));

    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    };
  }

  // PIGMA_TEXT_IMPORT_GUARD::NO_BROAD_TEXT_UPDATES
  function shouldApplyScopedTextFixes(payloadNodes, parentNode) {
    if (!Array.isArray(payloadNodes) || !hasChildren(parentNode)) {
      return false;
    }

    return countImportedTextNodes(payloadNodes) > 0;
  }

  function countImportedTextNodes(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return 0;
    }

    let count = 0;
    for (const node of nodes) {
      if (!isSceneNodeImported(node)) {
        continue;
      }

      if (node.kind === "text") {
        count += 1;
        continue;
      }

      if (node.kind === "group" && Array.isArray(node.children)) {
        count += countImportedTextNodes(node.children);
      }
    }

    return count;
  }

  // PIGMA_TEXT_IMPORT_GUARD::TEXT_ALIGNMENT_SCOPE
  function applyTextFixes(payloadNodes, parentNode) {
    if (!Array.isArray(payloadNodes) || !hasChildren(parentNode)) {
      return;
    }

    const importedTextNodesBySourceId = collectImportedTextNodesBySourceId(parentNode);
    const orderedFallbackMatches =
      importedTextNodesBySourceId.size === 0 ? createOrderedTextFallbackMatches(payloadNodes, parentNode) : new Map();

    if (importedTextNodesBySourceId.size === 0 && orderedFallbackMatches.size === 0) {
      console.warn("[pigma-import-text-fix] skipped text alignment because imported source IDs were not tagged");
      return;
    }

    if (importedTextNodesBySourceId.size === 0 && orderedFallbackMatches.size > 0) {
      console.warn("[pigma-import-text-fix] aligned text using ordered fallback because imported source IDs were not tagged");
    }

    applyTextFixesBySourceId(payloadNodes, importedTextNodesBySourceId, orderedFallbackMatches);
  }

  function createOrderedTextFallbackMatches(payloadNodes, parentNode) {
    const payloadTextNodes = collectPayloadTextNodes(payloadNodes);
    const importedTextNodes = collectImportedTextNodes(parentNode);

    if (payloadTextNodes.length === 0 || importedTextNodes.length === 0) {
      return new Map();
    }

    if (payloadTextNodes.length !== importedTextNodes.length) {
      console.warn(
        `[pigma-import-text-fix] skipped ordered text fallback because payload text count (${payloadTextNodes.length}) did not match imported text count (${importedTextNodes.length})`
      );
      return new Map();
    }

    const orderedFallbackMatches = new Map();
    for (let index = 0; index < payloadTextNodes.length; index += 1) {
      orderedFallbackMatches.set(payloadTextNodes[index], importedTextNodes[index]);
    }

    return orderedFallbackMatches;
  }

  function collectPayloadTextNodes(nodes, collected = []) {
    if (!Array.isArray(nodes)) {
      return collected;
    }

    for (const node of nodes) {
      if (!isSceneNodeImported(node)) {
        continue;
      }

      if (node.kind === "text") {
        collected.push(node);
        continue;
      }

      if (node.kind === "group" && Array.isArray(node.children)) {
        collectPayloadTextNodes(node.children, collected);
      }
    }

    return collected;
  }

  function collectImportedTextNodes(parentNode) {
    const importedTextNodes = [];
    collectImportedTextNodesInto(parentNode, importedTextNodes);
    return importedTextNodes;
  }

  function collectImportedTextNodesInto(node, importedTextNodes) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      importedTextNodes.push(node);
    }

    if (!hasChildren(node)) {
      return;
    }

    for (const child of node.children) {
      collectImportedTextNodesInto(child, importedTextNodes);
    }
  }

  function applyTextFixesBySourceId(payloadNodes, importedTextNodesBySourceId, orderedFallbackMatches) {
    if (!Array.isArray(payloadNodes)) {
      return;
    }

    for (const payloadNode of payloadNodes) {
      if (!isSceneNodeImported(payloadNode)) {
        continue;
      }

      if (payloadNode.kind === "text") {
        const sceneNode = findImportedTextNodeForPayload(payloadNode, importedTextNodesBySourceId, orderedFallbackMatches);
        const sceneParent = sceneNode && hasChildren(sceneNode.parent) ? sceneNode.parent : null;
        if (sceneNode && sceneParent) {
          alignImportedTextNode(sceneNode, payloadNode, sceneParent);
        }
        continue;
      }

      if (payloadNode.kind === "group" && Array.isArray(payloadNode.children)) {
        applyTextFixesBySourceId(payloadNode.children, importedTextNodesBySourceId, orderedFallbackMatches);
      }
    }
  }

  function collectImportedTextNodesBySourceId(parentNode) {
    const importedTextNodesBySourceId = new Map();
    collectImportedTextNodesBySourceIdInto(parentNode, importedTextNodesBySourceId);
    return importedTextNodesBySourceId;
  }

  function collectImportedTextNodesBySourceIdInto(node, importedTextNodesBySourceId) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      const sourceId = getImportedSourceId(node);
      if (sourceId) {
        importedTextNodesBySourceId.set(sourceId, node);
      }
    }

    if (!hasChildren(node)) {
      return;
    }

    for (const child of node.children) {
      collectImportedTextNodesBySourceIdInto(child, importedTextNodesBySourceId);
    }
  }

  function findImportedTextNodeForPayload(payloadNode, importedTextNodesBySourceId, orderedFallbackMatches) {
    if (!payloadNode || payloadNode.kind !== "text" || !(importedTextNodesBySourceId instanceof Map)) {
      return null;
    }

    const sourceId = getPayloadSourceId(payloadNode);
    if (sourceId) {
      const matchedBySourceId = importedTextNodesBySourceId.get(sourceId);
      if (matchedBySourceId) {
        return matchedBySourceId;
      }
    }

    if (!(orderedFallbackMatches instanceof Map)) {
      return null;
    }

    return orderedFallbackMatches.get(payloadNode) || null;
  }

  function getPayloadSourceId(payloadNode) {
    if (!payloadNode || payloadNode.id == null) {
      return "";
    }

    return String(payloadNode.id);
  }

  function getImportedSourceId(node) {
    if (!node || typeof node.getPluginData !== "function") {
      return "";
    }

    try {
      return String(node.getPluginData(IMPORT_SOURCE_ID_KEY) || "");
    } catch (error) {
      return "";
    }
  }

  function alignImportedTextNode(node, payloadNode, parentNode) {
    const parentBounds = getAbsoluteBounds(parentNode, true);
    const nodeBounds = getAbsoluteBounds(node, true);
    const desiredPosition = getDesiredTextPosition(payloadNode);

    if (!parentBounds || !nodeBounds || !desiredPosition) {
      return;
    }

    const currentX = nodeBounds.x - parentBounds.x;
    const currentY = nodeBounds.y - parentBounds.y;
    const deltaX = roundNumber(desiredPosition.x - currentX);
    const deltaY = roundNumber(desiredPosition.y - currentY);

    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    const transform = node.relativeTransform;
    node.relativeTransform = [
      [transform[0][0], transform[0][1], roundNumber(transform[0][2] + deltaX)],
      [transform[1][0], transform[1][1], roundNumber(transform[1][2] + deltaY)]
    ];
  }

  function getDesiredTextPosition(payloadNode) {
    if (!payloadNode || payloadNode.kind !== "text") {
      return null;
    }

    return (
      getLayerTopLeft(payloadNode) ||
      getTransformTopLeft(payloadNode.text && payloadNode.text.transform) ||
      getRectTopLeft(payloadNode.text && payloadNode.text.boundingBox) ||
      getRectTopLeft(payloadNode.text && payloadNode.text.bounds)
    );
  }

  function getLayerTopLeft(payloadNode) {
    if (!Number.isFinite(payloadNode == null ? void 0 : payloadNode.x) || !Number.isFinite(payloadNode == null ? void 0 : payloadNode.y)) {
      return null;
    }

    return {
      x: roundNumber(payloadNode.x),
      y: roundNumber(payloadNode.y)
    };
  }

  function getRectTopLeft(rect) {
    if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top)) {
      return null;
    }

    return {
      x: roundNumber(rect.left),
      y: roundNumber(rect.top)
    };
  }

  function getTransformTopLeft(transform) {
    if (!Array.isArray(transform) || transform.length < 6) {
      return null;
    }

    if (!Number.isFinite(transform[4]) || !Number.isFinite(transform[5])) {
      return null;
    }

    return {
      x: roundNumber(transform[4]),
      y: roundNumber(transform[5])
    };
  }

  function getAbsoluteBounds(node, preferBoundingBox) {
    if (!node) {
      return null;
    }

    const primary = preferBoundingBox ? node.absoluteBoundingBox : node.absoluteRenderBounds;
    const fallback = preferBoundingBox ? node.absoluteRenderBounds : node.absoluteBoundingBox;
    const bounds = primary || fallback;

    if (!bounds || !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) {
      return null;
    }

    return bounds;
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children);
  }

  function setExpandedRecursively(node, expanded) {
    if (!node) {
      return;
    }

    setSceneNodeExpanded(node, expanded);

    if (!hasChildren(node)) {
      return;
    }

    for (const child of node.children) {
      setExpandedRecursively(child, expanded);
    }
  }

  function setSceneNodeExpanded(node, expanded) {
    if (!node || !("expanded" in node)) {
      return;
    }

    try {
      node.expanded = !!expanded;
    } catch (error) {
      // Ignore nodes that expose the property as readonly in the current editor/runtime.
    }
  }

  function isSceneNodeImported(node) {
    if (!node) {
      return false;
    }

    if (node.kind === "group") {
      return node.width > 0 && node.height > 0;
    }

    if (node.kind === "text") {
      return (node.width > 0 && node.height > 0) || getByteLength(node.pngBytes) > 0;
    }

    if (node.kind === "shape") {
      return true;
    }

    return node.width > 0 && node.height > 0 && getByteLength(node.pngBytes) > 0;
  }

  function isBatchItemImportable(item) {
    return !!item && item.documentWidth > 0 && item.documentHeight > 0 && (item.mode === "flatten-image" || (Array.isArray(item.nodes) && item.nodes.length > 0) || getByteLength(item.compositePngBytes) > 0);
  }

  function getByteLength(value) {
    return value && typeof value.length === "number" ? value.length : 0;
  }

  function roundNumber(value) {
    return Number.isFinite(value) ? Math.round(value) : 0;
  }
})();

;(()=>{
  // PIGMA_EXPORT_BOUNDARY::SOURCE_OF_TRUTH
  // Keep export-only message guards in this file so PSD export changes can
  // evolve without touching PSD import post-processing.
  // PIGMA_EXPORT_BOUNDARY::MESSAGE_TYPES
  // PIGMA_EXPORT_BOUNDARY::NORMALIZE_SETTINGS
  const originalOnMessage = figma.ui.onmessage;
  const DEFAULT_EXPORT_SETTINGS = Object.freeze({
    psdVersion: "max-compatibility",
    textExportMode: "editable-text",
    imageExportMode: "bitmap-only",
    hiddenLayerMode: "ignore-hidden",
    exportPackageMode: "psd-only",
    fileNamePattern: "{frame-name}.psd"
  });

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (!isExportMessage(message)) {
      return originalOnMessage(message);
    }

    return originalOnMessage(normalizeExportMessage(message));
  };

  function isExportMessage(message) {
    return !!message && (message.type === "request-export" || message.type === "request-next-export-root");
  }

  function normalizeExportMessage(message) {
    if (!message || typeof message !== "object") {
      return message;
    }

    if (message.type === "request-next-export-root") {
      return { type: "request-next-export-root" };
    }

    return Object.assign({}, message, {
      type: "request-export",
      hiddenLayerMode: normalizeHiddenLayerMode(message.hiddenLayerMode),
      includeCompositePng: message.includeCompositePng === true,
      settings: normalizeExportSettings(message.settings),
      developerExportExperiments: normalizeExportExperiments(message.developerExportExperiments)
    });
  }

  function normalizeExportSettings(settings) {
    const source = settings && typeof settings === "object" ? settings : {};

    return {
      psdVersion: DEFAULT_EXPORT_SETTINGS.psdVersion,
      textExportMode: normalizeTextExportMode(source.textExportMode),
      imageExportMode: normalizeImageExportMode(source.imageExportMode),
      hiddenLayerMode: normalizeHiddenLayerMode(source.hiddenLayerMode),
      exportPackageMode: normalizeExportPackageMode(source.exportPackageMode),
      fileNamePattern: normalizeFileNamePattern(source.fileNamePattern)
    };
  }

  function normalizeTextExportMode(value) {
    return value === "rasterize-text" ? value : DEFAULT_EXPORT_SETTINGS.textExportMode;
  }

  function normalizeImageExportMode(value) {
    return value === "smart-object-if-possible" ? value : DEFAULT_EXPORT_SETTINGS.imageExportMode;
  }

  function normalizeHiddenLayerMode(value) {
    return value === "preserve-hidden" ? value : DEFAULT_EXPORT_SETTINGS.hiddenLayerMode;
  }

  function normalizeExportPackageMode(value) {
    return value === "bundle-with-rasters" ? value : DEFAULT_EXPORT_SETTINGS.exportPackageMode;
  }

  function normalizeFileNamePattern(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : DEFAULT_EXPORT_SETTINGS.fileNamePattern;
  }

  function normalizeExportExperiments(value) {
    const source = value && typeof value === "object" ? value : {};

    return {
      disableShapePreviewCanvas: source.disableShapePreviewCanvas === true,
      forceBitmapVectorPreview: source.forceBitmapVectorPreview === true,
      disableEditableTextPreview: source.disableEditableTextPreview === true,
      disableLayerBlur: source.disableLayerBlur === true,
      disableProgressiveLayerBlur: source.disableProgressiveLayerBlur === true,
      disableBackgroundBlur: source.disableBackgroundBlur === true,
      disableNoise: source.disableNoise === true,
      disableTexture: source.disableTexture === true
    };
  }
})();

;(()=>{
  // PIGMA_AI_SETTINGS_STORAGE::SOURCE_OF_TRUTH
  // Keep AI settings persistence in plugin storage so the UI can survive
  // panel reloads and full Figma app restarts.
  const originalOnMessage = figma.ui.onmessage;
  const AI_SETTINGS_KEY = "pigma:ai-settings:v1";
  const DEFAULT_AI_SETTINGS = Object.freeze({
    enabled: false,
    provider: "openai",
    apiKey: "",
    proofingLocale: "",
    userDictionary: [],
    protectedTerms: []
  });

  let cachedAiSettings = DEFAULT_AI_SETTINGS;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (isAiSettingsMessage(message)) {
      if (message.type === "request-ai-settings") {
        await postAiSettings();
        return;
      }

      await writeAiSettings(message.settings);
      await postAiSettings();
      return;
    }

    return originalOnMessage(message);
  };

  function isAiSettingsMessage(message) {
    return !!message && (message.type === "request-ai-settings" || message.type === "update-ai-settings");
  }

  async function postAiSettings() {
    figma.ui.postMessage({
      type: "ai-settings",
      settings: await readAiSettings()
    });
  }

  async function readAiSettings() {
    try {
      cachedAiSettings = normalizeAiSettings(await figma.clientStorage.getAsync(AI_SETTINGS_KEY));
    } catch (error) {
      cachedAiSettings = normalizeAiSettings(null);
    }

    return cachedAiSettings;
  }

  async function writeAiSettings(settings) {
    cachedAiSettings = normalizeAiSettings(settings);

    try {
      await figma.clientStorage.setAsync(AI_SETTINGS_KEY, cachedAiSettings);
    } catch (error) {}

    return cachedAiSettings;
  }

  function normalizeAiSettings(value) {
    const source = value && typeof value === "object" ? value : {};

    return {
      enabled: source.enabled === true,
      provider: source.provider === "gemini" ? "gemini" : DEFAULT_AI_SETTINGS.provider,
      apiKey: typeof source.apiKey === "string" ? sanitizeApiKey(source.apiKey) : DEFAULT_AI_SETTINGS.apiKey,
      proofingLocale: normalizeProofingLocale(source.proofingLocale),
      userDictionary: normalizeTermList(source.userDictionary),
      protectedTerms: normalizeTermList(source.protectedTerms)
    };
  }

  function sanitizeApiKey(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .replace(/^['"`]+|['"`]+$/g, "")
      .replace(/[^\x21-\x7E]/g, "")
      .trim();
  }

  function normalizeProofingLocale(value) {
    const compact = String(value || "")
      .replace(/[^A-Za-z-]/g, "")
      .trim();
    if (!compact) {
      return "";
    }

    const parts = compact.split("-").filter(Boolean);
    if (parts.length === 1 && /^[A-Za-z]{2,3}$/.test(parts[0])) {
      return parts[0].toLowerCase();
    }

    if (parts.length === 2 && /^[A-Za-z]{2,3}$/.test(parts[0]) && /^[A-Za-z]{2,4}$/.test(parts[1])) {
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }

    return "";
  }

  function normalizeTermList(value) {
    const terms = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/\r?\n|,/)
        : [];
    const normalized = [];
    const seen = new Set();

    for (const term of terms) {
      const next = String(term || "").replace(/\s+/g, " ").trim();
      if (!next) {
        continue;
      }

      const key = next.toLocaleLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(next);
    }

    return normalized.slice(0, 200);
  }
})();

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_LLM_CLIENT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_SETTINGS_KEY = "pigma:ai-settings:v1";
  const AI_LLM_REQUEST_TIMEOUT_MS = 45000;
  const DEFAULT_AI_SETTINGS = Object.freeze({
    enabled: false,
    provider: "openai",
    apiKey: "",
    proofingLocale: "",
    userDictionary: [],
    protectedTerms: [],
  });
  const DEFAULT_MODEL_BY_PROVIDER = Object.freeze({
    openai: "gpt-4o-mini",
    gemini: "gemini-2.5-flash",
  });
  const pendingUiRequests = new Map();

  globalScope.__PIGMA_AI_LLM__ = {
    getAiSettingsAsync,
    getResolvedRunInfo,
    hasConfiguredAiAsync,
    requestJsonTask,
    normalizeErrorMessage,
    uniqueStrings,
  };

  if (typeof originalOnMessage === "function") {
    figma.ui.onmessage = async (message) => {
      if (isAiUiBridgeResponse(message)) {
        resolveUiBridgeResponse(message);
        return;
      }

      return originalOnMessage(message);
    };
  }

  globalScope.__PIGMA_AI_LLM_CLIENT_PATCH__ = true;

  async function getAiSettingsAsync() {
    try {
      return normalizeAiSettings(await figma.clientStorage.getAsync(AI_SETTINGS_KEY));
    } catch (error) {
      return normalizeAiSettings(null);
    }
  }

  async function hasConfiguredAiAsync() {
    const settings = await getAiSettingsAsync();
    return settings.enabled === true && settings.apiKey.length > 0;
  }

  async function requestJsonTask(options) {
    const settings = await getAiSettingsAsync();
    if (settings.enabled !== true || !settings.apiKey) {
      return null;
    }

    const prompt = buildPrompt(options);
    const runInfo = getResolvedRunInfo(settings, options);
    const provider = runInfo.provider;
    const model = runInfo.model;

    try {
      let result = null;
      result = await requestJsonTaskViaUiBridge({
        provider,
        model,
        apiKey: settings.apiKey,
        prompt,
      });

      if (result && typeof result === "object") {
        result._provider = provider;
        result._model = model;
      }

      return result;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, "AI 응답을 받지 못했습니다."));
    }
  }

  function getResolvedRunInfo(settingsOrOptions, maybeOptions) {
    const hasSettingsShape =
      settingsOrOptions &&
      typeof settingsOrOptions === "object" &&
      (Object.prototype.hasOwnProperty.call(settingsOrOptions, "provider") ||
        Object.prototype.hasOwnProperty.call(settingsOrOptions, "apiKey") ||
        Object.prototype.hasOwnProperty.call(settingsOrOptions, "enabled"));
    const settings = hasSettingsShape ? settingsOrOptions : normalizeAiSettings(null);
    const options = hasSettingsShape ? maybeOptions : settingsOrOptions;
    const provider = settings && settings.provider === "gemini" ? "gemini" : "openai";
    const model =
      options && typeof options.modelByProvider === "object" && options.modelByProvider && options.modelByProvider[provider]
        ? options.modelByProvider[provider]
        : DEFAULT_MODEL_BY_PROVIDER[provider];

    return {
      provider,
      model,
    };
  }

  function normalizeAiSettings(value) {
    const source = value && typeof value === "object" ? value : {};

    return {
      enabled: source.enabled === true,
      provider: source.provider === "gemini" ? "gemini" : DEFAULT_AI_SETTINGS.provider,
      apiKey: typeof source.apiKey === "string" ? sanitizeApiKey(source.apiKey) : DEFAULT_AI_SETTINGS.apiKey,
      proofingLocale: normalizeProofingLocale(source.proofingLocale),
      userDictionary: normalizeTermList(source.userDictionary),
      protectedTerms: normalizeTermList(source.protectedTerms),
    };
  }

  function buildPrompt(options) {
    const instructions = options && typeof options.instructions === "string" ? options.instructions.trim() : "";
    const payload = options && options.payload ? options.payload : {};
    const schema = options && options.schema ? options.schema : null;
    const blocks = [
      "Return exactly one JSON object.",
      "Do not wrap the JSON in markdown fences.",
      "Do not add any explanation outside the JSON.",
    ];

    if (instructions) {
      blocks.push(instructions);
    }

    if (schema) {
      blocks.push("Target JSON shape:");
      blocks.push(JSON.stringify(schema, null, 2));
    }

    blocks.push("Input payload:");
    blocks.push(JSON.stringify(payload, null, 2));
    return blocks.join("\n\n");
  }

  function isAiUiBridgeResponse(message) {
    return !!message && message.type === "ai-llm-ui-response" && typeof message.requestId === "string";
  }

  function resolveUiBridgeResponse(message) {
    const pending = pendingUiRequests.get(message.requestId);
    if (!pending) {
      return;
    }

    pendingUiRequests.delete(message.requestId);
    clearTimeout(pending.timeoutId);

    if (message.ok === true) {
      pending.resolve(message.result);
      return;
    }

    pending.reject(new Error(typeof message.error === "string" && message.error ? message.error : "AI UI bridge 요청에 실패했습니다."));
  }

  async function requestJsonTaskViaUiBridge(payload) {
    if (!figma.ui || typeof figma.ui.postMessage !== "function") {
      throw new Error("Figma UI bridge를 사용할 수 없습니다.");
    }

    const requestId = createRequestId();
    return await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingUiRequests.delete(requestId);
        reject(new Error("AI UI bridge 응답이 시간 내에 오지 않았습니다."));
      }, AI_LLM_REQUEST_TIMEOUT_MS);

      pendingUiRequests.set(requestId, {
        resolve,
        reject,
        timeoutId,
      });

      figma.ui.postMessage({
        type: "ai-llm-ui-request",
        requestId,
        payload,
      });
    });
  }

  function createRequestId() {
    return "ai-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function sanitizeApiKey(value) {
    return normalizeApiKeyCharacters(value);
  }

  function normalizeProofingLocale(value) {
    const compact = String(value || "")
      .replace(/[^A-Za-z-]/g, "")
      .trim();
    if (!compact) {
      return "";
    }

    const parts = compact.split("-").filter(Boolean);
    if (parts.length === 1 && /^[A-Za-z]{2,3}$/.test(parts[0])) {
      return parts[0].toLowerCase();
    }

    if (parts.length === 2 && /^[A-Za-z]{2,3}$/.test(parts[0]) && /^[A-Za-z]{2,4}$/.test(parts[1])) {
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }

    return "";
  }

  function normalizeTermList(value) {
    const terms = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/\r?\n|,/)
        : [];
    const normalized = [];
    const seen = new Set();

    for (const term of terms) {
      const next = String(term || "").replace(/\s+/g, " ").trim();
      if (!next) {
        continue;
      }

      const key = next.toLocaleLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(next);
    }

    return normalized.slice(0, 200);
  }

  function sanitizeHeaderValue(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
  }

  function normalizeApiKeyCharacters(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .replace(/^['"`]+|['"`]+$/g, "")
      .replace(/[^\x21-\x7E]/g, "")
      .trim();
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

  function uniqueStrings(values, limit) {
    const result = [];
    const seen = new Set();
    const max = typeof limit === "number" && limit > 0 ? limit : Number.POSITIVE_INFINITY;
    const items = Array.isArray(values) ? values : [];

    for (const value of items) {
      const normalized = String(value || "").replace(/\s+/g, " ").trim();
      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      result.push(normalized);
      if (result.length >= max) {
        break;
      }
    }

    return result;
  }
})();

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_ACCESSIBILITY_DIAG_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_ACCESSIBILITY_CACHE_KEY = "pigma:ai-accessibility-diagnosis-cache:v1";
  const ACCESSIBILITY_MESSAGE_TYPES = {
    requestCache: "request-ai-accessibility-cache",
    runDiagnosis: "run-ai-accessibility-diagnosis",
    applyFix: "run-ai-accessibility-apply-fix",
    result: "ai-accessibility-result",
    error: "ai-accessibility-error",
    cache: "ai-accessibility-cache",
    status: "ai-accessibility-status",
  };
  const LEGACY_ACCESSIBILITY_MESSAGE_TYPES = {
    requestCache: "request-ai-design-read-cache",
    runDiagnosis: "run-ai-design-read",
    applyFix: "run-ai-design-read-apply-fix",
    result: "ai-design-read-result",
    error: "ai-design-read-error",
    cache: "ai-design-read-cache",
    status: "ai-design-read-status",
  };
  const PATCH_VERSION = 3;
  const ANNOTATION_CATEGORY_LABEL = "웹 접근성 진단";
  const ANNOTATION_CATEGORY_COLOR = "green";
  const ANNOTATION_LABEL_PREFIX = "[웹 접근성 진단]";
  const MAX_ISSUE_COUNT = 24;
  const MIN_TAP_TARGET = 44;
  const CRITICAL_TAP_TARGET = 24;
  const MIN_BODY_FONT_SIZE = 14;
  const MIN_ACTION_FONT_SIZE = 16;
  const NORMAL_TEXT_CONTRAST_RATIO = 4.5;
  const LARGE_TEXT_CONTRAST_RATIO = 3;
  const CRITICAL_NORMAL_TEXT_CONTRAST_RATIO = 2.2;
  const CRITICAL_LARGE_TEXT_CONTRAST_RATIO = 1.8;
  const VECTOR_TYPES = new Set([
    "VECTOR",
    "BOOLEAN_OPERATION",
    "STAR",
    "LINE",
    "ELLIPSE",
    "POLYGON",
    "REGULAR_POLYGON",
    "RECTANGLE",
  ]);
  const AUTO_NAME_PATTERNS = [
    /^frame \d+$/i,
    /^group \d+$/i,
    /^rectangle \d+$/i,
    /^text \d+$/i,
    /^vector \d+$/i,
    /^ellipse \d+$/i,
    /^polygon \d+$/i,
    /^star \d+$/i,
    /^line \d+$/i,
    /^image \d+$/i,
    /^component \d+$/i,
    /^instance \d+$/i,
    /^section \d+$/i,
    /^copy(?: of)? /i,
    /^untitled/i,
  ];
  const CONTROL_NAME_PATTERN = /(button|btn|cta|chip|tab|pill|toggle|switch|checkbox|radio|link|menu|nav|button|버튼|탭|칩|토글|스위치|체크|링크|메뉴)/i;
  const ACTION_TEXT_PATTERN =
    /^(ok|go|next|done|start|login|sign in|sign up|signup|save|apply|cancel|submit|buy|open|menu|search|confirm|delete|continue|확인|다음|완료|시작|저장|적용|취소|구매|열기|메뉴|검색|삭제|계속)$/i;
  let activeExecution = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAccessibilityMessage(message)) {
      const messageMode = getAccessibilityMessageMode(message.type);
      if (!messageMode) {
        return originalOnMessage(message);
      }

      if (isAccessibilityCacheRequestType(message.type)) {
        await postCachedResult(messageMode);
        return;
      }

      if (isAccessibilityApplyFixType(message.type)) {
        await withExecutionLock(
          {
            status: "applying-fix",
            message: "선택한 접근성 수정안을 적용하고 있습니다.",
            extra: {
              issueId: message && typeof message.issueId === "string" ? message.issueId.trim() : "",
            },
          },
          () => applyIssueFix(message, messageMode),
          messageMode
        );
        return;
      }

      await withExecutionLock(
        {
          status: "running",
          message: "현재 선택의 웹 접근성을 진단하고 있습니다.",
        },
        () => runAccessibilityDiagnosis({ messageMode: messageMode }),
        messageMode
      );
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_ACCESSIBILITY_DIAG_PATCH__ = true;

  function isAccessibilityMessage(message) {
    return !!message && !!getAccessibilityMessageMode(message.type);
  }

  function getAccessibilityMessageMode(type) {
    if (
      type === ACCESSIBILITY_MESSAGE_TYPES.requestCache ||
      type === ACCESSIBILITY_MESSAGE_TYPES.runDiagnosis ||
      type === ACCESSIBILITY_MESSAGE_TYPES.applyFix
    ) {
      return "accessibility";
    }

    if (
      type === LEGACY_ACCESSIBILITY_MESSAGE_TYPES.requestCache ||
      type === LEGACY_ACCESSIBILITY_MESSAGE_TYPES.runDiagnosis ||
      type === LEGACY_ACCESSIBILITY_MESSAGE_TYPES.applyFix
    ) {
      return "legacy";
    }

    return "";
  }

  function resolveAccessibilityMessageMode(value) {
    return value === "accessibility" ? "accessibility" : "legacy";
  }

  function getAccessibilityMessageTypes(mode) {
    return resolveAccessibilityMessageMode(mode) === "accessibility"
      ? ACCESSIBILITY_MESSAGE_TYPES
      : LEGACY_ACCESSIBILITY_MESSAGE_TYPES;
  }

  function isAccessibilityCacheRequestType(type) {
    return (
      type === ACCESSIBILITY_MESSAGE_TYPES.requestCache ||
      type === LEGACY_ACCESSIBILITY_MESSAGE_TYPES.requestCache
    );
  }

  function isAccessibilityApplyFixType(type) {
    return type === ACCESSIBILITY_MESSAGE_TYPES.applyFix || type === LEGACY_ACCESSIBILITY_MESSAGE_TYPES.applyFix;
  }

  async function withExecutionLock(execution, runner, messageMode) {
    if (activeExecution) {
      postStatus(activeExecution.status, activeExecution.message, activeExecution.extra, messageMode);
      return false;
    }

    activeExecution =
      execution && typeof execution === "object" ? execution : { status: "running", message: "", extra: {} };
    try {
      await runner();
      return true;
    } finally {
      activeExecution = null;
    }
  }

  async function runAccessibilityDiagnosis(options) {
    const runOptions = options && typeof options === "object" ? options : {};
    const messageMode = resolveAccessibilityMessageMode(runOptions.messageMode);
    const messageTypes = getAccessibilityMessageTypes(messageMode);
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    if (!runOptions.skipStatus) {
      postStatus("running", "현재 선택의 웹 접근성을 진단하고 있습니다.");
    }
    if (!runOptions.skipStatus && messageMode === "accessibility") {
      figma.ui.postMessage({ type: ACCESSIBILITY_MESSAGE_TYPES.status, status: "running", message: "" });
    }

    try {
      const analysis = analyzeCurrentSelection();
      let result = analysis.result;
      const annotationSupported = Array.isArray(analysis.annotationNodes) && analysis.annotationNodes.length > 0;
      const category =
        annotationSupported && supportsAnnotations(analysis.annotationNodes)
          ? await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR)
          : null;
      const annotationResult = category
        ? applyAccessibilityAnnotations(analysis.annotationNodes, result.accessibility.issues, category)
        : buildResultOnlyAnnotation(result.accessibility.issues, "Dev Mode 주석을 사용할 수 없습니다.");

      result.accessibility.annotations = {
        annotationCount: annotationResult.annotationCount || 0,
        annotatedNodeCount: annotationResult.annotatedNodeCount || 0,
        clearedNodeCount: annotationResult.clearedNodeCount || 0,
        removedAnnotationCount: annotationResult.removedAnnotationCount || 0,
        categoryLabel: annotationResult.categoryLabel || ANNOTATION_CATEGORY_LABEL,
        modeLabel: annotationResult.modeLabel || "Result only",
      };
      result.summary.issueCount = result.accessibility.issueCount;
      result.summary.fixableCount = result.accessibility.fixableCount;
      result.summary.annotationCount = result.accessibility.annotations.annotationCount;

      result = await enrichDiagnosisWithAi(result);
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: messageTypes.result,
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      if (runOptions.notify !== false) {
        figma.notify(runOptions.notifyMessage || "웹 접근성 진단 완료", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "웹 접근성 진단에 실패했습니다.");
      figma.ui.postMessage({
        type: messageTypes.error,
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function applyIssueFix(message, messageMode) {
    const issueId = message && typeof message.issueId === "string" ? message.issueId.trim() : "";
    if (!issueId) {
      throw new Error("적용할 접근성 수정안을 찾지 못했습니다.");
    }

    postStatus("applying-fix", "선택한 접근성 수정안을 적용하고 있습니다.", {
      issueId,
    });
    if (resolveAccessibilityMessageMode(messageMode) === "accessibility") {
      figma.ui.postMessage({
        type: ACCESSIBILITY_MESSAGE_TYPES.status,
        status: "applying-fix",
        message: "",
        issueId: issueId,
      });
    }

    const cachedResult = await readCachedResult();
    const issues =
      cachedResult && cachedResult.accessibility && Array.isArray(cachedResult.accessibility.issues)
        ? cachedResult.accessibility.issues
        : [];
    const issue = issues.find((entry) => entry && entry.id === issueId);

    if (!issue || !issue.fixPlan) {
      throw new Error("선택한 수정안을 다시 찾지 못했습니다. 웹 접근성 진단을 다시 실행해 주세요.");
    }

    await applyFixPlan(issue.fixPlan);
    figma.notify("접근성 수정 적용 완료", { timeout: 1600 });
    await runAccessibilityDiagnosis({
      skipStatus: true,
      messageMode: messageMode,
      notifyMessage: "접근성 수정 적용 후 재진단 완료",
    });
  }

  async function postCachedResult(messageMode) {
    const messageTypes = getAccessibilityMessageTypes(messageMode);
    const result = await readCachedResult();
    figma.ui.postMessage({
      type: messageTypes.cache,
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message, extra, messageMode) {
    const messageTypes = getAccessibilityMessageTypes(messageMode);
    const payload = extra && typeof extra === "object" ? extra : {};
    const body = {
      type: messageTypes.status,
      status,
      message,
    };
    Object.keys(payload).forEach((key) => {
      body[key] = payload[key];
    });
    figma.ui.postMessage(body);
  }

  async function readCachedResult() {
    const dedicated = await readCacheValue(AI_ACCESSIBILITY_CACHE_KEY);
    if (dedicated) {
      return normalizeCachedResult(dedicated);
    }

    const legacy = await readCacheValue(AI_DESIGN_READ_CACHE_KEY);
    return normalizeCachedResult(legacy);
  }

  async function writeCachedResult(result) {
    const normalized = normalizeCachedResult(result);
    await writeCacheValue(AI_ACCESSIBILITY_CACHE_KEY, normalized);
    await writeCacheValue(AI_DESIGN_READ_CACHE_KEY, normalized);
    return normalized;
  }

  async function readCacheValue(cacheKey) {
    try {
      return await figma.clientStorage.getAsync(cacheKey);
    } catch (error) {
      return null;
    }
  }

  async function writeCacheValue(cacheKey, value) {
    try {
      await figma.clientStorage.setAsync(cacheKey, value);
    } catch (error) {}
  }

  function normalizeCachedResult(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    return value;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function analyzeCurrentSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택해 주세요.");
    }

    const rootBounds = [];
    const rootSummaries = [];
    const typeCounts = new Map();
    const colorCounts = new Map();
    const fontFamilyCounts = new Map();
    const fontSizeCounts = new Map();
    const nameCounts = new Map();
    const scriptCounts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      digit: 0,
      other: 0,
    };
    const suspiciousExamples = [];
    const duplicateExamples = [];
    const textSamples = [];
    const rootNames = [];
    const fractionalExamples = [];
    const fractionalNodeIds = new Set();
    const annotationNodes = [];
    const nodeEntries = [];
    const textEntries = [];
    const solidFillEntries = [];
    const nodeInsights = [];
    let orderCounter = 0;
    let suspiciousCount = 0;
    let fractionalValueCount = 0;
    const typeStats = {
      totalNodes: 0,
      rootCount: selection.length,
      frameCount: 0,
      groupCount: 0,
      textNodeCount: 0,
      vectorCount: 0,
      instanceCount: 0,
      componentCount: 0,
      sectionCount: 0,
      imageFillCount: 0,
      solidPaintCount: 0,
      effectNodeCount: 0,
      maskCount: 0,
      maxDepth: 0,
      textCharacterCount: 0,
      buttonLikeCount: 0,
    };

    const stack = [];
    for (let index = selection.length - 1; index >= 0; index -= 1) {
      const node = selection[index];
      stack.push({ node, depth: 1, rootId: node.id });

      const bounds = getNodeBounds(node);
      if (bounds) {
        rootBounds.push(bounds);
      }

      rootSummaries.push({
        id: node.id,
        name: safeName(node),
        type: String(node.type || "UNKNOWN"),
        width: bounds ? roundPixel(bounds.width) : null,
        height: bounds ? roundPixel(bounds.height) : null,
        childCount: hasChildren(node) ? node.children.length : 0,
      });
      rootNames.push(safeName(node));
    }

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || !current.node || !isNodeVisible(current.node)) {
        continue;
      }

      const node = current.node;
      const depth = current.depth;
      const rootId = current.rootId;
      const type = String(node.type || "UNKNOWN");
      const name = safeName(node);
      const bounds = getNodeBounds(node);
      const entry = {
        id: node.id,
        node,
        name,
        type,
        depth,
        rootId,
        order: orderCounter++,
        bounds,
      };

      nodeEntries.push(entry);
      if (supportsAnnotationsOnNode(node)) {
        annotationNodes.push(node);
      }

      typeStats.totalNodes += 1;
      typeStats.maxDepth = Math.max(typeStats.maxDepth, depth);
      bumpCount(typeCounts, type);
      bumpCount(nameCounts, canonicalizeName(name));

      if (type === "FRAME") {
        typeStats.frameCount += 1;
      } else if (type === "GROUP") {
        typeStats.groupCount += 1;
      } else if (type === "TEXT") {
        typeStats.textNodeCount += 1;
      } else if (type === "INSTANCE") {
        typeStats.instanceCount += 1;
      } else if (type === "SECTION") {
        typeStats.sectionCount += 1;
      } else if (type === "COMPONENT" || type === "COMPONENT_SET") {
        typeStats.componentCount += 1;
      }

      if (VECTOR_TYPES.has(type)) {
        typeStats.vectorCount += 1;
      }

      if (isMaskNode(node)) {
        typeStats.maskCount += 1;
      }

      if (hasVisibleEffects(node)) {
        typeStats.effectNodeCount += 1;
      }

      if (isSuspiciousName(name, type)) {
        suspiciousCount += 1;
        if (suspiciousExamples.length < 6) {
          suspiciousExamples.push(name);
        }
      }

      fractionalValueCount += inspectNumericFields(node, name, fractionalExamples, fractionalNodeIds);
      inspectPaintArray(node.fills, colorCounts, typeStats);
      inspectPaintArray(node.strokes, colorCounts, typeStats);

      const solidFill = getFirstVisibleSolidPaint(node.fills);
      if (solidFill && bounds && type !== "TEXT" && solidFill.opacity >= 0.95) {
        solidFillEntries.push(Object.assign({}, entry, {
          paintIndex: solidFill.paintIndex,
          color: cloneColor(solidFill.color),
          opacity: solidFill.opacity,
          hex: solidFill.hex,
        }));
      }

      if (type === "TEXT") {
        collectTextNodeSummary(node, textSamples, scriptCounts, fontFamilyCounts, fontSizeCounts, typeStats);
        const textEntry = buildTextEntry(node, entry);
        if (textEntry) {
          textEntries.push(textEntry);
        }
      }

      if (looksLikeButton(node)) {
        typeStats.buttonLikeCount += 1;
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push({
            node: node.children[index],
            depth: depth + 1,
            rootId,
          });
        }
      }
    }

    const duplicateEntries = sortCountEntries(nameCounts).filter((entry) => entry.count > 1);
    for (let index = 0; index < duplicateEntries.length && duplicateExamples.length < 5; index += 1) {
      const entry = duplicateEntries[index];
      duplicateExamples.push(`${entry.key} ×${entry.count}`);
    }

    const selectionBounds = combineBounds(rootBounds);
    const languageSummary = summarizeLanguage(scriptCounts);
    const contextSummary = inferDesignContext({
      rootNames,
      textSamples,
      typeStats,
      selectionBounds,
      topTypes: sortCountEntries(typeCounts),
    });
    const topTypes = sortCountEntries(typeCounts)
      .slice(0, 5)
      .map((entry) => ({
        type: entry.key,
        label: formatNodeType(entry.key),
        count: entry.count,
      }));
    const topColors = sortCountEntries(colorCounts)
      .slice(0, 6)
      .map((entry) => ({
        value: entry.key,
        count: entry.count,
      }));
    const topFonts = sortCountEntries(fontFamilyCounts)
      .slice(0, 4)
      .map((entry) => ({
        value: entry.key,
        count: entry.count,
      }));
    const topFontSizes = sortCountEntries(fontSizeCounts)
      .slice(0, 4)
      .map((entry) => ({
        value: entry.key,
        count: entry.count,
      }));

    const accessibility = buildAccessibilitySummary(textEntries, nodeEntries, solidFillEntries);

    if (languageSummary.descriptor) {
      nodeInsights.push(`언어 추정: ${languageSummary.descriptor}`);
    }
    nodeInsights.push(`레이어 ${typeStats.totalNodes}개, 텍스트 ${typeStats.textNodeCount}개, 깊이 ${typeStats.maxDepth}단계`);
    if (contextSummary.label) {
      nodeInsights.push(`맥락 추정: ${contextSummary.label}`);
    }
    if (fractionalNodeIds.size > 0) {
      nodeInsights.push(`픽셀 퍼펙트 후보: ${fractionalNodeIds.size}개 레이어에서 소수점 값 ${fractionalValueCount}건 감지`);
    } else {
      nodeInsights.push("픽셀 퍼펙트 후보: 핵심 좌표/크기 값은 대부분 정수 기준");
    }
    if (suspiciousCount > 0 || duplicateEntries.length > 0) {
      nodeInsights.push(`리네이밍 후보: 기본 이름 ${suspiciousCount}개, 중복 이름 ${duplicateEntries.length}종`);
    }
    if (accessibility.issueCount > 0) {
      nodeInsights.push(
        `접근성 진단: 대비 ${formatContrastInsight(accessibility)} · 폰트 ${accessibility.fontSizeIssueCount}건 · 터치 ${accessibility.tapTargetIssueCount}건`
      );
      if (accessibility.fixableCount > 0) {
        nodeInsights.push(`즉시 적용 가능: ${accessibility.fixableCount}건`);
      }
    } else {
      nodeInsights.push("접근성 진단: 즉시 수정이 필요한 이슈를 찾지 못했습니다.");
    }

    const result = {
      version: PATCH_VERSION,
      source: "local-heuristic",
      selectionSignature: getSelectionSignature(selection),
      analyzedAt: new Date().toISOString(),
      roots: rootSummaries,
      selectionBounds: selectionBounds
        ? {
            width: roundPixel(selectionBounds.width),
            height: roundPixel(selectionBounds.height),
          }
        : null,
      summary: {
        selectionLabel: formatSelectionLabel(rootSummaries),
        languageLabel: languageSummary.descriptor,
        languageReason: languageSummary.reason,
        contextLabel: contextSummary.label,
        contextReason: contextSummary.reason,
        aiStatusLabel: "로컬 휴리스틱",
        aiProviderLabel: "",
        aiModelLabel: "",
        issueCount: accessibility.issueCount,
        fixableCount: accessibility.fixableCount,
        annotationCount: 0,
      },
      stats: {
        rootCount: rootSummaries.length,
        totalNodes: typeStats.totalNodes,
        textNodeCount: typeStats.textNodeCount,
        frameCount: typeStats.frameCount,
        groupCount: typeStats.groupCount,
        vectorCount: typeStats.vectorCount,
        instanceCount: typeStats.instanceCount,
        componentCount: typeStats.componentCount,
        sectionCount: typeStats.sectionCount,
        imageFillCount: typeStats.imageFillCount,
        effectNodeCount: typeStats.effectNodeCount,
        maskCount: typeStats.maskCount,
        maxDepth: typeStats.maxDepth,
        textCharacterCount: typeStats.textCharacterCount,
        buttonLikeCount: typeStats.buttonLikeCount,
        topTypes,
      },
      naming: {
        suspiciousCount,
        suspiciousExamples,
        duplicateNameCount: duplicateEntries.length,
        duplicateExamples,
      },
      pixel: {
        fractionalNodeCount: fractionalNodeIds.size,
        fractionalValueCount,
        examples: fractionalExamples.slice(0, 8),
      },
      typography: {
        topFonts,
        topFontSizes,
        textSamples: textSamples.slice(0, 6),
      },
      colors: {
        topColors,
      },
      accessibility,
      insights: nodeInsights.slice(0, 6),
    };

    return {
      result,
      annotationNodes,
    };
  }

  function buildAccessibilitySummary(textEntries, nodeEntries, solidFillEntries) {
    const contrastIssues = analyzeContrastIssues(textEntries, solidFillEntries);
    const fontSizeIssues = analyzeFontSizeIssues(textEntries);
    const tapTargetAnalysis = analyzeTapTargetIssues(nodeEntries);
    const contrastSummary = summarizeContrastIssues(contrastIssues);
    const issues = dedupeIssues(contrastIssues.concat(fontSizeIssues, tapTargetAnalysis.issues))
      .sort(compareIssues)
      .slice(0, MAX_ISSUE_COUNT);
    const fontSizes = fontSizeIssues
      .map((issue) => issue.currentFontSize)
      .filter((value) => typeof value === "number" && Number.isFinite(value));

    const smallestTapTarget = tapTargetAnalysis.issues.reduce((best, issue) => {
      if (!issue || !issue.currentSize) {
        return best;
      }
      if (!best) {
        return issue.currentSize;
      }
      const bestArea = best.width * best.height;
      const issueArea = issue.currentSize.width * issue.currentSize.height;
      return issueArea < bestArea ? issue.currentSize : best;
    }, null);

    return {
      standardLabel: "WCAG 2.2 AA",
      issueCount: issues.length,
      fixableCount: issues.filter((issue) => issue && issue.canApply).length,
      contrastIssueCount: contrastIssues.length,
      bodyTextContrastIssueCount: contrastSummary.bodyTextIssueCount,
      actionTextContrastIssueCount: contrastSummary.actionTextIssueCount,
      largeTextContrastIssueCount: contrastSummary.largeTextIssueCount,
      fontSizeIssueCount: fontSizeIssues.length,
      tapTargetIssueCount: tapTargetAnalysis.issues.length,
      minimumContrastRatio: contrastSummary.minimumContrastRatio,
      minimumBodyTextContrastRatio: contrastSummary.minimumBodyTextContrastRatio,
      minimumActionTextContrastRatio: contrastSummary.minimumActionTextContrastRatio,
      minimumLargeTextContrastRatio: contrastSummary.minimumLargeTextContrastRatio,
      smallestFontSize: fontSizes.length
        ? fontSizes.reduce((smallest, value) => (value < smallest ? value : smallest), fontSizes[0])
        : null,
      smallestTapTargetLabel: smallestTapTarget
        ? `${roundPixel(smallestTapTarget.width)} x ${roundPixel(smallestTapTarget.height)}px`
        : "",
      evaluatedTextCount: textEntries.length,
      tapTargetCandidateCount: tapTargetAnalysis.candidateCount,
      issues,
      annotations: {
        annotationCount: 0,
        annotatedNodeCount: 0,
        clearedNodeCount: 0,
        removedAnnotationCount: 0,
        categoryLabel: ANNOTATION_CATEGORY_LABEL,
        modeLabel: "Result only",
      },
    };
  }

  function summarizeContrastIssues(issues) {
    const summary = {
      bodyTextIssueCount: 0,
      actionTextIssueCount: 0,
      largeTextIssueCount: 0,
      minimumContrastRatio: null,
      minimumBodyTextContrastRatio: null,
      minimumActionTextContrastRatio: null,
      minimumLargeTextContrastRatio: null,
    };

    const trackMinimum = (field, value) => {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return;
      }
      summary[field] =
        typeof summary[field] === "number" && Number.isFinite(summary[field])
          ? Math.min(summary[field], value)
          : value;
      summary.minimumContrastRatio =
        typeof summary.minimumContrastRatio === "number" && Number.isFinite(summary.minimumContrastRatio)
          ? Math.min(summary.minimumContrastRatio, value)
          : value;
    };

    for (const issue of Array.isArray(issues) ? issues : []) {
      if (!issue || typeof issue.contrastKind !== "string") {
        continue;
      }

      if (issue.contrastKind === "action-text") {
        summary.actionTextIssueCount += 1;
        trackMinimum("minimumActionTextContrastRatio", issue.currentRatio);
        continue;
      }
      if (issue.contrastKind === "large-text") {
        summary.largeTextIssueCount += 1;
        trackMinimum("minimumLargeTextContrastRatio", issue.currentRatio);
        continue;
      }

      summary.bodyTextIssueCount += 1;
      trackMinimum("minimumBodyTextContrastRatio", issue.currentRatio);
    }

    return summary;
  }

  function formatContrastInsight(accessibility) {
    if (!accessibility || !accessibility.contrastIssueCount) {
      return "0건";
    }

    const parts = [];
    if (accessibility.bodyTextContrastIssueCount > 0) {
      parts.push(`본문 ${accessibility.bodyTextContrastIssueCount}건`);
    }
    if (accessibility.actionTextContrastIssueCount > 0) {
      parts.push(`버튼 ${accessibility.actionTextContrastIssueCount}건`);
    }
    if (accessibility.largeTextContrastIssueCount > 0) {
      parts.push(`큰 텍스트 ${accessibility.largeTextContrastIssueCount}건`);
    }

    return parts.length ? `${accessibility.contrastIssueCount}건 (${parts.join(" · ")})` : `${accessibility.contrastIssueCount}건`;
  }

  function analyzeContrastIssues(textEntries, solidFillEntries) {
    const issues = [];
    for (const textEntry of textEntries) {
      if (!textEntry || !textEntry.bounds || !textEntry.fill || textEntry.fill.opacity < 0.95) {
        continue;
      }

      const background = findBackgroundForText(textEntry, solidFillEntries);
      if (!background || background.opacity < 0.95) {
        continue;
      }

      const threshold = getContrastTarget(textEntry);
      const ratio = contrastRatio(textEntry.fill.color, background.color);
      if (!Number.isFinite(ratio) || ratio + 0.01 >= threshold) {
        continue;
      }

      const fixPlan = buildContrastFixPlan(textEntry, background, threshold);
      const contrastMeta = getContrastIssueMeta(textEntry, threshold);
      const suggestion = fixPlan
        ? buildContrastSuggestionText(fixPlan, threshold)
        : "배경색 또는 텍스트 색을 더 선명하게 조정하면 기준에 가까워질 수 있습니다.";

      issues.push({
        id: createIssueId(`contrast:${contrastMeta.kind}`, textEntry.node.id),
        type: contrastMeta.type,
        severity: resolveContrastSeverity(ratio, threshold),
        wcag: threshold >= NORMAL_TEXT_CONTRAST_RATIO ? "WCAG 1.4.3" : "WCAG 1.4.3 (큰 텍스트)",
        nodeId: textEntry.node.id,
        nodeName: textEntry.name,
        nodeType: textEntry.type,
        summary: `${contrastMeta.label} 대비 ${ratio.toFixed(2)}:1`,
        detail: `${contrastMeta.label} 대비가 권장 기준 ${threshold}:1에 못 미칩니다.`,
        suggestion,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "제안 적용" : "",
        fixPlan,
        contrastKind: contrastMeta.kind,
        currentRatio: ratio,
        requiredContrastRatio: threshold,
        currentSize: null,
        currentFontSize: null,
      });
    }

    return issues;
  }

  function analyzeFontSizeIssues(textEntries) {
    const issues = [];
    for (const textEntry of textEntries) {
      if (!textEntry || typeof textEntry.fontSize !== "number" || !Number.isFinite(textEntry.fontSize)) {
        continue;
      }

      const recommendedSize = textEntry.isActionText ? MIN_ACTION_FONT_SIZE : MIN_BODY_FONT_SIZE;
      if (textEntry.fontSize + 0.01 >= recommendedSize) {
        continue;
      }

      const fixPlan = canAdjustFontSize(textEntry.node)
        ? {
            action: "set-font-size",
            targetNodeId: textEntry.node.id,
            targetFontSize: recommendedSize,
          }
        : null;

      issues.push({
        id: createIssueId("font-size", textEntry.node.id),
        type: "font-size",
        severity: textEntry.fontSize < Math.max(12, recommendedSize - 2) ? "warning" : "info",
        wcag: "가독성 권장",
        nodeId: textEntry.node.id,
        nodeName: textEntry.name,
        nodeType: textEntry.type,
        summary: `폰트 크기 ${roundValue(textEntry.fontSize)}px`,
        detail: textEntry.isActionText
          ? `버튼/액션 텍스트는 ${recommendedSize}px 이상에서 읽기와 탭 정확도가 좋아집니다.`
          : `본문 텍스트는 ${recommendedSize}px 이상에서 읽기 편한 경우가 많습니다.`,
        suggestion: `폰트 크기를 ${recommendedSize}px로 키우면 가독성이 좋아집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "크기 적용" : "",
        fixPlan,
        currentRatio: null,
        currentSize: null,
        currentFontSize: textEntry.fontSize,
      });
    }

    return issues;
  }

  function analyzeTapTargetIssues(nodeEntries) {
    const issues = [];
    const seen = new Set();
    let candidateCount = 0;

    for (const entry of nodeEntries) {
      const candidate = resolveTapTargetCandidate(entry);
      if (!candidate) {
        continue;
      }

      if (seen.has(candidate.id)) {
        continue;
      }
      seen.add(candidate.id);
      candidateCount += 1;

      const bounds = candidate.bounds;
      if (!bounds) {
        continue;
      }

      if (bounds.width + 0.01 >= MIN_TAP_TARGET && bounds.height + 0.01 >= MIN_TAP_TARGET) {
        continue;
      }

      const targetWidth = Math.max(MIN_TAP_TARGET, roundPixel(bounds.width));
      const targetHeight = Math.max(MIN_TAP_TARGET, roundPixel(bounds.height));
      const fixPlan = canResizeNode(candidate.node)
        ? {
            action: "resize-node",
            targetNodeId: candidate.node.id,
            targetWidth,
            targetHeight,
          }
        : null;

      issues.push({
        id: createIssueId("tap-target", candidate.node.id),
        type: "tap-target",
        severity: resolveTapTargetSeverity(bounds),
        wcag: "WCAG 2.5.8",
        nodeId: candidate.node.id,
        nodeName: candidate.name,
        nodeType: candidate.type,
        summary: `터치 영역 ${roundPixel(bounds.width)} x ${roundPixel(bounds.height)}px`,
        detail: "모바일 웹/앱에서 터치 대상은 44 x 44px 이상일 때 누르기 편합니다.",
        suggestion: `터치 영역을 ${targetWidth} x ${targetHeight}px 이상으로 키우면 탭 정확도가 좋아집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "영역 적용" : "",
        fixPlan,
        currentRatio: null,
        currentSize: {
          width: bounds.width,
          height: bounds.height,
        },
        currentFontSize: null,
      });
    }

    return {
      issues,
      candidateCount,
    };
  }

  async function enrichDiagnosisWithAi(localResult) {
    const ai = getAiHelper();
    if (!ai) {
      localResult.summary.aiStatusLabel = "로컬 휴리스틱";
      return localResult;
    }

    let configured = false;
    let runInfo = {
      provider: "",
      model: "",
    };
    try {
      const settings = typeof ai.getAiSettingsAsync === "function" ? await ai.getAiSettingsAsync() : null;
      if (settings && typeof ai.getResolvedRunInfo === "function") {
        runInfo = ai.getResolvedRunInfo(settings);
      }
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      localResult.summary.aiStatusLabel = "로컬 휴리스틱";
      return localResult;
    }

    localResult.summary.aiStatusLabel = "AI + 로컬";
    localResult.summary.aiProviderLabel = formatProviderLabel(runInfo.provider);
    localResult.summary.aiModelLabel = runInfo.model || "";

    const payload = {
      selectionLabel: localResult.summary ? localResult.summary.selectionLabel : "",
      roots: Array.isArray(localResult.roots) ? localResult.roots.slice(0, 6) : [],
      selectionBounds: localResult.selectionBounds || null,
      stats: localResult.stats || {},
      naming: localResult.naming || {},
      pixel: localResult.pixel || {},
      typography: localResult.typography || {},
      colors: localResult.colors || {},
      currentSummary: localResult.summary || {},
      currentInsights: Array.isArray(localResult.insights) ? localResult.insights.slice(0, 6) : [],
      accessibility: {
        issueCount: localResult.accessibility ? localResult.accessibility.issueCount : 0,
        contrastIssueCount: localResult.accessibility ? localResult.accessibility.contrastIssueCount : 0,
        bodyTextContrastIssueCount: localResult.accessibility ? localResult.accessibility.bodyTextContrastIssueCount || 0 : 0,
        actionTextContrastIssueCount: localResult.accessibility ? localResult.accessibility.actionTextContrastIssueCount || 0 : 0,
        largeTextContrastIssueCount: localResult.accessibility ? localResult.accessibility.largeTextContrastIssueCount || 0 : 0,
        fontSizeIssueCount: localResult.accessibility ? localResult.accessibility.fontSizeIssueCount : 0,
        tapTargetIssueCount: localResult.accessibility ? localResult.accessibility.tapTargetIssueCount : 0,
        issues: Array.isArray(localResult.accessibility && localResult.accessibility.issues)
          ? localResult.accessibility.issues.slice(0, 6).map((issue) => ({
              id: issue.id,
              type: issue.type,
              summary: issue.summary,
              detail: issue.detail,
              suggestion: issue.suggestion,
            }))
          : [],
      },
    };
    const schema = {
      type: "object",
      properties: {
        languageLabel: { type: "string" },
        contextLabel: { type: "string" },
        contextReason: { type: "string" },
        contentSummary: { type: "string" },
        namingSummary: { type: "string" },
        pixelSummary: { type: "string" },
        accessibilitySummary: { type: "string" },
        prioritySummary: { type: "string" },
        insights: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "languageLabel",
        "contextLabel",
        "contextReason",
        "contentSummary",
        "namingSummary",
        "pixelSummary",
        "accessibilitySummary",
        "prioritySummary",
        "insights",
      ],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions:
          "You analyze structured Figma metadata plus accessibility findings for a design correction plugin. Return concise Korean JSON. Keep labels short and practical. Infer the screen context, summarize naming and pixel issues, and explain accessibility priorities without inventing numeric values that are not already in the payload.",
        schema,
        payload,
      });
      if (!response || typeof response !== "object") {
        return localResult;
      }

      if (typeof response.languageLabel === "string" && response.languageLabel.trim()) {
        localResult.summary.languageLabel = response.languageLabel.trim();
      }
      if (typeof response.contextLabel === "string" && response.contextLabel.trim()) {
        localResult.summary.contextLabel = response.contextLabel.trim();
      }
      if (typeof response.contextReason === "string" && response.contextReason.trim()) {
        localResult.summary.contextReason = response.contextReason.trim();
      }
      if (typeof response.contentSummary === "string" && response.contentSummary.trim()) {
        localResult.summary.contentSummary = response.contentSummary.trim();
      }
      if (typeof response.namingSummary === "string" && response.namingSummary.trim()) {
        localResult.naming.aiSummary = response.namingSummary.trim();
      }
      if (typeof response.pixelSummary === "string" && response.pixelSummary.trim()) {
        localResult.pixel.aiSummary = response.pixelSummary.trim();
      }
      if (typeof response.accessibilitySummary === "string" && response.accessibilitySummary.trim()) {
        localResult.accessibility.aiSummary = response.accessibilitySummary.trim();
      }
      if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
        localResult.accessibility.prioritySummary = response.prioritySummary.trim();
      }

      localResult.summary.aiProviderLabel = formatProviderLabel(response._provider || runInfo.provider);
      localResult.summary.aiModelLabel = response._model || runInfo.model || "";
      localResult.source = typeof response._provider === "string" ? response._provider : "hybrid-ai";
      localResult.insights = mergeInsights(ai, localResult, response);
    } catch (error) {
      localResult.aiError = normalizeErrorMessage(error, "AI 접근성 요약에 실패했습니다.");
    }

    return localResult;
  }

  function mergeInsights(ai, localResult, response) {
    const aiInsights = [];
    if (typeof response.contentSummary === "string" && response.contentSummary.trim()) {
      aiInsights.push("콘텐츠 요약: " + response.contentSummary.trim());
    }
    if (typeof response.namingSummary === "string" && response.namingSummary.trim()) {
      aiInsights.push("AI 네이밍 판단: " + response.namingSummary.trim());
    }
    if (typeof response.pixelSummary === "string" && response.pixelSummary.trim()) {
      aiInsights.push("AI 픽셀 판단: " + response.pixelSummary.trim());
    }
    if (typeof response.accessibilitySummary === "string" && response.accessibilitySummary.trim()) {
      aiInsights.push("AI 접근성 요약: " + response.accessibilitySummary.trim());
    }
    if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
      aiInsights.push("우선 순위: " + response.prioritySummary.trim());
    }
    if (Array.isArray(response.insights)) {
      for (const item of response.insights) {
        if (typeof item === "string" && item.trim()) {
          aiInsights.push(item.trim());
        }
      }
    }
    return ai.uniqueStrings(aiInsights.concat(Array.isArray(localResult.insights) ? localResult.insights : []), 6);
  }

  async function applyFixPlan(plan) {
    if (!plan || typeof plan !== "object" || typeof plan.action !== "string") {
      throw new Error("적용 가능한 수정안 정보가 없습니다.");
    }

    if (plan.action === "set-solid-fill-color") {
      applySolidFillColorPlan(plan);
      return;
    }
    if (plan.action === "set-font-size") {
      await applyFontSizePlan(plan);
      return;
    }
    if (plan.action === "resize-node") {
      applyResizePlan(plan);
      return;
    }

    throw new Error("아직 지원하지 않는 수정안입니다.");
  }

  function applySolidFillColorPlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    const index = typeof plan.paintIndex === "number" ? plan.paintIndex : 0;
    if (!canEditSolidPaint(node, index)) {
      throw new Error("색상을 변경할 레이어를 찾지 못했습니다.");
    }

    const fills = node.fills.map((paint) => clonePlainObject(paint));
    const paint = fills[index];
    if (!paint || paint.type !== "SOLID") {
      throw new Error("색상을 적용할 수 있는 SOLID fill이 없습니다.");
    }

    paint.color = cloneColor(plan.color);
    fills[index] = paint;
    node.fills = fills;
  }

  async function applyFontSizePlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!canAdjustFontSize(node)) {
      throw new Error("폰트 크기를 조정할 텍스트 레이어를 찾지 못했습니다.");
    }

    await loadFontsForTextNode(node);
    const targetFontSize = typeof plan.targetFontSize === "number" ? plan.targetFontSize : null;
    if (!targetFontSize || !Number.isFinite(targetFontSize)) {
      throw new Error("적용할 폰트 크기 값이 올바르지 않습니다.");
    }

    if (typeof node.fontSize === "number" && node.fontSize !== figma.mixed) {
      node.fontSize = targetFontSize;
      return;
    }

    if (typeof node.setRangeFontSize === "function" && typeof node.characters === "string") {
      node.setRangeFontSize(0, node.characters.length, targetFontSize);
      return;
    }

    throw new Error("이 텍스트 레이어는 폰트 크기를 직접 조정할 수 없습니다.");
  }

  function applyResizePlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node || !canResizeNode(node)) {
      throw new Error("터치 영역을 조정할 레이어를 찾지 못했습니다.");
    }

    const width = Math.max(1, Number(plan.targetWidth) || 0);
    const height = Math.max(1, Number(plan.targetHeight) || 0);
    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(width, height);
      return;
    }
    if (typeof node.resize === "function") {
      node.resize(width, height);
      return;
    }

    throw new Error("이 레이어는 크기 조정을 지원하지 않습니다.");
  }

  function supportsAnnotations(nodes) {
    const sampleNode = Array.isArray(nodes) && nodes.length > 0 ? nodes[0] : null;
    return !!sampleNode && "annotations" in sampleNode;
  }

  async function ensureAnnotationCategory(requestedColor) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const nextColor =
        typeof requestedColor === "string" && requestedColor.trim()
          ? requestedColor.trim().toLowerCase()
          : ANNOTATION_CATEGORY_COLOR;
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const existing = Array.isArray(categories)
        ? categories.find((category) => category && category.label === ANNOTATION_CATEGORY_LABEL)
        : null;
      if (existing) {
        if (typeof existing.setColor === "function" && existing.color !== nextColor) {
          existing.setColor(nextColor);
        }
        return existing;
      }

      if (typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
        return null;
      }

      return await figma.annotations.addAnnotationCategoryAsync({
        label: ANNOTATION_CATEGORY_LABEL,
        color: nextColor,
      });
    } catch (error) {
      return null;
    }
  }

  function applyAccessibilityAnnotations(nodes, issues, category) {
    const issuesByNode = new Map();
    const skipped = [];
    let annotationCount = 0;
    let annotatedNodeCount = 0;
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const issue of issues) {
      const bucket = issuesByNode.get(issue.nodeId) || [];
      bucket.push(issue);
      issuesByNode.set(issue.nodeId, bucket);
    }

    for (const node of nodes) {
      const nodeIssues = issuesByNode.get(node.id) || [];
      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedAccessibilityAnnotation(annotation, category));
        const removedCount = Math.max(0, existing.length - preserved.length);

        if (removedCount > 0) {
          removedAnnotationCount += removedCount;
        }
        if (removedCount > 0 && nodeIssues.length === 0) {
          clearedNodeCount += 1;
        }

        node.annotations = preserved.concat(nodeIssues.map((issue) => buildAccessibilityAnnotation(issue, category)));
        if (nodeIssues.length > 0) {
          annotatedNodeCount += 1;
          annotationCount += nodeIssues.length;
        }
      } catch (error) {
        if (nodeIssues.length > 0) {
          skipped.push({
            label: safeName(node),
            reason: normalizeErrorMessage(error, "접근성 주석을 남기지 못했습니다."),
          });
        }
      }
    }

    return {
      skipped,
      annotationCount,
      annotatedNodeCount,
      clearedNodeCount,
      removedAnnotationCount,
      modeLabel: annotationCount > 0 ? "Green Dev Mode annotation" : "Result only",
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
    };
  }

  function buildAccessibilityAnnotation(issue, category) {
    const lines = [`[중요도 : ${getIssuePriorityLabel(issue)}]`];
    if (issue.summary) {
      lines.push(`- ${issue.summary}`);
    }
    if (issue.suggestion) {
      lines.push(`- ${issue.suggestion}`);
    }

    const annotation = {
      label: lines.join("\n"),
    };
    if (category && category.id) {
      annotation.categoryId = category.id;
    }
    return annotation;
  }

  function getIssuePriorityLabel(issue) {
    const severity = issue && typeof issue.severity === "string" ? issue.severity : "info";
    if (severity === "error") {
      return "상";
    }
    if (severity === "warning") {
      return "중";
    }
    return "하";
  }

  function isManagedAccessibilityAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return typeof label === "string" && (label.startsWith(ANNOTATION_LABEL_PREFIX) || label.startsWith(`[${ANNOTATION_LABEL_PREFIX}]`));
  }

  function buildResultOnlyAnnotation(issues, reason) {
    const skipped = [];
    if (Array.isArray(issues) && issues.length > 0 && reason) {
      skipped.push({
        label: "주석 미적용",
        reason,
      });
    }

    return {
      skipped,
      annotationCount: 0,
      annotatedNodeCount: 0,
      clearedNodeCount: 0,
      removedAnnotationCount: 0,
      modeLabel: "Result only",
      categoryLabel: ANNOTATION_CATEGORY_LABEL,
    };
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper &&
      typeof helper.requestJsonTask === "function" &&
      typeof helper.hasConfiguredAiAsync === "function" &&
      typeof helper.uniqueStrings === "function"
      ? helper
      : null;
  }

  function buildTextEntry(node, entry) {
    const bounds = entry.bounds;
    if (!bounds) {
      return null;
    }

    const fill = getFirstVisibleSolidPaint(node.fills);
    const textValue = getTextValue(node);
    const fontSize = typeof node.fontSize === "number" && Number.isFinite(node.fontSize) ? node.fontSize : null;
    const fontWeight = getFontWeight(node);
    return Object.assign({}, entry, {
      text: textValue,
      fill,
      fontSize,
      fontWeight,
      isActionText: looksLikeActionText(textValue) || looksLikeButton(node),
    });
  }

  function getTextValue(node) {
    const value = typeof node.characters === "string" ? node.characters.replace(/\s+/g, " ").trim() : "";
    return value || safeName(node);
  }

  function getFontWeight(node) {
    if (typeof node.fontWeight === "number" && Number.isFinite(node.fontWeight)) {
      return node.fontWeight;
    }
    if (node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      return fontWeightFromStyle(node.fontName.style);
    }
    return 400;
  }

  function fontWeightFromStyle(style) {
    const value = String(style || "").toLowerCase();
    if (/black|heavy|extrabold|extra bold|bold/.test(value)) {
      return 700;
    }
    if (/semibold|semi bold|demi/.test(value)) {
      return 600;
    }
    if (/medium/.test(value)) {
      return 500;
    }
    return 400;
  }

  function getContrastTarget(textEntry) {
    const fontSize = typeof textEntry.fontSize === "number" ? textEntry.fontSize : 0;
    const fontWeight = typeof textEntry.fontWeight === "number" ? textEntry.fontWeight : 400;
    return fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700)
      ? LARGE_TEXT_CONTRAST_RATIO
      : NORMAL_TEXT_CONTRAST_RATIO;
  }

  function getContrastIssueMeta(textEntry, threshold) {
    if (textEntry && textEntry.isActionText) {
      return {
        kind: "action-text",
        type: "contrast-action-text",
        label: "버튼/액션 텍스트",
      };
    }

    if (threshold < NORMAL_TEXT_CONTRAST_RATIO) {
      return {
        kind: "large-text",
        type: "contrast-large-text",
        label: "큰 텍스트",
      };
    }

    return {
      kind: "body-text",
      type: "contrast-body-text",
      label: "본문 텍스트",
    };
  }

  function resolveTapTargetCandidate(entry) {
    if (!entry || !entry.node || !entry.bounds) {
      return null;
    }

    if (entry.type === "PAGE" || entry.type === "SECTION" || entry.type === "COMPONENT_SET") {
      return null;
    }

    if (entry.type === "TEXT") {
      const textValue = getTextValue(entry.node);
      if (!looksLikeActionText(textValue)) {
        return null;
      }

      const parent = entry.node.parent;
      if (!parent || parent.type === "PAGE" || parent.type === "SECTION") {
        return null;
      }

      const parentBounds = getNodeBounds(parent);
      if (!parentBounds) {
        return null;
      }

      return {
        id: parent.id,
        node: parent,
        name: safeName(parent),
        type: String(parent.type || "UNKNOWN"),
        bounds: parentBounds,
      };
    }

    const bounds = entry.bounds;
    if (bounds.width > 360 || bounds.height > 160) {
      return null;
    }

    if (hasReactions(entry.node)) {
      return entry;
    }

    const name = safeName(entry.node);
    if (CONTROL_NAME_PATTERN.test(name)) {
      return entry;
    }

    const textValue = truncateText(collectNodeTexts(entry.node, 2, 2).join(" "), 36);
    if (looksLikeActionText(textValue) && (hasVisibleFillOrStroke(entry.node) || hasCornerRadius(entry.node) || hasLayout(entry.node))) {
      return entry;
    }

    return null;
  }

  function findBackgroundForText(textEntry, solidFillEntries) {
    let current = textEntry.node.parent;
    while (current && current.type !== "PAGE") {
      const bounds = getNodeBounds(current);
      const fill = getFirstVisibleSolidPaint(current.fills);
      if (bounds && fill && fill.opacity >= 0.95 && containsBounds(bounds, textEntry.bounds)) {
        return {
          node: current,
          name: safeName(current),
          type: String(current.type || "UNKNOWN"),
          bounds,
          color: cloneColor(fill.color),
          opacity: fill.opacity,
          paintIndex: fill.paintIndex,
          hex: fill.hex,
        };
      }
      current = current.parent;
    }

    let best = null;
    for (const entry of solidFillEntries) {
      if (!entry || entry.rootId !== textEntry.rootId || entry.id === textEntry.id) {
        continue;
      }
      if (entry.order >= textEntry.order || !entry.bounds) {
        continue;
      }

      const contains = containsBounds(entry.bounds, textEntry.bounds);
      const overlapRatio = overlapArea(entry.bounds, textEntry.bounds) / Math.max(1, textEntry.bounds.width * textEntry.bounds.height);
      if (!contains && overlapRatio < 0.6) {
        continue;
      }

      if (!best) {
        best = { entry, contains };
        continue;
      }

      const currentArea = entry.bounds.width * entry.bounds.height;
      const bestArea = best.entry.bounds.width * best.entry.bounds.height;
      if (contains && !best.contains) {
        best = { entry, contains };
        continue;
      }
      if (contains === best.contains && currentArea < bestArea) {
        best = { entry, contains };
      }
    }

    return best
      ? {
          node: best.entry.node,
          name: best.entry.name,
          type: best.entry.type,
          bounds: best.entry.bounds,
          color: cloneColor(best.entry.color),
          opacity: best.entry.opacity,
          paintIndex: best.entry.paintIndex,
          hex: best.entry.hex,
        }
      : null;
  }

  function buildContrastFixPlan(textEntry, background, threshold) {
    const candidates = [];
    if (textEntry.fill && canEditSolidPaint(textEntry.node, textEntry.fill.paintIndex)) {
      const color = findAccessibleReplacement(background.color, textEntry.fill.color, threshold);
      if (color) {
        candidates.push({
          action: "set-solid-fill-color",
          targetNodeId: textEntry.node.id,
          paintIndex: textEntry.fill.paintIndex,
          color,
          colorHex: rgbToHex(color),
          targetLabel: "텍스트 색상",
          previewRatio: contrastRatio(color, background.color),
        });
      }
    }

    if (background && canEditSolidPaint(background.node, background.paintIndex)) {
      const color = findAccessibleReplacement(textEntry.fill.color, background.color, threshold);
      if (color) {
        candidates.push({
          action: "set-solid-fill-color",
          targetNodeId: background.node.id,
          paintIndex: background.paintIndex,
          color,
          colorHex: rgbToHex(color),
          targetLabel: "배경색",
          previewRatio: contrastRatio(textEntry.fill.color, color),
        });
      }
    }

    if (!candidates.length) {
      return null;
    }

    candidates.sort((left, right) => {
      const leftBase = left.targetLabel === "배경색" ? background.color : textEntry.fill.color;
      const rightBase = right.targetLabel === "배경색" ? background.color : textEntry.fill.color;
      const leftDistance = colorDistance(left.color, leftBase);
      const rightDistance = colorDistance(right.color, rightBase);
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      if (left.targetLabel === "배경색" && right.targetLabel !== "배경색") {
        return -1;
      }
      if (left.targetLabel !== "배경색" && right.targetLabel === "배경색") {
        return 1;
      }
      return 0;
    });

    return candidates[0];
  }

  function buildContrastSuggestionText(fixPlan, threshold) {
    const ratioText =
      typeof fixPlan.previewRatio === "number" && Number.isFinite(fixPlan.previewRatio)
        ? ` (${fixPlan.previewRatio.toFixed(2)}:1)`
        : "";
    return `${fixPlan.targetLabel}을 ${fixPlan.colorHex}로 변경하면 명도 대비 ${threshold}:1 기준을 통과할 수 있습니다${ratioText}.`;
  }

  function dedupeIssues(issues) {
    const map = new Map();
    for (const issue of issues) {
      if (!issue || !issue.id || map.has(issue.id)) {
        continue;
      }
      map.set(issue.id, issue);
    }
    return Array.from(map.values());
  }

  function compareIssues(left, right) {
    const severityOrder = {
      error: 0,
      warning: 1,
      info: 2,
    };
    const leftSeverityKey = left && left.severity ? left.severity : "info";
    const rightSeverityKey = right && right.severity ? right.severity : "info";
    const leftSeverityValue = severityOrder[leftSeverityKey];
    const rightSeverityValue = severityOrder[rightSeverityKey];
    const leftSeverity = typeof leftSeverityValue === "number" ? leftSeverityValue : 3;
    const rightSeverity = typeof rightSeverityValue === "number" ? rightSeverityValue : 3;
    if (leftSeverity !== rightSeverity) {
      return leftSeverity - rightSeverity;
    }
    return String(left.summary || "").localeCompare(String(right.summary || ""));
  }

  function resolveContrastSeverity(ratio, threshold) {
    if (!Number.isFinite(ratio)) {
      return "warning";
    }

    const criticalThreshold =
      threshold >= NORMAL_TEXT_CONTRAST_RATIO ? CRITICAL_NORMAL_TEXT_CONTRAST_RATIO : CRITICAL_LARGE_TEXT_CONTRAST_RATIO;
    return ratio <= criticalThreshold ? "error" : "warning";
  }

  function resolveTapTargetSeverity(bounds) {
    if (!bounds) {
      return "warning";
    }

    return bounds.width < CRITICAL_TAP_TARGET || bounds.height < CRITICAL_TAP_TARGET ? "error" : "warning";
  }

  function findAccessibleReplacement(fixedColor, currentColor, threshold) {
    if (contrastRatio(fixedColor, currentColor) >= threshold) {
      return cloneColor(currentColor);
    }

    const endpoints = [
      { r: 0, g: 0, b: 0 },
      { r: 1, g: 1, b: 1 },
    ];
    const candidates = [];

    for (const endpoint of endpoints) {
      if (contrastRatio(fixedColor, endpoint) + 0.0001 < threshold) {
        continue;
      }

      let low = 0;
      let high = 1;
      for (let index = 0; index < 24; index += 1) {
        const mid = (low + high) / 2;
        const candidate = mixColors(currentColor, endpoint, mid);
        if (contrastRatio(fixedColor, candidate) >= threshold) {
          high = mid;
        } else {
          low = mid;
        }
      }
      candidates.push(mixColors(currentColor, endpoint, high));
    }

    if (!candidates.length) {
      return null;
    }

    candidates.sort((left, right) => colorDistance(left, currentColor) - colorDistance(right, currentColor));
    return candidates[0];
  }

  function contrastRatio(left, right) {
    const leftL = relativeLuminance(left);
    const rightL = relativeLuminance(right);
    const lighter = Math.max(leftL, rightL);
    const darker = Math.min(leftL, rightL);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function relativeLuminance(color) {
    const toLinear = (value) => {
      const channel = Math.max(0, Math.min(1, Number(value) || 0));
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    };
    const red = toLinear(color.r);
    const green = toLinear(color.g);
    const blue = toLinear(color.b);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }

  function mixColors(source, target, amount) {
    const ratio = Math.max(0, Math.min(1, amount));
    return {
      r: source.r + (target.r - source.r) * ratio,
      g: source.g + (target.g - source.g) * ratio,
      b: source.b + (target.b - source.b) * ratio,
    };
  }

  function colorDistance(left, right) {
    const red = left.r - right.r;
    const green = left.g - right.g;
    const blue = left.b - right.b;
    return Math.sqrt(red * red + green * green + blue * blue);
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  function canEditSolidPaint(node, paintIndex) {
    if (!isDirectlyEditableNode(node)) {
      return false;
    }
    if (!("fills" in node) || !Array.isArray(node.fills) || typeof paintIndex !== "number" || paintIndex < 0) {
      return false;
    }
    const paint = node.fills[paintIndex];
    return !!paint && paint.visible !== false && paint.type === "SOLID" && !!paint.color;
  }

  function canAdjustFontSize(node) {
    return (
      !!node &&
      node.type === "TEXT" &&
      isDirectlyEditableNode(node) &&
      typeof node.characters === "string" &&
      node.characters.length > 0 &&
      typeof node.setRangeFontSize === "function" &&
      collectEditableFontNames(node).length > 0
    );
  }

  function canResizeNode(node) {
    if (!isDirectlyEditableNode(node)) {
      return false;
    }
    if (node.type === "GROUP" || node.type === "TEXT" || node.type === "LINE") {
      return false;
    }
    if (!canResizeInParentAutoLayout(node)) {
      return false;
    }
    return typeof node.resizeWithoutConstraints === "function" || typeof node.resize === "function";
  }

  function isDirectlyEditableNode(node) {
    return !!node && !hasLockedAncestor(node) && !hasInstanceAncestor(node);
  }

  function hasLockedAncestor(node) {
    let current = node;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (current.locked === true) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function hasInstanceAncestor(node) {
    let current = node;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (current.type === "INSTANCE") {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function canResizeInParentAutoLayout(node) {
    if (!node || !node.parent || typeof node.parent.layoutMode !== "string" || node.parent.layoutMode === "NONE") {
      return true;
    }
    if (node.layoutPositioning === "ABSOLUTE") {
      return true;
    }

    const horizontalMode =
      typeof node.layoutSizingHorizontal === "string" ? node.layoutSizingHorizontal : "FIXED";
    const verticalMode = typeof node.layoutSizingVertical === "string" ? node.layoutSizingVertical : "FIXED";
    return horizontalMode === "FIXED" && verticalMode === "FIXED";
  }

  function hasVisibleFillOrStroke(node) {
    return hasVisibleSolidPaint(node.fills) || hasVisibleSolidPaint(node.strokes);
  }

  function hasVisibleSolidPaint(paints) {
    return !!getFirstVisibleSolidPaint(paints);
  }

  function hasCornerRadius(node) {
    const fields = [
      node.cornerRadius,
      node.topLeftRadius,
      node.topRightRadius,
      node.bottomRightRadius,
      node.bottomLeftRadius,
    ];
    return fields.some((value) => typeof value === "number" && Number.isFinite(value) && value > 0);
  }

  function hasLayout(node) {
    return !!node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function hasReactions(node) {
    return !!node && Array.isArray(node.reactions) && node.reactions.length > 0;
  }

  function looksLikeActionText(value) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized || normalized.length > 24) {
      return false;
    }
    return ACTION_TEXT_PATTERN.test(normalized.toLowerCase());
  }

  function collectNodeTexts(node, limit, depth) {
    const texts = [];
    const maxCount = typeof limit === "number" ? limit : 2;
    const maxDepth = typeof depth === "number" ? depth : 2;

    const walk = (current, currentDepth) => {
      if (!current || texts.length >= maxCount || currentDepth > maxDepth) {
        return;
      }
      if (current.type === "TEXT") {
        const value = getTextValue(current);
        if (value) {
          texts.push(value);
        }
        return;
      }
      if (!hasChildren(current)) {
        return;
      }
      for (const child of current.children) {
        if (texts.length >= maxCount) {
          break;
        }
        walk(child, currentDepth + 1);
      }
    };

    walk(node, 0);
    return texts;
  }

  function truncateText(value, limit) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    const maxLength = typeof limit === "number" ? limit : 48;
    if (!normalized) {
      return "";
    }
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
  }

  function collectTextNodeSummary(node, textSamples, scriptCounts, fontFamilyCounts, fontSizeCounts, typeStats) {
    const value = typeof node.characters === "string" ? node.characters.trim() : "";
    if (value) {
      if (textSamples.length < 6 && !textSamples.includes(value)) {
        textSamples.push(value.length > 72 ? `${value.slice(0, 69)}...` : value);
      }
      addScriptCounts(scriptCounts, value);
      typeStats.textCharacterCount += value.length;
    }

    collectFontNames(node, fontFamilyCounts);
    if (typeof node.fontSize === "number" && Number.isFinite(node.fontSize)) {
      bumpCount(fontSizeCounts, String(roundValue(node.fontSize)));
    }
  }

  function collectFontNames(node, fontFamilyCounts) {
    if (node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      bumpCount(fontFamilyCounts, node.fontName.family || "Unknown");
      return;
    }

    if (node.fontName === figma.mixed && typeof node.getRangeAllFontNames === "function") {
      try {
        const fontNames = node.getRangeAllFontNames(0, typeof node.characters === "string" ? node.characters.length : 0);
        const uniqueFamilies = new Set();
        for (const fontName of fontNames) {
          if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string") {
            continue;
          }
          uniqueFamilies.add(fontName.family);
          if (uniqueFamilies.size >= 6) {
            break;
          }
        }
        uniqueFamilies.forEach((family) => bumpCount(fontFamilyCounts, family));
      } catch (error) {
        bumpCount(fontFamilyCounts, "Mixed");
      }
    }
  }

  function inspectPaintArray(paints, colorCounts, typeStats) {
    if (!Array.isArray(paints)) {
      return;
    }
    for (const paint of paints) {
      if (!paint || paint.visible === false) {
        continue;
      }
      if (paint.type === "IMAGE") {
        typeStats.imageFillCount += 1;
        continue;
      }
      if (paint.type !== "SOLID" || !paint.color) {
        continue;
      }
      const hex = rgbToHex(paint.color);
      bumpCount(colorCounts, hex);
      typeStats.solidPaintCount += 1;
    }
  }

  function inspectNumericFields(node, nodeName, examples, nodeIds) {
    const fields = [];
    maybeTrackNumber(fields, "x", node.x);
    maybeTrackNumber(fields, "y", node.y);
    maybeTrackNumber(fields, "width", node.width);
    maybeTrackNumber(fields, "height", node.height);
    maybeTrackNumber(fields, "rotation", node.rotation);
    maybeTrackNumber(fields, "strokeWeight", node.strokeWeight);
    maybeTrackNumber(fields, "cornerRadius", node.cornerRadius);
    maybeTrackNumber(fields, "topLeftRadius", node.topLeftRadius);
    maybeTrackNumber(fields, "topRightRadius", node.topRightRadius);
    maybeTrackNumber(fields, "bottomLeftRadius", node.bottomLeftRadius);
    maybeTrackNumber(fields, "bottomRightRadius", node.bottomRightRadius);
    if (!fields.length) {
      return 0;
    }

    nodeIds.add(node.id);
    if (examples.length < 12) {
      examples.push({
        name: nodeName,
        fields,
      });
    }
    return fields.length;
  }

  function maybeTrackNumber(fields, fieldName, value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }
    if (Math.abs(value - Math.round(value)) <= 0.0001) {
      return;
    }
    fields.push(`${fieldName} ${roundValue(value)}`);
  }

  function addScriptCounts(scriptCounts, text) {
    for (const character of text) {
      const codePoint = character.codePointAt(0);
      if (typeof codePoint !== "number") {
        continue;
      }
      if (
        (codePoint >= 0xac00 && codePoint <= 0xd7af) ||
        (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
        (codePoint >= 0x3130 && codePoint <= 0x318f)
      ) {
        scriptCounts.korean += 1;
      } else if (
        (codePoint >= 0x3040 && codePoint <= 0x309f) ||
        (codePoint >= 0x30a0 && codePoint <= 0x30ff)
      ) {
        scriptCounts.japanese += 1;
      } else if (codePoint >= 0x4e00 && codePoint <= 0x9fff) {
        scriptCounts.cjk += 1;
      } else if ((codePoint >= 0x0041 && codePoint <= 0x005a) || (codePoint >= 0x0061 && codePoint <= 0x007a)) {
        scriptCounts.latin += 1;
      } else if (codePoint >= 0x0030 && codePoint <= 0x0039) {
        scriptCounts.digit += 1;
      } else if (!/\s/.test(character)) {
        scriptCounts.other += 1;
      }
    }
  }

  function summarizeLanguage(scriptCounts) {
    const ordered = Object.entries(scriptCounts)
      .filter((entry) => entry[0] !== "digit" && entry[0] !== "other" && entry[1] > 0)
      .sort((left, right) => right[1] - left[1]);
    if (!ordered.length) {
      return {
        descriptor: "텍스트 언어 미감지",
        reason: "텍스트 레이어가 없거나 언어 판별에 충분한 문자가 없습니다.",
      };
    }

    const primary = ordered[0];
    const secondary = ordered[1] && primary[1] > 0 && ordered[1][1] / primary[1] >= 0.25 ? ordered[1] : null;
    const descriptor = secondary
      ? `${languageLabel(primary[0])} 중심 / ${languageLabel(secondary[0])} 혼합`
      : `${languageLabel(primary[0])} 중심`;

    return {
      descriptor,
      reason: `${languageLabel(primary[0])} 비중이 가장 높습니다.`,
    };
  }

  function inferDesignContext(options) {
    const corpus = `${options.rootNames.join(" ")} ${options.textSamples.join(" ")}`.toLowerCase();
    const categories = [
      { label: "인증/폼 화면", reason: "로그인, 가입, 입력, 확인 계열 텍스트 신호가 많습니다.", keywords: ["login", "sign in", "sign up", "email", "password", "submit", "continue", "로그인", "회원가입", "이메일", "비밀번호", "입력", "제출", "확인", "인증"] },
      { label: "대시보드/데이터 화면", reason: "지표, 표, 차트 계열 레이어와 숫자 중심 텍스트가 보입니다.", keywords: ["dashboard", "analytics", "chart", "table", "report", "metric", "stats", "data", "대시보드", "분석", "차트", "테이블", "리포트", "지표", "매출"] },
      { label: "랜딩/프로모션 화면", reason: "짧은 CTA 문구와 버튼형 신호가 많아 홍보형 화면으로 보입니다.", keywords: ["get started", "learn more", "shop", "book", "download", "discover", "contact", "지금", "시작", "구매", "예약", "자세히", "다운로드", "문의"] },
      { label: "모달/다이얼로그", reason: "선택 범위가 상대적으로 작고 확인/취소 계열 문구가 보입니다.", keywords: ["cancel", "confirm", "delete", "ok", "취소", "삭제", "닫기", "확인"] },
      { label: "앱/웹 내비게이션 화면", reason: "메뉴, 설정, 홈, 프로필 등 탐색성 텍스트가 많습니다.", keywords: ["home", "profile", "settings", "menu", "search", "notification", "홈", "프로필", "설정", "메뉴", "검색", "알림"] },
    ];

    let best = null;
    for (const category of categories) {
      let score = 0;
      for (const keyword of category.keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }
      if (category.label === "랜딩/프로모션 화면" && options.typeStats.buttonLikeCount >= 2) {
        score += 1;
      }
      if (category.label === "모달/다이얼로그" && options.selectionBounds && options.selectionBounds.width <= 720) {
        score += 1;
      }
      if (category.label === "대시보드/데이터 화면" && options.typeStats.textNodeCount >= 8) {
        score += 1;
      }
      if (!best || score > best.score) {
        best = {
          label: category.label,
          reason: category.reason,
          score,
        };
      }
    }

    if (best && best.score > 0) {
      return best;
    }
    if (options.typeStats.componentCount + options.typeStats.instanceCount >= Math.max(2, options.typeStats.rootCount || 1)) {
      return {
        label: "컴포넌트/변형 세트",
        reason: "컴포넌트와 인스턴스 비중이 높습니다.",
        score: 0,
      };
    }
    if (options.topTypes.length > 0) {
      return {
        label: "일반 UI 화면",
        reason: `${formatNodeType(options.topTypes[0].key || options.topTypes[0].type)} 중심 구조입니다.`,
        score: 0,
      };
    }
    return {
      label: "일반 선택 영역",
      reason: "구조 분석은 가능하지만 특정 화면 맥락 신호는 약합니다.",
      score: 0,
    };
  }

  function getFirstVisibleSolidPaint(paints) {
    if (!Array.isArray(paints)) {
      return null;
    }
    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }
      return {
        paintIndex: index,
        color: cloneColor(paint.color),
        opacity: typeof paint.opacity === "number" && Number.isFinite(paint.opacity) ? paint.opacity : 1,
        hex: rgbToHex(paint.color),
      };
    }
    return null;
  }

  function looksLikeButton(node) {
    const name = safeName(node).toLowerCase();
    if (CONTROL_NAME_PATTERN.test(name)) {
      return true;
    }
    if (node.type === "TEXT" && typeof node.characters === "string") {
      return looksLikeActionText(node.characters);
    }
    return false;
  }

  function combineBounds(boundsList) {
    if (!boundsList.length) {
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
      width: Math.max(0, right - left),
      height: Math.max(0, bottom - top),
    };
  }

  function getNodeBounds(node) {
    if (node && node.absoluteBoundingBox) {
      return node.absoluteBoundingBox;
    }
    if (node && node.absoluteRenderBounds) {
      return node.absoluteRenderBounds;
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
        width: node.width,
        height: node.height,
      };
    }
    return null;
  }

  function overlapArea(left, right) {
    const overlapWidth = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
    const overlapHeight = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
    return overlapWidth * overlapHeight;
  }

  function containsBounds(outer, inner) {
    return (
      outer.x <= inner.x + 0.5 &&
      outer.y <= inner.y + 0.5 &&
      outer.x + outer.width >= inner.x + inner.width - 0.5 &&
      outer.y + outer.height >= inner.y + inner.height - 0.5
    );
  }

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => node.id)
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
  }

  function formatSelectionLabel(roots) {
    if (!roots.length) {
      return "선택 없음";
    }
    if (roots.length === 1) {
      return roots[0].name;
    }
    return `${roots[0].name} 외 ${roots.length - 1}개`;
  }

  function sortCountEntries(map) {
    return Array.from(map.entries())
      .map((entry) => ({
        key: entry[0],
        count: entry[1],
      }))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        return String(left.key).localeCompare(String(right.key));
      });
  }

  function bumpCount(map, key) {
    if (!key) {
      return;
    }
    map.set(key, (map.get(key) || 0) + 1);
  }

  function canonicalizeName(name) {
    return String(name || "Unnamed").trim().toLowerCase();
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name.trim();
    }
    return String((node && node.type) || "Unnamed");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children);
  }

  function hasVisibleEffects(node) {
    return !!node && Array.isArray(node.effects) && node.effects.some((effect) => effect && effect.visible !== false);
  }

  function isMaskNode(node) {
    return !!node && node.isMask === true;
  }

  function isSuspiciousName(name, type) {
    if (!name) {
      return true;
    }
    const normalized = String(name).trim();
    if (!normalized) {
      return true;
    }
    if (normalized.toUpperCase() === String(type || "").toUpperCase()) {
      return true;
    }
    return AUTO_NAME_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  function isNodeVisible(node) {
    return !!node && node.visible !== false;
  }

  function cloneColor(color) {
    return {
      r: Number(color.r) || 0,
      g: Number(color.g) || 0,
      b: Number(color.b) || 0,
    };
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => clonePlainObject(item));
    }
    const clone = {};
    Object.keys(value).forEach((key) => {
      clone[key] = clonePlainObject(value[key]);
    });
    return clone;
  }

  function rgbToHex(color) {
    const red = toHexChannel(color.r);
    const green = toHexChannel(color.g);
    const blue = toHexChannel(color.b);
    return `#${red}${green}${blue}`;
  }

  function toHexChannel(value) {
    const channel = Math.max(0, Math.min(255, Math.round(value * 255)));
    return channel.toString(16).padStart(2, "0").toUpperCase();
  }

  function roundValue(value) {
    return Math.round(value * 100) / 100;
  }

  function roundPixel(value) {
    return Math.round(value);
  }

  function languageLabel(language) {
    switch (language) {
      case "korean":
        return "한국어";
      case "latin":
        return "영어/라틴";
      case "japanese":
        return "일본어";
      case "cjk":
        return "중국어/한자";
      default:
        return "기타";
    }
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
      case "BOOLEAN_OPERATION":
        return "불리언";
      case "RECTANGLE":
        return "사각형";
      case "ELLIPSE":
        return "타원";
      default:
        return type;
    }
  }

  async function loadFontsForTextNode(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }
    const fontNames = collectEditableFontNames(node);
    for (const fontName of fontNames) {
      await figma.loadFontAsync(fontName);
    }
  }

  function collectEditableFontNames(node) {
    const fontNames = [];
    const seen = new Set();
    const pushFont = (fontName) => {
      if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }
      const key = `${fontName.family}::${fontName.style}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    };

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (const fontName of rangeFonts) {
          pushFont(fontName);
        }
      } catch (error) {}
    }

    if (fontNames.length === 0 && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  function createIssueId(type, nodeId) {
    return `${type}:${nodeId}`;
  }

  function formatProviderLabel(provider) {
    switch (String(provider || "").toLowerCase()) {
      case "openai":
        return "OpenAI";
      case "gemini":
        return "Gemini";
      default:
        return provider ? String(provider) : "";
    }
  }

  function normalizeErrorMessage(error, fallback) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return fallback;
  }
})();

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_DESIGN_CONSISTENCY_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  if (typeof originalOnMessage !== "function") {
    return;
  }

  const AI_DESIGN_CONSISTENCY_CACHE_KEY = "pigma:ai-design-consistency-cache:v1";
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const PATCH_VERSION = 1;
  const ANNOTATION_CATEGORY_LABEL = "디자인 일관성";
  const ANNOTATION_CATEGORY_COLOR = "blue";
  const ANNOTATION_LABEL_PREFIX = "[디자인 일관성]";
  const ACCESSIBILITY_ANNOTATION_CATEGORY_LABEL = "웹 접근성 진단";
  const ACCESSIBILITY_ANNOTATION_LABEL_PREFIX = "[웹 접근성 진단]";
  const DIAGNOSIS_CLEAR_CATEGORY_LABEL = "웹 접근성 진단 + 디자인 일관성";
  const MAX_ISSUE_COUNT = 24;
  const COLOR_DISTANCE_THRESHOLD = 0.11;
  const COLOR_TOKEN_LIMIT = 6;
  const FONT_SIZE_TOKEN_LIMIT = 6;
  const SPACING_TOKEN_LIMIT = 6;
  const MIN_TOKEN_COUNT = 2;
  const SPACING_PLAN_FIELDS = new Set(["itemSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]);
  const PALETTE_ROLES = {
    fills: "배경",
    strokes: "보더",
    text: "텍스트",
  };
  let activeExecution = null;

  figma.ui.onmessage = async (message) => {
    if (isConsistencyMessage(message)) {
      if (message.type === "request-ai-design-consistency-cache") {
        await postCachedResult();
        return;
      }

      if (message.type === "run-ai-design-consistency-clear") {
        await withExecutionLock(
          {
            status: "clearing-annotations",
            message: "현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 정리하고 있습니다.",
            extra: {},
          },
          runDesignConsistencyClear
        );
        return;
      }

      if (message.type === "run-ai-design-consistency-apply-fix") {
        await withExecutionLock(
          {
            status: "applying-fix",
            message: "선택한 일관성 제안을 적용하고 있습니다.",
            extra: {
              issueId: message && typeof message.issueId === "string" ? message.issueId.trim() : "",
            },
          },
          () => applyIssueFix(message)
        );
        return;
      }

      await withExecutionLock(
        {
          status: "running",
          message: "현재 선택을 기준으로 디자인 일관성을 검사하고 있습니다.",
          extra: {},
        },
        runDesignConsistencyDiagnosis
      );
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_DESIGN_CONSISTENCY_PATCH__ = true;

  function isConsistencyMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-design-consistency-cache" ||
        message.type === "run-ai-design-consistency" ||
        message.type === "run-ai-design-consistency-clear" ||
        message.type === "run-ai-design-consistency-apply-fix")
    );
  }

  async function withExecutionLock(execution, runner) {
    if (activeExecution) {
      postStatus(activeExecution.status, activeExecution.message, activeExecution.extra);
      return false;
    }

    activeExecution =
      execution && typeof execution === "object" ? execution : { status: "running", message: "", extra: {} };
    try {
      await runner();
      return true;
    } finally {
      activeExecution = null;
    }
  }

  async function runDesignConsistencyDiagnosis(options) {
    const runOptions = options && typeof options === "object" ? options : {};
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    if (!runOptions.skipStatus) {
      postStatus("running", "현재 선택을 기준으로 디자인 일관성을 검사하고 있습니다.");
    }

    try {
      const analysis = analyzeCurrentSelection();
      let result = analysis.result;
      const annotationSupported = Array.isArray(analysis.annotationNodes) && analysis.annotationNodes.length > 0;
      const category =
        annotationSupported && supportsAnnotations(analysis.annotationNodes)
          ? await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR)
          : null;
      const annotationResult = category
        ? applyConsistencyAnnotations(analysis.annotationNodes, result.consistency.issues, category)
        : buildResultOnlyAnnotation(result.consistency.issues, "Dev Mode 주석을 지원하지 않는 선택입니다.");

      result.consistency.annotations = {
        annotationCount: annotationResult.annotationCount || 0,
        annotatedNodeCount: annotationResult.annotatedNodeCount || 0,
        clearedNodeCount: annotationResult.clearedNodeCount || 0,
        removedAnnotationCount: annotationResult.removedAnnotationCount || 0,
        categoryLabel: annotationResult.categoryLabel || ANNOTATION_CATEGORY_LABEL,
        modeLabel: annotationResult.modeLabel || "Result only",
      };
      result.summary.issueCount = result.consistency.issueCount;
      result.summary.fixableCount = result.consistency.fixableCount;
      result.summary.annotationCount = result.consistency.annotations.annotationCount;

      result = await enrichConsistencyWithAi(result);
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: "ai-design-consistency-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      if (runOptions.notify !== false) {
        figma.notify(runOptions.notifyMessage || "디자인 일관성 진단 완료", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "디자인 일관성 진단에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-design-consistency-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function applyIssueFix(message) {
    const issueId = message && typeof message.issueId === "string" ? message.issueId.trim() : "";
    if (!issueId) {
      throw new Error("적용할 디자인 일관성 제안을 찾지 못했습니다.");
    }

    postStatus("applying-fix", "선택한 일관성 제안을 적용하고 있습니다.", {
      issueId,
    });

    const cachedResult = await readCachedResult();
    const issues =
      cachedResult && cachedResult.consistency && Array.isArray(cachedResult.consistency.issues)
        ? cachedResult.consistency.issues
        : [];
    const issue = issues.find((entry) => entry && entry.id === issueId);

    if (!issue || !issue.fixPlan) {
      throw new Error("선택한 제안을 다시 찾지 못했습니다. 디자인 일관성 진단을 다시 실행해 주세요.");
    }

    await applyFixPlan(issue.fixPlan);
    figma.notify("디자인 일관성 제안 적용 완료", { timeout: 1600 });
    await runDesignConsistencyDiagnosis({
      skipStatus: true,
      notifyMessage: "제안 적용 후 디자인 일관성을 다시 확인했습니다.",
    });
  }

  async function runDesignConsistencyClear() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus("clearing-annotations", "현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 정리하고 있습니다.");

    try {
      const analysis = analyzeCurrentSelection();
      const managedCategories =
        Array.isArray(analysis.annotationNodes) && analysis.annotationNodes.length > 0
          ? await getManagedDiagnosisCategories()
          : { consistency: null, accessibility: null };
      const cleared = removeDiagnosisAnnotations(analysis.annotationNodes, managedCategories);
      const result = buildConsistencyClearResult(analysis.result, cleared, managedCategories);
      await syncDiagnosisCachesAfterClear(result.selectionSignature, result.summary);

      figma.ui.postMessage({
        type: "ai-design-consistency-clear-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      if ((result.summary.removedAnnotationCount || 0) > 0) {
        figma.notify(`디자인 진단 주석 정리 완료 (${result.summary.removedAnnotationCount || 0}건 제거)`, {
          timeout: 2200,
        });
      } else {
        figma.notify("현재 선택 범위에서 삭제할 디자인 진단 주석을 찾지 못했습니다.", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "디자인 진단 주석 정리에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-design-consistency-clear-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedResult() {
    const result = await readCachedResult();
    figma.ui.postMessage({
      type: "ai-design-consistency-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message, extra) {
    const payload = extra && typeof extra === "object" ? extra : {};
    const body = {
      type: "ai-design-consistency-status",
      status,
      message,
    };
    Object.keys(payload).forEach((key) => {
      body[key] = payload[key];
    });
    figma.ui.postMessage(body);
  }

  function buildConsistencyClearResult(baseResult, cleared, managedCategories) {
    const result = baseResult && typeof baseResult === "object" ? baseResult : {};
    const summary = result.summary && typeof result.summary === "object" ? result.summary : {};
    const stats = result.stats && typeof result.stats === "object" ? result.stats : {};
    const clearedResult = cleared && typeof cleared === "object" ? cleared : {};
    const clearedItems = Array.isArray(clearedResult.cleared) ? clearedResult.cleared : [];
    const skipped = Array.isArray(clearedResult.skipped) ? clearedResult.skipped : [];
    const categories = managedCategories && typeof managedCategories === "object" ? managedCategories : {};
    const categoryLabels = [];

    if ((clearedResult.removedAccessibilityAnnotationCount || 0) > 0 || categories.accessibility) {
      categoryLabels.push(ACCESSIBILITY_ANNOTATION_CATEGORY_LABEL);
    }
    if ((clearedResult.removedConsistencyAnnotationCount || 0) > 0 || categories.consistency) {
      categoryLabels.push(ANNOTATION_CATEGORY_LABEL);
    }

    return {
      version: PATCH_VERSION,
      source: "managed-annotation-clear",
      selectionSignature: result.selectionSignature || getSelectionSignature(figma.currentPage.selection),
      analyzedAt: new Date().toISOString(),
      selectionBounds: result.selectionBounds || null,
      summary: {
        selectionLabel: summary.selectionLabel || "?좏깮",
        contextLabel: summary.contextLabel || "?쇰컲 UI ?붾㈃",
        aiStatusLabel: "주석 정리",
        aiProviderLabel: "",
        aiModelLabel: "",
        removedAnnotationCount: clearedResult.removedAnnotationCount || 0,
        removedAccessibilityAnnotationCount: clearedResult.removedAccessibilityAnnotationCount || 0,
        removedConsistencyAnnotationCount: clearedResult.removedConsistencyAnnotationCount || 0,
        clearedNodeCount: clearedResult.clearedNodeCount || 0,
        skippedCount: skipped.length,
        categoryLabel: categoryLabels.length ? categoryLabels.join(" + ") : DIAGNOSIS_CLEAR_CATEGORY_LABEL,
        mode: "annotation-clear",
        modeLabel: "Green/Blue Dev Mode annotation clear",
      },
      stats: {
        totalNodes: typeof stats.totalNodes === "number" && Number.isFinite(stats.totalNodes) ? stats.totalNodes : 0,
        textNodeCount: typeof stats.textNodeCount === "number" && Number.isFinite(stats.textNodeCount) ? stats.textNodeCount : 0,
        autoLayoutCount:
          typeof stats.autoLayoutCount === "number" && Number.isFinite(stats.autoLayoutCount) ? stats.autoLayoutCount : 0,
      },
      cleared: clearedItems.slice(0, 12),
      skipped: skipped.slice(0, 8),
    };
  }

  async function readCachedResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_CONSISTENCY_CACHE_KEY);
      return normalizeCachedResult(value);
    } catch (error) {
      return null;
    }
  }

  async function writeCachedResult(result) {
    const normalized = normalizeCachedResult(result);
    try {
      await figma.clientStorage.setAsync(AI_DESIGN_CONSISTENCY_CACHE_KEY, normalized);
    } catch (error) {}
    return normalized;
  }

  async function syncDiagnosisCachesAfterClear(selectionSignature, clearSummary) {
    const summary = clearSummary && typeof clearSummary === "object" ? clearSummary : {};
    await syncCachedAnnotationState(
      AI_DESIGN_CONSISTENCY_CACHE_KEY,
      selectionSignature,
      "consistency",
      summary.removedConsistencyAnnotationCount || 0
    );
    await syncCachedAnnotationState(
      AI_DESIGN_READ_CACHE_KEY,
      selectionSignature,
      "accessibility",
      summary.removedAccessibilityAnnotationCount || 0
    );
  }

  async function syncCachedAnnotationState(cacheKey, selectionSignature, sectionKey, removedAnnotationCount) {
    try {
      const cached = await figma.clientStorage.getAsync(cacheKey);
      if (!cached || typeof cached !== "object" || cached.selectionSignature !== selectionSignature) {
        return;
      }

      const section = cached[sectionKey];
      if (!section || typeof section !== "object" || !section.annotations || typeof section.annotations !== "object") {
        return;
      }

      section.annotations.annotationCount = 0;
      section.annotations.annotatedNodeCount = 0;
      section.annotations.clearedNodeCount = 0;
      section.annotations.removedAnnotationCount = removedAnnotationCount;
      section.annotations.modeLabel = "Result only";

      if (cached.summary && typeof cached.summary === "object") {
        cached.summary.annotationCount = 0;
      }

      await figma.clientStorage.setAsync(cacheKey, cached);
    } catch (error) {}
  }

  function normalizeCachedResult(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    return value;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function analyzeCurrentSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택해 주세요.");
    }

    const rootBounds = [];
    const rootSummaries = [];
    const rootNames = [];
    const textSamples = [];
    const annotationNodes = [];
    const paintEntries = [];
    const textEntries = [];
    const spacingEntries = [];
    const nodeEntries = [];
    const typeCounts = new Map();
    let orderCounter = 0;

    const stats = {
      rootCount: selection.length,
      totalNodes: 0,
      frameCount: 0,
      groupCount: 0,
      textNodeCount: 0,
      instanceCount: 0,
      componentCount: 0,
      autoLayoutCount: 0,
      maxDepth: 0,
    };

    const stack = [];
    for (let index = selection.length - 1; index >= 0; index -= 1) {
      const node = selection[index];
      stack.push({ node, depth: 1, rootId: node.id });
      const bounds = getNodeBounds(node);
      if (bounds) {
        rootBounds.push(bounds);
      }
      rootSummaries.push({
        id: node.id,
        name: safeName(node),
        type: String(node.type || "UNKNOWN"),
        width: bounds ? roundPixel(bounds.width) : null,
        height: bounds ? roundPixel(bounds.height) : null,
        childCount: hasChildren(node) ? node.children.length : 0,
      });
      rootNames.push(safeName(node));
    }

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || !current.node || !isNodeVisible(current.node)) {
        continue;
      }

      const node = current.node;
      const depth = current.depth;
      const bounds = getNodeBounds(node);
      const type = String(node.type || "UNKNOWN");
      const name = safeName(node);
      const entry = {
        id: node.id,
        node,
        bounds,
        type,
        name,
        depth,
        rootId: current.rootId,
        parentId: node.parent && typeof node.parent.id === "string" ? node.parent.id : "",
        order: orderCounter++,
      };
      nodeEntries.push(entry);

      stats.totalNodes += 1;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      bumpCount(typeCounts, type);

      if (supportsAnnotationsOnNode(node)) {
        annotationNodes.push(node);
      }

      if (type === "FRAME") {
        stats.frameCount += 1;
      } else if (type === "GROUP") {
        stats.groupCount += 1;
      } else if (type === "TEXT") {
        stats.textNodeCount += 1;
      } else if (type === "INSTANCE") {
        stats.instanceCount += 1;
      } else if (type === "COMPONENT" || type === "COMPONENT_SET") {
        stats.componentCount += 1;
      }

      collectPaintEntries(node, entry, paintEntries);
      collectSpacingEntries(node, entry, spacingEntries);

      if (hasLayout(node)) {
        stats.autoLayoutCount += 1;
      }

      if (type === "TEXT") {
        const textEntry = buildTextEntry(node, entry);
        if (textEntry) {
          textEntries.push(textEntry);
          if (textSamples.length < 6 && textEntry.text) {
            textSamples.push(textEntry.text);
          }
        }
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push({
            node: node.children[index],
            depth: depth + 1,
            rootId: current.rootId,
          });
        }
      }
    }

    const selectionBounds = combineBounds(rootBounds);
    const topTypes = sortCountEntries(typeCounts)
      .slice(0, 5)
      .map((item) => ({
        type: item.key,
        label: formatNodeType(item.key),
        count: item.count,
      }));
    const contextSummary = inferDesignContext({
      rootNames,
      textSamples,
      stats,
      selectionBounds,
      topTypes,
    });
    const consistency = buildConsistencySummary(paintEntries, textEntries, spacingEntries, nodeEntries);
    const insights = buildInsights(consistency);

    const result = {
      version: PATCH_VERSION,
      source: "local-heuristic",
      selectionSignature: getSelectionSignature(selection),
      analyzedAt: new Date().toISOString(),
      roots: rootSummaries,
      selectionBounds: selectionBounds
        ? {
            width: roundPixel(selectionBounds.width),
            height: roundPixel(selectionBounds.height),
          }
        : null,
      summary: {
        selectionLabel: formatSelectionLabel(rootSummaries),
        contextLabel: contextSummary.label,
        contextReason: contextSummary.reason,
        aiStatusLabel: "로컬 휴리스틱",
        aiProviderLabel: "",
        aiModelLabel: "",
        issueCount: consistency.issueCount,
        fixableCount: consistency.fixableCount,
        annotationCount: 0,
      },
      stats: Object.assign({}, stats, {
        topTypes,
      }),
      consistency,
      insights,
    };

    return {
      result,
      annotationNodes,
    };
  }

  function buildConsistencySummary(paintEntries, textEntries, spacingEntries, nodeEntries) {
    const colorTokens = buildColorTokens(paintEntries);
    const typographyTokens = buildTypographyTokens(textEntries);
    const spacingTokens = buildSpacingTokens(spacingEntries);

    const colorIssues = analyzeColorIssues(paintEntries, colorTokens);
    const typographyIssues = analyzeTypographyIssues(textEntries, typographyTokens);
    const spacingIssues = analyzeSpacingIssues(spacingEntries, spacingTokens);
    const semanticSpacingIssues = analyzeSemanticSpacingIssues(nodeEntries, textEntries);
    const repeatedPatternIssues = analyzeRepeatedPatternIssues(nodeEntries, textEntries);
    const formIssues = analyzeFormConsistencyIssues(nodeEntries, textEntries);

    const issues = dedupeIssues(
      colorIssues.concat(typographyIssues, spacingIssues, semanticSpacingIssues, repeatedPatternIssues, formIssues)
    )
      .sort(compareIssues)
      .slice(0, MAX_ISSUE_COUNT);

    return {
      standardLabel: "색상 · 타이포 · 여백 · 맥락",
      issueCount: issues.length,
      fixableCount: issues.filter((issue) => issue && issue.canApply).length,
      colorIssueCount: colorIssues.length,
      typographyIssueCount: typographyIssues.length,
      spacingIssueCount: spacingIssues.length,
      semanticIssueCount: semanticSpacingIssues.length,
      repetitionIssueCount: repeatedPatternIssues.length,
      formIssueCount: formIssues.length,
      colorTokenSummary: colorTokens.summary,
      typographyTokenSummary: typographyTokens.summary,
      spacingTokenSummary: spacingTokens.summary,
      colorTokens: colorTokens.items.map((item) => item.hex),
      typographyTokens: {
        families: typographyTokens.familyItems.map((item) => item.value),
        sizes: typographyTokens.sizeItems.map((item) => item.value),
      },
      spacingTokens: spacingTokens.items.map((item) => item.value),
      issues,
      annotations: {
        annotationCount: 0,
        annotatedNodeCount: 0,
        clearedNodeCount: 0,
        removedAnnotationCount: 0,
        categoryLabel: ANNOTATION_CATEGORY_LABEL,
        modeLabel: "Result only",
      },
    };
  }

  function buildColorTokens(paintEntries) {
    const counts = new Map();
    for (const entry of paintEntries) {
      if (!entry || !entry.hex) {
        continue;
      }
      bumpCount(counts, entry.hex);
    }

    let items = sortCountEntries(counts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, COLOR_TOKEN_LIMIT)
      .map((item) => ({
        hex: item.key,
        count: item.count,
        color: paintEntries.find((entry) => entry.hex === item.key).color,
      }));

    if (!items.length) {
      items = sortCountEntries(counts)
        .slice(0, Math.min(COLOR_TOKEN_LIMIT, 4))
        .map((item) => ({
          hex: item.key,
          count: item.count,
          color: paintEntries.find((entry) => entry.hex === item.key).color,
        }));
    }

    return {
      items,
      summary: items.length ? items.map((item) => `${item.hex} (${item.count})`).join(" · ") : "대표 색상 감지 없음",
    };
  }

  function buildTypographyTokens(textEntries) {
    const familyCounts = new Map();
    const sizeCounts = new Map();

    for (const entry of textEntries) {
      if (entry.fontFamily && entry.fontFamily !== "Mixed") {
        bumpCount(familyCounts, entry.fontFamily);
      }
      if (typeof entry.fontSize === "number" && Number.isFinite(entry.fontSize)) {
        bumpCount(sizeCounts, String(roundValue(entry.fontSize)));
      }
    }

    const familyItems = sortCountEntries(familyCounts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, 3)
      .map((item) => ({
        value: item.key,
        count: item.count,
      }));
    const sizeItems = sortCountEntries(sizeCounts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, FONT_SIZE_TOKEN_LIMIT)
      .map((item) => ({
        value: Number(item.key),
        count: item.count,
      }));

    const familySummary = familyItems.length ? familyItems.map((item) => item.value).join(" · ") : "대표 폰트 감지 없음";
    const sizeSummary = sizeItems.length ? sizeItems.map((item) => `${item.value}px`).join(" · ") : "대표 크기 감지 없음";

    return {
      familyItems,
      sizeItems,
      dominantFamily: familyItems.length ? familyItems[0].value : "",
      summary: `${familySummary} / ${sizeSummary}`,
    };
  }

  function buildSpacingTokens(spacingEntries) {
    const counts = new Map();
    for (const entry of spacingEntries) {
      if (!entry || typeof entry.value !== "number" || !Number.isFinite(entry.value)) {
        continue;
      }
      bumpCount(counts, String(roundValue(entry.value)));
    }

    let items = sortCountEntries(counts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, SPACING_TOKEN_LIMIT)
      .map((item) => ({
        value: Number(item.key),
        count: item.count,
      }));

    if (!items.length) {
      items = sortCountEntries(counts)
        .slice(0, Math.min(SPACING_TOKEN_LIMIT, 4))
        .map((item) => ({
          value: Number(item.key),
          count: item.count,
        }));
    }

    return {
      items,
      summary: items.length ? items.map((item) => `${item.value}px`).join(" · ") : "대표 간격 감지 없음",
    };
  }

  function analyzeColorIssues(paintEntries, colorTokens) {
    if (!colorTokens.items.length) {
      return [];
    }

    const tokenSet = new Set(colorTokens.items.map((item) => item.hex));
    const colorCounts = new Map();
    for (const entry of paintEntries) {
      bumpCount(colorCounts, entry.hex);
    }

    const issues = [];
    for (const entry of paintEntries) {
      if (!entry || !entry.hex || tokenSet.has(entry.hex)) {
        continue;
      }

      const nearest = findNearestColorToken(entry.color, colorTokens.items);
      if (!nearest || nearest.distance > COLOR_DISTANCE_THRESHOLD) {
        continue;
      }

      const currentCount = colorCounts.get(entry.hex) || 0;
      const shouldFlag = currentCount <= 1 || nearest.count >= Math.max(2, currentCount + 1);
      if (!shouldFlag) {
        continue;
      }

      const fixPlan = canEditPaintEntry(entry)
        ? {
            action: "set-solid-paint-color",
            targetNodeId: entry.nodeId,
            property: entry.property,
            paintIndex: entry.paintIndex,
            color: cloneColor(nearest.color),
          }
        : null;

      issues.push({
        id: createIssueId(`color:${entry.property}:${entry.paintIndex}`, entry.nodeId),
        category: "color",
        type: "color-token",
        severity: nearest.distance <= 0.05 ? "warning" : "info",
        guideline: "색상 토큰",
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        summary: `${PALETTE_ROLES[entry.role] || "색상"} ${entry.hex}`,
        detail: `${PALETTE_ROLES[entry.role] || "색상"} 값이 대표 팔레트 ${nearest.hex}과 거의 같은데 따로 사용되고 있습니다.`,
        suggestion: `${nearest.hex}로 맞추면 색상 일관성이 더 좋아집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "색상 적용" : "",
        fixPlan,
      });
    }

    return issues;
  }

  function analyzeTypographyIssues(textEntries, typographyTokens) {
    const issues = [];
    const familyCounts = new Map();
    const sizeCounts = new Map();

    for (const entry of textEntries) {
      if (entry.fontFamily && entry.fontFamily !== "Mixed") {
        bumpCount(familyCounts, entry.fontFamily);
      }
      if (typeof entry.fontSize === "number" && Number.isFinite(entry.fontSize)) {
        bumpCount(sizeCounts, String(roundValue(entry.fontSize)));
      }
    }

    for (const entry of textEntries) {
      if (entry.fontFamily && entry.fontFamily !== "Mixed" && typographyTokens.dominantFamily) {
        const dominantCount = familyCounts.get(typographyTokens.dominantFamily) || 0;
        const currentCount = familyCounts.get(entry.fontFamily) || 0;
        if (
          entry.fontFamily !== typographyTokens.dominantFamily &&
          dominantCount >= 3 &&
          currentCount <= 1
        ) {
          issues.push({
            id: createIssueId("type-family", entry.nodeId),
            category: "typography",
            type: "font-family",
            severity: "warning",
            guideline: "대표 폰트",
            nodeId: entry.nodeId,
            nodeName: entry.nodeName,
            nodeType: entry.nodeType,
            summary: `폰트 ${entry.fontFamily}`,
            detail: `이 텍스트는 대표 폰트 ${typographyTokens.dominantFamily} 대신 ${entry.fontFamily}를 단독으로 사용하고 있습니다.`,
            suggestion: `${typographyTokens.dominantFamily} 계열로 맞추면 타이포 일관성이 높아집니다.`,
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          });
        }
      }

      if (typeof entry.fontSize !== "number" || !Number.isFinite(entry.fontSize) || !typographyTokens.sizeItems.length) {
        continue;
      }

      const nearest = findNearestNumericToken(entry.fontSize, typographyTokens.sizeItems.map((item) => item.value));
      if (!nearest) {
        continue;
      }

      const currentCount = sizeCounts.get(String(roundValue(entry.fontSize))) || 0;
      if (Math.abs(nearest - entry.fontSize) < 0.5 || Math.abs(nearest - entry.fontSize) > 4 || currentCount > 1) {
        continue;
      }

      const fixPlan = canAdjustFontSize(entry.node)
        ? {
            action: "set-font-size",
            targetNodeId: entry.nodeId,
            targetFontSize: nearest,
          }
        : null;

      issues.push({
        id: createIssueId("type-size", entry.nodeId),
        category: "typography",
        type: "font-size",
        severity: "info",
        guideline: "대표 폰트 크기",
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        summary: `폰트 크기 ${roundValue(entry.fontSize)}px`,
        detail: `현재 크기가 대표 크기 스케일과 어긋나 있습니다. 가장 가까운 토큰은 ${nearest}px입니다.`,
        suggestion: `${nearest}px로 맞추면 화면 전체의 타이포 리듬이 더 안정적입니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "크기 적용" : "",
        fixPlan,
      });
    }

    return issues;
  }

  function analyzeSpacingIssues(spacingEntries, spacingTokens) {
    if (!spacingTokens.items.length) {
      return [];
    }

    const counts = new Map();
    for (const entry of spacingEntries) {
      bumpCount(counts, String(roundValue(entry.value)));
    }

    const tokenValues = spacingTokens.items.map((item) => item.value);
    const issues = [];
    for (const entry of spacingEntries) {
      if (!entry || typeof entry.value !== "number" || !Number.isFinite(entry.value)) {
        continue;
      }

      const currentValue = roundValue(entry.value);
      if (tokenValues.some((value) => Math.abs(value - currentValue) < 0.01)) {
        continue;
      }

      const nearestToken = findNearestNumericToken(currentValue, tokenValues);
      const gridTarget = Math.max(0, Math.round(currentValue / 4) * 4);
      const targetValue =
        typeof nearestToken === "number" && Math.abs(nearestToken - currentValue) <= 4
          ? nearestToken
          : gridTarget;

      if (Math.abs(targetValue - currentValue) < 1) {
        continue;
      }

      const currentCount = counts.get(String(currentValue)) || 0;
      if (currentCount > 1 && isOnFourPointGrid(currentValue)) {
        continue;
      }

      const fixPlan = canAdjustSpacingFields(entry.node, entry.fields)
        ? {
            action: "set-spacing-value",
            targetNodeId: entry.nodeId,
            changes: entry.fields.map((field) => ({
              field,
              value: targetValue,
            })),
          }
        : null;

      issues.push({
        id: createIssueId(`spacing:${entry.kind}`, entry.nodeId),
        category: "spacing",
        type: "spacing",
        severity: isOnFourPointGrid(currentValue) ? "info" : "warning",
        guideline: "간격 스케일",
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        summary: `${entry.label} ${currentValue}px`,
        detail: `${entry.label} 값이 대표 간격 스케일과 어긋나 있습니다.`,
        suggestion: `${targetValue}px로 맞추면 여백 규칙이 더 또렷해집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "간격 적용" : "",
        fixPlan,
      });
    }

    return issues;
  }

  function analyzeSemanticSpacingIssues(nodeEntries, textEntries) {
    const nodeEntryMap = buildNodeEntryMap(nodeEntries);
    const textEntryMap = buildTextEntryMap(textEntries);
    const titleBodyCandidates = [];
    const sectionCandidates = [];

    for (const parentEntry of nodeEntries) {
      const childEntries = sortEntriesVertically(listVisibleChildEntries(parentEntry, nodeEntryMap));
      if (childEntries.length < 2) {
        continue;
      }

      const maxTextSize = getMaxDirectChildTextSize(childEntries, textEntryMap);
      for (let index = 0; index < childEntries.length - 1; index += 1) {
        const current = childEntries[index];
        const next = childEntries[index + 1];
        const gap = measureVerticalGap(current, next);
        if (gap === null || gap < 0 || gap > 120) {
          continue;
        }

        if (parentEntry.node.layoutMode !== "VERTICAL" && !hasAlignedLeadingEdge(current, next, 48)) {
          continue;
        }

        const currentText = textEntryMap.get(current.id) || null;
        const nextText = textEntryMap.get(next.id) || null;

        if (currentText && nextText && isLikelyHeadingToBodyPair(currentText, nextText)) {
          titleBodyCandidates.push({
            groupKey: String(parentEntry.rootId || parentEntry.id) + ":title-body",
            nodeId: current.id,
            nodeName: current.name,
            nodeType: current.type,
            value: gap,
            label: truncateText(currentText.text || current.name, 28),
          });
          continue;
        }

        if (currentText && !nextText && isLikelySectionHeaderText(currentText, maxTextSize) && isLikelySectionContent(next)) {
          sectionCandidates.push({
            groupKey: String(parentEntry.rootId || parentEntry.id) + ":section-gap",
            nodeId: current.id,
            nodeName: current.name,
            nodeType: current.type,
            value: gap,
            label: truncateText(currentText.text || current.name, 28),
          });
        }
      }
    }

    return createGroupedNumericConsistencyIssues(titleBodyCandidates, {
      tolerance: 2,
      maxDistance: 24,
      buildIssue: function (candidate, nearest, currentCount, groupSize) {
        return {
          id: createIssueId("semantic-title-gap:" + roundValue(candidate.value), candidate.nodeId),
          category: "context",
          type: "title-body-gap",
          severity: Math.abs(nearest - candidate.value) >= 8 ? "warning" : "info",
          guideline: "제목-본문 간격",
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          nodeType: candidate.nodeType,
          summary: "제목 아래 " + roundValue(candidate.value) + "px",
          detail:
            "같은 화면의 제목-본문 간격은 주로 " +
            nearest +
            "px인데, " +
            candidate.label +
            " 아래 간격만 " +
            roundValue(candidate.value) +
            "px입니다. (" +
            groupSize +
            "개 패턴 비교)",
          suggestion: nearest + "px 기준으로 맞추면 텍스트 위계 리듬이 더 안정적입니다.",
          canApply: false,
          applyLabel: "",
          fixPlan: null,
        };
      },
    }).concat(
      createGroupedNumericConsistencyIssues(sectionCandidates, {
        tolerance: 2,
        maxDistance: 32,
        buildIssue: function (candidate, nearest, currentCount, groupSize) {
          return {
            id: createIssueId("semantic-section-gap:" + roundValue(candidate.value), candidate.nodeId),
            category: "context",
            type: "section-gap",
            severity: Math.abs(nearest - candidate.value) >= 10 ? "warning" : "info",
            guideline: "섹션 간격",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "섹션 아래 " + roundValue(candidate.value) + "px",
            detail:
              "섹션 제목 아래 첫 콘텐츠까지 간격은 주로 " +
              nearest +
              "px인데, " +
              candidate.label +
              " 아래만 " +
              roundValue(candidate.value) +
              "px입니다. (" +
              groupSize +
              "개 섹션 비교)",
            suggestion: nearest + "px로 맞추면 섹션 구분 리듬이 더 또렷해집니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    );
  }

  function analyzeRepeatedPatternIssues(nodeEntries, textEntries) {
    const nodeEntryMap = buildNodeEntryMap(nodeEntries);
    const textEntryMap = buildTextEntryMap(textEntries);
    const paddingCandidates = [];
    const gapCandidates = [];
    const titleSizeCandidates = [];

    for (const parentEntry of nodeEntries) {
      const childEntries = listVisibleChildEntries(parentEntry, nodeEntryMap);
      if (childEntries.length < 2) {
        continue;
      }

      const groups = new Map();
      for (const childEntry of childEntries) {
        const summary = buildRepeatedPatternSummary(childEntry, nodeEntryMap, textEntryMap);
        if (!summary) {
          continue;
        }

        const bucket = groups.get(summary.signature) || [];
        bucket.push(summary);
        groups.set(summary.signature, bucket);
      }

      for (const group of groups.values()) {
        if (!group || group.length < 2) {
          continue;
        }

        const clusterKey = String(parentEntry.id) + "::" + String(group[0].signature || "cluster");
        for (const summary of group) {
          if (typeof summary.paddingValue === "number") {
            paddingCandidates.push({
              groupKey: clusterKey + ":padding",
              nodeId: summary.nodeId,
              nodeName: summary.nodeName,
              nodeType: summary.nodeType,
              value: summary.paddingValue,
              clusterSize: group.length,
              label: summary.label,
              fixPlan:
                summary.paddingFields && summary.paddingFields.length
                  ? {
                      action: "set-spacing-value",
                      targetNodeId: summary.nodeId,
                      changes: summary.paddingFields.map(function (field) {
                        return {
                          field: field,
                          value: summary.paddingValue,
                        };
                      }),
                    }
                  : null,
            });
          }

          if (typeof summary.gapValue === "number") {
            gapCandidates.push({
              groupKey: clusterKey + ":gap",
              nodeId: summary.nodeId,
              nodeName: summary.nodeName,
              nodeType: summary.nodeType,
              value: summary.gapValue,
              clusterSize: group.length,
              label: summary.label,
              fixPlan: {
                action: "set-spacing-value",
                targetNodeId: summary.nodeId,
                changes: [
                  {
                    field: "itemSpacing",
                    value: summary.gapValue,
                  },
                ],
              },
            });
          }

          if (summary.titleTextEntry && typeof summary.titleTextEntry.fontSize === "number") {
            titleSizeCandidates.push({
              groupKey: clusterKey + ":title-size",
              nodeId: summary.titleTextEntry.nodeId,
              nodeName: summary.nodeName,
              nodeType: summary.nodeType,
              value: summary.titleTextEntry.fontSize,
              clusterSize: group.length,
              label: summary.label,
              titleNodeId: summary.titleTextEntry.nodeId,
              titleNode: summary.titleTextEntry.node,
            });
          }
        }
      }
    }

    return createGroupedNumericConsistencyIssues(paddingCandidates, {
      tolerance: 2,
      maxDistance: 24,
      buildIssue: function (candidate, nearest, currentCount, groupSize) {
        return {
          id: createIssueId("repeat-padding:" + roundValue(candidate.value), candidate.nodeId),
          category: "component",
          type: "repeat-padding",
          severity: Math.abs(nearest - candidate.value) >= 8 ? "warning" : "info",
          guideline: "반복 카드/리스트 패딩",
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          nodeType: candidate.nodeType,
          summary: "내부 패딩 " + roundValue(candidate.value) + "px",
          detail:
            "같은 구조의 카드/리스트 " +
            groupSize +
            "개를 비교하면 " +
            candidate.label +
            "만 패딩이 " +
            roundValue(candidate.value) +
            "px이고, 기준 패턴은 " +
            nearest +
            "px입니다.",
          suggestion: nearest + "px로 맞추면 반복 블록의 내부 리듬이 더 안정적입니다.",
          canApply: false,
          applyLabel: "",
          fixPlan: null,
        };
      },
    }).concat(
      createGroupedNumericConsistencyIssues(gapCandidates, {
        tolerance: 2,
        maxDistance: 20,
        buildIssue: function (candidate, nearest, currentCount, groupSize) {
          return {
            id: createIssueId("repeat-gap:" + roundValue(candidate.value), candidate.nodeId),
            category: "component",
            type: "repeat-gap",
            severity: Math.abs(nearest - candidate.value) >= 8 ? "warning" : "info",
            guideline: "반복 카드/리스트 간격",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "내부 간격 " + roundValue(candidate.value) + "px",
            detail:
              "같은 구조의 카드/리스트 " +
              groupSize +
              "개 중 " +
              candidate.label +
              "만 내부 간격이 " +
              roundValue(candidate.value) +
              "px입니다. 주로 쓰인 값은 " +
              nearest +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 반복 패턴의 밀도가 더 일정해집니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    ).concat(
      createGroupedNumericConsistencyIssues(titleSizeCandidates, {
        tolerance: 1,
        maxDistance: 6,
        buildIssue: function (candidate, nearest, currentCount, groupSize) {
          const canApply = canAdjustFontSize(candidate.titleNode);
          return {
            id: createIssueId("repeat-title-size:" + roundValue(candidate.value), candidate.nodeId),
            category: "component",
            type: "repeat-title-size",
            severity: Math.abs(nearest - candidate.value) >= 3 ? "warning" : "info",
            guideline: "반복 카드/리스트 타이포",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "대표 텍스트 " + roundValue(candidate.value) + "px",
            detail:
              "같은 구조의 카드/리스트 " +
              groupSize +
              "개를 비교하면 " +
              candidate.label +
              "의 대표 텍스트 크기만 " +
              roundValue(candidate.value) +
              "px이고, 나머지는 주로 " +
              nearest +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 반복 블록의 제목 위계가 더 안정적입니다.",
            canApply: canApply,
            applyLabel: canApply ? "크기 적용" : "",
            fixPlan: canApply
              ? {
                  action: "set-font-size",
                  targetNodeId: candidate.titleNodeId,
                  targetFontSize: nearest,
                }
              : null,
          };
        },
      })
    );
  }

  function analyzeFormConsistencyIssues(nodeEntries, textEntries) {
    const nodeEntryMap = buildNodeEntryMap(nodeEntries);
    const textEntryMap = buildTextEntryMap(textEntries);
    const blocks = collectFormBlockCandidates(nodeEntries, nodeEntryMap, textEntryMap);
    const blocksByRoot = new Map();

    for (const block of blocks) {
      const bucket = blocksByRoot.get(block.rootId) || [];
      bucket.push(block);
      blocksByRoot.set(block.rootId, bucket);
    }

    const labelGapCandidates = [];
    const helpGapCandidates = [];
    const helpSizeCandidates = [];

    for (const group of blocksByRoot.values()) {
      if (!group || group.length < 2) {
        continue;
      }

      for (const block of group) {
        labelGapCandidates.push({
          groupKey: String(block.rootId) + ":label-field-gap",
          nodeId: block.fieldNodeId,
          nodeName: block.nodeName,
          nodeType: block.nodeType,
          value: block.labelFieldGap,
          label: block.labelText,
        });

        if (typeof block.fieldHelpGap === "number") {
          helpGapCandidates.push({
            groupKey: String(block.rootId) + ":field-help-gap",
            nodeId: block.helpNodeId,
            nodeName: block.nodeName,
            nodeType: block.nodeType,
            value: block.fieldHelpGap,
            label: block.labelText,
          });
        }

        if (typeof block.helpFontSize === "number") {
          helpSizeCandidates.push({
            groupKey: String(block.rootId) + ":help-font-size",
            nodeId: block.helpNodeId,
            nodeName: block.nodeName,
            nodeType: block.nodeType,
            value: block.helpFontSize,
            label: block.labelText,
          });
        }
      }
    }

    return createGroupedNumericConsistencyIssues(labelGapCandidates, {
      tolerance: 2,
      maxDistance: 16,
      buildIssue: function (candidate, nearest) {
        return {
          id: createIssueId("form-label-gap:" + roundValue(candidate.value), candidate.nodeId),
          category: "form",
          type: "form-label-gap",
          severity: Math.abs(nearest - candidate.value) >= 6 ? "warning" : "info",
          guideline: "폼 라벨-인풋 간격",
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          nodeType: candidate.nodeType,
          summary: "라벨-인풋 " + roundValue(candidate.value) + "px",
          detail:
            "같은 화면의 폼에서 라벨 아래 인풋 간격은 주로 " +
            nearest +
            "px인데, " +
            candidate.label +
            " 필드만 " +
            roundValue(candidate.value) +
            "px입니다.",
          suggestion: nearest + "px 기준으로 맞추면 폼 입력 리듬이 더 안정적입니다.",
          canApply: false,
          applyLabel: "",
          fixPlan: null,
        };
      },
    }).concat(
      createGroupedNumericConsistencyIssues(helpGapCandidates, {
        tolerance: 2,
        maxDistance: 12,
        buildIssue: function (candidate, nearest) {
          return {
            id: createIssueId("form-help-gap:" + roundValue(candidate.value), candidate.nodeId),
            category: "form",
            type: "form-help-gap",
            severity: Math.abs(nearest - candidate.value) >= 4 ? "warning" : "info",
            guideline: "폼 인풋-헬프텍스트 간격",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "인풋-헬프텍스트 " + roundValue(candidate.value) + "px",
            detail:
              "폼 헬프텍스트 간격은 주로 " +
              nearest +
              "px인데, " +
              candidate.label +
              " 필드 아래만 " +
              roundValue(candidate.value) +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 도움말 리듬이 더 안정적입니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    ).concat(
      createGroupedNumericConsistencyIssues(helpSizeCandidates, {
        tolerance: 1,
        maxDistance: 4,
        buildIssue: function (candidate, nearest) {
          return {
            id: createIssueId("form-help-size:" + roundValue(candidate.value), candidate.nodeId),
            category: "form",
            type: "form-help-size",
            severity: Math.abs(nearest - candidate.value) >= 2 ? "warning" : "info",
            guideline: "폼 헬프텍스트 크기",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "헬프텍스트 " + roundValue(candidate.value) + "px",
            detail:
              "폼 도움말 텍스트는 주로 " +
              nearest +
              "px인데, " +
              candidate.label +
              " 필드의 헬프텍스트만 " +
              roundValue(candidate.value) +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 라벨-인풋-헬프텍스트 위계가 더 또렷해집니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    );
  }

  function createGroupedNumericConsistencyIssues(candidates, options) {
    const groups = new Map();
    const issues = [];
    const tolerance = options && typeof options.tolerance === "number" ? options.tolerance : 1;
    const maxDistance = options && typeof options.maxDistance === "number" ? options.maxDistance : 16;

    for (const candidate of candidates) {
      if (!candidate || typeof candidate.groupKey !== "string") {
        continue;
      }
      const bucket = groups.get(candidate.groupKey) || [];
      bucket.push(candidate);
      groups.set(candidate.groupKey, bucket);
    }

    for (const group of groups.values()) {
      if (!group || group.length < 2) {
        continue;
      }

      const counts = new Map();
      for (const candidate of group) {
        bumpCount(counts, String(roundValue(candidate.value)));
      }

      const tokenItems = sortCountEntries(counts).filter(function (item) {
        return item.count >= 2;
      });
      if (!tokenItems.length) {
        continue;
      }

      const tokenValues = [];
      for (const item of tokenItems) {
        tokenValues.push(Number(item.key));
      }

      for (const candidate of group) {
        const currentValue = roundValue(candidate.value);
        const currentCount = counts.get(String(currentValue)) || 0;
        const nearest = findNearestNumericToken(currentValue, tokenValues);
        if (typeof nearest !== "number" || !Number.isFinite(nearest)) {
          continue;
        }
        if (Math.abs(nearest - currentValue) <= tolerance) {
          continue;
        }
        if (currentCount > 1) {
          continue;
        }
        if (Math.abs(nearest - currentValue) > maxDistance) {
          continue;
        }

        const issue =
          options && typeof options.buildIssue === "function"
            ? options.buildIssue(candidate, nearest, currentCount, group.length)
            : null;
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  function buildNodeEntryMap(entries) {
    const map = new Map();
    for (const entry of Array.isArray(entries) ? entries : []) {
      if (!entry || typeof entry.id !== "string") {
        continue;
      }
      map.set(entry.id, entry);
    }
    return map;
  }

  function buildTextEntryMap(entries) {
    const map = new Map();
    for (const entry of Array.isArray(entries) ? entries : []) {
      if (!entry || typeof entry.nodeId !== "string") {
        continue;
      }
      map.set(entry.nodeId, entry);
    }
    return map;
  }

  function listVisibleChildEntries(parentEntry, nodeEntryMap) {
    const result = [];
    if (!parentEntry || !parentEntry.node || !hasChildren(parentEntry.node)) {
      return result;
    }

    for (const child of parentEntry.node.children) {
      const entry = nodeEntryMap.get(child.id) || null;
      if (!entry) {
        continue;
      }
      result.push(entry);
    }
    return result;
  }

  function sortEntriesVertically(entries) {
    return Array.isArray(entries)
      ? entries.slice().sort(function (left, right) {
          const leftY = left && left.bounds ? left.bounds.y : Number.POSITIVE_INFINITY;
          const rightY = right && right.bounds ? right.bounds.y : Number.POSITIVE_INFINITY;
          if (leftY !== rightY) {
            return leftY - rightY;
          }

          const leftX = left && left.bounds ? left.bounds.x : Number.POSITIVE_INFINITY;
          const rightX = right && right.bounds ? right.bounds.x : Number.POSITIVE_INFINITY;
          if (leftX !== rightX) {
            return leftX - rightX;
          }

          return Number(left && left.order ? left.order : 0) - Number(right && right.order ? right.order : 0);
        })
      : [];
  }

  function measureVerticalGap(upper, lower) {
    if (!upper || !lower || !upper.bounds || !lower.bounds) {
      return null;
    }
    return roundValue(lower.bounds.y - (upper.bounds.y + upper.bounds.height));
  }

  function hasAlignedLeadingEdge(left, right, maxOffset) {
    if (!left || !right || !left.bounds || !right.bounds) {
      return false;
    }
    const offset = typeof maxOffset === "number" ? maxOffset : 32;
    return Math.abs(left.bounds.x - right.bounds.x) <= offset;
  }

  function getMaxDirectChildTextSize(childEntries, textEntryMap) {
    let maxSize = 0;
    for (const childEntry of Array.isArray(childEntries) ? childEntries : []) {
      const textEntry = textEntryMap.get(childEntry.id) || null;
      if (!textEntry || typeof textEntry.fontSize !== "number" || !Number.isFinite(textEntry.fontSize)) {
        continue;
      }
      maxSize = Math.max(maxSize, textEntry.fontSize);
    }
    return maxSize;
  }

  function isLikelyHeadingToBodyPair(titleText, bodyText) {
    if (
      !titleText ||
      !bodyText ||
      typeof titleText.fontSize !== "number" ||
      !Number.isFinite(titleText.fontSize) ||
      typeof bodyText.fontSize !== "number" ||
      !Number.isFinite(bodyText.fontSize)
    ) {
      return false;
    }

    if (titleText.fontSize < 14 || bodyText.fontSize < 10) {
      return false;
    }

    if (titleText.fontSize < bodyText.fontSize + 1.5) {
      return false;
    }

    const titleLength = typeof titleText.text === "string" ? titleText.text.length : 0;
    const bodyLength = typeof bodyText.text === "string" ? bodyText.text.length : 0;
    if (titleLength > 64 && bodyLength < 16) {
      return false;
    }

    return true;
  }

  function isLikelySectionHeaderText(textEntry, maxTextSize) {
    if (!textEntry || typeof textEntry.fontSize !== "number" || !Number.isFinite(textEntry.fontSize)) {
      return false;
    }

    if (textEntry.fontSize < 14) {
      return false;
    }

    const textLength = typeof textEntry.text === "string" ? textEntry.text.length : 0;
    if (textLength > 60) {
      return false;
    }

    return textEntry.fontSize >= Math.max(14, maxTextSize - 1);
  }

  function isLikelySectionContent(entry) {
    if (!entry || !entry.bounds) {
      return false;
    }
    if (entry.type === "TEXT") {
      return false;
    }
    return entry.bounds.width >= 48 && entry.bounds.height >= 16;
  }

  function buildRepeatedPatternSummary(entry, nodeEntryMap, textEntryMap) {
    if (!entry || !entry.bounds || entry.type === "TEXT" || !hasChildren(entry.node)) {
      return null;
    }

    if (entry.bounds.width < 80 || entry.bounds.height < 32 || entry.bounds.height > 420) {
      return null;
    }

    const childEntries = listVisibleChildEntries(entry, nodeEntryMap);
    if (childEntries.length < 2) {
      return null;
    }

    const signature = buildRepeatedPatternSignature(entry, childEntries, nodeEntryMap, textEntryMap);
    if (!signature) {
      return null;
    }

    const paddingValue = getUniformPaddingValue(entry.node);
    const titleTextEntry = findPrimaryTextDescendant(entry, 2, nodeEntryMap, textEntryMap);
    const gapValue =
      typeof entry.node.itemSpacing === "number" && Number.isFinite(entry.node.itemSpacing)
        ? roundValue(entry.node.itemSpacing)
        : null;

    return {
      nodeId: entry.id,
      nodeName: entry.name,
      nodeType: entry.type,
      label: truncateText(entry.name, 24),
      signature: signature,
      paddingValue: paddingValue,
      paddingFields:
        typeof paddingValue === "number"
          ? ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]
          : null,
      gapValue: gapValue,
      titleTextEntry: titleTextEntry,
    };
  }

  function buildRepeatedPatternSignature(entry, childEntries, nodeEntryMap, textEntryMap) {
    const orderedChildren = entry.node.layoutMode === "NONE" ? sortEntriesVertically(childEntries) : childEntries.slice();
    const kinds = [];
    const countLabel = orderedChildren.length > 6 ? "6+" : String(orderedChildren.length);

    for (let index = 0; index < orderedChildren.length && index < 4; index += 1) {
      kinds.push(describePatternChildKind(orderedChildren[index], nodeEntryMap, textEntryMap));
    }

    return [String(entry.node.layoutMode || "NONE"), countLabel, kinds.join("-")].join("|");
  }

  function describePatternChildKind(entry, nodeEntryMap, textEntryMap) {
    if (!entry) {
      return "U";
    }
    if (textEntryMap.has(entry.id)) {
      return "T";
    }
    if (isLikelyIconEntry(entry)) {
      return "I";
    }
    if (findPrimaryTextDescendant(entry, 1, nodeEntryMap, textEntryMap)) {
      return "B";
    }
    return hasChildren(entry.node) ? "C" : String(entry.type || "N").slice(0, 1);
  }

  function isLikelyIconEntry(entry) {
    if (!entry || !entry.bounds) {
      return false;
    }
    if (entry.bounds.width > 40 || entry.bounds.height > 40) {
      return false;
    }

    return (
      entry.type === "VECTOR" ||
      entry.type === "BOOLEAN_OPERATION" ||
      entry.type === "ELLIPSE" ||
      entry.type === "RECTANGLE" ||
      entry.type === "POLYGON" ||
      entry.type === "STAR"
    );
  }

  function getUniformPaddingValue(node) {
    if (!hasLayout(node)) {
      return null;
    }

    const fields = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft];
    for (const value of fields) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
      }
    }

    const rounded = roundValue(fields[0]);
    for (let index = 1; index < fields.length; index += 1) {
      if (Math.abs(roundValue(fields[index]) - rounded) > 0.01) {
        return null;
      }
    }

    return rounded;
  }

  function findPrimaryTextDescendant(entry, maxDepth, nodeEntryMap, textEntryMap) {
    if (!entry || typeof maxDepth !== "number" || maxDepth < 0) {
      return null;
    }

    let best = null;
    const selfText = textEntryMap.get(entry.id) || null;
    if (selfText && typeof selfText.fontSize === "number" && Number.isFinite(selfText.fontSize)) {
      best = selfText;
    }

    if (!hasChildren(entry.node) || maxDepth === 0) {
      return best;
    }

    const stack = [];
    for (let index = entry.node.children.length - 1; index >= 0; index -= 1) {
      const childEntry = nodeEntryMap.get(entry.node.children[index].id) || null;
      if (!childEntry) {
        continue;
      }
      stack.push({
        entry: childEntry,
        depth: 1,
      });
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const currentEntry = current && current.entry ? current.entry : null;
      if (!currentEntry) {
        continue;
      }

      const textEntry = textEntryMap.get(currentEntry.id) || null;
      if (textEntry && typeof textEntry.fontSize === "number" && Number.isFinite(textEntry.fontSize)) {
        best = choosePreferredTextEntry(best, textEntry);
      }

      if (current.depth >= maxDepth || !hasChildren(currentEntry.node)) {
        continue;
      }

      for (let index = currentEntry.node.children.length - 1; index >= 0; index -= 1) {
        const childEntry = nodeEntryMap.get(currentEntry.node.children[index].id) || null;
        if (!childEntry) {
          continue;
        }
        stack.push({
          entry: childEntry,
          depth: current.depth + 1,
        });
      }
    }

    return best;
  }

  function choosePreferredTextEntry(current, next) {
    if (!current) {
      return next;
    }
    if (!next) {
      return current;
    }

    const currentSize = typeof current.fontSize === "number" ? current.fontSize : -1;
    const nextSize = typeof next.fontSize === "number" ? next.fontSize : -1;
    if (currentSize !== nextSize) {
      return nextSize > currentSize ? next : current;
    }

    const currentOrder = typeof current.order === "number" ? current.order : Number.POSITIVE_INFINITY;
    const nextOrder = typeof next.order === "number" ? next.order : Number.POSITIVE_INFINITY;
    return nextOrder < currentOrder ? next : current;
  }

  function collectFormBlockCandidates(nodeEntries, nodeEntryMap, textEntryMap) {
    const blocks = [];
    const seen = new Set();

    for (const parentEntry of nodeEntries) {
      const childEntries = sortEntriesVertically(listVisibleChildEntries(parentEntry, nodeEntryMap));
      if (childEntries.length < 2) {
        continue;
      }

      for (let index = 0; index < childEntries.length - 1; index += 1) {
        const labelEntry = childEntries[index];
        const fieldEntry = childEntries[index + 1];
        const labelText = textEntryMap.get(labelEntry.id) || null;
        if (!labelText || !isLikelyFormLabelText(labelText)) {
          continue;
        }
        if (!isLikelyInputLikeEntry(fieldEntry, textEntryMap)) {
          continue;
        }

        const labelFieldGap = measureVerticalGap(labelEntry, fieldEntry);
        if (labelFieldGap === null || labelFieldGap < 0 || labelFieldGap > 40) {
          continue;
        }
        if (!hasAlignedLeadingEdge(labelEntry, fieldEntry, 40)) {
          continue;
        }

        let helpEntry = null;
        let helpText = null;
        let fieldHelpGap = null;
        if (index + 2 < childEntries.length) {
          const nextEntry = childEntries[index + 2];
          const nextText = textEntryMap.get(nextEntry.id) || null;
          const nextGap = measureVerticalGap(fieldEntry, nextEntry);
          if (
            nextText &&
            isLikelyFormHelpText(nextText, labelText) &&
            nextGap !== null &&
            nextGap >= 0 &&
            nextGap <= 24 &&
            hasAlignedLeadingEdge(fieldEntry, nextEntry, 40)
          ) {
            helpEntry = nextEntry;
            helpText = nextText;
            fieldHelpGap = nextGap;
          }
        }

        const key = String(parentEntry.id) + ":" + String(labelEntry.id) + ":" + String(fieldEntry.id);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);

        blocks.push({
          rootId: String(parentEntry.rootId || parentEntry.id),
          nodeName: fieldEntry.name,
          nodeType: fieldEntry.type,
          fieldNodeId: fieldEntry.id,
          helpNodeId: helpEntry ? helpEntry.id : "",
          labelText: truncateText(labelText.text || labelEntry.name, 28),
          labelFieldGap: labelFieldGap,
          fieldHelpGap: fieldHelpGap,
          helpFontSize: helpText && typeof helpText.fontSize === "number" ? helpText.fontSize : null,
        });
      }
    }

    return blocks;
  }

  function isLikelyFormLabelText(textEntry) {
    if (
      !textEntry ||
      typeof textEntry.text !== "string" ||
      typeof textEntry.fontSize !== "number" ||
      !Number.isFinite(textEntry.fontSize)
    ) {
      return false;
    }

    const length = textEntry.text.trim().length;
    if (length < 1 || length > 48) {
      return false;
    }

    return textEntry.fontSize >= 11 && textEntry.fontSize <= 18;
  }

  function isLikelyFormHelpText(helpText, labelText) {
    if (!helpText || typeof helpText.text !== "string") {
      return false;
    }

    const helpLength = helpText.text.trim().length;
    const labelLength = labelText && typeof labelText.text === "string" ? labelText.text.trim().length : 0;
    const helpSize = typeof helpText.fontSize === "number" && Number.isFinite(helpText.fontSize) ? helpText.fontSize : 0;
    const labelSize = labelText && typeof labelText.fontSize === "number" && Number.isFinite(labelText.fontSize) ? labelText.fontSize : 0;

    if (helpLength < 4 || helpLength > 120) {
      return false;
    }
    if (helpSize > 0 && labelSize > 0 && helpSize > labelSize + 2) {
      return false;
    }
    if (helpLength <= labelLength && helpSize >= labelSize) {
      return false;
    }
    return true;
  }

  function isLikelyInputLikeEntry(entry, textEntryMap) {
    if (!entry || !entry.bounds || textEntryMap.has(entry.id)) {
      return false;
    }

    if (entry.bounds.width < 120 || entry.bounds.height < 28 || entry.bounds.height > 72) {
      return false;
    }

    if (entry.type === "VECTOR" || entry.type === "LINE") {
      return false;
    }

    return (
      entry.type === "FRAME" ||
      entry.type === "GROUP" ||
      entry.type === "INSTANCE" ||
      entry.type === "COMPONENT" ||
      entry.type === "COMPONENT_SET" ||
      entry.type === "RECTANGLE" ||
      hasChildren(entry.node)
    );
  }

  function dedupeIssues(issues) {
    const map = new Map();
    for (const issue of issues) {
      if (!issue || !issue.id) {
        continue;
      }
      if (!map.has(issue.id)) {
        map.set(issue.id, issue);
      }
    }
    return Array.from(map.values());
  }

  function compareIssues(left, right) {
    const severityRank = {
      warning: 0,
      info: 1,
    };
    const leftSeverityKey = left && left.severity ? left.severity : "info";
    const rightSeverityKey = right && right.severity ? right.severity : "info";
    const leftSeverityValue = severityRank[leftSeverityKey];
    const rightSeverityValue = severityRank[rightSeverityKey];
    const leftSeverity = typeof leftSeverityValue === "number" ? leftSeverityValue : 99;
    const rightSeverity = typeof rightSeverityValue === "number" ? rightSeverityValue : 99;
    if (leftSeverity !== rightSeverity) {
      return leftSeverity - rightSeverity;
    }

    const categoryRank = {
      color: 0,
      typography: 1,
      context: 2,
      component: 3,
      form: 4,
      spacing: 5,
    };
    const leftCategoryKey = left && left.category ? left.category : "spacing";
    const rightCategoryKey = right && right.category ? right.category : "spacing";
    const leftCategoryValue = categoryRank[leftCategoryKey];
    const rightCategoryValue = categoryRank[rightCategoryKey];
    const leftCategory = typeof leftCategoryValue === "number" ? leftCategoryValue : 99;
    const rightCategory = typeof rightCategoryValue === "number" ? rightCategoryValue : 99;
    if (leftCategory !== rightCategory) {
      return leftCategory - rightCategory;
    }

    return String(left && left.nodeName ? left.nodeName : "").localeCompare(String(right && right.nodeName ? right.nodeName : ""));
  }

  function buildInsights(consistency) {
    const insights = [];
    if (consistency.colorTokenSummary) {
      insights.push(`색상 토큰: ${consistency.colorTokenSummary}`);
    }
    if (consistency.typographyTokenSummary) {
      insights.push(`타이포 토큰: ${consistency.typographyTokenSummary}`);
    }
    if (consistency.spacingTokenSummary) {
      insights.push(`여백 토큰: ${consistency.spacingTokenSummary}`);
    }
    insights.push(
      `일관성 이슈: 색상 ${consistency.colorIssueCount}건 · 타이포 ${consistency.typographyIssueCount}건 · 여백 ${consistency.spacingIssueCount}건`
    );
    if (
      (consistency.semanticIssueCount || 0) > 0 ||
      (consistency.repetitionIssueCount || 0) > 0 ||
      (consistency.formIssueCount || 0) > 0
    ) {
      insights.push(
        `맥락 이슈: 제목/섹션 ${consistency.semanticIssueCount || 0}건 · 반복 블록 ${consistency.repetitionIssueCount || 0}건 · 폼 ${consistency.formIssueCount || 0}건`
      );
    }
    if (consistency.fixableCount > 0) {
      insights.push(`즉시 적용 가능: ${consistency.fixableCount}건`);
    } else {
      insights.push("즉시 적용 가능한 제안은 없습니다.");
    }
    return insights.slice(0, 6);
  }

  async function enrichConsistencyWithAi(localResult) {
    const ai = getAiHelper();
    if (!ai) {
      localResult.summary.aiStatusLabel = "로컬 휴리스틱";
      return localResult;
    }

    let configured = false;
    let runInfo = {
      provider: "",
      model: "",
    };

    try {
      const settings = typeof ai.getAiSettingsAsync === "function" ? await ai.getAiSettingsAsync() : null;
      if (settings && typeof ai.getResolvedRunInfo === "function") {
        runInfo = ai.getResolvedRunInfo(settings);
      }
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      localResult.summary.aiStatusLabel = "로컬 휴리스틱";
      return localResult;
    }

    localResult.summary.aiStatusLabel = "AI + 로컬";
    localResult.summary.aiProviderLabel = formatProviderLabel(runInfo.provider);
    localResult.summary.aiModelLabel = runInfo.model || "";

    const payload = {
      selectionLabel: localResult.summary ? localResult.summary.selectionLabel : "",
      roots: Array.isArray(localResult.roots) ? localResult.roots.slice(0, 6) : [],
      selectionBounds: localResult.selectionBounds || null,
      stats: localResult.stats || {},
      currentSummary: localResult.summary || {},
      consistency: {
        colorTokenSummary: localResult.consistency ? localResult.consistency.colorTokenSummary : "",
        typographyTokenSummary: localResult.consistency ? localResult.consistency.typographyTokenSummary : "",
        spacingTokenSummary: localResult.consistency ? localResult.consistency.spacingTokenSummary : "",
        colorIssueCount: localResult.consistency ? localResult.consistency.colorIssueCount : 0,
        typographyIssueCount: localResult.consistency ? localResult.consistency.typographyIssueCount : 0,
        spacingIssueCount: localResult.consistency ? localResult.consistency.spacingIssueCount : 0,
        semanticIssueCount: localResult.consistency ? localResult.consistency.semanticIssueCount : 0,
        repetitionIssueCount: localResult.consistency ? localResult.consistency.repetitionIssueCount : 0,
        formIssueCount: localResult.consistency ? localResult.consistency.formIssueCount : 0,
        issues: Array.isArray(localResult.consistency && localResult.consistency.issues)
          ? localResult.consistency.issues.slice(0, 6).map((issue) => ({
              id: issue.id,
              category: issue.category,
              summary: issue.summary,
              detail: issue.detail,
              suggestion: issue.suggestion,
            }))
          : [],
      },
      currentInsights: Array.isArray(localResult.insights) ? localResult.insights.slice(0, 6) : [],
    };
    const schema = {
      type: "object",
      properties: {
        contextLabel: { type: "string" },
        colorSummary: { type: "string" },
        typographySummary: { type: "string" },
        spacingSummary: { type: "string" },
        prioritySummary: { type: "string" },
        insights: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["contextLabel", "colorSummary", "typographySummary", "spacingSummary", "prioritySummary", "insights"],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions:
          "You analyze Figma design metadata for a design consistency diagnosis feature. Return concise Korean JSON only. Keep labels practical. Summarize color, typography, and spacing consistency using only values already present in the payload. Do not invent design system tokens that are not implied by the payload.",
        schema,
        payload,
      });
      if (!response || typeof response !== "object") {
        return localResult;
      }

      if (typeof response.contextLabel === "string" && response.contextLabel.trim()) {
        localResult.summary.contextLabel = response.contextLabel.trim();
      }
      if (typeof response.colorSummary === "string" && response.colorSummary.trim()) {
        localResult.consistency.aiColorSummary = response.colorSummary.trim();
      }
      if (typeof response.typographySummary === "string" && response.typographySummary.trim()) {
        localResult.consistency.aiTypographySummary = response.typographySummary.trim();
      }
      if (typeof response.spacingSummary === "string" && response.spacingSummary.trim()) {
        localResult.consistency.aiSpacingSummary = response.spacingSummary.trim();
      }
      if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
        localResult.consistency.prioritySummary = response.prioritySummary.trim();
      }

      localResult.summary.aiProviderLabel = formatProviderLabel(response._provider || runInfo.provider);
      localResult.summary.aiModelLabel = response._model || runInfo.model || "";
      localResult.source = typeof response._provider === "string" ? response._provider : "hybrid-ai";
      localResult.insights = mergeAiInsights(localResult, response);
    } catch (error) {
      localResult.aiError = normalizeErrorMessage(error, "AI 디자인 일관성 요약에 실패했습니다.");
    }

    return localResult;
  }

  function mergeAiInsights(localResult, response) {
    const next = [];
    if (typeof response.colorSummary === "string" && response.colorSummary.trim()) {
      next.push("AI 색상 판단: " + response.colorSummary.trim());
    }
    if (typeof response.typographySummary === "string" && response.typographySummary.trim()) {
      next.push("AI 타이포 판단: " + response.typographySummary.trim());
    }
    if (typeof response.spacingSummary === "string" && response.spacingSummary.trim()) {
      next.push("AI 여백 판단: " + response.spacingSummary.trim());
    }
    if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
      next.push("우선 수정: " + response.prioritySummary.trim());
    }
    if (Array.isArray(response.insights)) {
      for (const item of response.insights) {
        if (typeof item === "string" && item.trim()) {
          next.push(item.trim());
        }
      }
    }
    return uniqueStrings(next.concat(Array.isArray(localResult.insights) ? localResult.insights : []), 6);
  }

  async function applyFixPlan(plan) {
    if (!plan || typeof plan !== "object" || typeof plan.action !== "string") {
      throw new Error("적용 가능한 수정 정보가 없습니다.");
    }

    if (plan.action === "set-solid-paint-color") {
      applySolidPaintColorPlan(plan);
      return;
    }
    if (plan.action === "set-font-size") {
      await applyFontSizePlan(plan);
      return;
    }
    if (plan.action === "set-spacing-value") {
      applySpacingPlan(plan);
      return;
    }

    throw new Error("아직 지원하지 않는 수정 유형입니다.");
  }

  function applySolidPaintColorPlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    const property = plan.property === "strokes" ? "strokes" : "fills";
    const paintIndex = typeof plan.paintIndex === "number" ? plan.paintIndex : -1;
    if (!canEditSolidPaintProperty(node, property, paintIndex)) {
      throw new Error("색상을 변경할 레이어를 찾지 못했습니다.");
    }

    const paints = node[property].map((paint) => clonePlainObject(paint));
    const target = paints[paintIndex];
    if (!target || target.type !== "SOLID") {
      throw new Error("변경할 색상 페인트를 찾지 못했습니다.");
    }

    target.color = cloneColor(plan.color || {});
    node[property] = paints;
  }

  async function applyFontSizePlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!canAdjustFontSize(node)) {
      throw new Error("폰트 크기를 변경할 텍스트를 찾지 못했습니다.");
    }

    const targetFontSize = Number(plan.targetFontSize);
    if (!Number.isFinite(targetFontSize) || targetFontSize <= 0) {
      throw new Error("적용할 폰트 크기가 올바르지 않습니다.");
    }

    await loadFontsForTextNode(node);
    if (typeof node.characters === "string" && node.characters.length > 0 && typeof node.setRangeFontSize === "function") {
      node.setRangeFontSize(0, node.characters.length, targetFontSize);
      return;
    }

    throw new Error("이 텍스트는 폰트 크기를 직접 조정할 수 없습니다.");
  }

  function applySpacingPlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node) {
      throw new Error("간격을 조정할 레이어를 찾지 못했습니다.");
    }

    const changes = Array.isArray(plan.changes) ? plan.changes : [];
    if (!changes.length) {
      throw new Error("적용할 간격 값이 비어 있습니다.");
    }

    const fields = changes
      .filter((change) => !!change && typeof change.field === "string")
      .map((change) => change.field);
    if (!canAdjustSpacingFields(node, fields)) {
      throw new Error("현재 선택에서는 간격 값을 직접 적용할 수 없습니다.");
    }

    for (const change of changes) {
      if (!change || typeof change.field !== "string") {
        continue;
      }
      if (!(change.field in node)) {
        continue;
      }
      const nextValue = Math.max(0, Number(change.value) || 0);
      node[change.field] = nextValue;
    }
  }

  function supportsAnnotations(nodes) {
    const sampleNode = Array.isArray(nodes) && nodes.length > 0 ? nodes[0] : null;
    return !!sampleNode && "annotations" in sampleNode;
  }

  async function ensureAnnotationCategory(requestedColor, options) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const createIfMissing = !options || options.createIfMissing !== false;
      const nextColor =
        typeof requestedColor === "string" && requestedColor.trim()
          ? requestedColor.trim().toLowerCase()
          : ANNOTATION_CATEGORY_COLOR;
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const existing = Array.isArray(categories)
        ? categories.find((category) => category && category.label === ANNOTATION_CATEGORY_LABEL)
        : null;
      if (existing) {
        if (typeof existing.setColor === "function" && existing.color !== nextColor) {
          existing.setColor(nextColor);
        }
        return existing;
      }

      if (!createIfMissing || typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
        return null;
      }

      return await figma.annotations.addAnnotationCategoryAsync({
        label: ANNOTATION_CATEGORY_LABEL,
        color: nextColor,
      });
    } catch (error) {
      return null;
    }
  }

  async function getManagedDiagnosisCategories() {
    const managed = {
      consistency: null,
      accessibility: null,
    };

    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return managed;
    }

    try {
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      if (!Array.isArray(categories)) {
        return managed;
      }

      for (const category of categories) {
        if (!category || typeof category.label !== "string") {
          continue;
        }
        if (category.label === ANNOTATION_CATEGORY_LABEL) {
          managed.consistency = category;
          continue;
        }
        if (category.label === ACCESSIBILITY_ANNOTATION_CATEGORY_LABEL) {
          managed.accessibility = category;
        }
      }
    } catch (error) {}

    return managed;
  }

  function applyConsistencyAnnotations(nodes, issues, category) {
    const issuesByNode = new Map();
    const skipped = [];
    let annotationCount = 0;
    let annotatedNodeCount = 0;
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const issue of issues) {
      const bucket = issuesByNode.get(issue.nodeId) || [];
      bucket.push(issue);
      issuesByNode.set(issue.nodeId, bucket);
    }

    for (const node of nodes) {
      const nodeIssues = issuesByNode.get(node.id) || [];
      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedConsistencyAnnotation(annotation, category));
        const removedCount = Math.max(0, existing.length - preserved.length);

        if (removedCount > 0) {
          removedAnnotationCount += removedCount;
        }
        if (removedCount > 0 && nodeIssues.length === 0) {
          clearedNodeCount += 1;
        }

        node.annotations = preserved.concat(nodeIssues.map((issue) => buildConsistencyAnnotation(issue, category)));
        if (nodeIssues.length > 0) {
          annotatedNodeCount += 1;
          annotationCount += nodeIssues.length;
        }
      } catch (error) {
        if (nodeIssues.length > 0) {
          skipped.push({
            label: safeName(node),
            reason: normalizeErrorMessage(error, "디자인 일관성 주석을 추가하지 못했습니다."),
          });
        }
      }
    }

    return {
      skipped,
      annotationCount,
      annotatedNodeCount,
      clearedNodeCount,
      removedAnnotationCount,
      modeLabel: annotationCount > 0 ? "Blue Dev Mode annotation" : "Result only",
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
    };
  }

  function removeDiagnosisAnnotations(nodes, managedCategories) {
    const cleared = [];
    const skipped = [];
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;
    let removedAccessibilityAnnotationCount = 0;
    let removedConsistencyAnnotationCount = 0;
    const categories = managedCategories && typeof managedCategories === "object" ? managedCategories : {};
    const consistencyCategory = categories.consistency || null;
    const accessibilityCategory = categories.accessibility || null;

    for (const node of Array.isArray(nodes) ? nodes : []) {
      let managedAnnotations = [];
      let removedNodeAccessibilityCount = 0;
      let removedNodeConsistencyCount = 0;

      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        managedAnnotations = existing.filter(
          (annotation) =>
            isManagedConsistencyAnnotation(annotation, consistencyCategory) ||
            isManagedAccessibilityAnnotation(annotation, accessibilityCategory)
        );
        if (!managedAnnotations.length) {
          continue;
        }

        managedAnnotations.forEach((annotation) => {
          if (isManagedConsistencyAnnotation(annotation, consistencyCategory)) {
            removedNodeConsistencyCount += 1;
            return;
          }
          if (isManagedAccessibilityAnnotation(annotation, accessibilityCategory)) {
            removedNodeAccessibilityCount += 1;
          }
        });

        const preserved = existing.filter(
          (annotation) =>
            !isManagedConsistencyAnnotation(annotation, consistencyCategory) &&
            !isManagedAccessibilityAnnotation(annotation, accessibilityCategory)
        );
        node.annotations = preserved;
        clearedNodeCount += 1;
        removedAnnotationCount += managedAnnotations.length;
        removedAccessibilityAnnotationCount += removedNodeAccessibilityCount;
        removedConsistencyAnnotationCount += removedNodeConsistencyCount;
        cleared.push({
          nodeId: node.id,
          nodeName: safeName(node),
          removedCount: managedAnnotations.length,
          removedAccessibilityCount: removedNodeAccessibilityCount,
          removedConsistencyCount: removedNodeConsistencyCount,
        });
      } catch (error) {
        if (!managedAnnotations.length) {
          continue;
        }

        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "디자인 진단 주석을 정리하지 못했습니다."),
        });
      }
    }

    return {
      cleared,
      skipped,
      clearedNodeCount,
      removedAnnotationCount,
      removedAccessibilityAnnotationCount,
      removedConsistencyAnnotationCount,
    };
  }

  function buildConsistencyAnnotation(issue, category) {
    const lines = [`[중요도 : ${getIssuePriorityLabel(issue)}]`];
    if (issue.summary) {
      lines.push(`- ${issue.summary}`);
    }
    if (issue.suggestion) {
      lines.push(`- ${issue.suggestion}`);
    }

    const annotation = {
      label: lines.join("\n"),
    };
    if (category && category.id) {
      annotation.categoryId = category.id;
    }
    return annotation;
  }

  function getIssuePriorityLabel(issue) {
    const severity = issue && typeof issue.severity === "string" ? issue.severity : "info";
    if (severity === "error") {
      return "상";
    }
    if (severity === "warning") {
      return "중";
    }
    return "하";
  }

  function isManagedConsistencyAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return typeof label === "string" && (label.startsWith(ANNOTATION_LABEL_PREFIX) || label.startsWith(`[${ANNOTATION_LABEL_PREFIX}]`));
  }

  function isManagedAccessibilityAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return (
      typeof label === "string" &&
      (label.startsWith(ACCESSIBILITY_ANNOTATION_LABEL_PREFIX) ||
        label.startsWith(`[${ACCESSIBILITY_ANNOTATION_LABEL_PREFIX}]`))
    );
  }

  function buildResultOnlyAnnotation(issues, reason) {
    const skipped = [];
    if (Array.isArray(issues) && issues.length > 0 && reason) {
      skipped.push({
        label: "주석 미지원",
        reason,
      });
    }

    return {
      skipped,
      annotationCount: 0,
      annotatedNodeCount: 0,
      clearedNodeCount: 0,
      removedAnnotationCount: 0,
      modeLabel: "Result only",
      categoryLabel: ANNOTATION_CATEGORY_LABEL,
    };
  }

  function collectPaintEntries(node, entry, bucket) {
    collectPaintEntriesFromArray(node, entry, "fills", node.fills, bucket, node.type === "TEXT" ? "text" : "fills");
    if (node.type !== "TEXT") {
      collectPaintEntriesFromArray(node, entry, "strokes", node.strokes, bucket, "strokes");
    }
  }

  function collectPaintEntriesFromArray(node, entry, property, paints, bucket, role) {
    if (!Array.isArray(paints)) {
      return;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }

      const opacity = typeof paint.opacity === "number" && Number.isFinite(paint.opacity) ? paint.opacity : 1;
      if (opacity < 0.95) {
        continue;
      }

      bucket.push({
        node,
        nodeId: node.id,
        nodeName: entry.name,
        nodeType: entry.type,
        property,
        paintIndex: index,
        role,
        color: cloneColor(paint.color),
        hex: rgbToHex(paint.color),
        opacity,
        order: entry.order,
      });
    }
  }

  function buildTextEntry(node, entry) {
    const value = getTextValue(node);
    return {
      node,
      nodeId: node.id,
      nodeName: entry.name,
      nodeType: entry.type,
      text: value,
      fontFamily: resolveUniformFontFamily(node),
      fontSize: resolveUniformFontSize(node),
      bounds: entry.bounds,
      order: entry.order,
      depth: entry.depth,
      rootId: entry.rootId,
      parentId: entry.parentId,
    };
  }

  function collectSpacingEntries(node, entry, bucket) {
    if (!hasLayout(node)) {
      return;
    }

    if (typeof node.itemSpacing === "number" && Number.isFinite(node.itemSpacing) && node.itemSpacing > 0) {
      bucket.push({
        node,
        nodeId: node.id,
        nodeName: entry.name,
        nodeType: entry.type,
        kind: "gap",
        label: "간격",
        value: roundValue(node.itemSpacing),
        fields: ["itemSpacing"],
      });
    }

    const paddingFields = [
      { field: "paddingTop", label: "상단 여백", value: node.paddingTop },
      { field: "paddingRight", label: "우측 여백", value: node.paddingRight },
      { field: "paddingBottom", label: "하단 여백", value: node.paddingBottom },
      { field: "paddingLeft", label: "좌측 여백", value: node.paddingLeft },
    ].filter((item) => typeof item.value === "number" && Number.isFinite(item.value) && item.value > 0);

    if (paddingFields.length === 4) {
      const uniqueValues = uniqueNumbers(paddingFields.map((item) => roundValue(item.value)));
      if (uniqueValues.length === 1) {
        bucket.push({
          node,
          nodeId: node.id,
          nodeName: entry.name,
          nodeType: entry.type,
          kind: "padding",
          label: "패딩",
          value: uniqueValues[0],
          fields: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        });
        return;
      }
    }

    for (const item of paddingFields) {
      bucket.push({
        node,
        nodeId: node.id,
        nodeName: entry.name,
        nodeType: entry.type,
        kind: item.field,
        label: item.label,
        value: roundValue(item.value),
        fields: [item.field],
      });
    }
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  function canEditPaintEntry(entry) {
    return !!entry && canEditSolidPaintProperty(entry.node, entry.property, entry.paintIndex);
  }

  function canAdjustFontSize(node) {
    return (
      !!node &&
      node.type === "TEXT" &&
      isDirectlyEditableNode(node) &&
      typeof node.characters === "string" &&
      node.characters.length > 0 &&
      typeof node.setRangeFontSize === "function" &&
      collectEditableFontNames(node).length > 0
    );
  }

  function canEditSolidPaintProperty(node, property, paintIndex) {
    if (!isDirectlyEditableNode(node)) {
      return false;
    }
    if ((property !== "fills" && property !== "strokes") || !(property in node) || !Array.isArray(node[property])) {
      return false;
    }
    if (typeof paintIndex !== "number" || paintIndex < 0) {
      return false;
    }
    const paint = node[property][paintIndex];
    return !!paint && paint.visible !== false && paint.type === "SOLID" && !!paint.color;
  }

  function canAdjustSpacingFields(node, fields) {
    if (!isDirectlyEditableNode(node) || !Array.isArray(fields) || !fields.length) {
      return false;
    }
    for (const field of fields) {
      if (!SPACING_PLAN_FIELDS.has(field) || typeof node[field] !== "number" || !Number.isFinite(node[field])) {
        return false;
      }
    }
    return true;
  }

  function isDirectlyEditableNode(node) {
    return !!node && !hasLockedAncestor(node) && !hasInstanceAncestor(node);
  }

  function hasLockedAncestor(node) {
    let current = node;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (current.locked === true) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function hasInstanceAncestor(node) {
    let current = node;
    while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
      if (current.type === "INSTANCE") {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  function hasLayout(node) {
    return !!node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function getTextValue(node) {
    return typeof node.characters === "string" ? truncateText(node.characters, 72) : "";
  }

  function truncateText(value, limit) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    const maxLength = typeof limit === "number" ? limit : 48;
    if (!normalized) {
      return "";
    }
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
  }

  function resolveUniformFontFamily(node) {
    if (!node || node.type !== "TEXT") {
      return "";
    }
    if (node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      return node.fontName.family || "";
    }

    if (node.fontName === figma.mixed && typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string") {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        const families = Array.from(
          new Set(
            rangeFonts
              .filter((fontName) => fontName && typeof fontName.family === "string" && fontName.family.trim())
              .map((fontName) => fontName.family.trim())
          )
        );
        return families.length === 1 ? families[0] : "Mixed";
      } catch (error) {
        return "Mixed";
      }
    }

    return "";
  }

  function resolveUniformFontSize(node) {
    if (!node || node.type !== "TEXT") {
      return null;
    }
    if (typeof node.fontSize === "number" && Number.isFinite(node.fontSize)) {
      return roundValue(node.fontSize);
    }
    return null;
  }

  function findNearestColorToken(color, tokenItems) {
    let best = null;
    for (const item of tokenItems) {
      const distance = colorDistance(color, item.color);
      if (!best || distance < best.distance) {
        best = Object.assign({}, item, {
          distance,
        });
      }
    }
    return best;
  }

  function findNearestNumericToken(value, tokenValues) {
    let best = null;
    for (const candidate of tokenValues) {
      if (typeof candidate !== "number" || !Number.isFinite(candidate)) {
        continue;
      }
      const distance = Math.abs(candidate - value);
      if (best === null || distance < Math.abs(best - value)) {
        best = candidate;
      }
    }
    return best;
  }

  function isOnFourPointGrid(value) {
    return Math.abs(value - Math.round(value / 4) * 4) < 0.01;
  }

  function colorDistance(left, right) {
    if (!left || !right) {
      return Number.POSITIVE_INFINITY;
    }
    const red = Number(left.r || 0) - Number(right.r || 0);
    const green = Number(left.g || 0) - Number(right.g || 0);
    const blue = Number(left.b || 0) - Number(right.b || 0);
    return Math.sqrt(red * red + green * green + blue * blue);
  }

  function uniqueNumbers(values) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const key = String(value);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(value);
    }
    return result;
  }

  function uniqueStrings(values, limit) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const normalized = typeof value === "string" ? value.trim() : "";
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      result.push(normalized);
      if (typeof limit === "number" && result.length >= limit) {
        break;
      }
    }
    return result;
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper &&
      typeof helper.requestJsonTask === "function" &&
      typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
  }

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => node.id)
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
  }

  function formatSelectionLabel(roots) {
    if (!roots.length) {
      return "선택 없음";
    }
    if (roots.length === 1) {
      return roots[0].name;
    }
    return `${roots[0].name} 외 ${roots.length - 1}개`;
  }

  function inferDesignContext(options) {
    const corpus = `${options.rootNames.join(" ")} ${options.textSamples.join(" ")}`.toLowerCase();
    const categories = [
      {
        label: "로그인/인증 화면",
        reason: "로그인, 이메일, 비밀번호 계열 텍스트가 함께 보입니다.",
        keywords: ["login", "sign in", "sign up", "email", "password", "로그인", "이메일", "비밀번호", "회원가입"],
      },
      {
        label: "대시보드/리포트",
        reason: "숫자, 표, 카드형 정보가 많은 업무용 화면처럼 보입니다.",
        keywords: ["dashboard", "analytics", "report", "chart", "table", "대시보드", "리포트", "차트", "테이블"],
      },
      {
        label: "랜딩/프로모션",
        reason: "CTA 문구와 소개성 텍스트가 함께 나타납니다.",
        keywords: ["get started", "learn more", "shop", "download", "discover", "시작", "자세히", "다운로드", "구매"],
      },
      {
        label: "모달/다이얼로그",
        reason: "짧은 안내 텍스트와 확인/취소 계열 버튼이 보입니다.",
        keywords: ["cancel", "confirm", "delete", "ok", "취소", "확인", "삭제"],
      },
    ];

    let best = null;
    for (const category of categories) {
      let score = 0;
      for (const keyword of category.keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }
      if (category.label === "모달/다이얼로그" && options.selectionBounds && options.selectionBounds.width <= 720) {
        score += 1;
      }
      if (category.label === "대시보드/리포트" && options.stats.textNodeCount >= 8) {
        score += 1;
      }
      if (!best || score > best.score) {
        best = {
          label: category.label,
          reason: category.reason,
          score,
        };
      }
    }

    if (best && best.score > 0) {
      return best;
    }

    if (options.topTypes.length > 0) {
      return {
        label: "일반 UI 화면",
        reason: `${formatNodeType(options.topTypes[0].type || options.topTypes[0].key)} 중심 레이아웃입니다.`,
        score: 0,
      };
    }

    return {
      label: "선택 영역",
      reason: "선택된 레이어 집합을 기준으로 검사했습니다.",
      score: 0,
    };
  }

  function sortCountEntries(map) {
    return Array.from(map.entries())
      .map((entry) => ({
        key: entry[0],
        count: entry[1],
      }))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        return String(left.key).localeCompare(String(right.key));
      });
  }

  function bumpCount(map, key) {
    if (!key && key !== 0) {
      return;
    }
    map.set(key, (map.get(key) || 0) + 1);
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name.trim();
    }
    return String((node && node.type) || "Unnamed");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children);
  }

  function isNodeVisible(node) {
    return !!node && node.visible !== false;
  }

  function combineBounds(boundsList) {
    if (!boundsList.length) {
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
      width: Math.max(0, right - left),
      height: Math.max(0, bottom - top),
    };
  }

  function getNodeBounds(node) {
    if (node && node.absoluteBoundingBox) {
      return node.absoluteBoundingBox;
    }
    if (node && node.absoluteRenderBounds) {
      return node.absoluteRenderBounds;
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
        width: node.width,
        height: node.height,
      };
    }
    return null;
  }

  function cloneColor(color) {
    return {
      r: Number(color.r) || 0,
      g: Number(color.g) || 0,
      b: Number(color.b) || 0,
    };
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => clonePlainObject(item));
    }
    const clone = {};
    Object.keys(value).forEach((key) => {
      clone[key] = clonePlainObject(value[key]);
    });
    return clone;
  }

  function rgbToHex(color) {
    const red = toHexChannel(color.r);
    const green = toHexChannel(color.g);
    const blue = toHexChannel(color.b);
    return `#${red}${green}${blue}`;
  }

  function toHexChannel(value) {
    const channel = Math.max(0, Math.min(255, Math.round(value * 255)));
    return channel.toString(16).padStart(2, "0").toUpperCase();
  }

  function roundValue(value) {
    return Math.round(value * 100) / 100;
  }

  function roundPixel(value) {
    return Math.round(value);
  }

  async function loadFontsForTextNode(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }
    const fontNames = collectEditableFontNames(node);
    for (const fontName of fontNames) {
      await figma.loadFontAsync(fontName);
    }
  }

  function collectEditableFontNames(node) {
    const fontNames = [];
    const seen = new Set();
    const pushFont = (fontName) => {
      if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }
      const key = `${fontName.family}::${fontName.style}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    };

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (const fontName of rangeFonts) {
          pushFont(fontName);
        }
      } catch (error) {}
    }

    if (fontNames.length === 0 && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  function createIssueId(type, nodeId) {
    return `${type}:${nodeId}`;
  }

  function formatProviderLabel(provider) {
    switch (String(provider || "").toLowerCase()) {
      case "openai":
        return "OpenAI";
      case "gemini":
        return "Gemini";
      default:
        return provider ? String(provider) : "";
    }
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
      case "BOOLEAN_OPERATION":
        return "불리언";
      case "RECTANGLE":
        return "사각형";
      case "ELLIPSE":
        return "원형";
      default:
        return type;
    }
  }

  function normalizeErrorMessage(error, fallback) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return fallback;
  }
})();

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_REGROUP_RENAME_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_REGROUP_RENAME_CACHE_KEY = "pigma:ai-regroup-rename-cache:v1";
  const PATCH_VERSION = 1;
  const DEFAULT_NAMING_MODE = "web";
  const NAMING_MODE_METADATA = {
    web: {
      id: "web",
      label: "웹 호환 네이밍",
      renameDescription: "웹 호환 구조형 이름으로 정리하고, 안전한 조합만 보수적으로 묶습니다.",
      runningDescription: "웹 호환 구조형 이름을 정리하고 안전한 리그룹핑 후보를 확인하고 있습니다.",
      aggressiveRegroup: false,
      aiInstructions:
        "You improve Figma layer names for web implementation. Return Korean reasons, but every suggestedName must be lowercase ASCII dot notation like section.hero, button.primary.sign-in, text.heading.hero.title. Do not use spaces, slashes, Korean, or underscores in suggestedName. If uncertain, keep the provided localName.",
      aiReasonFallback: "AI 구조형 네이밍 기준",
    },
    hybrid: {
      id: "hybrid",
      label: "하이브리드 네이밍",
      renameDescription: "하이브리드 구조형 이름으로 정리하고, 텍스트 블록까지 조금 더 적극적으로 묶습니다.",
      runningDescription: "하이브리드 구조형 이름을 정리하고 적극적인 리그룹핑 후보를 확인하고 있습니다.",
      aggressiveRegroup: true,
      aiInstructions:
        "You improve Figma layer names for design handoff. Return Korean reasons, but every suggestedName must be ASCII slash notation in readable Title Case like Button/Primary/Sign In, Text/Hero/Title, Group/Navbar/Item/Profile. Use only letters, numbers, spaces, hyphens, and slashes. Do not use Korean, dots, or underscores in suggestedName. If uncertain, keep the provided localName.",
      aiReasonFallback: "AI 하이브리드 네이밍 기준",
    },
  };
  let activeNamingMode = DEFAULT_NAMING_MODE;
  const VECTOR_TYPES = new Set([
    "VECTOR",
    "BOOLEAN_OPERATION",
    "STAR",
    "LINE",
    "ELLIPSE",
    "POLYGON",
    "REGULAR_POLYGON",
    "RECTANGLE",
  ]);
  const AUTO_NAME_PATTERNS = [
    /^frame \d+$/i,
    /^group \d+$/i,
    /^rectangle \d+$/i,
    /^text \d+$/i,
    /^vector \d+$/i,
    /^ellipse \d+$/i,
    /^polygon \d+$/i,
    /^star \d+$/i,
    /^line \d+$/i,
    /^image \d+$/i,
    /^component \d+$/i,
    /^instance \d+$/i,
    /^section \d+$/i,
    /^copy(?: of)? /i,
    /^untitled/i,
  ];
  const BUTTON_TEXT_PATTERN =
    /^(ok|go|next|done|start|login|sign in|sign up|save|apply|cancel|submit|buy|book|download|contact|확인|다음|완료|시작|저장|취소|적용|구매|예약|문의|다운로드)$/i;
  const FIELD_KEYWORD_ENTRIES = [
    ["email", ["email", "e-mail", "이메일"]],
    ["password", ["password", "비밀번호"]],
    ["search", ["search", "검색"]],
    ["phone", ["phone", "mobile", "telephone", "전화", "휴대폰"]],
    ["name", ["name", "이름"]],
    ["company", ["company", "organization", "회사"]],
    ["message", ["message", "comment", "메시지", "문의"]],
    ["address", ["address", "주소"]],
  ];
  const ACTION_TOKEN_ENTRIES = [
    ["sign-in", ["login", "log in", "sign in", "로그인"]],
    ["sign-up", ["signup", "sign up", "회원가입"]],
    ["submit", ["submit", "제출", "확인"]],
    ["cancel", ["cancel", "취소"]],
    ["save", ["save", "저장"]],
    ["apply", ["apply", "적용"]],
    ["download", ["download", "다운로드"]],
    ["contact", ["contact", "문의"]],
    ["search", ["search", "검색"]],
    ["start", ["start", "시작"]],
    ["next", ["next", "다음"]],
    ["close", ["close", "닫기"]],
    ["delete", ["delete", "삭제"]],
    ["book", ["book", "예약"]],
    ["buy", ["buy", "purchase", "구매"]],
  ];
  const SECTION_TOKEN_ENTRIES = [
    ["hero", ["hero", "main", "intro", "banner", "get started", "discover", "learn more", "메인", "소개", "배너"]],
    ["navbar", ["nav", "navigation", "menu", "home", "profile", "settings", "알림", "메뉴", "홈", "프로필", "설정"]],
    ["sidebar", ["sidebar", "filter", "category", "project", "폴더", "카테고리", "필터", "사이드"]],
    ["footer", ["footer", "copyright", "privacy", "terms", "policy", "푸터", "약관", "정책"]],
    ["pricing", ["pricing", "price", "plan", "billing", "monthly", "yearly", "요금", "가격", "플랜"]],
    ["feature", ["feature", "benefit", "advantage", "why", "기능", "혜택", "장점"]],
    ["form", ["form", "email", "password", "input", "submit", "로그인", "회원가입", "이메일", "비밀번호", "입력", "제출"]],
    ["modal", ["modal", "dialog", "confirm", "cancel", "닫기", "취소", "확인"]],
    ["dashboard", ["dashboard", "analytics", "report", "metric", "chart", "data", "대시보드", "분석", "리포트", "지표", "차트"]],
    ["content", ["content", "body", "copy", "section", "콘텐츠", "본문", "섹션"]],
  ];
  const GENERIC_TOKEN_SET = new Set([
    "frame",
    "group",
    "section",
    "rectangle",
    "vector",
    "ellipse",
    "polygon",
    "line",
    "text",
    "component",
    "instance",
    "layer",
    "copy",
    "content",
    "item",
    "icon",
    "button",
    "field",
    "container",
  ]);
  let activeExecution = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiRegroupRenameMessage(message)) {
      if (message.type === "request-ai-regroup-rename-cache") {
        await postCachedRegroupRenameResult();
        return;
      }

      await withExecutionLock(
        {
          status: "running",
          message: getNamingModeMeta(resolveNamingMode(message && message.namingMode)).runningDescription,
          namingMode: resolveNamingMode(message && message.namingMode),
        },
        () => runRegroupRename(message)
      );
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_REGROUP_RENAME_PATCH__ = true;

  function isAiRegroupRenameMessage(message) {
    return !!message && (message.type === "request-ai-regroup-rename-cache" || message.type === "run-ai-regroup-rename");
  }

  async function withExecutionLock(execution, runner) {
    if (activeExecution) {
      postStatus(activeExecution.status, activeExecution.message, activeExecution.namingMode);
      return false;
    }

    activeExecution =
      execution && typeof execution === "object"
        ? execution
        : { status: "running", message: "", namingMode: DEFAULT_NAMING_MODE };
    try {
      await runner();
      return true;
    } finally {
      activeExecution = null;
    }
  }

  function resolveNamingMode(value) {
    return value === "hybrid" ? "hybrid" : DEFAULT_NAMING_MODE;
  }

  function getNamingModeMeta(mode) {
    return NAMING_MODE_METADATA[resolveNamingMode(mode)] || NAMING_MODE_METADATA[DEFAULT_NAMING_MODE];
  }

  async function runRegroupRename(message) {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    const namingMode = resolveNamingMode(message && message.namingMode);
    const modeMeta = getNamingModeMeta(namingMode);
    activeNamingMode = namingMode;
    postStatus("running", modeMeta.runningDescription, namingMode);
    postStatus("running", "리그룹핑/리네이밍을 적용하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyRegroupRename(designReadResult, { namingMode });
      await writeRegroupRenameCache(result);

      figma.ui.postMessage({
        type: "ai-regroup-rename-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(`리그룹핑/리네이밍 완료 (${result.summary.renameCount}개 이름 정리)`, { timeout: 1800 });
    } catch (error) {
      const message = normalizeErrorMessage(error, "리그룹핑/리네이밍에 실패했습니다.");

      figma.ui.postMessage({
        type: "ai-regroup-rename-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });

      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedRegroupRenameResult() {
    const result = await readRegroupRenameCache();

    figma.ui.postMessage({
      type: "ai-regroup-rename-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message, namingMode) {
    figma.ui.postMessage({
      type: "ai-regroup-rename-status",
      status,
      message,
      namingMode: resolveNamingMode(namingMode || activeNamingMode),
    });
  }

  async function readDesignReadCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_READ_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readRegroupRenameCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_REGROUP_RENAME_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function writeRegroupRenameCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_REGROUP_RENAME_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  async function applyRegroupRename(designReadResult, options) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const context = buildSelectionContext(selection, designReadResult, options);
    const renameResult = await applyRenamePlan(selection, context);
    const regroupResult = applyRegroupPlan(selection, context);
    const suggestionResult = buildRegroupSuggestions(selection, regroupResult.usedNodeIds, context);
    const skippedCount = renameResult.skipped.length + regroupResult.skipped.length;
    const insights = buildInsights(context, renameResult, regroupResult, suggestionResult);

    return {
      version: PATCH_VERSION,
      source: "local-heuristic",
      namingMode: context.namingMode,
      namingModeLabel: context.namingModeLabel,
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        namingMode: context.namingMode,
        namingModeLabel: context.namingModeLabel,
        renameCount: renameResult.applied.length,
        regroupCount: regroupResult.applied.length,
        suggestionCount: suggestionResult.length,
        skippedCount,
      },
      renamed: renameResult.applied.slice(0, 24),
      regrouped: regroupResult.applied.slice(0, 12),
      suggestions: suggestionResult.slice(0, 12),
      skipped: [...renameResult.skipped, ...regroupResult.skipped].slice(0, 12),
      insights: insights.slice(0, 6),
    };
  }

  function buildSelectionContext(selection, designReadResult, options) {
    const namingMode = resolveNamingMode(options && options.namingMode);
    const namingModeMeta = getNamingModeMeta(namingMode);
    const preservedRoot = findLargestSelectedRoot(selection);
    const roots = selection.map((node) => ({
      id: node.id,
      name: safeName(node),
      type: String(node.type || "UNKNOWN"),
    }));
    const selectionLabel = formatSelectionLabel(roots);
    const selectionSignature = getSelectionSignature(selection);
    if (
      designReadResult &&
      designReadResult.selectionSignature === selectionSignature &&
      designReadResult.summary &&
      typeof designReadResult.summary.contextLabel === "string"
    ) {
      const contextLabel = designReadResult.summary.contextLabel || "일반 UI 화면";
      return {
        selectionLabel,
        contextLabel,
        contextSlug: deriveContextSlug(contextLabel),
        preservedRootId: preservedRoot ? preservedRoot.id : "",
        preservedRootName: preservedRoot ? safeName(preservedRoot) : "",
        namingMode,
        namingModeLabel: namingModeMeta.label,
        namingModeDescription: namingModeMeta.renameDescription,
        aggressiveRegroup: namingModeMeta.aggressiveRegroup,
      };
    }

    const textSamples = collectSelectionTextSamples(selection, 8);
    const contextLabel = inferSelectionContext(selection, textSamples);
    return {
      selectionLabel,
      contextLabel,
      contextSlug: deriveContextSlug(contextLabel),
      preservedRootId: preservedRoot ? preservedRoot.id : "",
      preservedRootName: preservedRoot ? safeName(preservedRoot) : "",
      namingMode,
      namingModeLabel: namingModeMeta.label,
      namingModeDescription: namingModeMeta.renameDescription,
      aggressiveRegroup: namingModeMeta.aggressiveRegroup,
    };
  }

  function collectSelectionTextSamples(selection, limit) {
    const samples = [];
    const stack = [...selection];
    while (stack.length > 0 && samples.length < limit) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (node.type === "TEXT") {
        const text = getTextValue(node);
        if (text && !samples.includes(text)) {
          samples.push(text);
        }
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return samples;
  }

  function inferSelectionContext(selection, textSamples) {
    const rootNames = selection.map((node) => safeName(node).toLowerCase());
    const corpus = `${rootNames.join(" ")} ${textSamples.join(" ")}`.toLowerCase();
    const categories = [
      ["인증/폼 화면", ["login", "sign in", "sign up", "email", "password", "로그인", "이메일", "비밀번호", "입력"]],
      ["대시보드/데이터 화면", ["dashboard", "analytics", "chart", "table", "report", "metric", "지표", "차트", "테이블"]],
      ["랜딩/프로모션 화면", ["get started", "learn more", "buy", "download", "contact", "시작", "구매", "문의"]],
      ["모달/다이얼로그", ["cancel", "confirm", "delete", "ok", "취소", "삭제", "닫기", "확인"]],
      ["앱/웹 내비게이션 화면", ["home", "profile", "settings", "menu", "search", "홈", "프로필", "설정", "검색"]],
    ];

    let bestLabel = "일반 UI 화면";
    let bestScore = 0;
    for (const [label, keywords] of categories) {
      let score = 0;
      for (const keyword of keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestLabel = label;
      }
    }

    return bestLabel;
  }

  async function applyRenamePlan(selection, context) {
    const allNodes = collectSceneNodes(selection);
    const nodesByParent = new Map();
    const parentNameCounts = new Map();
    const applied = [];
    const skipped = [];
    const parentGroups = [];

    for (const node of allNodes) {
      if (!canRenameNode(node)) {
        continue;
      }

      const parent = node.parent;
      if (!parent) {
        continue;
      }

      const parentId = getParentKey(parent);
      if (!nodesByParent.has(parentId)) {
        nodesByParent.set(parentId, []);
        parentNameCounts.set(parentId, countSiblingNames(parent));
      }

      nodesByParent.get(parentId).push(node);
    }

    for (const [parentId, nodes] of nodesByParent.entries()) {
      const counts = parentNameCounts.get(parentId) || new Map();
      const usedNames = new Set();
      const candidates = [];

      for (const node of nodes) {
        const currentName = safeName(node);
        const currentKey = canonicalizeName(currentName);
        const baseName = proposeNodeName(node, context);
        const duplicateCount = counts.get(currentKey) || 0;
        const shouldRename =
          isSuspiciousName(currentName, node.type) ||
          duplicateCount > 1 ||
          !isStructuredNameForMode(currentName, context.namingMode);
        const preserveRootName = context.preservedRootId && node.id === context.preservedRootId;

        if (preserveRootName) {
          usedNames.add(currentKey);
          if (baseName && shouldRename) {
            skipped.push({
              label: currentName,
              reason: "선택된 가장 큰 루트 레이어 이름은 사용자 지정값으로 보고 유지했습니다.",
            });
          }
          continue;
        }

        if (!baseName || !shouldRename) {
          usedNames.add(currentKey);
          continue;
        }

        candidates.push({
          node,
          currentName,
          baseName,
          reason: buildRenameReason(node, context),
          parentName: safeName(node.parent),
          type: String(node.type || "UNKNOWN"),
          textHint: getPrimaryTextHint(node),
        });
      }

      parentGroups.push({
        usedNames,
        candidates,
      });
    }

    const aiRenameMap = await requestAiRenameSuggestions(parentGroups, context);

    for (const group of parentGroups) {
      const usedNames = group.usedNames;
      const candidates = group.candidates;
      for (const candidate of candidates) {
        const aiSuggestion = aiRenameMap.get(candidate.node.id);
        const nextBaseName = aiSuggestion && aiSuggestion.name ? aiSuggestion.name : candidate.baseName;
        const nextReason = aiSuggestion && aiSuggestion.reason ? aiSuggestion.reason : candidate.reason;
        const uniqueName = ensureUniqueName(nextBaseName, usedNames);
        if (!uniqueName || canonicalizeName(uniqueName) === canonicalizeName(candidate.currentName)) {
          continue;
        }

        try {
          candidate.node.name = uniqueName;
          applied.push({
            id: candidate.node.id,
            from: candidate.currentName,
            to: uniqueName,
            reason: nextReason,
          });
          usedNames.add(canonicalizeName(uniqueName));
        } catch (error) {
          skipped.push({
            label: candidate.currentName,
            reason: normalizeErrorMessage(error, "이름을 바꾸지 못했습니다."),
          });
          usedNames.add(canonicalizeName(candidate.currentName));
        }
      }
    }

    return {
      applied,
      skipped,
    };
  }

  async function requestAiRenameSuggestions(parentGroups, context) {
    const ai = getAiHelper();
    if (!ai) {
      return new Map();
    }

    let configured = false;
    try {
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      return new Map();
    }

    const candidates = [];
    for (const group of parentGroups) {
      const items = group && Array.isArray(group.candidates) ? group.candidates : [];
      for (const candidate of items) {
        candidates.push({
          id: candidate.node.id,
          currentName: candidate.currentName,
          localName: candidate.baseName,
          nodeType: candidate.type,
          parentName: candidate.parentName,
          textHint: candidate.textHint,
        });
      }
    }

    if (!candidates.length) {
      return new Map();
    }

    const schema = {
      type: "object",
      properties: {
        renames: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              suggestedName: { type: "string" },
              reason: { type: "string" },
            },
            required: ["id", "suggestedName", "reason"],
          },
        },
      },
      required: ["renames"],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions: getNamingModeMeta(context.namingMode).aiInstructions,
        schema: schema,
        payload: {
          contextLabel: context.contextLabel,
          contextSlug: context.contextSlug,
          candidates: candidates.slice(0, 36),
        },
      });
      const map = new Map();
      const rows = response && Array.isArray(response.renames) ? response.renames : [];
      for (const row of rows) {
        if (!row || typeof row !== "object" || typeof row.id !== "string" || typeof row.suggestedName !== "string") {
          continue;
        }

        const suggestedName = String(row.suggestedName).trim();
        if (!isStructuredNameForMode(suggestedName, context.namingMode)) {
          continue;
        }

        map.set(row.id, {
          name: suggestedName,
          reason: typeof row.reason === "string" && row.reason.trim() ? row.reason.trim() : "AI 구조형 네이밍 기준",
        });
      }

      return map;
    } catch (error) {
      return new Map();
    }
  }

  function applySafeRegroup(selection, context) {
    const parents = collectGroupableParents(selection);
    const applied = [];
    const skipped = [];
    const usedNodeIds = new Set();

    for (const parent of parents) {
      const pairs = findIconLabelPairs(parent.children || [], usedNodeIds);
      for (const pair of pairs) {
        try {
          const group = figma.group([pair.icon, pair.label], parent);
          const groupName = ensureUniqueName(
            buildGroupName(pair.label, context),
            collectSiblingNameSet(parent, group)
          );
          group.name = groupName;
          applied.push({
            id: group.id,
            name: groupName,
            parentName: safeName(parent),
            nodes: [safeName(pair.icon), safeName(pair.label)],
            reason: "가까운 아이콘과 라벨을 묶었습니다.",
          });
          usedNodeIds.add(pair.icon.id);
          usedNodeIds.add(pair.label.id);
          usedNodeIds.add(group.id);
        } catch (error) {
          skipped.push({
            label: `${safeName(pair.icon)} + ${safeName(pair.label)}`,
            reason: normalizeErrorMessage(error, "리그룹핑을 적용하지 못했습니다."),
          });
        }
      }
    }

    return {
      applied,
      skipped,
      usedNodeIds,
    };
  }

  function applyRegroupPlan(selection, context) {
    const baseResult = applySafeRegroup(selection, context);
    if (!context.aggressiveRegroup) {
      return baseResult;
    }

    const textBlockResult = applyTextBlockRegroup(selection, baseResult.usedNodeIds, context);
    return {
      applied: [...baseResult.applied, ...textBlockResult.applied],
      skipped: [...baseResult.skipped, ...textBlockResult.skipped],
      usedNodeIds: textBlockResult.usedNodeIds,
    };
  }

  function applyTextBlockRegroup(selection, seedUsedNodeIds, context) {
    const usedNodeIds = new Set(seedUsedNodeIds || []);
    const applied = [];
    const skipped = [];
    const parents = collectGroupableParents(selection);

    for (const parent of parents) {
      const suggestions = findTextBlockSuggestions(parent.children || [], usedNodeIds, context);
      for (const suggestion of suggestions) {
        const nodes = suggestion.nodes
          .map((entry) => Array.from(parent.children || []).find((child) => child && child.id === entry.id))
          .filter(Boolean);
        if (nodes.length !== suggestion.nodes.length) {
          continue;
        }

        try {
          const group = figma.group(nodes, parent);
          const groupName = ensureUniqueName(suggestion.name, collectSiblingNameSet(parent, group));
          group.name = groupName;
          applied.push({
            id: group.id,
            name: groupName,
            parentName: safeName(parent),
            nodes: suggestion.nodes.map((entry) => entry.name),
            reason: suggestion.reason,
          });
          nodes.forEach((node) => usedNodeIds.add(node.id));
          usedNodeIds.add(group.id);
        } catch (error) {
          skipped.push({
            label: suggestion.nodes.map((entry) => entry.name).join(" + "),
            reason: normalizeErrorMessage(error, "由ш렇猷뱁븨???곸슜?섏? 紐삵뻽?듬땲??"),
          });
        }
      }
    }

    return {
      applied,
      skipped,
      usedNodeIds,
    };
  }

  function buildRegroupSuggestions(selection, usedNodeIds, context) {
    const suggestions = [];
    const seen = new Set();
    const parents = collectGroupableParents(selection, true);

    for (const parent of parents) {
      for (const suggestion of findTextBlockSuggestions(parent.children || [], usedNodeIds, context)) {
        const key = `${suggestion.parentName}:${suggestion.nodes.map((node) => node.id).join(",")}`;
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        suggestions.push(suggestion);
        if (suggestions.length >= 12) {
          return suggestions;
        }
      }
    }

    return suggestions;
  }

  function buildInsights(context, renameResult, regroupResult, suggestions) {
    const insights = [
      `네이밍 기준: ${context.namingModeLabel}`,
      `맥락 기준: ${context.contextLabel}`,
      `이름 정리 ${renameResult.applied.length}건 적용`,
      `안전한 아이콘+라벨 리그룹핑 ${regroupResult.applied.length}건 적용`,
    ];

    if (context.preservedRootName) {
      insights.push(`가장 큰 선택 루트 이름 유지: ${context.preservedRootName}`);
    }

    if (context.aggressiveRegroup) {
      insights.push("하이브리드 모드에서 텍스트 블록 리그룹핑까지 적용");
    }

    if (suggestions.length > 0) {
      insights.push(`추가 리그룹핑 후보 ${suggestions.length}건 감지`);
    }

    if (renameResult.applied.length > 0) {
      const firstRename = renameResult.applied[0];
      insights.push(`대표 이름 변경: ${firstRename.from} -> ${firstRename.to}`);
    }

    if (regroupResult.applied.length > 0) {
      const firstGroup = regroupResult.applied[0];
      insights.push(`대표 리그룹핑: ${firstGroup.name}`);
    }

    return insights;
  }

  function collectSceneNodes(selection) {
    const nodes = [];
    const stack = [...selection];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      nodes.push(node);

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return nodes;
  }

  function collectGroupableParents(selection, includeSuggestionParents) {
    const parents = [];
    const seen = new Set();
    const stack = [...selection];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (hasChildren(node)) {
        if (canUseParentForGrouping(node, includeSuggestionParents)) {
          const key = getParentKey(node);
          if (!seen.has(key)) {
            seen.add(key);
            parents.push(node);
          }
        }

        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return parents;
  }

  function canUseParentForGrouping(parent, includeSuggestionParents) {
    if (!parent || !hasChildren(parent) || parent.locked === true || parent.children.length < 2) {
      return false;
    }

    if (isInsideInstance(parent)) {
      return false;
    }

    const type = String(parent.type || "");
    if (type === "INSTANCE" || type === "COMPONENT" || type === "COMPONENT_SET") {
      return false;
    }

    if (typeof parent.layoutMode === "string" && parent.layoutMode !== "NONE") {
      return includeSuggestionParents === true;
    }

    return true;
  }

  function canRenameNode(node) {
    if (!node || node.locked === true || node.visible === false) {
      return false;
    }

    if (isInsideInstance(node)) {
      return false;
    }

    return typeof node.name === "string";
  }

  function proposeNodeName(node, context) {
    const type = String(node.type || "UNKNOWN");
    const textHint = getPrimaryTextHint(node);
    const sectionSlug = detectSectionSlug(node, context);
    const contentSlug = resolveContentSlug(node, textHint);

    if (type === "TEXT") {
      return buildTextNodeName(node, textHint, sectionSlug, contentSlug, context);
    }

    if (isButtonContainer(node)) {
      return buildStructuredName(context.namingMode, "button", detectButtonVariant(node), findActionSlug(node) || contentSlug || "action");
    }

    if (isFieldContainer(node)) {
      return buildStructuredName(context.namingMode, "field", findFieldLabel(node) || contentSlug || "input", "input");
    }

    if (isIconLikeNode(node)) {
      return buildStructuredName(context.namingMode, "icon", findActionSlug(node) || contentSlug || sectionSlug || "glyph");
    }

    if (hasChildren(node)) {
      return buildContainerName(node, context, sectionSlug, contentSlug);
    }

    if (VECTOR_TYPES.has(type)) {
      return buildStructuredName(context.namingMode, "shape", contentSlug || "vector");
    }

    return buildStructuredName(context.namingMode, "layer", typePrefix(type), contentSlug || sectionSlug || "item");
  }

  function buildTextNodeName(node, textHint, sectionSlug, contentSlug, context) {
    const text = textHint || getTextValue(node);
    if (!text) {
      return buildStructuredName(context.namingMode, "text", "body", sectionSlug || "content", "copy");
    }

    const actionSlug = findActionSlugFromText(text);
    if (actionSlug) {
      return buildStructuredName(context.namingMode, "text", "button-label", actionSlug);
    }

    const fieldLabel = matchFieldLabel(text);
    if (fieldLabel) {
      return buildStructuredName(context.namingMode, "text", "field-label", fieldLabel);
    }

    const textRole = detectTextRole(node, text);
    if (textRole === "heading" || textRole === "title") {
      return buildStructuredName(context.namingMode, "text", textRole, sectionSlug || "content", "title");
    }

    if (textRole === "meta") {
      return buildStructuredName(context.namingMode, "text", "meta", contentSlug || sectionSlug || "label");
    }

    if (textRole === "label") {
      return buildStructuredName(context.namingMode, "text", "label", contentSlug || sectionSlug || "label");
    }

    return buildStructuredName(context.namingMode, "text", "body", sectionSlug || "content", contentSlug || "copy");
  }

  function buildRenameReason(node, context) {
    if (String(node.type || "") === "TEXT") {
      return "웹 구조형 텍스트 역할 기준";
    }

    if (isButtonContainer(node)) {
      return "웹 버튼 구조 기준";
    }

    if (isFieldContainer(node)) {
      return "웹 입력 필드 구조 기준";
    }

    if (isIconLikeNode(node)) {
      return "웹 아이콘 역할 기준";
    }

    return "웹 호환 구조형 네이밍 기준";
  }

  function buildContainerName(node, context, sectionSlug, contentSlug) {
    const resolvedSection = sectionSlug || context.contextSlug || "content";
    const groupRole = inferGroupRole(node, contentSlug);

    if (isCardLikeNode(node)) {
      return buildStructuredName(context.namingMode, "card", resolvedSection, contentSlug || "item");
    }

    if (isSectionRootLike(node)) {
      return buildStructuredName(context.namingMode, "section", resolvedSection);
    }

    if (String(node.type || "") === "GROUP") {
      return buildStructuredName(context.namingMode, "group", resolvedSection, groupRole);
    }

    return buildStructuredName(context.namingMode, "container", resolvedSection, groupRole);
  }

  function typePrefix(type) {
    switch (String(type || "").toUpperCase()) {
      case "FRAME":
      case "SECTION":
        return "section";
      case "GROUP":
        return "group";
      case "COMPONENT":
        return "component";
      case "COMPONENT_SET":
        return "component-set";
      case "INSTANCE":
        return "instance";
      case "TEXT":
        return "text";
      default:
        return "layer";
    }
  }

  function findActionLabel(node) {
    const texts = collectNodeTexts(node, 4, 2);
    for (const text of texts) {
      if (looksLikeButtonText(text)) {
        return compactText(text);
      }
    }

    return texts.length > 0 ? compactText(texts[0]) : "";
  }

  function findFieldLabel(node) {
    const texts = collectNodeTexts(node, 4, 2);
    for (const text of texts) {
      const fieldLabel = matchFieldLabel(text);
      if (fieldLabel) {
        return fieldLabel;
      }
    }

    return texts.length > 0 ? compactText(texts[0]) : "";
  }

  function collectNodeTexts(node, limit, maxDepth) {
    const texts = [];
    const stack = [{ node, depth: 0 }];

    while (stack.length > 0 && texts.length < limit) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (current.node.type === "TEXT") {
        const text = getTextValue(current.node);
        if (text && !texts.includes(text)) {
          texts.push(text);
        }
      }

      if (current.depth >= maxDepth || !hasChildren(current.node)) {
        continue;
      }

      for (let index = current.node.children.length - 1; index >= 0; index -= 1) {
        stack.push({ node: current.node.children[index], depth: current.depth + 1 });
      }
    }

    return texts;
  }

  function getPrimaryTextHint(node) {
    if (!node) {
      return "";
    }

    if (node.type === "TEXT") {
      return compactText(getTextValue(node));
    }

    const texts = collectNodeTexts(node, 2, 2);
    return texts.length > 0 ? compactText(texts[0]) : "";
  }

  function getTextValue(node) {
    return typeof node.characters === "string" ? node.characters.replace(/\s+/g, " ").trim() : "";
  }

  function compactText(text) {
    const normalized = String(text || "")
      .replace(/\s+/g, " ")
      .replace(/^[\s\-–—:;,.|/]+|[\s\-–—:;,.|/]+$/g, "")
      .trim();
    if (!normalized) {
      return "";
    }

    return normalized.length > 28 ? `${normalized.slice(0, 25)}...` : normalized;
  }

  function looksLikeButtonText(text) {
    const normalized = compactText(text).toLowerCase();
    return normalized.length > 0 && normalized.length <= 24 && BUTTON_TEXT_PATTERN.test(normalized);
  }

  function matchFieldLabel(text) {
    return findBestToken([text], FIELD_KEYWORD_ENTRIES, "");
  }

  function findActionSlug(node) {
    const texts = collectNodeTexts(node, 4, 2);
    return findBestToken(texts, ACTION_TOKEN_ENTRIES, "") || slugifyAsciiToken(findActionLabel(node));
  }

  function findActionSlugFromText(text) {
    return findBestToken([text], ACTION_TOKEN_ENTRIES, "");
  }

  function deriveContextSlug(contextLabel) {
    const normalized = String(contextLabel || "");
    if (normalized.includes("인증") || normalized.includes("폼")) {
      return "form";
    }

    if (normalized.includes("대시보드") || normalized.includes("데이터")) {
      return "dashboard";
    }

    if (normalized.includes("랜딩") || normalized.includes("프로모션")) {
      return "hero";
    }

    if (normalized.includes("모달") || normalized.includes("다이얼로그")) {
      return "modal";
    }

    if (normalized.includes("내비게이션")) {
      return "navbar";
    }

    if (normalized.includes("컴포넌트")) {
      return "component";
    }

    return "content";
  }

  function detectSectionSlug(node, context) {
    const values = [safeName(node)];
    const parent = node && node.parent;
    if (parent) {
      values.push(safeName(parent));
    }

    values.push(...collectNodeTexts(node, 3, 2));
    const sectionSlug = findBestToken(values, SECTION_TOKEN_ENTRIES, "");
    return sectionSlug || context.contextSlug || "content";
  }

  function resolveContentSlug(node, preferredText) {
    const values = [preferredText, safeName(node), ...collectNodeTexts(node, 3, 1)];
    const actionSlug = findBestToken(values, ACTION_TOKEN_ENTRIES, "");
    if (actionSlug) {
      return actionSlug;
    }

    const fieldSlug = findBestToken(values, FIELD_KEYWORD_ENTRIES, "");
    if (fieldSlug) {
      return fieldSlug;
    }

    for (const value of values) {
      const slug = slugifyAsciiToken(value);
      if (slug && !GENERIC_TOKEN_SET.has(slug)) {
        return slug;
      }
    }

    return "";
  }

  function detectTextRole(node, text) {
    const fontSize = typeof node.fontSize === "number" ? node.fontSize : 0;
    const normalized = compactText(text);
    if (fontSize >= 28) {
      return "heading";
    }

    if (fontSize >= 18) {
      return "title";
    }

    if (fontSize > 0 && fontSize <= 11) {
      return "meta";
    }

    if (normalized.length <= 28) {
      return "label";
    }

    return "body";
  }

  function inferGroupRole(node, contentSlug) {
    const childNodes = Array.isArray(node.children) ? node.children.filter(Boolean) : [];
    const buttonCount = childNodes.filter((child) => isButtonContainer(child)).length;
    const textCount = childNodes.filter((child) => child.type === "TEXT").length;
    const iconCount = childNodes.filter((child) => isIconLikeNode(child)).length;
    const cardCount = childNodes.filter((child) => isCardLikeNode(child)).length;

    if (buttonCount >= 2) {
      return "actions";
    }

    if (cardCount >= 2) {
      return "list";
    }

    if (textCount >= 2 && iconCount === 0) {
      return "copy";
    }

    if (iconCount >= 1 && textCount >= 1) {
      return "item";
    }

    if (iconCount >= 1 && textCount === 0) {
      return "media";
    }

    return contentSlug || "content";
  }

  function detectButtonVariant(node) {
    const hasSolidFill = hasVisibleSolidFill(node);
    const hasStroke = hasVisibleStroke(node);
    if (hasSolidFill) {
      return "primary";
    }

    if (hasStroke) {
      return "secondary";
    }

    return "ghost";
  }

  function buildStructuredName(mode, ...segments) {
    return resolveNamingMode(mode) === "hybrid" ? buildHybridName(...segments) : buildWebName(...segments);
  }

  function buildWebName(...segments) {
    const normalized = [];
    for (const segment of segments) {
      const slug = slugifyAsciiToken(segment);
      if (!slug) {
        continue;
      }

      if (normalized[normalized.length - 1] === slug) {
        continue;
      }

      normalized.push(slug);
    }

    if (!normalized.length) {
      return "layer.item";
    }

    return normalized.join(".");
  }

  function buildHybridName(...segments) {
    const normalized = [];
    for (const segment of segments) {
      const value = humanizeHybridSegment(segment);
      if (!value) {
        continue;
      }

      if (canonicalizeName(normalized[normalized.length - 1]) === canonicalizeName(value)) {
        continue;
      }

      normalized.push(value);
    }

    if (!normalized.length) {
      return "Layer/Item";
    }

    return normalized.join("/");
  }

  function humanizeHybridSegment(value) {
    const slug = slugifyAsciiToken(value);
    if (!slug) {
      return "";
    }

    return slug
      .split("-")
      .filter(Boolean)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(" ");
  }

  function findBestToken(values, entries, fallback) {
    const corpus = values
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .join(" ")
      .toLowerCase();
    if (!corpus) {
      return fallback;
    }

    let bestSlug = fallback;
    let bestScore = 0;
    for (const [slug, keywords] of entries) {
      let score = 0;
      for (const keyword of keywords) {
        if (corpus.includes(String(keyword).toLowerCase())) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestSlug = slug;
        bestScore = score;
      }
    }

    return bestScore > 0 ? bestSlug : fallback;
  }

  function slugifyAsciiToken(value) {
    const normalized = compactText(value)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized;
  }

  function isWebCompatibleStructuredName(name) {
    const normalized = String(name || "").trim();
    return /^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/.test(normalized);
  }

  function isHybridStructuredName(name) {
    const normalized = String(name || "").trim();
    return /^[A-Z][A-Za-z0-9]*(?:[ -][A-Za-z0-9]+)*(?:\/[A-Z][A-Za-z0-9]*(?:[ -][A-Za-z0-9]+)*)+$/.test(normalized);
  }

  function isStructuredNameForMode(name, mode) {
    return resolveNamingMode(mode) === "hybrid" ? isHybridStructuredName(name) : isWebCompatibleStructuredName(name);
  }

  function hasVisibleSolidFill(node) {
    return !!node && Array.isArray(node.fills) && node.fills.some((paint) => paint && paint.visible !== false && paint.type === "SOLID");
  }

  function hasVisibleStroke(node) {
    return !!node && Array.isArray(node.strokes) && node.strokes.some((paint) => paint && paint.visible !== false);
  }

  function isButtonContainer(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const name = safeName(node).toLowerCase();
    if (/button|btn|cta|chip|tab|badge|버튼|탭|칩/.test(name)) {
      return true;
    }

    const texts = collectNodeTexts(node, 3, 2);
    const bounds = getNodeBounds(node);
    return (
      !!bounds &&
      bounds.height <= 88 &&
      texts.some((text) => looksLikeButtonText(text))
    );
  }

  function isFieldContainer(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width < 120 || bounds.height < 32) {
      return false;
    }

    return !!findFieldLabel(node);
  }

  function isCardLikeNode(node) {
    const bounds = getNodeBounds(node);
    if (!bounds || !hasChildren(node)) {
      return false;
    }

    return bounds.width >= 120 && bounds.width <= 480 && bounds.height >= 72 && bounds.height <= 360;
  }

  function isSectionRootLike(node) {
    const type = String(node.type || "");
    return type === "FRAME" || type === "SECTION";
  }

  function findIconLabelPairs(children, usedNodeIds) {
    const pairs = [];
    const used = new Set(usedNodeIds);
    const labels = children
      .filter((node) => isLabelTextNode(node) && !used.has(node.id))
      .sort((left, right) => compareBounds(left, right));
    const icons = children.filter((node) => isIconLikeNode(node) && !used.has(node.id));

    for (const label of labels) {
      const labelBounds = getNodeBounds(label);
      if (!labelBounds) {
        continue;
      }

      let bestIcon = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const icon of icons) {
        if (used.has(icon.id)) {
          continue;
        }

        const iconBounds = getNodeBounds(icon);
        if (!iconBounds) {
          continue;
        }

        const gap = labelBounds.x - (iconBounds.x + iconBounds.width);
        const centerDelta = Math.abs(centerY(labelBounds) - centerY(iconBounds));
        if (gap < -2 || gap > 28 || centerDelta > 12) {
          continue;
        }

        const distance = gap + centerDelta;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIcon = icon;
        }
      }

      if (!bestIcon) {
        continue;
      }

      used.add(label.id);
      used.add(bestIcon.id);
      pairs.push({
        icon: bestIcon,
        label,
      });
    }

    return pairs;
  }

  function findTextBlockSuggestions(children, usedNodeIds, context) {
    const suggestions = [];
    const texts = children
      .filter((node) => node.type === "TEXT" && !usedNodeIds.has(node.id) && node.locked !== true && node.visible !== false)
      .sort((left, right) => compareBounds(left, right));

    for (let index = 0; index < texts.length - 1; index += 1) {
      const title = texts[index];
      const body = texts[index + 1];
      const titleBounds = getNodeBounds(title);
      const bodyBounds = getNodeBounds(body);
      if (!titleBounds || !bodyBounds) {
        continue;
      }

      const leftDelta = Math.abs(titleBounds.x - bodyBounds.x);
      const verticalGap = bodyBounds.y - (titleBounds.y + titleBounds.height);
      const titleSize = typeof title.fontSize === "number" ? title.fontSize : 0;
      const bodySize = typeof body.fontSize === "number" ? body.fontSize : 0;

      if (leftDelta > 12 || verticalGap < 0 || verticalGap > 24 || titleSize <= bodySize) {
        continue;
      }

      suggestions.push({
        name: buildSuggestedTextBlockName(title, body, context),
        parentName: safeName(title.parent),
        nodes: [
          { id: title.id, name: safeName(title) },
          { id: body.id, name: safeName(body) },
        ],
        reason: "제목과 설명이 세로로 이어진 조합입니다.",
      });
    }

    return suggestions;
  }

  function buildGroupName(labelNode, context) {
    const label = getPrimaryTextHint(labelNode);
    const itemSlug = resolveContentSlug(labelNode, label) || "item";
    const sectionSlug = detectSectionSlug(labelNode, context);
    if (context.contextSlug === "navbar" || sectionSlug === "navbar") {
      return buildStructuredName(context.namingMode, "group", "navbar", "item", itemSlug);
    }

    return buildStructuredName(context.namingMode, "group", sectionSlug || context.contextSlug || "content", "item", itemSlug);
  }

  function buildSuggestedTextBlockName(titleNode, bodyNode, context) {
    const titleLabel = getPrimaryTextHint(titleNode);
    const bodyLabel = getPrimaryTextHint(bodyNode);
    const itemSlug =
      resolveContentSlug(titleNode, titleLabel) ||
      resolveContentSlug(bodyNode, bodyLabel) ||
      "copy";
    const sectionSlug = detectSectionSlug(titleNode, context);
    return buildStructuredName(context.namingMode, "group", sectionSlug || context.contextSlug || "content", "copy", itemSlug);
  }

  function isLabelTextNode(node) {
    const text = getTextValue(node);
    if (node.type !== "TEXT" || !text || text.length > 28) {
      return false;
    }

    const bounds = getNodeBounds(node);
    return !!bounds && bounds.width <= 280;
  }

  function isIconLikeNode(node) {
    if (!node || node.locked === true || node.visible === false) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width > 40 || bounds.height > 40) {
      return false;
    }

    const type = String(node.type || "");
    if (VECTOR_TYPES.has(type)) {
      return true;
    }

    if (!hasChildren(node)) {
      return false;
    }

    const texts = collectNodeTexts(node, 1, 1);
    if (texts.length > 0) {
      return false;
    }

    let descCount = 0;
    const stack = [...node.children];
    while (stack.length > 0 && descCount <= 3) {
      const child = stack.pop();
      if (!child) {
        continue;
      }

      descCount += 1;
      if (VECTOR_TYPES.has(String(child.type || ""))) {
        return true;
      }

      if (hasChildren(child)) {
        for (let index = child.children.length - 1; index >= 0; index -= 1) {
          stack.push(child.children[index]);
        }
      }
    }

    return false;
  }

  function compareBounds(leftNode, rightNode) {
    const left = getNodeBounds(leftNode);
    const right = getNodeBounds(rightNode);
    if (!left || !right) {
      return 0;
    }

    if (Math.abs(left.y - right.y) > 4) {
      return left.y - right.y;
    }

    return left.x - right.x;
  }

  function centerY(bounds) {
    return bounds.y + bounds.height / 2;
  }

  function ensureUniqueName(baseName, usedNames) {
    const trimmed = String(baseName || "").trim();
    if (!trimmed) {
      return "";
    }

    let candidate = trimmed;
    let index = 2;
    const structured = isWebCompatibleStructuredName(trimmed);
    const hybridStructured = isHybridStructuredName(trimmed);
    while (usedNames.has(canonicalizeName(candidate))) {
      const suffix = String(index).padStart(2, "0");
      candidate = structured ? `${trimmed}-${suffix}` : hybridStructured ? `${trimmed} ${suffix}` : `${trimmed} ${suffix}`;
      index += 1;
    }

    return candidate;
  }

  function collectSiblingNameSet(parent, skipNode) {
    const usedNames = new Set();
    if (!parent || !Array.isArray(parent.children)) {
      return usedNames;
    }

    for (const child of parent.children) {
      if (!child || child === skipNode) {
        continue;
      }

      usedNames.add(canonicalizeName(safeName(child)));
    }

    return usedNames;
  }

  function countSiblingNames(parent) {
    const counts = new Map();
    if (!parent || !Array.isArray(parent.children)) {
      return counts;
    }

    for (const child of parent.children) {
      if (!child) {
        continue;
      }

      const key = canonicalizeName(safeName(child));
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return counts;
  }

  function getParentKey(parent) {
    return parent && typeof parent.id === "string" ? parent.id : `parent:${safeName(parent)}`;
  }

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => node.id)
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
  }

  function getNodeBounds(node) {
    if (node && node.absoluteBoundingBox) {
      return node.absoluteBoundingBox;
    }

    if (node && node.absoluteRenderBounds) {
      return node.absoluteRenderBounds;
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
        width: node.width,
        height: node.height,
      };
    }

    return null;
  }

  function findLargestSelectedRoot(selection) {
    const roots = Array.from(selection || []).filter(Boolean);
    if (!roots.length) {
      return null;
    }

    let bestNode = roots[0];
    let bestArea = getNodeArea(bestNode);
    for (let index = 1; index < roots.length; index += 1) {
      const node = roots[index];
      const area = getNodeArea(node);
      if (area > bestArea) {
        bestNode = node;
        bestArea = area;
      }
    }

    return bestNode;
  }

  function getNodeArea(node) {
    const bounds = getNodeBounds(node);
    if (!bounds) {
      return 0;
    }

    const width = typeof bounds.width === "number" ? Math.max(0, bounds.width) : 0;
    const height = typeof bounds.height === "number" ? Math.max(0, bounds.height) : 0;
    return width * height;
  }

  function formatSelectionLabel(roots) {
    if (!roots.length) {
      return "선택 없음";
    }

    if (roots.length === 1) {
      return roots[0].name;
    }

    return `${roots[0].name} 외 ${roots.length - 1}개`;
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name.trim();
    }

    return String((node && node.type) || "Unnamed");
  }

  function canonicalizeName(name) {
    return String(name || "").trim().toLowerCase();
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children);
  }

  function isInsideInstance(node) {
    let current = node && node.parent;
    while (current) {
      if (String(current.type || "") === "INSTANCE") {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  function isSuspiciousName(name, type) {
    if (!name) {
      return true;
    }

    const normalized = String(name).trim();
    if (!normalized) {
      return true;
    }

    if (normalized.toUpperCase() === String(type || "").toUpperCase()) {
      return true;
    }

    return AUTO_NAME_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  function normalizeErrorMessage(error, fallback) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim().length > 0) {
      return error.message.trim();
    }

    return fallback;
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper && typeof helper.requestJsonTask === "function" && typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
  }
})();

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_TYPO_AUDIT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_TYPO_AUDIT_CACHE_KEY = "pigma:ai-typo-audit-cache:v1";
  const AI_TYPO_FIX_CACHE_KEY = "pigma:ai-typo-fix-cache:v1";
  const AI_TYPO_CLEAR_CACHE_KEY = "pigma:ai-typo-clear-cache:v1";
  const PATCH_VERSION = 6;
  const TYPO_AUDIT_MODEL_BY_PROVIDER = Object.freeze({
    openai: "gpt-5-mini",
    gemini: "gemini-2.5-pro",
  });
  const ANNOTATION_PREFIX = "[Ai 판단]";
  const LEGACY_ANNOTATION_PREFIXES = ["[AI Typo]", ANNOTATION_PREFIX, "[Pigma Ai Audit]"];
  const ANNOTATION_CATEGORY_LABEL = "Pigma Ai Audit";
  const ANNOTATION_CATEGORY_COLOR = "yellow";
  const TYPO_REPLACEMENT_RULES = [
    {
      id: "bangapseubnida-direct",
      pattern: /방\s*갑\s*스\s*비\s*난[.!?]?/g,
      replacement: "반갑습니다.",
      reason: "문장 전체가 '반갑습니다.'의 오타로 보여 직접 교정 후보로 표시했습니다.",
      kind: "오타",
    },
    {
      id: "bangapseumnida",
      pattern: /방\s*갑\s*습\s*니\s*다[.!?]?/g,
      replacement: "반갑습니다.",
      reason: "'반갑습니다.' 표현의 대표 오타입니다.",
      kind: "오타",
    },
    {
      id: "login-spacing",
      pattern: /로그\s+인/g,
      replacement: "로그인",
      reason: "UI 용어는 '로그인'을 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "signup-spacing",
      pattern: /회원\s+가입/g,
      replacement: "회원가입",
      reason: "UI 용어는 '회원가입'을 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "password-spacing",
      pattern: /비밀\s+번호/g,
      replacement: "비밀번호",
      reason: "UI 용어는 '비밀번호'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "download-spacing",
      pattern: /다운\s+로드/g,
      replacement: "다운로드",
      reason: "UI 용어는 '다운로드'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "mypage-spacing",
      pattern: /마이\s+페이지/g,
      replacement: "마이페이지",
      reason: "서비스 메뉴 명칭은 '마이페이지'처럼 붙여 쓰는 경우가 많습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "cart-spacing",
      pattern: /장바\s+구니/g,
      replacement: "장바구니",
      reason: "커머스 UI 용어는 '장바구니'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "id-spacing",
      pattern: /아이\s+디/g,
      replacement: "아이디",
      reason: "계정 식별자 표기는 '아이디'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
  ];
  const CONSISTENCY_RULES = [
    {
      id: "email-term",
      canonical: "이메일",
      variants: ["이메일", "이 메일", "e-mail", "email"],
      reason: "선택 내부에서 이메일 표기를 한 가지 방식으로 통일하면 읽기가 쉬워집니다.",
    },
    {
      id: "login-term",
      canonical: "로그인",
      variants: ["로그인", "로그 인"],
      reason: "선택 내부에서 로그인 표기를 한 가지 방식으로 통일하면 읽기가 쉬워집니다.",
    },
    {
      id: "signup-term",
      canonical: "회원가입",
      variants: ["회원가입", "회원 가입"],
      reason: "선택 내부에서 회원가입 표기를 한 가지 방식으로 통일하면 읽기가 쉬워집니다.",
    },
    {
      id: "email-term-en",
      canonical: "email",
      variants: ["email", "e-mail", "Email", "E-mail"],
      reason: "Use one email term consistently across the same UI.",
    },
    {
      id: "favorite-term-en",
      canonical: "favorite",
      variants: ["favorite", "favourite", "Favorite", "Favourite"],
      reason: "Use one English locale spelling consistently across the same UI.",
    },
  ];
  const TYPO_PHRASE_HINTS = [
    {
      canonical: "반갑습니다",
      suggestion: "반갑습니다.",
      maxDistance: 4,
      reason: "문장 전체가 '반갑습니다.'의 오타로 보여 교정 후보로 표시했습니다.",
      kind: "오타",
    },
  ];
  const LATIN_UI_TOKEN_HINTS_BY_LOCALE = Object.freeze({
    english: Object.freeze([
      "welcome",
      "continue",
      "cancel",
      "confirm",
      "search",
      "settings",
      "profile",
      "account",
      "password",
      "email",
      "username",
      "download",
      "upload",
      "favorite",
      "favourite",
      "notification",
      "privacy",
      "security",
      "submit",
      "message",
      "success",
      "error",
      "retry",
      "delete",
      "create",
      "update",
      "save",
      "close",
      "open",
      "language",
      "address",
      "country",
      "payment",
      "required",
      "optional",
      "optimal",
      "remember",
      "forgot",
      "subscribe",
      "analytics",
      "dashboard",
      "support",
      "help",
      "find",
      "monthly",
      "login",
      "logout",
      "signin",
      "signup",
    ]),
    spanish: Object.freeze([
      "bienvenido",
      "continuar",
      "cancelar",
      "confirmar",
      "buscar",
      "correo",
      "usuario",
      "configuracion",
      "configuración",
      "perfil",
      "contrasena",
      "contraseña",
      "guardar",
      "cerrar",
    ]),
    french: Object.freeze([
      "bonjour",
      "continuer",
      "annuler",
      "rechercher",
      "parametres",
      "paramètres",
      "profil",
      "enregistrer",
      "fermer",
    ]),
    german: Object.freeze([
      "hallo",
      "weiter",
      "abbrechen",
      "bestatigen",
      "bestätigen",
      "einstellungen",
      "konto",
      "passwort",
      "finde",
      "deine",
      "perfekte",
      "lösungen",
      "loesungen",
      "bessere",
      "balance",
      "angebot",
      "solange",
      "vorrat",
      "reicht",
      "jetzt",
      "kaufen",
      "februar",
      "monatlich",
      "monatliche",
      "speichern",
      "schliessen",
      "schließen",
    ]),
    portuguese: Object.freeze([
      "olá",
      "ola",
      "pesquisar",
      "configuracoes",
      "configurações",
      "senha",
      "endereco",
      "endereço",
      "fechar",
      "salvar",
    ]),
    italian: Object.freeze([
      "ciao",
      "continua",
      "annulla",
      "conferma",
      "ricerca",
      "impostazioni",
      "profilo",
      "salva",
      "chiudi",
    ]),
    dutch: Object.freeze([
      "welkom",
      "doorgaan",
      "annuleren",
      "zoeken",
      "instellingen",
      "profiel",
      "opslaan",
      "sluiten",
    ]),
  });
  const LATIN_UI_TOKEN_HINTS = Object.freeze(
    []
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.english)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.spanish)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.french)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.german)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.portuguese)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.italian)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.dutch)
  );
  const LATIN_UI_TOKEN_SET = new Set(LATIN_UI_TOKEN_HINTS.map((token) => normalizeLatinTokenForLookup(token)).filter(Boolean));
  const PROOFING_LOCALE_METADATA = Object.freeze({
    "cs-CZ": { label: "체코어 (체코)", aiLabel: "Czech (Czech Republic)", latinLocaleHint: "" },
    "da-DK": { label: "덴마크어 (덴마크)", aiLabel: "Danish (Denmark)", latinLocaleHint: "" },
    "de-DE": { label: "독일어 (독일)", aiLabel: "German (Germany)", latinLocaleHint: "german" },
    "el-GR": { label: "그리스어 (그리스)", aiLabel: "Greek (Greece)", latinLocaleHint: "" },
    "en-GB": { label: "영어 (영국)", aiLabel: "English (United Kingdom)", latinLocaleHint: "english" },
    "en-GY": { label: "영어 (가이아나)", aiLabel: "English (Guyana)", latinLocaleHint: "english" },
    "en-IE": { label: "영어 (아일랜드)", aiLabel: "English (Ireland)", latinLocaleHint: "english" },
    "es-AR": { label: "스페인어 (아르헨티나)", aiLabel: "Spanish (Argentina)", latinLocaleHint: "spanish" },
    "es-BO": { label: "스페인어 (볼리비아)", aiLabel: "Spanish (Bolivia)", latinLocaleHint: "spanish" },
    "es-CL": { label: "스페인어 (칠레)", aiLabel: "Spanish (Chile)", latinLocaleHint: "spanish" },
    "es-CO": { label: "스페인어 (콜롬비아)", aiLabel: "Spanish (Colombia)", latinLocaleHint: "spanish" },
    "es-EC": { label: "스페인어 (에콰도르)", aiLabel: "Spanish (Ecuador)", latinLocaleHint: "spanish" },
    "es-ES": { label: "스페인어 (스페인)", aiLabel: "Spanish (Spain)", latinLocaleHint: "spanish" },
    "es-PE": { label: "스페인어 (페루)", aiLabel: "Spanish (Peru)", latinLocaleHint: "spanish" },
    "es-PY": { label: "스페인어 (파라과이)", aiLabel: "Spanish (Paraguay)", latinLocaleHint: "spanish" },
    "es-UY": { label: "스페인어 (우루과이)", aiLabel: "Spanish (Uruguay)", latinLocaleHint: "spanish" },
    "es-VE": { label: "스페인어 (베네수엘라)", aiLabel: "Spanish (Venezuela)", latinLocaleHint: "spanish" },
    "fi-FI": { label: "핀란드어 (핀란드)", aiLabel: "Finnish (Finland)", latinLocaleHint: "" },
    "fr-FR": { label: "프랑스어 (프랑스)", aiLabel: "French (France)", latinLocaleHint: "french" },
    "fr-GF": { label: "프랑스어 (프랑스령 기아나)", aiLabel: "French (French Guiana)", latinLocaleHint: "french" },
    "hu-HU": { label: "헝가리어 (헝가리)", aiLabel: "Hungarian (Hungary)", latinLocaleHint: "" },
    "it-IT": { label: "이탈리아어 (이탈리아)", aiLabel: "Italian (Italy)", latinLocaleHint: "italian" },
    "nl-NL": { label: "네덜란드어 (네덜란드)", aiLabel: "Dutch (Netherlands)", latinLocaleHint: "dutch" },
    "nl-SR": { label: "네덜란드어 (수리남)", aiLabel: "Dutch (Suriname)", latinLocaleHint: "dutch" },
    "no-NO": { label: "노르웨이어 (노르웨이)", aiLabel: "Norwegian (Norway)", latinLocaleHint: "" },
    "pl-PL": { label: "폴란드어 (폴란드)", aiLabel: "Polish (Poland)", latinLocaleHint: "" },
    "pt-BR": { label: "포르투갈어 (브라질)", aiLabel: "Portuguese (Brazil)", latinLocaleHint: "portuguese" },
    "pt-PT": { label: "포르투갈어 (포르투갈)", aiLabel: "Portuguese (Portugal)", latinLocaleHint: "portuguese" },
    "ro-RO": { label: "루마니아어 (루마니아)", aiLabel: "Romanian (Romania)", latinLocaleHint: "" },
    "sk-SK": { label: "슬로바키아어 (슬로바키아)", aiLabel: "Slovak (Slovakia)", latinLocaleHint: "" },
    "sv-SE": { label: "스웨덴어 (스웨덴)", aiLabel: "Swedish (Sweden)", latinLocaleHint: "" },
    "tr-TR": { label: "터키어 (튀르키예)", aiLabel: "Turkish (Turkey)", latinLocaleHint: "" },
    "uk-UA": { label: "우크라이나어 (우크라이나)", aiLabel: "Ukrainian (Ukraine)", latinLocaleHint: "" },
  });
  let activeTypoTask = "";

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiTypoMessage(message)) {
      if (message.type === "request-ai-typo-audit-cache") {
        await postCachedTypoAuditResult();
        return;
      }

      if (message.type === "request-ai-typo-fix-cache") {
        await postCachedTypoFixResult();
        return;
      }

      if (message.type === "request-ai-typo-clear-cache") {
        await postCachedTypoClearResult();
        return;
      }

      if (message.type === "run-ai-typo-fix") {
        await withTypoTaskLock("fix", runTypoFix);
        return;
      }

      if (message.type === "run-ai-typo-clear") {
        await withTypoTaskLock("clear", runTypoClear);
        return;
      }

      await withTypoTaskLock("audit", runTypoAudit);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_TYPO_AUDIT_PATCH__ = true;

  function isAiTypoMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-typo-audit-cache" ||
        message.type === "run-ai-typo-audit" ||
        message.type === "request-ai-typo-fix-cache" ||
        message.type === "run-ai-typo-fix" ||
        message.type === "request-ai-typo-clear-cache" ||
        message.type === "run-ai-typo-clear")
    );
  }

  async function withTypoTaskLock(task, runner) {
    if (activeTypoTask) {
      if (activeTypoTask === task) {
        postTypoTaskStatus(task, "running", getTypoTaskRunningMessage(task));
      } else {
        postTypoTaskError(task, "다른 오타 작업이 이미 진행 중입니다. 현재 작업이 끝난 뒤 다시 실행해 주세요.");
      }
      return false;
    }

    activeTypoTask = task;
    try {
      await runner();
      return true;
    } finally {
      activeTypoTask = "";
    }
  }

  function getTypoTaskRunningMessage(task) {
    if (task === "fix") {
      return "오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남기는 중입니다.";
    }
    if (task === "clear") {
      return "현재 선택 범위에 남아 있는 AI 오타 주석을 정리하는 중입니다.";
    }
    return "오타 후보를 찾고 Dev Mode 주석 또는 결과 패널로 정리하는 중입니다.";
  }

  function postTypoTaskStatus(task, status, message) {
    if (task === "fix") {
      postFixStatus(status, message);
      return;
    }
    if (task === "clear") {
      postClearStatus(status, message);
      return;
    }
    postStatus(status, message);
  }

  function postTypoTaskError(task, message) {
    if (task === "fix") {
      figma.ui.postMessage({
        type: "ai-typo-fix-error",
        message,
      });
      return;
    }
    if (task === "clear") {
      figma.ui.postMessage({
        type: "ai-typo-clear-error",
        message,
      });
      return;
    }
    figma.ui.postMessage({
      type: "ai-typo-audit-error",
      message,
    });
  }

  async function runTypoAudit() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus("running", "오타 후보를 찾고 Dev Mode 주석 또는 결과 패널로 정리하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyTypoAudit(designReadResult);
      await writeTypoAuditCache(result);

      figma.ui.postMessage({
        type: "ai-typo-audit-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(
        result.summary && result.summary.mode === "figma-dev-annotation"
          ? `오타 검수 완료 (${result.summary.annotationCount}건 주석, Dev Mode에서 확인)`
          : `오타 검수 완료 (${result.summary.issueCount}건 후보, 결과 패널 확인)`,
        { timeout: 2200 }
      );
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 검수에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-audit-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runTypoFix() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postFixStatus("running", "오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남기는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyTypoFix(designReadResult);
      await writeTypoFixCache(result);

      figma.ui.postMessage({
        type: "ai-typo-fix-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(
        result.summary && result.summary.appliedCount > 0
          ? `오타 자동 수정 완료 (${result.summary.appliedCount}개 텍스트 수정, ${result.summary.annotationCount || 0}건 주석)`
          : `오타 자동 수정 완료 (${result.summary.issueCount}건 후보, 직접 수정 없음)`,
        { timeout: 2200 }
      );
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 자동 수정에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-fix-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runTypoClear() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postClearStatus("running", "현재 선택 범위에 남아 있는 AI 오타 주석을 정리하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await clearManagedTypoAnnotations(designReadResult);
      await writeTypoClearCache(result);

      figma.ui.postMessage({
        type: "ai-typo-clear-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(`오타 주석 정리 완료 (${result.summary.removedAnnotationCount || 0}건 제거)`, {
        timeout: 2200,
      });
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 주석 정리에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-clear-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  function getManagedAnnotationCategoryColor() {
    return ANNOTATION_CATEGORY_COLOR;
  }

  async function postCachedTypoAuditResult() {
    const result = await readTypoAuditCache();
    figma.ui.postMessage({
      type: "ai-typo-audit-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedTypoFixResult() {
    const result = await readTypoFixCache();
    figma.ui.postMessage({
      type: "ai-typo-fix-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedTypoClearResult() {
    const result = await readTypoClearCache();
    figma.ui.postMessage({
      type: "ai-typo-clear-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-typo-audit-status",
      status,
      message,
    });
  }

  function postFixStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-typo-fix-status",
      status,
      message,
    });
  }

  function postClearStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-typo-clear-status",
      status,
      message,
    });
  }

  async function readDesignReadCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_READ_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTypoAuditCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TYPO_AUDIT_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTypoFixCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TYPO_FIX_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTypoClearCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TYPO_CLEAR_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function writeTypoAuditCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TYPO_AUDIT_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeTypoFixCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TYPO_FIX_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeTypoClearCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TYPO_CLEAR_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  async function readProofingSettings() {
    const ai = getAiHelper();
    if (!ai || typeof ai.getAiSettingsAsync !== "function") {
      return normalizeProofingSettings(null);
    }

    try {
      return normalizeProofingSettings(await ai.getAiSettingsAsync());
    } catch (error) {
      return normalizeProofingSettings(null);
    }
  }

  function normalizeProofingSettings(value) {
    const source = value && typeof value === "object" ? value : {};
    const userDictionary = normalizeTermList(source.userDictionary);
    const protectedTerms = normalizeTermList(source.protectedTerms);
    const proofingLocale = normalizeKnownProofingLocale(source.proofingLocale);
    const localeMeta = getProofingLocaleMetadata(proofingLocale);
    return {
      proofingLocale,
      proofingLocaleLabel: localeMeta ? localeMeta.label : "",
      proofingLocaleAiLabel: localeMeta ? localeMeta.aiLabel : "",
      preferredLatinLocaleHint: localeMeta ? localeMeta.latinLocaleHint : "",
      userDictionary,
      protectedTerms,
      exactBlockedSet: new Set(userDictionary.concat(protectedTerms).map((term) => compactText(term).toLocaleLowerCase())),
      protectedTermsLower: protectedTerms.map((term) => term.toLocaleLowerCase()),
      userDictionaryLower: userDictionary.map((term) => term.toLocaleLowerCase()),
    };
  }

  function normalizeTermList(value) {
    const source = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/\r?\n|,/)
        : [];
    const normalized = [];
    const seen = new Set();

    for (const entry of source) {
      const term = String(entry || "").replace(/\s+/g, " ").trim();
      if (!term) {
        continue;
      }

      const key = term.toLocaleLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(term);
    }

    return normalized.slice(0, 200);
  }

  function normalizeKnownProofingLocale(value) {
    const compact = String(value || "")
      .replace(/[^A-Za-z-]/g, "")
      .trim();
    if (!compact) {
      return "";
    }

    const parts = compact.split("-").filter(Boolean);
    let normalized = "";
    if (parts.length === 1 && /^[A-Za-z]{2,3}$/.test(parts[0])) {
      normalized = parts[0].toLowerCase();
    } else if (parts.length === 2 && /^[A-Za-z]{2,3}$/.test(parts[0]) && /^[A-Za-z]{2,4}$/.test(parts[1])) {
      normalized = `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }

    return normalized && Object.prototype.hasOwnProperty.call(PROOFING_LOCALE_METADATA, normalized) ? normalized : "";
  }

  function getProofingLocaleMetadata(locale) {
    if (!locale || !Object.prototype.hasOwnProperty.call(PROOFING_LOCALE_METADATA, locale)) {
      return null;
    }

    return Object.assign(
      {
        code: locale,
      },
      PROOFING_LOCALE_METADATA[locale]
    );
  }

  function isWholeTextProtected(text, proofingSettings) {
    if (!proofingSettings || !(proofingSettings.exactBlockedSet instanceof Set)) {
      return false;
    }

    const key = compactText(text).toLocaleLowerCase();
    return !!key && proofingSettings.exactBlockedSet.has(key);
  }

  function issueRespectsProofingTerms(currentText, suggestion, proofingSettings) {
    if (!proofingSettings) {
      return true;
    }

    if (isWholeTextProtected(currentText, proofingSettings)) {
      return false;
    }

    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (!currentValue || !suggestionValue) {
      return true;
    }

    const guardedTerms = normalizeTermList(
      []
        .concat(proofingSettings.userDictionary || [])
        .concat(proofingSettings.protectedTerms || [])
    );

    for (const term of guardedTerms) {
      const currentExactCount = countTermOccurrences(currentValue, term, false);
      if (currentExactCount > 0) {
        if (countTermOccurrences(suggestionValue, term, false) < currentExactCount) {
          return false;
        }
        continue;
      }

      const currentLooseCount = countTermOccurrences(currentValue, term, true);
      if (currentLooseCount > countTermOccurrences(suggestionValue, term, true)) {
        return false;
      }
    }

    return true;
  }

  function filterIssuesForProofing(issues, proofingSettings) {
    if (!Array.isArray(issues) || !issues.length) {
      return [];
    }

    return issues.filter((issue) => {
      if (!issue || typeof issue !== "object") {
        return false;
      }

      return (
        !isWholeTextProtected(issue.currentText, proofingSettings) &&
        issueRespectsProofingTerms(issue.currentText, issue.suggestion, proofingSettings) &&
        changeMatchesCorrectionPolicy(issue.currentText, issue.suggestion, issue.kind)
      );
    });
  }

  function changeMatchesCorrectionPolicy(currentText, suggestion, kind) {
    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (!currentValue || !suggestionValue || currentValue === suggestionValue) {
      return false;
    }

    const kindLabels = getAnnotationKindLabels({
      currentText: currentValue,
      suggestion: suggestionValue,
      kind,
    });
    if (kindLabels.includes("용어 통일")) {
      return false;
    }

    if (countTextLines(currentValue) !== countTextLines(suggestionValue)) {
      return false;
    }

    if (isSpacingOrPunctuationOnlyCorrection(currentValue, suggestionValue)) {
      return true;
    }

    const currentFamilies = getActiveScriptFamilies(currentValue);
    const suggestionFamilies = getActiveScriptFamilies(suggestionValue);
    if (!areScriptFamiliesCompatible(currentFamilies, suggestionFamilies)) {
      return false;
    }

    return tokensLookLikeMinorCorrections(currentValue, suggestionValue, kindLabels);
  }

  function isSpacingOrPunctuationOnlyCorrection(currentText, suggestion) {
    const currentTokens = tokenizeScriptTokens(currentText);
    const suggestionTokens = tokenizeScriptTokens(suggestion);
    if (!currentTokens.length || !suggestionTokens.length) {
      return false;
    }

    return flattenComparableTokens(currentTokens) === flattenComparableTokens(suggestionTokens);
  }

  function areScriptFamiliesCompatible(currentFamilies, suggestionFamilies) {
    if (!currentFamilies.length || !suggestionFamilies.length) {
      return true;
    }

    for (const family of suggestionFamilies) {
      if (!currentFamilies.includes(family)) {
        return false;
      }
    }

    if (currentFamilies.length > 1) {
      for (const family of currentFamilies) {
        if (!suggestionFamilies.includes(family)) {
          return false;
        }
      }
    }

    return true;
  }

  function tokensLookLikeMinorCorrections(currentText, suggestion, kindLabels) {
    const currentTokens = tokenizeScriptTokens(currentText);
    const suggestionTokens = tokenizeScriptTokens(suggestion);
    const latinLocaleHint = inferLatinLocaleHint(currentText);
    if (!currentTokens.length || !suggestionTokens.length) {
      return assessDirectReplacementSafety(currentText, suggestion).safe;
    }

    if (flattenComparableTokens(currentTokens) === flattenComparableTokens(suggestionTokens)) {
      return true;
    }

    if (currentTokens.length !== suggestionTokens.length) {
      return false;
    }

    let changedCount = 0;
    let totalDistance = 0;
    for (let index = 0; index < currentTokens.length; index += 1) {
      const currentToken = currentTokens[index];
      const suggestionToken = suggestionTokens[index];
      if (currentToken.family !== suggestionToken.family) {
        return false;
      }

      if (currentToken.normalized === suggestionToken.normalized) {
        continue;
      }

      if (looksLikeLocaleSwap(currentToken, suggestionToken)) {
        return false;
      }

      const distance = getEditDistance(currentToken.normalized, suggestionToken.normalized);
      if (!isMinorTokenEdit(currentToken, suggestionToken, kindLabels, distance, latinLocaleHint)) {
        return false;
      }

      changedCount += 1;
      totalDistance += distance;
    }

    if (changedCount === 0) {
      return false;
    }

    const editBudget =
      currentTokens.length <= 4
        ? Math.max(6, currentTokens.length * 2)
        : Math.max(8, Math.ceil(currentTokens.length * 2.2));
    return totalDistance <= editBudget;
  }

  function isMinorTokenEdit(currentToken, suggestionToken, kindLabels, precomputedDistance, latinLocaleHint) {
    const currentValue = currentToken && currentToken.normalized ? currentToken.normalized : "";
    const suggestionValue = suggestionToken && suggestionToken.normalized ? suggestionToken.normalized : "";
    if (!currentValue || !suggestionValue) {
      return false;
    }

    const maxLength = Math.max(currentValue.length, suggestionValue.length, 1);
    const minLength = Math.max(1, Math.min(currentValue.length, suggestionValue.length));
    const distance =
      typeof precomputedDistance === "number" && Number.isFinite(precomputedDistance)
        ? precomputedDistance
        : getEditDistance(currentValue, suggestionValue);
    const similarity = 1 - distance / maxLength;
    const grammarMode = Array.isArray(kindLabels) && kindLabels.includes("문법");

    let allowedDistance = grammarMode ? 3 : 2;
    if (maxLength <= 4) {
      allowedDistance = grammarMode ? 2 : 1;
    } else if (maxLength >= 12) {
      allowedDistance = grammarMode ? 5 : 4;
    } else if (maxLength >= 8) {
      allowedDistance = grammarMode ? 4 : 3;
    }

    if (distance > allowedDistance) {
      return false;
    }

    if (minLength / maxLength < (grammarMode ? 0.5 : 0.62)) {
      return false;
    }

    if (similarity < (grammarMode ? 0.35 : 0.5)) {
      return false;
    }

    if (shouldRejectConservativeLatinWordSwap(currentToken, suggestionToken, kindLabels, distance, latinLocaleHint)) {
      return false;
    }

    if (currentToken.family === "latin" && currentValue.length > 2 && suggestionValue.length > 2) {
      if (currentValue[0] !== suggestionValue[0] && currentValue.slice(0, 2) !== suggestionValue.slice(0, 2)) {
        return false;
      }
    }

    return true;
  }

  function looksLikeLocaleSwap(currentToken, suggestionToken) {
    if (!currentToken || !suggestionToken || currentToken.family !== "latin" || suggestionToken.family !== "latin") {
      return false;
    }

    const currentValue = currentToken.normalized;
    const suggestionValue = suggestionToken.normalized;
    if (!currentValue || !suggestionValue || currentValue === suggestionValue) {
      return false;
    }

    return LATIN_UI_TOKEN_SET.has(currentValue) && LATIN_UI_TOKEN_SET.has(suggestionValue);
  }

  function shouldRejectConservativeLatinWordSwap(currentToken, suggestionToken, kindLabels, distance, latinLocaleHint) {
    if (!currentToken || !suggestionToken || currentToken.family !== "latin" || suggestionToken.family !== "latin") {
      return false;
    }

    const currentValue = currentToken.normalized;
    const suggestionValue = suggestionToken.normalized;
    if (!currentValue || !suggestionValue || currentValue === suggestionValue || distance <= 1) {
      return false;
    }

    if (!/^[a-z]+$/.test(currentValue) || !/^[a-z]+$/.test(suggestionValue)) {
      return false;
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("臾몃쾿")) {
      return false;
    }

    return !isKnownLatinReferenceToken(currentValue, latinLocaleHint) && !isKnownLatinReferenceToken(suggestionValue, latinLocaleHint);
  }

  function isKnownLatinReferenceToken(value, latinLocaleHint) {
    const normalized = normalizeLatinTokenForLookup(value);
    if (!normalized) {
      return false;
    }

    if (LATIN_UI_TOKEN_SET.has(normalized)) {
      return true;
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    for (const token of hintPool) {
      if (normalizeLatinTokenForLookup(token) === normalized) {
        return true;
      }
    }

    return false;
  }

  function flattenComparableTokens(tokens) {
    return (Array.isArray(tokens) ? tokens : []).map((token) => token.normalized).join("");
  }

  function tokenizeScriptTokens(text) {
    const tokens = [];
    let buffer = "";
    let family = "";

    const flush = () => {
      if (!buffer || !family) {
        buffer = "";
        family = "";
        return;
      }

      const normalized = normalizeTokenForComparison(buffer, family);
      if (normalized) {
        tokens.push({
          text: buffer,
          family,
          normalized,
        });
      }

      buffer = "";
      family = "";
    };

    for (const character of normalizeLineEndings(text)) {
      const charFamily = detectCharacterScriptFamily(character);
      if (!charFamily) {
        if (buffer && /[0-9'’\-]/.test(character)) {
          buffer += character;
          continue;
        }

        flush();
        continue;
      }

      if (!buffer) {
        buffer = character;
        family = charFamily;
        continue;
      }

      if (charFamily === family) {
        buffer += character;
        continue;
      }

      flush();
      buffer = character;
      family = charFamily;
    }

    flush();
    return tokens;
  }

  function normalizeTokenForComparison(value, family) {
    const source = String(value || "").trim();
    if (!source) {
      return "";
    }

    if (family === "latin") {
      return normalizeLatinTokenForLookup(source);
    }

    return source.replace(/[\s'’\-]/g, "");
  }

  function getActiveScriptFamilies(text) {
    const counts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      cyrillic: 0,
      arabic: 0,
      devanagari: 0,
      thai: 0,
      hebrew: 0,
      greek: 0,
      other: 0,
    };
    addScriptCounts(counts, text);
    return Object.keys(counts).filter((key) => key !== "other" && counts[key] > 0);
  }

  function countTermOccurrences(text, term, caseInsensitive) {
    const source = String(normalizeLineEndings(text) || "");
    const needle = String(term || "");
    if (!source || !needle) {
      return 0;
    }

    const haystack = caseInsensitive ? source.toLocaleLowerCase() : source;
    const target = caseInsensitive ? needle.toLocaleLowerCase() : needle;
    if (!target) {
      return 0;
    }

    let count = 0;
    let index = 0;
    while (index <= haystack.length) {
      const nextIndex = haystack.indexOf(target, index);
      if (nextIndex < 0) {
        break;
      }

      count += 1;
      index = nextIndex + target.length;
    }

    return count;
  }

  async function applyTypoAudit(designReadResult) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection);
    if (!textNodes.length) {
      throw new Error("텍스트 레이어가 포함된 선택을 먼저 선택하세요.");
    }

    const issueResult = await buildTypoIssues(textNodes, context, proofingSettings);
    const issues = issueResult.issues.slice(0, 24);
    const annotationSupported = supportsAnnotations(textNodes);
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const applied = annotationSupported
      ? applyAnnotations(textNodes, issues, category)
      : buildResultOnlyApplication(
          issues,
          "현재 환경에서는 Figma Annotation API를 사용할 수 없어 결과 패널에만 표시했습니다."
        );
    if (issueResult.aiError) {
      applied.skipped.unshift({
        label: "AI 검수 경고",
        reason: issueResult.aiError,
      });
    }
    const insights = buildInsights(context, textNodes, issues, applied, annotationSupported, issueResult.aiMeta);

    return {
      version: PATCH_VERSION,
      source: issueResult.strategy === "ai-primary" ? "ai-primary-annotation" : "local-fallback-annotation",
      mode: annotationSupported ? "figma-dev-annotation" : "result-only",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        issueCount: issues.length,
        annotatedNodeCount: applied.annotatedNodeCount,
        annotationCount: applied.annotationCount,
        clearedNodeCount: applied.clearedNodeCount,
        skippedCount: applied.skipped.length,
        mode: annotationSupported ? "figma-dev-annotation" : "result-only",
        modeLabel: annotationSupported ? "Figma Dev Mode 주석" : "결과 패널만",
        reviewStrategy: issueResult.strategy === "ai-primary" ? "AI 우선 + 로컬 보완" : "로컬 fallback",
        aiStatusLabel: issueResult.aiMeta ? issueResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: issueResult.aiMeta ? issueResult.aiMeta.providerLabel : "",
        aiModelLabel: issueResult.aiMeta ? issueResult.aiMeta.modelLabel : "",
        categoryLabel:
          annotationSupported && category && category.label ? category.label : annotationSupported ? ANNOTATION_CATEGORY_LABEL : "결과 패널만",
      },
      issues: summarizeIssueResults(issues).slice(0, 12),
      skipped: applied.skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  async function applyTypoFix(designReadResult) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection);
    if (!textNodes.length) {
      throw new Error("텍스트 레이어가 포함된 선택을 먼저 선택하세요.");
    }

    const issueResult = await buildTypoIssues(textNodes, context, proofingSettings);
    const applied = await applyDirectTextFixes(textNodes, issueResult, context, proofingSettings);
    const annotationSupported = supportsAnnotations(textNodes);
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const annotationApplied = annotationSupported
      ? applyAnnotations(textNodes, applied.annotationIssues, category)
      : applied.annotationIssues.length > 0
        ? buildResultOnlyApplication(
            applied.annotationIssues,
            "현재 환경에서는 Figma Annotation API를 사용할 수 없어 수정 결과를 패널에만 표시합니다."
          )
        : {
            applied: [],
            cleared: [],
            skipped: [],
            annotatedNodeCount: 0,
            annotationCount: 0,
            clearedNodeCount: 0,
            removedAnnotationCount: 0,
          };
    if (issueResult.aiError) {
      applied.skipped.unshift({
        label: "AI 검수 경고",
        reason: issueResult.aiError,
      });
    }
    const issues = summarizeIssueResults(issueResult.issues).slice(0, 12);
    const skipped = [...applied.skipped, ...annotationApplied.skipped];
    const insights = buildFixInsights(context, textNodes, issueResult.issues, applied, annotationApplied, issueResult.aiMeta);

    return {
      version: PATCH_VERSION,
      source: issueResult.strategy === "ai-primary" ? "ai-primary-direct-fix-annotation" : "local-fallback-direct-fix-annotation",
      mode: annotationSupported ? "direct-text-edit-with-annotation" : "direct-text-edit",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        issueCount: issueResult.issues.length,
        appliedCount: applied.appliedCount,
        unchangedCount: applied.unchangedCount,
        annotationCount: annotationApplied.annotationCount,
        annotatedNodeCount: annotationApplied.annotatedNodeCount,
        clearedNodeCount: annotationApplied.clearedNodeCount,
        skippedCount: skipped.length,
        mode: annotationSupported ? "direct-text-edit-with-annotation" : "direct-text-edit",
        modeLabel: annotationSupported ? "직접 수정 + Dev Mode 주석" : "직접 수정",
        reviewStrategy: issueResult.strategy === "ai-primary" ? "AI 우선 + 로컬 보완" : "로컬 fallback",
        aiStatusLabel: issueResult.aiMeta ? issueResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: issueResult.aiMeta ? issueResult.aiMeta.providerLabel : "",
        aiModelLabel: issueResult.aiMeta ? issueResult.aiMeta.modelLabel : "",
        categoryLabel: annotationSupported ? "직접 수정 후 Dev Mode 주석" : "직접 수정",
      },
      issues,
      applied: applied.applied.slice(0, 12),
      annotations: annotationApplied.applied.slice(0, 12),
      skipped: skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  async function clearManagedTypoAnnotations(designReadResult) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection, { includeHidden: true, includeLocked: true });
    const annotationSupported = supportsAnnotations(textNodes);
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const applied = annotationSupported
      ? applyAnnotations(textNodes, [], category)
      : buildResultOnlyApplication([], "현재 환경에서는 Figma Annotation API를 사용할 수 없어 주석을 지울 수 없습니다.");

    if (textNodes.length === 0) {
      applied.skipped.unshift({
        label: "텍스트 없음",
        reason: "선택한 범위 안에서 주석을 정리할 텍스트 레이어를 찾지 못했습니다.",
      });
    }

    const insights = buildClearInsights(context, textNodes, applied, annotationSupported);

    return {
      version: PATCH_VERSION,
      source: "managed-annotation-clear",
      mode: annotationSupported ? "annotation-clear" : "result-only",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        clearedNodeCount: applied.clearedNodeCount,
        removedAnnotationCount: applied.removedAnnotationCount || 0,
        skippedCount: applied.skipped.length,
        mode: annotationSupported ? "annotation-clear" : "result-only",
        modeLabel: annotationSupported ? "Dev Mode 주석 정리" : "결과 패널만",
        categoryLabel: annotationSupported ? "AI 오타 주석 정리" : "결과 패널만",
      },
      cleared: Array.isArray(applied.cleared) ? applied.cleared.slice(0, 12) : [],
      skipped: applied.skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  function supportsAnnotations(textNodes) {
    const sampleNode = Array.isArray(textNodes) && textNodes.length > 0 ? textNodes[0] : null;
    return !!sampleNode && "annotations" in sampleNode;
  }

  async function ensureAnnotationCategory(requestedColor) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const nextColor =
        typeof requestedColor === "string" && requestedColor.trim()
          ? requestedColor.trim().toLowerCase()
          : ANNOTATION_CATEGORY_COLOR;
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const existing = Array.isArray(categories)
        ? categories.find((category) => category && category.label === ANNOTATION_CATEGORY_LABEL)
        : null;
      if (existing) {
        if (typeof existing.setColor === "function" && existing.color !== nextColor) {
          existing.setColor(nextColor);
        }
        return existing;
      }

      if (typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
        return null;
      }

      return await figma.annotations.addAnnotationCategoryAsync({
        label: ANNOTATION_CATEGORY_LABEL,
        color: nextColor,
      });
    } catch (error) {
      return null;
    }
  }

  function applyAnnotations(textNodes, issues, category) {
    const issuesByNode = new Map();
    const applied = [];
    const cleared = [];
    const skipped = [];
    let annotatedNodeCount = 0;
    let annotationCount = 0;
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const issue of issues) {
      for (const fragment of getIssueAnnotationFragments(issue)) {
        const bucket = issuesByNode.get(fragment.node.id) || [];
        bucket.push(fragment);
        issuesByNode.set(fragment.node.id, bucket);
      }
    }

    for (const node of textNodes) {
      const nodeIssues = issuesByNode.get(node.id) || [];
      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedAnnotation(annotation, category));
        const nextAnnotations = preserved.concat(nodeIssues.map((issue) => buildAnnotation(issue, category)));
        const removedCount = Math.max(0, existing.length - preserved.length);
        if (removedCount > 0) {
          removedAnnotationCount += removedCount;
        }

        if (removedCount > 0 && nodeIssues.length === 0) {
          clearedNodeCount += 1;
          cleared.push({
            nodeId: node.id,
            nodeName: safeName(node),
            removedCount,
          });
        }

        node.annotations = nextAnnotations;

        if (nodeIssues.length > 0) {
          annotatedNodeCount += 1;
          annotationCount += nodeIssues.length;
          for (const issue of nodeIssues) {
            applied.push(formatIssueResult(issue));
          }
        }
      } catch (error) {
        if (!nodeIssues.length) {
          continue;
        }

        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "주석을 남기지 못했습니다."),
        });
      }
    }

    return {
      applied,
      cleared,
      skipped,
      annotatedNodeCount,
      annotationCount,
      clearedNodeCount,
      removedAnnotationCount,
    };
  }

  function buildResultOnlyApplication(issues, reason) {
    const skipped = [];
    if (reason) {
      skipped.push({
        label: "주석 미적용",
        reason,
      });
    }

    return {
      applied: summarizeIssueResults(issues),
      cleared: [],
      skipped,
      annotatedNodeCount: 0,
      annotationCount: 0,
      clearedNodeCount: 0,
      removedAnnotationCount: 0,
    };
  }

  async function applyDirectTextFixes(textNodes, issueResult, context, proofingSettings) {
    const issuesByNode = new Map();
    const localRepairMap = buildLocalRepairMap(textNodes, context, proofingSettings);
    const applied = [];
    const annotationIssues = [];
    const skipped = [];
    let appliedCount = 0;
    let unchangedCount = 0;

    for (const issue of issueResult.issues || []) {
      const bucket = issuesByNode.get(issue.node.id) || [];
      bucket.push(issue);
      issuesByNode.set(issue.node.id, bucket);
    }

    for (const node of textNodes) {
      const currentText = getTextValue(node);
      if (!currentText) {
        unchangedCount += 1;
        continue;
      }

      const resolution = stabilizeDirectFixResolution(
        node,
        currentText,
        resolveDirectFix(node, currentText, issuesByNode.get(node.id) || [], localRepairMap),
        localRepairMap.get(node.id) || ""
      );
      if (resolution && resolution.skipReason) {
        skipped.push({
          label: safeName(node),
          reason: resolution.skipReason,
        });
        unchangedCount += 1;
        continue;
      }
      if (!resolution || !resolution.nextText || resolution.nextText === currentText) {
        unchangedCount += 1;
        continue;
      }

      try {
        await loadFontsForTextNode(node);
        node.characters = resolution.nextText;
        appliedCount += 1;
        const appliedIssue =
          resolution.issue ||
          createIssue(node, currentText, resolution.nextText, "자동 수정", "오타 후보를 직접 수정했습니다.", resolution.source);
        for (const fragment of getIssueAnnotationFragments(appliedIssue)) {
          applied.push(formatIssueResult(fragment));
        }
        annotationIssues.push(appliedIssue);
      } catch (error) {
        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "텍스트를 직접 수정하지 못했습니다."),
        });
      }
    }

    return {
      applied,
      annotationIssues,
      skipped,
      appliedCount,
      unchangedCount,
    };
  }

  function resolveDirectFix(node, currentText, nodeIssues, localRepairMap) {
    const aiIssue = nodeIssues.find((issue) => issue && issue.source === "ai" && issue.suggestion && issue.suggestion !== currentText);
    if (aiIssue) {
      return {
        nextText: aiIssue.suggestion,
        issue: aiIssue,
        source: "ai",
      };
    }

    const localSuggestion = localRepairMap.get(node.id);
    if (localSuggestion && localSuggestion !== currentText) {
      const localIssue =
        nodeIssues.find((issue) => issue && issue.suggestion === localSuggestion) ||
        createIssue(node, currentText, localSuggestion, "자동 수정", "로컬 규칙으로 직접 수정했습니다.", "local");
      return {
        nextText: localSuggestion,
        issue: localIssue,
        source: "local",
      };
    }

    const fallbackIssue = nodeIssues.find((issue) => issue && issue.suggestion && issue.suggestion !== currentText);
    if (fallbackIssue) {
      return {
        nextText: fallbackIssue.suggestion,
        issue: fallbackIssue,
        source: fallbackIssue.source || "local",
      };
    }

    return null;
  }

  function stabilizeDirectFixResolution(node, currentText, resolution, localSuggestion) {
    if (!resolution || !currentText) {
      return resolution;
    }

    const safetyCheck = assessDirectReplacementSafety(currentText, resolution.nextText);
    const currentLineCount = countTextLines(currentText);
    const nextLineCount = countTextLines(resolution.nextText);
    const currentVisibleLines = countNonEmptyLines(currentText);
    const nextVisibleLines = countNonEmptyLines(resolution.nextText);
    const isMultiline = currentLineCount > 1 || currentVisibleLines > 1;

    if (!safetyCheck.safe) {
      if (isSafeLocalSuggestion(currentText, localSuggestion)) {
        return {
          nextText: localSuggestion,
          issue: createIssue(
            node,
            currentText,
            localSuggestion,
            "안전 교정",
            "AI 제안의 변화 폭이 커서, 더 안전한 로컬 교정만 직접 반영했습니다.",
            "local"
          ),
          source: "local",
        };
      }

      return {
        nextText: "",
        issue: null,
        source: resolution.source || "ai",
        skipReason: safetyCheck.reason,
      };
    }

    if (!isMultiline) {
      return resolution;
    }

    const lineStructureReduced = nextLineCount < currentLineCount || nextVisibleLines < currentVisibleLines;
    if (!lineStructureReduced) {
      return resolution;
    }

    if (
      localSuggestion &&
      localSuggestion !== currentText &&
      countTextLines(localSuggestion) === currentLineCount &&
      countNonEmptyLines(localSuggestion) >= currentVisibleLines
    ) {
      return {
        nextText: localSuggestion,
        issue: createIssue(
          node,
          currentText,
          localSuggestion,
          "멀티라인 보호",
          "AI 제안이 줄 구조를 줄여서, 줄 수를 유지하는 로컬 교정만 직접 반영했습니다.",
          "local"
        ),
        source: "local",
      };
    }

    return {
      nextText: "",
      issue: null,
      source: resolution.source || "ai",
      skipReason: `멀티라인 텍스트 보호: ${currentLineCount}줄 텍스트를 ${nextLineCount}줄 제안으로 바꾸려 해 자동 적용을 건너뛰었습니다.`,
    };
  }

  function countTextLines(value) {
    return normalizeLineEndings(value).split("\n").length;
  }

  function countNonEmptyLines(value) {
    return normalizeLineEndings(value)
      .split("\n")
      .filter((line) => line.replace(/\s+/g, "").length > 0).length;
  }

  function assessDirectReplacementSafety(currentText, nextText) {
    const currentCompact = compactText(currentText);
    const nextCompact = compactText(nextText);
    if (!currentCompact || !nextCompact || currentCompact === nextCompact) {
      return { safe: true, reason: "" };
    }

    const maxLength = Math.max(currentCompact.length, nextCompact.length, 1);
    const minLength = Math.max(1, Math.min(currentCompact.length, nextCompact.length));
    const similarity = 1 - getEditDistance(currentCompact, nextCompact) / maxLength;
    const lengthRatio = minLength / maxLength;

    if (lengthRatio < 0.45) {
      return {
        safe: false,
        reason: "변경 폭이 너무 커서 자동 적용을 건너뛰었습니다. 결과 패널에서 후보를 먼저 확인해 주세요.",
      };
    }

    if (similarity < 0.35) {
      return {
        safe: false,
        reason: "원문과 제안의 차이가 커서 자동 적용을 건너뛰었습니다. 결과 패널에서 후보를 먼저 확인해 주세요.",
      };
    }

    return { safe: true, reason: "" };
  }

  function isSafeLocalSuggestion(currentText, localSuggestion) {
    if (!localSuggestion || localSuggestion === currentText) {
      return false;
    }

    return assessDirectReplacementSafety(currentText, localSuggestion).safe;
  }

  function buildLocalRepairMap(textNodes, context, proofingSettings) {
    const map = new Map();

    for (const node of textNodes) {
      const original = getTextValue(node);
      if (!original) {
        continue;
      }

      if (isWholeTextProtected(original, proofingSettings)) {
        continue;
      }

      const repaired = repairTextLocally(node, original, context, []);
      if (
        repaired &&
        repaired !== original &&
        issueRespectsProofingTerms(original, repaired, proofingSettings) &&
        changeMatchesCorrectionPolicy(original, repaired, "로컬 교정")
      ) {
        map.set(node.id, repaired);
      }
    }

    return map;
  }

  function repairTextLocally(node, text, context, replacements) {
    let next = String(text || "");
    if (!next) {
      return next;
    }

    const languageFamily = detectLanguageFamilyFromText(next) || detectLanguageFamilyLabel(context && context.detectedLanguageLabel);
    const latinLocaleHint = resolveLatinTokenLocaleHint(context, next);
    next = normalizeInlineWhitespace(next);
    next = normalizePunctuationSpacing(next, languageFamily);
    next = normalizeNoSpaceScriptSpacing(next, languageFamily);
    next = normalizeRepeatedPunctuation(next);

    next = applyTypoReplacementRules(next);

    next = applyPhraseHintSuggestion(next) || next;
    next = repairLatinTokensInText(next, languageFamily, latinLocaleHint);

    for (const replacement of replacements) {
      next = replaceAllLiteral(next, replacement.variant, replacement.canonical);
    }

    return next;
  }

  function buildConsistencyReplacementMap(textNodes) {
    const replacementsByNode = new Map();

    for (const rule of CONSISTENCY_RULES) {
      const matched = [];
      for (const node of textNodes) {
        const text = compactText(getTextValue(node));
        if (!text) {
          continue;
        }

        const variant = rule.variants.find((entry) => text.includes(entry));
        if (variant) {
          matched.push({ node, variant });
        }
      }

      const hasCanonical = matched.some((entry) => entry.variant === rule.canonical);
      if (!hasCanonical) {
        continue;
      }

      for (const entry of matched) {
        if (entry.variant === rule.canonical) {
          continue;
        }

        const bucket = replacementsByNode.get(entry.node.id) || [];
        bucket.push({
          variant: entry.variant,
          canonical: rule.canonical,
        });
        replacementsByNode.set(entry.node.id, bucket);
      }
    }

    return replacementsByNode;
  }

  function replaceAllLiteral(value, search, replacement) {
    const source = String(value || "");
    const token = String(search || "");
    if (!token) {
      return source;
    }

    return source.split(token).join(String(replacement || ""));
  }

  function applyPhraseHintSuggestion(text) {
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split("\n");
    let changed = false;
    const nextLines = lines.map((line) => {
      const hint = getPhraseHintForLine(line);
      if (!hint) {
        return line;
      }

      changed = true;
      return hint.suggestion;
    });

    return changed ? nextLines.join("\n") : "";
  }

  function repairLatinTokensInText(text, languageFamily, latinLocaleHint) {
    if (languageFamily !== "latin") {
      return text;
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    if (!hintPool.length) {
      return text;
    }

    const matches = Array.from(String(text || "").matchAll(/\b[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]{3,}\b/g));
    if (!matches.length) {
      return text;
    }

    let next = String(text || "");
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const match = matches[index];
      const token = match && typeof match[0] === "string" ? match[0] : "";
      const start = match && typeof match.index === "number" ? match.index : -1;
      if (!token || start < 0) {
        continue;
      }

      const bestHint = findBestLatinTokenHint(token, latinLocaleHint);
      if (!bestHint) {
        continue;
      }

      const replacement = applyLatinTokenCase(bestHint.canonical, token);
      if (!replacement || replacement === token) {
        continue;
      }

      next = next.slice(0, start) + replacement + next.slice(start + token.length);
    }

    return next;
  }

  async function loadFontsForTextNode(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    const fontNames = collectEditableFontNames(node);
    for (const fontName of fontNames) {
      await figma.loadFontAsync(fontName);
    }
  }

  function collectEditableFontNames(node) {
    const fontNames = [];
    const seen = new Set();
    const pushFont = (fontName) => {
      if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }

      const key = `${fontName.family}::${fontName.style}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    };

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (const fontName of rangeFonts) {
          pushFont(fontName);
        }
      } catch (error) {}
    }

    if (fontNames.length === 0 && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  function summarizeIssueResults(issues) {
    if (!Array.isArray(issues)) {
      return [];
    }

    const results = [];
    for (const issue of issues) {
      for (const fragment of getIssueAnnotationFragments(issue)) {
        results.push(formatIssueResult(fragment));
      }
    }
    return results;
  }

  function formatIssueResult(issue) {
    return {
      id: issue && issue.node ? issue.node.id : "",
      nodeName: safeName(issue && issue.node),
      currentText: previewVisibleText(issue && issue.currentText ? issue.currentText : "", 72),
      suggestion: previewVisibleText(issue && issue.suggestion ? issue.suggestion : "", 72),
      reason: issue && issue.reason ? issue.reason : "",
      kind: issue && issue.kind ? issue.kind : "오타",
      source: issue && issue.source ? issue.source : "local",
    };
  }

  function buildAnnotation(issue, category) {
    const kindLabels = getAnnotationKindLabels(issue);
    const label = [
      `[Pigma Ai Audit] ${kindLabels.join(", ")}`,
      `전 : ${previewText(issue.currentText, 72)}`,
      `후 : ${previewText(issue.suggestion, 72)}`,
      `이유 : ${buildAnnotationReason(issue, kindLabels)}`,
    ].join("\n");

    return category && category.id
      ? {
          label,
          categoryId: category.id,
        }
      : {
          label,
        };
  }

  function isManagedAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label = typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return LEGACY_ANNOTATION_PREFIXES.some((prefix) => label.startsWith(prefix));
  }

  function getAnnotationKindLabels(issue) {
    const tokens = String(issue && issue.kind ? issue.kind : "")
      .split(/[,+/|]/)
      .map((token) => token.trim())
      .filter(Boolean);
    const resolved = [];

    for (const token of tokens) {
      const label = normalizeAnnotationKindLabel(token, issue);
      if (label && !resolved.includes(label)) {
        resolved.push(label);
      }
    }

    if (resolved.length > 0) {
      return resolved;
    }

    return [inferAnnotationKindFromIssue(issue)];
  }

  function normalizeAnnotationKindLabel(kind, issue) {
    const raw = String(kind || "").trim();
    if (!raw) {
      return "";
    }

    const compact = raw.replace(/\s+/g, "");
    const lower = compact.toLowerCase();

    if (
      compact.includes("띄어쓰기") ||
      compact.includes("공백") ||
      lower.includes("space") ||
      lower.includes("whitespace")
    ) {
      return "띄어쓰기";
    }

    if (compact.includes("문법") || lower.includes("grammar")) {
      return "문법";
    }

    if (compact.includes("문장부호") || lower.includes("punct")) {
      return "문장부호";
    }

    if (
      compact.includes("용어통일") ||
      compact.includes("표기통일") ||
      compact.includes("일관성") ||
      lower.includes("terminology") ||
      lower.includes("consisten")
    ) {
      return "용어 통일";
    }

    if (
      compact.includes("오타") ||
      compact.includes("철자") ||
      compact.includes("자동수정") ||
      compact.includes("안전교정") ||
      compact.includes("멀티라인보호") ||
      lower.includes("spell") ||
      lower.includes("typo")
    ) {
      return "철자";
    }

    return inferAnnotationKindFromIssue(issue);
  }

  function inferAnnotationKindFromIssue(issue) {
    const currentText = String(issue && issue.currentText ? issue.currentText : "");
    const suggestion = String(issue && issue.suggestion ? issue.suggestion : "");
    const currentNoSpace = currentText.replace(/\s+/g, "");
    const suggestionNoSpace = suggestion.replace(/\s+/g, "");
    if (currentNoSpace && currentNoSpace === suggestionNoSpace) {
      return "띄어쓰기";
    }

    const currentNoPunctuation = currentText.replace(/[.,!?;:'"()\-_[\]{}]/g, "");
    const suggestionNoPunctuation = suggestion.replace(/[.,!?;:'"()\-_[\]{}]/g, "");
    if (currentNoPunctuation && currentNoPunctuation === suggestionNoPunctuation) {
      return "문장부호";
    }

    return "철자";
  }

  function buildAnnotationReason(issue, kindLabels) {
    const explicitReason = String(issue && issue.reason ? issue.reason : "").trim();
    if (explicitReason) {
      return explicitReason;
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("용어 통일")) {
      return "같은 용어를 다른 말로 바꾸지 않도록 유지했습니다.";
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("띄어쓰기")) {
      return "띄어쓰기를 바로잡았습니다.";
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("문법")) {
      return "문법상 어색한 부분을 바로잡았습니다.";
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("문장부호")) {
      return "문장부호를 바로잡았습니다.";
    }
    return "명백한 오타를 바로잡았습니다.";
  }

  function getIssueAnnotationFragments(issue) {
    if (!issue || !issue.node) {
      return [];
    }

    if (issue.annotationFragment === true) {
      return [issue];
    }

    if (Array.isArray(issue.annotationFragments) && issue.annotationFragments.length > 0) {
      return issue.annotationFragments;
    }

    const fragments = buildIssueAnnotationFragments(issue);
    issue.annotationFragments = fragments.length > 0 ? fragments : [createFallbackIssueFragment(issue)];
    return issue.annotationFragments;
  }

  function buildIssueAnnotationFragments(issue) {
    const currentText = normalizeLineEndings(issue && issue.currentText ? issue.currentText : "");
    const suggestion = normalizeLineEndings(issue && issue.suggestion ? issue.suggestion : "");
    if (!currentText && !suggestion) {
      return [];
    }

    const currentLines = currentText.split("\n");
    const suggestionLines = suggestion.split("\n");
    const fragments = [];

    if (currentLines.length === suggestionLines.length) {
      for (let index = 0; index < currentLines.length; index += 1) {
        if (currentLines[index] === suggestionLines[index]) {
          continue;
        }

        fragments.push(...buildPairIssueFragments(issue, currentLines[index], suggestionLines[index]));
      }
    } else {
      fragments.push(...buildPairIssueFragments(issue, currentText, suggestion));
    }

    return fragments.filter(Boolean);
  }

  function buildPairIssueFragments(issue, currentText, suggestion) {
    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (currentValue === suggestionValue) {
      return [];
    }

    const clusters = buildDiffClusters(currentValue, suggestionValue);
    if (!clusters.length) {
      return [createFallbackIssueFragment(issue, currentValue, suggestionValue)];
    }

    return clusters.map((cluster, index) =>
      createIssueFragmentFromCluster(issue, currentValue, suggestionValue, cluster, index, clusters.length)
    );
  }

  function buildDiffClusters(currentText, suggestion) {
    const left = String(currentText || "");
    const right = String(suggestion || "");
    if (left === right) {
      return [];
    }

    if (left.length * right.length > 120000) {
      return [buildFallbackDiffCluster(left, right)];
    }

    const segments = buildDiffSegments(left, right);
    if (!segments.length) {
      return [buildFallbackDiffCluster(left, right)];
    }

    const clusters = [];
    let currentCluster = null;

    for (const segment of segments) {
      if (segment.type === "equal") {
        if (!currentCluster) {
          continue;
        }

        if (shouldMergeDiffBridge(segment.text)) {
          currentCluster.leftEnd = segment.leftEnd;
          currentCluster.rightEnd = segment.rightEnd;
          continue;
        }

        clusters.push(currentCluster);
        currentCluster = null;
        continue;
      }

      if (!currentCluster) {
        currentCluster = {
          leftStart: segment.leftStart,
          leftEnd: segment.leftEnd,
          rightStart: segment.rightStart,
          rightEnd: segment.rightEnd,
        };
        continue;
      }

      currentCluster.leftEnd = segment.leftEnd;
      currentCluster.rightEnd = segment.rightEnd;
    }

    if (currentCluster) {
      clusters.push(currentCluster);
    }

    return clusters.length ? clusters : [buildFallbackDiffCluster(left, right)];
  }

  function buildDiffSegments(currentText, suggestion) {
    const leftChars = String(currentText || "").split("");
    const rightChars = String(suggestion || "").split("");
    const rows = leftChars.length + 1;
    const cols = rightChars.length + 1;
    const table = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let row = 0; row < rows; row += 1) {
      table[row][0] = row;
    }

    for (let col = 0; col < cols; col += 1) {
      table[0][col] = col;
    }

    for (let row = 1; row < rows; row += 1) {
      for (let col = 1; col < cols; col += 1) {
        if (leftChars[row - 1] === rightChars[col - 1]) {
          table[row][col] = table[row - 1][col - 1];
        } else {
          table[row][col] = Math.min(table[row - 1][col - 1], table[row - 1][col], table[row][col - 1]) + 1;
        }
      }
    }

    const raw = [];
    let row = leftChars.length;
    let col = rightChars.length;
    while (row > 0 || col > 0) {
      if (row > 0 && col > 0 && leftChars[row - 1] === rightChars[col - 1]) {
        raw.push({ type: "equal", leftText: leftChars[row - 1], rightText: rightChars[col - 1] });
        row -= 1;
        col -= 1;
        continue;
      }

      const replaceCost = row > 0 && col > 0 ? table[row - 1][col - 1] : Number.POSITIVE_INFINITY;
      const deleteCost = row > 0 ? table[row - 1][col] : Number.POSITIVE_INFINITY;
      const insertCost = col > 0 ? table[row][col - 1] : Number.POSITIVE_INFINITY;
      const bestCost = Math.min(replaceCost, deleteCost, insertCost);

      if (row > 0 && col > 0 && replaceCost === bestCost) {
        raw.push({ type: "replace", leftText: leftChars[row - 1], rightText: rightChars[col - 1] });
        row -= 1;
        col -= 1;
      } else if (row > 0 && deleteCost === bestCost) {
        raw.push({ type: "delete", leftText: leftChars[row - 1], rightText: "" });
        row -= 1;
      } else {
        raw.push({ type: "insert", leftText: "", rightText: rightChars[col - 1] });
        col -= 1;
      }
    }

    raw.reverse();

    const segments = [];
    let leftOffset = 0;
    let rightOffset = 0;
    for (const entry of raw) {
      const leftText = entry.leftText || "";
      const rightText = entry.rightText || "";
      const previous = segments[segments.length - 1];
      if (previous && previous.type === entry.type) {
        previous.leftText += leftText;
        previous.rightText += rightText;
        previous.leftEnd += leftText.length;
        previous.rightEnd += rightText.length;
        previous.text = previous.type === "equal" ? previous.leftText : "";
      } else {
        segments.push({
          type: entry.type,
          text: entry.type === "equal" ? leftText : "",
          leftText,
          rightText,
          leftStart: leftOffset,
          leftEnd: leftOffset + leftText.length,
          rightStart: rightOffset,
          rightEnd: rightOffset + rightText.length,
        });
      }

      leftOffset += leftText.length;
      rightOffset += rightText.length;
    }

    return segments;
  }

  function shouldMergeDiffBridge(value) {
    const text = String(value || "");
    return !!text && text.length <= 4 && !/[\s.,!?;:()[\]{}"'“”‘’<>]/.test(text);
  }

  function buildFallbackDiffCluster(currentText, suggestion) {
    const left = String(currentText || "");
    const right = String(suggestion || "");
    let prefix = 0;
    while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
      prefix += 1;
    }

    let suffix = 0;
    while (
      suffix < left.length - prefix &&
      suffix < right.length - prefix &&
      left[left.length - suffix - 1] === right[right.length - suffix - 1]
    ) {
      suffix += 1;
    }

    return {
      leftStart: prefix,
      leftEnd: Math.max(prefix, left.length - suffix),
      rightStart: prefix,
      rightEnd: Math.max(prefix, right.length - suffix),
    };
  }

  function createIssueFragmentFromCluster(issue, currentText, suggestion, cluster, index, total) {
    const snippetCurrent = buildSnippetForCluster(currentText, cluster.leftStart, cluster.leftEnd);
    const snippetSuggestion = buildSnippetForCluster(suggestion, cluster.rightStart, cluster.rightEnd);
    const changeCurrent = currentText.slice(cluster.leftStart, cluster.leftEnd);
    const changeSuggestion = suggestion.slice(cluster.rightStart, cluster.rightEnd);
    return {
      node: issue.node,
      currentText: snippetCurrent,
      suggestion: snippetSuggestion,
      kind: issue.kind,
      reason: buildDetailedFragmentReason(issue, changeCurrent, changeSuggestion),
      source: issue.source || "local",
      annotationFragment: true,
      fragmentIndex: index,
      fragmentCount: total,
    };
  }

  function createFallbackIssueFragment(issue, currentText, suggestion) {
    const currentValue = typeof currentText === "string" ? currentText : String(issue && issue.currentText ? issue.currentText : "");
    const suggestionValue = typeof suggestion === "string" ? suggestion : String(issue && issue.suggestion ? issue.suggestion : "");
    return {
      node: issue.node,
      currentText: currentValue,
      suggestion: suggestionValue,
      kind: issue.kind,
      reason: buildDetailedFragmentReason(issue, currentValue, suggestionValue),
      source: issue.source || "local",
      annotationFragment: true,
      fragmentIndex: 0,
      fragmentCount: 1,
    };
  }

  function buildSnippetForCluster(text, start, end) {
    const value = normalizeLineEndings(text);
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const nextBreak = value.indexOf("\n", end);
    const lineEnd = nextBreak >= 0 ? nextBreak : value.length;
    if (lineEnd - lineStart <= 48) {
      return value.slice(lineStart, lineEnd);
    }

    const contextStart = findSnippetStart(value, start, lineStart);
    const contextEnd = findSnippetEnd(value, end, lineEnd);
    const prefix = contextStart > lineStart ? "..." : "";
    const suffix = contextEnd < lineEnd ? "..." : "";
    return `${prefix}${value.slice(contextStart, contextEnd)}${suffix}`;
  }

  function findSnippetStart(text, start, lineStart) {
    const min = Math.max(lineStart, start - 18);
    for (let index = start - 1; index >= min; index -= 1) {
      if (/\s/.test(text[index])) {
        return index + 1;
      }
    }

    return min;
  }

  function findSnippetEnd(text, end, lineEnd) {
    const max = Math.min(lineEnd, end + 18);
    for (let index = end; index < max; index += 1) {
      if (/\s/.test(text[index])) {
        return index;
      }
    }

    return max;
  }

  function buildDetailedFragmentReason(issue, currentText, suggestion) {
    const currentValue = String(currentText || "");
    const suggestionValue = String(suggestion || "");
    const kindLabels = getAnnotationKindLabels(issue);

    if (!currentValue && suggestionValue) {
      if (isWhitespaceOnly(suggestionValue) || kindLabels.includes("띄어쓰기")) {
        return `띄어쓰기 ${formatReasonToken(suggestionValue)} 추가`;
      }

      if (isPunctuationOnly(suggestionValue) || kindLabels.includes("문장부호")) {
        return `문장부호 ${formatReasonToken(suggestionValue)} 추가`;
      }

      return `오타 ${formatReasonToken(suggestionValue)} 소실`;
    }

    if (currentValue && !suggestionValue) {
      if (isWhitespaceOnly(currentValue) || kindLabels.includes("띄어쓰기")) {
        return `띄어쓰기 ${formatReasonToken(currentValue)} 제거`;
      }

      if (isPunctuationOnly(currentValue) || kindLabels.includes("문장부호")) {
        return `문장부호 ${formatReasonToken(currentValue)} 제거`;
      }

      return `불필요한 ${formatReasonToken(currentValue)} 제거`;
    }

    if (kindLabels.includes("용어 통일")) {
      return `표현 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 통일`;
    }

    if (kindLabels.includes("문법")) {
      return `문법 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 교정`;
    }

    if (
      kindLabels.includes("띄어쓰기") ||
      isWhitespaceOnly(currentValue) ||
      isWhitespaceOnly(suggestionValue) ||
      collapseWhitespace(currentValue) === collapseWhitespace(suggestionValue)
    ) {
      return `띄어쓰기 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 조정`;
    }

    if (kindLabels.includes("문장부호") || isPunctuationOnly(currentValue) || isPunctuationOnly(suggestionValue)) {
      return `문장부호 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 교정`;
    }

    return `오타 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 교정`;
  }

  function formatReasonToken(value) {
    const text = normalizeLineEndings(value);
    if (!text) {
      return "[empty]";
    }

    if (text === " ") {
      return "[ ]";
    }

    if (text === "\t") {
      return "[tab]";
    }

    if (text === "\n") {
      return "[\\n]";
    }

    return `[${previewText(text, 24)}]`;
  }

  function isWhitespaceOnly(value) {
    return !!String(value || "") && !/\S/.test(String(value || ""));
  }

  function isPunctuationOnly(value) {
    return !!String(value || "") && /^[.,!?;:()[\]{}"'“”‘’<>،؛؟。、，．！？：；-]+$/.test(String(value || ""));
  }

  function collapseWhitespace(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  async function buildTypoIssues(textNodes, context, proofingSettings) {
    const issues = [];
    const seen = new Set();
    let aiError = "";
    const aiPromise = requestAiTypoIssues(textNodes, context, proofingSettings);
    const localIssues = [];

    for (const node of textNodes) {
      const text = getTextValue(node);
      if (!text) {
        continue;
      }

      if (isWholeTextProtected(text, proofingSettings)) {
        continue;
      }

      for (const issue of collectRuleIssues(node, text, context)) {
        if (
          issueRespectsProofingTerms(issue.currentText, issue.suggestion, proofingSettings) &&
          changeMatchesCorrectionPolicy(issue.currentText, issue.suggestion, issue.kind)
        ) {
          localIssues.push(issue);
        }
      }
    }

    const aiResult = await aiPromise;
    aiResult.issues = filterIssuesForProofing(aiResult.issues, proofingSettings);
    aiError = aiResult.aiError || "";
    const useAiPrimary = Array.isArray(aiResult.issues) && aiResult.issues.length > 0;
    const primaryIssues = useAiPrimary ? aiResult.issues : localIssues;
    const secondaryIssues = useAiPrimary ? localIssues : [];

    for (const issue of primaryIssues) {
      pushUniqueIssue(issues, seen, issue);
    }

    for (const issue of secondaryIssues) {
      pushUniqueIssue(issues, seen, issue);
    }

    return {
      issues: mergeIssuesByNode(issues),
      aiError,
      strategy: useAiPrimary ? "ai-primary" : "local-fallback",
      aiMeta: aiResult.aiMeta || createAiMeta("unknown", "", "", ""),
    };
  }

  function pushUniqueIssue(target, seen, issue) {
    if (!issue || !issue.node || !issue.node.id) {
      return;
    }

    const key = `${issue.node.id}:${issue.suggestion}:${issue.reason}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    target.push(issue);
  }

  function mergeIssuesByNode(issues) {
    if (!Array.isArray(issues) || !issues.length) {
      return [];
    }

    const grouped = new Map();
    for (const issue of issues) {
      if (!issue || !issue.node || !issue.node.id) {
        continue;
      }

      const bucket = grouped.get(issue.node.id) || [];
      bucket.push(issue);
      grouped.set(issue.node.id, bucket);
    }

    const merged = [];
    for (const nodeIssues of grouped.values()) {
      merged.push(mergeNodeIssues(nodeIssues));
    }

    return merged.filter(Boolean);
  }

  function mergeNodeIssues(nodeIssues) {
    const sourceIssues = Array.isArray(nodeIssues) ? nodeIssues.filter(Boolean) : [];
    if (!sourceIssues.length) {
      return null;
    }

    if (sourceIssues.length === 1) {
      return sourceIssues[0];
    }

    const baseIssue = sourceIssues[0];
    const baseText = normalizeLineEndings(baseIssue.currentText);
    if (!baseText) {
      return baseIssue;
    }

    const accepted = [];
    let order = 0;
    for (const issue of sourceIssues) {
      if (!issue || normalizeLineEndings(issue.currentText) !== baseText) {
        continue;
      }

      const clusters = buildDiffClusters(baseText, issue.suggestion);
      if (!clusters.length) {
        continue;
      }

      for (const cluster of clusters) {
        const candidate = {
          leftStart: cluster.leftStart,
          leftEnd: cluster.leftEnd,
          rightText: issue.suggestion.slice(cluster.rightStart, cluster.rightEnd),
          issue,
          order: order++,
        };
        if (hasConflictingMergedCluster(accepted, candidate)) {
          continue;
        }

        accepted.push(candidate);
      }
    }

    if (!accepted.length) {
      return baseIssue;
    }

    if (accepted.length === 1 && sourceIssues.length > 0) {
      return accepted[0].issue || baseIssue;
    }

    accepted.sort((left, right) => left.leftStart - right.leftStart || left.order - right.order);

    let mergedText = "";
    let cursor = 0;
    for (const entry of accepted) {
      mergedText += baseText.slice(cursor, entry.leftStart);
      mergedText += entry.rightText;
      cursor = entry.leftEnd;
    }
    mergedText += baseText.slice(cursor);

    if (!mergedText || mergedText === baseText) {
      return baseIssue;
    }

    const fragments = accepted
      .map((entry) => buildPairIssueFragments(entry.issue, baseText.slice(entry.leftStart, entry.leftEnd), entry.rightText)[0] || null)
      .filter(Boolean);
    const mergedIssue = createIssue(
      baseIssue.node,
      baseText,
      mergedText,
      accepted.some((entry) => entry.issue && entry.issue.kind === "臾몃쾿") ? "臾몃쾿" : baseIssue.kind,
      "같은 텍스트 노드의 여러 언어 교정 후보를 함께 병합했습니다.",
      accepted.some((entry) => entry.issue && entry.issue.source === "ai") ? "ai" : baseIssue.source || "local"
    );
    if (fragments.length > 0) {
      mergedIssue.annotationFragments = fragments;
    }

    return mergedIssue;
  }

  function hasConflictingMergedCluster(accepted, candidate) {
    for (const entry of accepted) {
      const leftOverlaps = candidate.leftStart < entry.leftEnd && entry.leftStart < candidate.leftEnd;
      const sameInsertionPoint =
        candidate.leftStart === candidate.leftEnd &&
        entry.leftStart === entry.leftEnd &&
        candidate.leftStart === entry.leftStart;
      if (leftOverlaps || sameInsertionPoint) {
        return true;
      }
    }

    return false;
  }

  function buildAiTypoCandidates(textNodes, proofingSettings) {
    const candidates = [];

    for (const node of textNodes) {
      const text = String(getTextValue(node) || "");
      if (!text) {
        continue;
      }

      if (isWholeTextProtected(text, proofingSettings)) {
        continue;
      }

      for (const candidate of splitTextNodeIntoAiTypoCandidates(node, text)) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  function splitTextNodeIntoAiTypoCandidates(node, text) {
    const currentText = normalizeLineEndings(text);
    const lines = currentText.split("\n");
    const nonEmptyLineIndexes = [];

    for (let index = 0; index < lines.length; index += 1) {
      if (compactText(lines[index])) {
        nonEmptyLineIndexes.push(index);
      }
    }

    if (nonEmptyLineIndexes.length <= 1) {
      return [
        {
          id: node.id,
          node,
          nodeId: node.id,
          name: safeName(node),
          text: currentText,
          currentText,
          scope: "node",
        },
      ];
    }

    return nonEmptyLineIndexes.map((lineIndex) => ({
      id: `${node.id}::line:${lineIndex}`,
      node,
      nodeId: node.id,
      name: safeName(node),
      text: lines[lineIndex],
      currentText,
      scope: "line",
      lineIndex,
    }));
  }

  function applyAiTypoCandidateSuggestion(candidate, suggestion) {
    if (!candidate || typeof candidate !== "object") {
      return "";
    }

    const currentText = normalizeLineEndings(candidate.currentText || "");
    const suggestionText = normalizeLineEndings(suggestion);
    if (!currentText || !suggestionText) {
      return "";
    }

    if (candidate.scope !== "line") {
      return suggestionText;
    }

    if (countTextLines(suggestionText) !== 1 || typeof candidate.lineIndex !== "number") {
      return "";
    }

    const lines = currentText.split("\n");
    if (candidate.lineIndex < 0 || candidate.lineIndex >= lines.length) {
      return "";
    }

    lines[candidate.lineIndex] = suggestionText;
    return lines.join("\n");
  }

  async function requestAiTypoIssues(textNodes, context, proofingSettings) {
    const ai = getAiHelper();
    if (!ai) {
      return { issues: [], aiError: "", aiMeta: createAiMeta("unavailable", "", "", "AI helper unavailable") };
    }

    let configured = false;
    let runInfo = { provider: "", model: "" };
    try {
      configured = await ai.hasConfiguredAiAsync();
      if (typeof ai.getAiSettingsAsync === "function" && typeof ai.getResolvedRunInfo === "function") {
        const settings = await ai.getAiSettingsAsync();
        runInfo = ai.getResolvedRunInfo(settings, { modelByProvider: TYPO_AUDIT_MODEL_BY_PROVIDER });
      }
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      return {
        issues: [],
        aiError: "AI 설정이 꺼져 있거나 API 키가 없어 로컬 규칙만 사용했습니다.",
        aiMeta: createAiMeta("not-configured", runInfo.provider, runInfo.model, "AI 설정이 비어 있습니다."),
      };
    }

    const candidates = buildAiTypoCandidates(textNodes, proofingSettings);

    if (!candidates.length) {
      return {
        issues: [],
        aiError: "",
        aiMeta: createAiMeta("skipped", runInfo.provider, runInfo.model, "검수할 텍스트 후보가 없습니다."),
      };
    }

    const schema = {
      type: "object",
      properties: {
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              suggestion: { type: "string" },
              reason: { type: "string" },
              kind: { type: "string" },
            },
            required: ["id", "suggestion", "reason", "kind"],
          },
        },
      },
      required: ["issues"],
    };
    const instructions =
      "You review UI copy inside a Figma plugin. Detect only obvious spelling mistakes, broken words, malformed polite endings, spacing errors, punctuation errors, and clearly broken grammar. Be conservative: if a word is already a valid standard word in its language, keep it unless the surrounding sentence is clearly wrong with that exact word. Never replace one valid word with another valid word just because the spellings are similar. Example: keep 'optimal motion' unchanged and never change it to 'optional motion'. Preserve the original language, script, wording, product naming, and marketing intent of each string. Do not translate, localize, rewrite into the dominant language of the screen, unify terminology, smooth tone, or replace brand/product names unless the product name itself has an obvious typo. In mixed-language strings, preserve every language segment as-is and only fix the clearly broken part inside that same language segment. Some textNodes are full node strings, while others are single extracted lines from a multiline node. If an item is a single extracted line, return a corrected single line only and do not rewrite neighboring lines. If preferredLocaleHint is provided, use it only for Latin-script nodes or segments that actually fit that locale. Do not suppress Korean, English, or other script corrections just because another preferred locale is set. If latinLocaleHint is provided, keep corrections inside that locale only for matching Latin-script segments. Example: German copy with an English brand should stay mixed as needed: 'Find e deine perfekte Work-Life-Balanfce mit LG' -> 'Finde deine perfekte Work-Life-Balance mit LG', 'Jedtazt kaufenq' -> 'Jetzt kaufen', while keeping 'LG' untouched. Return the full corrected string in suggestion for the given item, never only a changed token. If the original text contains multiple lines, preserve every line and keep the same line count unless the user text itself clearly intends a merge. Never drop unrelated lower lines. Never edit any protectedTerms under any circumstances. Never mark userDictionary terms as mistakes. Example: '방갑스비난.' should be corrected to the full string '반갑습니다.' If the text looks fine, omit it. Return concise reasons in Korean when possible.";
    const payload = {
      languageHint: context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "?먮룞 媛먯?",
      preferredLocaleHint: context.proofingLocale || "",
      preferredLocaleLabel: context.proofingLocaleAiLabel || context.proofingLocaleLabel || "",
      languageFamilyHint: detectLanguageFamilyLabel(context.detectedLanguageLabel || context.languageLabel || ""),
      contextLabel: context.contextLabel,
      latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(candidates.map((entry) => entry.text).join("\n")),
      userDictionary: proofingSettings ? proofingSettings.userDictionary : [],
      protectedTerms: proofingSettings ? proofingSettings.protectedTerms : [],
      textNodes: candidates.slice(0, 48).map((entry) => ({
        id: entry.id,
        name: entry.name,
        text: entry.text,
        lineCount: countTextLines(entry.text),
        lines: String(entry.text || "").split(/\r?\n/),
        scriptFamilies: getActiveScriptFamilies(entry.text),
        mixedLanguage: getActiveScriptFamilies(entry.text).length > 1,
        latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(entry.text),
        segmentScope: entry.scope || "node",
        lineIndex: typeof entry.lineIndex === "number" ? entry.lineIndex : -1,
      })),
    };

    try {
      let response = null;

      try {
        response = await ai.requestJsonTask({
        instructions: instructions ||
          "You review UI copy inside a Figma plugin. Detect only obvious spelling mistakes, broken words, malformed polite endings, spacing errors, punctuation errors, and clearly broken grammar. Preserve the original language, script, wording, and product naming of each string. Do not translate, localize, rewrite into the dominant language of the screen, unify terminology, smooth tone, or replace brand/product names unless the product name itself has an obvious typo. In mixed-language strings, preserve every language segment as-is and only fix the clearly broken part inside that same language segment. If preferredLocaleHint is provided, treat it as the primary locale/country hint. If latinLocaleHint is provided, keep corrections inside that locale. Example: German copy with an English brand should stay mixed as needed: 'Find e deine perfekte Work-Life-Balanfce mit LG' -> 'Finde deine perfekte Work-Life-Balance mit LG', 'Jedtazt kaufenq' -> 'Jetzt kaufen', while keeping 'LG' untouched. Return the full corrected string in suggestion, never only a changed token. If the original text contains multiple lines, preserve every line and keep the same line count unless the user text itself clearly intends a merge. Never drop unrelated lower lines. Never edit any protectedTerms under any circumstances. Never mark userDictionary terms as mistakes. Example: '방갑스비난.' should be corrected to the full string '반갑습니다.' If the text looks fine, omit it. Return concise reasons in Korean when possible.",
        schema: schema,
        payload: payload || {
          languageHint:
            context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지",
          preferredLocaleHint: context.proofingLocale || "",
          preferredLocaleLabel: context.proofingLocaleAiLabel || context.proofingLocaleLabel || "",
          languageFamilyHint: detectLanguageFamilyLabel(context.detectedLanguageLabel || context.languageLabel || ""),
          contextLabel: context.contextLabel,
          latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(candidates.map((entry) => entry.text).join("\n")),
          userDictionary: proofingSettings ? proofingSettings.userDictionary : [],
          protectedTerms: proofingSettings ? proofingSettings.protectedTerms : [],
          textNodes: candidates.slice(0, 48).map((entry) => ({
            id: entry.id,
            name: entry.name,
            text: entry.text,
            lineCount: countTextLines(entry.text),
            lines: String(entry.text || "").split(/\r?\n/),
            scriptFamilies: getActiveScriptFamilies(entry.text),
            mixedLanguage: getActiveScriptFamilies(entry.text).length > 1,
            latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(entry.text),
            segmentScope: entry.scope || "node",
            lineIndex: typeof entry.lineIndex === "number" ? entry.lineIndex : -1,
          })),
        },
        modelByProvider: TYPO_AUDIT_MODEL_BY_PROVIDER,
      });
      } catch (error) {
        if (!shouldRetryTypoAuditWithDefaultModel(error)) {
          throw error;
        }

        response = await ai.requestJsonTask({
          instructions,
          schema,
          payload,
        });
      }

      const rows = response && Array.isArray(response.issues) ? response.issues : [];
      const candidateMap = new Map();
      for (const candidate of candidates) {
        candidateMap.set(candidate.id, candidate);
      }

      const results = [];
      for (const row of rows) {
        if (!row || typeof row !== "object" || typeof row.id !== "string" || typeof row.suggestion !== "string") {
          continue;
        }

        const candidate = candidateMap.get(row.id);
        if (!candidate || !candidate.node) {
          continue;
        }

        const node = candidate.node;
        const currentText = normalizeLineEndings(candidate.currentText || "");
        const suggestion = applyAiTypoCandidateSuggestion(candidate, String(row.suggestion || ""));
        if (!currentText || !suggestion || compactText(currentText) === compactText(suggestion)) {
          continue;
        }

        const kind = typeof row.kind === "string" && row.kind.trim() ? row.kind.trim() : "AI 검수";
        if (!changeMatchesCorrectionPolicy(currentText, suggestion, kind)) {
          continue;
        }

        results.push(createIssue(node, currentText, suggestion, kind, typeof row.reason === "string" && row.reason.trim() ? row.reason.trim() : "AI 검수 후보", "ai"));
      }

      return {
        issues: results,
        aiError: "",
        aiMeta: createAiMeta("success", response && response._provider ? response._provider : runInfo.provider, response && response._model ? response._model : runInfo.model, ""),
      };
    } catch (error) {
      const message = normalizeErrorMessage(error, "AI 오타 검수 호출에 실패했습니다.");
      return {
        issues: [],
        aiError: message,
        aiMeta: createAiMeta("error", runInfo.provider, runInfo.model, message),
      };
    }
  }

  function shouldRetryTypoAuditWithDefaultModel(error) {
    const compact = String(normalizeErrorMessage(error, "") || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (!compact || !compact.includes("model")) {
      return false;
    }

    return (
      compact.includes("does not exist") ||
      compact.includes("not found") ||
      compact.includes("unsupported") ||
      compact.includes("not supported") ||
      compact.includes("invalid model") ||
      compact.includes("permission") ||
      compact.includes("access") ||
      compact.includes("not available") ||
      compact.includes("unavailable")
    );
  }

  function createAiMeta(status, provider, model, error) {
    const normalizedStatus = String(status || "unknown");
    const providerLabel = provider ? String(provider) : "provider 미확인";
    const modelLabel = model ? String(model) : "model 미확인";
    let statusLabel = "AI 상태 미확인";

    if (normalizedStatus === "success") {
      statusLabel = "AI 호출 성공";
    } else if (normalizedStatus === "error") {
      statusLabel = "AI 호출 실패";
    } else if (normalizedStatus === "not-configured") {
      statusLabel = "AI 설정 없음";
    } else if (normalizedStatus === "skipped") {
      statusLabel = "AI 호출 건너뜀";
    } else if (normalizedStatus === "unavailable") {
      statusLabel = "AI helper 없음";
    }

    return {
      status: normalizedStatus,
      statusLabel,
      providerLabel,
      modelLabel,
      error: error ? String(error) : "",
    };
  }

  function collectRuleIssues(node, text, context) {
    const issues = [];
    const normalizedText = String(text || "");
    const languageFamily = detectLanguageFamilyFromText(normalizedText) || detectLanguageFamilyLabel(context && context.detectedLanguageLabel);

    const singleSpace = normalizeInlineWhitespace(normalizedText);
    if (singleSpace !== normalizedText) {
      issues.push(createIssue(node, normalizedText, singleSpace, "중복 공백", "연속된 공백을 한 칸으로 바로잡았습니다."));
    }

    const punctuationNormalized = normalizePunctuationSpacing(normalizedText, languageFamily);
    if (punctuationNormalized !== normalizedText) {
      issues.push(
        createIssue(
          node,
          normalizedText,
          punctuationNormalized,
          "문장부호 간격",
          getPunctuationSpacingReason(languageFamily)
        )
      );
    }

    const noSpaceScriptNormalized = normalizeNoSpaceScriptSpacing(normalizedText, languageFamily);
    if (noSpaceScriptNormalized !== normalizedText) {
      issues.push(
        createIssue(node, normalizedText, noSpaceScriptNormalized, "공백 정리", getNoSpaceScriptReason(languageFamily))
      );
    }

    const repeatedPunctuation = normalizeRepeatedPunctuation(normalizedText);
    if (repeatedPunctuation !== normalizedText) {
      issues.push(
        createIssue(node, normalizedText, repeatedPunctuation, "반복 문장부호", "반복된 문장부호를 바로잡았습니다.")
      );
    }

    for (const issue of collectTypoReplacementIssues(node, normalizedText)) {
      issues.push(issue);
    }

    for (const issue of collectPhraseHintIssues(node, normalizedText)) {
      issues.push(issue);
    }

    for (const issue of collectLatinTokenIssues(node, normalizedText, languageFamily, context && context.latinLocaleHint)) {
      issues.push(issue);
    }

    return issues;
  }

  function collectPhraseHintIssues(node, text) {
    const issues = [];
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      const hint = getPhraseHintForLine(lines[index]);
      if (!hint) {
        continue;
      }

      const nextLines = lines.slice();
      nextLines[index] = hint.suggestion;
      issues.push(createIssue(node, normalizedText, nextLines.join("\n"), hint.kind, hint.reason));
    }

    return issues;
  }

  function getPhraseHintForLine(text) {
    const compactHangul = String(text || "")
      .replace(/[.!?,;:~"'`()\[\]{}<>]/g, "")
      .replace(/\s+/g, "")
      .trim();
    if (!compactHangul || !/^[가-힣]+$/.test(compactHangul)) {
      return null;
    }

    for (const hint of TYPO_PHRASE_HINTS) {
      const canonical = String(hint.canonical || "").trim();
      if (!canonical || compactHangul === canonical) {
        continue;
      }

      if (Math.abs(compactHangul.length - canonical.length) > 2) {
        continue;
      }

      const distance = getEditDistance(compactHangul, canonical);
      if (distance > hint.maxDistance) {
        continue;
      }

      return hint;
    }

    return null;
  }

  function getEditDistance(left, right) {
    const a = String(left || "");
    const b = String(right || "");
    const rows = a.length + 2;
    const cols = b.length + 2;
    const maxDistance = a.length + b.length;
    const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const lastSeen = new Map();

    table[0][0] = maxDistance;
    for (let row = 0; row <= a.length; row += 1) {
      table[row + 1][0] = maxDistance;
      table[row + 1][1] = row;
    }

    for (let col = 0; col <= b.length; col += 1) {
      table[0][col + 1] = maxDistance;
      table[1][col + 1] = col;
    }

    for (let row = 1; row <= a.length; row += 1) {
      let lastMatchColumn = 0;
      for (let col = 1; col <= b.length; col += 1) {
        const previousRow = lastSeen.get(b[col - 1]) || 0;
        const previousColumn = lastMatchColumn;
        const cost = a[row - 1] === b[col - 1] ? 0 : 1;
        if (cost === 0) {
          lastMatchColumn = col;
        }

        table[row + 1][col + 1] = Math.min(
          table[row][col] + cost,
          table[row + 1][col] + 1,
          table[row][col + 1] + 1,
          table[previousRow][previousColumn] + (row - previousRow - 1) + 1 + (col - previousColumn - 1)
        );
      }

      lastSeen.set(a[row - 1], row);
    }

    return table[a.length + 1][b.length + 1];
  }

  function collectLatinTokenIssues(node, text, languageFamily, latinLocaleHint) {
    if (languageFamily !== "latin") {
      return [];
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    if (!hintPool.length) {
      return [];
    }

    const issues = [];
    const value = String(text || "");
    const matches = value.matchAll(/\b[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]{3,}\b/g);

    for (const match of matches) {
      const token = match && typeof match[0] === "string" ? match[0] : "";
      const index = match && typeof match.index === "number" ? match.index : -1;
      if (!token || index < 0) {
        continue;
      }

      const bestHint = findBestLatinTokenHint(token, latinLocaleHint);
      if (!bestHint) {
        continue;
      }

      const replacement = applyLatinTokenCase(bestHint.canonical, token);
      if (!replacement || replacement === token) {
        continue;
      }

      const suggestion = value.slice(0, index) + replacement + value.slice(index + token.length);
      issues.push(
        createIssue(
          node,
          value,
          suggestion,
          "Latin spelling",
          `라틴 문자 UI 단어 '${token}'가 '${replacement}'의 오타처럼 보여 후보로 표시했습니다.`
        )
      );
    }

    return issues;
  }

  function findBestLatinTokenHint(token, latinLocaleHint) {
    const normalizedToken = normalizeLatinTokenForLookup(token);
    if (!normalizedToken || normalizedToken.length < 4) {
      return null;
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    if (!hintPool.length) {
      return null;
    }

    let best = null;
    let second = null;
    for (const canonical of hintPool) {
      const normalizedCanonical = normalizeLatinTokenForLookup(canonical);
      if (!normalizedCanonical || normalizedCanonical === normalizedToken) {
        continue;
      }

      if (normalizedCanonical[0] !== normalizedToken[0]) {
        continue;
      }

      if (Math.abs(normalizedCanonical.length - normalizedToken.length) > 2) {
        continue;
      }

      const distance = getEditDistance(normalizedToken, normalizedCanonical);
      const threshold = normalizedToken.length >= 7 ? 2 : 1;
      if (distance > threshold) {
        continue;
      }

      if (
        distance === 2 &&
        normalizedToken.length < 7 &&
        normalizedCanonical.slice(0, 2) !== normalizedToken.slice(0, 2)
      ) {
        continue;
      }

      const candidate = {
        canonical,
        normalizedCanonical,
        distance,
      };

      if (!best || candidate.distance < best.distance) {
        second = best;
        best = candidate;
      } else if (!second || candidate.distance < second.distance) {
        second = candidate;
      }
    }

    if (!best) {
      return null;
    }

    if (second && second.distance === best.distance && second.normalizedCanonical !== best.normalizedCanonical) {
      return null;
    }

    return best;
  }

  function getLatinTokenHintPool(latinLocaleHint) {
    const normalizedHint = String(latinLocaleHint || "").trim().toLowerCase();
    if (!normalizedHint) {
      return [];
    }

    return Object.prototype.hasOwnProperty.call(LATIN_UI_TOKEN_HINTS_BY_LOCALE, normalizedHint)
      ? LATIN_UI_TOKEN_HINTS_BY_LOCALE[normalizedHint]
      : [];
  }

  function resolveLatinTokenLocaleHint(context, text) {
    const contextHint = String(context && context.latinLocaleHint ? context.latinLocaleHint : "").trim().toLowerCase();
    if (contextHint) {
      return contextHint;
    }

    return inferLatinLocaleHint(text);
  }

  function normalizeLatinTokenForLookup(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’-]/g, "")
      .toLowerCase()
      .trim();
  }

  function inferLatinLocaleHint(text) {
    const normalized = normalizeLatinTokenForLookup(text).replace(/[^a-z0-9\s]/g, " ");
    if (!normalized) {
      return "";
    }

    const tokens = normalized.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      return "";
    }

    const locales = [
      ["german", ["der", "die", "das", "und", "mit", "deine", "dein", "finde", "jetzt", "kaufen", "angebot", "gilt", "solange", "vorrat", "reicht", "februar", "monatlich", "monatliche"]],
      ["french", ["bonjour", "continuer", "annuler", "rechercher", "parametres", "profil", "enregistrer", "fermer"]],
      ["spanish", ["hola", "continuar", "cancelar", "buscar", "correo", "usuario", "guardar", "cerrar"]],
      ["portuguese", ["ola", "pesquisar", "configuracoes", "senha", "endereco", "fechar", "salvar"]],
      ["italian", ["ciao", "continua", "annulla", "conferma", "ricerca", "impostazioni", "profilo", "salva", "chiudi"]],
      ["dutch", ["welkom", "doorgaan", "annuleren", "zoeken", "instellingen", "profiel", "opslaan", "sluiten"]],
      ["english", ["welcome", "continue", "cancel", "search", "settings", "profile", "account", "password", "download", "upload", "monthly", "find"]],
    ];

    let bestLocale = "";
    let bestScore = 0;
    for (const [locale, keywords] of locales) {
      let score = 0;
      for (const keyword of keywords) {
        if (tokens.includes(keyword)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestLocale = locale;
        bestScore = score;
      }
    }

    return bestScore >= 2 ? bestLocale : "";
  }

  function applyLatinTokenCase(canonical, original) {
    const value = String(canonical || "");
    const sample = String(original || "");
    if (!value) {
      return value;
    }

    if (sample === sample.toUpperCase()) {
      return value.toUpperCase();
    }

    if (sample[0] && sample[0] === sample[0].toUpperCase()) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value;
  }

  function normalizePunctuationSpacing(text, languageFamily) {
    const value = String(text || "");
    if (!value) {
      return value;
    }

    if (languageFamily === "japanese" || languageFamily === "cjk") {
      return value
        .replace(/[^\S\r\n]+([、。，．！？：；])/g, "$1")
        .replace(/([（【「『《〈])[^\S\r\n]+/g, "$1")
        .replace(/[^\S\r\n]+([）】」』》〉])/g, "$1");
    }

    if (languageFamily === "arabic") {
      return value
        .replace(/[^\S\r\n]+([،؛؟!.,:;])/g, "$1")
        .replace(/([(\[])[^\S\r\n]+/g, "$1")
        .replace(/[^\S\r\n]+([)\]])/g, "$1");
    }

    return value
      .replace(/[^\S\r\n]+([,.;:!?])/g, "$1")
      .replace(/([(\[])[^\S\r\n]+/g, "$1")
      .replace(/[^\S\r\n]+([)\]])/g, "$1");
  }

  function normalizeNoSpaceScriptSpacing(text, languageFamily) {
    const value = String(text || "");
    if (!value) {
      return value;
    }

    if (languageFamily === "japanese") {
      return value.replace(/([\u3040-\u30ff\u3400-\u9fff])[^\S\r\n]+([\u3040-\u30ff\u3400-\u9fff])/g, "$1$2");
    }

    if (languageFamily === "cjk") {
      return value.replace(/([\u3400-\u9fff])[^\S\r\n]+([\u3400-\u9fff])/g, "$1$2");
    }

    if (languageFamily === "thai") {
      return value.replace(/([\u0E00-\u0E7F])[^\S\r\n]+([\u0E00-\u0E7F])/g, "$1$2");
    }

    return value;
  }

  function normalizeRepeatedPunctuation(text) {
    return String(text || "")
      .replace(/([!?.,])\1{2,}/g, "$1$1")
      .replace(/([！？。、，．])\1{2,}/g, "$1$1")
      .replace(/([،؛؟])\1{2,}/g, "$1$1");
  }

  function normalizeInlineWhitespace(text) {
    return String(text || "").replace(/[^\S\r\n]{2,}/g, " ");
  }

  function applyTypoReplacementRules(text) {
    return mapTextLines(text, (line) => {
      let next = line;
      for (const rule of TYPO_REPLACEMENT_RULES) {
        next = next.replace(cloneRegex(rule.pattern), rule.replacement);
      }
      return next;
    });
  }

  function collectTypoReplacementIssues(node, text) {
    const issues = [];
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split("\n");
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      for (const rule of TYPO_REPLACEMENT_RULES) {
        const suggestionLine = line.replace(cloneRegex(rule.pattern), rule.replacement);
        if (suggestionLine === line) {
          continue;
        }

        const nextLines = lines.slice();
        nextLines[lineIndex] = suggestionLine;
        issues.push(createIssue(node, normalizedText, nextLines.join("\n"), rule.kind, rule.reason));
      }
    }

    return issues;
  }

  function cloneRegex(pattern) {
    return pattern instanceof RegExp ? new RegExp(pattern.source, pattern.flags) : new RegExp(String(pattern || ""));
  }

  function mapTextLines(text, iteratee) {
    const lines = normalizeLineEndings(text).split("\n");
    return lines.map((line, index) => iteratee(line, index)).join("\n");
  }

  function getPunctuationSpacingReason(languageFamily) {
    if (languageFamily === "japanese" || languageFamily === "cjk") {
      return "동아시아 문장부호 앞뒤 공백이 어색해서 정리 후보로 표시했습니다.";
    }

    if (languageFamily === "arabic") {
      return "아랍 문자권 문장부호 앞뒤 공백이 어색해서 정리 후보로 표시했습니다.";
    }

    return "문장부호 앞뒤 간격이 어색해서 정리 후보로 표시했습니다.";
  }

  function getNoSpaceScriptReason(languageFamily) {
    if (languageFamily === "japanese") {
      return "일본어 문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
    }

    if (languageFamily === "cjk") {
      return "중국어/한자권 문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
    }

    if (languageFamily === "thai") {
      return "태국어 문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
    }

    return "문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
  }

  function collectConsistencyIssues(textNodes) {
    const issues = [];
    for (const rule of CONSISTENCY_RULES) {
      const matched = [];
      for (const node of textNodes) {
        const text = compactText(getTextValue(node));
        if (!text) {
          continue;
        }

        const variant = rule.variants.find((entry) => text.includes(entry));
        if (variant) {
          matched.push({ node, text, variant });
        }
      }

      const hasCanonical = matched.some((entry) => entry.variant === rule.canonical);
      if (!hasCanonical) {
        continue;
      }

      for (const entry of matched) {
        if (entry.variant === rule.canonical) {
          continue;
        }

        issues.push(
          createIssue(
            entry.node,
            entry.text,
            entry.text.replace(entry.variant, rule.canonical),
            "용어 통일",
            rule.reason
          )
        );
      }
    }

    return issues;
  }

  function createIssue(node, currentText, suggestion, kind, reason, source) {
    return {
      node,
      currentText: String(currentText || ""),
      suggestion: String(suggestion || ""),
      kind,
      reason,
      source: source || "local",
    };
  }

  function buildInsights(context, textNodes, issues, applied, annotationSupported, aiMeta) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 검사`,
      annotationSupported ? `주석 ${applied.annotationCount}건 적용` : "주석 대신 결과 패널에만 표시",
    ];

    if (aiMeta && aiMeta.statusLabel) {
      insights.push(`AI 상태: ${aiMeta.statusLabel}${aiMeta.providerLabel ? ` · ${aiMeta.providerLabel}` : ""}`);
    }

    if (issues.length === 0) {
      insights.push(
        annotationSupported
          ? "뚜렷한 오타 후보를 찾지 못해 기존 AI 오타 주석만 정리했습니다."
          : "뚜렷한 오타 후보를 찾지 못했습니다."
      );
      return insights;
    }

    const firstIssue = issues[0];
    insights.push(`대표 후보: ${previewText(firstIssue.currentText, 32)} -> ${previewText(firstIssue.suggestion, 32)}`);
    insights.push(`가장 많은 규칙: ${summarizeKinds(issues)}`);

    if (applied.skipped.length > 0) {
      insights.push(`일부 주석은 구조 제한으로 건너뜀 ${applied.skipped.length}건`);
    } else if (annotationSupported) {
      insights.push("Figma 주석은 Dev Mode에서 확인할 수 있습니다.");
    }

    return insights;
  }

  function buildFixInsights(context, textNodes, issues, applied, annotationApplied, aiMeta) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 검사`,
      `직접 수정 ${applied.appliedCount}개 적용`,
    ];

    if (annotationApplied && typeof annotationApplied.annotationCount === "number") {
      insights.push(
        annotationApplied.annotationCount > 0
          ? `수정된 텍스트에 주석 ${annotationApplied.annotationCount}건 적용`
          : "수정된 텍스트 주석은 없거나 현재 환경에서 지원되지 않았습니다."
      );
    }

    if (aiMeta && aiMeta.statusLabel) {
      insights.push(`AI 상태: ${aiMeta.statusLabel}${aiMeta.providerLabel ? ` · ${aiMeta.providerLabel}` : ""}`);
    }

    if (issues.length === 0) {
      insights.push("뚜렷한 오타 후보를 찾지 못했습니다.");
      return insights;
    }

    const firstApplied = applied.applied[0];
    if (firstApplied) {
      insights.push(`대표 수정: ${previewText(firstApplied.currentText, 32)} -> ${previewText(firstApplied.suggestion, 32)}`);
    } else {
      const firstIssue = issues[0];
      insights.push(`대표 후보: ${previewText(firstIssue.currentText, 32)} -> ${previewText(firstIssue.suggestion, 32)}`);
    }

    insights.push(`가장 많은 규칙: ${summarizeKinds(issues)}`);

    const skippedCount =
      (applied && Array.isArray(applied.skipped) ? applied.skipped.length : 0) +
      (annotationApplied && Array.isArray(annotationApplied.skipped) ? annotationApplied.skipped.length : 0);
    if (skippedCount > 0) {
      insights.push(`일부 텍스트는 구조 제한으로 건너뜀 ${skippedCount}건`);
    } else if (applied.appliedCount > 0) {
      insights.push("현재 선택 텍스트에 직접 반영했습니다.");
    }

    return insights;
  }

  function buildClearInsights(context, textNodes, applied, annotationSupported) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 확인`,
      annotationSupported
        ? `AI 주석 ${applied.removedAnnotationCount || 0}건 제거`
        : "현재 환경에서는 주석 제거를 지원하지 않음",
    ];

    if (Array.isArray(applied.cleared) && applied.cleared.length > 0) {
      const firstCleared = applied.cleared[0];
      insights.push(`정리 예시: ${firstCleared.nodeName} · ${firstCleared.removedCount}건 제거`);
    } else if (annotationSupported) {
      insights.push("정리할 AI 오타 주석을 찾지 못했습니다.");
    }

    if (Array.isArray(applied.skipped) && applied.skipped.length > 0) {
      insights.push(`구조 또는 환경 제한으로 ${applied.skipped.length}건 건너뜀`);
    }

    return insights;
  }

  function summarizeKinds(issues) {
    const counts = new Map();
    for (const issue of issues) {
      counts.set(issue.kind, (counts.get(issue.kind) || 0) + 1);
    }

    const top = Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0];
    return top ? `${top[0]} ${top[1]}건` : "없음";
  }

  function collectTextNodes(selection, options) {
    const settings = options && typeof options === "object" ? options : {};
    const includeHidden = settings.includeHidden === true;
    const includeLocked = settings.includeLocked === true;
    const nodes = [];
    const stack = [...selection];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if ((!includeHidden && node.visible === false) || (!includeLocked && node.locked === true)) {
        continue;
      }

      if (node.type === "TEXT") {
        nodes.push(node);
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return nodes;
  }

  function buildSelectionContext(selection, designReadResult, proofingSettings) {
    const roots = selection.map((node) => ({
      id: node.id,
      name: safeName(node),
      type: String(node.type || "UNKNOWN"),
    }));
    const selectionLabel = formatSelectionLabel(roots);
    const selectionSignature = getSelectionSignature(selection);
    const textSamples = collectSelectionTextSamples(selection, 8);
    const localeMeta = getProofingLocaleMetadata(proofingSettings ? proofingSettings.proofingLocale : "");
    const fallbackLatinLocaleHint = inferLatinLocaleHint(textSamples.join("\n"));
    if (
      designReadResult &&
      designReadResult.selectionSignature === selectionSignature &&
      designReadResult.summary &&
      typeof designReadResult.summary.contextLabel === "string"
    ) {
      const rawLanguageLabel =
        typeof designReadResult.summary.languageLabel === "string" ? designReadResult.summary.languageLabel : "";
      const detectedLanguageLabel = normalizeDetectedLanguage(rawLanguageLabel);
      return {
        selectionLabel,
        contextLabel: designReadResult.summary.contextLabel || "일반 UI 화면",
        languageLabel:
          typeof designReadResult.summary.languageLabel === "string" ? designReadResult.summary.languageLabel : "텍스트 언어 미감지",
        detectedLanguageLabel: normalizeDetectedLanguage(
          typeof designReadResult.summary.languageLabel === "string" ? designReadResult.summary.languageLabel : ""
        ),
        languageHintLabel: localeMeta ? localeMeta.label : detectedLanguageLabel,
        proofingLocale: localeMeta ? localeMeta.code : "",
        proofingLocaleLabel: localeMeta ? localeMeta.label : "",
        proofingLocaleAiLabel: localeMeta ? localeMeta.aiLabel : "",
        latinLocaleHint: localeMeta && localeMeta.latinLocaleHint ? localeMeta.latinLocaleHint : fallbackLatinLocaleHint,
      };
    }

    const detectedLanguageLabel = detectLanguageFromSamples(textSamples);
    return {
      selectionLabel,
      contextLabel: inferSelectionContext(selection, textSamples),
      languageLabel: detectedLanguageLabel,
      detectedLanguageLabel: detectedLanguageLabel,
      languageHintLabel: localeMeta ? localeMeta.label : detectedLanguageLabel,
      proofingLocale: localeMeta ? localeMeta.code : "",
      proofingLocaleLabel: localeMeta ? localeMeta.label : "",
      proofingLocaleAiLabel: localeMeta ? localeMeta.aiLabel : "",
      latinLocaleHint: localeMeta && localeMeta.latinLocaleHint ? localeMeta.latinLocaleHint : fallbackLatinLocaleHint,
    };
  }

  function collectSelectionTextSamples(selection, limit) {
    const samples = [];
    const stack = [...selection];
    while (stack.length > 0 && samples.length < limit) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (node.type === "TEXT") {
        const text = getTextValue(node);
        if (text && !samples.includes(text)) {
          samples.push(text);
        }
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return samples;
  }

  function inferSelectionContext(selection, textSamples) {
    const rootNames = selection.map((node) => safeName(node).toLowerCase());
    const corpus = `${rootNames.join(" ")} ${textSamples.join(" ")}`.toLowerCase();
    const categories = [
      ["인증/폼 화면", ["login", "sign in", "sign up", "email", "password", "로그인", "이메일", "비밀번호", "입력"]],
      ["대시보드/데이터 화면", ["dashboard", "analytics", "chart", "table", "report", "metric", "지표", "차트", "테이블"]],
      ["랜딩/프로모션 화면", ["get started", "learn more", "buy", "download", "contact", "시작", "구매", "문의"]],
      ["모달/다이얼로그", ["cancel", "confirm", "delete", "ok", "취소", "삭제", "닫기", "확인"]],
      ["앱/웹 내비게이션 화면", ["home", "profile", "settings", "menu", "search", "홈", "프로필", "설정", "검색"]],
    ];

    let bestLabel = "일반 UI 화면";
    let bestScore = 0;
    for (const [label, keywords] of categories) {
      let score = 0;
      for (const keyword of keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestLabel = label;
      }
    }

    return bestLabel;
  }

  function detectLanguageFromSamples(textSamples) {
    const counts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      cyrillic: 0,
      arabic: 0,
      devanagari: 0,
      thai: 0,
      hebrew: 0,
      greek: 0,
      other: 0,
    };
    const samples = Array.isArray(textSamples) ? textSamples : [];
    for (const text of samples) {
      addScriptCounts(counts, text);
    }

    const ordered = Object.entries(counts)
      .filter((entry) => entry[1] > 0)
      .sort((left, right) => right[1] - left[1]);
    if (!ordered.length) {
      return "텍스트 언어 미감지";
    }

    if (ordered.length > 1 && ordered[1][1] >= ordered[0][1] * 0.55) {
      return "다국어 혼합";
    }

    const primary = ordered[0][0];
    switch (primary) {
      case "korean":
        return "한국어 중심";
      case "latin":
        return "영어/라틴 문자 중심";
      case "japanese":
        return "일본어 중심";
      case "cjk":
        return "중국어 한자권 중심";
      case "cyrillic":
        return "키릴 문자권 중심";
      case "arabic":
        return "아랍 문자권 중심";
      case "devanagari":
        return "데바나가리권 중심";
      case "thai":
        return "태국어 중심";
      case "hebrew":
        return "히브리어 중심";
      case "greek":
        return "그리스어 중심";
      default:
        return "다국어 혼합";
    }
  }

  function normalizeDetectedLanguage(label) {
    const normalized = String(label || "").trim();
    if (!normalized) {
      return "텍스트 언어 미감지";
    }

    if (normalized.includes("한국어")) {
      return "한국어 중심";
    }

    if (normalized.includes("영어") || normalized.includes("라틴")) {
      return "영어/라틴 문자 중심";
    }

    if (normalized.includes("일본어")) {
      return "일본어 중심";
    }

    if (normalized.includes("중국어") || normalized.includes("한자")) {
      return "중국어 한자권 중심";
    }

    if (normalized.includes("키릴")) {
      return "키릴 문자권 중심";
    }

    if (normalized.includes("아랍")) {
      return "아랍 문자권 중심";
    }

    if (normalized.includes("데바나가리")) {
      return "데바나가리권 중심";
    }

    if (normalized.includes("태국")) {
      return "태국어 중심";
    }

    if (normalized.includes("히브리")) {
      return "히브리어 중심";
    }

    if (normalized.includes("그리스")) {
      return "그리스어 중심";
    }

    if (normalized.includes("다국어")) {
      return "다국어 혼합";
    }

    return normalized;
  }

  function detectLanguageFamilyLabel(label) {
    const normalized = normalizeDetectedLanguage(label);
    if (normalized.includes("한국어")) {
      return "korean";
    }
    if (normalized.includes("영어") || normalized.includes("라틴")) {
      return "latin";
    }
    if (normalized.includes("일본어")) {
      return "japanese";
    }
    if (normalized.includes("중국어") || normalized.includes("한자")) {
      return "cjk";
    }
    if (normalized.includes("키릴")) {
      return "cyrillic";
    }
    if (normalized.includes("아랍")) {
      return "arabic";
    }
    if (normalized.includes("데바나가리")) {
      return "devanagari";
    }
    if (normalized.includes("태국")) {
      return "thai";
    }
    if (normalized.includes("히브리")) {
      return "hebrew";
    }
    if (normalized.includes("그리스")) {
      return "greek";
    }
    return "";
  }

  function detectLanguageFamilyFromText(text) {
    const counts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      cyrillic: 0,
      arabic: 0,
      devanagari: 0,
      thai: 0,
      hebrew: 0,
      greek: 0,
      other: 0,
    };
    addScriptCounts(counts, text);
    const ordered = Object.entries(counts)
      .filter((entry) => entry[1] > 0)
      .sort((left, right) => right[1] - left[1]);
    return ordered.length ? ordered[0][0] : "";
  }

  function addScriptCounts(scriptCounts, text) {
    const value = String(text || "");
    for (const character of value) {
      const family = detectCharacterScriptFamily(character);
      if (family) {
        scriptCounts[family] += 1;
      } else if (!/\s/.test(character)) {
        scriptCounts.other += 1;
      }
    }
  }

  function detectCharacterScriptFamily(character) {
    const codePoint = character.codePointAt(0);
    if (typeof codePoint !== "number") {
      return "";
    }

    if (
      (codePoint >= 0xac00 && codePoint <= 0xd7af) ||
      (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
      (codePoint >= 0x3130 && codePoint <= 0x318f)
    ) {
      return "korean";
    }

    if (
      (codePoint >= 0x3040 && codePoint <= 0x309f) ||
      (codePoint >= 0x30a0 && codePoint <= 0x30ff)
    ) {
      return "japanese";
    }

    if (codePoint >= 0x4e00 && codePoint <= 0x9fff) {
      return "cjk";
    }

    if (codePoint >= 0x0400 && codePoint <= 0x052f) {
      return "cyrillic";
    }

    if (codePoint >= 0x0600 && codePoint <= 0x06ff) {
      return "arabic";
    }

    if (codePoint >= 0x0900 && codePoint <= 0x097f) {
      return "devanagari";
    }

    if (codePoint >= 0x0e00 && codePoint <= 0x0e7f) {
      return "thai";
    }

    if (codePoint >= 0x0590 && codePoint <= 0x05ff) {
      return "hebrew";
    }

    if (codePoint >= 0x0370 && codePoint <= 0x03ff) {
      return "greek";
    }

    if (
      (codePoint >= 0x0041 && codePoint <= 0x005a) ||
      (codePoint >= 0x0061 && codePoint <= 0x007a) ||
      (codePoint >= 0x00c0 && codePoint <= 0x024f)
    ) {
      return "latin";
    }

    return "";
  }

  function formatSelectionLabel(roots) {
    if (!Array.isArray(roots) || roots.length === 0) {
      return "선택 없음";
    }

    if (roots.length === 1) {
      return `${roots[0].name} / ${normalizeTypeLabel(roots[0].type)}`;
    }

    return `${roots[0].name} 외 ${roots.length - 1}개`;
  }

  function getSelectionSignature(selection) {
    return Array.from(selection || [])
      .map((node) => String(node.id || ""))
      .sort()
      .join("|");
  }

  function safeName(node) {
    return node && typeof node.name === "string" && node.name.trim()
      ? node.name.trim()
      : normalizeTypeLabel(node && node.type);
  }

  function getTextValue(node) {
    return node && typeof node.characters === "string" ? normalizeLineEndings(node.characters) : "";
  }

  function previewText(value, limit) {
    const visible = makeWhitespaceVisible(value);
    if (visible.length <= limit) {
      return visible;
    }

    return `${visible.slice(0, limit - 3)}...`;
  }

  function previewVisibleText(value, limit) {
    return previewText(value, limit);
  }

  function makeWhitespaceVisible(value) {
    const normalized = normalizeLineEndings(value);
    if (!normalized) {
      return "[empty]";
    }

    return normalized.replace(/ /g, "[ ]").replace(/\t/g, "[tab]").replace(/\n/g, "[\\n]");
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeLineEndings(value) {
    return String(value || "").replace(/\r\n?/g, "\n");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children) && node.children.length > 0;
  }

  function normalizeTypeLabel(type) {
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
      default:
        return String(type || "레이어");
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

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper && typeof helper.requestJsonTask === "function" && typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
  }
})();

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_PIXEL_PERFECT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_PIXEL_PERFECT_CACHE_KEY = "pigma:ai-pixel-perfect-cache:v1";
  const AI_PIXEL_PERFECT_CLEAR_CACHE_KEY = "pigma:ai-pixel-perfect-clear-cache:v1";
  const PATCH_VERSION = 5;
  const RESULT_PREVIEW_LIMIT = 80;
  const VALUE_EPSILON = 0.0001;
  const EFFECT_RADIUS_KEYS = new Set(["radius", "spread", "startRadius", "endRadius"]);
  const OPACITY_PERCENT_SCALE = 100;
  const ANNOTATION_CATEGORY_LABEL = "Pigma Perfect pixel";
  const ANNOTATION_CATEGORY_COLOR = "red";
  const ANNOTATION_LABEL_PREFIX = "Pigma Perfect pixel";
  const ANNOTATION_CHANGE_PREVIEW_LIMIT = 4;
  let activePixelPerfectTask = "";

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiPixelPerfectMessage(message)) {
      if (message.type === "request-ai-pixel-perfect-cache") {
        await postCachedResult();
        return;
      }

      if (message.type === "request-ai-pixel-perfect-clear-cache") {
        await postCachedClearResult();
        return;
      }

      if (message.type === "run-ai-pixel-perfect-clear") {
        await withPixelPerfectTaskLock("clear", runPixelPerfectClear);
        return;
      }

      await withPixelPerfectTaskLock("apply", runPixelPerfect);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_PIXEL_PERFECT_PATCH__ = true;

  function isAiPixelPerfectMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-pixel-perfect-cache" ||
        message.type === "run-ai-pixel-perfect" ||
        message.type === "request-ai-pixel-perfect-clear-cache" ||
        message.type === "run-ai-pixel-perfect-clear")
    );
  }

  async function withPixelPerfectTaskLock(task, runner) {
    if (activePixelPerfectTask) {
      if (activePixelPerfectTask === task) {
        postPixelPerfectTaskStatus(task, "running", getPixelPerfectTaskRunningMessage(task));
      } else {
        postPixelPerfectTaskError(
          task,
          "다른 픽셀 교정 작업이 이미 진행 중입니다. 현재 작업이 끝난 뒤 다시 실행해 주세요."
        );
      }
      return false;
    }

    activePixelPerfectTask = task;
    try {
      await runner();
      return true;
    } finally {
      activePixelPerfectTask = "";
    }
  }

  function getPixelPerfectTaskRunningMessage(task) {
    if (task === "clear") {
      return "Removing pixel-perfect Dev Mode annotations from the current selection.";
    }
    return "소수점 보정 후보를 분석하고 정수 스냅 적용 중입니다.";
  }

  function postPixelPerfectTaskStatus(task, status, message) {
    if (task === "clear") {
      postClearStatus(status, message);
      return;
    }
    postStatus(status, message);
  }

  function postPixelPerfectTaskError(task, message) {
    if (task === "clear") {
      figma.ui.postMessage({
        type: "ai-pixel-perfect-clear-error",
        message,
      });
      return;
    }
    figma.ui.postMessage({
      type: "ai-pixel-perfect-error",
      message,
    });
  }

  async function runPixelPerfect() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus("running", "소수점 보정 후보를 분석하고 정수 스냅 적용 중입니다.");

    try {
      const result = await applyPixelPerfect();
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: "ai-pixel-perfect-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      const summary = result.summary || {};
      const appliedCount = summary.appliedCount || 0;
      const excludedCount = summary.excludedCount || 0;
      const annotationCount = summary.annotationCount || 0;
      const annotationSuffix = annotationCount > 0 ? `, annotations ${annotationCount}` : "";
      if (appliedCount > 0) {
        figma.notify(`Pixel perfect complete (${appliedCount} applied, ${excludedCount} excluded${annotationSuffix})`, {
          timeout: 2200,
        });
      } else if ((summary.candidateCount || 0) === 0) {
        figma.notify("픽셀 퍼팩트 후보가 없습니다.", { timeout: 1800 });
      } else {
        figma.notify(`Pixel perfect complete (0 applied, ${excludedCount} excluded${annotationSuffix})`, {
          timeout: 2200,
        });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "픽셀 퍼팩트 적용에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-pixel-perfect-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runPixelPerfectClear() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postClearStatus("running", "Removing pixel-perfect Dev Mode annotations from the current selection.");

    try {
      const result = await clearPixelPerfectAnnotations();
      await writeCachedClearResult(result);

      figma.ui.postMessage({
        type: "ai-pixel-perfect-clear-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      const summary = result.summary || {};
      const removedAnnotationCount = summary.removedAnnotationCount || 0;
      if (removedAnnotationCount > 0) {
        figma.notify(`Pixel perfect annotations cleared (${removedAnnotationCount} removed)`, {
          timeout: 2200,
        });
      } else {
        figma.notify("No pixel-perfect annotations found in the current selection.", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "Failed to clear the pixel-perfect annotations.");
      figma.ui.postMessage({
        type: "ai-pixel-perfect-clear-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedResult() {
    const result = await readCachedResult();
    figma.ui.postMessage({
      type: "ai-pixel-perfect-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedClearResult() {
    const result = await readCachedClearResult();
    figma.ui.postMessage({
      type: "ai-pixel-perfect-clear-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-pixel-perfect-status",
      status,
      message,
    });
  }

  function postClearStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-pixel-perfect-clear-status",
      status,
      message,
    });
  }

  async function applyPixelPerfect() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const designReadResult = await readDesignReadCache();
    const context = buildRunContext(selection, designReadResult);
    const collection = collectPixelCandidates(selection);

    if (!collection.candidates.length) {
      return buildPixelPerfectResult({
        selection,
        context,
        source: "local-rules",
        aiSummary: buildLocalDecisionSummary([]),
        applied: [],
        annotations: [],
        excluded: collection.excluded,
        skipped: [],
        candidateCount: 0,
        annotationSummary: {
          applied: [],
          skipped: [],
          annotatedNodeCount: 0,
          annotationCount: 0,
          modeLabel: "Result only",
          categoryLabel: "",
        },
      });
    }

    const aiDecisionSummary = await requestAiDecisions(collection.candidates, context);
    const plans = buildDecisionPlans(collection.candidates, aiDecisionSummary);
    const applied = [];
    const appliedPlans = [];
    const skipped = [];

    for (const plan of plans) {
      try {
        await applyPlannedChange(plan);
        appliedPlans.push(plan);
        applied.push(buildAppliedEntry(plan));
      } catch (error) {
        skipped.push({
          label: `${plan.candidate.nodeName} / ${plan.candidate.label}`,
          reason: normalizeErrorMessage(error, "Failed to apply the snap target."),
        });
      }
    }

    const annotationSupported = supportsAnnotationsForPlans(appliedPlans);
    const annotationCategory = annotationSupported ? await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR) : null;
    const annotationApplied = annotationSupported
      ? applyPixelPerfectAnnotations(appliedPlans, annotationCategory)
      : buildResultOnlyAnnotation(
          appliedPlans,
          appliedPlans.length > 0
            ? "Figma Annotation API is not available for the updated nodes, so the result stays in the panel only."
            : ""
        );

    return buildPixelPerfectResult({
      selection,
      context,
      source: "local-rules",
      aiSummary: aiDecisionSummary,
      applied,
      annotations: annotationApplied.applied,
      excluded: collection.excluded,
      skipped: skipped.concat(annotationApplied.skipped),
      candidateCount: collection.candidates.length,
      annotationSummary: annotationApplied,
    });
  }

  async function clearPixelPerfectAnnotations() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택해 주세요.");
    }

    const designReadResult = await readDesignReadCache();
    const context = buildRunContext(selection, designReadResult);
    const annotationCollection = collectAnnotationNodes(selection);
    const category = await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR, { createIfMissing: false });
    const cleared = removePixelPerfectAnnotations(annotationCollection.nodes, category);

    return buildPixelPerfectClearResult({
      selection,
      context,
      scannedNodeCount: annotationCollection.scannedNodeCount,
      category,
      cleared,
    });
  }

  function buildPixelPerfectClearResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const context = options.context && typeof options.context === "object" ? options.context : {};
    const cleared = options.cleared && typeof options.cleared === "object" ? options.cleared : {};
    const clearedItems = Array.isArray(cleared.cleared) ? cleared.cleared : [];
    const skipped = Array.isArray(cleared.skipped) ? cleared.skipped : [];
    const category = options.category && typeof options.category === "object" ? options.category : null;
    const scannedNodeCount =
      typeof options.scannedNodeCount === "number" && Number.isFinite(options.scannedNodeCount) ? options.scannedNodeCount : 0;

    return {
      version: PATCH_VERSION,
      source: "managed-annotation-clear",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel || formatSelectionLabel(selection),
        contextLabel: context.contextLabel || "General UI",
        rootCount: selection.length,
        scannedNodeCount,
        removedAnnotationCount: cleared.removedAnnotationCount || 0,
        clearedNodeCount: cleared.clearedNodeCount || 0,
        skippedCount: skipped.length,
        mode: "annotation-clear",
        modeLabel: "Dev Mode annotation clear",
        categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
      },
      cleared: clearedItems.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function buildPixelPerfectResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const context = options.context && typeof options.context === "object" ? options.context : {};
    const applied = Array.isArray(options.applied) ? options.applied : [];
    const annotations = Array.isArray(options.annotations) ? options.annotations : [];
    const excluded = Array.isArray(options.excluded) ? options.excluded : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const aiSummary = options.aiSummary && typeof options.aiSummary === "object" ? options.aiSummary : {};
    const annotationSummary =
      options.annotationSummary && typeof options.annotationSummary === "object" ? options.annotationSummary : {};
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;

    return {
      version: PATCH_VERSION,
      source: options.source || "local-rules",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel || formatSelectionLabel(selection),
        contextLabel: context.contextLabel || "General UI",
        rootCount: selection.length,
        candidateCount,
        appliedCount: applied.length,
        excludedCount: excluded.length,
        skippedCount: skipped.length,
        annotationCount: annotationSummary.annotationCount || 0,
        annotatedNodeCount: annotationSummary.annotatedNodeCount || 0,
        annotationSkippedCount: Array.isArray(annotationSummary.skipped) ? annotationSummary.skipped.length : 0,
        aiDecisionCount: aiSummary.aiDecisionCount || 0,
        fallbackDecisionCount: aiSummary.fallbackDecisionCount || 0,
        aiStatusLabel: aiSummary.aiStatusLabel || "로컬 규칙",
        aiProviderLabel: aiSummary.aiProviderLabel || "",
        aiModelLabel: aiSummary.aiModelLabel || "",
        reviewStrategy: aiSummary.reviewStrategy || "0.5 stroke/blur 예외 유지 후 최근접 정수 스냅",
        modeLabel: annotationSummary.modeLabel || "Result only",
        categoryLabel: annotationSummary.categoryLabel || "",
      },
      applied: applied.slice(0, RESULT_PREVIEW_LIMIT),
      annotations: annotations.slice(0, RESULT_PREVIEW_LIMIT),
      excluded: excluded.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function buildRunContext(selection, designReadResult) {
    const signature = getSelectionSignature(selection);
    const validDesignRead =
      designReadResult &&
      typeof designReadResult === "object" &&
      designReadResult.selectionSignature === signature &&
      designReadResult.summary &&
      typeof designReadResult.summary === "object";

    return {
      selectionLabel: validDesignRead && typeof designReadResult.summary.selectionLabel === "string"
        ? designReadResult.summary.selectionLabel
        : formatSelectionLabel(selection),
      contextLabel: validDesignRead && typeof designReadResult.summary.contextLabel === "string"
        ? designReadResult.summary.contextLabel
        : "일반 UI 화면",
      languageLabel: validDesignRead && typeof designReadResult.summary.languageLabel === "string"
        ? designReadResult.summary.languageLabel
        : "",
      designReadPixelSummary:
        validDesignRead &&
        designReadResult.pixel &&
        typeof designReadResult.pixel === "object" &&
        typeof designReadResult.pixel.aiSummary === "string"
          ? designReadResult.pixel.aiSummary
          : "",
    };
  }

  function collectPixelCandidates(selection) {
    const candidates = [];
    const excluded = [];
    const stack = [];

    for (let index = selection.length - 1; index >= 0; index -= 1) {
      stack.push(selection[index]);
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      collectNodeCandidates(node, candidates, excluded);

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return { candidates, excluded };
  }

  function collectAnnotationNodes(selection) {
    const nodes = [];
    const stack = [];
    let scannedNodeCount = 0;

    for (let index = selection.length - 1; index >= 0; index -= 1) {
      stack.push(selection[index]);
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      scannedNodeCount += 1;

      if (supportsAnnotationsOnNode(node)) {
        nodes.push(node);
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return { nodes, scannedNodeCount };
  }

  function collectNodeCandidates(node, candidates, excluded) {
    const nodeName = safeName(node);
    const nodeType = String(node.type || "UNKNOWN");
    const resizable = canResizeNode(node);

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "x",
      label: "x",
      value: node.x,
      kind: "position",
      category: "position",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "y",
      label: "y",
      value: node.y,
      kind: "position",
      category: "position",
    });

    if (resizable) {
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: "width",
        label: "width",
        value: node.width,
        kind: "size",
        category: "size",
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: "height",
        label: "height",
        value: node.height,
        kind: "size",
        category: "size",
      });
    }

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "strokeWeight",
      label: "stroke",
      value: node.strokeWeight,
      kind: "direct",
      category: "stroke",
    });

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "cornerRadius",
      label: "corner radius",
      value: node.cornerRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "topLeftRadius",
      label: "top-left radius",
      value: node.topLeftRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "topRightRadius",
      label: "top-right radius",
      value: node.topRightRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "bottomLeftRadius",
      label: "bottom-left radius",
      value: node.bottomLeftRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "bottomRightRadius",
      label: "bottom-right radius",
      value: node.bottomRightRadius,
      kind: "direct",
      category: "radius",
    });

    collectEffectCandidates(node, nodeName, nodeType, candidates, excluded);
    collectTextCandidates(node, nodeName, nodeType, candidates, excluded);
    collectPaintOpacityCandidates(node, nodeName, nodeType, "fills", "fill", candidates, excluded);
    collectPaintOpacityCandidates(node, nodeName, nodeType, "strokes", "stroke paint", candidates, excluded);
    collectLayerOpacityCandidate(node, nodeName, nodeType, candidates, excluded);
  }

  function collectEffectCandidates(node, nodeName, nodeType, candidates, excluded) {
    if (!node || !Array.isArray(node.effects) || node.effects.length === 0) {
      return;
    }

    for (let index = 0; index < node.effects.length; index += 1) {
      const effect = node.effects[index];
      if (!effect || effect.visible === false) {
        continue;
      }

      const effectLabel = formatEffectLabel(effect);
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.radius`,
        label: `${effectLabel} radius`,
        value: effect.radius,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["radius"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.spread`,
        label: `${effectLabel} spread`,
        value: effect.spread,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["spread"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.offset.x`,
        label: `${effectLabel} offset x`,
        value: effect.offset && effect.offset.x,
        kind: "effect",
        category: "effect-offset",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["offset", "x"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.offset.y`,
        label: `${effectLabel} offset y`,
        value: effect.offset && effect.offset.y,
        kind: "effect",
        category: "effect-offset",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["offset", "y"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.startRadius`,
        label: `${effectLabel} start radius`,
        value: effect.startRadius,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["startRadius"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.endRadius`,
        label: `${effectLabel} end radius`,
        value: effect.endRadius,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["endRadius"],
      });
    }
  }

  function collectTextCandidates(node, nodeName, nodeType, candidates, excluded) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "fontSize",
      label: "font size",
      value: typeof node.fontSize === "number" ? node.fontSize : null,
      kind: "text-style",
      category: "text-size",
      meta: {
        textField: "fontSize",
      },
    });

    const lineHeight = getTextMetricDescriptor(node.lineHeight);
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "lineHeight",
      label: "line height",
      value: lineHeight ? lineHeight.value : null,
      kind: "text-style",
      category: "text-line-height",
      meta: {
        textField: "lineHeight",
        unit: lineHeight ? lineHeight.unit : "",
      },
    });

    const letterSpacing = getTextMetricDescriptor(node.letterSpacing);
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "letterSpacing",
      label: "letter spacing",
      value: letterSpacing ? letterSpacing.value : null,
      kind: "text-style",
      category: "text-letter-spacing",
      meta: {
        textField: "letterSpacing",
        unit: letterSpacing ? letterSpacing.unit : "",
      },
    });

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "paragraphSpacing",
      label: "paragraph spacing",
      value: typeof node.paragraphSpacing === "number" ? node.paragraphSpacing : null,
      kind: "text-style",
      category: "text-spacing",
      meta: {
        textField: "paragraphSpacing",
      },
    });
  }

  function collectPaintOpacityCandidates(node, nodeName, nodeType, paintListKey, paintLabel, candidates, excluded) {
    const paints = node && Array.isArray(node[paintListKey]) ? node[paintListKey] : null;
    if (!paints || paints.length === 0) {
      return;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false) {
        continue;
      }

      const opacity = typeof paint.opacity === "number" ? paint.opacity : 1;
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `${paintListKey}.${index}.opacity`,
        label: paints.length === 1 ? `${paintLabel} opacity` : `${paintLabel} ${index + 1} opacity`,
        value: opacity * OPACITY_PERCENT_SCALE,
        kind: "paint-opacity",
        category: "paint-opacity",
        meta: {
          paintListKey,
          paintIndex: index,
          valueScale: OPACITY_PERCENT_SCALE,
        },
      });
    }
  }

  function collectLayerOpacityCandidate(node, nodeName, nodeType, candidates, excluded) {
    if (!node || typeof node.opacity !== "number") {
      return;
    }

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "opacity",
      label: "layer opacity",
      value: node.opacity * OPACITY_PERCENT_SCALE,
      kind: "scaled-direct",
      category: "opacity",
      meta: {
        valueScale: OPACITY_PERCENT_SCALE,
      },
    });
  }

  function maybeAddCandidate(entry) {
    const value = entry.value;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    if (isIntegerValue(value)) {
      return;
    }

    if (shouldPreserveHalfStep(entry.category, entry.fieldKey, value)) {
      entry.excluded.push({
        label: `${entry.nodeName} / ${entry.label} ${formatNumber(value)}`,
        reason: preserveReasonForCategory(entry.category),
      });
      return;
    }

    const floorValue = Math.floor(value);
    const ceilValue = Math.ceil(value);
    entry.candidates.push({
      id: `${entry.node.id}:${entry.fieldKey}`,
      node: entry.node,
      nodeId: entry.node.id,
      nodeName: entry.nodeName,
      nodeType: entry.nodeType,
      fieldKey: entry.fieldKey,
      label: entry.label,
      kind: entry.kind,
      category: entry.category,
      currentValue: value,
      floorValue,
      ceilValue,
      nearestValue: selectNearestInteger(value),
      effectIndex: typeof entry.effectIndex === "number" ? entry.effectIndex : null,
      effectType: entry.effectType || "",
      effectPath: Array.isArray(entry.effectPath) ? entry.effectPath.slice() : null,
      meta: entry.meta && typeof entry.meta === "object" ? clonePlainObject(entry.meta) : null,
    });
  }

  function buildLocalDecisionSummary(candidates) {
    const candidateCount = Array.isArray(candidates) ? candidates.length : 0;
    return {
      usedAi: false,
      aiStatusLabel: "로컬 규칙",
      aiProviderLabel: "",
      aiModelLabel: "",
      aiDecisionCount: 0,
      fallbackDecisionCount: candidateCount,
      reviewStrategy: candidateCount > 0 ? "0.5 stroke/blur 예외 유지 후 최근접 정수 스냅" : "보정 대상 없음",
      decisionMap: new Map(),
    };
  }

  async function requestAiDecisions(candidates) {
    return buildLocalDecisionSummary(candidates);
  }

  function buildDecisionPlans(candidates) {
    const plans = [];
    for (const candidate of candidates) {
      plans.push({
        candidate,
        source: "local",
        targetValue: candidate.nearestValue,
        reason: buildLocalDecisionReason(candidate),
      });
    }

    return plans;
  }

  function buildLocalDecisionReason(candidate) {
    if (!candidate || typeof candidate !== "object") {
      return "가장 가까운 정수로 스냅했습니다.";
    }

    switch (candidate.category) {
      case "position":
        return "가장 가까운 정수 좌표로 스냅했습니다.";
      case "size":
        return "가장 가까운 정수 크기로 스냅했습니다.";
      case "radius":
        return "가장 가까운 정수 반경 값으로 스냅했습니다.";
      case "effect-blur":
      case "effect-offset":
        return "가장 가까운 정수 효과 값으로 스냅했습니다.";
      case "text-size":
      case "text-line-height":
      case "text-letter-spacing":
      case "text-spacing":
        return "가장 가까운 정수 텍스트 값으로 스냅했습니다.";
      case "paint-opacity":
      case "opacity":
        return "가장 가까운 정수 퍼센트로 스냅했습니다.";
      default:
        return "가장 가까운 정수로 스냅했습니다.";
    }
  }

  async function applyPlannedChange(plan) {
    const candidate = plan.candidate;
    const targetValue = plan.targetValue;
    if (!Number.isInteger(targetValue)) {
      throw new Error("정수 목표값이 아닙니다.");
    }

    if (candidate.kind === "position") {
      applyPositionChange(candidate.node, candidate.fieldKey, targetValue);
      return;
    }

    if (candidate.kind === "size") {
      applySizeChange(candidate.node, candidate.fieldKey, targetValue);
      return;
    }

    if (candidate.kind === "effect") {
      applyEffectChange(candidate.node, candidate.effectIndex, candidate.effectPath, targetValue);
      return;
    }

    if (candidate.kind === "text-style") {
      await applyTextStyleChange(candidate, targetValue);
      return;
    }

    if (candidate.kind === "paint-opacity") {
      applyPaintOpacityChange(candidate.node, candidate.meta, targetValue);
      return;
    }

    if (candidate.kind === "scaled-direct") {
      applyScaledDirectChange(candidate.node, candidate.fieldKey, candidate.meta, targetValue);
      return;
    }

    applyDirectChange(candidate.node, candidate.fieldKey, targetValue);
  }

  function applyPositionChange(node, fieldKey, targetValue) {
    const currentX = typeof node.x === "number" ? node.x : null;
    const currentY = typeof node.y === "number" ? node.y : null;
    if (!Number.isFinite(currentX) || !Number.isFinite(currentY)) {
      throw new Error("position 속성을 읽을 수 없습니다.");
    }

    const desiredX = fieldKey === "x" ? targetValue : currentX;
    const desiredY = fieldKey === "y" ? targetValue : currentY;

    if ("x" in node && "y" in node) {
      try {
        node.x = desiredX;
        node.y = desiredY;
      } catch (error) {}
    }

    if (isCloseEnough(node.x, desiredX) && isCloseEnough(node.y, desiredY)) {
      return;
    }

    if (Array.isArray(node.relativeTransform) && node.relativeTransform.length === 2) {
      const deltaX = desiredX - currentX;
      const deltaY = desiredY - currentY;
      const transform = node.relativeTransform;
      node.relativeTransform = [
        [transform[0][0], transform[0][1], roundValue(transform[0][2] + deltaX)],
        [transform[1][0], transform[1][1], roundValue(transform[1][2] + deltaY)],
      ];
    }

    if (!isCloseEnough(node.x, desiredX) || !isCloseEnough(node.y, desiredY)) {
      throw new Error("position 적용에 실패했습니다.");
    }
  }

  function applySizeChange(node, fieldKey, targetValue) {
    if (!canResizeNode(node)) {
      throw new Error("resize 지원 노드가 아닙니다.");
    }

    const currentWidth = typeof node.width === "number" ? node.width : null;
    const currentHeight = typeof node.height === "number" ? node.height : null;
    if (!Number.isFinite(currentWidth) || !Number.isFinite(currentHeight)) {
      throw new Error("현재 크기를 읽을 수 없습니다.");
    }

    const nextWidth = fieldKey === "width" ? targetValue : currentWidth;
    const nextHeight = fieldKey === "height" ? targetValue : currentHeight;
    if (nextWidth < 1 || nextHeight < 1) {
      throw new Error("1px 미만 크기는 적용할 수 없습니다.");
    }

    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(nextWidth, nextHeight);
      return;
    }

    if (typeof node.resize === "function") {
      node.resize(nextWidth, nextHeight);
      return;
    }

    throw new Error("resize API를 사용할 수 없습니다.");
  }

  function applyDirectChange(node, fieldKey, targetValue) {
    if (!node || !(fieldKey in node)) {
      throw new Error("속성 접근에 실패했습니다.");
    }

    node[fieldKey] = targetValue;
  }

  function applyScaledDirectChange(node, fieldKey, meta, targetValue) {
    const valueScale = meta && typeof meta.valueScale === "number" && meta.valueScale > 0 ? meta.valueScale : 1;
    applyDirectChange(node, fieldKey, targetValue / valueScale);
  }

  function applyEffectChange(node, effectIndex, effectPath, targetValue) {
    if (!node || !Array.isArray(node.effects)) {
      throw new Error("effect 속성이 없습니다.");
    }

    const effects = cloneEffects(node.effects);
    const effect = typeof effectIndex === "number" ? effects[effectIndex] : null;
    if (!effect) {
      throw new Error("effect 대상을 찾지 못했습니다.");
    }

    if (!setNestedNumericValue(effect, effectPath, targetValue)) {
      throw new Error("effect 속성 쓰기에 실패했습니다.");
    }

    node.effects = effects;
  }

  async function applyTextStyleChange(candidate, targetValue) {
    const node = candidate && candidate.node;
    const meta = candidate && candidate.meta && typeof candidate.meta === "object" ? candidate.meta : {};
    const textField = typeof meta.textField === "string" ? meta.textField : "";
    if (!node || node.type !== "TEXT" || !textField) {
      throw new Error("text 속성 적용에 실패했습니다.");
    }

    await loadFontsForTextNode(node);

    if (textField === "fontSize" || textField === "paragraphSpacing") {
      if (typeof node[textField] !== "number") {
        throw new Error(`${textField} 값을 읽을 수 없습니다.`);
      }
      node[textField] = targetValue;
      return;
    }

    if (textField === "lineHeight" || textField === "letterSpacing") {
      const currentValue = node[textField];
      const unit = typeof meta.unit === "string" && meta.unit ? meta.unit : currentValue && currentValue.unit;
      if (!unit || currentValue === figma.mixed || !currentValue || typeof currentValue !== "object") {
        throw new Error(`${textField} 값을 수정할 수 없습니다.`);
      }

      node[textField] = {
        unit,
        value: targetValue,
      };
      return;
    }

    throw new Error("지원하지 않는 text 속성입니다.");
  }

  function applyPaintOpacityChange(node, meta, targetValue) {
    const paintListKey = meta && typeof meta.paintListKey === "string" ? meta.paintListKey : "";
    const paintIndex = meta && typeof meta.paintIndex === "number" ? meta.paintIndex : -1;
    const valueScale = meta && typeof meta.valueScale === "number" && meta.valueScale > 0 ? meta.valueScale : 1;
    const paints = node && Array.isArray(node[paintListKey]) ? node[paintListKey] : null;
    if (!paints || paintIndex < 0 || paintIndex >= paints.length) {
      throw new Error("paint opacity 적용에 실패했습니다.");
    }

    const clonedPaints = paints.map((paint) => clonePlainObject(paint));
    clonedPaints[paintIndex].opacity = clampNumber(targetValue / valueScale, 0, 1);
    node[paintListKey] = clonedPaints;
  }

  function buildAppliedEntry(plan) {
    return {
      nodeName: plan.candidate.nodeName,
      nodeType: plan.candidate.nodeType,
      field: plan.candidate.label,
      from: formatNumber(plan.candidate.currentValue),
      to: String(plan.targetValue),
      source: "로컬 규칙",
      reason: plan.reason,
    };
  }

  function supportsAnnotationsForPlans(plans) {
    return Array.isArray(plans) && plans.some((plan) => supportsAnnotationsOnNode(plan && plan.candidate && plan.candidate.node));
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  async function ensureAnnotationCategory(requestedColor, options) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const createIfMissing = !options || options.createIfMissing !== false;
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const nextColor =
        typeof requestedColor === "string" && requestedColor.trim() ? requestedColor.trim().toLowerCase() : ANNOTATION_CATEGORY_COLOR;
      const existing = Array.isArray(categories)
        ? categories.find((category) => category && category.label === ANNOTATION_CATEGORY_LABEL)
        : null;
      if (existing) {
        if (typeof existing.setColor === "function" && existing.color !== nextColor) {
          existing.setColor(nextColor);
        }
        return existing;
      }

      if (!createIfMissing || typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
        return null;
      }

      return await figma.annotations.addAnnotationCategoryAsync({
        label: ANNOTATION_CATEGORY_LABEL,
        color: nextColor,
      });
    } catch (error) {
      return null;
    }
  }

  function applyPixelPerfectAnnotations(plans, category) {
    const applied = [];
    const skipped = [];
    const plansByNode = new Map();
    const unsupportedNodeIds = new Set();

    for (const plan of plans) {
      const node = plan && plan.candidate ? plan.candidate.node : null;
      if (!node) {
        continue;
      }

      if (!supportsAnnotationsOnNode(node)) {
        if (!unsupportedNodeIds.has(node.id)) {
          unsupportedNodeIds.add(node.id);
          skipped.push({
            label: safeName(node),
            reason: "This node type does not support Dev Mode annotations.",
          });
        }
        continue;
      }

      const bucket = plansByNode.get(node.id) || { node, plans: [] };
      bucket.plans.push(plan);
      plansByNode.set(node.id, bucket);
    }

    let annotatedNodeCount = 0;
    let annotationCount = 0;

    for (const bucket of plansByNode.values()) {
      const node = bucket.node;
      const nodePlans = bucket.plans;
      if (!node || !nodePlans.length) {
        continue;
      }

      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedPixelPerfectAnnotation(annotation, category));
        node.annotations = preserved.concat(buildPixelPerfectAnnotation(nodePlans, category));
        annotatedNodeCount += 1;
        annotationCount += 1;
        applied.push(buildPixelPerfectAnnotationResult(node, nodePlans, category));
      } catch (error) {
        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "Failed to add the pixel-perfect annotation."),
        });
      }
    }

    return {
      applied,
      skipped,
      annotatedNodeCount,
      annotationCount,
      modeLabel: annotationCount > 0 ? "Direct apply + Dev Mode annotation" : "Result only",
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
    };
  }

  function removePixelPerfectAnnotations(nodes, category) {
    const cleared = [];
    const skipped = [];
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const node of nodes) {
      let existing = [];
      let managedAnnotations = [];

      try {
        existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        managedAnnotations = existing.filter((annotation) => isManagedPixelPerfectAnnotation(annotation, category));
        if (!managedAnnotations.length) {
          continue;
        }

        const preserved = existing.filter((annotation) => !isManagedPixelPerfectAnnotation(annotation, category));
        node.annotations = preserved;
        clearedNodeCount += 1;
        removedAnnotationCount += managedAnnotations.length;
        cleared.push({
          nodeId: node.id,
          nodeName: safeName(node),
          removedCount: managedAnnotations.length,
        });
      } catch (error) {
        if (!managedAnnotations.length) {
          continue;
        }

        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "Failed to clear the pixel-perfect annotation."),
        });
      }
    }

    return {
      cleared,
      skipped,
      clearedNodeCount,
      removedAnnotationCount,
    };
  }

  function buildResultOnlyAnnotation(plans, reason) {
    const skipped = [];
    if (Array.isArray(plans) && plans.length > 0 && reason) {
      skipped.push({
        label: "Annotations unavailable",
        reason,
      });
    }

    return {
      applied: [],
      skipped,
      annotatedNodeCount: 0,
      annotationCount: 0,
      modeLabel: "Result only",
      categoryLabel: "",
    };
  }

  function buildPixelPerfectAnnotation(plans, category) {
    const previewPlans = Array.isArray(plans) ? plans.slice(0, ANNOTATION_CHANGE_PREVIEW_LIMIT) : [];
    const lines = [ANNOTATION_LABEL_PREFIX];

    previewPlans.forEach((plan) => {
      lines.push(
        `- ${plan.candidate.label}: ${formatNumber(plan.candidate.currentValue)} -> ${plan.targetValue} (${plan.source === "ai" ? "AI" : "Local"})`
      );
    });

    if (Array.isArray(plans) && plans.length > previewPlans.length) {
      lines.push(`- ${plans.length - previewPlans.length} more change(s)`);
    }

    const annotation = {
      label: lines.join("\n"),
    };

    if (category && category.id) {
      annotation.categoryId = category.id;
    }

    return annotation;
  }

  function buildPixelPerfectAnnotationResult(node, plans, category) {
    const previewPlans = Array.isArray(plans) ? plans.slice(0, 2) : [];
    return {
      nodeId: node.id,
      nodeName: safeName(node),
      changeCount: Array.isArray(plans) ? plans.length : 0,
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
      preview: previewPlans
        .map((plan) => `${plan.candidate.label} ${formatNumber(plan.candidate.currentValue)} -> ${plan.targetValue}`)
        .join(" | "),
    };
  }

  function isManagedPixelPerfectAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return typeof label === "string" && (label.startsWith(ANNOTATION_LABEL_PREFIX) || label.startsWith(`[${ANNOTATION_LABEL_PREFIX}]`));
  }

  function shouldPreserveHalfStep(category, fieldKey, value) {
    if (!isHalfStepValue(value)) {
      return false;
    }

    if (category === "stroke") {
      return true;
    }

    if (category === "effect-blur") {
      return true;
    }

    if (typeof fieldKey === "string") {
      const normalized = fieldKey.toLowerCase();
      if (normalized.includes("strokeweight")) {
        return true;
      }
      for (const key of EFFECT_RADIUS_KEYS) {
        if (normalized.endsWith(`.${key.toLowerCase()}`)) {
          return true;
        }
      }
    }

    return false;
  }

  function preserveReasonForCategory(category) {
    if (category === "stroke") {
      return "0.5 단위 stroke 값은 의도값으로 보고 유지했습니다.";
    }

    if (category === "effect-blur") {
      return "0.5 단위 blur/spread 값은 의도값으로 보고 유지했습니다.";
    }

    return "0.5 단위 예외값으로 보고 유지했습니다.";
  }

  function canResizeNode(node) {
    if (!node) {
      return false;
    }

    if (node.type === "GROUP" || node.type === "TEXT" || node.type === "LINE") {
      return false;
    }

    return typeof node.resizeWithoutConstraints === "function" || typeof node.resize === "function";
  }

  function cloneEffects(effects) {
    return effects.map((effect) => clonePlainObject(effect));
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => clonePlainObject(item));
    }

    const clone = {};
    Object.keys(value).forEach((key) => {
      clone[key] = clonePlainObject(value[key]);
    });
    return clone;
  }

  function setNestedNumericValue(target, path, value) {
    if (!target || !Array.isArray(path) || path.length === 0) {
      return false;
    }

    let cursor = target;
    for (let index = 0; index < path.length - 1; index += 1) {
      const key = path[index];
      if (!cursor || typeof cursor !== "object" || !(key in cursor)) {
        return false;
      }
      cursor = cursor[key];
    }

    const lastKey = path[path.length - 1];
    if (!cursor || typeof cursor !== "object" || typeof cursor[lastKey] !== "number") {
      return false;
    }

    cursor[lastKey] = value;
    return true;
  }

  async function loadFontsForTextNode(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    const fontNames = collectEditableFontNames(node);
    for (const fontName of fontNames) {
      await figma.loadFontAsync(fontName);
    }
  }

  function collectEditableFontNames(node) {
    const fontNames = [];
    const seen = new Set();
    const pushFont = (fontName) => {
      if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }

      const key = `${fontName.family}::${fontName.style}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    };

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (const fontName of rangeFonts) {
          pushFont(fontName);
        }
      } catch (error) {}
    }

    if (fontNames.length === 0 && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  function getTextMetricDescriptor(value) {
    if (!value || value === figma.mixed || typeof value !== "object" || value.unit === "AUTO") {
      return null;
    }

    if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
      return null;
    }

    return {
      unit: typeof value.unit === "string" ? value.unit : "",
      value: value.value,
    };
  }

  async function readDesignReadCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_READ_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readCachedResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_PIXEL_PERFECT_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readCachedClearResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_PIXEL_PERFECT_CLEAR_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function writeCachedResult(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_PIXEL_PERFECT_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeCachedClearResult(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_PIXEL_PERFECT_CLEAR_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => String(node.id || ""))
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
  }

  function formatSelectionLabel(selection) {
    const roots = Array.from(selection || []);
    if (!roots.length) {
      return "선택 없음";
    }

    if (roots.length === 1) {
      return safeName(roots[0]);
    }

    return `${safeName(roots[0])} 외 ${roots.length - 1}개`;
  }

  function formatEffectLabel(effect) {
    switch (String(effect && effect.type || "").toUpperCase()) {
      case "DROP_SHADOW":
        return "drop shadow";
      case "INNER_SHADOW":
        return "inner shadow";
      case "LAYER_BLUR":
        return "layer blur";
      case "BACKGROUND_BLUR":
        return "background blur";
      default:
        return "effect";
    }
  }

  function isHalfStepValue(value) {
    return Math.abs(value * 2 - Math.round(value * 2)) <= VALUE_EPSILON;
  }

  function isIntegerValue(value) {
    return Math.abs(value - Math.round(value)) <= VALUE_EPSILON;
  }

  function isCloseEnough(value, expected) {
    return typeof value === "number" && typeof expected === "number" && Math.abs(value - expected) <= VALUE_EPSILON;
  }

  function selectNearestInteger(value) {
    const rounded = Math.round(value);
    const floorValue = Math.floor(value);
    const ceilValue = Math.ceil(value);
    if (rounded === floorValue || rounded === ceilValue) {
      return rounded;
    }
    return Math.abs(value - floorValue) <= Math.abs(ceilValue - value) ? floorValue : ceilValue;
  }

  function roundValue(value) {
    return Math.round(value * 100) / 100;
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatNumber(value) {
    const rounded = roundValue(value);
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function safeName(node) {
    return node && typeof node.name === "string" && node.name.trim().length > 0
      ? node.name.trim()
      : String((node && node.type) || "Unnamed");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children) && node.children.length > 0;
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

;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_DELETE_HIDDEN_LAYERS_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isDeleteHiddenLayersMessage(message)) {
      if (isRunning) {
        postStatus("running", "숨겨진 레이어 삭제가 이미 진행 중입니다.");
        return;
      }

      await runDeleteHiddenLayers();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_DELETE_HIDDEN_LAYERS_PATCH__ = true;

  function isDeleteHiddenLayersMessage(message) {
    return !!message && message.type === "run-delete-hidden-layers";
  }

  async function runDeleteHiddenLayers() {
    isRunning = true;
    postStatus("running", "현재 선택 안의 숨겨진 레이어를 찾고 있습니다.");

    try {
      const result = deleteHiddenLayersInSelection();
      figma.ui.postMessage({
        type: "delete-hidden-layers-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "숨겨진 레이어 삭제에 실패했습니다.");
      figma.ui.postMessage({
        type: "delete-hidden-layers-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function deleteHiddenLayersInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const candidates = collectHiddenDescendants(selection);
    if (!candidates.length) {
      return buildResult({
        selection,
        deleted: [],
        skipped: [],
        candidateCount: 0,
        removedNodeCount: 0,
      });
    }

    const deleted = [];
    const skipped = [];
    let removedNodeCount = 0;

    for (const entry of candidates) {
      const target = entry.node;
      if (!target || target.removed) {
        continue;
      }

      try {
        target.remove();
        removedNodeCount += entry.subtreeSize;
        deleted.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          removedLayerCount: entry.subtreeSize,
        });
      } catch (error) {
        skipped.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          reason: normalizeErrorMessage(error, "해당 레이어를 삭제할 수 없습니다."),
        });
      }
    }

    return buildResult({
      selection,
      deleted,
      skipped,
      candidateCount: candidates.length,
      removedNodeCount,
    });
  }

  function collectHiddenDescendants(selection) {
    const results = [];
    const stack = [];

    for (let rootIndex = selection.length - 1; rootIndex >= 0; rootIndex -= 1) {
      const root = selection[rootIndex];
      if (!hasChildren(root)) {
        continue;
      }

      for (let childIndex = root.children.length - 1; childIndex >= 0; childIndex -= 1) {
        const child = root.children[childIndex];
        stack.push({
          node: child,
          path: `${safeName(root)} / ${safeName(child)}`,
          hiddenByAncestor: root.visible === false,
        });
      }
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const node = current && current.node;
      if (!node || node.removed) {
        continue;
      }

      if (current.hiddenByAncestor || !node.visible) {
        results.push({
          node,
          nodeId: node.id,
          nodeName: safeName(node),
          nodeType: String(node.type || "UNKNOWN"),
          path: current.path,
          subtreeSize: countSubtreeNodes(node),
        });
        continue;
      }

      if (!hasChildren(node)) {
        continue;
      }

      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        const child = node.children[index];
        stack.push({
          node: child,
          path: `${current.path} / ${safeName(child)}`,
          hiddenByAncestor: false,
        });
      }
    }

    return results;
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const deleted = Array.isArray(options.deleted) ? options.deleted : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;
    const removedNodeCount =
      typeof options.removedNodeCount === "number" && Number.isFinite(options.removedNodeCount)
        ? options.removedNodeCount
        : 0;

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        candidateCount,
        deletedCount: deleted.length,
        skippedCount: skipped.length,
        removedNodeCount,
      },
      deleted: deleted.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const deletedCount = summary.deletedCount || 0;
    const skippedCount = summary.skippedCount || 0;
    const removedNodeCount = summary.removedNodeCount || 0;

    if (deletedCount === 0) {
      figma.notify("삭제할 숨겨진 레이어가 없습니다.", { timeout: 1800 });
      return;
    }

    const baseMessage =
      removedNodeCount > deletedCount
        ? `숨겨진 레이어 정리 완료 (${removedNodeCount}개 레이어 제거)`
        : `숨겨진 레이어 정리 완료 (${deletedCount}개 삭제)`;

    const message = skippedCount > 0 ? `${baseMessage}, ${skippedCount}개 건너뜀` : baseMessage;
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "delete-hidden-layers-status",
      status,
      message,
    });
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children) && node.children.length > 0;
  }

  function countSubtreeNodes(node) {
    let count = 0;
    const stack = [node];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      count += 1;
      if (!hasChildren(current)) {
        continue;
      }

      for (let index = current.children.length - 1; index >= 0; index -= 1) {
        stack.push(current.children[index]);
      }
    }

    return count;
  }

  function formatSelectionLabel(selection) {
    if (!selection.length) {
      return "선택 없음";
    }

    if (selection.length === 1) {
      return safeName(selection[0]);
    }

    return `${safeName(selection[0])} 외 ${selection.length - 1}개`;
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }

    if (node && typeof node.type === "string" && node.type.trim()) {
      return node.type.trim();
    }

    return "Unnamed";
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
