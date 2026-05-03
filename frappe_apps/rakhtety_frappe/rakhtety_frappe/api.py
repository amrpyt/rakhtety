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
def upload_workflow_document(data):
    return services.upload_workflow_document(json.loads(data))


@frappe.whitelist(methods=["POST"])
def workflow_financial_summary(workflow):
    return services.workflow_financial_summary(workflow)


@frappe.whitelist(methods=["POST"])
def client_report(client):
    return services.client_report(client)
