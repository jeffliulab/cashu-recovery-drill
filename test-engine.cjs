"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const {cases, read, available} = require("./engine.js");
test("derivation alone does not provide denominations or prove an output was issued", () => {
  for (const row of read(0, false, 0)) assert.deepEqual([row.value, row.evidence], [null, "Unqueried"]);
});
test("restoration distinguishes signature matches from a missing signature", () => {
  const rows = read(0, false, 1);
  assert.equal(rows.filter(r => r.evidence === "Signature found").length, 3);
  assert.deepEqual(rows[3], {id:"A · 3", value:null, evidence:"No signature"});
  assert.equal(available(rows), 0);
});
test("only signed and unspent proofs have a currently available face value", () => {
  const rows = read(0, false, 2);
  assert.deepEqual(rows.map(r => r.evidence), ["UNSPENT", "PENDING", "SPENT", "No signature"]);
  assert.equal(available(rows), 8);
});
test("a retired keyset adds the unspent value exactly once", () => {
  const baseline = available(read(1, false, 2));
  assert.equal(baseline, 2);
  assert.equal(available(read(1, true, 2)) - baseline, 16);
  assert.equal(available(read(1, true, 2)), 18);
});
test("a seed scan excludes the unswapped bearer token from someone else", () => {
  const rows = read(2, true, 2);
  assert.equal(available(rows), 2);
  assert.ok(rows.every(r => r.value !== 32));
});
test("every exercise has one answer with an explanation and feedback for each alternative", () => {
  for (const c of cases) {
    assert.ok(c.correct >= 0 && c.correct < c.answers.length);
    assert.equal(c.hints.length, c.answers.length);
    assert.ok(c.explanation.length > 0);
    c.hints.forEach((h, i) => assert.equal(Boolean(h), i !== c.correct));
  }
});
