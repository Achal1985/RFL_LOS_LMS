const LMS_MODULE_DEFS = {
  soa: {
    title: "Statement of Account",
    detail: "Generate SOA and review installment-wise account movement for the live loan.",
    summary: "SOA shows EMI status, principal, interest, and payment tracking after disbursal.",
    reports: [{ label: "Download SOA PDF", path: "soa-pdf" }]
  },
  case_viewer: {
    title: "Case Viewer",
    detail: "Review agreement, disbursal, charges, applicant and account details.",
    summary: "Case Viewer gives the full agreement-level snapshot for the selected loan."
  },
  post_disbursal_edit: {
    title: "Post Disbursal Edit",
    detail: "Capture customer, account or contact edits after booking.",
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
    detail: "Record foreclosure request, quote amount and final status.",
    summary: "Foreclosure tracking stores request date, quote amount and closure progression.",
    section: "foreclosure",
    fields: [
      { name: "foreclosure_date", label: "Foreclosure Date", type: "date" },
      { name: "quoted_amount", label: "Quoted Amount", type: "number", step: "0.01" },
      { name: "foreclosure_status", label: "Foreclosure Status", type: "master-select", optionsKey: "foreclosure_status" },
      { name: "foreclosure_remark", label: "Foreclosure Remark", type: "text" }
    ],
    reports: [{ label: "Download Foreclosure Statement", path: "foreclosure-statement" }]
  },
  reschedule: {
    title: "Reschedule of Loan",
    detail: "Change tenor, ROI or EMI basis with effective date and reason.",
    summary: "Loan rescheduling updates revised servicing terms.",
    section: "reschedule",
    fields: [
      { name: "reschedule_reason", label: "Reschedule Reason", type: "master-select", optionsKey: "reschedule_reason" },
      { name: "new_tenor", label: "New Tenor (months)", type: "number" },
      { name: "new_roi", label: "New ROI", type: "number", step: "0.01" },
      { name: "effective_date", label: "Effective Date", type: "date" },
      { name: "revised_emi", label: "Revised EMI", type: "number", step: "0.01" }
    ],
    reports: [{ label: "Download Revised Repayment Schedule", path: "revised-schedule" }]
  },
  npa_movement: {
    title: "NPA Movement",
    detail: "Track DPD bucket, NPA stage and movement date.",
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
    detail: "Create banking presentations with date, mode, amount and batch reference.",
    summary: "Presentation data drives downstream bank status and return handling.",
    section: "banking_presentations",
    fields: [
      { name: "presentation_date", label: "Presentation Date", type: "date" },
      { name: "presentation_mode", label: "Presentation Mode", type: "master-select", optionsKey: "presentation_mode" },
      { name: "presentation_amount", label: "Presentation Amount", type: "number", step: "0.01" },
      { name: "accounting_template", label: "Accounting Template", type: "master-select", optionsKey: "accounting_template" },
      { name: "batch_reference", label: "Batch Reference", type: "text" },
      { name: "cycle", label: "Cycle", type: "text" }
    ]
  },
  banking_status_updates: {
    title: "Banking Status Updation",
    detail: "Update clearing status, response and return reason against presentations.",
    summary: "Bank status updates distinguish cleared, returned and represented transactions.",
    section: "banking_status_updates",
    fields: [
      { name: "presentation_ref", label: "Presentation Reference", type: "text" },
      { name: "bank_status", label: "Bank Status", type: "master-select", optionsKey: "bank_status" },
      { name: "return_reason", label: "Return Reason", type: "master-select", optionsKey: "return_reason" },
      { name: "accounting_template", label: "Accounting Template", type: "master-select", optionsKey: "accounting_template" },
      { name: "status_date", label: "Status Date", type: "date" }
    ]
  },
  collection_updates: {
    title: "Collection Updation",
    detail: "Capture collection receipts with amount, channel, collector and remark.",
    summary: "Collections feed the SOA and servicing totals in LMS.",
    section: "collection_updates",
    fields: [
      { name: "collection_date", label: "Collection Date", type: "date" },
      { name: "collection_channel", label: "Collection Channel", type: "master-select", optionsKey: "collection_channel" },
      { name: "collection_amount", label: "Collection Amount", type: "number", step: "0.01" },
      { name: "accounting_template", label: "Accounting Template", type: "master-select", optionsKey: "accounting_template" },
      { name: "collector_name", label: "Collector Name", type: "text" },
      { name: "collection_remark", label: "Collection Remark", type: "text" }
    ],
    reports: [{ label: "Download Collection Register", path: "collection-report" }]
  },
  knockoff_entries: {
    title: "Knock Off Excess Against Due Charges",
    detail: "Map excess collections against due charges with reference and narration.",
    summary: "Knock off entries reduce outstanding charges using excess funds.",
    section: "knockoff_entries",
    fields: [
      { name: "excess_amount", label: "Excess Amount", type: "number", step: "0.01" },
      { name: "target_due_charge", label: "Against Due Charge", type: "master-select", optionsKey: "due_charge_head" },
      { name: "accounting_template", label: "Accounting Template", type: "master-select", optionsKey: "accounting_template" },
      { name: "knockoff_reference", label: "Reference", type: "text" },
      { name: "knockoff_remark", label: "Knock Off Remark", type: "text" }
    ]
  },
  manual_charges_due: {
    title: "Creation of Manual Charges Due",
    detail: "Create due charges manually with charge head, amount, due date and narration.",
    summary: "Manual charges let operations post extra dues after disbursal.",
    section: "manual_charges_due",
    fields: [
      { name: "charge_head", label: "Charge Head", type: "master-select", optionsKey: "due_charge_head" },
      { name: "due_amount", label: "Due Amount", type: "number", step: "0.01" },
      { name: "due_date", label: "Due Date", type: "date" },
      { name: "accounting_template", label: "Accounting Template", type: "master-select", optionsKey: "accounting_template" },
      { name: "charge_narration", label: "Charge Narration", type: "text" }
    ],
    reports: [{ label: "Download Charge Ledger", path: "charge-ledger" }]
  },
  charge_waivers: {
    title: "Waiver of Charges",
    detail: "Record approved waivers by charge head, amount, reason and approver.",
    summary: "Charge waivers reduce customer dues and remain visible in the charge ledger.",
    section: "charge_waivers",
    fields: [
      { name: "waiver_charge_head", label: "Charge Head", type: "master-select", optionsKey: "due_charge_head" },
      { name: "waiver_amount", label: "Waiver Amount", type: "number", step: "0.01" },
      { name: "waiver_reason", label: "Waiver Reason", type: "master-select", optionsKey: "waiver_reason" },
      { name: "accounting_template", label: "Accounting Template", type: "master-select", optionsKey: "accounting_template" },
      { name: "approver", label: "Approver", type: "text" }
    ]
  },
  voucher_register: {
    title: "Accounting And Voucher Register",
    detail: "Review accounting template usage and voucher entries posted by LMS transactions.",
    summary: "Each servicing transaction posts a voucher based on the selected accounting template.",
    reports: [{ label: "Download Voucher Register", path: "voucher-register" }]
  },
  reports: {
    title: "LMS Reports",
    detail: "Generate SOA and major LMS reports for collections, charges and agreement servicing.",
    summary: "Use report outputs for audit, servicing and customer communication.",
    reports: [
      { label: "Download SOA PDF", path: "soa-pdf" },
      { label: "Download Collection Register", path: "collection-report" },
      { label: "Download Charge Ledger", path: "charge-ledger" },
      { label: "Download Voucher Register", path: "voucher-register" },
      { label: "Download Complete Repayment", path: "repayment-pdf" }
    ]
  },
  daily_batch: {
    title: "Daily EOD & BOD Process",
    detail: "Run single batch EOD and BOD processes for banking, DPD, NPA, accrual, LPP, balances and billing due.",
    summary: "Use this module to simulate the daily LMS batch cycle across all disbursed loans.",
    custom: "daily_batch"
  }
};

