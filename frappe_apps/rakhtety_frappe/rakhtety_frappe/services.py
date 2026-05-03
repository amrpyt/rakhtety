import frappe
from frappe import _
from frappe.utils import date_diff, get_first_day, getdate, now_datetime

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

ROLE_TO_FRAPPE = {
    "admin": ("Admin", "Rakhtety Admin"),
    "manager": ("Manager", "Rakhtety Manager"),
    "employee": ("Employee", "Rakhtety Employee"),
}

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

EXCAVATION_PERMIT_STEPS = [
    ("تقديم واستلام شهادة الإشراف", 1, 1, 0, 0),
    ("تقديم واستلام التأمينات", 2, 1, 0, 0),
    ("التقديم على العداد الإنشائي", 3, 1, 0, 0),
    ("تقديم ودفع واستلام تصريح الحفر", 4, 1, 0, 0),
    ("تصريح التعدين", 5, 1, 0, 0),
]

STUCK_AFTER_DAYS = 3


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


def assert_user_can_update_step(step_doc):
    if current_user_has_admin_scope():
        return

    current_employee = get_employee_for_user()
    if not current_employee:
        frappe.throw(_("No Rakhtety employee is linked to this user"), frappe.PermissionError)

    workflow_assignee = frappe.db.get_value("Rakhtety Workflow", step_doc.workflow, "assigned_to")
    if step_doc.assigned_to == current_employee or workflow_assignee == current_employee:
        return

    frappe.throw(_("Not permitted for this workflow step"), frappe.PermissionError)


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


def create_workflow_with_steps(client, workflow_type, step_templates, assigned_to=None):
    title = f"{client} - {workflow_type}"
    if frappe.db.exists("Rakhtety Workflow", title):
        workflow = frappe.get_doc("Rakhtety Workflow", title)
        ensure_workflow_steps(workflow, step_templates, assigned_to)
        return workflow

    workflow = frappe.get_doc(
        {
            "doctype": "Rakhtety Workflow",
            "title": title,
            "client": client,
            "workflow_type": workflow_type,
            "status": WORKFLOW_STATUS_IN_PROGRESS,
            "assigned_to": assigned_to,
        }
    ).insert()

    for step_name, step_order, requires_document, government_fees, office_profit in step_templates:
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


def ensure_workflow_steps(workflow, step_templates, assigned_to=None):
    existing_orders = set(
        frappe.get_all(
            "Rakhtety Workflow Step",
            filters={"workflow": workflow.name},
            pluck="step_order",
        )
    )
    for step_name, step_order, requires_document, government_fees, office_profit in step_templates:
        if step_order in existing_orders:
            continue
        frappe.get_doc(
            {
                "doctype": "Rakhtety Workflow Step",
                "title": f"{workflow.client} - {step_name}",
                "workflow": workflow.name,
                "step_order": step_order,
                "step_name_ar": step_name,
                "status": "pending",
                "assigned_to": assigned_to or workflow.assigned_to,
                "requires_document": requires_document,
                "required_document_uploaded": 0,
                "government_fees": government_fees,
                "office_profit": office_profit,
            }
        ).insert()


def create_device_license_workflow(client, assigned_to=None):
    title = f"{client} - {DEVICE_LICENSE}"
    if frappe.db.exists("Rakhtety Workflow", title):
        return frappe.get_doc("Rakhtety Workflow", title)

    return create_workflow_with_steps(client, DEVICE_LICENSE, DEVICE_LICENSE_STEPS, assigned_to)


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
    assert_user_can_update_step(step_doc)

    if status == STEP_STATUS_COMPLETED and step_doc.requires_document and not step_doc.required_document_uploaded:
        frappe.throw(_("Required document must be uploaded before completing this step"))

    if status in ("in_progress", STEP_STATUS_COMPLETED):
        previous_open_step = frappe.db.exists(
            "Rakhtety Workflow Step",
            {
                "workflow": step_doc.workflow,
                "step_order": ["<", step_doc.step_order],
                "status": ["!=", STEP_STATUS_COMPLETED],
            },
        )
        if previous_open_step:
            frappe.throw(_("Previous workflow steps must be completed first"))

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
        workflow = frappe.get_doc("Rakhtety Workflow", title)
        ensure_workflow_steps(workflow, EXCAVATION_PERMIT_STEPS, device[0].get("assigned_to"))
        return workflow.name

    workflow = create_workflow_with_steps(
        client,
        EXCAVATION_PERMIT,
        EXCAVATION_PERMIT_STEPS,
        device[0].get("assigned_to"),
    )
    return workflow.name


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
    full_name = frappe.db.get_value("Rakhtety Employee", employee_name, "title") or employee_name
    return {
        "id": user or employee_name,
        "email": user,
        "role": "employee",
        "full_name": full_name,
        "phone": None,
        "created_at": "",
        "updated_at": "",
    }


