$(function() {
  // Destination
  const destinationField = $("#destination");
  destinationField.chosen();

  $("#multiDestination").on("change", function() {
    if ($(this).val() === "true") {
      destinationField.attr("multiple", true);
    } else {
      destinationField.attr("multiple", false);
    }
    destinationField.chosen("destroy");
    destinationField.chosen();
  });

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