const state = { selectedCaseId: null, caseItem: null, currentModule: "soa", cases: [], query: "", sessionUser: {} };

const el = {
  casePill: document.getElementById("lms-case-pill"),
  businessDate: document.getElementById("lms-business-date"),
  overview: document.getElementById("lms-overview"),
  statementTable: document.getElementById("lms-statement-table"),
  caseViewer: document.getElementById("lms-case-viewer"),
  actionLog: document.getElementById("lms-action-log"),
  menu: document.getElementById("lms-menu"),
  moduleTitle: document.getElementById("lms-module-title"),
  moduleSummary: document.getElementById("lms-module-summary"),
  moduleForm: document.getElementById("lms-module-form"),
  reports: document.getElementById("lms-reports"),
  searchInput: document.getElementById("lms-search-input"),
  searchBtn: document.getElementById("lms-search-btn"),
  clearBtn: document.getElementById("lms-clear-btn"),
  searchResults: document.getElementById("lms-search-results"),
  searchStatus: document.getElementById("lms-search-status"),
  sideLinks: document.querySelectorAll("[data-lms-jump]")
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error(`API failed: ${response.status}`);
  return response.json();
}

function getCaseIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("case_id");
}

function infoCard(title, note, pill) {
  return `<div class="document-item lms-info-card"><div><strong>${title}</strong><p class="muted">${note}</p></div><span class="status-pill">${pill}</span></div>`;
}

