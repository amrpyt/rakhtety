frappe.pages["rakhtety-finance"].on_page_load = function (wrapper) {
  $.getScript("/assets/rakhtety_frappe/rakhtety/desk_sections.js?v=date-format-20260504").then(() => {
    window.renderRakhtetySection(
      wrapper,
      "rakhtety-finance",
      "الحسابات",
      "المقبوضات والمديونية في جداول بسيطة داخل Frappe."
    );
  });
};
