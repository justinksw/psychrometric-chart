import { chromium, webkit } from "/tmp/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

const OUT = "/tmp/psychrometric-chart/preview-proof";
const BASE = "http://127.0.0.1:8765/";
const widths = [320, 360, 390, 430];
const height = 844;

const report = [];

function log(msg) {
  console.log(msg);
  report.push(msg);
}

async function checkPage(browserName, browser, width, query = "") {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const url = BASE + (query ? "?" + query : "");
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const app = document.getElementById("app");
    const chart = document.querySelector(".chart-pane");
    const sheet = document.querySelector(".sheet");
    const sx = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      || document.body.scrollWidth > document.body.clientWidth + 1
      || (app && app.scrollWidth > app.clientWidth + 1);
    const vh = window.innerHeight;
    const chartH = chart ? chart.getBoundingClientRect().height : 0;
    const sheetH = sheet ? sheet.getBoundingClientRect().height : 0;
    const comfortOn = document.getElementById("togComfort").checked;
    const shrOn = document.getElementById("togShr").checked;
    const room = document.getElementById("pt-room");
    const roomVisible = room && room.style.display !== "none" && room.classList.contains("on");
    const reheat = document.getElementById("seg-reheat");
    let reheatHoriz = null;
    if (reheat) {
      const y1 = parseFloat(reheat.getAttribute("y1"));
      const y2 = parseFloat(reheat.getAttribute("y2"));
      reheatHoriz = Math.abs(y1 - y2) < 0.5;
    }
    const oa = document.getElementById("oaDb")?.value;
    const oaRh = document.getElementById("oaRh")?.value;
    const ra = document.getElementById("raDb")?.value;
    const raRh = document.getElementById("raRh")?.value;
    const coil = document.getElementById("coilLeave")?.value;
    const reheatDt = document.getElementById("reheat")?.value;
    const ratio = document.getElementById("oaRatio")?.value;
    // tap targets
    const play = document.getElementById("btnPlay")?.getBoundingClientRect();
    const sw = document.querySelector(".switch")?.getBoundingClientRect();
    const hasTabBar = !!document.querySelector('[role="tablist"], .tab-bar, nav.tabs');
    // contrast spot: ink on canvas
    // axis label exists
    const axisTexts = Array.from(document.querySelectorAll("svg text")).map(t => t.textContent);
    return {
      sx,
      chartPct: chartH / vh,
      sheetPct: sheetH / vh,
      comfortOn,
      shrOn,
      roomVisible,
      reheatHoriz,
      defaults: { oa, oaRh, ra, raRh, coil, reheatDt, ratio },
      playH: play?.height,
      playW: play?.width,
      switchH: sw?.height,
      switchW: sw?.width,
      hasTabBar,
      axisTexts,
    };
  });

  const tag = `${browserName}-${width}${query ? "-" + query.replace(/=/g,"").replace(/&/g,"_") : ""}`;
  const shot = path.join(OUT, `${tag}.png`);
  await page.screenshot({ path: shot, fullPage: false });

  log(`[${browserName} ${width}] sx=${metrics.sx} chart%=${(metrics.chartPct*100).toFixed(1)} sheet%=${(metrics.sheetPct*100).toFixed(1)} comfort=${metrics.comfortOn} shr=${metrics.shrOn} roomVis=${metrics.roomVisible} reheatHoriz=${metrics.reheatHoriz} play=${metrics.playW}x${metrics.playH} switch=${metrics.switchW}x${metrics.switchH} tabBar=${metrics.hasTabBar}`);
  log(`  defaults ${JSON.stringify(metrics.defaults)}`);
  log(`  axes: ${metrics.axisTexts.filter(t => /DB|ω|Comfort/.test(t)).join(" | ")}`);
  log(`  shot: ${shot}`);

  await context.close();
  return metrics;
}

async function runBrowser(name, launcher) {
  let browser;
  try {
    browser = await launcher.launch({ headless: true });
  } catch (e) {
    log(`FAIL launch ${name}: ${e.message}`);
    return;
  }
  try {
    for (const w of widths) {
      await checkPage(name, browser, w, "step=4");
    }
    // SHR on at 390
    await checkPage(name, browser, 390, "shr=1");
    // popover
    await checkPage(name, browser, 390, "pop=1&point=Mix");
    // reduced motion
    const context = await browser.newContext({
      viewport: { width: 390, height },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(BASE + "?step=1", { waitUntil: "networkidle" });
    await page.click("#btnPlay");
    await page.waitForTimeout(300);
    const step = await page.evaluate(() => document.getElementById("stepCaption")?.textContent?.slice(0, 1));
    const shot = path.join(OUT, `${name}-390-reduced-motion.png`);
    await page.screenshot({ path: shot, fullPage: false });
    log(`[${name} reduced-motion] after Play caption starts with: ${step} (expect 6) shot=${shot}`);
    await context.close();
  } finally {
    await browser.close();
  }
}

await runBrowser("chromium", chromium);
await runBrowser("webkit", webkit);

fs.writeFileSync(path.join(OUT, "REPORT.txt"), report.join("\n") + "\n");
log("DONE");