def _client_dto(doc):
    dto = {
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
    dto["intake_documents"] = _client_intake_documents(doc.name)
    return dto


def _client_intake_documents(client):
    docs = []
    for row in frappe.get_all(
        "Rakhtety Document",
        filters={"client": client, "workflow_step": ["is", "not set"]},
        fields=["name", "document_type", "file_url", "uploaded_by_employee", "creation"],
        order_by="creation asc",
    ):
        file_name = (row.file_url or "").split("/")[-1]
        docs.append({
            "id": row.name,
            "client_id": client,
            "document_type": row.document_type,
            "label": row.document_type,
            "file_name": file_name,
            "storage_path": row.file_url,
            "mime_type": None,
            "file_size": None,
            "uploaded_by": row.uploaded_by_employee,
            "uploaded_at": _iso(row.creation),
        })
    return docs


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
    if not current_user_has_admin_scope():
        current_employee = get_employee_for_user()
        if not current_employee:
            frappe.throw(_("No Rakhtety employee is linked to this user"), frappe.PermissionError)
        workflow_clients = frappe.get_all(
            "Rakhtety Workflow",
            filters={"assigned_to": current_employee},
            pluck="client",
        )
        step_workflows = frappe.get_all(
            "Rakhtety Workflow Step",
            filters={"assigned_to": current_employee},
            pluck="workflow",
        )
        if step_workflows:
            workflow_clients.extend(
                frappe.get_all("Rakhtety Workflow", filters={"name": ["in", step_workflows]}, pluck="client")
            )
        filters["name"] = ["in", list(set(workflow_clients))]

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
    create_device_license_workflow(doc.name, get_employee_for_user())
    return _client_dto(doc)


def get_client_detail(client):
    assert_user_can_access_client(client)
    doc = frappe.get_doc("Rakhtety Client", client)
    dto = _client_dto(doc)
    dto["workflows"] = list_client_workflows(client)["workflows"]
    return dto


def update_client(client, data):
    assert_user_can_access_client(client)
    doc = frappe.get_doc("Rakhtety Client", client)
    if data.get("name"):
        doc.title = data.get("name")
    for source, target in (
        ("phone", "phone"),
        ("city", "city"),
        ("district", "district"),
        ("neighborhood", "district"),
        ("parcel_number", "parcel_number"),
    ):
        if source in data:
            setattr(doc, target, data.get(source))
    doc.save()
    return _client_dto(doc)


def delete_client(client):
    if not current_user_has_admin_scope():
        frappe.throw(_("Missing permission"), frappe.PermissionError)
    frappe.delete_doc("Rakhtety Client", client)
    return {"ok": True}


def list_client_workflows(client):
    assert_user_can_access_client(client)
    for workflow in frappe.get_all("Rakhtety Workflow", filters={"client": client, "workflow_type": EXCAVATION_PERMIT}, fields=["name"]):
        ensure_workflow_steps(frappe.get_doc("Rakhtety Workflow", workflow.name), EXCAVATION_PERMIT_STEPS)
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
    summary = workflow_financial_summary(workflow)
    return summary["outstanding_debt"]


def _workflow_total_cost(workflow):
    steps = frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow}, fields=["government_fees", "office_profit"])
    return sum(float(step.government_fees or 0) + float(step.office_profit or 0) for step in steps)


