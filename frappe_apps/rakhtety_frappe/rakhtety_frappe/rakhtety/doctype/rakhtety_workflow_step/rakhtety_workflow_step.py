import frappe
from frappe import _
from frappe.model.document import Document


class RakhtetyWorkflowStep(Document):
    def validate(self):
        if self.status == "completed" and self.requires_document and not self.required_document_uploaded:
            frappe.throw(_("Required document must be uploaded before completing this step"))
