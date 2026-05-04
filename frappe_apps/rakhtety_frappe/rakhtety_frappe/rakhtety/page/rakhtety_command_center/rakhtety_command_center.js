frappe.pages["rakhtety-command-center"].on_page_load = function (wrapper) {
  $.getScript("/assets/rakhtety_frappe/rakhtety/desk_sections.js?v=date-format-20260504").then(() => {
    window.renderRakhtetyCommandCenter(wrapper);
  });
};
