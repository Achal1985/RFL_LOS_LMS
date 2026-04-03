import json
import re
import secrets
import sqlite3
from datetime import date, datetime, timedelta
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "nbfc_los.db"
HOST = "127.0.0.1"
PORT = 8000

WORKFLOW_STAGES = [
    "Lead Generation",
    "Customer Details",
    "KYC Verification",
    "Aadhaar Verification",
    "Dedupe Check",
    "CIBIL Check",
    "Charges Summary",
    "Field Verification",
    "Underwriter Eligibility",
    "Repayment Generation",
    "Document Collection",
    "E-Sign",
    "Disbursement",
]

SEED_CASES = []

STAGE_FORM_CONFIG = {
    2: {
        "name": "kyc",
        "required": ["pan_number", "ckyc_id", "address_proof", "income_proof", "otp"],
        "next_stage": 3,
        "status": "KYC completed - ready for Aadhaar verification",
    },
    3: {
        "name": "aadhaar",
        "required": ["aadhaar_last4", "consent_status", "name_match"],
        "next_stage": 4,
        "status": "Aadhaar completed - ready for dedupe",
    },
    4: {
        "name": "dedupe",
        "required": ["mobile_match", "pan_match", "dedupe_result"],
        "next_stage": 5,
        "status": "Dedupe completed - ready for CIBIL",
    },
    5: {
        "name": "cibil",
        "required": ["cibil_score", "foir", "ltv", "bureau_summary"],
        "next_stage": 6,
        "status": "CIBIL completed - ready for charges summary",
    },
    6: {
        "name": "charges_summary",
        "required": [
            "charge_type_1",
            "charge_amount_1",
            "charge_type_2",
            "charge_amount_2",
            "charge_type_3",
            "charge_amount_3",
        ],
        "next_stage": 7,
        "status": "Charges summary completed - ready for field verification",
    },
    7: {
        "name": "field_verification",
        "required": ["agency_name", "visit_status", "verifier_name", "fv_remark"],
        "next_stage": 8,
        "status": "Field verification completed - ready for underwriting",
    },
    8: {
        "name": "underwriting",
        "required": ["uw_decision_note", "policy_fit", "risk_band", "deviation_flag", "deviation_note", "deviation_approval"],
        "next_stage": 9,
        "status": "Underwriting approved - repayment generation started",
    },
    9: {
        "name": "repayment",
        "required": ["opening_principal", "emi_amount", "rate_of_interest"],
        "next_stage": 10,
        "status": "Repayment generated - ready for document collection",
    },
    10: {
        "name": "document_collection",
        "required": ["sanction_letter", "agreement_pack", "document_status"],
        "next_stage": 11,
        "status": "Documents completed - ready for e-sign",
    },
    11: {
        "name": "esign",
        "required": ["esign_provider", "esign_status", "mandate_reference", "signature_data"],
        "next_stage": 12,
        "status": "E-sign completed - ready for disbursement",
    },
    12: {
        "name": "disbursement",
        "required": ["disbursal_mode", "disbursal_account", "payee_name", "disbursal_date", "interest_start_date"],
        "next_stage": 12,
        "status": "Disbursed",
    },
}

FIELD_AGENCIES = [
    "Apex Field Services",
    "Urban Verify Associates",
    "TrustCheck Agencies",
    "SecureVisit Partners",
]

MASTER_DROPDOWNS = {
    "address_proof": ["Aadhaar", "Passport", "Driving License", "Voter ID"],
    "income_proof": ["Bank Statement", "ITR", "GST Return", "Salary Slip"],
    "consent_status": ["Consent Received", "Consent Shared", "Consent Pending"],
    "name_match": ["Matched", "Minor Variation", "Mismatch"],
    "policy_fit": ["Yes", "No"],
    "risk_band": ["Low", "Medium", "High"],
    "deviation_flag": ["No", "Yes"],
    "deviation_approval": ["Not Required", "Pending Approval", "Approved", "Rejected"],
    "collateral_type": ["Residential Property", "Commercial Property", "Industrial Property", "Plot", "Other"],
    "disbursal_mode": ["NEFT", "IMPS", "RTGS"],
    "charge_type": ["Processing Fee", "Documentation Charge", "Initial Money Deposit", "Stamp Duty", "Insurance Premium"],
    "lms_edit_reason": ["Customer Request", "Ops Correction", "Bank Return Correction", "Compliance Update"],
    "foreclosure_status": ["Foreclosure Requested", "Quote Shared", "Foreclosure Received", "Closed"],
    "reschedule_reason": ["EMI Relief", "Tenor Extension", "Moratorium", "Business Cashflow Revision"],
    "npa_stage": ["Regular", "SMA0", "SMA1", "SMA2", "Sub Standard", "Sub Standard 1", "Doubtful", "Doubtful 1", "Write Off"],
    "presentation_mode": ["NACH", "PDC", "UPI Autopay", "ACH", "Cash Pick-up"],
    "bank_status": ["Presented", "Cleared", "Returned", "Represented", "Settled"],
    "return_reason": ["Insufficient Funds", "Account Closed", "Mandate Failed", "Dormant Account", "Signature Differs"],
    "collection_channel": ["Cash", "NEFT", "UPI", "Branch Deposit", "Collection Agency"],
    "due_charge_head": ["Bounce Charge", "Late Payment Charge", "Penal Interest", "Field Visit Charge", "Legal Notice Charge"],
    "waiver_reason": ["Management Approval", "Service Recovery", "Settlement", "Hardship Support"],
    "accounting_template": [
        "Receipt Realization",
        "Manual Charge Booking",
        "Charge Waiver",
        "Excess Knock Off",
        "Bank Presentation",
        "Bank Return",
        "Foreclosure Receipt",
    ],
    "report_type": ["SOA", "Collection Register", "Charge Ledger", "Voucher Register", "Foreclosure Quote", "NPA Movement"],
    "batch_status": ["Ready", "Completed", "Failed", "Re-run Required"],
}

LOGIN_USERS = {
    "RFL1101": {
        "password": "123456",
        "user_name": "Primary Admin User",
        "user_role": "Enterprise Admin",
    },
    "RFL1102": {
        "password": "123456",
        "user_name": "Checker Admin User",
        "user_role": "Enterprise Admin",
    },
}
DEFAULT_USER_ID = "RFL1101"
DEFAULT_PASSWORD = "123456"
DEFAULT_LOGIN_OTP = "123456"
SESSIONS = {}
LOGIN_CHALLENGES = {}

MASTER_SCHEMAS = {
    "product_master": [
        "product_code",
        "product_name",
        "min_loan_amount",
        "max_loan_amount",
        "min_tenure",
        "max_tenure",
        "interest_calculation_method",
        "round_off_parameter",
        "min_interest_rate",
        "max_interest_rate",
        "frequency",
        "installment_type",
        "prepayment_penalty_percentage",
        "foreclosure_lockin_period",
        "plr_type",
        "status",
    ],
    "due_date_master": ["code", "value", "product_code", "status"],
    "branch_master": [
        "code",
        "value",
        "branch_address",
        "branch_city",
        "branch_state",
        "branch_zipcode",
        "branch_country",
        "branch_oracle_code",
        "branch_gst_number",
        "status",
    ],
    "user_master": [
        "user_id",
        "user_name",
        "user_email_id",
        "ldap_user",
        "user_mobile_number",
        "user_designation",
        "user_department",
        "user_supervisor",
        "user_creation_date",
        "user_deactivation_date",
        "user_modification_date",
        "user_role_assigned",
        "user_status",
    ],
    "user_module_access_master": ["user_id", "user_name", "user_module_access", "status"],
    "user_role_master": ["code", "value", "status"],
    "dsa_master": ["code", "value", "status"],
    "city_master": ["city_code", "city_name", "state_code", "state_name", "status"],
    "state_master": ["state_code", "state_name", "country_id", "country_name", "status"],
    "zipcode_master": ["zipcode", "zipcode_name", "city_id", "city_name", "state_id", "state_name", "status"],
    "country_master": ["code", "value", "status"],
    "micr_code_master": ["code", "value", "status"],
    "ifsc_code_master": ["code", "value", "status"],
    "bank_master": ["code", "value", "status"],
    "group_gl_master": ["code", "value", "status"],
    "npa_master": ["code", "value", "status"],
    "npa_provisioning_master": ["code", "value", "status"],
    "fund_allocation_logic_master": ["code", "value", "status"],
    "underwriter_rule_engine_master": ["code", "value", "status"],
    "generic_master": ["code", "value", "status"],
}

MASTER_FIELD_ALIASES = {
    "product_master": {"code": "product_code", "value": "product_name"},
    "branch_master": {"branch_code": "code", "branch_name": "value"},
}

MASTER_ROW_IDENTITY = {
    "product_master": ("product_code",),
    "due_date_master": ("code",),
    "branch_master": ("code",),
    "user_master": ("user_id",),
    "user_module_access_master": ("user_id", "user_module_access"),
    "user_role_master": ("code",),
    "dsa_master": ("code",),
    "city_master": ("city_code",),
    "state_master": ("state_code",),
    "zipcode_master": ("zipcode",),
    "country_master": ("code",),
    "micr_code_master": ("code",),
    "ifsc_code_master": ("code",),
    "bank_master": ("code",),
    "group_gl_master": ("code",),
    "npa_master": ("code",),
    "npa_provisioning_master": ("code",),
    "fund_allocation_logic_master": ("code",),
    "underwriter_rule_engine_master": ("code",),
    "generic_master": ("code",),
}


def generate_ucic_number(case_id):
    return f"UCIC-{int(case_id):08d}"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_code TEXT NOT NULL UNIQUE,
                applicant TEXT NOT NULL,
                product TEXT NOT NULL,
                amount INTEGER NOT NULL,
                tenor INTEGER NOT NULL,
                roi REAL NOT NULL,
                city TEXT NOT NULL,
                rm TEXT NOT NULL,
                source TEXT NOT NULL,
                stage INTEGER NOT NULL,
                cibil INTEGER NOT NULL,
                bureau TEXT NOT NULL,
                dedupe TEXT NOT NULL,
                fv TEXT NOT NULL,
                aadhaar TEXT NOT NULL,
                kyc TEXT NOT NULL,
                foir INTEGER NOT NULL,
                ltv INTEGER NOT NULL,
                eligibility INTEGER NOT NULL,
                status TEXT NOT NULL,
                docs_json TEXT NOT NULL,
                profile_json TEXT NOT NULL DEFAULT '{}',
                stage_data_json TEXT NOT NULL DEFAULT '{}'
            )
            """
        )
        columns = [row["name"] for row in conn.execute("PRAGMA table_info(cases)").fetchall()]
        if "profile_json" not in columns:
            conn.execute("ALTER TABLE cases ADD COLUMN profile_json TEXT NOT NULL DEFAULT '{}'")
        if "stage_data_json" not in columns:
            conn.execute("ALTER TABLE cases ADD COLUMN stage_data_json TEXT NOT NULL DEFAULT '{}'")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS system_config (
                config_key TEXT PRIMARY KEY,
                config_value TEXT NOT NULL
            )
            """
        )
        exists = conn.execute("SELECT config_value FROM system_config WHERE config_key = 'business_date'").fetchone()
        if not exists:
            conn.execute(
                "INSERT INTO system_config (config_key, config_value) VALUES (?, ?)",
                ("business_date", date.today().isoformat()),
            )
        masters_exists = conn.execute("SELECT config_value FROM system_config WHERE config_key = 'loan_masters'").fetchone()
        if not masters_exists:
            conn.execute(
                "INSERT INTO system_config (config_key, config_value) VALUES (?, ?)",
                ("loan_masters", json.dumps(default_loan_masters())),
            )
        audit_exists = conn.execute("SELECT config_value FROM system_config WHERE config_key = 'loan_master_audit'").fetchone()
        if not audit_exists:
            conn.execute(
                "INSERT INTO system_config (config_key, config_value) VALUES (?, ?)",
                ("loan_master_audit", json.dumps(default_master_audit())),
            )


