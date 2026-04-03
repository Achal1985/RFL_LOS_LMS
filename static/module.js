const MASTER_SCHEMAS = {
  product_master: {
    label: "Product Master",
    columns: [
      { key: "product_code", label: "Product Code" },
      { key: "product_name", label: "Product Name" },
      { key: "min_loan_amount", label: "Min Loan Amount", type: "number" },
      { key: "max_loan_amount", label: "Max Loan Amount", type: "number" },
      { key: "min_tenure", label: "Min Tenure", type: "number" },
      { key: "max_tenure", label: "Max Tenure", type: "number" },
      { key: "interest_calculation_method", label: "Interest Calculation Method", type: "select", options: ["30/360", "Actual/365", "Actual/Actual"] },
      { key: "round_off_parameter", label: "Round Off Parameter", type: "select", options: ["Round Down", "Round Off", "Round Up"] },
      { key: "min_interest_rate", label: "Min Interest Rate", type: "number", step: "0.01" },
      { key: "max_interest_rate", label: "Max Interest Rate", type: "number", step: "0.01" },
      { key: "frequency", label: "Frequency", type: "select", options: ["Monthly", "Bi-Monthly", "Quarterly", "Half yearly", "Yearly"] },
      { key: "installment_type", label: "Installment Type", type: "select", options: ["Equated", "Bullet", "Graded", "Balloon"] },
      { key: "prepayment_penalty_percentage", label: "PrePayment Penalty Percentage", type: "number", step: "0.01" },
      { key: "foreclosure_lockin_period", label: "Foreclosure Lockin Period", type: "number" },
      { key: "plr_type", label: "PLR Type", type: "select", options: ["RFRR", "RFRR2"] },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  due_date_master: {
    label: "Due Date Master",
    columns: [
      { key: "code", label: "Code" },
      { key: "value", label: "Value" },
      { key: "product_code", label: "Product Code" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  branch_master: {
    label: "Branch Master",
    columns: [
      { key: "code", label: "Code" },
      { key: "value", label: "Value" },
      { key: "branch_address", label: "Branch Address" },
      { key: "branch_city", label: "Branch City" },
      { key: "branch_state", label: "Branch State" },
      { key: "branch_zipcode", label: "Branch Zipcode" },
      { key: "branch_country", label: "Branch Country" },
      { key: "branch_oracle_code", label: "Branch Oracle Code" },
      { key: "branch_gst_number", label: "Branch GST Number" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  user_master: {
    label: "User Master",
    columns: [
      { key: "user_id", label: "User ID" },
      { key: "user_name", label: "User Name" },
      { key: "user_email_id", label: "User Email ID" },
      { key: "ldap_user", label: "LDAP User", type: "select", options: ["LDAP", "Non-LDAP"] },
      { key: "user_mobile_number", label: "User Mobile Number" },
      { key: "user_designation", label: "User Designation", type: "select", options: ["Officer", "Executive", "Manager", "Senior Manager", "Regional Head"] },
      { key: "user_department", label: "User Department", type: "select", options: ["Sales", "Operations", "Credit", "Collections", "IT", "Finance"] },
      { key: "user_supervisor", label: "User Supervisor", type: "select", options: ["Regional Head", "National Credit Head", "Ops Manager", "Business Head"] },
      { key: "user_creation_date", label: "User Creation Date", type: "date" },
      { key: "user_deactivation_date", label: "User Deactivation Date", type: "date" },
      { key: "user_modification_date", label: "User Modification Date", type: "date" },
      { key: "user_role_assigned", label: "User Role Assigned", type: "select", options: ["Enterprise Admin", "Underwriter", "Operations", "Collections", "SSO Admin"] },
      { key: "user_status", label: "User Status", type: "status" }
    ]
  },
  user_module_access_master: {
    label: "User Module Access Master",
    columns: [
      { key: "user_id", label: "User ID", type: "select-source", source: "user_master", sourceKey: "user_id" },
      { key: "user_name", label: "User Name", readonly: true },
      { key: "user_module_access", label: "User Module Access", type: "select", options: ["LOS", "LMS", "Masters", "SSO Admin"] },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  user_role_master: {
    label: "User Role Master",
    columns: [
      { key: "code", label: "Role Code" },
      { key: "value", label: "Role Name" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  dsa_master: {
    label: "DSA Master",
    columns: [
      { key: "code", label: "DSA Code" },
      { key: "value", label: "DSA Name" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  city_master: {
    label: "City Master",
    columns: [
      { key: "city_code", label: "City Code" },
      { key: "city_name", label: "City Name" },
      { key: "state_code", label: "State Code" },
      { key: "state_name", label: "State Name" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  state_master: {
    label: "State Master",
    columns: [
      { key: "state_code", label: "State Code" },
      { key: "state_name", label: "State Name" },
      { key: "country_id", label: "Country ID" },
      { key: "country_name", label: "Country Name" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  zipcode_master: {
    label: "Zipcode Master",
    columns: [
      { key: "zipcode", label: "Zipcode" },
      { key: "zipcode_name", label: "Zipcode Name" },
      { key: "city_id", label: "City ID" },
      { key: "city_name", label: "City Name" },
      { key: "state_id", label: "State ID" },
      { key: "state_name", label: "State Name" },
      { key: "status", label: "Status", type: "status" }
    ]
  },
  country_master: { label: "Country Master", columns: [{ key: "code", label: "Country Code" }, { key: "value", label: "Country Name" }, { key: "status", label: "Status", type: "status" }] },
  micr_code_master: { label: "MICR Code Master", columns: [{ key: "code", label: "MICR Code" }, { key: "value", label: "Description" }, { key: "status", label: "Status", type: "status" }] },
  ifsc_code_master: { label: "IFSC Code Master", columns: [{ key: "code", label: "IFSC Code" }, { key: "value", label: "Description" }, { key: "status", label: "Status", type: "status" }] },
  bank_master: { label: "Bank Master", columns: [{ key: "code", label: "Bank Code" }, { key: "value", label: "Bank Name" }, { key: "status", label: "Status", type: "status" }] },
  group_gl_master: { label: "Group GL Master", columns: [{ key: "code", label: "GL Code" }, { key: "value", label: "GL Name" }, { key: "status", label: "Status", type: "status" }] },
  npa_master: { label: "NPA Master", columns: [{ key: "code", label: "NPA Code" }, { key: "value", label: "NPA Bucket" }, { key: "status", label: "Status", type: "status" }] },
  npa_provisioning_master: { label: "NPA Provisioning Master", columns: [{ key: "code", label: "Provision Code" }, { key: "value", label: "Provision Rule" }, { key: "status", label: "Status", type: "status" }] },
  fund_allocation_logic_master: { label: "Fund Allocation Logic Master", columns: [{ key: "code", label: "Logic Code" }, { key: "value", label: "Logic Description" }, { key: "status", label: "Status", type: "status" }] },
  underwriter_rule_engine_master: { label: "Underwriter Rule Engine Master", columns: [{ key: "code", label: "Rule Code" }, { key: "value", label: "Rule Logic" }, { key: "status", label: "Status", type: "status" }] },
  generic_master: { label: "Generic Master", columns: [{ key: "code", label: "Key" }, { key: "value", label: "Value" }, { key: "status", label: "Status", type: "status" }] }
};

const state = { masters: {}, masterAudit: {}, activeMaster: "product_master", businessDate: "--", sessionUser: {} };

const el = {
  moduleBusinessDate: document.getElementById("module-business-date"),
  moduleCurrentUser: document.getElementById("module-current-user"),
  moduleTabs: document.querySelectorAll("[data-module-tab]"),
  moduleViews: document.querySelectorAll("[data-module-view]"),
  launchCards: document.querySelectorAll("[data-launch-target]"),
  masterCategoryGrid: document.getElementById("master-category-grid"),
  masterHeadings: document.getElementById("master-headings"),
  masterRows: document.getElementById("master-rows"),
  masterWorkspaceTitle: document.getElementById("master-workspace-title"),
  masterAuditBanner: document.getElementById("master-audit-banner"),
  masterAddRow: document.getElementById("master-add-row"),
  masterChecker: document.getElementById("master-checker"),
  masterSave: document.getElementById("master-save"),
  ssoSummary: document.getElementById("sso-summary"),
  ssoAccessGrid: document.getElementById("sso-access-grid")
};

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error(`API failed: ${response.status}`);
  return response.json();
}

function setModuleView(view) {
  el.moduleTabs.forEach((item) => item.classList.toggle("active", item.dataset.moduleTab === view));
  el.moduleViews.forEach((panel) => panel.classList.toggle("active", panel.dataset.moduleView === view));
}

function getSchema(key = state.activeMaster) {
  return MASTER_SCHEMAS[key] || { label: key, columns: [{ key: "code", label: "Code" }, { key: "value", label: "Value" }, { key: "status", label: "Status", type: "status" }] };
}

function getSourceOptions(sourceKey, fieldKey = "code") {
  return (state.masters[sourceKey] || []).map((row) => row[fieldKey]).filter(Boolean);
}

function renderMasterCategories() {
  el.masterCategoryGrid.innerHTML = Object.entries(MASTER_SCHEMAS).map(([key, schema]) => `
    <button class="module-master-card ${state.activeMaster === key ? "active" : ""}" type="button" data-master-key="${key}">
      <strong>${schema.label}</strong>
      <span>${(state.masters[key] || []).length} rows</span>
      <small>${state.masterAudit[key]?.checker_status || "Approved"}</small>
    </button>
  `).join("");
  document.querySelectorAll("[data-master-key]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMaster = button.dataset.masterKey;
      renderMasterCategories();
      renderMasterRows();
    });
  });
}

function inputForColumn(column, value = "") {
  if (column.type === "status") {
    return `<select data-col="${column.key}"><option value="Active" ${value === "Active" ? "selected" : ""}>Active</option><option value="Inactive" ${value === "Inactive" ? "selected" : ""}>Inactive</option></select>`;
  }
  if (column.type === "select") {
    return `<select data-col="${column.key}">${column.options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select>`;
  }
  if (column.type === "select-source") {
    const options = getSourceOptions(column.source, column.sourceKey);
    return `<select data-col="${column.key}" data-source="${column.source}" data-source-name="${column.autofillName || ""}"><option value="">Select</option>${options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select>`;
  }
  return `<input type="${column.type || "text"}" data-col="${column.key}" value="${value || ""}" ${column.step ? `step="${column.step}"` : ""} ${column.readonly ? "readonly" : ""}>`;
}

function blankRow(schema) {
  return Object.fromEntries(schema.columns.map((column) => [column.key, column.key === "status" || column.key === "user_status" ? "Active" : ""]));
}

function renderMasterRows() {
  const schema = getSchema();
  el.masterWorkspaceTitle.textContent = schema.label;
  el.masterHeadings.innerHTML = `<tr>${schema.columns.map((column) => `<th>${column.label}</th>`).join("")}</tr>`;
  const rows = state.masters[state.activeMaster] || [];
  const renderRow = (row) => `<tr>${schema.columns.map((column) => `<td>${inputForColumn(column, row[column.key] || "")}</td>`).join("")}</tr>`;
  el.masterRows.innerHTML = rows.length ? rows.map(renderRow).join("") : renderRow(blankRow(schema));
  renderMasterAudit();
  bindMasterAutofill();
}

function renderMasterAudit() {
  const audit = state.masterAudit[state.activeMaster] || {};
  const maker = audit.maker_user || "Not captured";
  const checker = audit.checker_user || "Pending";
  const status = audit.checker_status || "Approved";
  el.masterAuditBanner.innerHTML = `
    <div class="document-item master-audit-card">
      <div><strong>Maker</strong><p class="muted">${maker}${audit.maker_at ? ` • ${audit.maker_at}` : ""}</p></div>
      <span class="status-pill">${maker}</span>
    </div>
    <div class="document-item master-audit-card">
      <div><strong>Checker</strong><p class="muted">${checker}${audit.checker_at ? ` • ${audit.checker_at}` : ""}</p></div>
      <span class="status-pill ${status === "Approved" ? "live" : ""}">${status}</span>
    </div>
    <div class="document-item master-audit-card">
      <div><strong>Last Action</strong><p class="muted">Maker-checker control for ${getSchema().label}</p></div>
      <span class="status-pill">${audit.last_action || "System Loaded"}</span>
    </div>
  `;
}

function bindMasterAutofill() {
  if (state.activeMaster !== "user_module_access_master") return;
  el.masterRows.querySelectorAll('select[data-col="user_id"]').forEach((select) => {
    select.addEventListener("change", () => {
      const user = (state.masters.user_master || []).find((row) => row.user_id === select.value);
      const nameInput = select.closest("tr")?.querySelector('[data-col="user_name"]');
      if (nameInput && user) nameInput.value = user.user_name || "";
    });
  });
}

function collectMasterRows() {
  const schema = getSchema();
  return [...el.masterRows.querySelectorAll("tr")].map((row) => {
    const output = {};
    schema.columns.forEach((column) => {
      const input = row.querySelector(`[data-col="${column.key}"]`);
      output[column.key] = input?.value?.trim?.() ?? "";
    });
    return output;
  }).filter((row) => Object.values(row).some(Boolean));
}

function renderSsoAdmin() {
  const adminUsers = (state.masters.user_master || []).map((row) => row.user_id).join(", ") || "--";
  el.ssoSummary.innerHTML = [
    ["Logged In User", state.sessionUser.user_id || "--", "Current authenticated enterprise user"],
    ["Role", state.sessionUser.user_role || "Enterprise Admin", "Access to LOS, LMS, Loan Masters and SSO Admin"],
    ["Admin Users", adminUsers, "Primary and checker admin users available in the platform"],
    ["Authentication", "Captcha + OTP", "Default OTP validation flow is enabled"],
    ["Business Date", state.businessDate, "Shared business date across LOS and LMS"]
  ].map(([label, value, note]) => `<div class="document-item"><div><strong>${label}</strong><p class="muted">${note}</p></div><span class="status-pill">${value}</span></div>`).join("");

  el.ssoAccessGrid.innerHTML = [
    ["Loan Sanction Workflow", "Allowed"],
    ["Loan Management System", "Allowed"],
    ["Loan Masters", "Allowed"],
    ["SSO Admin", "Allowed"]
  ].map(([label, value]) => `<div class="module-master-card active"><strong>${label}</strong><span>${value}</span></div>`).join("");
}

async function loadPlatformData() {
  const [dashboard, masters] = await Promise.all([api("/api/dashboard"), api("/api/masters")]);
  state.businessDate = dashboard.business_date_label || "--";
  state.masters = masters.masters || {};
  state.masterAudit = masters.audit || {};
  state.sessionUser = masters.session_user || {};
  el.moduleBusinessDate.textContent = state.businessDate;
  if (el.moduleCurrentUser) {
    el.moduleCurrentUser.textContent = state.sessionUser.user_id || "--";
  }
  renderMasterCategories();
  renderMasterRows();
  renderSsoAdmin();
}

el.launchCards.forEach((card) => {
  card.addEventListener("click", () => {
    const target = card.dataset.launchTarget;
    if (target === "masters" || target === "sso") {
      setModuleView(target);
      return;
    }
    window.location.href = target;
  });
});

el.moduleTabs.forEach((button) => {
  button.addEventListener("click", () => setModuleView(button.dataset.moduleTab));
});

el.masterAddRow?.addEventListener("click", () => {
  const schema = getSchema();
  const rowHtml = `<tr>${schema.columns.map((column) => `<td>${inputForColumn(column, blankRow(schema)[column.key])}</td>`).join("")}</tr>`;
  el.masterRows.insertAdjacentHTML("beforeend", rowHtml);
  bindMasterAutofill();
});

async function submitMaster(actionMode) {
  state.masters[state.activeMaster] = collectMasterRows();
  const response = await api("/api/masters", {
    method: "POST",
    body: JSON.stringify({ approval_mode: actionMode, [state.activeMaster]: state.masters[state.activeMaster] })
  });
  if (response.error) {
    window.alert(response.error);
  }
  state.masters = response.masters || state.masters;
  state.masterAudit = response.audit || state.masterAudit;
  renderMasterCategories();
  renderMasterRows();
  window.alert(response.message || `${getSchema().label} updated successfully.`);
}

el.masterSave?.addEventListener("click", async () => submitMaster("maker"));
el.masterChecker?.addEventListener("click", async () => submitMaster("checker"));

setModuleView("launcher");
loadPlatformData();
