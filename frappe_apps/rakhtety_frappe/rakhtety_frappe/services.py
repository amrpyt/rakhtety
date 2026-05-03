import frappe
from frappe import _

from rakhtety_frappe.constants import (
    DEVICE_LICENSE,
EXCAVATION_PERMIT,
    RAKHTETY_ADMIN_ROLES,
    STEP_STATUS_COMPLETED,
    WORKFLOW_STATUS_COMPLETED,
    WORKFLOW_STATUS_IN_PROGRESS,
)

TYPE_TO_UI = {
    DEVICE_LICENSE: "DEVICE_LICENSE",
    EXCAVATION_PERMIT: "EXCAVATION_PERMIT",
}

TYPE_FROM_UI = {value: key for key, value in TYPE_TO_UI.items()}

STATUS_TO_UI = {
    "Not Started": "pending",
    "In Progress": "in_progress",
    "Completed": "completed",
    "pending": "pending",
    "in_progress": "in_progress",
    "completed": "completed",
    "blocked": "blocked",
}

STATUS_FROM_UI = {
    "pending": "Not Started",
    "in_progress": "In Progress",
    "completed": "Completed",
    "blocked": "In Progress",
}


DEVICE_LICENSE_STEPS = [
    ("Eligibility Statement", 1, 1, 1000, 500),
    ("Submit Decade Collective", 2, 0, 2000, 700),
    ("File Submission", 3, 0, 1500, 600),
    ("Pay Fee", 4, 0, 3000, 1000),
    ("Receive License", 5, 0, 500, 500),
]


def current_user_has_admin_scope():
    roles = set(frappe.get_roles(frappe.session.user))
    return bool(roles.intersection(RAKHTETY_ADMIN_ROLES))


def get_employee_for_user(user=None):
    user = user or frappe.session.user
    return frappe.db.get_value("Rakhtety Employee", {"user": user}, "name")


def assert_employee_can_access_employee(employee):
    if current_user_has_admin_scope():
        return

    current_employee = get_employee_for_user()
    if not current_employee or current_employee != employee:
        frappe.throw(_("Not permitted for this employee"), frappe.PermissionError)


def assert_user_can_access_workflow(workflow_name):
    if current_user_has_admin_scope():
        return

    current_employee = get_employee_for_user()
    if not current_employee:
        frappe.throw(_("No Rakhtety employee is linked to this user"), frappe.PermissionError)

    workflow = frappe.get_doc("Rakhtety Workflow", workflow_name)
    if workflow.assigned_to == current_employee:
        return

    assigned_step = frappe.db.exists(
        "Rakhtety Workflow Step",
        {"workflow": workflow_name, "assigned_to": current_employee},
    )
    if not assigned_step:
        frappe.throw(_("Not permitted for this workflow"), frappe.PermissionError)


def assert_user_can_access_client(client):
    if current_user_has_admin_scope():
        return

    current_employee = get_employee_for_user()
    if not current_employee:
        frappe.throw(_("No Rakhtety employee is linked to this user"), frappe.PermissionError)

    workflows = frappe.get_all("Rakhtety Workflow", filters={"client": client}, pluck="name")
    for workflow_name in workflows:
        if frappe.db.get_value("Rakhtety Workflow", workflow_name, "assigned_to") == current_employee:
            return
        if frappe.db.exists("Rakhtety Workflow Step", {"workflow": workflow_name, "assigned_to": current_employee}):
            return

    frappe.throw(_("Not permitted for this client"), frappe.PermissionError)


def create_device_license_workflow(client, assigned_to=None):
    title = f"{client} - {DEVICE_LICENSE}"
    if frappe.db.exists("Rakhtety Workflow", title):
        return frappe.get_doc("Rakhtety Workflow", title)

    workflow = frappe.get_doc(
        {
            "doctype": "Rakhtety Workflow",
            "title": title,
            "client": client,
            "workflow_type": DEVICE_LICENSE,
            "status": WORKFLOW_STATUS_IN_PROGRESS,
            "assigned_to": assigned_to,
        }
    ).insert()

    for step_name, step_order, requires_document, government_fees, office_profit in DEVICE_LICENSE_STEPS:
        frappe.get_doc(
            {
                "doctype": "Rakhtety Workflow Step",
                "title": f"{client} - {step_name}",
                "workflow": workflow.name,
                "step_order": step_order,
                "step_name_ar": step_name,
                "status": "pending",
                "assigned_to": assigned_to,
                "requires_document": requires_document,
                "required_document_uploaded": 0,
                "government_fees": government_fees,
                "office_profit": office_profit,
            }
        ).insert()

    return workflow


