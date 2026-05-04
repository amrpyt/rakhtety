frappe.pages["rakhtety-clients"].on_page_load = function (wrapper) {
  $.getScript("/assets/rakhtety_frappe/rakhtety/desk_sections.js?v=simple-table-20260504").then(() => {
    window.renderRakhtetySection(wrapper, "rakhtety-clients", "ملفات العملاء", "قائمة بسيطة لكل عميل، والتفاصيل الكاملة داخل سجل Frappe.");
  });
};