function card(title, note, pill) {
  return `<div class="document-item"><div><strong>${title}</strong><p class="muted">${note}</p></div><span class="status-pill">${pill}</span></div>`;
}

function formatAuditMeta(entry) {
  if (!entry || typeof entry !== "object") return "";
  const maker = entry.maker_user ? `Maker: ${entry.maker_user}${entry.maker_at ? ` • ${entry.maker_at}` : ""}` : "";
  const checker = entry.checker_user ? `Checker: ${entry.checker_user}${entry.checker_at ? ` • ${entry.checker_at}` : ""}` : "Checker: Pending";
  const status = entry.checker_status || "";
  return [maker, checker, status ? `Status: ${status}` : ""].filter(Boolean).join(" | ");
}

function getCurrentBusinessDateLabel() {
  const source = state.caseItem || state.cases.find((item) => item.stage >= 12) || state.cases[0];
  return source?.system_business_date_label || source?.lms_summary?.business_date_label || "--";
}

function updateHeaderState() {
  if (el.businessDate) {
    el.businessDate.textContent = getCurrentBusinessDateLabel();
  }
  if (!state.caseItem) {
    el.casePill.textContent = "No account selected";
  }
}

function filterCases(query) {
  const normalized = String(query || "").trim().toLowerCase();
  const disbursedCases = state.cases.filter((item) => item.stage >= 12);
  if (!normalized) return disbursedCases.slice(0, 8);
  return disbursedCases.filter((item) => {
    const disbursal = item.stage_data?.disbursement || {};
    const searchable = [
      item.case_code,
      item.customer_id,
      item.applicant,
      item.product,
      disbursal.agreement_number,
      item.profile?.mobile,
      item.profile?.account_number
    ].filter(Boolean).join(" ").toLowerCase();
    return searchable.includes(normalized);
  });
}

function renderSearchResults(items) {
  if (!items.length) {
    el.searchResults.innerHTML = card("No account matched", "Search by application ID, LOS ID, agreement number, customer ID or customer name.", "0 Match");
    return;
  }
  el.searchResults.innerHTML = items.map((item) => {
    const disbursal = item.stage_data?.disbursement || {};
    const isSelected = String(item.id) === String(state.selectedCaseId);
    return `
      <button class="document-item lms-search-result ${isSelected ? "selected" : ""}" type="button" data-case-select="${item.id}">
        <div>
          <strong>${item.applicant}</strong>
          <p class="muted">${item.case_code} • ${disbursal.agreement_number || "Agreement Pending"} • ${item.customer_id}</p>
          <p class="muted">${item.product} • ${formatCurrency(item.amount)} • ${item.workflow_stage}</p>
        </div>
        <span class="status-pill">${isSelected ? "Opened" : "Open"}</span>
      </button>
    `;
  }).join("");
  document.querySelectorAll("[data-case-select]").forEach((btn) => btn.addEventListener("click", async () => {
    state.selectedCaseId = btn.dataset.caseSelect;
    history.replaceState({}, "", `/lms?case_id=${state.selectedCaseId}`);
    await loadCase();
  }));
}

