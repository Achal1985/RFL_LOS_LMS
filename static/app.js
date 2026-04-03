const STAGE_PLAYBOOK = [
  { title: "Lead Generation", action: "Review lead and decide", detail: "End user reviews the generated lead and must approve or reject it before the LOS journey proceeds.", view: "pipeline", tab: "journey" },
  { title: "Customer Details", action: "Capture customer details", detail: "Fill applicant profile, address, occupation, banking, and business or income details.", view: "pipeline", tab: "journey" },
  { title: "KYC Verification", action: "Open verification hub", detail: "Verify PAN, CKYC, address proof and income documents in the verification workspace.", view: "verification", tab: "risk" },
  { title: "Aadhaar Verification", action: "Open Aadhaar verification", detail: "Collect Aadhaar consent and validate identity match through the verification hub.", view: "verification", tab: "risk" },
  { title: "Dedupe Check", action: "Run dedupe review", detail: "Check for duplicates across internal records, mobile number, and previous applications.", view: "verification", tab: "risk" },
  { title: "CIBIL Check", action: "Move to credit desk", detail: "Review bureau score, delinquency trend, exposure and inquiry behavior.", view: "credit", tab: "risk" },
  { title: "Charges Summary", action: "Capture deductions grid", detail: "Enter charge type and charge amount in the deduction grid before field verification starts.", view: "credit", tab: "risk" },
  { title: "Field Verification", action: "Open field verification queue", detail: "Validate residence or business visit remarks before underwriting.", view: "verification", tab: "risk" },
  { title: "Underwriter Eligibility", action: "Review policy eligibility", detail: "System displays policy rule-engine outcomes and eligible files move ahead automatically.", view: "credit", tab: "risk" },
  { title: "Repayment Generation", action: "Open disbursement desk", detail: "Generate EMI schedule and repayment structure after approval.", view: "disbursement", tab: "repayment" },
  { title: "Document Collection", action: "Collect final documents", detail: "Obtain sanction letter, agreements and pending income or security papers.", view: "disbursement", tab: "documents" },
  { title: "E-Sign", action: "Trigger e-sign process", detail: "Customer completes agreement signing digitally before final release.", view: "disbursement", tab: "documents" },
  { title: "Disbursement", action: "Release funds", detail: "Confirm payee, dates, charges-adjusted disbursal amount and final document downloads.", view: "disbursement", tab: "repayment" }
];

const STAGE_FORM_DEFS = {
  2: {
    title: "KYC Verification Form",
    view: "verification",
    fields: [
      { name: "pan_number", label: "PAN Number", type: "text" },
      { name: "ckyc_id", label: "CKYC ID", type: "text" },
      { name: "address_proof", label: "Address Proof", type: "master-select", optionsKey: "address_proof" },
      { name: "income_proof", label: "Income Proof", type: "master-select", optionsKey: "income_proof" },
      { name: "otp", label: "Verification OTP", type: "text" }
    ],
    helper: "Enter PAN and CKYC, then complete OTP verification."
  },
  3: {
    title: "Aadhaar Verification Form",
    view: "verification",
    fields: [
      { name: "aadhaar_last4", label: "Aadhaar Last 4 Digits", type: "text" },
      { name: "consent_status", label: "Consent Status", type: "master-select", optionsKey: "consent_status" },
      { name: "name_match", label: "Name Match", type: "master-select", optionsKey: "name_match" }
    ]
  },
  4: {
    title: "Dedupe Check Form",
    view: "verification",
    fields: [
      { name: "mobile_match", label: "Mobile Match Result", type: "text", readonly: true, defaultValue: "No Duplicate Mobile Match" },
      { name: "pan_match", label: "PAN Match Result", type: "text", readonly: true, defaultValue: "No Duplicate PAN Match" },
      { name: "dedupe_result", label: "Dedupe Final Remark", type: "text", readonly: true, defaultValue: "Clear - no prior active application found" }
    ],
    helper: "System auto-populates dummy dedupe outputs."
  },
  5: {
    title: "CIBIL Check Form",
    view: "credit",
    fields: [
      { name: "cibil_score", label: "CIBIL Score", type: "number", defaultValue: "748", readonly: true },
      { name: "foir", label: "FOIR", type: "number", defaultValue: "41", readonly: true },
      { name: "ltv", label: "LTV", type: "number", defaultValue: "58", readonly: true },
      { name: "bureau_summary", label: "Bureau Summary", type: "text", defaultValue: "Dummy bureau pull: low delinquency trend, moderate exposure, 2 recent inquiries", readonly: true }
    ],
    helper: "System auto-fills dummy bureau details and then moves the file to Charges Summary."
  },
  6: {
    title: "Charges Summary Form",
    view: "credit",
    fields: [
      { name: "charge_type_1", label: "Charge Type 1", type: "master-select", optionsKey: "charge_type" },
      { name: "charge_amount_1", label: "Charge Amount 1", type: "number", step: "0.01" },
      { name: "charge_type_2", label: "Charge Type 2", type: "master-select", optionsKey: "charge_type" },
      { name: "charge_amount_2", label: "Charge Amount 2", type: "number", step: "0.01" },
      { name: "charge_type_3", label: "Charge Type 3", type: "master-select", optionsKey: "charge_type" },
      { name: "charge_amount_3", label: "Charge Amount 3", type: "number", step: "0.01" }
    ],
    helper: "Enter deductions in the grid below. All charge rows are mandatory before field verification."
  },
  7: {
    title: "Field Verification Form",
    view: "verification",
    fields: [
      { name: "agency_name", label: "Field Agency", type: "select", options: [] },
      { name: "visit_status", label: "Visit Status", type: "text" },
      { name: "verifier_name", label: "Verifier Name", type: "text" },
      { name: "fv_remark", label: "Field Verification Remark", type: "text" }
    ],
    helper: "Field agency is master-driven with dummy values."
  },
  8: {
    title: "Underwriting Form",
    view: "credit",
    fields: [
      { name: "uw_decision_note", label: "UW Decision Note", type: "text" },
      { name: "policy_fit", label: "Policy Fit", type: "master-select", optionsKey: "policy_fit" },
      { name: "risk_band", label: "Risk Band", type: "master-select", optionsKey: "risk_band" },
      { name: "deviation_flag", label: "Deviation", type: "master-select", optionsKey: "deviation_flag" },
      { name: "deviation_note", label: "Deviation Note", type: "text", defaultValue: "No deviation observed" },
      { name: "deviation_approval", label: "Deviation Approval", type: "master-select", optionsKey: "deviation_approval" }
    ],
    helper: "Policy rule engine results are shown below. Eligible files move automatically to Repayment Generation."
  },
  9: {
    title: "Repayment Generation Form",
    view: "disbursement",
    fields: [
      { name: "opening_principal", label: "Opening Principal", type: "number", readonly: true },
      { name: "emi_amount", label: "EMI Amount", type: "number", readonly: true },
      { name: "rate_of_interest", label: "Rate of Interest", type: "number", readonly: true, step: "0.01" }
    ],
    helper: "System auto-generates opening principal, EMI amount and rate of interest."
  },
  10: {
    title: "Document Collection Form",
    view: "disbursement",
    fields: [
      { name: "sanction_letter", label: "Sanction Letter Status", type: "text" },
      { name: "agreement_pack", label: "Agreement Pack Status", type: "text" },
      { name: "document_status", label: "Overall Document Status", type: "text" }
    ],
    helper: "Upload a document to simulate OCR verification."
  },
  11: {
    title: "E-Sign Form",
    view: "disbursement",
    fields: [
      { name: "esign_provider", label: "E-Sign Provider", type: "text" },
      { name: "esign_status", label: "E-Sign Status", type: "text" },
      { name: "mandate_reference", label: "Mandate Reference", type: "text" },
      { name: "signature_data", label: "Signature Data", type: "hidden" }
    ],
    helper: "Use the mouse to sign in the signature box."
  },
  12: {
    title: "Disbursement Form",
    view: "disbursement",
    fields: [
      { name: "disbursal_mode", label: "Disbursal Mode", type: "master-select", optionsKey: "disbursal_mode" },
      { name: "disbursal_account", label: "Disbursal Account", type: "text", readonly: true },
      { name: "payee_name", label: "Payee Name", type: "text", readonly: true },
      { name: "disbursal_date", label: "Disbursal Date", type: "date" },
      { name: "interest_start_date", label: "Interest Start Date", type: "date" },
      { name: "net_disbursal_amount", label: "Net Disbursal Amount", type: "number", readonly: true }
    ],
    helper: "System calculates net disbursal after deducting collected charges and shows final loan summary with downloads."
  }
};

