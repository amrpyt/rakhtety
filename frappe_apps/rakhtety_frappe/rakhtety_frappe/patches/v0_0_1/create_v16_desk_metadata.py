import json

import frappe


WORKSPACE_NAME = "Rakhtety"
MODULE_NAME = "Rakhtety"
DESK_ROUTE = "/desk/rakhtety-command-center"
LOGO_URL = "/assets/rakhtety_frappe/rakhtety/logo.svg"

PAGES = [
    {"name": "rakhtety-command-center", "title": "مكتب رخصتي"},
    {"name": "rakhtety-clients", "title": "ملفات العملاء"},
    {"name": "rakhtety-workflows", "title": "الفلو والخطوات"},
    {"name": "rakhtety-finance", "title": "الحسابات"},
    {"name": "rakhtety-employees", "title": "الموظفين"},
    {"name": "rakhtety-documents", "title": "المستندات"},
]

SHORTCUTS = [
    {"label": "مكتب رخصتي", "type": "Page", "link_to": "rakhtety-command-center"},
    {"label": "ملفات العملاء", "type": "Page", "link_to": "rakhtety-clients"},
    {"label": "الفلو والخطوات", "type": "Page", "link_to": "rakhtety-workflows"},
    {"label": "الحسابات", "type": "Page", "link_to": "rakhtety-finance"},
    {"label": "الموظفين", "type": "Page", "link_to": "rakhtety-employees"},
    {"label": "المستندات", "type": "Page", "link_to": "rakhtety-documents"},
    {"label": "سجل العملاء", "type": "DocType", "link_to": "Rakhtety Client"},
    {"label": "سجل الفلوهات", "type": "DocType", "link_to": "Rakhtety Workflow"},
    {"label": "سجل الخطوات", "type": "DocType", "link_to": "Rakhtety Workflow Step"},
    {"label": "سجل المستندات", "type": "DocType", "link_to": "Rakhtety Document"},
    {"label": "سجل الموظفين", "type": "DocType", "link_to": "Rakhtety Employee"},
    {"label": "سجل الحسابات", "type": "DocType", "link_to": "Rakhtety Financial Event"},
]

SIDEBAR_WORKSPACES = [
    {"name": "مكتب رخصتي", "label": "مكتب رخصتي", "route": "/desk/rakhtety-command-center", "link_to": "rakhtety-command-center"},
    {"name": "ملفات العملاء", "label": "ملفات العملاء", "route": "/desk/rakhtety-clients", "link_to": "rakhtety-clients"},
    {"name": "الفلو والخطوات", "label": "الفلو والخطوات", "route": "/desk/rakhtety-workflows", "link_to": "rakhtety-workflows"},
    {"name": "الحسابات", "label": "الحسابات", "route": "/desk/rakhtety-finance", "link_to": "rakhtety-finance"},
    {"name": "الموظفين", "label": "الموظفين", "route": "/desk/rakhtety-employees", "link_to": "rakhtety-employees"},
    {"name": "المستندات", "label": "المستندات", "route": "/desk/rakhtety-documents", "link_to": "rakhtety-documents"},
]


LINKS = [
    {
        "label": "Office Operations",
        "type": "Card Break",
        "link_type": "DocType",
        "link_to": "Rakhtety Client",
    },
    {"label": "مكتب رخصتي", "type": "Link", "link_type": "Page", "link_to": "rakhtety-command-center"},
    {"label": "ملفات العملاء", "type": "Link", "link_type": "Page", "link_to": "rakhtety-clients"},
    {"label": "الفلو والخطوات", "type": "Link", "link_type": "Page", "link_to": "rakhtety-workflows"},
    {"label": "الحسابات", "type": "Link", "link_type": "Page", "link_to": "rakhtety-finance"},
    {"label": "الموظفين", "type": "Link", "link_type": "Page", "link_to": "rakhtety-employees"},
    {"label": "المستندات", "type": "Link", "link_type": "Page", "link_to": "rakhtety-documents"},
]


def execute():
    ensure_arabic_defaults()
    ensure_pages()
    ensure_workspace()
    ensure_sidebar_workspaces()
    ensure_workspace_sidebar()
    ensure_desktop_icon()


def ensure_arabic_defaults():
    if frappe.db.exists("DocType", "System Settings"):
        settings = frappe.get_single("System Settings")
        _set_known_values(
            settings,
            {
                "language": "ar",
                "time_zone": "Africa/Cairo",
                "country": "Egypt",
            },
        )
        _save(settings)

    if frappe.db.exists("DocType", "User") and frappe.get_meta("User").get_field("language"):
        for user in frappe.get_all("User", filters={"enabled": 1, "user_type": "System User"}, pluck="name"):
            frappe.db.set_value("User", user, "language", "ar", update_modified=False)