function handleSearch() {
  state.query = el.searchInput.value || "";
  const results = filterCases(state.query);
  el.searchStatus.textContent = results.length ? `${results.length} Match${results.length === 1 ? "" : "es"}` : "No Match";
  renderSearchResults(results);
}

function renderEmptyWorkspace(message = "Search a disbursed account to open the LMS workspace.") {
  updateHeaderState();
  el.overview.innerHTML = `<div class="lms-case-grid">
    <div class="lms-case-mini"><span>Workspace</span><strong>Common LMS</strong></div>
    <div class="lms-case-mini"><span>Status</span><strong>Search Required</strong></div>
    <div class="lms-case-mini"><span>Business Date</span><strong>${getCurrentBusinessDateLabel()}</strong></div>
    <div class="lms-case-mini"><span>Guidance</span><strong>${message}</strong></div>
  </div>`;
  el.statementTable.innerHTML = "";
  el.caseViewer.innerHTML = card("No account loaded", "Use the common LMS lookup above to open a live agreement.", "Idle");
  el.actionLog.innerHTML = card("No LMS actions yet", "Select a disbursed account to view servicing actions and reports.", "Idle");
  el.menu.innerHTML = "";
  el.moduleTitle.textContent = "Select LMS Function";
  el.moduleSummary.innerHTML = card("Module workspace waiting", "After you open an account, servicing and collections modules will appear here.", "Waiting");
  el.moduleForm.classList.add("hidden");
  el.moduleForm.innerHTML = "";
  el.reports.innerHTML = card("Reports unavailable", "Select an account first to generate SOA, foreclosure, reschedule and ledger reports.", "Waiting");
}

