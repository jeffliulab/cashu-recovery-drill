"use strict";
const RecoveryDrill = (() => {
  const cases = [
    {
      name: "Proof states", title: "The interrupted payment", mint: "Alder mint · sat keyset",
      brief: "Before your phone failed, a payment was processing. Restore the signatures, then check what the mint knows about the proofs.",
      records: [
        {id:"A · 0", value:8, state:"UNSPENT"}, {id:"A · 1", value:4, state:"PENDING"},
        {id:"A · 2", value:2, state:"SPENT"}, {id:"A · 3", value:null, state:null}
      ],
      ask: "How many sats have a restored, currently unspent proof?",
      answers: ["8 sats", "12 sats", "14 sats"], correct:0,
      hints: ["", "The 4-sat proof is pending. Its state may change.", "An issued signature can belong to a pending or spent proof."],
      explanation: "8 sats. The 4-sat proof is pending and must be checked again later. The 2-sat proof was spent. One candidate had no matching signature."
    },
    {
      name:"Retired keyset", title:"The mint rotated its keys", mint:"Birch mint · two sat keysets",
      brief:"Your wallet used Birch before and after it changed issuance keys. Compare the first result with a scan that also includes the retired keyset.",
      records:[{id:"New · 0", value:2, state:"UNSPENT"},{id:"Old · 0", old:true, value:16, state:"UNSPENT"},{id:"Old · 1", old:true, value:4, state:"SPENT"}],
      ask:"What unspent face value did the retired keyset add?",
      answers:["4 sats", "16 sats", "20 sats"], correct:1,
      hints:["The old 4-sat proof was spent.", "", "Both old signatures were found. Only one has an unspent proof."],
      explanation:"16 sats came from the retired keyset. The current keyset accounts for another 2 sats. A keyset can stop issuing new proofs while old proofs still have value."
    },
    {
      name:"Received offline", title:"The unopened payment", mint:"Elm mint · sat keyset",
      brief:"A friend sent you a 32-sat bearer token. You saved it on the lost phone and never swapped it into your own outputs. Separately, you had received a 2-sat proof issued to your wallet.",
      records:[{id:"E · 0", value:2, state:"UNSPENT"},{id:"E · 1", value:null, state:null}],
      ask:"What could recover the separate 32-sat payment?",
      answers:["Repeat the same seed scan", "A fresh copy of the original token, if it remains unspent", "Add 32 sats from the payment message"], correct:1,
      hints:["Repeating derivation reproduces the same candidates. The sender generated the token secrets.", "", "A message describing a payment does not contain a spendable proof."],
      explanation:"An intact backup or original copy can provide the received proofs. Verify their state before counting them. The recipient’s seed can reproduce the separate 2-sat proof in this example."
    }
  ];
  function read(caseIndex, oldIncluded, step) {
    return cases[caseIndex].records.filter(row => !row.old || oldIncluded).map(row => {
      if (step === 0) return {id:row.id, value:null, evidence:"Unqueried"};
      if (row.value === null) return {id:row.id, value:null, evidence:"No signature"};
      return {id:row.id, value:row.value, evidence:step === 1 ? "Signature found" : row.state};
    });
  }
  function available(rows) {
    return rows.reduce((sum, row) => sum + (row.evidence === "UNSPENT" ? row.value : 0), 0);
  }
  return {cases, read, available};
})();
if (typeof module !== "undefined" && module.exports) module.exports = RecoveryDrill;