const LMS_MODULE_DEFS = {
  soa: {
    title: "Statement of Account",
    detail: "Generate SOA and review installment-wise account movement for the live loan.",
    summary: "SOA shows EMI status, principal, interest, and payment tracking after disbursal.",
    reports: [{ label: "Download SOA PDF", path: "soa-pdf" }]
  },
  case_viewer: {
    title: "Case Viewer",
    detail: "Review the agreement-level snapshot, disbursal details, charges, and customer profile.",
    summary: "Use Case Viewer for quick LMS lookup of customer, agreement, product and disbursal data."
  },
  post_disbursal_edit: {
    title: "Post Disbursal Edit",
    detail: "Capture post-booking customer and account edits with maker remarks and reason code.",
    summary: "Master-driven edit reasons help track profile corrections after booking.",
    section: "post_disbursal_edit",
    fields: [
      { name: "edit_reason", label: "Edit Reason", type: "master-select", optionsKey: "lms_edit_reason" },
      { name: "updated_mobile", label: "Updated Mobile", type: "text" },
      { name: "updated_email", label: "Updated Email", type: "email" },
      { name: "updated_account", label: "Updated Account Number", type: "text" },
      { name: "maker_remark", label: "Maker Remark", type: "text" }
    ]
  },
  foreclosure: {
    title: "Foreclosure of Loan",
    detail: "Record the foreclosure request, quoted amount, charge treatment, and final status.",
    summary: "Foreclosure tracking stores request date, quote amount, and closure progression.",
    section: "foreclosure",
    fields: [
      { name: "foreclosure_date", label: "Foreclosure Date", type: "date" },
      { name: "quoted_amount", label: "Quoted Amount", type: "number", step: "0.01" },
      { name: "foreclosure_status", label: "Foreclosure Status", type: "master-select", optionsKey: "foreclosure_status" },
      { name: "foreclosure_remark", label: "Foreclosure Remark", type: "text" }
    ],
    reports: [{ label: "Download Foreclosure Quote", path: "sanction-letter" }]
  },
  reschedule: {
    title: "Reschedule of Loan",
    detail: "Change tenor, ROI, or EMI basis with effective date and approved reason.",
    summary: "Loan rescheduling updates revised terms for servicing and future collections.",
    section: "reschedule",
    fields: [
      { name: "reschedule_reason", label: "Reschedule Reason", type: "master-select", optionsKey: "reschedule_reason" },
      { name: "new_tenor", label: "New Tenor (months)", type: "number" },
      { name: "new_roi", label: "New ROI", type: "number", step: "0.01" },
      { name: "effective_date", label: "Effective Date", type: "date" },
      { name: "revised_emi", label: "Revised EMI", type: "number", step: "0.01" }
    ]
  },
  npa_movement: {
    title: "NPA Movement",
    detail: "Track DPD bucket, NPA stage, movement date, and recovery remarks.",
    summary: "Use NPA movement to simulate delinquency staging in LMS.",
    section: "npa_movement",
    fields: [
      { name: "dpd_bucket", label: "DPD Bucket", type: "text" },
      { name: "npa_stage", label: "NPA Stage", type: "master-select", optionsKey: "npa_stage" },
      { name: "effective_date", label: "Effective Date", type: "date" },
      { name: "movement_remark", label: "Movement Remark", type: "text" }
    ]
  },
  banking_presentations: {
    title: "Banking Presentation",
    detail: "Create banking presentations with date, instrument mode, amount, and batch reference.",
    summary: "Presentation data drives downstream bank status and return handling.",
    section: "banking_presentations",
    fields: [
      { name: "presentation_date", label: "Presentation Date", type: "date" },
      { name: "presentation_mode", label: "Presentation Mode", type: "master-select", optionsKey: "presentation_mode" },
      { name: "presentation_amount", label: "Presentation Amount", type: "number", step: "0.01" },
      { name: "batch_reference", label: "Batch Reference", type: "text" },
      { name: "cycle", label: "Cycle", type: "text" }
    ]
  },
  banking_status_updates: {
    title: "Banking Status Updation",
    detail: "Update clearing status, bank response, and return reason against presented instruments.",
    summary: "Bank status updates help distinguish cleared, returned, and represented transactions.",
    section: "banking_status_updates",
    fields: [
      { name: "presentation_ref", label: "Presentation Reference", type: "text" },
      { name: "bank_status", label: "Bank Status", type: "master-select", optionsKey: "bank_status" },
      { name: "return_reason", label: "Return Reason", type: "master-select", optionsKey: "return_reason" },
      { name: "status_date", label: "Status Date", type: "date" }
    ]
  },
  collection_updates: {
    title: "Collection Updation",
    detail: "Capture collection receipts with amount, channel, collector, and collection remark.",
    summary: "Collections feed the SOA and servicing totals in LMS.",
    section: "collection_updates",
    fields: [
      { name: "collection_date", label: "Collection Date", type: "date" },
      { name: "collection_channel", label: "Collection Channel", type: "master-select", optionsKey: "collection_channel" },
      { name: "collection_amount", label: "Collection Amount", type: "number", step: "0.01" },
      { name: "collector_name", label: "Collector Name", type: "text" },
      { name: "collection_remark", label: "Collection Remark", type: "text" }
    ],
    reports: [{ label: "Download Collection Register", path: "collection-report" }]
  },
  knockoff_entries: {
    title: "Knock Off Excess Against Due Charges",
    detail: "Map excess collections against due charges with reference and narration.",
    summary: "Knock off entries reduce outstanding charges using excess customer funds.",
    section: "knockoff_entries",
    fields: [
      { name: "excess_amount", label: "Excess Amount", type: "number", step: "0.01" },
      { name: "target_due_charge", label: "Against Due Charge", type: "master-select", optionsKey: "due_charge_head" },
      { name: "knockoff_reference", label: "Reference", type: "text" },
      { name: "knockoff_remark", label: "Knock Off Remark", type: "text" }
    ]
  },
  manual_charges_due: {
    title: "Creation of Manual Charges Due",
    detail: "Create due charges manually with charge head, amount, due date, and narration.",
    summary: "Manual charges let operations post extra dues after disbursal.",
    section: "manual_charges_due",
    fields: [
      { name: "charge_head", label: "Charge Head", type: "master-select", optionsKey: "due_charge_head" },
      { name: "due_amount", label: "Due Amount", type: "number", step: "0.01" },
      { name: "due_date", label: "Due Date", type: "date" },
      { name: "charge_narration", label: "Charge Narration", type: "text" }
    ],
    reports: [{ label: "Download Charge Ledger", path: "charge-ledger" }]
  },
  charge_waivers: {
    title: "Waiver of Charges",
    detail: "Record approved waivers by charge head, amount, reason, and approver.",
    summary: "Charge waivers reduce customer dues and remain visible in the charge ledger.",
    section: "charge_waivers",
    fields: [
      { name: "waiver_charge_head", label: "Charge Head", type: "master-select", optionsKey: "due_charge_head" },
      { name: "waiver_amount", label: "Waiver Amount", type: "number", step: "0.01" },
      { name: "waiver_reason", label: "Waiver Reason", type: "master-select", optionsKey: "waiver_reason" },
      { name: "approver", label: "Approver", type: "text" }
    ]
  },
  reports: {
    title: "LMS Reports",
    detail: "Generate SOA and major LMS reports for collections, charges, and agreement servicing.",
    summary: "Use these report outputs for audit, servicing, collections, and customer communication.",
    reports: [
      { label: "Download SOA PDF", path: "soa-pdf" },
      { label: "Download Collection Register", path: "collection-report" },
      { label: "Download Charge Ledger", path: "charge-ledger" },
      { label: "Download Complete Repayment", path: "repayment-pdf" }
    ]
  },
  daily_batch: {
    title: "Daily EOD & BOD Process",
    detail: "Run single-batch EOD and BOD processes for banking, DPD, NPA, accrual, charges, balances and billing due creation.",
    summary: "Use this module to simulate the daily LMS batch cycle with one-click EOD and BOD execution.",
    custom: "daily_batch"
  }
};

const state = {
  dashboard: null,
  cases: [],
  selectedCaseId: null,
  currentView: "pipeline",
  autoplay: false,
  currentLmsModule: "soa"
};

