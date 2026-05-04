frappe.pages["rakhtety-workflows"].on_page_load = function (wrapper) {
  $.getScript("/assets/rakhtety_frappe/rakhtety/desk_sections.js?v=date-format-20260504").then(() => {
    window.renderRakhtetySection(wrapper, "rakhtety-workflows", "الفلو والخطوات", "كل ملف واقف فين، والخطوة الجاية إيه.");
  });
};