def get_client_workflow_data(client):
    assert_user_can_access_client(client)
    workflows = frappe.get_all(
        "Rakhtety Workflow",
        filters={"client": client},
        fields=["name", "workflow_type", "status", "assigned_to"],
        order_by="creation asc",
    )
    for workflow in workflows:
        workflow["steps"] = frappe.get_all(
            "Rakhtety Workflow Step",
            filters={"workflow": workflow["name"]},
            fields=[
                "name",
                "step_order",
                "step_name_ar",
                "status",
                "assigned_to",
                "requires_document",
                "required_document_uploaded",
                "government_fees",
                "office_profit",
            ],
            order_by="step_order asc",
        )

    return {"client": frappe.get_doc("Rakhtety Client", client).as_dict(), "workflows": workflows}


def upload_required_document(step, file_url="/private/files/spike-test.pdf", document_type="Required Document"):
    step_doc = frappe.get_doc("Rakhtety Workflow Step", step)
    assert_user_can_access_workflow(step_doc.workflow)

    title = f"{step_doc.name} - {document_type}"
    if frappe.db.exists("Rakhtety Document", title):
        doc = frappe.get_doc("Rakhtety Document", title)
    else:
        doc = frappe.get_doc(
            {
                "doctype": "Rakhtety Document",
                "title": title,
                "workflow_step": step_doc.name,
                "document_type": document_type,
                "file_url": file_url,
                "uploaded_by_employee": step_doc.assigned_to or get_employee_for_user(),
            }
        ).insert()

    step_doc.required_document_uploaded = 1
    step_doc.save()
    return doc.name


def update_step_status(step, status):
    step_doc = frappe.get_doc("Rakhtety Workflow Step", step)
    assert_user_can_access_workflow(step_doc.workflow)

    step_doc.status = status
    step_doc.save()

    workflow = frappe.get_doc("Rakhtety Workflow", step_doc.workflow)
    step_statuses = frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow.name}, pluck="status")
    if step_statuses and all(step_status == STEP_STATUS_COMPLETED for step_status in step_statuses):
        workflow.status = WORKFLOW_STATUS_COMPLETED
        workflow.save()

    return {"step": step_doc.name, "status": step_doc.status, "workflow_status": workflow.status}


def start_excavation(client):
    assert_user_can_access_client(client)
    device = frappe.get_all(
        "Rakhtety Workflow",
        filters={"client": client, "workflow_type": DEVICE_LICENSE},
        fields=["name", "status", "assigned_to"],
        limit=1,
    )
    if not device or device[0]["status"] != WORKFLOW_STATUS_COMPLETED:
        frappe.throw(_("Excavation Permit is locked until Device License is completed"))

    title = f"{client} - {EXCAVATION_PERMIT}"
    if frappe.db.exists("Rakhtety Workflow", title):
        return title

    doc = frappe.get_doc(
        {
            "doctype": "Rakhtety Workflow",
            "title": title,
            "client": client,
            "workflow_type": EXCAVATION_PERMIT,
            "status": WORKFLOW_STATUS_IN_PROGRESS,
            "assigned_to": device[0].get("assigned_to"),
        }
    ).insert()
    return doc.name


def get_assigned_work(employee=None):
    employee = employee or get_employee_for_user()
    if not employee:
        frappe.throw(_("Employee is required"))

    assert_employee_can_access_employee(employee)
    return frappe.get_all(
        "Rakhtety Workflow Step",
        filters={"assigned_to": employee},
        fields=["name", "workflow", "status", "assigned_to"],
        order_by="step_order asc",
    )


def _iso(value):
    return value.isoformat() if hasattr(value, "isoformat") else str(value or "")


def _optional_amount(value):
    if value in (None, ""):
        return None

    try:
        amount = float(value)
    except (TypeError, ValueError):
        frappe.throw(_("Invalid accounting amount"))

    if amount < 0:
        frappe.throw(_("Accounting amount cannot be negative"))

    return amount


def _profile(employee_name):
    if not employee_name:
        return None
    user = frappe.db.get_value("Rakhtety Employee", employee_name, "user")
    return {
        "id": user or employee_name,
        "email": user,
        "role": "employee",
        "full_name": employee_name,
        "phone": None,
        "created_at": "",
        "updated_at": "",
    }


def _client_dto(doc):
    return {
        "id": doc.name,
        "name": doc.title,
        "phone": doc.phone,
        "city": doc.city,
        "district": doc.district,
        "neighborhood": None,
        "parcel_number": doc.parcel_number,
        "created_by": doc.owner,
        "created_at": _iso(doc.creation),
        "updated_at": _iso(doc.modified),
        "area": None,
        "plot_number": doc.parcel_number,
        "notes": None,
    }


