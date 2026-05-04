(function () {
  const routes = [
    ["rakhtety-command-center", "مكتب رخصتي"],
    ["rakhtety-clients", "ملفات العملاء"],
    ["rakhtety-workflows", "الشغل الحالي"],
    ["rakhtety-finance", "الحسابات"],
    ["rakhtety-employees", "الموظفين"],
    ["rakhtety-documents", "المستندات"],
  ];

  const pageLists = {
    "rakhtety-command-center": "Rakhtety Workflow",
    "rakhtety-clients": "Rakhtety Client",
    "rakhtety-workflows": "Rakhtety Workflow",
    "rakhtety-finance": "Rakhtety Financial Event",
    "rakhtety-employees": "Rakhtety Employee",
    "rakhtety-documents": "Rakhtety Document",
  };

  const workflowNames = {
    device_license: "رخصة الجهاز",
    DEVICE_LICENSE: "رخصة الجهاز",
    excavation_permit: "تصريح الحفر",
    EXCAVATION_PERMIT: "تصريح الحفر",
    "رخصة الجهاز": "رخصة الجهاز",
    "تصريح الحفر": "تصريح الحفر",
  };

  const stepNames = {
    "Eligibility Statement": "بيان الصلاحية",
    "Submit Decade Collective": "تقديم المجمعة العشرية للإسكان المميز",
    "File Submission": "تقديم الملف",
    "Pay Fee": "دفع إذن الرخصة وشراء عقد مخلفات",
    "Receive License": "استلام الرخصة",
    "Supervision Certificate": "شهادة الإشراف",
    "Insurance Submission": "التأمينات",
    "Construction Meter": "العداد الإنشائي",
    "Excavation Permit": "تصريح الحفر",
    "Mining Permit": "تصريح التعدين",
  };

  const statuses = {
    pending: "في الانتظار",
    in_progress: "جاري",
    completed: "خلصت",
    blocked: "موقوفة",
  };

  function call(method, args = {}) {
    return new Promise((resolve, reject) => {
      frappe.call({
        method,
        args,
        callback: (response) => resolve(response.message),
        error: reject,
      });
    });
  }

  function html(value) {
    return frappe.utils.escape_html(value == null ? "" : String(value));
  }

  function money(value) {
    return `${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} EGP`;
  }

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    }).format(date);
  }

  function workflowLabel(value) {
    return workflowNames[value] || value || "فلو";
  }

  function stepLabel(value) {
    return stepNames[value] || value || "خطوة";
  }

  function statusLabel(value) {
    return statuses[value] || value || "غير معروف";
  }

  function openForm(doctype, name) {
    if (doctype && name) {
      frappe.set_route("Form", doctype, name);
    }
  }

  function openList(doctype) {
    if (doctype) {
      frappe.set_route("List", doctype);
    }
  }

  function configureNativePageActions(page, pageKey, refresh) {
    const listDoctype = pageLists[pageKey] || "Rakhtety Workflow";
    page.set_secondary_action(__("تحديث"), refresh, "octicon octicon-sync");
    page.set_primary_action(__("افتح القائمة"), () => openList(listDoctype), "octicon octicon-list-unordered");
    page.add_menu_item(__("وورك سبيس رخصتي"), () => frappe.set_route("workspace", "Rakhtety"), true);
    page.add_menu_item(__("عميل جديد"), () => frappe.new_doc("Rakhtety Client"), true);

    routes.forEach(([route, label]) => {
      if (route !== pageKey) {
        page.add_menu_item(label, () => frappe.set_route(route));
      }
    });
  }

  function shell(pageKey, title, subtitle) {
    return $(`
      <div class="rakhtety-desk" dir="rtl">
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap");

          .layout-main-section-wrapper:has(.rakhtety-desk) { background: #f6f7f4; }
          .rakhtety-desk {
            --rk-bg: #f6f7f4;
            --rk-surface: #ffffff;
            --rk-soft: #fbfcfa;
            --rk-border: #dde2da;
            --rk-border-strong: #c5d0c3;
            --rk-text: #20231d;
            --rk-muted: #687062;
            --rk-faint: #8a9385;
            --rk-primary: #0b6b63;
            --rk-primary-strong: #064d48;
            --rk-primary-soft: #e4f3f0;
            --rk-success: #337a36;
            --rk-success-soft: #e8f4e7;
            --rk-warning: #a75313;
            --rk-warning-soft: #fff2e5;
            --rk-danger: #b42318;
            --rk-danger-soft: #fff0ee;
            --rk-blue: #2356b8;
            --rk-blue-soft: #edf3ff;
            min-height: calc(100vh - 112px);
            padding: 18px;
            background: var(--rk-bg);
            color: var(--rk-text);
            direction: rtl;
            text-align: right;
            font-family: "Cairo", "Segoe UI", Tahoma, sans-serif;
          }
          .rakhtety-desk * { box-sizing: border-box; letter-spacing: 0; }
          .rk-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 12px;
          }
          .rk-title { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 700; }
          .rk-subtitle { margin: 5px 0 0; color: var(--rk-muted); font-size: 13px; font-weight: 500; }
          .rk-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
          .rk-button {
            min-height: 34px;
            border: 1px solid var(--rk-border);
            border-radius: 8px;
            padding: 7px 11px;
            background: var(--rk-surface);
            color: var(--rk-text);
            font-size: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 1px 2px rgba(32, 35, 29, .04);
          }
          .rk-button:hover { background: #eef2eb; }
          .rk-button.primary { background: var(--rk-primary); border-color: var(--rk-primary); color: #fff; }
          .rk-button.primary:hover { background: var(--rk-primary-strong); }
          .rk-button.ghost { background: transparent; box-shadow: none; }
          .rk-button.tiny { min-height: 29px; padding: 5px 9px; font-size: 11px; }
          .rk-nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; }
          .rk-nav a {
            border: 1px solid #c7e2de;
            color: var(--rk-primary);
            background: var(--rk-primary-soft);
            border-radius: 8px;
            padding: 7px 11px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
            white-space: nowrap;
          }
          .rk-nav a.active { background: var(--rk-primary); color: #fff; border-color: var(--rk-primary); }
          .rk-help {
            margin-bottom: 12px;
            padding: 11px 13px;
            border: 1px solid #d5e9e5;
            border-radius: 8px;
            background: #f2fbf8;
            color: var(--rk-primary-strong);
            font-size: 13px;
            font-weight: 500;
          }
          .rk-kpis {
            display: grid;
            grid-template-columns: repeat(4, minmax(140px, 1fr));
            gap: 10px;
            margin-bottom: 12px;
          }
          .rk-kpi, .rk-panel, .rk-card {
            background: var(--rk-surface);
            border: 1px solid var(--rk-border);
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(32, 35, 29, .05);
          }
          .rk-kpi {
            min-height: 82px;
            padding: 12px;
            border-inline-start: 4px solid var(--accent, var(--rk-primary));
          }
          .rk-kpi-label { color: var(--rk-muted); font-size: 12px; font-weight: 600; }
          .rk-kpi-value { margin-top: 7px; font-size: 22px; line-height: 1.1; font-weight: 700; font-variant-numeric: tabular-nums; }
          .rk-kpi-note { margin-top: 6px; color: var(--rk-faint); font-size: 11px; font-weight: 500; }
          .rk-panel { overflow: hidden; margin-bottom: 12px; }
          .rk-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 12px 14px;
            border-bottom: 1px solid var(--rk-border);
            background: var(--rk-soft);
          }
          .rk-panel-title { margin: 0; font-size: 16px; font-weight: 700; }
          .rk-panel-note { margin-top: 3px; color: var(--rk-muted); font-size: 11px; font-weight: 500; }
          .rk-panel-body, .rk-list { padding: 12px; }
          .rk-list { display: grid; gap: 8px; }
          .rk-table-wrap { width: 100%; overflow-x: auto; }
          .rk-table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            font-size: 12px;
          }
          .rk-table th,
          .rk-table td {
            border-bottom: 1px solid var(--rk-border);
            padding: 9px 10px;
            text-align: right;
            vertical-align: middle;
            white-space: nowrap;
          }
          .rk-table th {
            color: var(--rk-muted);
            background: var(--rk-soft);
            font-weight: 600;
          }
          .rk-table td { font-weight: 400; color: var(--rk-text); }
          .rk-table tr:hover td { background: #f7faf6; }
          .rk-table tr[data-client] { cursor: pointer; }
          .rk-card, .rk-row-button {
            width: 100%;
            border-radius: 8px;
            padding: 10px;
            background: var(--rk-surface);
            text-align: right;
          }
          .rk-row-button {
            border: 1px solid var(--rk-border);
            transition: border-color .14s ease, background .14s ease;
          }
          .rk-row-button:hover { border-color: var(--rk-primary); background: var(--rk-primary-soft); }
          .rk-row-button.active { border-color: var(--rk-primary); background: var(--rk-primary-soft); box-shadow: inset 4px 0 0 var(--rk-primary); }
          .rk-row-title { color: var(--rk-text); font-size: 14px; font-weight: 700; word-break: break-word; }
          .rk-row-meta { margin-top: 4px; color: var(--rk-muted); font-size: 11px; line-height: 1.5; font-weight: 500; }
          .rk-row-line { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
          .rk-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            max-width: 100%;
            min-height: 23px;
            border-radius: 8px;
            padding: 3px 8px;
            background: var(--rk-blue-soft);
            color: var(--rk-blue);
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
          }
          .rk-badge.good { background: var(--rk-success-soft); color: var(--rk-success); }
          .rk-badge.warn { background: var(--rk-warning-soft); color: var(--rk-warning); }
          .rk-badge.danger { background: var(--rk-danger-soft); color: var(--rk-danger); }
          .rk-money { background: var(--rk-warning-soft); color: var(--rk-warning); }
          .rk-empty {
            border: 1px dashed var(--rk-border-strong);
            border-radius: 8px;
            padding: 16px;
            background: var(--rk-soft);
            color: var(--rk-muted);
            text-align: center;
            font-weight: 600;
          }
          .rk-search {
            width: 100%;
            height: 38px;
            border: 1px solid var(--rk-border);
            border-radius: 8px;
            background: #fff;
            color: var(--rk-text);
            padding-inline: 12px;
            margin-bottom: 9px;
          }
          .rk-command-grid {
            display: grid;
            grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
            gap: 12px;
            align-items: start;
          }
          .rk-client-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 12px;
            border: 1px solid var(--rk-border);
            border-radius: 8px;
            background: linear-gradient(180deg, #fff, var(--rk-soft));
            margin-bottom: 10px;
          }
          .rk-client-name { margin: 0; font-size: 19px; font-weight: 700; }
          .rk-client-meta { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 5px; color: var(--rk-muted); font-size: 12px; font-weight: 500; }
          .rk-workflow {
            border: 1px solid var(--rk-border);
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .rk-workflow-head {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            padding: 11px 12px;
            border-bottom: 1px solid var(--rk-border);
            background: var(--rk-soft);
          }
          .rk-workflow-title { margin: 0; font-size: 15px; font-weight: 700; }
          .rk-steps { padding: 8px 12px 12px; }
          .rk-step {
            display: grid;
            grid-template-columns: 30px minmax(0, 1fr) auto;
            gap: 9px;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #edf0ea;
          }
          .rk-step:last-child { border-bottom: 0; }
          .rk-dot {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            border: 2px solid var(--rk-border);
            background: #fff;
            color: var(--rk-muted);
            font-size: 11px;
            font-weight: 600;
          }
          .rk-step.completed .rk-dot { background: var(--rk-success); color: #fff; border-color: var(--rk-success); }
          .rk-step.current .rk-dot { background: var(--rk-primary); color: #fff; border-color: var(--rk-primary); box-shadow: 0 0 0 4px var(--rk-primary-soft); }
          .rk-step-title { font-size: 14px; font-weight: 700; }
          .rk-step-actions { display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; max-width: 250px; }
          .rk-chips { margin-top: 7px; display: flex; flex-wrap: wrap; gap: 5px; }
          .rk-link-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }
          @media (max-width: 1100px) {
            .rk-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .rk-command-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 640px) {
            .rakhtety-desk { padding: 12px; }
            .rk-top, .rk-panel-head, .rk-client-head, .rk-workflow-head { flex-direction: column; align-items: stretch; }
            .rk-kpis { grid-template-columns: 1fr; }
            .rk-step { grid-template-columns: 30px minmax(0, 1fr); }
            .rk-step-actions { grid-column: 2 / -1; justify-content: flex-start; max-width: none; }
          }
        </style>

        <header class="rk-top">
          <div>
            <h1 class="rk-title">${html(title)}</h1>
            <p class="rk-subtitle">${html(subtitle)}</p>
          </div>
        </header>
        <div data-help></div>
        <section data-content><div class="rk-empty">تحميل...</div></section>
      </div>
    `);
  }

  function kpis(items) {
    return `<section class="rk-kpis">${items
      .map(
        (item) => `
          <article class="rk-kpi" style="--accent:${html(item.accent || "#0b6b63")}">
            <div class="rk-kpi-label">${html(item.label)}</div>
            <div class="rk-kpi-value">${html(item.value)}</div>
            ${item.note ? `<div class="rk-kpi-note">${html(item.note)}</div>` : ""}
          </article>
        `
      )
      .join("")}</section>`;
  }

  function panel(title, note, body, extraClass = "") {
    return `<section class="rk-panel ${extraClass}">
      <div class="rk-panel-head">
        <div>
          <h2 class="rk-panel-title">${html(title)}</h2>
          ${note ? `<div class="rk-panel-note">${html(note)}</div>` : ""}
        </div>
      </div>
      <div class="rk-list">${body || `<div class="rk-empty">لا توجد بيانات الآن.</div>`}</div>
    </section>`;
  }

  function table(headers, rows) {
    if (!rows || !rows.length) {
      return `<div class="rk-empty">لا توجد بيانات الآن.</div>`;
    }

    return `<div class="rk-table-wrap"><table class="rk-table">
      <thead><tr>${headers.map((header) => `<th>${html(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table></div>`;
  }

  function cell(value) {
    return `<td>${html(value || "")}</td>`;
  }

  function actionCell(buttons) {
    return `<td><div class="rk-link-row">${buttons.join("")}</div></td>`;
  }

  function clientRow(client, selectedClient) {
    const active = client.id === selectedClient || client.name === selectedClient ? "active" : "";
    const clientId = client.id || client.name;
    return `<button class="rk-row-button ${active}" data-client="${html(clientId)}">
      <div class="rk-row-title">${html(client.name || client.title || clientId)}</div>
      <div class="rk-row-meta">${html(client.phone || "بدون موبايل")} · ${html(client.parcel_number || "بدون قطعة")}</div>
    </button>`;
  }

  function renderFinance(root, data) {
    const summary = data.summary || {};
    root.find("[data-help]").html(`<div class="rk-help">هنا ملخص بسيط للمقبوضات والمديونية. الحسابات الرسمية تفضل في ERPNext Accounting، والشاشة دي للمتابعة السريعة.</div>`);
    const workflowRows = (data.workflows || []).map((row) => `<tr>
      ${cell(row.client_name || row.client_id)}
      ${cell(workflowLabel(row.workflow_type))}
      ${cell(stepLabel(row.current_step_name))}
      ${cell(statusLabel(row.current_step_status))}
      ${cell(money(row.outstanding_debt))}
      ${actionCell([
        `<button class="rk-button primary tiny" data-open-workflow="${html(row.workflow_id)}">افتح الفلو</button>`,
        `<button class="rk-button tiny" data-open-client-form="${html(row.client_id)}">افتح العميل</button>`,
      ])}
    </tr>`);
    const eventRows = (data.events || []).map((event) => `<tr>
      ${cell(event.client_name || event.client_id || "عميل")}
      ${cell(money(event.amount))}
      ${cell(event.payment_method || "بدون طريقة دفع")}
      ${cell(event.reference_number || "بدون رقم مرجعي")}
      ${cell(formatDateTime(event.created_at))}
    </tr>`);
    root.find("[data-content]").html(`
      ${kpis([
        { label: "مديونية لم تحصل", value: money(summary.pending_debt), accent: "#a75313" },
        { label: "مدفوع فعلا", value: money(summary.total_paid), accent: "#2356b8" },
        { label: "ربح متحقق", value: money(summary.realized_profit), accent: "#337a36" },
        { label: "ملفات مفتوحة", value: summary.active_files || 0, accent: "#0b6b63" },
      ])}
      ${panel("الحسابات المفتوحة", "كل فلو عليه فلوس أو محتاج متابعة", table(["العميل", "الفلو", "الخطوة", "الحالة", "المديونية", "إجراء"], workflowRows))}
      ${panel("حركات الدفع", "آخر دفعات اتسجلت في رخصتي", table(["العميل", "المبلغ", "طريقة الدفع", "المرجع", "التاريخ"], eventRows))}
    `);
  }

  function renderClients(root, clients) {
    root.find("[data-help]").html(`<div class="rk-help">دي قائمة بسيطة للعملاء. التفاصيل الكاملة والتعديلات الثقيلة موجودة في سجل Frappe الخام.</div>`);
    const rows = clients.map((client) => `<tr>
      ${cell(client.title || client.name)}
      ${cell(client.phone || "بدون موبايل")}
      ${cell(client.city || "")}
      ${cell(client.parcel_number || "بدون قطعة")}
      ${actionCell([`<button class="rk-button primary tiny" data-open-client-form="${html(client.name)}">افتح السجل</button>`])}
    </tr>`);
    root.find("[data-content]").html(`
      ${kpis([{ label: "عدد العملاء", value: clients.length, accent: "#0b6b63" }])}
      ${panel("ملفات العملاء", "افتح العميل أو ارجع لمكتب رخصتي لمتابعة الفلو", table(["العميل", "الموبايل", "المدينة", "رقم القطعة", "إجراء"], rows))}
    `);
  }

  function renderWorkflows(root, rows) {
    root.find("[data-help]").html(`<div class="rk-help">الشغل الحالي يقول لك كل ملف واقف عند أنهي خطوة. التنفيذ الأسهل من مكتب رخصتي، والتفاصيل الخام من سجل الفلو.</div>`);
    const tableRows = rows.map((row) => `<tr>
      ${cell(row.client_name || row.client_id)}
      ${cell(workflowLabel(row.workflow_type))}
      ${cell(stepLabel(row.current_step_name))}
      ${cell(statusLabel(row.current_step_status))}
      ${cell(row.assigned_employee_name || "")}
      ${cell(money(row.outstanding_debt))}
      ${actionCell([
        `<button class="rk-button primary tiny" data-open-workflow="${html(row.workflow_id)}">افتح الفلو</button>`,
        `<button class="rk-button tiny" data-open-client-form="${html(row.client_id)}">افتح العميل</button>`,
      ])}
    </tr>`);
    root.find("[data-content]").html(`
      ${kpis([
        { label: "عدد الفلوهات", value: rows.length, accent: "#0b6b63" },
        { label: "محتاج متابعة", value: rows.filter((row) => row.current_step_status !== "completed").length, accent: "#a75313" },
      ])}
      ${panel("الشغل الحالي", "كل ملف وخطوته الحالية", table(["العميل", "الفلو", "الخطوة", "الحالة", "الموظف", "المديونية", "إجراء"], tableRows))}
    `);
  }

  function renderEmployees(root, rows) {
    root.find("[data-help]").html(`<div class="rk-help">الموظفين هنا للمتابعة السريعة. تعديل المستخدمين والصلاحيات الأفضل يتم من Frappe Users and Roles.</div>`);
    const tableRows = rows.map((row) => `<tr>
      ${cell((row.profile || {}).full_name || row.full_name || row.title || row.id || row.name)}
      ${cell(row.user_id || (row.profile || {}).id || "")}
      ${cell(row.position || row.role_label || "")}
      ${cell(row.is_active ? "نشط" : "موقوف")}
      ${actionCell([`<button class="rk-button primary tiny" data-open-employee="${html(row.id || row.name)}">افتح الموظف</button>`])}
    </tr>`);
    root.find("[data-content]").html(`
      ${kpis([{ label: "عدد الموظفين", value: rows.length, accent: "#0b6b63" }])}
      ${panel("الموظفين", "افتح سجل الموظف لو محتاج تعديل", table(["الموظف", "المستخدم", "الدور", "الحالة", "إجراء"], tableRows))}
    `);
  }

  function documentMeta(row) {
    const parts = [row.client, row.workflow_step].filter(Boolean);
    return parts.join(" · ") || "بدون ارتباط";
  }

  function renderDocuments(root, rows) {
    root.find("[data-help]").html(`<div class="rk-help">المستندات هنا للعرض السريع. صلاحية رؤية الملف نفسها جاية من Frappe حسب السجل المرتبط به.</div>`);
    const tableRows = rows.map((row) => `<tr>
      ${cell(row.document_type || row.name)}
      ${cell(documentMeta(row))}
      ${cell(row.creation || "")}
      ${actionCell([`<button class="rk-button primary tiny" data-open-document="${html(row.name)}">افتح المستند</button>`])}
    </tr>`);
    root.find("[data-content]").html(`
      ${kpis([{ label: "عدد المستندات", value: rows.length, accent: "#0b6b63" }])}
      ${panel("المستندات", "آخر أوراق مرفوعة", table(["المستند", "مرتبط بـ", "التاريخ", "إجراء"], tableRows))}
    `);
  }

  async function loadSection(pageKey, root) {
    if (pageKey === "rakhtety-finance") {
      renderFinance(root, await call("rakhtety_frappe.api.finance_overview"));
      return;
    }

    if (pageKey === "rakhtety-clients") {
      renderClients(root, await call("rakhtety_frappe.api.list_clients"));
      return;
    }

    if (pageKey === "rakhtety-workflows") {
      renderWorkflows(root, await call("rakhtety_frappe.api.list_workflow_overview"));
      return;
    }

    if (pageKey === "rakhtety-employees") {
      renderEmployees(root, await call("rakhtety_frappe.api.list_employees"));
      return;
    }

    if (pageKey === "rakhtety-documents") {
      const response = await call("frappe.client.get_list", {
        doctype: "Rakhtety Document",
        fields: ["name", "title", "client", "document_type", "workflow_step", "creation"],
        limit_page_length: 100,
        order_by: "creation desc",
      });
      renderDocuments(root, response || []);
    }
  }

  function bindCommon(root) {
    root.on("click", "[data-open-workspace]", () => frappe.set_route("workspace", "Rakhtety"));
    root.on("click", "[data-open-client-form]", (event) => openForm("Rakhtety Client", $(event.currentTarget).data("open-client-form")));
    root.on("click", "[data-open-workflow]", (event) => openForm("Rakhtety Workflow", $(event.currentTarget).data("open-workflow")));
    root.on("click", "[data-open-step]", (event) => openForm("Rakhtety Workflow Step", $(event.currentTarget).data("open-step")));
    root.on("click", "[data-open-employee]", (event) => openForm("Rakhtety Employee", $(event.currentTarget).data("open-employee")));
    root.on("click", "[data-open-document]", (event) => openForm("Rakhtety Document", $(event.currentTarget).data("open-document")));
  }

  window.renderRakhtetySection = function (wrapper, pageKey, title, subtitle) {
    const page = frappe.ui.make_app_page({ parent: wrapper, title, single_column: true });
    const root = shell(pageKey, title, subtitle);
    $(page.body).empty().append(root);
    bindCommon(root);
    configureNativePageActions(page, pageKey, () => loadSection(pageKey, root));
    loadSection(pageKey, root).catch((error) => {
      console.error(error);
      root.find("[data-content]").html(`<div class="rk-empty">حصل خطأ أثناء تحميل الصفحة.</div>`);
    });
  };

  window.renderRakhtetyCommandCenter = function (wrapper) {
    const page = frappe.ui.make_app_page({ parent: wrapper, title: "مكتب رخصتي", single_column: true });
    const root = shell(
      "rakhtety-command-center",
      "مكتب رخصتي",
      "شاشة واحدة بسيطة: المطلوب الآن، ملفات العملاء، وخطوات كل ملف داخل ERPNext."
    );
    $(page.body).empty().append(root);
    bindCommon(root);
    configureNativePageActions(page, "rakhtety-command-center", () => load());

    const state = {
      data: null,
      clients: [],
      selectedClient: null,
    };

    function renderMetrics(summary = {}) {
      return kpis([
        { label: "ملفات مفتوحة", value: summary.active_files || 0, note: "شغل محتاج متابعة", accent: "#0b6b63" },
        { label: "خلصت هذا الشهر", value: summary.completed_this_month || 0, note: "إنجازات الشهر", accent: "#337a36" },
        { label: "مديونية", value: money(summary.pending_debt), note: "فلوس لسه لم تحصل", accent: "#a75313" },
        { label: "مدفوع", value: money(summary.total_paid), note: "إجمالي المقبوض", accent: "#2356b8" },
      ]);
    }

    function renderCommandShell() {
      const queue = state.data.queue || [];
      const clients = state.clients || [];
      const queueTableRows = queue.slice(0, 8).map((item) => `<tr data-client="${html(item.client_id)}">
        ${cell(item.client_name || item.client_id)}
        ${cell(workflowLabel(item.workflow_type))}
        ${cell(stepLabel(item.current_step_name))}
        ${cell(statusLabel(item.current_step_status))}
        ${cell(money(item.outstanding_debt))}
      </tr>`);
      root.find("[data-help]").html(`<div class="rk-help">ابدأ من "المطلوب الآن". لو عايز التفاصيل الخام افتح سجل Frappe من الزر الموجود في كل كارت.</div>`);
      root.find("[data-content]").html(`
        ${renderMetrics(state.data.summary || {})}
        ${panel("المطلوب الآن", "أقرب شغل محتاج متابعة", table(["العميل", "الفلو", "الخطوة", "الحالة", "المديونية"], queueTableRows))}
        <section class="rk-command-grid">
          <aside class="rk-panel">
            <div class="rk-panel-head">
              <div>
                <h2 class="rk-panel-title">ملفات العملاء</h2>
                <div class="rk-panel-note">اختار عميل عشان تشوف كل شغله</div>
              </div>
              <span class="rk-badge">${html(clients.length)}</span>
            </div>
            <div class="rk-panel-body">
              <input class="rk-search" data-client-search placeholder="بحث بالاسم أو الموبايل أو رقم القطعة">
              <div class="rk-list" data-clients-list>${clients.map((client) => clientRow(client, state.selectedClient)).join("") || `<div class="rk-empty">لا يوجد عملاء.</div>`}</div>
            </div>
          </aside>
          <main class="rk-panel">
            <div class="rk-panel-head">
              <div>
                <h2 class="rk-panel-title">ملف العميل</h2>
                <div class="rk-panel-note">الخطوات والمستندات والفلوس في مكان واحد</div>
              </div>
              <span class="rk-badge" data-detail-status>جاهز</span>
            </div>
            <div class="rk-panel-body" data-client-detail>
              <div class="rk-empty">اختار عميل من القائمة أو من المطلوب الآن.</div>
            </div>
          </main>
        </section>
      `);
    }

    function renderClientList(clients) {
      state.clients = clients || [];
      root.find("[data-clients-list]").html(
        state.clients.map((client) => clientRow(client, state.selectedClient)).join("") || `<div class="rk-empty">لا يوجد عملاء.</div>`
      );
    }

    function stepHtml(step, index, currentIndex) {
      const completed = step.status === "completed";
      const current = !completed && index === currentIndex;
      const className = completed ? "completed" : current ? "current" : "";
      return `<div class="rk-step ${className}">
        <div class="rk-dot">${completed ? "✓" : html(step.step_order || index + 1)}</div>
        <div>
          <div class="rk-step-title">${html(stepLabel(step.name || step.id))}</div>
          <div class="rk-row-meta">
            ${html(statusLabel(step.status))}
            ${step.assigned_to ? ` · ${html(step.assigned_to)}` : ""}
            ${step.requires_document ? ` · ${step.required_document_uploaded ? "المستند موجود" : "محتاج مستند"}` : ""}
          </div>
          <div class="rk-chips">
            ${step.fees ? `<span class="rk-badge rk-money">رسوم ${html(money(step.fees))}</span>` : ""}
            ${step.profit ? `<span class="rk-badge rk-money">أتعاب ${html(money(step.profit))}</span>` : ""}
          </div>
        </div>
        <div class="rk-step-actions">
          ${completed ? `<span class="rk-badge good">خلصت</span>` : `<span class="rk-badge">من فورم الخطوة</span>`}
          <button class="rk-button primary tiny" data-open-step="${html(step.id)}">افتح الخطوة</button>
        </div>
      </div>`;
    }

    function workflowHtml(workflow) {
      const steps = workflow.steps || [];
      const currentIndex = steps.findIndex((step) => ["in_progress", "blocked", "pending"].includes(step.status));
      return `<section class="rk-workflow">
        <header class="rk-workflow-head">
          <div>
            <h3 class="rk-workflow-title">${html(workflowLabel(workflow.type))}</h3>
            <div class="rk-row-meta">${html(statusLabel(workflow.status))} · دين ${html(money(workflow.outstanding_debt))}</div>
          </div>
          <button class="rk-button ghost tiny" data-open-workflow="${html(workflow.id)}">افتح الفلو الخام</button>
        </header>
        <div class="rk-steps">${steps.map((step, index) => stepHtml(step, index, currentIndex)).join("")}</div>
      </section>`;
    }

    async function selectClient(clientId) {
      state.selectedClient = clientId;
      root.find("[data-client]").removeClass("active");
      root
        .find("[data-client]")
        .filter((_, element) => $(element).data("client") === clientId)
        .addClass("active");

      const [client, workflows] = await Promise.all([
        call("rakhtety_frappe.api.get_client_detail", { client: clientId }),
        call("rakhtety_frappe.api.list_client_workflows", { client: clientId }),
      ]);
      const workflowRows = workflows.workflows || [];
      root.find("[data-detail-status]").text(workflowRows.length ? "ملف نشط" : "ملف جديد");
      root.find("[data-client-detail]").html(`
        <section class="rk-client-head">
          <div>
            <h2 class="rk-client-name">${html(client.name || client.title || client.id)}</h2>
            <div class="rk-client-meta">
              <span>${html(client.phone || "بدون موبايل")}</span>
              <span>${html(client.city || "بدون مدينة")}</span>
              <span>${html(client.parcel_number || "بدون رقم قطعة")}</span>
            </div>
          </div>
          <div class="rk-actions">
            <button class="rk-button primary tiny" data-open-client-form="${html(client.id)}">افتح العميل في Frappe</button>
            <button class="rk-button tiny" data-open-list="Rakhtety Workflow">قائمة الفلوهات</button>
          </div>
        </section>
        ${workflows.excavationPermitBlocked ? `<div class="rk-card rk-row-meta">تصريح الحفر مقفول لحد ما رخصة الجهاز تخلص. ده مقصود عشان ترتيب الشغل يفضل صح.</div>` : ""}
        ${workflowRows.length ? workflowRows.map(workflowHtml).join("") : `<div class="rk-empty">لسه مفيش فلو للعميل ده.</div>`}
      `);
    }

    async function load() {
      state.data = await call("rakhtety_frappe.api.command_center_data");
      state.clients = state.data.clients || [];
      renderCommandShell();
      if (state.selectedClient) {
        await selectClient(state.selectedClient);
      }
    }

    root.on("click", "[data-refresh]", load);
    root.on("click", "[data-client]", (event) => selectClient($(event.currentTarget).data("client")));
    root.on("click", "[data-open-list]", (event) => openList($(event.currentTarget).data("open-list")));
    root.on("input", "[data-client-search]", frappe.utils.debounce(async (event) => {
      renderClientList(await call("rakhtety_frappe.api.list_clients", { search: $(event.currentTarget).val() }));
    }, 250));

    load().catch((error) => {
      console.error(error);
      root.find("[data-content]").html(`<div class="rk-empty">حصل خطأ أثناء تحميل مكتب رخصتي.</div>`);
    });
  };
})();
