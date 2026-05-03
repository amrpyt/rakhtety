import frappe

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
