import frappe

from frappe.tests.classes import IntegrationTestCase

from rakhtety_frappe import api, services
from rakhtety_frappe.constants import STEP_STATUS_COMPLETED, WORKFLOW_STATUS_COMPLETED
from rakhtety_frappe.patches.v0_0_1.create_roles import execute as create_roles


def make_name(label):
    return f"_Test {label} {frappe.generate_hash(length=8)}"


def make_user(email):
    if frappe.db.exists("User", email):
        user = frappe.get_doc("User", email)
    else:
        user = frappe.get_doc(
            {
                "doctype": "User",
                "email": email,
                "first_name": email.split("@")[0],
                "enabled": 1,
                "user_type": "System User",
                "send_welcome_email": 0,
            }
        ).insert(ignore_permissions=True)

    user.add_roles("Rakhtety Employee")
    return user


class TestRakhtetyWorkflow(IntegrationTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        frappe.set_user("Administrator")
        create_roles()

    def tearDown(self):
        frappe.set_user("Administrator")

    def make_client(self):
        client_name = make_name("Client")
        return frappe.get_doc(
            {
                "doctype": "Rakhtety Client",
                "title": client_name,
                "phone": "01000000000",
                "city": "Cairo",
                "district": "Nasr City",
                "parcel_number": make_name("Parcel"),
            }
        ).insert()

    def make_employee(self, label):
        email = f"{frappe.generate_hash(length=8)}@example.com"
        make_user(email)
        employee_name = make_name(label)
        return frappe.get_doc(
            {
                "doctype": "Rakhtety Employee",
                "title": employee_name,
                "user": email,
                "role_label": "Employee",
            }
        ).insert()

    def complete_device_license(self, workflow):
        steps = frappe.get_all("Rakhtety Workflow Step", filters={"workflow": workflow.name}, pluck="name")
        for step in steps:
            services.upload_required_document(step)
            services.update_step_status(step, STEP_STATUS_COMPLETED)

    def test_required_doctypes_exist(self):
        for doctype in (
            "Rakhtety Client",
            "Rakhtety Employee",
            "Rakhtety Workflow",
            "Rakhtety Workflow Step",
            "Rakhtety Document",
        ):
            self.assertTrue(frappe.db.exists("DocType", doctype))

    def test_excavation_dependency(self):
        client = self.make_client()
        employee = self.make_employee("Employee")
        workflow = services.create_device_license_workflow(client.name, employee.name)

        with self.assertRaises(frappe.ValidationError):
            services.start_excavation(client.name)

        self.complete_device_license(workflow)

        excavation = services.start_excavation(client.name)
        self.assertTrue(frappe.db.exists("Rakhtety Workflow", excavation))

    def test_required_document_gate(self):
        client = self.make_client()
        employee = self.make_employee("Employee")
        workflow = services.create_device_license_workflow(client.name, employee.name)
        first_step = frappe.get_all(
            "Rakhtety Workflow Step",
            filters={"workflow": workflow.name, "requires_document": 1},
            pluck="name",
            limit=1,
        )[0]

        with self.assertRaises(frappe.ValidationError):
            services.update_step_status(first_step, STEP_STATUS_COMPLETED)

        document = services.upload_required_document(first_step)
        result = services.update_step_status(first_step, STEP_STATUS_COMPLETED)

        self.assertTrue(frappe.db.exists("Rakhtety Document", document))
        self.assertEqual(result["status"], STEP_STATUS_COMPLETED)

    def test_employee_assigned_work_filter(self):
        client = self.make_client()
        employee_a = self.make_employee("Employee A")
        employee_b = self.make_employee("Employee B")

        services.create_device_license_workflow(client.name, employee_a.name)
        other_client = self.make_client()
        services.create_device_license_workflow(other_client.name, employee_b.name)

        frappe.set_user(employee_a.user)
        assigned = services.get_assigned_work(employee_a.name)
        names = [item["name"] for item in assigned]

        self.assertTrue(names)
        self.assertTrue(all(client.name in name for name in names))
        self.assertFalse(any(other_client.name in name for name in names))

    def test_api_methods_update_workflow(self):
        client = self.make_client()
        employee = self.make_employee("Employee")
        workflow = services.create_device_license_workflow(client.name, employee.name)
        first_step = frappe.get_all(
            "Rakhtety Workflow Step",
            filters={"workflow": workflow.name},
            pluck="name",
            order_by="step_order asc",
            limit=1,
        )[0]

        payload = api.get_client_workflow(client.name)
        self.assertEqual(payload["client"].name, client.name)

        api.upload_required_document(first_step)
        result = api.update_step_status(first_step, STEP_STATUS_COMPLETED)

        self.assertEqual(result["status"], STEP_STATUS_COMPLETED)

        self.complete_device_license(workflow)
        self.assertEqual(frappe.db.get_value("Rakhtety Workflow", workflow.name, "status"), WORKFLOW_STATUS_COMPLETED)
