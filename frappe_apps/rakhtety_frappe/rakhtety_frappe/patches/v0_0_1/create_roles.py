import frappe


def execute():
    for role_name in ("Rakhtety Admin", "Rakhtety Manager", "Rakhtety Employee"):
        if not frappe.db.exists("Role", role_name):
            frappe.get_doc({"doctype": "Role", "role_name": role_name}).insert(ignore_permissions=True)