def _workflow_payments(workflow):
    if not frappe.db.exists("DocType", "Rakhtety Financial Event"):
        return 0
    rows = frappe.get_all(
        "Rakhtety Financial Event",
        filters={"workflow": workflow, "event_type": "payment"},
        fields=["amount"],
    )
    return sum(float(row.amount or 0) for row in rows)


def _accessible_workflow_names():
    if current_user_has_admin_scope():
        return frappe.get_all("Rakhtety Workflow", pluck="name")

    current_employee = get_employee_for_user()
    if not current_employee:
        frappe.throw(_("No Rakhtety employee is linked to this user"), frappe.PermissionError)

    names = set(frappe.get_all("Rakhtety Workflow", filters={"assigned_to": current_employee}, pluck="name"))
    names.update(frappe.get_all("Rakhtety Workflow Step", filters={"assigned_to": current_employee}, pluck="workflow"))
    return list(names)


def _days_since(value):
    return max(date_diff(getdate(now_datetime()), getdate(value)), 0)


def list_workflow_overview():
    items = []
    workflow_names = _accessible_workflow_names()
    if not workflow_names:
        return items

    for row in frappe.get_all("Rakhtety Workflow", filters={"name": ["in", workflow_names]}, fields=["name"], order_by="modified desc", limit=100):
        workflow = frappe.get_doc("Rakhtety Workflow", row.name)
        if workflow.workflow_type == EXCAVATION_PERMIT:
            ensure_workflow_steps(workflow, EXCAVATION_PERMIT_STEPS)
        client = frappe.get_doc("Rakhtety Client", workflow.client)
        steps = [_step_dto(frappe.get_doc("Rakhtety Workflow Step", step.name)) for step in frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow.name}, fields=["name"], order_by="step_order asc")]
        current = next((step for step in steps if step["status"] in ["in_progress", "blocked", "pending"]), steps[-1] if steps else None)
        current_modified = workflow.modified
        if current:
            current_modified = frappe.db.get_value("Rakhtety Workflow Step", current["id"], "modified") or workflow.modified
        days_stuck = _days_since(current_modified) if workflow.status != WORKFLOW_STATUS_COMPLETED else 0
        items.append({
            "workflow_id": workflow.name,
            "current_step_id": current["id"] if current else None,
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
            "days_stuck": days_stuck,
            "is_stuck": days_stuck >= STUCK_AFTER_DAYS,
            "outstanding_debt": _workflow_debt(workflow.name),
        })
    return items


