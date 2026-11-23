"use strict";
const byId = id => document.getElementById(id);
const {cases, read, available} = RecoveryDrill;
const completed = new Set();
let current = 0;
let step = 0;
let oldIncluded = false;
let baselineSeen = false;
let solved = false;

function recordTable(rows) {
  byId("rows").replaceChildren(...rows.map(row => {
    const tr = document.createElement("tr");
    for (const text of [row.id, row.value === null ? "—" : row.value + " sat", row.evidence]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.append(td);
    }
    return tr;
  }));
}

function navigation() {
  Array.from(byId("cases").children).forEach((button, index) => {
    button.textContent = cases[index].name + (completed.has(index) ? " ✓" : "");
    button.setAttribute("aria-label", cases[index].name + (completed.has(index) ? ", completed" : ""));
    if (index === current) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
}

function answer(index, selected) {
  const c = cases[current];
  for (const b of byId("answers").children) b.setAttribute("aria-pressed", String(b === selected));
  if (index !== c.correct) {
    byId("feedback").textContent = c.hints[index] + " Try another answer.";
    return;
  }
  solved = true;
  byId("old").disabled = true;
  completed.add(current);
  for (const b of byId("answers").children) b.disabled = true;
  byId("feedback").textContent = c.explanation;
  byId("next").textContent = completed.size === cases.length ? "Finish drill" : "Next exercise";
  byId("next").hidden = false;
  navigation();
}

function render() {
  const rows = read(current, oldIncluded, step);
  const c = cases[current];
  byId("case-num").textContent = "Exercise " + (current + 1) + " of " + cases.length;
  byId("case-title").textContent = c.title;
  byId("brief").textContent = c.brief;
  byId("mint-label").textContent = c.mint;
  byId("scope").hidden = current !== 1;
  byId("old").checked = oldIncluded;
  byId("old").disabled = !baselineSeen || solved;
  byId("restore").disabled = step !== 0;
  byId("check").disabled = step !== 1;
  const canAnswer = step === 2 && (current !== 1 || oldIncluded);
  byId("decision").hidden = !canAnswer;
  byId("finish").hidden = true;
  byId("feedback").textContent = "";
  byId("next").hidden = true;
  byId("answers").replaceChildren();
  recordTable(rows);
  if (step === 0) {
    byId("status").textContent = oldIncluded ? "Run the restore again with both keysets." : "Start by looking up signatures for the wallet’s derived candidates.";
    byId("record-note").textContent = "The short labels stand for fictional derived candidates.";
  } else if (step === 1) {
    byId("status").textContent = "Check the state of each reconstructed proof.";
    byId("record-note").textContent = "Matching signatures establish issuance. Spendability is still unknown.";
  } else {
    if (current === 1 && !oldIncluded) {
      byId("status").textContent = "Current keyset checked. Select the retired keyset to extend the scan.";
      byId("record-note").textContent = "Current keyset subtotal: " + available(rows) + " sat unspent.";
    } else {
      byId("status").textContent = "Both checks are complete. Use the record to answer below.";
      byId("record-note").textContent = "States apply at the time of this simulated check.";
    }
  }
  if (canAnswer) {
    byId("question").textContent = c.ask;
    c.answers.forEach((label, i) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => answer(i, b));
      byId("answers").append(b);
    });
  }
  navigation();
}

function openCase(index, focus) {
  current = index;
  step = 0;
  oldIncluded = false;
  baselineSeen = false;
  solved = false;
  render();
  if (focus) byId("case-title").focus();
}

cases.forEach((c, i) => {
  const b = document.createElement("button");
  b.addEventListener("click", () => openCase(i, true));
  byId("cases").append(b);
});
byId("restore").addEventListener("click", () => { step = 1; render(); byId("check").focus(); });
byId("check").addEventListener("click", () => {
  if (current === 1 && !oldIncluded) baselineSeen = true;
  step = 2;
  render();
  if (current === 1 && !oldIncluded) byId("old").focus();
  else byId("answers").firstElementChild.focus();
});
byId("old").addEventListener("change", () => { oldIncluded = byId("old").checked; step = 0; render(); byId("restore").focus(); });
byId("next").addEventListener("click", () => {
  if (completed.size === cases.length) {
    byId("finish").hidden = false;
    byId("next").hidden = true;
    byId("finish-title").focus();
  } else openCase(cases.findIndex((_, i) => !completed.has(i)), true);
});
byId("again").addEventListener("click", () => { completed.clear(); openCase(0, true); });
openCase(0, false);
