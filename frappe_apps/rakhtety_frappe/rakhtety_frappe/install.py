from rakhtety_frappe.patches.v0_0_1.create_roles import execute as create_roles
from rakhtety_frappe.patches.v0_0_1.create_v16_desk_metadata import execute as create_v16_desk_metadata


def after_install():
    create_roles()
    create_v16_desk_metadata()