def dashboard_summary():
    workflow_names = _accessible_workflow_names()
    workflows = [
        _workflow_dto(frappe.get_doc("Rakhtety Workflow", row.name))
        for row in frappe.get_all(
            "Rakhtety Workflow",
            filters={"name": ["in", workflow_names]} if workflow_names else {"name": ["in", []]},
            fields=["name"],
            order_by="modified desc",
        )
    ]
    overview = list_workflow_overview()
    bottlenecks = [
        {
            "workflow_id": item["workflow_id"],
            "workflow_step_id": item.get("current_step_id"),
            "client_id": item["client_id"],
            "client_name": item["client_name"],
            "workflow_type": item["workflow_type"],
            "step_name": item["current_step_name"],
            "step_status": item["current_step_status"],
            "assigned_to": item["assigned_employee_name"],
            "assigned_employee_name": item["assigned_employee_name"],
            "stuck_days": item["days_stuck"],
            "updated_at": item["updated_at"],
        }
        for item in overview
        if item["is_stuck"]
    ]
    employee_workloads = _employee_workloads(workflow_names)
    month_start = get_first_day(getdate(now_datetime()))
    return {
        "active_files": len([workflow for workflow in workflows if workflow["status"] != "completed"]),
        "completed_this_month": len([
            workflow
            for workflow in workflows
            if workflow["status"] == "completed" and getdate(workflow["updated_at"]) >= month_start
        ]),
        "pending_debt": sum(_workflow_debt(workflow["id"]) for workflow in workflows),
        "total_paid": sum(_workflow_payments(workflow["id"]) for workflow in workflows),
        "realized_profit": sum(workflow_financial_summary(workflow["id"])["realized_profit"] for workflow in workflows),
        "bottleneck_count": len(bottlenecks),
        "bottlenecks": bottlenecks,
        "employee_workloads": employee_workloads,
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


def _employee_workloads(workflow_names):
    if not workflow_names:
        return []

    rows = []
    employees = frappe.get_all("Rakhtety Employee", fields=["name", "user", "title"])
    for employee in employees:
        active_steps = frappe.get_all(
            "Rakhtety Workflow Step",
            filters={
                "workflow": ["in", workflow_names],
                "assigned_to": employee.name,
                "status": ["!=", STEP_STATUS_COMPLETED],
            },
            fields=["workflow", "modified"],
        )
        if not active_steps:
            continue
        active_workflows = len(set(step.workflow for step in active_steps))
        bottlenecks = len([step for step in active_steps if _days_since(step.modified) >= STUCK_AFTER_DAYS])
        rows.append({
            "employee_id": employee.name,
            "user_id": employee.user or employee.name,
            "full_name": employee.title or employee.name,
            "active_workflows": active_workflows,
            "active_steps": len(active_steps),
            "bottlenecks": bottlenecks,
        })
    return rows


def list_employees():
    if not current_user_has_admin_scope():
        current_employee = get_employee_for_user()
        if not current_employee:
            frappe.throw(_("No Rakhtety employee is linked to this user"), frappe.PermissionError)
        rows = frappe.get_all("Rakhtety Employee", filters={"name": current_employee}, fields=["name"])
    else:
        rows = frappe.get_all("Rakhtety Employee", fields=["name"], order_by="modified desc")

    employees = []
    for row in rows:
        doc = frappe.get_doc("Rakhtety Employee", row.name)
        employees.append({
            "id": doc.name,
            "user_id": doc.user or doc.name,
            "position": getattr(doc, "position", None) or doc.role_label,
            "is_active": bool(getattr(doc, "is_active", 1)),
            "created_at": _iso(doc.creation),
            "updated_at": _iso(doc.modified),
            "profile": _profile(doc.name),
        })
    return employees


def _employee_dto(employee_name):
    doc = frappe.get_doc("Rakhtety Employee", employee_name)
    return {
        "id": doc.name,
        "user_id": doc.user or doc.name,
        "position": getattr(doc, "position", None) or doc.role_label,
        "is_active": bool(getattr(doc, "is_active", 1)),
        "created_at": _iso(doc.creation),
        "updated_at": _iso(doc.modified),
        "profile": _profile(doc.name),
    }


def _role_details(role):
    if role not in ROLE_TO_FRAPPE:
        frappe.throw(_("Invalid employee role"))
    return ROLE_TO_FRAPPE[role]


def _set_user_role(user, role):
    _, frappe_role = _role_details(role)
    user_doc = frappe.get_doc("User", user)
    existing = {row.role for row in user_doc.roles}
    for _, managed_role in ROLE_TO_FRAPPE.values():
        if managed_role in existing and managed_role != frappe_role:
            user_doc.remove_roles(managed_role)
    if frappe_role not in existing:
        user_doc.add_roles(frappe_role)


def create_employee(data):
    if not current_user_has_admin_scope():
        frappe.throw(_("Missing permission"), frappe.PermissionError)

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    if not full_name or not email or not password:
        frappe.throw(_("Employee name, email, and password are required"))

    role_label, frappe_role = _role_details(data.get("role") or "employee")
    if not frappe.db.exists("User", email):
        user_doc = frappe.get_doc(
            {
                "doctype": "User",
                "email": email,
                "first_name": full_name,
                "full_name": full_name,
                "enabled": 1,
                "send_welcome_email": 0,
                "new_password": password,
                "roles": [{"role": frappe_role}],
            }
        ).insert(ignore_permissions=True)
    else:
        user_doc = frappe.get_doc("User", email)
        user_doc.enabled = 1
        user_doc.first_name = full_name
        user_doc.full_name = full_name
        user_doc.save(ignore_permissions=True)
        _set_user_role(email, data.get("role") or "employee")

    employee = frappe.get_doc(
        {
            "doctype": "Rakhtety Employee",
            "title": full_name,
            "user": user_doc.name,
            "position": data.get("position"),
            "role_label": role_label,
            "is_active": 1,
        }
    ).insert(ignore_permissions=True)
    return _employee_dto(employee.name)


def update_employee(employee, data):
    if not current_user_has_admin_scope():
        frappe.throw(_("Missing permission"), frappe.PermissionError)

    doc = frappe.get_doc("Rakhtety Employee", employee)
    if data.get("full_name"):
        doc.title = data.get("full_name")
    if "position" in data:
        doc.position = data.get("position")
    if "role" in data and data.get("role"):
        role_label, _ = _role_details(data.get("role"))
        doc.role_label = role_label
        if doc.user:
            _set_user_role(doc.user, data.get("role"))
    if "is_active" in data:
        doc.is_active = 1 if data.get("is_active") else 0
        if doc.user:
            user_doc = frappe.get_doc("User", doc.user)
            user_doc.enabled = doc.is_active
            user_doc.save(ignore_permissions=True)

    doc.save(ignore_permissions=True)
    return _employee_dto(doc.name)


def delete_employee(employee):
    return update_employee(employee, {"is_active": False})


def upload_workflow_document(data):
    file_url = data.get("file_url")
    if not file_url:
        frappe.throw(_("Uploaded file URL is required"))

    document_name = upload_required_document(
        data.get("workflow_step_id"),
        file_url=file_url,
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


def _workflow_document_dto(doc):
    step = frappe.get_doc("Rakhtety Workflow Step", doc.workflow_step)
    return {
        "id": doc.name,
        "workflow_id": step.workflow,
        "workflow_step_id": step.name,
        "document_type": doc.document_type,
        "label": doc.document_type,
        "file_name": doc.file_url.split("/")[-1] if doc.file_url else doc.name,
        "storage_path": doc.file_url,
        "mime_type": None,
        "file_size": None,
        "uploaded_by": doc.uploaded_by_employee,
        "uploaded_at": _iso(doc.creation),
    }


def get_step_document_status(step):
    step_doc = frappe.get_doc("Rakhtety Workflow Step", step)
    assert_user_can_access_workflow(step_doc.workflow)
    documents = [
        _workflow_document_dto(frappe.get_doc("Rakhtety Document", row.name))
        for row in frappe.get_all(
            "Rakhtety Document",
            filters={"workflow_step": step_doc.name},
            fields=["name"],
            order_by="creation asc",
        )
    ]
    requirements = []
    if step_doc.requires_document:
        requirements.append({
            "id": f"{step_doc.name}-required-document",
            "step_name": step_doc.step_name_ar,
            "document_type": "required_document",
            "label": step_doc.step_name_ar or "Required Document",
            "is_required": True,
            "is_active": True,
            "created_at": _iso(step_doc.creation),
            "updated_at": _iso(step_doc.modified),
        })
    missing = requirements if step_doc.requires_document and not documents else []
    return {
        "documents": documents,
        "requirements": requirements,
        "missingRequired": missing,
        "canComplete": not missing,
    }


def get_workflow_document(document):
    doc = frappe.get_doc("Rakhtety Document", document)
    if not doc.workflow_step:
        frappe.throw(_("Document is not linked to a workflow step"), frappe.PermissionError)
    step_doc = frappe.get_doc("Rakhtety Workflow Step", doc.workflow_step)
    assert_user_can_access_workflow(step_doc.workflow)
    return _workflow_document_dto(doc)


def upload_client_intake_document(data):
    client = data.get("client_id")
    file_url = data.get("file_url")
    document_type = data.get("document_type") or "Intake Document"
    if not client or not file_url:
        frappe.throw(_("Client and uploaded file URL are required"))

    assert_user_can_access_client(client)
    title = f"{client} - {document_type}"
    if frappe.db.exists("Rakhtety Document", title):
        doc = frappe.get_doc("Rakhtety Document", title)
        doc.file_url = file_url
        doc.uploaded_by_employee = get_employee_for_user()
        doc.save()
    else:
        doc = frappe.get_doc(
            {
                "doctype": "Rakhtety Document",
                "title": title,
                "client": client,
                "document_type": document_type,
                "file_url": file_url,
                "uploaded_by_employee": get_employee_for_user(),
            }
        ).insert()

    return {
        "id": doc.name,
        "client_id": client,
        "document_type": doc.document_type,
        "label": data.get("label") or doc.document_type,
        "file_name": data.get("file_name") or doc.file_url.split("/")[-1],
        "storage_path": doc.file_url,
        "mime_type": data.get("mime_type"),
        "file_size": data.get("file_size"),
        "uploaded_by": doc.uploaded_by_employee,
        "uploaded_at": _iso(doc.creation),
    }


def get_client_intake_document(client, document):
    assert_user_can_access_client(client)
    doc = frappe.get_doc("Rakhtety Document", document)
    if doc.client != client:
        frappe.throw(_("Document does not belong to this client"), frappe.PermissionError)
    return {
        "id": doc.name,
        "client_id": client,
        "document_type": doc.document_type,
        "label": doc.document_type,
        "file_name": doc.file_url.split("/")[-1] if doc.file_url else doc.name,
        "storage_path": doc.file_url,
        "mime_type": None,
        "file_size": None,
        "uploaded_by": doc.uploaded_by_employee,
        "uploaded_at": _iso(doc.creation),
    }


def workflow_financial_summary(workflow):
    assert_user_can_access_workflow(workflow)
    steps = [_step_dto(frappe.get_doc("Rakhtety Workflow Step", row.name)) for row in frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow}, fields=["name"])]
    total_fees = sum(step["fees"] for step in steps)
    planned_profit = sum(step["profit"] for step in steps)
    total_paid = _workflow_payments(workflow)
    return {
        "workflow_id": workflow,
        "total_cost": total_fees + planned_profit,
        "total_fees": total_fees,
        "planned_profit": planned_profit,
        "total_paid": total_paid,
        "realized_profit": min(total_paid, planned_profit),
        "outstanding_debt": max((total_fees + planned_profit) - total_paid, 0),
    }