function renderOverview(item) {
  const summary = item.lms_summary || {};
  const disbursal = item.stage_data?.disbursement || {};
  el.casePill.textContent = `${item.case_code} • ${disbursal.agreement_number || "Agreement Pending"}`;
  if (el.businessDate) {
    el.businessDate.textContent = item.system_business_date_label || summary.business_date_label || "--";
  }
  el.overview.innerHTML = `<div class="lms-case-grid">${
    [
      ["Agreement No", disbursal.agreement_number || "Pending"],
      ["Business Date", summary.business_date_label || item.system_business_date_label || "--"],
      ["Loan Status", summary.loan_status || "Live"],
      ["NPA Stage", summary.npa_stage || "Regular"],
      ["DPD", String(summary.dpd || 0)],
      ["Accrued Int", formatCurrency(summary.accrued_interest || 0)],
      ["LPP Due", formatCurrency(summary.lpp_due || 0)],
      ["Billed Due", String(summary.billed_due_count || 0)],
      ["Banking", `${summary.cleared_presentation_count || 0}/${summary.presentation_count || 0}`],
      ["Manual Coll", formatCurrency(summary.collection_total || 0)],
      ["Manual Chg", formatCurrency(summary.manual_charges_total || 0)],
      ["Waiver", formatCurrency(summary.waiver_total || 0)],
      ["Knock Off", formatCurrency(summary.excess_knockoff_total || 0)],
      ["Principal O/S", formatCurrency(summary.outstanding_principal || 0)],
      ["Total O/S", formatCurrency(summary.total_outstanding || 0)],
      ["Next Due", summary.next_due_date || "No due pending"]
    ].map(([label, value]) => `<div class="lms-case-mini"><span>${label}</span><strong>${value}</strong></div>`).join("")
  }</div>`;

  el.statementTable.innerHTML = (summary.statement_rows || []).map((row) => `
    <tr>
      <td>${row.emi_number}</td>
      <td>${row.due_date}</td>
      <td>${formatCurrency(row.emi_amount)}</td>
      <td>${formatCurrency(row.principal)}</td>
      <td>${formatCurrency(row.interest)}</td>
      <td>${row.status}</td>
    </tr>
  `).join("");

  el.caseViewer.innerHTML = `<div class="lms-case-grid">${
    [
      ["Application ID", item.case_code],
      ["Customer ID", item.customer_id],
      ["Agreement No", disbursal.agreement_number || "Pending"],
      ["Customer", item.applicant],
      ["Product", item.product],
      ["Loan Amount", formatCurrency(item.amount)],
      ["Net Disbursal", formatCurrency(item.net_disbursal_amount)],
      ["Principal O/S", formatCurrency(summary.outstanding_principal || 0)],
      ["Interest O/S", formatCurrency(summary.interest_outstanding_billed || 0)],
      ["Principal Paid", formatCurrency(summary.principal_paid || 0)],
      ["Interest Paid", formatCurrency(summary.interest_paid || 0)],
      ["Charges O/S", formatCurrency(summary.charges_outstanding || 0)],
      ["Excess Amount", formatCurrency(summary.excess_amount || 0)],
      ["DPD", String(summary.dpd || 0)],
      ["NPA Stage", summary.npa_stage || "Regular"],
      ["Loan Status", summary.loan_status || "Live"],
      ["Total O/S", formatCurrency(summary.total_outstanding || 0)],
      ["Next Due", summary.next_due_date || "No due pending"],
      ["Disbursal A/c", disbursal.disbursal_account || item.profile?.account_number || "Pending"],
      ["Interest Start", disbursal.interest_start_date || "Pending"]
    ].map(([label, value]) => `<div class="lms-case-mini"><span>${label}</span><strong>${value}</strong></div>`).join("")
  }</div>`;

  const lms = item.stage_data?.lms || {};
  const logParts = [];
  const push = (title, data, list = false) => {
    if (!data || (Array.isArray(data) && !data.length)) return;
    if (list) {
      data.slice(-2).forEach((entry) => {
        const detail = Object.entries(entry)
          .filter(([k]) => !["maker_name", "checker_name"].includes(k))
          .map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`).join(" | ");
        logParts.push(card(title, `${detail}<br><span class="muted">${formatAuditMeta(entry)}</span>`, entry.checker_status || "Saved LMS entry"));
      });
      return;
    }
    const detail = Object.entries(data)
      .filter(([k]) => !["maker_name", "checker_name"].includes(k))
      .map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`).join(" | ");
    logParts.push(card(title, `${detail}<br><span class="muted">${formatAuditMeta(data)}</span>`, data.checker_status || "Saved LMS entry"));
  };
  push("Post Disbursal Edit", lms.post_disbursal_edit);
  push("Foreclosure", lms.foreclosure);
  push("Reschedule", lms.reschedule);
  push("NPA Movement", lms.npa_movement);
  push("Banking Presentation", lms.banking_presentations, true);
  push("Banking Status", lms.banking_status_updates, true);
  push("Collection Update", lms.collection_updates, true);
  push("Excess Knock Off", lms.knockoff_entries, true);
  push("Manual Charges Due", lms.manual_charges_due, true);
  push("Charge Waiver", lms.charge_waivers, true);
  push("Daily Batch Run", lms.daily_batch_runs, true);
  push("Voucher Entry", lms.voucher_entries, true);
  el.actionLog.innerHTML = logParts.join("") || card("No LMS actions yet", "Use the module workspace to simulate post-disbursal servicing actions.", "Ready");
}

function renderMenu(item) {
  el.menu.innerHTML = Object.entries(LMS_MODULE_DEFS).map(([key, module]) => `
    <button class="lms-menu-btn ${state.currentModule === key ? "active" : ""}" type="button" data-module="${key}">
      <strong>${module.title}</strong>
      <span>${module.detail}</span>
    </button>
  `).join("");
  document.querySelectorAll("[data-module]").forEach((btn) => btn.addEventListener("click", () => {
    state.currentModule = btn.dataset.module;
    renderWorkspace(item);
    renderMenu(item);
  }));
}

function renderWorkspace(item) {
  const module = LMS_MODULE_DEFS[state.currentModule];
  const lms = item.stage_data?.lms || {};
  const rawStored = module.section ? (lms[module.section] || {}) : {};
  const stored = Array.isArray(rawStored) ? (rawStored[rawStored.length - 1] || {}) : rawStored;
  el.moduleTitle.textContent = module.title;
  const summary = [
    ["Module", module.title, module.summary],
    ["Agreement Number", item.stage_data?.disbursement?.agreement_number || "Pending", "Agreement reference in LMS"],
    ["Loan Status", item.lms_summary?.loan_status || "Live", "Current servicing stage"],
    ["Business Date", item.system_business_date_label || item.lms_summary?.business_date_label || "--", "Shared business date across LOS and LMS"],
    ["Current User", state.sessionUser.user_id || "--", "Maker-checker is validated against the active user"]
  ];
  if (module.section) {
    summary.push(["Checker Status", stored.checker_status || "Ready for Maker", "Transactions require maker and checker by different users"]);
  }
  if (state.currentModule === "voucher_register") {
    summary.push(["Voucher Count", String((lms.voucher_entries || []).length), "Voucher entries passed as per accounting templates"]);
  }
  if (state.currentModule === "foreclosure") {
    summary.push(["Foreclosure Quote", formatCurrency(parseFloat(stored.quoted_amount || 0) || item.lms_summary?.total_outstanding || 0), "Customer-facing foreclosure simulation statement is available"]);
  }
  if (state.currentModule === "reschedule") {
    summary.push(["Revised EMI", formatCurrency(parseFloat(stored.revised_emi || 0)), "Updated EMI used for revised repayment simulation"]);
  }
  if (module.custom === "daily_batch") {
    summary.push(["Batch Runs", String((lms.daily_batch_runs || []).length), "Recent EOD and BOD executions across all disbursed loans"]);
  }
  el.moduleSummary.innerHTML = summary.map(([a, b, c]) => card(a, c, b)).join("");

  if (module.custom === "daily_batch") {
    el.moduleForm.classList.remove("hidden");
    el.moduleForm.innerHTML = renderBatchModule(item);
    bindBatchButtons();
  } else if (module.fields) {
    el.moduleForm.classList.remove("hidden");
    el.moduleForm.innerHTML = renderModuleForm(module, item, stored) + `
      <div class="master-action-row">
        <button class="ghost-btn" type="submit" data-approval-mode="checker">Approve As Checker</button>
        <button class="primary-btn" type="submit" data-approval-mode="maker">Save As Maker</button>
      </div>`;
  } else {
    el.moduleForm.classList.add("hidden");
    el.moduleForm.innerHTML = "";
  }

  const reportList = module.reports || [];
  el.reports.innerHTML = reportList.length
    ? reportList.map((r) => `<div class="document-item"><div><strong>${r.label}</strong><p class="muted">${module.title} output for the selected agreement</p></div><button class="ghost-btn" type="button" data-report="${r.path}">Open</button></div>`).join("")
    : card("No direct report for this module", "Open the LMS Reports module for SOA and major LMS outputs.", "Info");
  document.querySelectorAll("[data-report]").forEach((btn) => btn.addEventListener("click", () => window.open(`/api/cases/${state.selectedCaseId}/${btn.dataset.report}`, "_blank")));
}

function renderModuleForm(module, item, stored) {
  const head = `<div class="lms-form-title">${module.title}</div><div class="lms-form-note">${module.detail}</div><input type="hidden" name="section" value="${module.section}">`;
  return head + module.fields.map((field) => {
    const value = stored[field.name] || getAutofillValue(module.section, field.name, item);
    if (field.type === "master-select") {
      const options = item.master_dropdowns?.[field.optionsKey] || [];
      return `<label><span>${field.label}</span><select name="${field.name}" required>${options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>`;
    }
    return `<label><span>${field.label}</span><input type="${field.type}" name="${field.name}" value="${value}" ${field.step ? `step="${field.step}"` : ""} required></label>`;
  }).join("");
}

function getAutofillValue(section, fieldName, item) {
  const summary = item.lms_summary || {};
  const disbursal = item.stage_data?.disbursement || {};
  const lms = item.stage_data?.lms || {};
  const lastPresentation = (lms.banking_presentations || []).slice(-1)[0] || {};
  const lastCollection = (lms.collection_updates || []).slice(-1)[0] || {};
  const businessDate = summary.business_date || item.system_business_date || "";
  if (section === "post_disbursal_edit") {
    if (fieldName === "updated_mobile") return item.profile?.mobile || "";
    if (fieldName === "updated_email") return item.profile?.email || "";
    if (fieldName === "updated_account") return item.profile?.account_number || "";
  }
  if (section === "foreclosure") {
    if (fieldName === "foreclosure_date") return businessDate;
    if (fieldName === "quoted_amount") return String(summary.total_outstanding || 0);
  }
  if (section === "reschedule") {
    if (fieldName === "new_tenor") return String(item.tenor || "");
    if (fieldName === "new_roi") return String(item.roi || "");
    if (fieldName === "effective_date") return businessDate;
    if (fieldName === "revised_emi") return String(item.repayment?.emi_amount || "");
  }
  if (section === "npa_movement") {
    if (fieldName === "dpd_bucket") return String(summary.dpd || 0);
    if (fieldName === "effective_date") return businessDate;
  }
  if (section === "banking_presentations") {
    if (fieldName === "presentation_date") return businessDate;
    if (fieldName === "presentation_amount") return String(summary.outstanding_due || item.repayment?.emi_amount || 0);
    if (fieldName === "accounting_template") return "Bank Presentation";
    if (fieldName === "batch_reference") return disbursal.agreement_number || item.case_code;
  }
  if (section === "banking_status_updates") {
    if (fieldName === "presentation_ref") return lastPresentation.batch_reference || disbursal.agreement_number || "";
    if (fieldName === "accounting_template") return "Receipt Realization";
    if (fieldName === "status_date") return businessDate;
  }
  if (section === "collection_updates") {
    if (fieldName === "collection_date") return businessDate;
    if (fieldName === "collection_amount") return String(summary.outstanding_due || item.repayment?.emi_amount || 0);
    if (fieldName === "accounting_template") return "Receipt Realization";
    if (fieldName === "collector_name") return "System Collector";
    if (fieldName === "collection_remark") return lastCollection.collection_remark || "Regular collection";
  }
  if (section === "knockoff_entries") {
    if (fieldName === "excess_amount") return String(summary.excess_amount || 0);
    if (fieldName === "accounting_template") return "Excess Knock Off";
  }
  if (section === "manual_charges_due") {
    if (fieldName === "due_date") return businessDate;
    if (fieldName === "accounting_template") return "Manual Charge Booking";
  }
  if (section === "charge_waivers") {
    if (fieldName === "accounting_template") return "Charge Waiver";
  }
  return "";
}

function renderBatchModule(item) {
  const runs = item.stage_data?.lms?.daily_batch_runs || [];
  const latest = runs[runs.length - 1];
  const currentBusinessDate = item.system_business_date_label || item.lms_summary?.business_date_label || "Pending";
  const latestCard = latest
    ? card("Latest Batch Run", `${latest.batch_type.toUpperCase()} | Process ${latest.process_date || ""} | ${latest.batch_status} | Business Date ${latest.business_date_after || latest.business_date || latest.business_date_before || ""}`, latest.batch_status)
    : card("No batch run executed yet", "Use Run EOD or Run BOD to simulate the daily LMS batch cycle across all disbursed loans.", "Ready");
  return `
    <div class="lms-form-title">Daily EOD & BOD Process</div>
    <div class="lms-form-note">Single batch processing for LMS daily operations, portfolio servicing and business date movement.</div>
    ${card("Current Business Date", `Daily servicing calculations and billing run on ${currentBusinessDate}.`, currentBusinessDate)}
    ${latestCard}
    <div class="lms-batch-grid">
      <div class="lms-batch-card">
        <strong>Daily EOD Batch</strong>
        <p class="muted">Process banking presentations marked as deposit</p>
        <p class="muted">DPD process</p>
        <p class="muted">NPA movement process</p>
        <p class="muted">Accrual process</p>
        <p class="muted">LPP process</p>
        <p class="muted">Loan balances process</p>
        <p class="muted">Business date change process</p>
        <button class="primary-btn full" type="button" data-batch="eod">Run EOD</button>
      </div>
      <div class="lms-batch-card">
        <strong>Daily BOD Batch</strong>
        <p class="muted">Creation of billing due as per due date</p>
        <button class="primary-btn full" type="button" data-batch="bod">Run BOD</button>
      </div>
    </div>
  `;
}

function bindBatchButtons() {
  document.querySelectorAll("[data-batch]").forEach((btn) => btn.addEventListener("click", async () => {
    const type = btn.dataset.batch;
    await api(`/api/cases/${state.selectedCaseId}/lms`, { method: "POST", body: JSON.stringify({ section: "daily_batch_runs", values: { batch_type: type } }) });
    await refreshCases();
    await loadCase();
  }));
}

async function handleModuleSubmit(event) {
  event.preventDefault();
  if (!state.selectedCaseId) return;
  const payload = Object.fromEntries(new FormData(el.moduleForm).entries());
  const section = payload.section;
  const approvalMode = event.submitter?.dataset?.approvalMode || "maker";
  delete payload.section;
  const response = await api(`/api/cases/${state.selectedCaseId}/lms`, {
    method: "POST",
    body: JSON.stringify({ section, values: payload, approval_mode: approvalMode })
  });
  if (!response.ok) {
    window.alert(response.error || "Unable to save LMS transaction.");
    return;
  }
  window.alert(response.message || "LMS transaction updated.");
  await refreshCases();
  await loadCase();
}

function bindSideNav() {
  el.sideLinks.forEach((btn) => btn.addEventListener("click", () => {
    el.sideLinks.forEach((node) => node.classList.remove("active"));
    btn.classList.add("active");
    const target = document.getElementById(`${btn.dataset.lmsJump}-section`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

function bindSearch() {
  el.searchBtn?.addEventListener("click", handleSearch);
  el.clearBtn?.addEventListener("click", () => {
    state.query = "";
    el.searchInput.value = "";
    el.searchStatus.textContent = "Search Required";
    renderSearchResults(filterCases(""));
    if (!state.selectedCaseId) {
      renderEmptyWorkspace();
    }
  });
  el.searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });
  el.searchInput?.addEventListener("input", () => {
    if (!el.searchInput.value.trim()) {
      el.searchStatus.textContent = "Search Required";
      renderSearchResults(filterCases(""));
    }
  });
}

async function refreshCases() {
  state.cases = await api("/api/cases");
  updateHeaderState();
}

async function loadCase() {
  if (!state.selectedCaseId) {
    state.caseItem = null;
    renderEmptyWorkspace();
    return;
  }
  state.caseItem = await api(`/api/cases/${state.selectedCaseId}`);
  renderOverview(state.caseItem);
  renderMenu(state.caseItem);
  renderWorkspace(state.caseItem);
  renderSearchResults(filterCases(state.query));
}

async function init() {
  state.selectedCaseId = getCaseIdFromUrl();
  state.sessionUser = await api("/api/session");
  await refreshCases();
  bindSideNav();
  bindSearch();
  el.moduleForm.addEventListener("submit", handleModuleSubmit);
  renderSearchResults(filterCases(""));
  if (!state.selectedCaseId) {
    renderEmptyWorkspace();
    return;
  }
  await loadCase();
}

init();
