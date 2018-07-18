$(function() {
  const destinationField = $("#destination");
  destinationField.select2({
    placeholder: "Select destination",
    ajax: {
      url: params => `/places/${params.term}`,
      dataType: "json"
    },
    minimumInputLength: 3
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
