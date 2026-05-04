frappe.pages["rakhtety-employees"].on_page_load = function (wrapper) {
  $.getScript("/assets/rakhtety_frappe/rakhtety/desk_sections.js?v=date-format-20260504").then(() => {
    window.renderRakhtetySection(wrapper, "rakhtety-employees", "الموظفين", "الفريق اللي ماسك الشغل والملفات.");
  });
};
