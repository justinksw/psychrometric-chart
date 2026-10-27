# Light v2 acceptance

SHA: e176718 (preview)
URL: https://justinksw.github.io/psychrometric-chart/ (Pages → preview)

| # | Item | Pass | Detail |
|---|---|---|---|
| 1 | 4 Defaults B1 | PASS | {"wbChecked":"true","rhChecked":"false","db":"33","wb":"28","rhHidden":true,"wbHidden":false,"raDb":"24","raRh":"50","ratio":"20","coil":"13","reheat":"5","comfort":true,"shr":false,"hasRaWb":false,"preview":true,"segH":44,"derived":68.62714915547718} |
| 2 | 2 OA mode A1 tap≥44 | PASS | segH=44 |
| 3 | 8 RA no WB | PASS | hasRaWb=false |
| 4 | 13 PREVIEW badge | PASS | badge=true |
| 5 | 10 WB calc ~68% | PASS | RH=68.6 |
| 6 | 3 Field swap | PASS | {"rhVal":"68.6","rhHidden":false,"wbHidden":true,"mode":"true","omegaG":21.90204000011478} |
| 7 | 5 State preserve | PASS | ω before=21.91 rh=21.90 wb=21.91 d=0.009/0.000 derivedRH=68.6 roundtripWB=28 |
| 8 | 6 WB>DB C1 | PASS | mid={"warn":true,"val":"36"} after={"warn":false,"val":"33"} sat={"warn":false,"val":"33","rh":100} |
| 9 | 7 BEC badge D1 | PASS | show=true clearHidden=true text=Outside typical BEC Outdoor Summer envel |
| 10 | 1/11 no sx scroll chromium@320 | PASS | {"sw":320,"cw":320,"bodySw":320,"phoneSw":320,"phoneCw":320} |
| 11 | 1/11 no sx scroll chromium@360 | PASS | {"sw":360,"cw":360,"bodySw":360,"phoneSw":360,"phoneCw":360} |
| 12 | 1/11 no sx scroll chromium@390 | PASS | {"sw":390,"cw":390,"bodySw":390,"phoneSw":390,"phoneCw":390} |
| 13 | 1/11 no sx scroll chromium@430 | PASS | {"sw":430,"cw":430,"bodySw":430,"phoneSw":430,"phoneCw":430} |
| 14 | 1 Layout chart/sheet | PASS | {"chartTop":47.390625,"sheetTop":489.53125,"chartH":442.140625,"sheetH":354.46875,"noTabs":true} |
| 15 | 1/11 no sx scroll webkit@320 | PASS | {"sw":320,"cw":320,"bodySw":320,"phoneSw":320,"phoneCw":320} |
| 16 | 1/11 no sx scroll webkit@360 | PASS | {"sw":360,"cw":360,"bodySw":360,"phoneSw":360,"phoneCw":360} |
| 17 | 1/11 no sx scroll webkit@390 | PASS | {"sw":390,"cw":390,"bodySw":390,"phoneSw":390,"phoneCw":390} |
| 18 | 1/11 no sx scroll webkit@430 | PASS | {"sw":430,"cw":430,"bodySw":430,"phoneSw":430,"phoneCw":430} |
| 19 | 9 Path/math inherit | PASS | computeProcess + chart path unchanged; WB path added |
| 20 | 12 Not a checker | PASS | no pass/fail UI; BEC hint only; no RA WB; no winter |

**ALL PASS**