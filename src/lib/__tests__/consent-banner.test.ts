import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { before, describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// PDPA consent banner: shown only when analytics is configured; declining is as
// easy as accepting (same size and same style); a labelled region; bilingual
// text from messages/{en,th}.json. Node cannot run TSX directly, so the
// component is transpiled with TypeScript into node_modules/.cache first.
const root = path.resolve(import.meta.dirname, "../../..");
const source = path.join(root, "src/components/analytics/consent-banner.tsx");
const messages = (locale: string) => JSON.parse(fs.readFileSync(path.join(root, `messages/${locale}.json`), "utf8"));

type BannerText = { region: string; title: string; body: string; decline: string; accept: string; choices: string };
let banner: any;

before(async () => {
  const out = ts.transpileModule(fs.readFileSync(source, "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dir = path.join(root, "node_modules/.cache/consent-banner-test");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `consent-banner-${process.pid}.mjs`);
  fs.writeFileSync(file, out);
  banner = await import(pathToFileURL(file).href);
});

const text = (locale: string): BannerText => messages(locale).analyticsConsent;

describe("consent banner", () => {
  it("only imports React: no analytics SDK or provider code in the banner", () => {
    const imports = [...fs.readFileSync(source, "utf8").matchAll(/^import\s+(?!type\b).*from\s+["']([^"']+)["']/gm)].map((m) => m[1]);
    assert.deepEqual(imports.filter((name) => name !== "react"), []);
  });

  it("panel state: hidden when off, banner until a choice, then a small choices control", () => {
    assert.equal(banner.panelState(false, "unknown", false), "hidden");
    assert.equal(banner.panelState(false, "granted", true), "hidden");
    assert.equal(banner.panelState(true, "unknown", false), "banner");
    assert.equal(banner.panelState(true, "granted", false), "choices");
    assert.equal(banner.panelState(true, "denied", false), "choices");
    assert.equal(banner.panelState(true, "denied", true), "banner");
  });

  for (const locale of ["en", "th"]) {
    it(`${locale}: labelled region, Decline then Allow with the same size and style, 44px targets`, () => {
      const t = text(locale);
      const html = renderToStaticMarkup(React.createElement(banner.ConsentBanner, { text: t, onAccept() {}, onDecline() {} }));
      assert.match(html, /role="region"/);
      assert.ok(html.includes(`aria-label="${t.region}"`), "region labelled from messages");
      const buttons = [...html.matchAll(/<button([^>]*)>([^<]+)<\/button>/g)].map((m) => ({
        className: /class="([^"]+)"/.exec(m[1])![1],
        label: m[2],
      }));
      assert.deepEqual(buttons.map((b) => b.label), [t.decline, t.accept]);
      assert.equal(buttons[0].className, buttons[1].className, "same size and same visual style for both choices");
      assert.match(buttons[0].className, /min-h-\[44px\]/);
      assert.match(html, /PostHog/);
      assert.match(html, /EU/);
      assert.doesNotMatch(html, /checked|by continuing/i, "no pre-ticked or implied consent");
    });
  }

  it("buttons call back with the choice", () => {
    const calls: string[] = [];
    const element = banner.ConsentBanner({ text: text("en"), onAccept: () => calls.push("granted"), onDecline: () => calls.push("denied") });
    const found: { props: { onClick: () => void } }[] = [];
    const walk = (node: any): void => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (node.props?.onClick) found.push(node);
      walk(node.props?.children);
    };
    walk(element);
    found.forEach((node) => node.props.onClick());
    assert.deepEqual(calls, ["denied", "granted"]);
  });

  it("choices control reopens the banner and is a 44px tap target", () => {
    let opened = 0;
    const element = banner.ConsentChoicesLink({ label: text("th").choices, onOpen: () => (opened += 1) });
    element.props.onClick();
    assert.equal(opened, 1);
    const html = renderToStaticMarkup(element);
    assert.ok(html.includes(text("th").choices));
    assert.match(html, /min-h-\[44px\]/);
    // In page flow under the footer: a floating control would cover content on phones.
    assert.doesNotMatch(html, /\bfixed\b/);
  });

  it("en and th messages have the same keys and Thai text is translated", () => {
    const en = text("en");
    const th = text("th");
    assert.deepEqual(Object.keys(th).sort(), Object.keys(en).sort());
    for (const key of Object.keys(en) as (keyof BannerText)[]) {
      assert.ok(en[key].trim() && th[key].trim(), key);
    }
    assert.notEqual(th.body, en.body);
    assert.match(th.body, /[฀-๿]/);
  });
});
