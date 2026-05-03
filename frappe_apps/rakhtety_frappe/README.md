# Rakhtety Frappe

Frappe backend app for Rakhtety permit workflows.

This app is the production home for the Frappe spike logic. Code in this folder should be installed into Frappe through a normal app install/build/deploy flow, not copied manually into a running container.

## Target

- Frappe Framework v16
- Custom Next.js frontend remains the main office UI
- Frappe stores workflow data, documents, permissions, and business rules

## Local shape

```text
rakhtety_frappe/
  pyproject.toml
  rakhtety_frappe/
    __init__.py
    hooks.py
    modules.txt
    patches.txt
    rakhtety/
```
