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