def ensure_pages():
    if not frappe.db.exists("DocType", "Page"):
        return

    for page in PAGES:
        doc = _get_or_new("Page", page["name"])
        _set_known_values(
            doc,
            {
                "page_name": page["name"],
                "title": page["title"],
                "module": MODULE_NAME,
                "standard": "Yes",
                "system_page": 0,
            },
        )
        if frappe.get_meta("Page").get_field("roles"):
            _replace_child_rows(
                doc,
                "roles",
                [
                    {"role": "Rakhtety Admin"},
                    {"role": "Rakhtety Manager"},
                    {"role": "Rakhtety Employee"},
                    {"role": "System Manager"},
                ],
            )
        _save(doc)


def ensure_workspace():
    if not frappe.db.exists("DocType", "Workspace"):
        return

    doc = _get_or_new("Workspace", WORKSPACE_NAME)
    _set_known_values(
        doc,
        {
            "label": WORKSPACE_NAME,
            "title": WORKSPACE_NAME,
            "module": MODULE_NAME,
            "icon": "license",
            "public": 1,
            "standard": 1,
            "is_standard": 1,
            "is_hidden": 0,
            "for_user": "",
            "route": "rakhtety",
            "app": "rakhtety_frappe",
            "category": "Modules",
            "content": _workspace_content(),
        },
    )
    _replace_child_rows(doc, "shortcuts", SHORTCUTS)
    _replace_child_rows(doc, "links", LINKS)
    _save(doc)


def ensure_sidebar_workspaces():
    if not frappe.db.exists("DocType", "Workspace"):
        return

    for index, item in enumerate(SIDEBAR_WORKSPACES, start=1):
        doc = _get_or_new("Workspace", item["name"])
        _set_known_values(
            doc,
            {
                "label": item["label"],
                "title": item["label"],
                "module": MODULE_NAME,
                "icon": "license",
                "public": 1,
                "standard": 1,
                "is_standard": 1,
                "is_hidden": 0,
                "for_user": "",
                "parent_page": WORKSPACE_NAME,
                "route": item["route"],
                "type": "Link",
                "link_type": "Page",
                "link_to": item["link_to"],
                "app": "rakhtety_frappe",
                "category": "Modules",
                "sequence_id": 30 + index,
                "content": "[]",
            },
        )
        _save(doc)


def ensure_workspace_sidebar():
    if not frappe.db.exists("DocType", "Workspace Sidebar"):
        return

    doc = _get_or_new("Workspace Sidebar", WORKSPACE_NAME)
    _set_known_values(
        doc,
        {
            "title": WORKSPACE_NAME,
            "label": WORKSPACE_NAME,
            "module": MODULE_NAME,
            "workspace": WORKSPACE_NAME,
            "route": DESK_ROUTE,
            "icon": "license",
            "logo": LOGO_URL,
            "public": 1,
            "standard": 1,
            "is_standard": 1,
            "position": 30,
            "sequence_id": 30,
        },
    )
    _save(doc)


def ensure_desktop_icon():
    if not frappe.db.exists("DocType", "Desktop Icon"):
        return

    doc = _get_or_new("Desktop Icon", WORKSPACE_NAME)
    _set_known_values(
        doc,
        {
            "label": WORKSPACE_NAME,
            "title": WORKSPACE_NAME,
            "module": MODULE_NAME,
            "app": "rakhtety_frappe",
            "icon_type": "App",
            "link_type": "External",
            "link": DESK_ROUTE,
            "route": DESK_ROUTE,
            "logo_url": LOGO_URL,
            "icon": LOGO_URL,
            "public": 1,
            "standard": 1,
            "is_standard": 1,
        },
    )
    _save(doc)


def _get_or_new(doctype, name):
    if frappe.db.exists(doctype, name):
        return frappe.get_doc(doctype, name)
    doc = frappe.new_doc(doctype)
    doc.name = name
    return doc


def _set_known_values(doc, values):
    meta = frappe.get_meta(doc.doctype)
    valid = set(meta.get_valid_columns())
    for fieldname, value in values.items():
        if fieldname in valid:
            doc.set(fieldname, value)


def _replace_child_rows(doc, table_fieldname, rows):
    table_field = frappe.get_meta(doc.doctype).get_field(table_fieldname)
    if not table_field:
        return

    child_meta = frappe.get_meta(table_field.options)
    valid = {field.fieldname for field in child_meta.fields}
    doc.set(table_fieldname, [])
    for row in rows:
        filtered = {fieldname: value for fieldname, value in row.items() if fieldname in valid}
        if filtered:
            doc.append(table_fieldname, filtered)


def _workspace_content():
    return json.dumps(
        [{"type": "header", "data": {"text": "Rakhtety"}}]
        + [{"type": "shortcut", "data": {"shortcut_name": shortcut["label"]}} for shortcut in SHORTCUTS]
    )


def _save(doc):
    if doc.is_new():
        doc.insert(ignore_permissions=True)
    else:
        doc.save(ignore_permissions=True)
