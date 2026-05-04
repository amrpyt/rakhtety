app_name = "rakhtety_frappe"
app_title = "Rakhtety Frappe"
app_publisher = "Rakhtety"
app_description = "Frappe backend app for Rakhtety permit workflows"
app_email = "dev@rakhtety.local"
app_license = "MIT"

required_apps = ["frappe"]

after_install = "rakhtety_frappe.install.after_install"
after_migrate = ["rakhtety_frappe.patches.v0_0_1.create_v16_desk_metadata.execute"]

app_logo_url = "/assets/rakhtety_frappe/rakhtety/logo.svg"
app_home = "/desk/rakhtety-command-center"
app_include_css = "/assets/rakhtety_frappe/rakhtety/desk_rtl.css"

add_to_apps_screen = [
    {
        "name": "rakhtety",
        "logo": app_logo_url,
        "title": "Rakhtety",
        "route": app_home,
        "has_permission": "rakhtety_frappe.api.has_desk_permission",
    }
]

fixtures = [
    {"dt": "Role", "filters": [["role_name", "in", ["Rakhtety Admin", "Rakhtety Manager", "Rakhtety Employee"]]]},
    {"dt": "Workspace", "filters": [["name", "like", "Rakhtety%"]]},
    {"dt": "Workspace Sidebar", "filters": [["name", "like", "Rakhtety%"]]},
]