def _workflow_dto(doc, include_steps=False):
    steps = []
    if include_steps:
        steps = [
            _step_dto(frappe.get_doc("Rakhtety Workflow Step", step.name))
            for step in frappe.get_all(
                "Rakhtety Workflow Step",
                filters={"workflow": doc.name},
                fields=["name"],
                order_by="step_order asc",
            )
        ]

    return {
        "id": doc.name,
        "client_id": doc.client,
        "type": TYPE_TO_UI.get(doc.workflow_type, doc.workflow_type),
        "status": STATUS_TO_UI.get(doc.status, doc.status),
        "assigned_to": doc.assigned_to,
        "created_at": _iso(doc.creation),
        "updated_at": _iso(doc.modified),
        "steps": steps,
        "assigned_employee": {"full_name": doc.assigned_to} if doc.assigned_to else None,
    }


def _step_dto(doc):
    return {
        "id": doc.name,
        "workflow_id": doc.workflow,
        "step_order": doc.step_order,
        "name": doc.step_name_ar,
        "status": STATUS_TO_UI.get(doc.status, doc.status),
        "assigned_to": doc.assigned_to,
        "completed_at": None,
        "fees": float(doc.government_fees or 0),
        "profit": float(doc.office_profit or 0),
        "created_at": _iso(doc.creation),
        "updated_at": _iso(doc.modified),
        "assigned_employee": {"full_name": doc.assigned_to} if doc.assigned_to else None,
    }


def list_clients(search=None):
    filters = {}
    or_filters = None
    if search:
        or_filters = [
            ["title", "like", f"%{search}%"],
            ["phone", "like", f"%{search}%"],
            ["parcel_number", "like", f"%{search}%"],
        ]
    rows = frappe.get_all("Rakhtety Client", filters=filters, or_filters=or_filters, fields=["name"], limit=100)
    return [_client_dto(frappe.get_doc("Rakhtety Client", row.name)) for row in rows]


def create_client(data):
    title = data.get("name") or data.get("title")
    if not title:
        frappe.throw(_("Client name is required"))
    doc = frappe.get_doc(
        {
            "doctype": "Rakhtety Client",
            "title": title,
            "phone": data.get("phone"),
            "city": data.get("city"),
            "district": data.get("district") or data.get("neighborhood"),
            "parcel_number": data.get("parcel_number"),
        }
    ).insert()
    return _client_dto(doc)


def get_client_detail(client):
    assert_user_can_access_client(client)
    doc = frappe.get_doc("Rakhtety Client", client)
    dto = _client_dto(doc)
    dto["workflows"] = list_client_workflows(client)["workflows"]
    return dto


def list_client_workflows(client):
    assert_user_can_access_client(client)
    workflows = [
        _workflow_dto(frappe.get_doc("Rakhtety Workflow", row.name), include_steps=True)
        for row in frappe.get_all("Rakhtety Workflow", filters={"client": client}, fields=["name"], order_by="creation asc")
    ]
    device = next((workflow for workflow in workflows if workflow["type"] == "DEVICE_LICENSE"), None)
    excavation = next((workflow for workflow in workflows if workflow["type"] == "EXCAVATION_PERMIT"), None)
    blocked = not device or device["status"] != "completed"
    return {
        "workflows": workflows,
        "deviceLicense": device,
        "excavationPermit": excavation,
        "deviceLicenseCompleted": bool(device and device["status"] == "completed"),
        "excavationPermitBlocked": blocked,
        "excavationPermitBlockedReason": _("Excavation Permit is locked until Device License is completed") if blocked else None,
    }


def create_workflow(client, type):
    workflow_type = TYPE_FROM_UI.get(type, type)
    if workflow_type == DEVICE_LICENSE:
        return _workflow_dto(create_device_license_workflow(client, get_employee_for_user()), include_steps=True)
    if workflow_type == EXCAVATION_PERMIT:
        return _workflow_dto(frappe.get_doc("Rakhtety Workflow", start_excavation(client)), include_steps=True)
    frappe.throw(_("Invalid workflow type"))


def _workflow_debt(workflow):
    steps = frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow}, fields=["government_fees", "office_profit"])
    return sum(float(step.government_fees or 0) + float(step.office_profit or 0) for step in steps)


