import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const read = (date) => JSON.parse(readFileSync(new URL(`../src/data/briefings/${date}.context.json`, import.meta.url), "utf8"));

test("12 November keeps verified buy/sell bid/ask snapshot", () => {
  const context = read("2026-11-12");
  assert.equal(context.edition_date, "2026-11-12");
  assert.equal(context.exchange_rates.rates.length, 4);
  assert.ok(context.exchange_rates.rates.every((rate) => Number.isFinite(rate.buy) && Number.isFinite(rate.sell)));
});

test("14 November uses approximate rates only, never invented bid/ask", () => {
  const context = read("2026-11-14");
  const fx = context.indicative_exchange_rates;
  assert.equal(context.edition_date, "2026-11-14");
  assert.equal(fx.as_of_date, context.edition_date);
  assert.equal(context.exchange_rates, null);
  assert.equal(context.market.length, 0);
  assert.equal(fx.rates.length, 4);
  assert.match(fx.source_url, /^https:\/\//);
  const seen = new Set();
  for (const rate of fx.rates) {
    assert.ok(["عدن", "صنعاء"].includes(rate.city));
    assert.ok(["USD", "SAR"].includes(rate.code));
    assert.ok(Number.isFinite(rate.low) && Number.isFinite(rate.high));
    assert.ok(rate.low > 0 && rate.low <= rate.high);
    assert.equal("buy" in rate || "sell" in rate, false);
    assert.ok(rate.qualifier.trim().length > 0);
    const key = rate.city + ":" + rate.code;
    assert.equal(seen.has(key), false);
    seen.add(key);
  }
});

test("21 November dated reference board uses two distinct YER markets and previous-session oil/gold closes",()=>{
 const c=read("2026-11-21");
 assert.equal(c.edition_date,"2026-11-21");
 assert.equal(c.exchange_rates.as_of_date,"2026-11-21");
 assert.equal(c.exchange_rates.rates.length,4);
 assert.equal(c.indicative_exchange_rates,null);
 assert.deepEqual(new Set(c.exchange_rates.rates.map(x=>x.city+":"+x.code)).size,4);
 for(const rate of c.exchange_rates.rates){
   assert.ok(rate.buy>0&&rate.buy<=rate.sell);
 }
 for(const commodity of c.market){
   assert.equal(commodity.as_of_date,"2026-11-20");
   assert.ok(commodity.value>0);
   assert.match(commodity.source_url,/^https:\/\//);
 }
 assert.deepEqual(c.market.map(x=>x.id),["brent","gold"]);
});