def record_payment(data):
    workflow = data.get("workflow_id")
    if not workflow:
        frappe.throw(_("Workflow is required"))
    assert_user_can_access_workflow(workflow)

    amount = _optional_amount(data.get("amount"))
    if not amount:
        frappe.throw(_("Payment amount must be greater than zero"))

    step = data.get("workflow_step_id") or None
    if step:
        step_doc = frappe.get_doc("Rakhtety Workflow Step", step)
        if step_doc.workflow != workflow:
            frappe.throw(_("Payment step does not belong to this workflow"))

    doc = frappe.get_doc(
        {
            "doctype": "Rakhtety Financial Event",
            "workflow": workflow,
            "workflow_step": step,
            "event_type": "payment",
            "amount": amount,
            "payment_method": data.get("payment_method"),
            "reference_number": data.get("reference_number"),
            "notes": data.get("notes"),
            "created_by_employee": get_employee_for_user(),
        }
    ).insert()

    workflow_doc = frappe.get_doc("Rakhtety Workflow", workflow)
    return {
        "id": doc.name,
        "workflow_id": workflow,
        "workflow_step_id": step,
        "client_id": workflow_doc.client,
        "type": doc.event_type,
        "amount": float(doc.amount or 0),
        "currency": "EGP",
        "payment_method": doc.payment_method,
        "reference_number": doc.reference_number,
        "notes": doc.notes,
        "created_by": doc.created_by_employee,
        "created_at": _iso(doc.creation),
    }


def client_report(client):
    detail = get_client_detail(client)
    return {"client": detail, "workflows": detail.get("workflows", [])}
