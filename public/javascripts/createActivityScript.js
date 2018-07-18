$(function() {
  const minDate = $("#date").attr("min");
  const maxDate = $("#date").attr("max");

  $('#date').daterangepicker({
    singleDatePicker: true,
    minDate,
    maxDate,
    locale: {
      "firstDay": 1
    }
  });
});
