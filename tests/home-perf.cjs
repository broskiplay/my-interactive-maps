#!/usr/bin/env node
// Chromium smoke + lightweight field-like metrics for the *local* homepage.
// Runs against the PR branch, never publishes or edits the site.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");
const base = process.env.BP_TEST_URL || "http://127.0.0.1:8000/";
const rows = [];

async function collect(page, label) {
  // Chromium Performance API timing is diagnostic, not a controlled lab score.
  const x = await page.evaluate(() => ({
    nav: performance.getEntriesByType("navigation")[0]?.duration ?? null,
    fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null,
    lcp: window.__bpMetrics?.lcp ?? null,
    cls: window.__bpMetrics?.cls ?? 0,
    longTasks: window.__bpMetrics?.longTasks ?? 0,
    scripts: performance.getEntriesByType("resource").filter(v => v.initiatorType === "script").length,
    width: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    libraryCards: document.querySelectorAll("#games-container > details.game-dropdown").length,
  }));
  rows.push({ label, ...x });
  console.log(label, JSON.stringify(x));
  assert.equal(x.libraryCards, 13, "All prerendered game cards must remain available");
  return x;
}
async function open(browser, name, opts) {
  const context = await browser.newContext(opts);
  await context.addInitScript(() => {
    window.__bpMetrics = { lcp:null, cls:0, longTasks:0 };
    try { new PerformanceObserver(list => {
      const entries = list.getEntries();
      if (entries.length) window.__bpMetrics.lcp = entries[entries.length - 1].startTime;
    }).observe({type:"largest-contentful-paint",buffered:true}); } catch {}
    try { new PerformanceObserver(list => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__bpMetrics.cls += e.value;
    }).observe({type:"layout-shift",buffered:true}); } catch {}
    try { new PerformanceObserver(list => { window.__bpMetrics.longTasks += list.getEntries().length; })
      .observe({type:"longtask",buffered:true}); } catch {}
  });
  const page = await context.newPage();
  await page.goto(base, {waitUntil:"domcontentloaded", timeout:45000});
  await page.locator(".lib-sort button[data-mode=all]").waitFor({timeout:15000});
  await page.locator("#games-container > details.game-dropdown").first().waitFor();
  await page.waitForTimeout(500);
  await collect(page,name);
  return {context,page};
}
(async () => {
  const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
  try {
    const {context, page} = await open(browser,"desktop 1440px",{viewport:{width:1440,height:900}});
    const q = page.locator("#game-search-input");
    await q.fill("Stellar Blade");
    assert.equal(await page.locator("#games-container > details.game-dropdown:visible").count(),1,"Search for Stellar Blade");
    await page.locator(".lib-sort button[data-mode=db]").click();
    assert.equal(await page.locator("#games-container > details.game-dropdown:visible").count(),0,"Search combines with database filter");
    await page.locator(".lib-reset").click();
    assert.equal(await page.locator("#games-container > details.game-dropdown:visible").count(),13,"Reset restores library");
    assert.equal(await q.inputValue(),"","Reset clears search");
    await page.keyboard.press("/");
    assert.equal(await q.evaluate(el => document.activeElement === el),true,"Slash shortcut focuses search");
    await q.fill("Skyrim");
    await q.press("Escape");
    assert.equal(await q.inputValue(),"","Escape clears search");
    const button = page.locator(".view-toggle button[data-view=list]");
    await button.click();
    assert.equal(await page.locator("#games-container").evaluate(el=>el.classList.contains("is-list")),true,"List view");
    await page.locator(".view-toggle button[data-view=grid]").click();
    assert.equal(await page.locator("#games-container").evaluate(el=>el.classList.contains("is-list")),false,"Grid view");
    // Check collapsed cards can still be expanded, not only searched.
    const expandable = page.locator("#games-container > details.game-dropdown").filter({has:page.locator(".game-cta.is-pick")}).first();
    if (await expandable.count()) {
      await expandable.locator("summary").click({position:{x:100,y:50}});
      assert.equal(await expandable.evaluate(el=>el.open),true,"Multi-map game expands");
    }
    await context.close();

    for (const width of [375, 320, 768]) {
      const {context: mobile, page: p} = await open(browser,"mobile "+width+"px",{
        viewport:{width,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2
      });
      const overflow = await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      if (overflow > 2) console.warn("Horizontal page overflow at "+width+"px: "+overflow+"px");
      await p.locator("#game-search-input").fill("Skyrim");
      assert.equal(await p.locator("#games-container > details.game-dropdown:visible").count(),1,"Mobile search "+width);
      await mobile.close();
    }

    const lines=["## BroskiPlay V2.6 — Chromium PR smoke and timing","","| Viewport | FCP (ms) | LCP* (ms) | CLS* | Long tasks | Horizontal overflow (px) |","|---|---:|---:|---:|---:|---:|"];
    for(const row of rows)lines.push("| "+row.label+" | "+(row.fcp?.toFixed(0)??"n/a")+" | "+(row.lcp?.toFixed(0)??"n/a")+" | "+row.cls.toFixed(3)+" | "+row.longTasks+" | "+row.overflow+" |");
    lines.push("","*Diagnostic single-run measurements from Chromium on GitHub-hosted runner; not a Lighthouse score or real-user CrUX data.*");
    console.log(lines.join("\n"));
    if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n")+"\n");
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