const el = {
  metricsGrid: document.getElementById("metrics-grid"),
  slaList: document.getElementById("sla-list"),
  pipelineBoard: document.getElementById("pipeline-board"),
  todayDisbursal: document.getElementById("today-disbursal"),
  approvalRate: document.getElementById("approval-rate"),
  activeCases: document.getElementById("active-cases"),
  uwQueue: document.getElementById("uw-queue"),
  workflowGates: document.getElementById("workflow-gates"),
  customerName: document.getElementById("customer-name"),
  customerStage: document.getElementById("customer-stage"),
  profileSummary: document.getElementById("profile-summary"),
  journeyTimeline: document.getElementById("journey-timeline"),
  riskGrid: document.getElementById("risk-grid"),
  documentsList: document.getElementById("documents-list"),
  repaymentOverview: document.getElementById("repayment-overview"),
  repaymentTable: document.getElementById("repayment-table"),
  eligibilityScore: document.getElementById("eligibility-score"),
  eligibilityText: document.getElementById("eligibility-text"),
  decisionStack: document.getElementById("decision-stack"),
  leadForm: document.getElementById("lead-form"),
  nextStageBtn: document.getElementById("next-stage-btn"),
  approveBtn: document.getElementById("approve-btn"),
  holdBtn: document.getElementById("hold-btn"),
  exportBtn: document.getElementById("export-mis-btn"),
  applicationsTable: document.getElementById("applications-table"),
  verificationGrid: document.getElementById("verification-grid"),
  flowDiagram: document.getElementById("flow-diagram"),
  creditGrid: document.getElementById("credit-grid"),
  creditSummary: document.getElementById("credit-summary"),
  disbursementGrid: document.getElementById("disbursement-grid"),
  disbursementChecklist: document.getElementById("disbursement-checklist"),
  demoActions: document.getElementById("demo-actions"),
  demoStagePill: document.getElementById("demo-stage-pill"),
  journeyGuide: document.getElementById("journey-guide"),
  stepDetail: document.getElementById("step-detail"),
  customerProfileForm: document.getElementById("customer-profile-form"),
  customerDetailsCard: document.getElementById("customer-details-card"),
  profileFormStatus: document.getElementById("profile-form-status"),
  profileGuidance: document.getElementById("profile-guidance"),
  stageFormCardVerification: document.getElementById("stage-form-card-verification"),
  stageFormVerification: document.getElementById("stage-form-verification"),
  stageFormTitleVerification: document.getElementById("stage-form-title-verification"),
  stageFormStatusVerification: document.getElementById("stage-form-status-verification"),
  stageFormHelperVerification: document.getElementById("stage-form-helper-verification"),
  stageGuidanceVerification: document.getElementById("stage-guidance-verification"),
  stageFormCardCredit: document.getElementById("stage-form-card-credit"),
  stageFormCredit: document.getElementById("stage-form-credit"),
  stageFormTitleCredit: document.getElementById("stage-form-title-credit"),
  stageFormStatusCredit: document.getElementById("stage-form-status-credit"),
  stageFormHelperCredit: document.getElementById("stage-form-helper-credit"),
  stageGuidanceCredit: document.getElementById("stage-guidance-credit"),
  stageFormCardDisbursement: document.getElementById("stage-form-card-disbursement"),
  stageFormDisbursement: document.getElementById("stage-form-disbursement"),
  stageFormTitleDisbursement: document.getElementById("stage-form-title-disbursement"),
  stageFormStatusDisbursement: document.getElementById("stage-form-status-disbursement"),
  stageFormHelperDisbursement: document.getElementById("stage-form-helper-disbursement"),
  stageGuidanceDisbursement: document.getElementById("stage-guidance-disbursement"),
  lmsOverview: document.getElementById("lms-overview"),
  lmsStatementTable: document.getElementById("lms-statement-table"),
  lmsCaseViewer: document.getElementById("lms-case-viewer"),
  lmsActionLog: document.getElementById("lms-action-log"),
  lmsMenu: document.getElementById("lms-menu"),
  lmsModuleTitle: document.getElementById("lms-module-title"),
  lmsModuleSummary: document.getElementById("lms-module-summary"),
  lmsModuleForm: document.getElementById("lms-module-form"),
  lmsReports: document.getElementById("lms-reports"),
  disbursalSuccessModal: document.getElementById("disbursal-success-modal"),
  disbursalSuccessTitle: document.getElementById("disbursal-success-title"),
  disbursalSuccessBody: document.getElementById("disbursal-success-body"),
  closeDisbursalModal: document.getElementById("close-disbursal-modal"),
  modalDownloadRepayment: document.getElementById("modal-download-repayment"),
  modalDownloadSanction: document.getElementById("modal-download-sanction"),
  modalDownloadEsign: document.getElementById("modal-download-esign"),
  modalOpenLms: document.getElementById("modal-open-lms"),
  openLmsBtn: document.getElementById("open-lms-btn"),
  losBusinessDate: document.getElementById("los-business-date"),
  navItems: document.querySelectorAll(".nav-item"),
  viewPanels: document.querySelectorAll(".app-view")
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function maskAadhaar(value) {
  const digits = digitsOnly(value);
  return digits.length === 12 ? `XXXX XXXX ${digits.slice(-4)}` : "Pending";
}

function showValidationErrors(result) {
  if (result?.validation_errors?.length) {
    window.alert(result.validation_errors.join("\n"));
    return true;
  }
  return false;
}

function validateLeadPayload(payload) {
  const errors = [];
  if (!(Number(payload.amount) > 0)) {
    errors.push("Loan amount should be greater than zero.");
  }
  return errors;
}

function validateProfilePayload(payload) {
  const errors = [];
  if (!/^[6-9]\d{9}$/.test(digitsOnly(payload.mobile))) errors.push("Mobile number should be a valid 10 digit number.");
  if (!/^\d{12}$/.test(digitsOnly(payload.aadhaar_number))) errors.push("Aadhaar number should be a valid 12 digit number.");
  if (!/^\d{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(String(payload.gst_number || "").trim().toUpperCase())) errors.push("GST number is invalid.");
  if (payload.co_applicant_mobile && !/^[6-9]\d{9}$/.test(digitsOnly(payload.co_applicant_mobile))) errors.push("Co-applicant mobile should be a valid 10 digit number.");
  if (payload.guarantor_mobile && !/^[6-9]\d{9}$/.test(digitsOnly(payload.guarantor_mobile))) errors.push("Guarantor mobile should be a valid 10 digit number.");
  if (!(Number(payload.collateral_value) > 0)) errors.push("Collateral value should be greater than zero.");
  return errors;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function getDraftKey(scope, caseId = "new", stage = "") {
  return `rfl-draft:${scope}:${caseId}:${stage}`;
}

function saveDraft(scope, form, caseId = "new", stage = "") {
  if (!form) return;
  try {
    localStorage.setItem(getDraftKey(scope, caseId, stage), JSON.stringify(formToObject(form)));
  } catch (_) {}
}

function loadDraft(scope, caseId = "new", stage = "") {
  try {
    return JSON.parse(localStorage.getItem(getDraftKey(scope, caseId, stage)) || "{}");
  } catch (_) {
    return {};
  }
}

function clearDraft(scope, caseId = "new", stage = "") {
  try {
    localStorage.removeItem(getDraftKey(scope, caseId, stage));
  } catch (_) {}
}

function bindDraftAutoSave(form, scope, caseId = "new", stage = "") {
  if (!form || form.dataset.draftBound === "true") return;
  const handler = () => saveDraft(scope, form, caseId, stage);
  form.addEventListener("input", handler);
  form.addEventListener("change", handler);
  form.dataset.draftBound = "true";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) throw new Error(`API failed: ${response.status}`);
  const type = response.headers.get("content-type") || "";
  return type.includes("application/json") ? response.json() : response;
}

function getSelectedCase() {
  return state.cases.find((item) => String(item.id) === String(state.selectedCaseId));
}

function isFrozenInLos(item) {
  return Boolean(item && item.stage >= 12 && String(item.status || "").toLowerCase().includes("disbursed"));
}

function closeDisbursalModal() {
  el.disbursalSuccessModal?.classList.add("hidden");
  if (el.disbursalSuccessModal) el.disbursalSuccessModal.setAttribute("aria-hidden", "true");
}

function showDisbursalModal(item) {
  if (!item || !el.disbursalSuccessModal) return;
  const disbursal = item.stage_data?.disbursement || {};
  el.disbursalSuccessTitle.textContent = `Application ${item.case_code} has been successfully disbursed`;
  el.disbursalSuccessBody.innerHTML = [
    ["Application ID", item.case_code, "Generated RFL application number"],
    ["Agreement Number", disbursal.agreement_number || "Generated", "System-generated agreement number for LMS handoff"],
    ["Customer Name", item.applicant, "Payee name linked from the applicant profile"],
    ["Net Disbursal Amount", formatCurrency(item.net_disbursal_amount), "Loan amount after deducting collected charges"],
    ["Disbursal Date", disbursal.disbursal_date || "Captured", "Funds release date"],
    ["Interest Start Date", disbursal.interest_start_date || "Captured", "Interest accrual start date"],
    ["Next System", "Loan Management System", "The file is now ready for post-disbursal servicing in LMS"]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");
  el.disbursalSuccessModal.classList.remove("hidden");
  el.disbursalSuccessModal.setAttribute("aria-hidden", "false");
}

function activateTab(tabName) {
  if (!tabName) return;
  document.querySelectorAll(".tab").forEach((node) => node.classList.toggle("active", node.dataset.tab === tabName));
  document.querySelectorAll(".tab-panel").forEach((node) => node.classList.toggle("active", node.id === `tab-${tabName}`));
}

function fillProfileForm(profile = {}) {
  if (!el.customerProfileForm) return;
  const draft = loadDraft("customer-profile", state.selectedCaseId || "new");
  const mergedProfile = { ...profile, ...draft, ucic_number: profile.ucic_number || draft.ucic_number || "" };
  [
    "mobile", "email", "ucic_number", "aadhaar_number", "gst_number", "address", "occupation", "monthly_income",
    "business_name", "business_vintage", "bank_name", "account_number", "ifsc",
    "co_applicant_name", "co_applicant_mobile", "co_applicant_relation",
    "guarantor_name", "guarantor_mobile", "guarantor_relation",
    "collateral_type", "collateral_address", "collateral_value", "notepad_entry"
  ].forEach((field) => {
    const input = el.customerProfileForm.elements[field];
    if (input) input.value = mergedProfile[field] || "";
  });
  bindDraftAutoSave(el.customerProfileForm, "customer-profile", state.selectedCaseId || "new");
}

function renderStageFormArea(item) {
  const def = STAGE_FORM_DEFS[item?.stage];
  const isVerification = !!def && def.view === "verification";
  const isCredit = !!def && def.view === "credit";
  const isDisbursement = !!def && def.view === "disbursement";

  el.stageFormCardVerification.classList.toggle("hidden", !isVerification);
  el.stageFormCardCredit.classList.toggle("hidden", !isCredit);
  el.stageFormCardDisbursement.classList.toggle("hidden", !isDisbursement);

  if (!item || !def) {
    el.stageGuidanceVerification.innerHTML = `<div class="document-item"><div><strong>No active verification form</strong><p class="muted">KYC, Aadhaar, dedupe and field verification forms appear here when a selected case reaches those stages.</p></div><span class="status-pill">Idle</span></div>`;
    el.stageGuidanceCredit.innerHTML = `<div class="document-item"><div><strong>No active credit form</strong><p class="muted">CIBIL, charges summary and underwriting forms appear here when a selected case reaches those stages.</p></div><span class="status-pill">Idle</span></div>`;
    el.stageGuidanceDisbursement.innerHTML = `<div class="document-item"><div><strong>No active fulfilment form</strong><p class="muted">Repayment, document collection, e-sign and disbursement forms appear here after approval.</p></div><span class="status-pill">Idle</span></div>`;
    return;
  }

  const stageNameMap = { 2: "kyc", 3: "aadhaar", 4: "dedupe", 5: "cibil", 6: "charges_summary", 7: "field_verification", 8: "underwriting" };
  stageNameMap[9] = "repayment";
  stageNameMap[10] = "document_collection";
  stageNameMap[11] = "esign";
  stageNameMap[12] = "disbursement";
  const stored = {
    ...(item.stage_data?.[stageNameMap[item.stage]] || {}),
    ...loadDraft("stage-form", item.id, item.stage)
  };
  const targetForm = isVerification ? el.stageFormVerification : isCredit ? el.stageFormCredit : el.stageFormDisbursement;
  const targetTitle = isVerification ? el.stageFormTitleVerification : isCredit ? el.stageFormTitleCredit : el.stageFormTitleDisbursement;
  const targetStatus = isVerification ? el.stageFormStatusVerification : isCredit ? el.stageFormStatusCredit : el.stageFormStatusDisbursement;
  const targetHelper = isVerification ? el.stageFormHelperVerification : isCredit ? el.stageFormHelperCredit : el.stageFormHelperDisbursement;
  const targetGuidance = isVerification ? el.stageGuidanceVerification : isCredit ? el.stageGuidanceCredit : el.stageGuidanceDisbursement;

  targetTitle.textContent = def.title;
  targetStatus.textContent = item.stage_form_complete ? "Completed" : "Required";
  targetHelper.textContent = def.helper || "";
  targetForm.innerHTML = renderStageFields(item, def, stored) + `<button class="primary-btn" type="submit">Save ${def.title} and Continue</button>`;
  targetForm.dataset.stage = String(item.stage);
  targetForm.dataset.draftBound = "";
  bindDraftAutoSave(targetForm, "stage-form", item.id, item.stage);

  let guidanceItems = [
    ["Current Stage", item.workflow_stage, `Selected case: ${item.case_code}`],
    ["System Rule", item.stage_form_complete ? "Completed" : "Mandatory form", "All fields below must be filled before the LOS can move ahead."],
    ["What happens next", STAGE_PLAYBOOK[Math.min(item.stage + 1, STAGE_PLAYBOOK.length - 1)].title, `After saving, the case automatically moves to ${STAGE_PLAYBOOK[Math.min(item.stage + 1, STAGE_PLAYBOOK.length - 1)].title}.`]
  ];
  if (item.stage === 8) {
    guidanceItems = guidanceItems.concat(item.policy_checks.map((check) => [check.label, check.ok ? "OK" : "Fail", `Observed value: ${check.value}`]));
  }
  if (item.stage === 11 && item.stage_data?.esign?.esign_status === "Signed") {
    guidanceItems.push(["E-Sign PDF", "Ready", "Download the generated PDF after signing."]);
  }
  targetGuidance.innerHTML = guidanceItems.map(([label, value, note]) => `<div class="document-item ${value === "Fail" ? "policy-item bad" : value === "OK" ? "policy-item ok" : ""}"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");
  bindStageEnhancements(item, targetForm);
}

function renderStageFields(item, def, stored) {
  if (item.stage === 6) {
    return renderChargesGrid(item, stored);
  }
  const fieldHtml = def.fields.map((field) => {
    if (field.type === "hidden") {
      return `<input type="hidden" name="${field.name}" value="${stored[field.name] || ""}">`;
    }
    if (field.type === "master-select") {
      const options = item.master_dropdowns?.[field.optionsKey] || [];
      const selectedValue = stored[field.name] || field.defaultValue || options[0] || "";
      return `<label><span>${field.label}</span><select name="${field.name}" required>${options.map((option) => `<option value="${option}" ${selectedValue === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>`;
    }
    if (field.type === "select") {
      const agencies = item.field_agencies || [];
      return `<label><span>${field.label}</span><select name="${field.name}" required>${agencies.map((option) => `<option value="${option}" ${stored[field.name] === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>`;
    }
    let value = stored[field.name] || field.defaultValue || "";
    if (item.stage === 9) {
      if (field.name === "opening_principal") value = item.amount;
      if (field.name === "emi_amount") value = item.repayment?.emi_amount || value;
      if (field.name === "rate_of_interest") value = item.roi || value;
    }
    if (item.stage === 3 && field.name === "aadhaar_last4") {
      value = digitsOnly(item.profile?.aadhaar_number || "").slice(-4);
    }
    if (item.stage === 12 && field.name === "disbursal_account") {
      value = item.profile?.account_number || value;
    }
    if (item.stage === 12 && field.name === "payee_name") {
      value = item.applicant || value;
    }
    if (item.stage === 12 && field.name === "net_disbursal_amount") {
      value = item.net_disbursal_amount ?? value;
    }
    return `<label><span>${field.label}</span><input type="${field.type}" name="${field.name}" value="${value}" ${field.step ? `step="${field.step}"` : ""} ${field.readonly ? "readonly" : ""} required></label>`;
  }).join("");

  let extras = "";
  if (item.stage === 2) {
    extras = `<div class="inline-actions"><button class="ghost-btn" type="button" id="send-otp-btn">Send OTP</button><span class="muted" id="otp-status"></span></div>`;
  }
  if (item.stage === 10) {
    extras = `<div class="upload-box"><label><span>Upload Document</span><input type="file" id="ocr-upload-input"></label><p class="muted" id="ocr-upload-status">OCR verification will appear after document selection.</p></div>`;
  }
  if (item.stage === 11) {
    extras = `<div class="signature-box"><p class="muted">Draw signature below</p><canvas id="signature-pad" class="signature-pad"></canvas><div class="inline-actions"><button class="ghost-btn" type="button" id="clear-signature">Clear Signature</button>${item.stage_data?.esign?.esign_status === "Signed" ? `<button class="ghost-btn" type="button" id="download-esign-pdf">Download E-Sign PDF</button>` : ""}</div></div>`;
  }
  if (item.stage === 12) {
    extras = `<div class="document-item"><div><strong>Final Summary Downloads</strong><p class="muted">Download repayment schedule, sanction letter and e-sign PDF from the disbursal stage.</p></div><span class="status-pill">Ready</span></div><div class="inline-actions"><button class="ghost-btn" type="button" id="download-repayment-pdf">Download Complete Repayment</button><button class="ghost-btn" type="button" id="download-sanction-pdf">Download Sanction Letter</button><button class="ghost-btn" type="button" id="download-esign-final-pdf">Download E-Sign PDF</button></div>`;
  }
  return extras + fieldHtml;
}

function renderChargesGrid(item, stored) {
  const options = item.master_dropdowns?.charge_type || [];
  const rows = [1, 2, 3].map((index) => {
    const selectedType = stored[`charge_type_${index}`] || options[index - 1] || options[0] || "";
    const amount = stored[`charge_amount_${index}`] || "";
    return `
      <tr>
        <td>${index}</td>
        <td>
          <select name="charge_type_${index}" required>
            ${options.map((option) => `<option value="${option}" ${selectedType === option ? "selected" : ""}>${option}</option>`).join("")}
          </select>
        </td>
        <td><input type="number" name="charge_amount_${index}" value="${amount}" step="0.01" min="0" required></td>
      </tr>
    `;
  }).join("");

  return `
    <div class="charge-grid-wrap">
      <table class="schedule-table charge-grid-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Charge Type</th>
            <th>Charge Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function bindStageEnhancements(item, form) {
  if (item.stage === 2) {
    document.getElementById("send-otp-btn")?.addEventListener("click", () => {
      document.getElementById("otp-status").textContent = "OTP sent successfully";
    });
  }
  if (item.stage === 10) {
    document.getElementById("ocr-upload-input")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      form.elements.sanction_letter.value = file.name;
      form.elements.agreement_pack.value = "OCR Verified";
      form.elements.document_status.value = "All uploaded docs OCR matched successfully";
      document.getElementById("ocr-upload-status").textContent = `Dummy OCR verified for ${file.name}`;
    });
  }
  if (item.stage === 11) {
    bindSignaturePad(form);
    document.getElementById("download-esign-pdf")?.addEventListener("click", () => {
      window.open(`/api/cases/${state.selectedCaseId}/esign-pdf`, "_blank");
    });
  }
  if (item.stage === 12) {
    form.elements.disbursal_account.value = item.profile?.account_number || "";
    form.elements.payee_name.value = item.applicant || "";
    form.elements.net_disbursal_amount.value = item.net_disbursal_amount ?? "";
    document.getElementById("download-repayment-pdf")?.addEventListener("click", () => {
      window.open(`/api/cases/${state.selectedCaseId}/repayment-pdf`, "_blank");
    });
    document.getElementById("download-sanction-pdf")?.addEventListener("click", () => {
      window.open(`/api/cases/${state.selectedCaseId}/sanction-letter`, "_blank");
    });
    document.getElementById("download-esign-final-pdf")?.addEventListener("click", () => {
      window.open(`/api/cases/${state.selectedCaseId}/esign-pdf`, "_blank");
    });
  }
}

function bindSignaturePad(form) {
  const canvas = document.getElementById("signature-pad");
  const clearBtn = document.getElementById("clear-signature");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let drawing = false;
  const rectSetup = () => {
    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    canvas.width = bounds.width * ratio;
    canvas.height = bounds.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#10233f";
  };
  rectSetup();
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const start = (event) => {
    drawing = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (event) => {
    if (!drawing) return;
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    form.elements.signature_data.value = canvas.toDataURL("image/png");
    form.elements.esign_provider.value = form.elements.esign_provider.value || "Leegality";
    form.elements.esign_status.value = "Signed";
  };
  const end = () => { drawing = false; };
  clearBtn?.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    form.elements.signature_data.value = "";
    form.elements.esign_status.value = "";
  });
  canvas.onmousedown = start;
  canvas.onmousemove = move;
  canvas.onmouseup = end;
  canvas.onmouseleave = end;
  canvas.ontouchstart = start;
  canvas.ontouchmove = move;
  canvas.ontouchend = end;
}

function setView(viewName) {
  state.currentView = viewName;
  el.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  el.viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === viewName));
}

function bindNav() {
  el.navItems.forEach((item) => item.addEventListener("click", () => {
    if (item.dataset.route) {
      window.location.href = item.dataset.route;
      return;
    }
    setView(item.dataset.view);
  }));
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((node) => node.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((node) => node.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });
}

function renderDashboard() {
  const dashboard = state.dashboard;
  if (!dashboard) return;
  if (el.losBusinessDate) {
    el.losBusinessDate.textContent = dashboard.business_date_label || "--";
  }
  el.metricsGrid.innerHTML = dashboard.metrics.map((item) => {
    const value = typeof item.value === "number" && item.label.includes("Value")
      ? formatCurrency(item.value)
      : item.label === "Avg Eligibility"
        ? `${item.value}/100`
        : item.value;
    return `<div class="metric-card"><p class="card-label">${item.label}</p><strong>${value}</strong><span class="metric-trend">${item.trend}</span></div>`;
  }).join("");
  el.todayDisbursal.textContent = formatCurrency(dashboard.today_disbursal);
  el.approvalRate.textContent = `${dashboard.approval_rate}%`;
  el.activeCases.textContent = String(dashboard.active_cases);
  el.uwQueue.innerHTML = dashboard.underwriter_queue.map((item) => `<div class="queue-item"><span>${item.applicant}</span><strong>${item.eligibility}</strong></div>`).join("");
  el.slaList.innerHTML = dashboard.sla_items.map((item) => `<div class="sla-item"><div class="mini-stat-row"><span>${item.label}</span><strong>${item.score}%</strong></div><div class="sla-bar"><span style="width:${item.score}%"></span></div></div>`).join("");
  el.workflowGates.innerHTML = dashboard.workflow_gates.map((item) => `<div class="decision-item"><div><strong>${item.label}</strong><p class="muted">${item.note}</p></div><span class="status-pill">${item.value}</span></div>`).join("");
  el.pipelineBoard.innerHTML = dashboard.board.map((lane) => `
    <div class="lane">
      <div class="lane-header">
        <p class="card-label">${lane.label}</p>
        <span class="lane-count">${lane.cases.length} case${lane.cases.length === 1 ? "" : "s"}</span>
      </div>
      <div class="case-stack" tabindex="0" data-lane-scroll="${lane.label}" aria-label="${lane.label} case slider">
        ${lane.cases.map((item) => `
          <button class="case-card ${String(item.id) === String(state.selectedCaseId) ? "selected" : ""}" data-id="${item.id}" type="button">
            <div class="hero-header">
              <div>
                <h4>${item.applicant}</h4>
                <p class="muted">${item.case_code} • ${item.product}</p>
              </div>
              <span class="status-pill">${item.eligibility}</span>
            </div>
            <div class="case-meta">
              <span>${formatCurrency(item.amount)}</span>
              <span>${item.workflow_stage}</span>
              <span>${item.city}</span>
              <span>${item.source}</span>
            </div>
          </button>
        `).join("")}
      </div>
    </div>
  `).join("");
  document.querySelectorAll(".case-card").forEach((button) => {
    button.addEventListener("click", async () => {
      await focusCaseAndOpenNextAction(button.dataset.id, "pipeline");
    });
  });
  document.querySelectorAll("[data-lane-scroll]").forEach((lane) => {
    lane.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      lane.scrollBy({ left: direction * Math.max(lane.clientWidth * 0.92, 220), behavior: "smooth" });
    });
  });
}

function renderCaseDetails() {
  const item = getSelectedCase();
  if (!item) {
    el.customerName.textContent = "No applications yet";
    el.customerStage.textContent = "Start by creating a lead";
    el.profileSummary.innerHTML = "";
    el.journeyTimeline.innerHTML = `<div class="timeline-item current"><span class="timeline-dot"></span><div><strong>Create a lead</strong><p class="muted">Use the lead generation form to start the LOS journey.</p></div><span>Start</span></div>`;
    el.riskGrid.innerHTML = "";
    el.documentsList.innerHTML = "";
    el.repaymentOverview.innerHTML = "";
    el.repaymentTable.innerHTML = "";
    el.eligibilityScore.textContent = "0";
    el.eligibilityText.textContent = "Waiting for lead creation";
    el.decisionStack.innerHTML = "";
    el.customerDetailsCard.classList.add("hidden");
    el.profileGuidance.innerHTML = "";
    renderStageFormArea(null);
    return;
  }
  el.customerName.textContent = item.applicant;
  el.customerStage.textContent = isFrozenInLos(item) ? "Disbursed • LOS Locked" : item.workflow_stage;
  el.profileSummary.innerHTML = [
    ["Loan Amount", formatCurrency(item.amount)],
    ["Tenor", `${item.tenor} months`],
    ["Product", item.product],
    ["Compliance", item.compliance_status],
    ["UCIC", item.profile?.ucic_number || "Pending"],
    ["Aadhaar", item.masked_aadhaar],
    ["GST", item.profile?.gst_number || "Pending"],
    ["Case ID", item.case_code],
    ["Customer ID", item.customer_id],
    ["Co-Applicant", item.profile?.co_applicant_name || "Pending"],
    ["Guarantor", item.profile?.guarantor_name || "Pending"],
    ["Collateral", item.profile?.collateral_type || "Pending"],
    ["Business Date", item.system_business_date_label]
  ].map(([label, value]) => `<div class="profile-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
  el.journeyTimeline.innerHTML = item.timeline.map((row) => `<div class="timeline-item ${row.state}"><span class="timeline-dot"></span><div><strong>${row.label}</strong><p class="muted">${row.note}</p></div><span>${row.state === "pending" ? "Queued" : "Active"}</span></div>`).join("");
  el.riskGrid.innerHTML = item.risk_cards.map((card) => `<div class="risk-card"><p class="card-label">${card.label}</p><strong>${card.value}</strong><p class="muted">${card.note}</p></div>`).join("");
  el.documentsList.innerHTML = item.docs.map(([name, status]) => `<div class="document-item"><div><strong>${name}</strong><p class="muted">${item.case_code}</p></div><span class="status-pill">${status}</span></div>`).join("");
  el.repaymentOverview.innerHTML = [
    ["EMI", formatCurrency(item.repayment.emi_amount)],
    ["Interest Rate", `${item.roi}% p.a.`],
    ["Tenor", `${item.tenor} months`],
    ["Net Disbursal", formatCurrency(item.net_disbursal_amount)]
  ].map(([label, value]) => `<div class="overview-item"><span>${label}</span><strong>${value}</strong></div>`).join("");
  el.repaymentTable.innerHTML = item.repayment.rows.slice(0, 8).map((row) => `
    <tr>
      <td>${row.emi_number}</td>
      <td>${row.due_date}</td>
      <td>${formatCurrency(row.opening_balance)}</td>
      <td>${formatCurrency(row.emi_amount)}</td>
      <td>${row.roi}%</td>
      <td>${formatCurrency(row.principal)}</td>
      <td>${formatCurrency(row.interest)}</td>
      <td>${formatCurrency(row.closing_balance)}</td>
    </tr>
  `).join("");
  el.eligibilityScore.textContent = item.eligibility;
  el.eligibilityText.textContent = isFrozenInLos(item)
    ? "Loan moved to LMS. LOS actions are locked for this account."
    : `${item.status} • ${item.cibil} bureau / ${item.foir}% FOIR / ${item.roi}% ROI`;
  el.decisionStack.innerHTML = item.decision_items.map((decision) => `<div class="decision-item"><div><strong>${decision.label}</strong><p class="muted">${decision.note}</p></div><span class="status-pill">${decision.value}</span></div>`).join("");
  if (el.approveBtn) {
    el.approveBtn.disabled = isFrozenInLos(item);
    el.approveBtn.textContent = isFrozenInLos(item) ? "Moved to LMS" : "Approve & Generate Docs";
  }
  if (el.holdBtn) {
    el.holdBtn.disabled = isFrozenInLos(item);
    el.holdBtn.textContent = isFrozenInLos(item) ? "LOS Locked" : "Put on Hold";
  }
  const showProfileForm = item.stage === 1;
  el.customerDetailsCard.classList.toggle("hidden", !showProfileForm);
  el.profileFormStatus.textContent = item.profile_complete ? "Completed" : "Required";
  fillProfileForm(item.profile);
  el.profileGuidance.innerHTML = [
    ["Applicant Profile", item.profile_complete ? "Captured" : "Pending", "Fill compliance, banking, co-applicant, guarantor, collateral and note details to continue."],
    ["Compliance", item.compliance_status, item.compliance_note],
    ["System Rule", item.profile_complete ? "Ready for KYC" : "Cannot move ahead", "Customer Details must be completed before KYC verification starts."],
    ["Next Step", item.profile_complete ? "KYC Verification" : "Save form", item.profile_complete ? "Open Verification Hub and run KYC." : "Save the form to automatically move this file to KYC stage."]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");
  renderStageFormArea(item);
}

function renderJourneyGuide() {
  const selected = getSelectedCase();
  if (!selected) {
    el.demoStagePill.textContent = "Create first lead";
    el.demoActions.innerHTML = "";
    el.journeyGuide.innerHTML = `<div class="journey-step current"><div class="step-index">1</div><div class="step-copy"><strong>Generate a new lead</strong><p>Enter lead details in the form above. The workflow will then guide you step by step.</p></div><span class="status-pill">Start</span></div>`;
    el.stepDetail.innerHTML = `<div class="document-item"><div><strong>Guidance</strong><p class="muted">Create a lead, then approve or reject it to begin the LOS journey.</p></div><span class="status-pill">Pending</span></div>`;
    return;
  }
  const stageIndex = selected.stage;
  const currentStep = STAGE_PLAYBOOK[Math.min(stageIndex, STAGE_PLAYBOOK.length - 1)];
  const nextStep = STAGE_PLAYBOOK[Math.min(stageIndex + 1, STAGE_PLAYBOOK.length - 1)];
  const frozen = isFrozenInLos(selected);
  el.demoStagePill.textContent = frozen ? "Disbursed • Moved to LMS" : `Current: ${selected.workflow_stage}`;
  const stageActions = [];
  stageActions.push(`<button class="primary-btn" id="demo-open-btn" type="button">${frozen ? "Open LMS" : currentStep.action}</button>`);
  if (frozen) {
    stageActions.push(`<button class="ghost-btn" id="demo-reset-btn" type="button" disabled>LOS Frozen</button>`);
  } else if (selected.status !== "Rejected" && stageIndex === 0) {
    stageActions.push(`<button class="primary-btn" id="demo-approve-btn" type="button">Approve Lead</button>`);
    stageActions.push(`<button class="ghost-btn" id="demo-reject-btn" type="button">Reject Lead</button>`);
  } else if (selected.status !== "Rejected" && stageIndex < 12) {
    stageActions.push(`<button class="ghost-btn" id="demo-complete-btn" type="button">Mark Step Complete</button>`);
  }
  if (!frozen) {
    stageActions.push(`<button class="ghost-btn" id="demo-reset-btn" type="button">Reset Demo Case</button>`);
  }
  el.demoActions.innerHTML = stageActions.join("");
  el.journeyGuide.innerHTML = STAGE_PLAYBOOK.map((step, index) => {
    const isRejected = selected.status === "Rejected";
    const stateClass = isRejected ? "" : index < stageIndex ? "done" : index === stageIndex ? "current" : "";
    const stateLabel = isRejected && index === stageIndex ? "Rejected" : index < stageIndex ? "Done" : index === stageIndex ? "Current" : "Pending";
    return `
      <div class="journey-step ${stateClass}">
        <div class="step-index">${index + 1}</div>
        <div class="step-copy">
          <strong>${step.title}</strong>
          <p>${step.detail}</p>
        </div>
        <span class="status-pill">${stateLabel}</span>
      </div>
    `;
  }).join("");
  el.stepDetail.innerHTML = [
    ["Current Stage", frozen ? "Loan moved to LMS" : currentStep.title, frozen ? "Disbursal completed. LOS is read-only for this account." : currentStep.detail],
    ["System Guidance", frozen ? "Open LMS" : currentStep.view === "verification" ? "Go to Verification Hub" : currentStep.view === "credit" ? "Go to Credit Desk" : currentStep.view === "disbursement" ? "Go to Disbursement" : "Stay in Pipeline", `Selected case: ${selected.case_code}`],
    ["Next Stage", frozen ? "Servicing in LMS" : selected.status === "Rejected" ? "Journey stopped" : nextStep.title, frozen ? "Use the LMS screen for statement, collections, EOD/BOD and servicing functions." : selected.status === "Rejected" ? "This application has been rejected by the end user." : `After completing this step the case moves to ${nextStep.title}.`]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");
  document.getElementById("demo-open-btn").addEventListener("click", () => openCurrentStep());
  const approveBtn = document.getElementById("demo-approve-btn");
  const rejectBtn = document.getElementById("demo-reject-btn");
  const completeBtn = document.getElementById("demo-complete-btn");
  if (approveBtn) approveBtn.addEventListener("click", approveSelectedCase);
  if (rejectBtn) rejectBtn.addEventListener("click", rejectSelectedCase);
  if (completeBtn) completeBtn.addEventListener("click", async () => advanceSelectedCase());
  const resetBtn = document.getElementById("demo-reset-btn");
  if (resetBtn && !resetBtn.disabled) resetBtn.addEventListener("click", resetSelectedCase);
}

function renderApplicationsView() {
  el.applicationsTable.innerHTML = state.cases.map((item) => `
    <tr>
      <td>${item.case_code}</td>
      <td><span class="table-row-action" data-case-id="${item.id}">${item.applicant}</span></td>
      <td>${item.product}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td>${item.workflow_stage}</td>
      <td>${item.compliance_status}</td>
      <td>${item.eligibility}</td>
      <td>${item.rm}</td>
    </tr>
  `).join("");
  document.querySelectorAll("[data-case-id]").forEach((node) => node.addEventListener("click", async () => {
    await focusCaseAndOpenNextAction(node.dataset.caseId, "pipeline");
  }));
}

function renderVerificationView() {
  const verificationCases = state.cases.filter((item) => item.stage >= 2 && item.stage <= 7);
  el.verificationGrid.innerHTML = verificationCases.map((item) => `
    <div class="risk-card">
      <p class="card-label">${item.case_code} • ${item.applicant}</p>
      <strong>${item.workflow_stage}</strong>
      <p class="muted">KYC: ${item.kyc}</p>
      <p class="muted">Aadhaar: ${item.masked_aadhaar}</p>
      <p class="muted">Compliance: ${item.compliance_status}</p>
      <p class="muted">Dedupe: ${item.dedupe}</p>
      <p class="muted">Field Verification: ${item.fv}</p>
    </div>
  `).join("") || `<div class="risk-card"><strong>No cases in verification</strong><p class="muted">New cases will appear here as they enter KYC, Aadhaar, dedupe, bureau and field stages.</p></div>`;
  const activeStage = getSelectedCase()?.workflow_stage;
  const nodes = [["Lead", "Customer Details", "KYC"], ["Aadhaar", "Dedupe", "CIBIL"], ["Charges", "Field Verification", "Underwriter"], ["Disbursement Ready"]];
  el.flowDiagram.innerHTML = nodes.map((row, rowIndex) => `
    <div class="flow-row">
      ${row.map((node, index) => {
        const isActive = activeStage && (node === activeStage || (node === "KYC" && activeStage.includes("KYC")) || (node === "Charges" && activeStage.includes("Charges")) || (node === "Underwriter" && activeStage.includes("Underwriter")) || (node === "Disbursement Ready" && ["Repayment Generation", "Document Collection", "E-Sign", "Disbursement"].includes(activeStage)));
        return `${index > 0 ? `<div class="flow-arrow">→</div>` : ""}<div class="flow-node ${isActive ? "active" : ""}">${node}</div>`;
      }).join("")}
    </div>
    ${rowIndex < nodes.length - 1 ? `<div class="flow-arrow">↓</div>` : ""}
  `).join("");
}

function renderCreditView() {
  const creditCases = state.cases.filter((item) => item.stage >= 5 && item.stage <= 9);
  el.creditGrid.innerHTML = creditCases.map((item) => `<div class="decision-item"><div><strong>${item.case_code} • ${item.applicant}</strong><p class="muted">${item.bureau}</p><p class="muted">CIBIL ${item.cibil} | FOIR ${item.foir}% | Eligibility ${item.eligibility}</p></div><span class="status-pill">${item.status}</span></div>`).join("") || `<div class="decision-item"><div><strong>No files in credit desk</strong><p class="muted">Cases will show here after bureau, charges summary and field verification.</p></div><span class="status-pill">Idle</span></div>`;
  const selected = getSelectedCase();
  if (!selected) return;
  const charges = selected.stage_data?.charges_summary || {};
  const chargeNote = [1, 2, 3]
    .map((index) => charges[`charge_type_${index}`] && charges[`charge_amount_${index}`] ? `${charges[`charge_type_${index}`]}: ${formatCurrency(Number(charges[`charge_amount_${index}`] || 0))}` : "")
    .filter(Boolean)
    .join(" | ") || "Charges summary pending";
  el.creditSummary.innerHTML = [
    ["Bureau Decision", selected.cibil >= 700 ? "Pass" : "Review", selected.bureau],
    ["FOIR Policy", selected.foir <= 55 ? "Within Band" : "Exception", `FOIR ${selected.foir}%`],
    ["Compliance", selected.compliance_status, selected.compliance_note],
    ["Deviation", selected.stage_data?.underwriting?.deviation_approval || "Not Required", selected.stage_data?.underwriting?.deviation_note || "No deviation observed"],
    ["Charges Summary", selected.stage >= 7 ? "Captured" : "Pending", chargeNote],
    ["Repayment Readiness", selected.stage >= 9 ? "Ready" : "Pending", `EMI ${formatCurrency(selected.repayment.emi_amount)}`],
    ["UW Status", selected.status, `Current stage: ${selected.workflow_stage}`]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");
}

function renderDisbursementView() {
  const fulfilmentCases = state.cases.filter((item) => item.stage >= 9);
  el.disbursementGrid.innerHTML = fulfilmentCases.map((item) => `<div class="document-item"><div><strong>${item.case_code} • ${item.applicant}</strong><p class="muted">${item.workflow_stage} | Gross ${formatCurrency(item.amount)} | Net ${formatCurrency(item.net_disbursal_amount)}</p><p class="muted">Docs: ${item.docs.map((doc) => `${doc[0]} - ${doc[1]}`).join(" | ")}</p></div><span class="status-pill">${item.status}</span></div>`).join("") || `<div class="document-item"><div><strong>No disbursement-ready cases</strong><p class="muted">Move cases through underwriting to repayment, docs, e-sign and disbursement.</p></div><span class="status-pill">Waiting</span></div>`;
  const selected = getSelectedCase();
  if (!selected) return;
  const disbursal = selected.stage_data?.disbursement || {};
  const chargeSummary = selected.charge_rows.map((charge) => `${charge.type}: ${formatCurrency(charge.amount)}`).join(" | ") || "No charges captured";
  el.disbursementChecklist.innerHTML = [
    ["Repayment Schedule", selected.stage >= 9 ? "Generated" : "Pending"],
    ["Document Collection", selected.stage >= 10 ? "Complete" : "Pending"],
    ["E-Sign", selected.stage >= 11 ? "Ready" : "Pending"],
    ["Disbursement", selected.stage >= 12 ? "Released" : "Queued"],
    ["Agreement Number", disbursal.agreement_number || "Generated on disbursal", "System-generated LMS agreement reference"],
    ["Payee Name", disbursal.payee_name || selected.applicant, "Customer name auto-linked as payee"],
    ["Disbursal Account", disbursal.disbursal_account || selected.profile?.account_number || "Pending", "Account captured in customer details"],
    ["Disbursal Date", disbursal.disbursal_date || "Pending", "Final credit release date"],
    ["Interest Start Date", disbursal.interest_start_date || "Pending", "Interest accrual starts from this date"],
    ["Total Charges", formatCurrency(selected.charge_total), chargeSummary],
    ["Net Disbursal Amount", formatCurrency(selected.net_disbursal_amount), "Gross loan amount less collected charges"],
    ["Download Pack", "Ready", "Repayment schedule, sanction letter and e-sign PDF available in the disbursal form"]
  ].map(([label, value, note]) => `<div class="decision-item"><div><strong>${label}</strong><p class="muted">${note || selected.case_code}</p></div><span class="status-pill">${value}</span></div>`).join("");
}

function renderLmsView() {
  const selected = getSelectedCase();
  if (!selected) {
    el.lmsOverview.innerHTML = `<div class="document-item"><div><strong>No live LMS case</strong><p class="muted">Disburse a case to move it into the loan management system.</p></div><span class="status-pill">Idle</span></div>`;
    el.lmsStatementTable.innerHTML = "";
    el.lmsCaseViewer.innerHTML = "";
    el.lmsActionLog.innerHTML = "";
    el.lmsMenu.innerHTML = "";
    el.lmsModuleTitle.textContent = "Select LMS Function";
    el.lmsModuleSummary.innerHTML = "";
    el.lmsModuleForm.classList.add("hidden");
    el.lmsModuleForm.innerHTML = "";
    el.lmsReports.innerHTML = "";
    return;
  }
  const lms = selected.stage_data?.lms || {};
  const disbursal = selected.stage_data?.disbursement || {};
  const summary = selected.lms_summary || {};
  el.lmsOverview.innerHTML = [
    ["Agreement Number", summary.agreement_number || disbursal.agreement_number || "Pending", "System-generated agreement reference"],
    ["Loan Status", summary.loan_status || "Live", "Current LMS servicing status"],
    ["Statement of Account", "Available", `Collections tracked: ${formatCurrency(summary.collection_total || 0)}`],
    ["Manual Charges Due", formatCurrency(summary.manual_charges_total || 0), "Manual charge creation in LMS"],
    ["Charge Waivers", formatCurrency(summary.waiver_total || 0), "Approved waivers captured in LMS"],
    ["Excess Knock Off", formatCurrency(summary.excess_knockoff_total || 0), "Excess amount adjusted against dues"]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");
  el.lmsStatementTable.innerHTML = (summary.statement_rows || []).map((row) => `
    <tr>
      <td>${row.emi_number}</td>
      <td>${row.due_date}</td>
      <td>${formatCurrency(row.emi_amount)}</td>
      <td>${formatCurrency(row.principal)}</td>
      <td>${formatCurrency(row.interest)}</td>
      <td>${row.status}</td>
    </tr>
  `).join("");
  el.lmsCaseViewer.innerHTML = [
    ["Application ID", selected.case_code, "LOS application reference"],
    ["Agreement Number", disbursal.agreement_number || "Pending", "Agreement moved into LMS"],
    ["Customer Name", selected.applicant, "Borrower name"],
    ["Product", selected.product, "Loan product"],
    ["Loan Amount", formatCurrency(selected.amount), "Original sanctioned amount"],
    ["Net Disbursal", formatCurrency(selected.net_disbursal_amount), "After collected charges"],
    ["Disbursal Account", disbursal.disbursal_account || selected.profile?.account_number || "Pending", "Bank account credited"],
    ["Interest Start Date", disbursal.interest_start_date || "Pending", "Loan servicing start date"]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");

  const actionCards = [];
  const pushCard = (title, values, isList = false) => {
    if (!values || (Array.isArray(values) && !values.length)) return;
    if (isList) {
      values.slice(-3).forEach((entry, index) => {
        actionCards.push(`<div class="document-item"><div><strong>${title} ${values.length - Math.min(2, values.length - 1) + index}</strong><p class="muted">${Object.entries(entry).map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`).join(" | ")}</p></div><span class="status-pill">Saved</span></div>`);
      });
      return;
    }
    actionCards.push(`<div class="document-item"><div><strong>${title}</strong><p class="muted">${Object.entries(values).map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`).join(" | ")}</p></div><span class="status-pill">Saved</span></div>`);
  };
  pushCard("Post Disbursal Edit", lms.post_disbursal_edit);
  pushCard("Foreclosure", lms.foreclosure);
  pushCard("Reschedule", lms.reschedule);
  pushCard("NPA Movement", lms.npa_movement);
  pushCard("Banking Presentation", lms.banking_presentations, true);
  pushCard("Banking Status", lms.banking_status_updates, true);
  pushCard("Collection Update", lms.collection_updates, true);
  pushCard("Excess Knock Off", lms.knockoff_entries, true);
  pushCard("Manual Charges Due", lms.manual_charges_due, true);
  pushCard("Charge Waiver", lms.charge_waivers, true);
  el.lmsActionLog.innerHTML = actionCards.join("") || `<div class="document-item"><div><strong>No LMS actions yet</strong><p class="muted">Use the forms below to simulate post-disbursal servicing actions.</p></div><span class="status-pill">Ready</span></div>`;
  renderLmsModuleWorkspace(selected);
}

function renderLmsModuleWorkspace(selected) {
  const modules = Object.entries(LMS_MODULE_DEFS);
  if (!LMS_MODULE_DEFS[state.currentLmsModule]) state.currentLmsModule = "soa";
  el.lmsMenu.innerHTML = modules.map(([key, module]) => `
    <button class="lms-menu-btn ${state.currentLmsModule === key ? "active" : ""}" type="button" data-lms-module="${key}">
      <strong>${module.title}</strong>
      <span>${module.detail}</span>
    </button>
  `).join("");
  document.querySelectorAll("[data-lms-module]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentLmsModule = button.dataset.lmsModule;
      renderLmsModuleWorkspace(selected);
    });
  });

  const module = LMS_MODULE_DEFS[state.currentLmsModule];
  const lms = selected.stage_data?.lms || {};
  const batchRuns = lms.daily_batch_runs || [];
  el.lmsModuleTitle.textContent = module.title;
  const stored = module.section ? lms[module.section] || {} : {};
  const listStored = Array.isArray(stored) ? stored : [];

  const summaryItems = [
    ["Module", module.title, module.summary],
    ["Agreement Number", selected.stage_data?.disbursement?.agreement_number || "Pending", "Agreement reference in LMS"],
    ["Loan Status", selected.lms_summary?.loan_status || "Live", "Current servicing stage"]
  ];
  if (Array.isArray(stored)) {
    summaryItems.push(["Saved Entries", String(listStored.length), "Recent LMS actions recorded in this module"]);
  }
  if (module.custom === "daily_batch") {
    summaryItems.push(["Batch Runs", String(batchRuns.length), "Recent EOD and BOD executions recorded in LMS"]);
  }
  el.lmsModuleSummary.innerHTML = summaryItems.map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");

  if (module.custom === "daily_batch") {
    el.lmsModuleForm.classList.remove("hidden");
    el.lmsModuleForm.innerHTML = renderDailyBatchModule(selected);
  } else if (module.fields) {
    el.lmsModuleForm.classList.remove("hidden");
    el.lmsModuleForm.innerHTML = renderLmsModuleForm(module, selected, stored) + `<button class="primary-btn" type="submit">Save ${module.title}</button>`;
    el.lmsModuleForm.dataset.section = module.section || "";
  } else {
    el.lmsModuleForm.classList.add("hidden");
    el.lmsModuleForm.innerHTML = "";
  }

  const reportButtons = [];
  if (module.reports) {
    reportButtons.push(...module.reports);
  }
  el.lmsReports.innerHTML = reportButtons.length
    ? reportButtons.map((report) => `<div class="document-item"><div><strong>${report.label}</strong><p class="muted">${module.title} output for the selected agreement</p></div><button class="ghost-btn" type="button" data-lms-report="${report.path}">Open</button></div>`).join("")
    : `<div class="document-item"><div><strong>No direct report for this module</strong><p class="muted">Open the Reports module for SOA and major LMS outputs.</p></div><span class="status-pill">Info</span></div>`;
  document.querySelectorAll("[data-lms-report]").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(`/api/cases/${state.selectedCaseId}/${button.dataset.lmsReport}`, "_blank");
    });
  });
  bindDailyBatchActions(selected);
}

function renderLmsModuleForm(module, selected, stored) {
  const top = `<div class="lms-form-title">${module.title}</div><div class="lms-form-note">${module.detail}</div><input type="hidden" name="section" value="${module.section || ""}">`;
  const fields = module.fields.map((field) => {
    const rawStored = Array.isArray(stored) ? {} : stored;
    const value = rawStored[field.name] || "";
    if (field.type === "master-select") {
      const options = selected.master_dropdowns?.[field.optionsKey] || [];
      return `<label><span>${field.label}</span><select name="${field.name}" required>${options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>`;
    }
    return `<label><span>${field.label}</span><input type="${field.type}" name="${field.name}" value="${value}" ${field.step ? `step="${field.step}"` : ""} required></label>`;
  }).join("");
  return top + fields;
}

function renderDailyBatchModule(selected) {
  const runs = selected.stage_data?.lms?.daily_batch_runs || [];
  const latestRun = runs[runs.length - 1];
  const eodSteps = [
    "Process banking presentation marked as deposit",
    "DPD process",
    "NPA movement process",
    "Accrual process",
    "LPP process",
    "Loan balances process",
    "Business date change process"
  ];
  const bodSteps = [
    "Creation of billing due as per due date"
  ];
  const renderStepCard = (title, steps, mode) => `
    <div class="document-item">
      <div>
        <strong>${title}</strong>
        <p class="muted">${steps.join(" | ")}</p>
      </div>
      <button class="primary-btn" type="button" data-batch-run="${mode}">Run ${mode.toUpperCase()}</button>
    </div>
  `;
  const latestInfo = latestRun
    ? `<div class="document-item"><div><strong>Latest Batch Run</strong><p class="muted">${latestRun.batch_type.toUpperCase()} on ${latestRun.process_date} | ${latestRun.batch_status} | Business Date ${latestRun.business_date}</p></div><span class="status-pill">${latestRun.batch_status}</span></div>`
    : `<div class="document-item"><div><strong>No batch run executed yet</strong><p class="muted">Use Run EOD or Run BOD to simulate the daily LMS batch cycle.</p></div><span class="status-pill">Ready</span></div>`;

  return `
    <div class="lms-form-title">Daily EOD & BOD Process</div>
    <div class="lms-form-note">Single batch processing for LMS daily operations and business date movement.</div>
    ${latestInfo}
    ${renderStepCard("Daily EOD Batch", eodSteps, "eod")}
    ${renderStepCard("Daily BOD Batch", bodSteps, "bod")}
  `;
}

function bindDailyBatchActions(selected) {
  if (state.currentLmsModule !== "daily_batch") return;
  document.querySelectorAll("[data-batch-run]").forEach((button) => {
    button.addEventListener("click", async () => {
      const batchType = button.dataset.batchRun;
      const today = new Date().toISOString().slice(0, 10);
      const values = batchType === "eod"
        ? {
            batch_type: "eod",
            process_date: today,
            batch_status: "Completed",
            business_date: today,
            banking_presentation_process: "Completed",
            dpd_process: "Completed",
            npa_movement_process: "Completed",
            accrual_process: "Completed",
            lpp_process: "Completed",
            loan_balances_process: "Completed",
            business_date_change_process: "Completed"
          }
        : {
            batch_type: "bod",
            process_date: today,
            batch_status: "Completed",
            business_date: today,
            billing_due_creation_process: "Completed"
          };
      await api(`/api/cases/${state.selectedCaseId}/lms`, {
        method: "POST",
        body: JSON.stringify({ section: "daily_batch_runs", values })
      });
      await refreshAll();
      setView("lms");
    });
  });
}

function renderAllViews() {
  renderDashboard();
  renderCaseDetails();
  renderJourneyGuide();
  renderApplicationsView();
  renderVerificationView();
  renderCreditView();
  renderDisbursementView();
  renderLmsView();
  bindDraftAutoSave(el.leadForm, "lead-form", "new");
}

async function refreshCaseDetails() {
  if (!state.selectedCaseId) return;
  const item = await api(`/api/cases/${state.selectedCaseId}`);
  state.cases = state.cases.map((row) => String(row.id) === String(item.id) ? item : row);
}

async function refreshAll() {
  const [dashboard, cases] = await Promise.all([api("/api/dashboard"), api("/api/cases")]);
  state.dashboard = dashboard;
  state.cases = cases;
  if (!state.selectedCaseId && cases[0]) state.selectedCaseId = cases[0].id;
  if (state.selectedCaseId && cases.some((item) => String(item.id) === String(state.selectedCaseId))) {
    await refreshCaseDetails();
  }
  renderAllViews();
}

async function focusCaseAndOpenNextAction(caseId, fallbackView = "pipeline") {
  state.selectedCaseId = caseId;
  await refreshCaseDetails();
  renderAllViews();
  setView(fallbackView);
  openCurrentStep();
}

async function advanceSelectedCase(targetStage) {
  await api(`/api/cases/${state.selectedCaseId}/advance`, {
    method: "POST",
    body: JSON.stringify(targetStage === undefined ? {} : { target_stage: targetStage })
  });
  await refreshAll();
}

async function resetSelectedCase() {
  await api(`/api/cases/${state.selectedCaseId}/reset`, { method: "POST", body: JSON.stringify({}) });
  setView("pipeline");
  await refreshAll();
}

function openCurrentStep() {
  const selected = getSelectedCase();
  if (!selected) return;
  if (isFrozenInLos(selected)) {
    window.location.href = "/lms";
    return;
  }
  const step = STAGE_PLAYBOOK[Math.min(selected.stage, STAGE_PLAYBOOK.length - 1)];
  setView(step.view);
  activateTab(step.tab);
  if (selected.stage === 1) {
    el.customerDetailsCard.classList.remove("hidden");
    el.customerDetailsCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (STAGE_FORM_DEFS[selected.stage]) {
    const card = STAGE_FORM_DEFS[selected.stage].view === "verification"
      ? el.stageFormCardVerification
      : STAGE_FORM_DEFS[selected.stage].view === "credit"
        ? el.stageFormCardCredit
        : el.stageFormCardDisbursement;
    card.classList.remove("hidden");
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function approveSelectedCase() {
  if (isFrozenInLos(getSelectedCase())) return;
  await api(`/api/cases/${state.selectedCaseId}/approve`, { method: "POST", body: JSON.stringify({}) });
  await refreshAll();
  openCurrentStep();
}

async function rejectSelectedCase() {
  if (isFrozenInLos(getSelectedCase())) return;
  await api(`/api/cases/${state.selectedCaseId}/reject`, { method: "POST", body: JSON.stringify({}) });
  setView("applications");
  await refreshAll();
}

el.approveBtn.addEventListener("click", async () => {
  if (isFrozenInLos(getSelectedCase())) return;
  await advanceSelectedCase(10);
});
el.holdBtn.addEventListener("click", async () => {
  if (isFrozenInLos(getSelectedCase())) return;
  await api(`/api/cases/${state.selectedCaseId}/hold`, { method: "POST", body: JSON.stringify({}) });
  await refreshAll();
});
el.openLmsBtn?.addEventListener("click", () => {
  window.location.href = "/lms";
});
el.exportBtn.addEventListener("click", () => window.open("/api/export", "_blank"));
el.leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(el.leadForm).entries());
  payload.amount = Number(payload.amount);
  payload.tenor = Number(payload.tenor);
  const leadErrors = validateLeadPayload(payload);
  if (leadErrors.length) {
    window.alert(leadErrors.join("\n"));
    return;
  }
  const created = await api("/api/leads", { method: "POST", body: JSON.stringify(payload) });
  if (showValidationErrors(created) || !created?.id) return;
  state.selectedCaseId = created.id;
  clearDraft("lead-form", "new");
  el.leadForm.reset();
  await refreshAll();
  openCurrentStep();
});

el.customerProfileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isFrozenInLos(getSelectedCase())) return;
  const payload = Object.fromEntries(new FormData(el.customerProfileForm).entries());
  const profileErrors = validateProfilePayload(payload);
  if (profileErrors.length) {
    window.alert(profileErrors.join("\n"));
    return;
  }
  const saved = await api(`/api/cases/${state.selectedCaseId}/profile`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (showValidationErrors(saved)) return;
  clearDraft("customer-profile", state.selectedCaseId || "new");
  await refreshAll();
  openCurrentStep();
});

async function handleStageFormSubmit(event) {
  event.preventDefault();
  if (isFrozenInLos(getSelectedCase())) return;
  const form = event.currentTarget;
  const submittedStage = Number(form.dataset.stage || 0);
  const payload = Object.fromEntries(new FormData(form).entries());
  const saved = await api(`/api/cases/${state.selectedCaseId}/stage-form`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (showValidationErrors(saved)) {
    await refreshAll();
    return;
  }
  clearDraft("stage-form", state.selectedCaseId, submittedStage);
  await refreshAll();
  const selected = getSelectedCase();
  if (selected) {
    openCurrentStep();
  }
  if (submittedStage === 12 && saved?.status?.includes("Disbursed")) {
    showDisbursalModal(saved);
  }
}

async function handleLmsFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const section = formData.get("section");
  const values = Object.fromEntries([...formData.entries()].filter(([key]) => key !== "section"));
  await api(`/api/cases/${state.selectedCaseId}/lms`, {
    method: "POST",
    body: JSON.stringify({ section, values })
  });
  await refreshAll();
  setView("lms");
}

el.stageFormVerification.addEventListener("submit", handleStageFormSubmit);
el.stageFormCredit.addEventListener("submit", handleStageFormSubmit);
el.stageFormDisbursement.addEventListener("submit", handleStageFormSubmit);
el.closeDisbursalModal?.addEventListener("click", closeDisbursalModal);
el.disbursalSuccessModal?.addEventListener("click", (event) => {
  if (event.target === el.disbursalSuccessModal) closeDisbursalModal();
});
el.modalDownloadRepayment?.addEventListener("click", () => {
  window.open(`/api/cases/${state.selectedCaseId}/repayment-pdf`, "_blank");
});
el.modalDownloadSanction?.addEventListener("click", () => {
  window.open(`/api/cases/${state.selectedCaseId}/sanction-letter`, "_blank");
});
el.modalDownloadEsign?.addEventListener("click", () => {
  window.open(`/api/cases/${state.selectedCaseId}/esign-pdf`, "_blank");
});
el.modalOpenLms?.addEventListener("click", () => {
  window.location.href = "/lms";
});
el.lmsModuleForm?.addEventListener("submit", handleLmsFormSubmit);

bindNav();
bindTabs();
setView("pipeline");
refreshAll();