def list_workflow_overview():
    items = []
    for row in frappe.get_all("Rakhtety Workflow", fields=["name"], order_by="modified desc", limit=100):
        workflow = frappe.get_doc("Rakhtety Workflow", row.name)
        client = frappe.get_doc("Rakhtety Client", workflow.client)
        steps = [_step_dto(frappe.get_doc("Rakhtety Workflow Step", step.name)) for step in frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow.name}, fields=["name"], order_by="step_order asc")]
        current = next((step for step in steps if step["status"] in ["in_progress", "blocked", "pending"]), steps[-1] if steps else None)
        items.append({
            "workflow_id": workflow.name,
            "client_id": client.name,
            "client_name": client.title,
            "client_phone": client.phone,
            "parcel_number": client.parcel_number,
            "city": client.city,
            "workflow_type": TYPE_TO_UI.get(workflow.workflow_type, workflow.workflow_type),
            "workflow_status": STATUS_TO_UI.get(workflow.status, workflow.status),
            "current_step_name": current["name"] if current else "لا توجد خطوات",
            "current_step_status": current["status"] if current else None,
            "assigned_employee_name": current["assigned_to"] if current else workflow.assigned_to,
            "updated_at": _iso(workflow.modified),
            "days_stuck": 0,
            "is_stuck": False,
            "outstanding_debt": _workflow_debt(workflow.name),
        })
    return items


def dashboard_summary():
    workflows = [_workflow_dto(frappe.get_doc("Rakhtety Workflow", row.name)) for row in frappe.get_all("Rakhtety Workflow", fields=["name"], order_by="modified desc")]
    return {
        "active_files": len([workflow for workflow in workflows if workflow["status"] != "completed"]),
        "completed_this_month": len([workflow for workflow in workflows if workflow["status"] == "completed"]),
        "pending_debt": sum(_workflow_debt(workflow["id"]) for workflow in workflows),
        "bottleneck_count": 0,
        "bottlenecks": [],
        "employee_workloads": [],
        "recent_workflows": [
            {
                "workflow_id": workflow["id"],
                "client_name": frappe.db.get_value("Rakhtety Client", workflow["client_id"], "title") or workflow["client_id"],
                "workflow_type": workflow["type"],
                "status": workflow["status"],
                "updated_at": workflow["updated_at"],
            }
            for workflow in workflows[:5]
        ],
    }


def list_employees():
    employees = []
    for row in frappe.get_all("Rakhtety Employee", fields=["name"], order_by="modified desc"):
        doc = frappe.get_doc("Rakhtety Employee", row.name)
        employees.append({
            "id": doc.name,
            "user_id": doc.user or doc.name,
            "position": getattr(doc, "position", None) or doc.role_label,
            "is_active": True,
            "created_at": _iso(doc.creation),
            "updated_at": _iso(doc.modified),
            "profile": _profile(doc.name),
        })
    return employees


def upload_workflow_document(data):
    document_name = upload_required_document(
        data.get("workflow_step_id"),
        file_url=data.get("file_url") or "/private/files/uploaded-from-next.pdf",
        document_type=data.get("document_type") or "Required Document",
    )
    doc = frappe.get_doc("Rakhtety Document", document_name)
    step = frappe.get_doc("Rakhtety Workflow Step", doc.workflow_step)
    government_fees = _optional_amount(data.get("government_fees"))
    office_profit = _optional_amount(data.get("office_profit"))
    if government_fees is not None:
        step.government_fees = government_fees
    if office_profit is not None:
        step.office_profit = office_profit
    if government_fees is not None or office_profit is not None:
        step.save()

    return {
        "id": doc.name,
        "workflow_id": step.workflow,
        "workflow_step_id": step.name,
        "document_type": doc.document_type,
        "label": data.get("label") or doc.document_type,
        "file_name": data.get("file_name") or doc.file_url.split("/")[-1],
        "storage_path": doc.file_url,
        "mime_type": data.get("mime_type"),
        "file_size": data.get("file_size"),
        "uploaded_by": doc.uploaded_by_employee,
        "uploaded_at": _iso(doc.creation),
    }


def workflow_financial_summary(workflow):
    steps = [_step_dto(frappe.get_doc("Rakhtety Workflow Step", row.name)) for row in frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow}, fields=["name"])]
    total_fees = sum(step["fees"] for step in steps)
    planned_profit = sum(step["profit"] for step in steps)
    return {
        "workflow_id": workflow,
        "total_cost": total_fees + planned_profit,
        "total_fees": total_fees,
        "planned_profit": planned_profit,
        "total_paid": 0,
        "realized_profit": 0,
        "outstanding_debt": total_fees + planned_profit,
    }


def client_report(client):
    detail = get_client_detail(client)
    return {"client": detail, "workflows": detail.get("workflows", [])}
