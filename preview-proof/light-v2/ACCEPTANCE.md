# Light v2 punch-fix acceptance

SHA: e6fbadc (preview)
URL: https://justinksw.github.io/psychrometric-chart/ (Pages → preview)
Local proof base: http://127.0.0.1:8765/

| # | Item | Pass | Detail |
|---|---|---|---|
| 1 | 4 Defaults B1 | PASS | {"wbChecked":"true","rhChecked":"false","db":"33","wb":"28","raDb":"24","raRh":"50","ratio":"20","coil":"13","reheat":"5","comfort":true,"shr":false,"hasRaWb":false,"preview":true,"segH":44,"derived":68.62714915547718,"cssHasFieldHidden":true} |
| 2 | 2 OA mode A1 tap≥44 | PASS | segH=44 |
| 3 | 8 RA no WB | PASS | hasRaWb=false |
| 4 | 13 PREVIEW badge | PASS | badge=true |
| 5 | 10 WB calc ~68% | PASS | RH=68.6 |
| 6 | P0 CSS .field[hidden] | PASS | css=true |
| 7 | P0 DB+WB computed chromium | PASS | {"rhHiddenAttr":true,"wbHiddenAttr":false,"rhDisplay":"none","wbDisplay":"flex","rhText":" Outdoor RH室外相對濕度 % ","wbText":"Outdoor WB 室外濕球 °C"} |
| 8 | 3 Field swap attrs | PASS | {"rhVal":"68.6","mode":"true","omegaG":21.90204000011478} |
| 9 | 5 State preserve | PASS | ω before=21.91 rh=21.90 wb=21.91 d=0.009/0.000 derivedRH=68.6 roundtripWB=28 |
| 10 | P0 DB+RH computed chromium | PASS | {"rhHiddenAttr":false,"wbHiddenAttr":true,"rhDisplay":"flex","wbDisplay":"none","rhText":"Outdoor RH 室外相對濕度 %","wbText":" Outdoor WB室外濕球 °C WB can’t exceed DB (s"} |
| 11 | 6/P2 WB>DB mid+clamp | PASS | mid={"warnHidden":false,"warnDisplay":"block","val":"36"} after={"warnHidden":true,"val":"33"} sat={"warnHidden":true,"val":"33","rh":100} |
| 12 | 7/P1 BEC first screenful | PASS | {"show":true,"display":"block","text":"Outside typical BEC Outdoor Summer envelope (hint)","top":696.53125,"bottom":742.90625,"sheetTop":489.53125,"inViewport":true,"inSheetFirstBand":true} clearHidden=true |
| 13 | P0 default computed chromium@320 | PASS | {"rhHiddenAttr":true,"wbHiddenAttr":false,"rhDisplay":"none","wbDisplay":"flex","rhText":" Outdoor RH室外相對濕度 % ","wbText":"Outdoor WB °C"} |
| 14 | 1/11 no sx scroll chromium@320 | PASS | {"sw":320,"cw":320,"bodySw":320,"phoneSw":320,"phoneCw":320} |
| 15 | 1/11 no sx scroll chromium@360 | PASS | {"sw":360,"cw":360,"bodySw":360,"phoneSw":360,"phoneCw":360} |
| 16 | P0 default computed chromium@390 | PASS | {"rhHiddenAttr":true,"wbHiddenAttr":false,"rhDisplay":"none","wbDisplay":"flex","rhText":" Outdoor RH室外相對濕度 % ","wbText":"Outdoor WB 室外濕球 °C"} |
| 17 | 1/11 no sx scroll chromium@390 | PASS | {"sw":390,"cw":390,"bodySw":390,"phoneSw":390,"phoneCw":390} |
| 18 | 1/11 no sx scroll chromium@430 | PASS | {"sw":430,"cw":430,"bodySw":430,"phoneSw":430,"phoneCw":430} |
| 19 | 1 Layout chart/sheet | PASS | {"chartTop":47.390625,"sheetTop":489.53125,"chartH":442.140625,"sheetH":354.46875,"noTabs":true} |
| 20 | P0 DB+WB computed webkit | PASS | {"rhHiddenAttr":true,"wbHiddenAttr":false,"rhDisplay":"none","wbDisplay":"flex","rhText":" Outdoor RH室外相對濕度 % ","wbText":"Outdoor WB 室外濕球 °C"} |
| 21 | P0 DB+RH computed webkit | PASS | {"rhHiddenAttr":false,"wbHiddenAttr":true,"rhDisplay":"flex","wbDisplay":"none","rhText":"Outdoor RH 室外相對濕度 %","wbText":" Outdoor WB室外濕球 °C WB can’t exceed DB (s"} |
| 22 | P1 BEC visible webkit | PASS | {"show":true,"display":"block","text":"Outside typical BEC Outdoor Summer envelope (hint)","top":696.53125,"bottom":742.90625,"sheetTop":489.53125,"inViewport":true,"inSheetFirstBand":true} |
| 23 | P0 default computed webkit@320 | PASS | {"rhHiddenAttr":true,"wbHiddenAttr":false,"rhDisplay":"none","wbDisplay":"flex","rhText":" Outdoor RH室外相對濕度 % ","wbText":"Outdoor WB °C"} |
| 24 | 1/11 no sx scroll webkit@320 | PASS | {"sw":320,"cw":320,"bodySw":320,"phoneSw":320,"phoneCw":320} |
| 25 | 1/11 no sx scroll webkit@360 | PASS | {"sw":360,"cw":360,"bodySw":360,"phoneSw":360,"phoneCw":360} |
| 26 | P0 default computed webkit@390 | PASS | {"rhHiddenAttr":true,"wbHiddenAttr":false,"rhDisplay":"none","wbDisplay":"flex","rhText":" Outdoor RH室外相對濕度 % ","wbText":"Outdoor WB 室外濕球 °C"} |
| 27 | 1/11 no sx scroll webkit@390 | PASS | {"sw":390,"cw":390,"bodySw":390,"phoneSw":390,"phoneCw":390} |
| 28 | 1/11 no sx scroll webkit@430 | PASS | {"sw":430,"cw":430,"bodySw":430,"phoneSw":430,"phoneCw":430} |
| 29 | 9 Path/math inherit | PASS | computeProcess + chart path unchanged; WB path added |
| 30 | 12 Not a checker | PASS | no pass/fail UI; BEC hint only; no RA WB; no winter |

**ALL PASS**