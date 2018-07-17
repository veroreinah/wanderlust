$(function() {
  // Destination
  if (window.destinations) {
    $.each(window.destinations, (i, e) => {
      $(`#destination option[value='${e.placeId}-${e.name}']`).prop("selected", true);
    });
  }

  const destinationField = $("#destination");
  destinationField.chosen();

  // Dates
  const datesField = $("#dates");
  datesField.daterangepicker({
    autoUpdateInput: false,
    locale: {
      "firstDay": 1
    }
  });
  datesField.on('apply.daterangepicker', function(ev, picker) {
    $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
  });
});
