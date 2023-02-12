var myMap;
var lyrOsm;
var marker;
var border;
var easyButton;
$(document).ready(() => {
  //dropdown list of countries
  $.ajax({
    type: "GET",
    url: "php/selectCountry.php",
    dataType: "json",
    data: {
      iso: $("#select_country").val(),
    },
    success: function (data) {
      console.log(data);

      for (var i = 0; i < data.data.length; i++) {
        $("#select_country").append(
          `<option value="${data.data[i].properties.iso_a2}">${data.data[i].properties.name}</option>`
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });

  // // //create leaflet map object
  myMap = L.map("map_div").setView([51.2665, 1.0924], 10);

  // //Basemap
  lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 13,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  myMap.addLayer(lyrOsm);

  // // adding customize marker to map
  var orangeLeafMarker = L.icon({
    iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-orange.png",
    shadowUrl: "https://leafletjs.com/examples/custom-icons/leaf-shadow.png",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76],
  });

  marker = L.marker([51.2665, 1.0924], { icon: orangeLeafMarker });
  marker.addTo(myMap);

  // //ploting border to selected country
  $("#select_country").change(function () {
    $.ajax({
      url: "php/highlightCountryBorder.php",
      type: "GET",
      dataType: "json",
      data: {
        iso: $("#select_country").val(),
      },
      success: function (data) {
        console.log(data);

        //clear border layer
        if (border) {
          border.clearLayers();
        }

        border = L.geoJSON(data.data, {
          style: funcStyle,
        }).addTo(myMap);

        //set style for feature
        function funcStyle(feature) {
          return {
            color: "green",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.3,
          };
        }

        myMap.fitBounds(border.getBounds());
      },
      error: function (error) {
        console.log(error);
      },
    });
  });

  //call ajax to get information abount country  
  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      $("#country").html(result["data"][0]["countryName"]);
      $("#capital").html(result["data"][0]["capital"]);
      $("#population").html(result["data"][0]["population"]);
      $("#languages").html(result["data"][0]["languages"]);
    },
  });

  //easyButton global variable
  easyButton = L.easyButton("fa-globe", function (btn, map) {
    $("#myModal").modal("show");
  }).addTo(myMap);
});
