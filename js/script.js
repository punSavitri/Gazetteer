$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: "php/getCountryBorders.php",
    dataType: "json",
    success: function (result) {
      console.log(result);

      for (var i = 0; i < result.data.features.length; i++) {
        $("#select_country").append(
          `<option value="${result.data.features[i].properties.iso_a3}">${result.data.features[i].properties.name}</option>`
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
});
