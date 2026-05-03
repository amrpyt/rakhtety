import frappe
import json

from rakhtety_frappe import services


@frappe.whitelist(methods=["POST"])
def get_client_workflow(client):
    return services.get_client_workflow_data(client)


@frappe.whitelist(methods=["POST"])
def upload_required_document(step, file_url="/private/files/spike-test.pdf", document_type="Required Document"):
    return services.upload_required_document(step, file_url=file_url, document_type=document_type)


@frappe.whitelist(methods=["POST"])
def update_step_status(step, status):
    return services.update_step_status(step, status)


@frappe.whitelist(methods=["POST"])
def start_excavation(client):
    return services.start_excavation(client)


@frappe.whitelist(methods=["POST"])
def assigned_work(employee=None):
    return services.get_assigned_work(employee)


@frappe.whitelist(methods=["GET"])
def current_user():
    user = frappe.session.user
    if user == "Guest":
        frappe.throw("Not logged in", frappe.PermissionError)

    full_name = frappe.db.get_value("User", user, "full_name") or ""
    employee_name = frappe.db.get_value("Rakhtety Employee", {"user": user}, "name")
    position = None
    if employee_name:
        employee_doc = frappe.get_doc("Rakhtety Employee", employee_name)
        position = getattr(employee_doc, "position", None) or getattr(employee_doc, "role_label", None)

    roles = set(frappe.get_roles(user))
    if {"Administrator", "System Manager", "Rakhtety Admin"} & roles:
        role = "admin"
    elif "Rakhtety Manager" in roles:
        role = "manager"
    else:
        role = "employee"

    return {
        "id": user,
        "email": user,
        "full_name": full_name,
        "role": role,
        "position": position,
    }


@frappe.whitelist(methods=["POST"])
def list_clients(search=None):
    return services.list_clients(search=search)


@frappe.whitelist(methods=["POST"])
def create_client(data):
    return services.create_client(json.loads(data))


@frappe.whitelist(methods=["POST"])
def get_client_detail(client):
    return services.get_client_detail(client)


@frappe.whitelist(methods=["POST"])
def update_client(client, data):
    return services.update_client(client, json.loads(data))


@frappe.whitelist(methods=["POST"])
def delete_client(client):
    return services.delete_client(client)


@frappe.whitelist(methods=["POST"])
def list_client_workflows(client):
    return services.list_client_workflows(client)


@frappe.whitelist(methods=["POST"])
def create_workflow(client, type):
    return services.create_workflow(client, type)


@frappe.whitelist(methods=["POST"])
def list_workflow_overview():
    return services.list_workflow_overview()


@frappe.whitelist(methods=["POST"])
def dashboard_summary():
    return services.dashboard_summary()


@frappe.whitelist(methods=["POST"])
def list_employees():
    return services.list_employees()


@frappe.whitelist(methods=["POST"])
def create_employee(data):
    return services.create_employee(json.loads(data))


@frappe.whitelist(methods=["POST"])
def update_employee(employee, data):
    return services.update_employee(employee, json.loads(data))


@frappe.whitelist(methods=["POST"])
def delete_employee(employee):
    return services.delete_employee(employee)


@frappe.whitelist(methods=["POST"])
def upload_workflow_document(data):
    return services.upload_workflow_document(json.loads(data))


@frappe.whitelist(methods=["POST"])
def get_step_document_status(step):
    return services.get_step_document_status(step)


@frappe.whitelist(methods=["POST"])
def get_workflow_document(document):
    return services.get_workflow_document(document)


@frappe.whitelist(methods=["POST"])
def upload_client_intake_document(data):
    return services.upload_client_intake_document(json.loads(data))


@frappe.whitelist(methods=["POST"])
def get_client_intake_document(client, document):
    return services.get_client_intake_document(client, document)


@frappe.whitelist(methods=["POST"])
def workflow_financial_summary(workflow):
    return services.workflow_financial_summary(workflow)


@frappe.whitelist(methods=["POST"])
def record_payment(data):
    return services.record_payment(json.loads(data))


@frappe.whitelist(methods=["POST"])
def client_report(client):
    return services.client_report(client)
