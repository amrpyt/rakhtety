app_name = "rakhtety_frappe"
app_title = "Rakhtety Frappe"
app_publisher = "Rakhtety"
app_description = "Frappe backend app for Rakhtety permit workflows"
app_email = "dev@rakhtety.local"
app_license = "MIT"

required_apps = ["frappe"]

fixtures = [
    {"dt": "Role", "filters": [["role_name", "in", ["Rakhtety Admin", "Rakhtety Manager", "Rakhtety Employee"]]]},
]