def create_repayment_schedule(amount, roi, tenor):
    monthly_rate = roi / 12 / 100
    emi = (amount * monthly_rate * (1 + monthly_rate) ** tenor) / (((1 + monthly_rate) ** tenor) - 1)
    rows = []
    balance = amount
    for index in range(1, tenor + 1):
        opening_balance = balance
        interest = balance * monthly_rate
        principal = emi - interest
        balance = max(0, balance - principal)
        month = ((3 + index - 1) % 12) + 1
        year = 2026 + ((3 + index - 1) // 12)
        rows.append({
            "emi_number": index,
            "due_date": date(year, month, 5).strftime("%d %b %Y"),
            "opening_balance": round(opening_balance),
            "emi_amount": round(emi),
            "roi": roi,
            "principal": round(principal),
            "interest": round(interest),
            "closing_balance": round(balance),
        })
    return {"emi_amount": round(emi), "rows": rows}


def create_custom_schedule(amount, roi, tenor, start_date, emi_override=None):
    monthly_rate = roi / 12 / 100
    if tenor <= 0:
        return {"emi_amount": 0, "rows": []}
    if emi_override:
        emi = float(emi_override)
    else:
        emi = (amount * monthly_rate * (1 + monthly_rate) ** tenor) / (((1 + monthly_rate) ** tenor) - 1)
    rows = []
    balance = float(amount)
    current_due = start_date
    for index in range(1, tenor + 1):
        opening_balance = balance
        interest = balance * monthly_rate
        principal = min(balance, emi - interest)
        if principal < 0:
            principal = 0
        balance = max(0, balance - principal)
        rows.append({
            "emi_number": index,
            "due_date": display_date(current_due),
            "opening_balance": round(opening_balance),
            "emi_amount": round(emi),
            "roi": roi,
            "principal": round(principal),
            "interest": round(interest),
            "closing_balance": round(balance),
        })
        month = current_due.month + 1
        year = current_due.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        current_due = current_due.replace(year=year, month=month)
    return {"emi_amount": round(emi), "rows": rows}


def build_timeline(stage_index, status):
    timeline = []
    for index, stage in enumerate(WORKFLOW_STAGES):
        state = "pending"
        note = "Pending"
        if index < stage_index:
            state, note = "done", "Completed"
        elif index == stage_index:
            state, note = "current", status
        timeline.append({"label": stage, "state": state, "note": note})
    return timeline


def build_risk_cards(item):
    return [
        {"label": "CIBIL Score", "value": item["cibil"], "note": item["bureau"]},
        {"label": "FOIR", "value": f'{item["foir"]}%', "note": "Policy threshold below 55%"},
        {"label": "LTV", "value": f'{item["ltv"]}%' if item["ltv"] else "NA", "note": "Applies for secured assets"},
        {"label": "Dedupe", "value": "Clear", "note": item["dedupe"]},
        {"label": "KYC", "value": "Verified", "note": item["kyc"]},
        {"label": "Aadhaar", "value": "Matched", "note": item.get("masked_aadhaar", item["aadhaar"])},
        {"label": "Field Verification", "value": "Closed" if item["stage"] >= 7 else "Open", "note": item["fv"]},
        {"label": "Compliance", "value": item["compliance_status"], "note": item["compliance_note"]},
        {"label": "Eligibility", "value": item["eligibility"], "note": item["status"]},
    ]


def build_decision_items(item):
    return [
        {"label": "Credit Policy", "value": "Pass" if item["cibil"] >= 700 else "Review", "note": "Bureau and income rules"},
        {"label": "Fraud Control", "value": "Pass", "note": "Aadhaar, dedupe and source validation"},
        {"label": "Compliance", "value": item["compliance_status"], "note": item["compliance_note"]},
        {"label": "Repayment Readiness", "value": "Generated" if item["stage"] >= 9 else "Pending", "note": "EMI and mandate controls"},
        {"label": "Documentation", "value": "Strong" if sum(1 for doc in item["docs"] if doc[1] != "Pending") >= 3 else "Pending", "note": "Agreement pack and sanction readiness"},
    ]


def serialize_case(row):
    item = dict(row)
    item["docs"] = json.loads(item.pop("docs_json"))
    item["profile"] = json.loads(item.pop("profile_json", "{}") or "{}")
    item["stage_data"] = json.loads(item.pop("stage_data_json", "{}") or "{}")
    item["profile"].setdefault("ucic_number", generate_ucic_number(item["id"]))
    item["profile"].setdefault("aadhaar_number", "")
    item["profile_complete"] = bool(
        item["profile"].get("mobile")
        and item["profile"].get("address")
        and item["profile"].get("occupation")
        and item["profile"].get("bank_name")
        and item["profile"].get("ucic_number")
        and item["profile"].get("gst_number")
        and item["profile"].get("co_applicant_name")
        and item["profile"].get("guarantor_name")
        and item["profile"].get("collateral_type")
        and item["profile"].get("collateral_value")
        and item["profile"].get("notepad_entry")
    )
    item["stage_form_complete"] = stage_form_complete(item)
    item["workflow_stage"] = WORKFLOW_STAGES[item["stage"]]
    item["repayment"] = create_repayment_schedule(item["amount"], item["roi"], item["tenor"])
    item["charge_rows"] = extract_charge_rows(item)
    item["charge_total"] = round(sum(charge["amount"] for charge in item["charge_rows"]))
    item["net_disbursal_amount"] = max(0, item["amount"] - item["charge_total"])
    item["lms_summary"] = build_lms_summary(item)
    item["customer_id"] = f'CUST-{int(item["id"]):05d}'
    item["masked_aadhaar"] = mask_aadhaar(item["profile"].get("aadhaar_number", ""))
    item["compliance_checks"] = [{"label": label, "ok": ok} for label, ok in compliance_flags(item)]
    item["compliance_status"] = compliance_status(item)
    item["compliance_note"] = ", ".join(f"{label}: {'OK' if ok else 'Pending'}" for label, ok in compliance_flags(item))
    item["system_business_date"] = get_global_business_date().isoformat()
    item["system_business_date_label"] = display_date(item["system_business_date"])
    item["timeline"] = build_timeline(item["stage"], item["status"])
    item["risk_cards"] = build_risk_cards(item)
    item["decision_items"] = build_decision_items(item)
    item["field_agencies"] = FIELD_AGENCIES
    item["master_dropdowns"] = MASTER_DROPDOWNS
    item["policy_checks"] = build_policy_checks(item)
    return item


def stage_form_complete(item):
    config = STAGE_FORM_CONFIG.get(item["stage"])
    if not config:
        return True
    stored = item.get("stage_data", {}).get(config["name"], {})
    return all(str(stored.get(field, "")).strip() for field in config["required"])


def build_policy_checks(item):
    underwriting = item.get("stage_data", {}).get("underwriting", {})
    return [
        {"label": "CIBIL >= 700", "ok": item["cibil"] >= 700, "value": item["cibil"]},
        {"label": "FOIR <= 55%", "ok": item["foir"] <= 55 if item["foir"] else False, "value": f'{item["foir"]}%'},
        {"label": "LTV <= 75%", "ok": item["ltv"] <= 75 if item["ltv"] else True, "value": f'{item["ltv"]}%'},
        {"label": "Dedupe Clear", "ok": "clear" in item["dedupe"].lower() or "no duplicate" in item["dedupe"].lower(), "value": item["dedupe"]},
        {"label": "Compliance Complete", "ok": item["compliance_status"] == "Compliant", "value": item["compliance_status"]},
        {"label": "Deviation Approval", "ok": underwriting.get("deviation_flag", "No") != "Yes" or underwriting.get("deviation_approval") == "Approved", "value": underwriting.get("deviation_approval", "Not Required")},
    ]


def parse_amount(value):
    text = str(value or "").strip().replace(",", "")
    try:
        return float(text) if text else 0.0
    except ValueError:
        return 0.0


def digits_only(value):
    return re.sub(r"\D", "", str(value or ""))


def mask_aadhaar(value):
    digits = digits_only(value)
    if len(digits) != 12:
        return "Pending"
    return f"XXXX XXXX {digits[-4:]}"


def validate_mobile(value):
    return bool(re.fullmatch(r"[6-9]\d{9}", digits_only(value)))


def validate_aadhaar(value):
    return bool(re.fullmatch(r"\d{12}", digits_only(value)))


def validate_pan(value):
    return bool(re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", str(value or "").strip().upper()))


def validate_gst(value):
    if not str(value or "").strip():
        return False
    return bool(re.fullmatch(r"\d{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]", str(value or "").strip().upper()))


def validate_amount_gt_zero(value):
    return parse_amount(value) > 0


def compliance_flags(item):
    profile = item.get("profile", {})
    flags = [
        ("UCIC", bool(profile.get("ucic_number"))),
        ("Aadhaar", validate_aadhaar(profile.get("aadhaar_number"))),
        ("PAN", validate_pan(item.get("stage_data", {}).get("kyc", {}).get("pan_number", ""))),
        ("GST", validate_gst(profile.get("gst_number"))),
    ]
    return flags


def compliance_status(item):
    flags = compliance_flags(item)
    passed = sum(1 for _, ok in flags if ok)
    if passed == len(flags):
        return "Compliant"
    if passed == 0:
        return "Pending"
    return "Review"


def default_loan_masters():
    return {
        "product_master": [
            {
                "product_code": "BL",
                "product_name": "Business Loan",
                "min_loan_amount": "50000",
                "max_loan_amount": "5000000",
                "min_tenure": "6",
                "max_tenure": "60",
                "interest_calculation_method": "Actual/365",
                "round_off_parameter": "Round Off",
                "min_interest_rate": "12.50",
                "max_interest_rate": "26.00",
                "frequency": "Monthly",
                "installment_type": "Equated",
                "prepayment_penalty_percentage": "4.00",
                "foreclosure_lockin_period": "6",
                "plr_type": "RFRR",
                "status": "Active",
            },
            {
                "product_code": "LAP",
                "product_name": "Loan Against Property",
                "min_loan_amount": "500000",
                "max_loan_amount": "25000000",
                "min_tenure": "12",
                "max_tenure": "180",
                "interest_calculation_method": "30/360",
                "round_off_parameter": "Round Down",
                "min_interest_rate": "9.75",
                "max_interest_rate": "16.50",
                "frequency": "Monthly",
                "installment_type": "Equated",
                "prepayment_penalty_percentage": "2.00",
                "foreclosure_lockin_period": "12",
                "plr_type": "RFRR2",
                "status": "Active",
            },
        ],
        "due_date_master": [
            {"code": "D05", "value": "5th of Month", "product_code": "BL", "status": "Active"},
            {"code": "D10", "value": "10th of Month", "product_code": "LAP", "status": "Active"},
        ],
        "branch_master": [
            {
                "code": "DEL01",
                "value": "New Delhi Branch",
                "branch_address": "Connaught Place, New Delhi",
                "branch_city": "New Delhi",
                "branch_state": "Delhi",
                "branch_zipcode": "110001",
                "branch_country": "India",
                "branch_oracle_code": "ORC1001",
                "branch_gst_number": "07AABCR1234A1ZV",
                "status": "Active",
            },
            {
                "code": "MUM01",
                "value": "Mumbai Branch",
                "branch_address": "BKC, Mumbai",
                "branch_city": "Mumbai",
                "branch_state": "Maharashtra",
                "branch_zipcode": "400051",
                "branch_country": "India",
                "branch_oracle_code": "ORC1002",
                "branch_gst_number": "27AABCR1234A1ZR",
                "status": "Active",
            },
        ],
        "user_master": [
            {
                "user_id": "RFL1101",
                "user_name": "Primary Admin User",
                "user_email_id": "rfl1101@religare.com",
                "ldap_user": "LDAP",
                "user_mobile_number": "9876543210",
                "user_designation": "Manager",
                "user_department": "Operations",
                "user_supervisor": "Regional Head",
                "user_creation_date": "2026-01-01",
                "user_deactivation_date": "",
                "user_modification_date": "2026-04-03",
                "user_role_assigned": "Enterprise Admin",
                "user_status": "Active",
            },
            {
                "user_id": "RFL1102",
                "user_name": "Checker Admin User",
                "user_email_id": "rfl1102@religare.com",
                "ldap_user": "LDAP",
                "user_mobile_number": "9876543211",
                "user_designation": "Manager",
                "user_department": "Operations",
                "user_supervisor": "Regional Head",
                "user_creation_date": "2026-01-01",
                "user_deactivation_date": "",
                "user_modification_date": "2026-04-03",
                "user_role_assigned": "Enterprise Admin",
                "user_status": "Active",
            }
        ],
        "user_module_access_master": [
            {"user_id": "RFL1101", "user_name": "Primary Admin User", "user_module_access": "LOS", "status": "Active"},
            {"user_id": "RFL1101", "user_name": "Primary Admin User", "user_module_access": "LMS", "status": "Active"},
            {"user_id": "RFL1101", "user_name": "Primary Admin User", "user_module_access": "Masters", "status": "Active"},
            {"user_id": "RFL1101", "user_name": "Primary Admin User", "user_module_access": "SSO Admin", "status": "Active"},
            {"user_id": "RFL1102", "user_name": "Checker Admin User", "user_module_access": "LOS", "status": "Active"},
            {"user_id": "RFL1102", "user_name": "Checker Admin User", "user_module_access": "LMS", "status": "Active"},
            {"user_id": "RFL1102", "user_name": "Checker Admin User", "user_module_access": "Masters", "status": "Active"},
            {"user_id": "RFL1102", "user_name": "Checker Admin User", "user_module_access": "SSO Admin", "status": "Active"},
        ],
        "user_role_master": [{"code": "UW", "value": "Underwriter", "status": "Active"}, {"code": "OPS", "value": "Operations", "status": "Active"}],
        "dsa_master": [{"code": "DSA01", "value": "Prime DSA Partner", "status": "Active"}],
        "city_master": [
            {"city_code": "DELHI", "city_name": "New Delhi", "state_code": "DL", "state_name": "Delhi", "status": "Active"},
            {"city_code": "MUMBAI", "city_name": "Mumbai", "state_code": "MH", "state_name": "Maharashtra", "status": "Active"},
        ],
        "state_master": [
            {"state_code": "DL", "state_name": "Delhi", "country_id": "IN", "country_name": "India", "status": "Active"},
            {"state_code": "MH", "state_name": "Maharashtra", "country_id": "IN", "country_name": "India", "status": "Active"},
        ],
        "zipcode_master": [
            {"zipcode": "110001", "zipcode_name": "Connaught Place", "city_id": "DELHI", "city_name": "New Delhi", "state_id": "DL", "state_name": "Delhi", "status": "Active"},
            {"zipcode": "400051", "zipcode_name": "Bandra Kurla Complex", "city_id": "MUMBAI", "city_name": "Mumbai", "state_id": "MH", "state_name": "Maharashtra", "status": "Active"},
        ],
        "country_master": [{"code": "IN", "value": "India", "status": "Active"}],
        "micr_code_master": [{"code": "110002001", "value": "New Delhi MICR", "status": "Active"}],
        "ifsc_code_master": [{"code": "HDFC0000001", "value": "HDFC Bank Connaught Place", "status": "Active"}],
        "bank_master": [{"code": "HDFC", "value": "HDFC Bank", "status": "Active"}, {"code": "ICICI", "value": "ICICI Bank", "status": "Active"}],
        "group_gl_master": [{"code": "GL1001", "value": "Loan Principal GL", "status": "Active"}],
        "npa_master": [{"code": "SMA0", "value": "1-30 DPD", "status": "Active"}, {"code": "SUBSTD", "value": "91-180 DPD", "status": "Active"}],
        "npa_provisioning_master": [{"code": "P15", "value": "15% Provision", "status": "Active"}, {"code": "P25", "value": "25% Provision", "status": "Active"}],
        "fund_allocation_logic_master": [{"code": "STD", "value": "Charges > Interest > Principal", "status": "Active"}],
        "underwriter_rule_engine_master": [{"code": "UW001", "value": "CIBIL>=700 & FOIR<=55 & Compliance Complete", "status": "Active"}],
        "generic_master": [{"code": "RELATION_SPOUSE", "value": "Spouse", "status": "Active"}, {"code": "RELATION_BROTHER", "value": "Brother", "status": "Active"}],
    }


def default_master_audit():
    return {
        key: {
            "checker_status": "Approved",
            "maker_user": "",
            "maker_at": "",
            "checker_user": "",
            "checker_at": "",
            "last_action": "System Loaded",
        }
        for key in MASTER_SCHEMAS
    }


def normalize_master_row(master_key, row, template=None):
    schema = MASTER_SCHEMAS.get(master_key, ["code", "value", "status"])
    aliases = MASTER_FIELD_ALIASES.get(master_key, {})
    normalized = {field: "" for field in schema}
    if template:
        normalized.update({field: str(template.get(field, "")).strip() for field in schema})
    if not isinstance(row, dict):
        return normalized
    for source_key, value in row.items():
        target_key = aliases.get(source_key, source_key if source_key in schema else "")
        if target_key:
            normalized[target_key] = str(value).strip()
    if "status" in normalized and not normalized["status"]:
        normalized["status"] = "Active"
    if "user_status" in normalized and not normalized["user_status"]:
        normalized["user_status"] = "Active"
    return normalized


def master_row_identity(master_key, row):
    keys = MASTER_ROW_IDENTITY.get(master_key, ("code",))
    return "|".join(str(row.get(key, "")).strip() for key in keys)


def merge_master_defaults(master_key, rows, default_rows):
    merged = [row for row in rows if any(str(value).strip() for value in row.values())]
    seen = {master_row_identity(master_key, row) for row in merged}
    for default_row in default_rows:
        identity = master_row_identity(master_key, default_row)
        if identity and identity not in seen:
            merged.append(normalize_master_row(master_key, default_row, default_row))
            seen.add(identity)
    return merged


def backfill_user_names(masters):
    user_lookup = {
        str(row.get("user_id", "")).strip(): str(row.get("user_name", "")).strip()
        for row in masters.get("user_master", [])
        if isinstance(row, dict)
    }
    access_rows = []
    for row in masters.get("user_module_access_master", []):
        updated = dict(row)
        if updated.get("user_id") and not updated.get("user_name"):
            updated["user_name"] = user_lookup.get(updated["user_id"], "")
        access_rows.append(updated)
    masters["user_module_access_master"] = access_rows
    return masters


def normalize_loan_masters(stored):
    defaults = default_loan_masters()
    source = stored if isinstance(stored, dict) else {}
    normalized = {}
    for master_key, schema in MASTER_SCHEMAS.items():
        default_rows = defaults.get(master_key, [])
        incoming_rows = source.get(master_key, default_rows)
        if not isinstance(incoming_rows, list):
            incoming_rows = default_rows
        clean_rows = []
        for index, row in enumerate(incoming_rows):
            template = default_rows[index] if index < len(default_rows) else {}
            normalized_row = normalize_master_row(master_key, row, template)
            if any(str(value).strip() for value in normalized_row.values()):
                clean_rows.append(normalized_row)
        normalized[master_key] = merge_master_defaults(master_key, clean_rows, default_rows)
    return backfill_user_names(normalized)


def get_loan_master_audit():
    defaults = default_master_audit()
    with get_connection() as conn:
        row = conn.execute("SELECT config_value FROM system_config WHERE config_key = 'loan_master_audit'").fetchone()
    if not row:
        return defaults
    try:
        stored = json.loads(row["config_value"])
        if not isinstance(stored, dict):
            return defaults
        for key, value in defaults.items():
            stored.setdefault(key, value)
        return stored
    except json.JSONDecodeError:
        return defaults


def save_loan_master_audit(audit):
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO system_config (config_key, config_value) VALUES ('loan_master_audit', ?)
            ON CONFLICT(config_key) DO UPDATE SET config_value = excluded.config_value
            """,
            (json.dumps(audit),),
        )


def get_loan_masters():
    with get_connection() as conn:
        row = conn.execute("SELECT config_value FROM system_config WHERE config_key = 'loan_masters'").fetchone()
    if not row:
        return normalize_loan_masters(default_loan_masters())
    try:
        stored = json.loads(row["config_value"])
        return normalize_loan_masters(stored)
    except json.JSONDecodeError:
        return normalize_loan_masters(default_loan_masters())


def save_loan_masters(payload, current_user, action="maker"):
    current = get_loan_masters()
    audit = get_loan_master_audit()
    if not isinstance(payload, dict):
        return {"masters": current, "audit": audit, "error": ""}
    merged = {}
    for key, rows in payload.items():
        if key not in MASTER_SCHEMAS:
            continue
        if not isinstance(rows, list):
            continue
        clean_rows = []
        for index, row in enumerate(rows):
            if not isinstance(row, dict):
                continue
            cleaned = normalize_master_row(key, row, {})
            if not any(str(value).strip() for value in cleaned.values()):
                continue
            clean_rows.append(cleaned)
        merged[key] = clean_rows
    if not merged:
        return {"masters": current, "audit": audit, "error": "No master data supplied."}

    user_id = str(current_user.get("user_id", "SYSTEM")).strip() or "SYSTEM"
    timestamp = datetime.now().strftime("%d %b %Y %I:%M %p")
    error = ""
    for key, rows in merged.items():
        entry = audit.setdefault(key, default_master_audit().get(key, {}))
        if action == "checker":
            if entry.get("maker_user") == user_id:
                error = f"{key.replace('_', ' ').title()} cannot be checker-approved by the same maker user."
                continue
            current[key] = rows
            entry.update({
                "checker_status": "Approved",
                "checker_user": user_id,
                "checker_at": timestamp,
                "last_action": "Checker Approved",
            })
        else:
            current[key] = rows
            entry.update({
                "maker_user": user_id,
                "maker_at": timestamp,
                "checker_user": "",
                "checker_at": "",
                "checker_status": "Pending Checker",
                "last_action": "Maker Saved",
            })

    current = normalize_loan_masters(current)
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO system_config (config_key, config_value) VALUES ('loan_masters', ?)
            ON CONFLICT(config_key) DO UPDATE SET config_value = excluded.config_value
            """,
            (json.dumps(current),),
        )
    save_loan_master_audit(audit)
    return {
        "masters": current,
        "audit": audit,
        "error": error,
        "message": "Checker approval completed." if action == "checker" and not error else "Maker save completed.",
    }


def validate_lead_payload(payload):
    errors = []
    if not str(payload.get("applicant", "")).strip():
        errors.append("Applicant name is required")
    if not str(payload.get("city", "")).strip():
        errors.append("City is required")
    if not validate_amount_gt_zero(payload.get("amount")):
        errors.append("Loan amount should be greater than zero")
    try:
        if int(payload.get("tenor", 0)) <= 0:
            errors.append("Tenor should be greater than zero")
    except (TypeError, ValueError):
        errors.append("Tenor should be a valid number")
    return errors


def validate_profile_payload(payload):
    errors = []
    mobile = digits_only(payload.get("mobile"))
    co_mobile = digits_only(payload.get("co_applicant_mobile"))
    guarantor_mobile = digits_only(payload.get("guarantor_mobile"))
    aadhaar = digits_only(payload.get("aadhaar_number"))
    if not validate_mobile(mobile):
        errors.append("Mobile number should be a valid 10 digit Indian mobile number")
    if payload.get("co_applicant_mobile") and not validate_mobile(co_mobile):
        errors.append("Co-applicant mobile should be a valid 10 digit number")
    if payload.get("guarantor_mobile") and not validate_mobile(guarantor_mobile):
        errors.append("Guarantor mobile should be a valid 10 digit number")
    if not validate_aadhaar(aadhaar):
        errors.append("Aadhaar number should be a valid 12 digit number")
    if not validate_gst(payload.get("gst_number")):
        errors.append("GST number should be valid")
    if parse_amount(payload.get("monthly_income")) < 0:
        errors.append("Monthly income cannot be negative")
    if not validate_amount_gt_zero(payload.get("collateral_value")):
        errors.append("Collateral value should be greater than zero")
    for field, label in [
        ("co_applicant_name", "Co-applicant name"),
        ("guarantor_name", "Guarantor name"),
        ("collateral_type", "Collateral type"),
        ("collateral_address", "Collateral address"),
        ("notepad_entry", "Notepad entry"),
    ]:
        if not str(payload.get(field, "")).strip():
            errors.append(f"{label} is required")
    return errors


def validate_stage_form(item, form_data):
    errors = []
    stage = item["stage"]
    if stage == 2:
        if not validate_pan(form_data.get("pan_number")):
            errors.append("PAN number is invalid")
        if not str(form_data.get("ckyc_id", "")).strip():
            errors.append("CKYC ID is required")
        if form_data.get("otp") != "123456":
            errors.append("KYC OTP invalid")
    elif stage == 3:
        aadhaar = item.get("profile", {}).get("aadhaar_number", "")
        if not validate_aadhaar(aadhaar):
            errors.append("Aadhaar number is not captured correctly in customer details")
        if str(form_data.get("aadhaar_last4", "")) != digits_only(aadhaar)[-4:]:
            errors.append("Aadhaar last 4 digits do not match customer details")
    elif stage == 6:
        for idx in (1, 2, 3):
            if not validate_amount_gt_zero(form_data.get(f"charge_amount_{idx}")):
                errors.append(f"Charge amount {idx} should be greater than zero")
    elif stage == 8:
        deviation_flag = str(form_data.get("deviation_flag", "")).strip().lower()
        deviation_note = str(form_data.get("deviation_note", "")).strip()
        deviation_approval = str(form_data.get("deviation_approval", "")).strip()
        if deviation_flag == "yes":
            if not deviation_note:
                errors.append("Deviation note is required when deviation is marked")
            if deviation_approval != "Approved":
                errors.append("Deviation approval is required before moving ahead")
    elif stage == 9:
        if not validate_amount_gt_zero(form_data.get("opening_principal")):
            errors.append("Opening principal should be greater than zero")
        if not validate_amount_gt_zero(form_data.get("emi_amount")):
            errors.append("EMI amount should be greater than zero")
        if parse_amount(form_data.get("rate_of_interest")) <= 0:
            errors.append("Rate of interest should be greater than zero")
    return errors


def format_inr(value):
    return f"INR {round(parse_amount(value)):,}"


def derive_npa_stage(dpd):
    if dpd <= 0:
        return "Regular"
    if dpd <= 30:
        return "SMA0"
    if dpd <= 60:
        return "SMA1"
    if dpd <= 90:
        return "SMA2"
    if dpd <= 180:
        return "Sub Standard"
    if dpd <= 365:
        return "Sub Standard 1"
    if dpd <= 540:
        return "Doubtful"
    if dpd <= 720:
        return "Doubtful 1"
    return "Write Off"


def default_accounting_template(section, values):
    mapping = {
        "collection_updates": "Receipt Realization",
        "manual_charges_due": "Manual Charge Booking",
        "charge_waivers": "Charge Waiver",
        "knockoff_entries": "Excess Knock Off",
        "banking_presentations": "Bank Presentation",
        "banking_status_updates": "Bank Return" if str(values.get("bank_status", "")).lower() == "returned" else "Receipt Realization",
        "foreclosure": "Foreclosure Receipt",
    }
    return mapping.get(section, "Receipt Realization")


def voucher_amount(values):
    for key in ("collection_amount", "due_amount", "waiver_amount", "excess_amount", "presentation_amount", "quoted_amount"):
        amount = parse_amount(values.get(key))
        if amount:
            return amount
    return 0.0


def voucher_narration(section, values):
    narration_map = {
        "collection_updates": f"Collection received via {values.get('collection_channel', 'receipt')}",
        "manual_charges_due": f"Manual charge booked for {values.get('charge_head', 'charge')}",
        "charge_waivers": f"Charge waiver approved for {values.get('waiver_charge_head', 'charge')}",
        "knockoff_entries": f"Excess knock off against {values.get('target_due_charge', 'charge')}",
        "banking_presentations": f"Banking presentation batch {values.get('batch_reference', '')}",
        "banking_status_updates": f"Bank status {values.get('bank_status', '')} for {values.get('presentation_ref', '')}",
        "foreclosure": f"Foreclosure quote recorded with status {values.get('foreclosure_status', '')}",
    }
    return narration_map.get(section, "LMS accounting voucher posted")


def accounting_entries(template_name, amount):
    amount_label = format_inr(amount)
    templates = {
        "Receipt Realization": f"Bank A/c Dr {amount_label} | Loan Customer A/c Cr {amount_label}",
        "Manual Charge Booking": f"Customer Charges Receivable Dr {amount_label} | Charge Income Cr {amount_label}",
        "Charge Waiver": f"Charge Waiver Expense Dr {amount_label} | Customer Charges Receivable Cr {amount_label}",
        "Excess Knock Off": f"Customer Excess A/c Dr {amount_label} | Customer Charges Receivable Cr {amount_label}",
        "Bank Presentation": f"Banking Presentation Control Dr {amount_label} | Customer EMI Due Cr {amount_label}",
        "Bank Return": f"Customer EMI Due Dr {amount_label} | Banking Presentation Control Cr {amount_label}",
        "Foreclosure Receipt": f"Bank A/c Dr {amount_label} | Loan Closure Settlement Cr {amount_label}",
    }
    return templates.get(template_name, templates["Receipt Realization"])


def append_voucher_entry(lms, item, section, values):
    template_name = str(values.get("accounting_template") or default_accounting_template(section, values))
    amount = voucher_amount(values)
    business_date = get_current_business_date(item).isoformat()
    existing = lms.get("voucher_entries", [])
    voucher_number = f"VCH-{int(item['id']):04d}-{len(existing) + 1:04d}"
    entry = {
        "voucher_number": voucher_number,
        "voucher_date": business_date,
        "section": section,
        "accounting_template": template_name,
        "amount": round(amount),
        "narration": voucher_narration(section, values),
        "entry_lines": accounting_entries(template_name, amount),
        "reference": values.get("batch_reference") or values.get("presentation_ref") or values.get("knockoff_reference") or values.get("charge_head") or values.get("waiver_charge_head") or item["case_code"],
    }
    existing.append(entry)
    lms["voucher_entries"] = existing


def parse_display_date(value):
    text = str(value or "").strip()
    if not text:
        return None
    for fmt in ("%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def get_global_business_date():
    with get_connection() as conn:
        row = conn.execute("SELECT config_value FROM system_config WHERE config_key = 'business_date'").fetchone()
    parsed = parse_display_date(row["config_value"]) if row else None
    return parsed or date.today()


def set_global_business_date(new_date):
    value = new_date.isoformat() if isinstance(new_date, date) else str(new_date)
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO system_config (config_key, config_value) VALUES ('business_date', ?)
            ON CONFLICT(config_key) DO UPDATE SET config_value = excluded.config_value
            """,
            (value,),
        )


def display_date(value):
    if isinstance(value, date):
        return value.strftime("%d %b %Y")
    parsed = parse_display_date(value)
    return parsed.strftime("%d %b %Y") if parsed else str(value or "")


def iso_date(value):
    if isinstance(value, date):
        return value.isoformat()
    parsed = parse_display_date(value)
    return parsed.isoformat() if parsed else ""


def get_current_business_date(item):
    return get_global_business_date()


def extract_charge_rows(item):
    charges = item.get("stage_data", {}).get("charges_summary", {})
    rows = []
    for index in range(1, 4):
        charge_type = str(charges.get(f"charge_type_{index}", "")).strip()
        charge_amount = parse_amount(charges.get(f"charge_amount_{index}", "0"))
        if charge_type:
            rows.append({"type": charge_type, "amount": charge_amount})
    return rows


def fetch_cases():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM cases ORDER BY id DESC").fetchall()
    return [serialize_case(row) for row in rows]


def fetch_case(case_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
    return serialize_case(row) if row else None


def is_frozen_case(item):
    return bool(item and item.get("stage", 0) >= 12 and str(item.get("status", "")).lower().startswith("disbursed"))


def compute_dashboard(cases):
    total_value = sum(item["amount"] for item in cases)
    avg_eligibility = round(sum(item["eligibility"] for item in cases) / len(cases)) if cases else 0
    approval_rate = round((sum(1 for item in cases if item["stage"] >= 8) / len(cases)) * 100) if cases else 0
    ready_to_disburse = sum(1 for item in cases if item["stage"] >= 11)
    today_disbursal = sum(item["amount"] for item in cases if item["stage"] >= 11)
    business_date = get_global_business_date()
    grouped = [
        {"label": "Prospects", "indexes": [0, 1]},
        {"label": "Verification", "indexes": [2, 3, 4]},
        {"label": "Credit Bureau", "indexes": [5, 6]},
        {"label": "Field & UW", "indexes": [7, 8]},
        {"label": "Docs & E-Sign", "indexes": [9, 10, 11]},
        {"label": "Disbursed", "indexes": [12]},
    ]
    board = [{"label": lane["label"], "cases": [item for item in cases if item["stage"] in lane["indexes"]]} for lane in grouped]
    underwriter_queue = [{"applicant": item["applicant"], "eligibility": item["eligibility"]} for item in cases if 7 <= item["stage"] <= 9]
    return {
        "business_date": business_date.isoformat(),
        "business_date_label": display_date(business_date),
        "metrics": [
            {"label": "Applications", "value": len(cases), "trend": "+12% vs last week"},
            {"label": "Pipeline Value", "value": total_value, "trend": "+8.4% quality mix"},
            {"label": "Avg Eligibility", "value": avg_eligibility, "trend": "Stable policy band"},
            {"label": "Ready to Disburse", "value": ready_to_disburse, "trend": "Fulfilment desk active"},
        ],
        "today_disbursal": today_disbursal,
        "approval_rate": approval_rate,
        "active_cases": len(cases),
        "sla_items": [
            {"label": "KYC turnaround", "score": 82},
            {"label": "Field verification closure", "score": 66},
            {"label": "Sanction to e-sign", "score": 74},
            {"label": "Disbursement TAT", "score": 91},
        ],
        "workflow_gates": [
            {"label": "Lead Capture", "value": f'{sum(1 for item in cases if item["stage"] <= 1)} open', "note": "Fresh sourcing and assignment"},
            {"label": "Verification Stack", "value": f'{sum(1 for item in cases if 2 <= item["stage"] <= 7)} active', "note": "KYC, Aadhaar, dedupe, bureau, charges and FV"},
            {"label": "Underwriting", "value": f'{sum(1 for item in cases if item["stage"] == 8)} pending', "note": "Policy match and exception grid"},
            {"label": "Fulfilment", "value": f'{sum(1 for item in cases if item["stage"] >= 9)} running', "note": "Repayment, docs, e-sign and disbursal"},
        ],
        "underwriter_queue": underwriter_queue,
        "board": board,
    }


def parse_json_body(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length else b"{}"
    return json.loads(raw.decode("utf-8"))


def parse_form_body(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length else b""
    parsed = parse_qs(raw.decode("utf-8"))
    return {key: values[0] for key, values in parsed.items()}


def get_session_user(handler):
    cookie_header = handler.headers.get("Cookie", "")
    cookies = {}
    for chunk in cookie_header.split(";"):
        if "=" in chunk:
            key, value = chunk.strip().split("=", 1)
            cookies[key] = value
    token = cookies.get("rfl_session")
    return SESSIONS.get(token)


def master_payload_for_user(current_user):
    return {
        "masters": get_loan_masters(),
        "audit": get_loan_master_audit(),
        "session_user": current_user or {},
    }


def create_login_challenge():
    challenge_id = secrets.token_hex(8)
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    captcha = "".join(chars[secrets.randbelow(len(chars))] for _ in range(5))
    LOGIN_CHALLENGES[challenge_id] = {
        "captcha": captcha,
        "created_at": datetime.utcnow().isoformat(),
    }
    return challenge_id, captcha


def generate_case_code(conn):
    while True:
        code = f"RFL-{secrets.randbelow(900000) + 100000}"
        exists = conn.execute("SELECT 1 FROM cases WHERE case_code = ?", (code,)).fetchone()
        if not exists:
            return code


def generate_agreement_number():
    return f"AGR-{secrets.randbelow(9000000) + 1000000}"


def build_lms_summary(item):
    lms = item.get("stage_data", {}).get("lms", {})
    disbursal = item.get("stage_data", {}).get("disbursement", {})
    business_date = get_current_business_date(item)
    billed_emis = {int(emi) for emi in lms.get("billed_emis", [])}
    manual_charges = lms.get("manual_charges_due", [])
    waivers = lms.get("charge_waivers", [])
    collections = lms.get("collection_updates", [])
    excess = lms.get("knockoff_entries", [])
    presentations = lms.get("banking_presentations", [])
    bank_statuses = lms.get("banking_status_updates", [])

    presentation_amounts = {}
    for entry in presentations:
        ref = str(entry.get("batch_reference") or entry.get("presentation_ref") or "").strip()
        presentation_amounts[ref] = parse_amount(entry.get("presentation_amount"))

    cleared_bank_total = 0.0
    presented_count = len(presentations)
    cleared_count = 0
    for entry in bank_statuses:
        status = str(entry.get("bank_status", "")).strip().lower()
        if status != "cleared":
            continue
        ref = str(entry.get("presentation_ref") or "").strip()
        cleared_bank_total += presentation_amounts.get(ref, 0.0)
        cleared_count += 1

    manual_collection_total = sum(parse_amount(entry.get("collection_amount")) for entry in collections)
    total_collected = manual_collection_total + cleared_bank_total

    rows = []
    remaining_collection = total_collected
    outstanding_due = 0.0
    billed_principal_outstanding = 0.0
    billed_interest_outstanding = 0.0
    accrued_interest = 0.0
    lpp_due = 0.0
    total_due = 0.0
    paid_principal = 0.0
    paid_interest = 0.0
    due_billed_count = 0
    oldest_unpaid_due = None
    next_due_date = None

    for row in item["repayment"]["rows"]:
        due_dt = parse_display_date(row["due_date"])
        is_billed = row["emi_number"] in billed_emis
        alloc = 0.0
        outstanding = 0.0
        status = "Not Billed"
        days_past_due = 0
        if is_billed:
            due_billed_count += 1
            total_due += row["emi_amount"]
            alloc = min(remaining_collection, row["emi_amount"])
            remaining_collection -= alloc
            outstanding = max(0.0, row["emi_amount"] - alloc)
            principal_paid = row["principal"] * (alloc / row["emi_amount"]) if row["emi_amount"] else 0.0
            interest_paid = row["interest"] * (alloc / row["emi_amount"]) if row["emi_amount"] else 0.0
            paid_principal += principal_paid
            paid_interest += interest_paid
            billed_principal_outstanding += max(0.0, row["principal"] - principal_paid)
            billed_interest_outstanding += max(0.0, row["interest"] - interest_paid)
            if outstanding <= 0.01:
                status = "Paid"
            elif alloc > 0:
                status = "Part Paid"
            else:
                status = "Due"
            if due_dt and outstanding > 0 and business_date > due_dt:
                days_past_due = (business_date - due_dt).days
                if oldest_unpaid_due is None or due_dt < oldest_unpaid_due:
                    oldest_unpaid_due = due_dt
                if days_past_due > 3:
                    lpp_due += outstanding * 0.24 / 365 * (days_past_due - 3)
            outstanding_due += outstanding
            if next_due_date is None and outstanding > 0:
                next_due_date = row["due_date"]
        rows.append({
            "emi_number": row["emi_number"],
            "due_date": row["due_date"],
            "emi_amount": row["emi_amount"],
            "principal": row["principal"],
            "interest": row["interest"],
            "status": status,
            "billed": is_billed,
            "paid_amount": round(alloc),
            "outstanding_amount": round(outstanding),
            "days_past_due": days_past_due,
        })

    if oldest_unpaid_due:
        dpd = max(0, (business_date - oldest_unpaid_due).days)
    else:
        dpd = 0

    outstanding_principal = max(0.0, item["amount"] - paid_principal)
    accrued_interest = outstanding_principal * item["roi"] / 36500
    total_manual_charges = sum(parse_amount(entry.get("due_amount")) for entry in manual_charges)
    total_waiver = sum(parse_amount(entry.get("waiver_amount")) for entry in waivers)
    total_knockoff = sum(parse_amount(entry.get("excess_amount")) for entry in excess)
    charges_outstanding = max(0.0, total_manual_charges - total_waiver - total_knockoff)
    excess_amount = max(0.0, total_collected - total_due)
    total_outstanding = outstanding_due + charges_outstanding + lpp_due + accrued_interest

    npa_stage = derive_npa_stage(dpd)
    if lms.get("npa_movement", {}).get("npa_stage"):
        npa_stage = lms["npa_movement"]["npa_stage"]
    loan_status = lms.get("loan_status", "Live")
    if lms.get("foreclosure", {}).get("foreclosure_status"):
        loan_status = lms["foreclosure"]["foreclosure_status"]

    return {
        "agreement_number": disbursal.get("agreement_number", ""),
        "loan_status": loan_status,
        "npa_stage": npa_stage,
        "business_date": business_date.isoformat(),
        "business_date_label": business_date.strftime("%d %b %Y"),
        "statement_rows": rows[:12],
        "manual_charges_total": round(total_manual_charges),
        "waiver_total": round(total_waiver),
        "collection_total": round(manual_collection_total),
        "bank_collection_total": round(cleared_bank_total),
        "excess_knockoff_total": round(total_knockoff),
        "dpd": dpd,
        "lpp_due": round(lpp_due),
        "accrued_interest": round(accrued_interest),
        "outstanding_principal": round(outstanding_principal),
        "outstanding_due": round(outstanding_due),
        "total_due": round(total_due),
        "principal_paid": round(paid_principal),
        "interest_paid": round(paid_interest),
        "principal_outstanding_billed": round(billed_principal_outstanding),
        "interest_outstanding_billed": round(billed_interest_outstanding),
        "charges_outstanding": round(charges_outstanding),
        "excess_amount": round(excess_amount),
        "total_outstanding": round(total_outstanding),
        "next_due_date": next_due_date or "No due pending",
        "billed_due_count": due_billed_count,
        "presentation_count": presented_count,
        "cleared_presentation_count": cleared_count,
    }


def create_case(payload):
    errors = validate_lead_payload(payload)
    if errors:
        return {"id": None, "status": "Validation failed", "validation_errors": errors}
    with get_connection() as conn:
        case_code = generate_case_code(conn)
        conn.execute(
            """
            INSERT INTO cases (
                case_code, applicant, product, amount, tenor, roi, city, rm, source,
                stage, cibil, bureau, dedupe, fv, aadhaar, kyc, foir, ltv, eligibility, status, docs_json, profile_json, stage_data_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                case_code, payload["applicant"], payload["product"], int(payload["amount"]), int(payload["tenor"]), 17.2,
                payload["city"], "Auto-assigned RM", payload["source"], 0, 0, "Bureau pending",
                "Awaiting dedupe engine run", "Not initiated", "Pending consent", "Awaiting document upload",
                0, 0, 55, "Lead pending end-user approval",
                json.dumps([["Application Form", "Pending"], ["KYC Pack", "Pending"], ["Income Proof", "Pending"], ["Agreement", "Pending"]]),
                json.dumps({}),
                json.dumps({})
            ),
        )
        case_id = conn.execute("SELECT last_insert_rowid() AS case_id").fetchone()["case_id"]
    return fetch_case(case_id)


def update_case_status(item):
    docs = item["docs"]
    if item["status"] == "Rejected":
        return item
    if item["stage"] == 1 and not item.get("profile_complete"):
        item["status"] = "Customer details pending"
        return item
    if item["stage"] in STAGE_FORM_CONFIG and not item.get("stage_form_complete"):
        item["status"] = f'{WORKFLOW_STAGES[item["stage"]]} pending'
        return item
    if item["stage"] >= 12:
        item["status"] = "Disbursed"
        item["docs"] = [[name, "Completed"] for name, _ in docs]
    elif item["stage"] >= 11:
        item["status"] = "Ready for Disbursal"
        item["docs"] = [[name, "Validated" if value == "Pending" else value] for name, value in docs]
    elif item["stage"] >= 10:
        item["status"] = "Documentation Complete"
        item["docs"] = [[name, "Pending" if index == len(docs) - 1 else ("Validated" if value == "Received" else value)] for index, (name, value) in enumerate(docs)]
    elif item["stage"] >= 8:
        item["status"] = "Ready for Approval"
    else:
        item["status"] = "In Progress"
    return item


def approve_case(case_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        if item["status"] == "Rejected":
            return item
        if item["stage"] == 0:
            item["stage"] = 1
            item["status"] = "Lead approved - capture customer details"
        item = update_case_status(item)
        conn.execute(
            "UPDATE cases SET stage = ?, status = ?, docs_json = ? WHERE id = ?",
            (item["stage"], item["status"], json.dumps(item["docs"]), case_id),
        )
    return fetch_case(case_id)


def reject_case(case_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        conn.execute("UPDATE cases SET status = ? WHERE id = ?", ("Rejected", case_id))
    return fetch_case(case_id)


def save_customer_profile(case_id, payload):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        profile = {
            "mobile": digits_only(payload.get("mobile", "")),
            "email": payload.get("email", ""),
            "address": payload.get("address", ""),
            "occupation": payload.get("occupation", ""),
            "monthly_income": payload.get("monthly_income", ""),
            "business_name": payload.get("business_name", ""),
            "business_vintage": payload.get("business_vintage", ""),
            "bank_name": payload.get("bank_name", ""),
            "account_number": payload.get("account_number", ""),
            "ifsc": payload.get("ifsc", ""),
            "ucic_number": generate_ucic_number(case_id),
            "aadhaar_number": digits_only(payload.get("aadhaar_number", "")),
            "gst_number": str(payload.get("gst_number", "")).strip().upper(),
            "co_applicant_name": payload.get("co_applicant_name", ""),
            "co_applicant_mobile": digits_only(payload.get("co_applicant_mobile", "")),
            "co_applicant_relation": payload.get("co_applicant_relation", ""),
            "guarantor_name": payload.get("guarantor_name", ""),
            "guarantor_mobile": digits_only(payload.get("guarantor_mobile", "")),
            "guarantor_relation": payload.get("guarantor_relation", ""),
            "collateral_type": payload.get("collateral_type", ""),
            "collateral_address": payload.get("collateral_address", ""),
            "collateral_value": payload.get("collateral_value", ""),
            "notepad_entry": payload.get("notepad_entry", ""),
        }
        errors = validate_profile_payload(profile)
        if errors:
            item["status"] = "Customer details validation failed"
            item["validation_errors"] = errors
            item["profile"] = profile
            return item
        conn.execute(
            "UPDATE cases SET profile_json = ?, stage = ?, status = ? WHERE id = ?",
            (json.dumps(profile), 2, "Customer details completed - ready for KYC", case_id),
        )
    return fetch_case(case_id)


def save_stage_form(case_id, payload):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        config = STAGE_FORM_CONFIG.get(item["stage"])
        if not config:
            return item
        form_data = {field: str(payload.get(field, "")).strip() for field in payload.keys()}
        for field in config["required"]:
            form_data.setdefault(field, "")
        if item["stage"] == 8 and form_data.get("deviation_flag", "").strip().lower() != "yes":
            form_data["deviation_note"] = form_data.get("deviation_note") or "No deviation observed"
            form_data["deviation_approval"] = "Not Required"
        errors = validate_stage_form(item, form_data)
        if errors:
            item["status"] = errors[0]
            item["validation_errors"] = errors
            return item
        existing = item.get("stage_data", {})
        existing[config["name"]] = form_data

        next_stage = config["next_stage"]
        next_status = config["status"]
        cibil = item["cibil"]
        bureau = item["bureau"]
        foir = item["foir"]
        ltv = item["ltv"]
        eligibility = item["eligibility"]
        kyc = item["kyc"]
        aadhaar = item["aadhaar"]
        dedupe = item["dedupe"]
        fv = item["fv"]

        if item["stage"] == 2:
            kyc = f'PAN {form_data["pan_number"]}, CKYC {form_data["ckyc_id"]}, proofs verified'
        elif item["stage"] == 3:
            aadhaar = f'Aadhaar {mask_aadhaar(item.get("profile", {}).get("aadhaar_number", ""))} with {form_data["consent_status"]}'
        elif item["stage"] == 4:
            dedupe = form_data["dedupe_result"]
        elif item["stage"] == 5:
            cibil = int(form_data["cibil_score"])
            foir = int(form_data["foir"])
            ltv = int(form_data["ltv"])
            bureau = form_data["bureau_summary"]
            eligibility = max(40, min(95, round((cibil / 10) + 20 - (foir / 5))))
        elif item["stage"] == 7:
            fv = form_data["fv_remark"]
        elif item["stage"] == 8:
            policy_ok = all(check["ok"] for check in build_policy_checks(item))
            policy_ok = policy_ok and form_data["policy_fit"].lower() in {"yes", "fit", "ok", "eligible"}
            if form_data.get("deviation_flag", "").strip().lower() == "yes" and form_data.get("deviation_approval") != "Approved":
                next_stage = 8
                next_status = "Deviation approval pending"
            elif not policy_ok:
                next_stage = 8
                next_status = "Underwriting review failed - policy exception"
            else:
                next_stage = 9
                next_status = config["status"]
        elif item["stage"] == 9:
            next_status = config["status"]
        elif item["stage"] == 10:
            docs = [
                ["Application Form", "Validated"],
                ["KYC Pack", "Validated"],
                ["Income Proof", "Validated"],
                ["Agreement", "Pending"],
            ]
            item["docs"] = docs
            next_status = config["status"]
        elif item["stage"] == 11:
            docs = [[name, "Validated" if status == "Pending" else status] for name, status in item["docs"]]
            item["docs"] = docs
            next_status = config["status"]
        elif item["stage"] == 12:
            if not form_data.get("agreement_number"):
                form_data["agreement_number"] = generate_agreement_number()
            existing[config["name"]] = form_data
            lms = existing.get("lms", {})
            lms.setdefault("loan_status", "Live")
            lms.setdefault("case_viewer", {
                "agreement_number": form_data["agreement_number"],
                "customer_name": item["applicant"],
                "product": item["product"],
                "loan_amount": item["amount"],
                "net_disbursal_amount": item["net_disbursal_amount"],
            })
            existing["lms"] = lms
            docs = [[name, "Completed"] for name, _ in item["docs"]]
            item["docs"] = docs
            next_status = "Disbursed - moved to LMS"

        conn.execute(
            """
            UPDATE cases
            SET stage = ?, status = ?, stage_data_json = ?, docs_json = ?, cibil = ?, bureau = ?, dedupe = ?, fv = ?, aadhaar = ?, kyc = ?, foir = ?, ltv = ?, eligibility = ?
            WHERE id = ?
            """,
            (next_stage, next_status, json.dumps(existing), json.dumps(item["docs"]), cibil, bureau, dedupe, fv, aadhaar, kyc, foir, ltv, eligibility, case_id),
        )
    return fetch_case(case_id)


def build_esign_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    esign = item.get("stage_data", {}).get("esign", {})
    disbursal = item.get("stage_data", {}).get("disbursement", {})
    meta = [
        ("Application ID", item["case_code"]),
        ("Agreement Number", disbursal.get("agreement_number", "")),
        ("Customer Name", item["applicant"]),
        ("Product", item["product"]),
        ("Loan Amount", format_inr(item["amount"])),
        ("Net Disbursal", format_inr(item["net_disbursal_amount"])),
        ("ROI", f"{item['roi']}% p.a."),
        ("Tenor", f"{item['tenor']} months"),
        ("EMI Amount", format_inr(item["repayment"]["emi_amount"])),
        ("E-Sign Provider", esign.get("esign_provider", "")),
        ("Mandate Reference", esign.get("mandate_reference", "")),
        ("Signature Status", esign.get("esign_status", "Electronically Signed")),
    ]
    tables = [
        {
            "title": "Customer And Disbursal Details",
            "headers": ["Field", "Value"],
            "rows": [
                ["Payee Name", disbursal.get("payee_name", item["applicant"])],
                ["Disbursal Date", disbursal.get("disbursal_date", "")],
                ["Mobile", item["profile"].get("mobile", "")],
                ["Email", item["profile"].get("email", "")],
                ["Address", item["profile"].get("address", "")],
                ["Bank Account", item["profile"].get("account_number", "")],
                ["IFSC", item["profile"].get("ifsc", "")],
            ],
        },
        {
            "title": "Charges Summary",
            "headers": ["Charge Head", "Amount"],
            "rows": [[charge["type"], format_inr(charge["amount"])] for charge in item["charge_rows"]] + [["Total Charges", format_inr(item["charge_total"])]],
        },
    ]
    return build_report_pdf("E-Sign Agreement Copy", meta, tables)


def build_sanction_letter_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    disbursal = item.get("stage_data", {}).get("disbursement", {})
    meta = [
        ("Application ID", item["case_code"]),
        ("Customer Name", item["applicant"]),
        ("Product", item["product"]),
        ("Loan Amount", format_inr(item["amount"])),
        ("Net Disbursal", format_inr(item["net_disbursal_amount"])),
        ("ROI", f"{item['roi']}% p.a."),
        ("Tenor", f"{item['tenor']} months"),
        ("EMI Amount", format_inr(item["repayment"]["emi_amount"])),
        ("Disbursal Mode", disbursal.get("disbursal_mode", "")),
        ("Payee Name", disbursal.get("payee_name", item["applicant"])),
        ("Disbursal Date", disbursal.get("disbursal_date", "")),
        ("Interest Start Date", disbursal.get("interest_start_date", "")),
    ]
    tables = [
        {
            "title": "Applicant And Business Details",
            "headers": ["Field", "Value"],
            "rows": [
                ["Mobile", item["profile"].get("mobile", "")],
                ["Address", item["profile"].get("address", "")],
                ["Occupation", item["profile"].get("occupation", "")],
                ["Monthly Income", str(item["profile"].get("monthly_income", ""))],
                ["Business Name", item["profile"].get("business_name", "")],
                ["Business Vintage", item["profile"].get("business_vintage", "")],
            ],
        },
        {
            "title": "Charges Summary",
            "headers": ["Charge Head", "Amount"],
            "rows": [[charge["type"], format_inr(charge["amount"])] for charge in item["charge_rows"]] + [["Total Charges", format_inr(item["charge_total"])]],
        },
    ]
    return build_report_pdf("Sanction Letter", meta, tables)


def build_repayment_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    disbursal = item.get("stage_data", {}).get("disbursement", {})
    meta = [
        ("Application ID", item["case_code"]),
        ("Agreement Number", disbursal.get("agreement_number", "")),
        ("Customer Name", item["applicant"]),
        ("Loan Amount", format_inr(item["amount"])),
        ("Net Disbursal", format_inr(item["net_disbursal_amount"])),
        ("ROI", f"{item['roi']}% p.a."),
        ("EMI Amount", format_inr(item["repayment"]["emi_amount"])),
        ("Tenor", f"{item['tenor']} months"),
        ("Total Charges", format_inr(item["charge_total"])),
        ("Interest Start Date", disbursal.get("interest_start_date", "")),
    ]
    tables = [{
        "title": "Repayment Schedule",
        "headers": ["EMI", "Due Date", "Opening", "EMI Amt", "ROI", "Principal", "Interest", "Closing"],
        "rows": [[
            row["emi_number"],
            row["due_date"],
            format_inr(row["opening_balance"]),
            format_inr(row["emi_amount"]),
            f"{row['roi']}%",
            format_inr(row["principal"]),
            format_inr(row["interest"]),
            format_inr(row["closing_balance"]),
        ] for row in item["repayment"]["rows"]],
    }]
    return build_report_pdf("Complete Repayment Schedule", meta, tables)


def build_revised_schedule_data(item):
    reschedule = item.get("stage_data", {}).get("lms", {}).get("reschedule", {})
    if not reschedule:
        return None
    effective_date = parse_display_date(reschedule.get("effective_date")) or get_current_business_date(item)
    tenor = int(float(reschedule.get("new_tenor") or item["tenor"]))
    roi = float(reschedule.get("new_roi") or item["roi"])
    emi = parse_amount(reschedule.get("revised_emi")) or None
    outstanding = item.get("lms_summary", {}).get("outstanding_principal") or item["amount"]
    return create_custom_schedule(outstanding, roi, tenor, effective_date, emi_override=emi)


def build_revised_schedule_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    reschedule = item.get("stage_data", {}).get("lms", {}).get("reschedule", {})
    schedule = build_revised_schedule_data(item)
    if not schedule:
        return build_report_pdf("Revised Repayment Schedule", [("Status", "No reschedule data available")], [])
    meta = [
        ("Application ID", item["case_code"]),
        ("Customer Name", item["applicant"]),
        ("Agreement Number", item.get("stage_data", {}).get("disbursement", {}).get("agreement_number", "")),
        ("Reschedule Reason", reschedule.get("reschedule_reason", "")),
        ("Effective Date", display_date(reschedule.get("effective_date"))),
        ("Revised ROI", f"{reschedule.get('new_roi', item['roi'])}%"),
        ("Revised Tenor", str(reschedule.get("new_tenor", item["tenor"]))),
        ("Revised EMI", format_inr(schedule["emi_amount"])),
    ]
    tables = [{
        "title": "Revised Repayment Schedule",
        "headers": ["EMI", "Due Date", "Opening", "EMI Amt", "Principal", "Interest", "Closing"],
        "rows": [[
            row["emi_number"],
            row["due_date"],
            format_inr(row["opening_balance"]),
            format_inr(row["emi_amount"]),
            format_inr(row["principal"]),
            format_inr(row["interest"]),
            format_inr(row["closing_balance"]),
        ] for row in schedule["rows"]],
    }]
    return build_report_pdf("Revised Repayment Schedule", meta, tables)


def build_foreclosure_statement_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    foreclosure = item.get("stage_data", {}).get("lms", {}).get("foreclosure", {})
    summary = item.get("lms_summary", {})
    quoted_amount = parse_amount(foreclosure.get("quoted_amount")) or (
        summary.get("outstanding_principal", 0)
        + summary.get("interest_outstanding_billed", 0)
        + summary.get("charges_outstanding", 0)
        + summary.get("lpp_due", 0)
        + summary.get("accrued_interest", 0)
    )
    meta = [
        ("Application ID", item["case_code"]),
        ("Customer Name", item["applicant"]),
        ("Agreement Number", item.get("stage_data", {}).get("disbursement", {}).get("agreement_number", "")),
        ("Foreclosure Date", display_date(foreclosure.get("foreclosure_date"))),
        ("Foreclosure Status", foreclosure.get("foreclosure_status", "Foreclosure Requested")),
        ("Business Date", item.get("lms_summary", {}).get("business_date_label", "")),
    ]
    tables = [{
        "title": "Closure Components",
        "headers": ["Component", "Amount"],
        "rows": [
            ["Principal Outstanding", format_inr(summary.get("outstanding_principal", 0))],
            ["Interest Outstanding", format_inr(summary.get("interest_outstanding_billed", 0))],
            ["Accrued Interest", format_inr(summary.get("accrued_interest", 0))],
            ["LPP Due", format_inr(summary.get("lpp_due", 0))],
            ["Charges Outstanding", format_inr(summary.get("charges_outstanding", 0))],
            ["Excess Amount Available", format_inr(summary.get("excess_amount", 0))],
            ["Foreclosure Quote Amount", format_inr(quoted_amount)],
        ],
    }]
    return build_report_pdf("Foreclosure Statement", meta, tables)


def soa_number(value):
    return f"{parse_amount(value):,.2f}"


def build_soa_transaction_rows(item):
    summary = item.get("lms_summary", {})
    lms = item.get("stage_data", {}).get("lms", {})
    presentations = lms.get("banking_presentations", [])
    statuses = lms.get("banking_status_updates", [])
    collections = lms.get("collection_updates", [])
    billed_rows = [row for row in summary.get("statement_rows", []) if row.get("billed")]
    events = []

    for row in billed_rows:
        dt = parse_display_date(row.get("due_date"))
        events.append({
            "date": dt or get_current_business_date(item),
            "value_date": dt or get_current_business_date(item),
            "particulars": f"EMI BILLING {row.get('emi_number')}",
            "tran_type": "BILL",
            "cheque": "-",
            "debit": parse_amount(row.get("emi_amount")),
            "credit": 0.0,
        })

    presentation_map = {}
    for entry in presentations:
        reference = str(entry.get("batch_reference") or "").strip()
        presentation_map[reference] = entry

    for entry in statuses:
        if str(entry.get("bank_status", "")).strip().lower() != "cleared":
            continue
        ref = str(entry.get("presentation_ref") or "").strip()
        base = presentation_map.get(ref, {})
        amount = parse_amount(base.get("presentation_amount"))
        dt = parse_display_date(entry.get("status_date")) or get_current_business_date(item)
        events.append({
            "date": dt,
            "value_date": dt,
            "particulars": f"BANK CLEAR/{ref or 'AUTO'}",
            "tran_type": "CLR",
            "cheque": ref or "-",
            "debit": 0.0,
            "credit": amount,
        })

    for entry in collections:
        dt = parse_display_date(entry.get("collection_date")) or get_current_business_date(item)
        events.append({
            "date": dt,
            "value_date": dt,
            "particulars": f"RECEIPT/{entry.get('collection_channel', 'COLL')}",
            "tran_type": "RCT",
            "cheque": entry.get("collector_name", "-")[:10],
            "debit": 0.0,
            "credit": parse_amount(entry.get("collection_amount")),
        })

    events.sort(key=lambda row: (row["date"], row["tran_type"], row["particulars"]))
    balance = 0.0
    rows = []
    for event in events:
        balance = balance + event["debit"] - event["credit"]
        rows.append([
            display_date(event["date"]),
            display_date(event["value_date"]),
            event["particulars"],
            event["tran_type"],
            event["cheque"],
            soa_number(event["debit"]) if event["debit"] else "",
            soa_number(event["credit"]) if event["credit"] else "",
            soa_number(balance),
            "DR" if event["debit"] >= event["credit"] else "CR",
        ])
    return rows


def build_soa_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    summary = item.get("lms_summary", {})
    disbursal = item.get("stage_data", {}).get("disbursement", {})
    transactions = build_soa_transaction_rows(item)
    first_txn_date = transactions[0][0] if transactions else disbursal.get("interest_start_date", "")
    issue_date = summary.get("business_date_label", display_date(date.today()))
    lines = [
        "RELIGARE  Values that bind",
        "RFL Loan Management System",
        "STATEMENT OF ACCOUNT",
        "",
        "Customer Details",
    ]
    lines.extend(ascii_table(
        ["Field", "Value"],
        [
            ["Name", item["applicant"]],
            ["Communication Address", item["profile"].get("address", "")],
            ["Mobile Number", item["profile"].get("mobile", "")],
            ["Email ID", item["profile"].get("email", "")],
            ["Customer ID", item["customer_id"]],
            ["Application ID", item["case_code"]],
        ],
        [22, 50]
    ))
    lines.append("")
    lines.append("Loan And Account Details")
    lines.extend(ascii_table(
        ["Field", "Value"],
        [
            ["Agreement Number", disbursal.get("agreement_number", "")],
            ["Branch Name", f"{item['city']} Branch"],
            ["Account Number", disbursal.get("disbursal_account", item["profile"].get("account_number", ""))],
            ["Account Status", summary.get("loan_status", "Live")],
            ["Product", item["product"]],
            ["Mode Of Operation", "Single"],
            ["Rate Of Interest", f"{item['roi']}% p.a."],
            ["Tenor", f"{item['tenor']} months"],
            ["NPA Stage", summary.get("npa_stage", "Regular")],
            ["IFSC", item["profile"].get("ifsc", "")],
        ],
        [22, 50]
    ))
    lines.append("")
    lines.append("Statement Period")
    lines.extend(ascii_table(
        ["Field", "Value"],
        [
            ["Opening Balance", soa_number(0)],
            ["Date Of Issue", issue_date],
            ["Statement From", first_txn_date],
            ["Statement To", summary.get("business_date_label", "")],
            ["Principal Outstanding", soa_number(summary.get("outstanding_principal", 0))],
            ["Interest Outstanding", soa_number(summary.get("interest_outstanding_billed", 0))],
            ["Charges Outstanding", soa_number(summary.get("charges_outstanding", 0))],
            ["Total Outstanding", soa_number(summary.get("total_outstanding", 0))],
        ],
        [22, 50]
    ))
    lines.append("")
    lines.append("All amounts are in INR")
    lines.append("Transaction Details")
    lines.extend(ascii_table(
        ["Dt", "ValDt", "Particulars", "Typ", "Chq", "Debit", "Credit", "Balance", "D/C"],
        transactions or [["-", "-", "No transactions available for the selected period", "-", "-", "-", "-", "0.00", "-"]],
        [5, 5, 18, 4, 6, 8, 8, 8, 3]
    ))
    lines.extend([
        "",
        "Abbreviations Used:",
        "RCT : Receipt Transaction    BILL : EMI Billing    CLR : Cleared Banking Collection",
        "DR  : Debit Entry            CR   : Credit Entry   D/C : Debit or Credit",
        "",
        "DISCLAIMER:",
        "This is a computer generated statement of account for the loan account maintained in the LMS.",
        "The statement reflects transactions and balances available in the system up to the business date shown above.",
        "If any discrepancy is noticed, it should be reported to Religare within 21 days of the statement date.",
        "",
        "****END OF STATEMENT****",
    ])
    return simple_pdf_bytes(lines)


def build_collection_report_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    collections = item.get("stage_data", {}).get("lms", {}).get("collection_updates", [])
    statuses = item.get("stage_data", {}).get("lms", {}).get("banking_status_updates", [])
    vouchers = [entry for entry in item.get("stage_data", {}).get("lms", {}).get("voucher_entries", []) if entry.get("section") in {"collection_updates", "banking_status_updates"}]
    meta = [
        ("Application ID", item["case_code"]),
        ("Customer Name", item["applicant"]),
        ("Agreement Number", item.get("stage_data", {}).get("disbursement", {}).get("agreement_number", "")),
        ("Business Date", item.get("lms_summary", {}).get("business_date_label", "")),
        ("Manual Collection Total", format_inr(item.get("lms_summary", {}).get("collection_total", 0))),
        ("Bank Cleared Total", format_inr(item.get("lms_summary", {}).get("bank_collection_total", 0))),
    ]
    tables = [
        {
            "title": "Manual Collections",
            "headers": ["Date", "Channel", "Amount", "Collector", "Remark"],
            "rows": [[
                entry.get("collection_date", ""),
                entry.get("collection_channel", ""),
                format_inr(entry.get("collection_amount", 0)),
                entry.get("collector_name", ""),
                entry.get("collection_remark", ""),
            ] for entry in collections] or [["-", "-", "-", "-", "No manual collection entries available"]],
        },
        {
            "title": "Banking Status Updates",
            "headers": ["Ref", "Status", "Return Reason", "Date"],
            "rows": [[
                entry.get("presentation_ref", ""),
                entry.get("bank_status", ""),
                entry.get("return_reason", ""),
                entry.get("status_date", ""),
            ] for entry in statuses] or [["-", "-", "-", "No banking status entries available"]],
        },
        {
            "title": "Receipt Voucher Entries",
            "headers": ["Voucher No", "Date", "Template", "Amount", "Narration"],
            "rows": [[
                entry.get("voucher_number", ""),
                display_date(entry.get("voucher_date", "")),
                entry.get("accounting_template", ""),
                format_inr(entry.get("amount", 0)),
                entry.get("narration", ""),
            ] for entry in vouchers] or [["-", "-", "-", "-", "No receipt voucher entries available"]],
        },
    ]
    return build_report_pdf("Collection Register", meta, tables)


def build_charge_ledger_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    lms = item.get("stage_data", {}).get("lms", {})
    manual = lms.get("manual_charges_due", [])
    waivers = lms.get("charge_waivers", [])
    knockoffs = lms.get("knockoff_entries", [])
    vouchers = [entry for entry in lms.get("voucher_entries", []) if entry.get("section") in {"manual_charges_due", "charge_waivers", "knockoff_entries"}]
    meta = [
        ("Application ID", item["case_code"]),
        ("Customer Name", item["applicant"]),
        ("Business Date", item.get("lms_summary", {}).get("business_date_label", "")),
        ("Charges Outstanding", format_inr(item.get("lms_summary", {}).get("charges_outstanding", 0))),
        ("Excess Available", format_inr(item.get("lms_summary", {}).get("excess_amount", 0))),
    ]
    tables = [
        {
            "title": "Charges Collected At Disbursal",
            "headers": ["Charge Head", "Amount"],
            "rows": [[charge["type"], format_inr(charge["amount"])] for charge in item.get("charge_rows", [])] or [["-", "No charges collected at disbursal"]],
        },
        {
            "title": "Manual Charges Due",
            "headers": ["Charge Head", "Amount", "Due Date", "Narration"],
            "rows": [[entry.get("charge_head", ""), format_inr(entry.get("due_amount", 0)), entry.get("due_date", ""), entry.get("charge_narration", "")] for entry in manual] or [["-", "-", "-", "No manual charge entries"]],
        },
        {
            "title": "Charge Waivers",
            "headers": ["Charge Head", "Amount", "Reason", "Approver"],
            "rows": [[entry.get("waiver_charge_head", ""), format_inr(entry.get("waiver_amount", 0)), entry.get("waiver_reason", ""), entry.get("approver", "")] for entry in waivers] or [["-", "-", "-", "No waiver entries"]],
        },
        {
            "title": "Excess Knock Off",
            "headers": ["Excess Amount", "Against Charge", "Reference", "Remark"],
            "rows": [[format_inr(entry.get("excess_amount", 0)), entry.get("target_due_charge", ""), entry.get("knockoff_reference", ""), entry.get("knockoff_remark", "")] for entry in knockoffs] or [["-", "-", "-", "No knock off entries"]],
        },
        {
            "title": "Voucher Entries",
            "headers": ["Voucher No", "Template", "Amount", "Entry Lines"],
            "rows": [[entry.get("voucher_number", ""), entry.get("accounting_template", ""), format_inr(entry.get("amount", 0)), entry.get("entry_lines", "")] for entry in vouchers] or [["-", "-", "-", "No voucher entries"]],
        },
    ]
    return build_report_pdf("Charge Ledger", meta, tables)


def build_voucher_register_pdf(case_id):
    item = fetch_case(case_id)
    if item is None:
        return None
    vouchers = item.get("stage_data", {}).get("lms", {}).get("voucher_entries", [])
    meta = [
        ("Application ID", item["case_code"]),
        ("Customer Name", item["applicant"]),
        ("Agreement Number", item.get("stage_data", {}).get("disbursement", {}).get("agreement_number", "")),
        ("Business Date", item.get("lms_summary", {}).get("business_date_label", "")),
        ("Voucher Count", str(len(vouchers))),
    ]
    tables = [{
        "title": "Voucher Register",
        "headers": ["Voucher No", "Date", "Section", "Template", "Amount", "Reference", "Entry Lines"],
        "rows": [[
            entry.get("voucher_number", ""),
            display_date(entry.get("voucher_date", "")),
            entry.get("section", ""),
            entry.get("accounting_template", ""),
            format_inr(entry.get("amount", 0)),
            entry.get("reference", ""),
            entry.get("entry_lines", ""),
        ] for entry in vouchers] or [["-", "-", "-", "-", "-", "-", "No voucher entries available"]],
    }]
    return build_report_pdf("Voucher Register", meta, tables)


def ascii_table(headers, rows, widths):
    def fit(text, width):
        raw = str(text or "")
        if len(raw) <= width:
            return [raw]
        output = []
        while len(raw) > width:
            split_at = raw.rfind(" ", 0, width)
            if split_at <= 0:
                split_at = width
            output.append(raw[:split_at].strip())
            raw = raw[split_at:].strip()
        output.append(raw)
        return output

    border = "+" + "+".join("-" * (width + 2) for width in widths) + "+"
    lines = [border]
    header_cells = [str(header or "")[:widths[index]].ljust(widths[index]) for index, header in enumerate(headers)]
    lines.append("| " + " | ".join(header_cells) + " |")
    lines.append(border)
    for row in rows:
        cell_lines = [fit(row[index] if index < len(row) else "", widths[index]) for index in range(len(widths))]
        height = max(len(cell) for cell in cell_lines)
        for line_index in range(height):
            rendered = []
            for col_index, width in enumerate(widths):
                text = cell_lines[col_index][line_index] if line_index < len(cell_lines[col_index]) else ""
                rendered.append(text.ljust(width))
            lines.append("| " + " | ".join(rendered) + " |")
        lines.append(border)
    return lines


def build_report_pdf(title, meta_rows, tables):
    lines = [
        "RELIGARE  Values that bind",
        "RFL Loan Management System",
        title,
        f"Generated On: {display_date(date.today())}",
        "",
    ]
    if meta_rows:
        lines.append("Report Summary")
        lines.extend(ascii_table(["Field", "Value"], [[label, value] for label, value in meta_rows], [26, 60]))
    for table in tables:
        lines.append("")
        lines.append(table["title"])
        width_map = {
            2: [24, 48],
            4: [14, 14, 14, 20],
            5: [10, 10, 10, 10, 16],
            7: [6, 10, 10, 10, 10, 10, 14],
            8: [4, 9, 9, 9, 5, 9, 9, 9],
            9: [4, 9, 8, 8, 8, 8, 8, 4, 9],
        }
        widths = width_map.get(len(table["headers"]), [18] * len(table["headers"]))
        lines.extend(ascii_table(table["headers"], table["rows"], widths))
    return simple_pdf_bytes(lines)


def jpeg_dimensions(data):
    index = 2
    while index < len(data):
        if data[index] != 0xFF:
            index += 1
            continue
        marker = data[index + 1]
        if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC9, 0xCA, 0xCB}:
            height = int.from_bytes(data[index + 5:index + 7], "big")
            width = int.from_bytes(data[index + 7:index + 9], "big")
            return width, height
        if marker in {0xD8, 0xD9}:
            index += 2
            continue
        length = int.from_bytes(data[index + 2:index + 4], "big")
        index += 2 + length
    return 0, 0


def simple_pdf_bytes(lines):
    max_chars = 96
    wrapped_lines = []
    for line in lines:
        text = str(line or "")
        if not text:
            wrapped_lines.append("")
            continue
        while len(text) > max_chars:
            split_at = text.rfind(" ", 0, max_chars)
            if split_at <= 0:
                split_at = max_chars
            wrapped_lines.append(text[:split_at].rstrip())
            text = text[split_at:].lstrip()
        wrapped_lines.append(text)

    lines_per_page = 40
    pages = [wrapped_lines[index:index + lines_per_page] for index in range(0, len(wrapped_lines), lines_per_page)] or [[""]]

    def esc(text):
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    logo_data = b""
    logo_width = 0
    logo_height = 0
    logo_path = BASE_DIR / "static" / "religare-logo.jpg"
    if logo_path.exists():
        logo_data = logo_path.read_bytes()
        logo_width, logo_height = jpeg_dimensions(logo_data)

    objects = []
    objects.append(b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj")
    kids = []
    next_object_id = 3
    page_object_ids = []
    content_object_ids = []
    for _ in pages:
        page_object_ids.append(next_object_id)
        content_object_ids.append(next_object_id + 1)
        kids.append(f"{next_object_id} 0 R")
        next_object_id += 2
    font_object_id = next_object_id
    logo_object_id = font_object_id + 1 if logo_data else None
    objects.append(f"2 0 obj << /Type /Pages /Kids [{' '.join(kids)}] /Count {len(pages)} >> endobj".encode("latin-1"))

    for page_object_id, content_object_id, page_lines in zip(page_object_ids, content_object_ids, pages):
        resource = f"/Resources << /Font << /F1 {font_object_id} 0 R >>"
        if logo_object_id:
            resource += f" /XObject << /Im1 {logo_object_id} 0 R >>"
        resource += " >>"
        content_lines = []
        if logo_object_id and logo_width and logo_height:
            content_lines.extend([
                "q",
                "160 0 0 42 50 780 cm",
                "/Im1 Do",
                "Q",
            ])
        content_lines.extend(["BT", "/F1 9 Tf", "50 740 Td", "13 TL"])
        for idx, line in enumerate(page_lines):
            prefix = "" if idx == 0 else "T* "
            content_lines.append(f"{prefix}({esc(line)}) Tj")
        content_lines.append("ET")
        content = "\n".join(content_lines).encode("latin-1", "replace")
        objects.append(f"{page_object_id} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents {content_object_id} 0 R {resource} >> endobj".encode("latin-1"))
        objects.append(f"{content_object_id} 0 obj << /Length {len(content)} >> stream\n".encode("latin-1") + content + b"\nendstream endobj")

    objects.append(f"{font_object_id} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj".encode("latin-1"))
    if logo_object_id and logo_width and logo_height:
        objects.append(
            f"{logo_object_id} 0 obj << /Type /XObject /Subtype /Image /Width {logo_width} /Height {logo_height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {len(logo_data)} >> stream\n".encode("latin-1")
            + logo_data
            + b"\nendstream endobj"
        )
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)
        pdf.extend(b"\n")
    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects)+1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF".encode())
    return bytes(pdf)


def advance_case(case_id, target_stage=None):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        if item["stage"] == 1 and not item.get("profile_complete"):
            item["status"] = "Customer details pending"
            return item
        if item["stage"] in STAGE_FORM_CONFIG and not item.get("stage_form_complete"):
            item["status"] = f'{WORKFLOW_STAGES[item["stage"]]} pending'
            return item
        item["stage"] = min(target_stage if target_stage is not None else item["stage"] + 1, len(WORKFLOW_STAGES) - 1)
        item = update_case_status(item)
        conn.execute("UPDATE cases SET stage = ?, status = ?, docs_json = ? WHERE id = ?", (item["stage"], item["status"], json.dumps(item["docs"]), case_id))
    return fetch_case(case_id)


def hold_case(case_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        conn.execute("UPDATE cases SET status = ? WHERE id = ?", ("On Hold - Awaiting Exception Approval", case_id))
    return fetch_case(case_id)


def reset_case(case_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        if is_frozen_case(item):
            item["status"] = "Disbursed - account frozen in LOS and moved to LMS"
            return item
        docs = json.dumps([
            ["Application Form", "Pending"],
            ["KYC Pack", "Pending"],
            ["Income Proof", "Pending"],
            ["Agreement", "Pending"],
        ])
        conn.execute(
            "UPDATE cases SET stage = ?, status = ?, docs_json = ?, profile_json = ?, stage_data_json = ?, cibil = ?, bureau = ?, dedupe = ?, fv = ?, aadhaar = ?, kyc = ?, foir = ?, ltv = ?, eligibility = ? WHERE id = ?",
            (
                0,
                "Lead pending end-user approval",
                docs,
                json.dumps({}),
                json.dumps({}),
                0,
                "Bureau pending",
                "Awaiting dedupe engine run",
                "Not initiated",
                "Pending consent",
                "Awaiting document upload",
                0,
                0,
                55,
                case_id,
            ),
        )
    return fetch_case(case_id)


def process_daily_batch(batch_type):
    current_business_date = get_global_business_date()
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM cases WHERE stage >= 12").fetchall()
        if batch_type == "eod":
            next_business_date = current_business_date + timedelta(days=1)
            set_global_business_date(next_business_date)
            for row in rows:
                item = serialize_case(row)
                existing = item.get("stage_data", {})
                lms = existing.get("lms", {})
                runs = lms.get("daily_batch_runs", [])
                runs.append({
                    "batch_type": "eod",
                    "process_date": current_business_date.isoformat(),
                    "business_date_before": current_business_date.isoformat(),
                    "business_date_after": next_business_date.isoformat(),
                    "batch_status": "Completed",
                })
                lms["daily_batch_runs"] = runs
                lms["business_date"] = next_business_date.isoformat()
                existing["lms"] = lms
                conn.execute("UPDATE cases SET stage_data_json = ? WHERE id = ?", (json.dumps(existing), row["id"]))
            return {"process_date": current_business_date.isoformat(), "business_date_after": next_business_date.isoformat()}

        billed_count = 0
        for row in rows:
            item = serialize_case(row)
            existing = item.get("stage_data", {})
            lms = existing.get("lms", {})
            billed_emis = {int(emi) for emi in lms.get("billed_emis", [])}
            for repayment_row in item["repayment"]["rows"]:
                due_dt = parse_display_date(repayment_row["due_date"])
                if due_dt == current_business_date and repayment_row["emi_number"] not in billed_emis:
                    billed_emis.add(repayment_row["emi_number"])
                    billed_count += 1
            lms["billed_emis"] = sorted(billed_emis)
            runs = lms.get("daily_batch_runs", [])
            runs.append({
                "batch_type": "bod",
                "process_date": current_business_date.isoformat(),
                "business_date": current_business_date.isoformat(),
                "batch_status": "Completed",
                "billing_due_created_count": billed_count,
            })
            lms["daily_batch_runs"] = runs
            lms["business_date"] = current_business_date.isoformat()
            existing["lms"] = lms
            conn.execute("UPDATE cases SET stage_data_json = ? WHERE id = ?", (json.dumps(existing), row["id"]))
        return {"process_date": current_business_date.isoformat(), "business_date": current_business_date.isoformat(), "billing_due_created_count": billed_count}


def save_lms_action(case_id, payload, current_user):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        item = serialize_case(row)
        existing = item.get("stage_data", {})
        lms = existing.get("lms", {})
        section = str(payload.get("section", "")).strip()
        values = payload.get("values", {})
        approval_mode = str(payload.get("approval_mode", "maker")).strip().lower()
        if not section or not isinstance(values, dict):
            return {"ok": False, "item": item, "error": "Invalid LMS payload."}

        current_business_date = get_current_business_date(item)
        lms.setdefault("business_date", current_business_date.isoformat())
        user_id = str(current_user.get("user_id", "SYSTEM")).strip() or "SYSTEM"
        user_name = str(current_user.get("user_name", user_id)).strip() or user_id
        timestamp = datetime.now().strftime("%d %b %Y %I:%M %p")
        list_sections = {
            "banking_presentations",
            "banking_status_updates",
            "collection_updates",
            "knockoff_entries",
            "manual_charges_due",
            "charge_waivers",
            "daily_batch_runs",
        }

        if section == "daily_batch_runs":
            batch_type = str(values.get("batch_type", "")).strip().lower()
            if batch_type in {"eod", "bod"}:
                process_daily_batch(batch_type)
                return {"ok": True, "item": fetch_case(case_id), "message": f"{batch_type.upper()} batch completed."}
        elif section in list_sections:
            current = lms.get(section, [])
            if approval_mode == "checker":
                if not current:
                    return {"ok": False, "item": item, "error": "No maker transaction available for checker approval."}
                target = current[-1]
                if target.get("maker_user") == user_id:
                    return {"ok": False, "item": item, "error": "Maker and checker cannot be the same user."}
                target.update({str(key): str(value).strip() for key, value in values.items()})
                target["checker_user"] = user_id
                target["checker_name"] = user_name
                target["checker_at"] = timestamp
                target["checker_status"] = "Approved"
                target["last_action"] = "Checker Approved"
            else:
                entry = {str(key): str(value).strip() for key, value in values.items()}
                entry.update({
                    "maker_user": user_id,
                    "maker_name": user_name,
                    "maker_at": timestamp,
                    "checker_user": "",
                    "checker_name": "",
                    "checker_at": "",
                    "checker_status": "Pending Checker",
                    "last_action": "Maker Saved",
                })
                current.append(entry)
            lms[section] = current
        else:
            current = lms.get(section, {})
            if approval_mode == "checker":
                if not current:
                    return {"ok": False, "item": item, "error": "No maker transaction available for checker approval."}
                if current.get("maker_user") == user_id:
                    return {"ok": False, "item": item, "error": "Maker and checker cannot be the same user."}
                current.update({str(key): str(value).strip() for key, value in values.items()})
                current.update({
                    "checker_user": user_id,
                    "checker_name": user_name,
                    "checker_at": timestamp,
                    "checker_status": "Approved",
                    "last_action": "Checker Approved",
                })
                lms[section] = current
            else:
                entry = {str(key): str(value).strip() for key, value in values.items()}
                entry.update({
                    "maker_user": user_id,
                    "maker_name": user_name,
                    "maker_at": timestamp,
                    "checker_user": "",
                    "checker_name": "",
                    "checker_at": "",
                    "checker_status": "Pending Checker",
                    "last_action": "Maker Saved",
                })
                lms[section] = entry

        voucher_sections = {
            "collection_updates",
            "manual_charges_due",
            "charge_waivers",
            "knockoff_entries",
            "banking_presentations",
            "banking_status_updates",
            "foreclosure",
        }
        if section in voucher_sections and approval_mode != "checker":
            append_voucher_entry(lms, item, section, values)

        projected_item = {**item, "stage_data": {**item.get("stage_data", {}), "lms": lms}}
        lms["loan_status"] = build_lms_summary(projected_item)["loan_status"]

        existing["lms"] = lms
        conn.execute("UPDATE cases SET stage_data_json = ? WHERE id = ?", (json.dumps(existing), case_id))
    return {
        "ok": True,
        "item": fetch_case(case_id),
        "message": "Checker approval completed." if approval_mode == "checker" else "Maker transaction saved.",
    }


class AppHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/login":
            challenge_id, captcha = create_login_challenge()
            login_template = (BASE_DIR / "templates" / "login.html").read_text(encoding="utf-8")
            query = parse_qs(urlparse(self.path).query)
            error_code = query.get("error", [""])[0]
            rendered = (login_template
                .replace("{{ challenge_id }}", challenge_id)
                .replace("{{ captcha_code }}", captcha)
                .replace("{{ error_code }}", error_code))
            return self.send_html(rendered)
        if path == "/logout":
            return self.clear_session_and_redirect()
        if path.startswith("/api/") and not get_session_user(self):
            return self.send_json({"error": "Unauthorized"}, status=HTTPStatus.UNAUTHORIZED)
        if path == "/":
            if not get_session_user(self):
                return self.redirect("/login")
            return self.serve_file(BASE_DIR / "templates" / "index.html", "text/html; charset=utf-8")
        if path == "/module":
            if not get_session_user(self):
                return self.redirect("/login")
            return self.serve_file(BASE_DIR / "templates" / "module.html", "text/html; charset=utf-8")
        if path == "/lms":
            if not get_session_user(self):
                return self.redirect("/login")
            return self.serve_file(BASE_DIR / "templates" / "lms.html", "text/html; charset=utf-8")
        if path.startswith("/static/"):
            file_path = BASE_DIR / path.lstrip("/")
            content_type = "text/plain; charset=utf-8"
            if file_path.suffix == ".css":
                content_type = "text/css; charset=utf-8"
            elif file_path.suffix == ".js":
                content_type = "application/javascript; charset=utf-8"
            return self.serve_file(file_path, content_type)
        if path == "/api/dashboard":
            return self.send_json(compute_dashboard(fetch_cases()))
        if path == "/api/session":
            return self.send_json(get_session_user(self) or {})
        if path == "/api/masters":
            return self.send_json(master_payload_for_user(get_session_user(self)))
        if path == "/api/cases":
            return self.send_json(fetch_cases())
        if path.startswith("/api/cases/"):
            parts = path.split("/")
            case_id = parts[3]
            if len(parts) > 4 and parts[4] == "esign-pdf":
                data = build_esign_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-esign.pdf")
            if len(parts) > 4 and parts[4] == "sanction-letter":
                data = build_sanction_letter_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-sanction-letter.pdf")
            if len(parts) > 4 and parts[4] == "repayment-pdf":
                data = build_repayment_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-repayment-schedule.pdf")
            if len(parts) > 4 and parts[4] == "soa-pdf":
                data = build_soa_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-statement-of-account.pdf")
            if len(parts) > 4 and parts[4] == "collection-report":
                data = build_collection_report_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-collection-register.pdf")
            if len(parts) > 4 and parts[4] == "charge-ledger":
                data = build_charge_ledger_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-charge-ledger.pdf")
            if len(parts) > 4 and parts[4] == "voucher-register":
                data = build_voucher_register_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-voucher-register.pdf")
            if len(parts) > 4 and parts[4] == "foreclosure-statement":
                data = build_foreclosure_statement_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-foreclosure-statement.pdf")
            if len(parts) > 4 and parts[4] == "revised-schedule":
                data = build_revised_schedule_pdf(case_id)
                if data is None:
                    return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
                return self.send_pdf(data, f"{case_id}-revised-repayment-schedule.pdf")
            item = fetch_case(case_id)
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path == "/api/export":
            return self.send_csv(fetch_cases())
        return self.send_error(HTTPStatus.NOT_FOUND, "Route not found")

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/login":
            payload = parse_form_body(self)
            challenge_id = payload.get("challenge_id", "")
            challenge = LOGIN_CHALLENGES.pop(challenge_id, None)
            captcha_input = str(payload.get("captcha_input", "")).strip().upper()
            otp_input = str(payload.get("otp", "")).strip()
            if not challenge:
                return self.redirect("/login?error=2")
            if captcha_input != challenge.get("captcha", ""):
                return self.redirect("/login?error=3")
            user_id = str(payload.get("user_id", "")).strip().upper()
            user = LOGIN_USERS.get(user_id)
            if user and payload.get("password") == user.get("password") and otp_input == DEFAULT_LOGIN_OTP:
                token = secrets.token_hex(16)
                SESSIONS[token] = {
                    "user_id": user_id,
                    "user_name": user.get("user_name", user_id),
                    "user_role": user.get("user_role", ""),
                }
                return self.redirect("/module", cookie=f"rfl_session={token}; Path=/; HttpOnly")
            return self.redirect("/login?error=1")
        if path.startswith("/api/") and not get_session_user(self):
            return self.send_json({"error": "Unauthorized"}, status=HTTPStatus.UNAUTHORIZED)
        if path == "/api/masters":
            payload = parse_json_body(self)
            action = str(payload.get("approval_mode", "maker")).strip().lower()
            payload.pop("approval_mode", None)
            return self.send_json(save_loan_masters(payload, get_session_user(self) or {}, action))
        if path == "/api/leads":
            return self.send_json(create_case(parse_json_body(self)), status=HTTPStatus.CREATED)
        if path.endswith("/advance"):
            case_id = path.split("/")[3]
            target_stage = parse_json_body(self).get("target_stage")
            item = advance_case(case_id, target_stage)
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/approve"):
            case_id = path.split("/")[3]
            item = approve_case(case_id)
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/profile"):
            case_id = path.split("/")[3]
            item = save_customer_profile(case_id, parse_json_body(self))
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/stage-form"):
            case_id = path.split("/")[3]
            item = save_stage_form(case_id, parse_json_body(self))
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/reject"):
            case_id = path.split("/")[3]
            item = reject_case(case_id)
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/hold"):
            case_id = path.split("/")[3]
            item = hold_case(case_id)
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/reset"):
            case_id = path.split("/")[3]
            item = reset_case(case_id)
            if item is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(item)
        if path.endswith("/lms"):
            case_id = path.split("/")[3]
            result = save_lms_action(case_id, parse_json_body(self), get_session_user(self) or {})
            if result is None:
                return self.send_error(HTTPStatus.NOT_FOUND, "Case not found")
            return self.send_json(result)
        return self.send_error(HTTPStatus.NOT_FOUND, "Route not found")

    def serve_file(self, file_path, content_type):
        if not file_path.exists():
            return self.send_error(HTTPStatus.NOT_FOUND, "File not found")
        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def redirect(self, location, cookie=None):
        self.send_response(HTTPStatus.SEE_OTHER)
        self.send_header("Location", location)
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()

    def clear_session_and_redirect(self):
        cookie_header = self.headers.get("Cookie", "")
        for chunk in cookie_header.split(";"):
            if "=" in chunk:
                key, value = chunk.strip().split("=", 1)
                if key == "rfl_session":
                    SESSIONS.pop(value, None)
        self.send_response(HTTPStatus.SEE_OTHER)
        self.send_header("Location", "/login")
        self.send_header("Set-Cookie", "rfl_session=; Path=/; Max-Age=0")
        self.end_headers()

    def send_json(self, payload, status=HTTPStatus.OK):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_html(self, html, status=HTTPStatus.OK):
        data = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_csv(self, cases):
        rows = [["Case ID", "Applicant", "Product", "Amount", "Stage", "Eligibility", "RM"]]
        for item in cases:
            rows.append([item["case_code"], item["applicant"], item["product"], item["amount"], item["workflow_stage"], item["eligibility"], item["rm"]])
        data = "\n".join(",".join(str(value) for value in row) for row in rows).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", "attachment; filename=nbfc-los-mis.csv")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_pdf(self, data, filename):
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        return


def run():
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"NBFC LOS running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
