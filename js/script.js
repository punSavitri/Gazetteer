//global variables
var myMap;
var lyrOSM;
var lyrCountry;
var marker;
var baseLayers;
var overlays;
var ctrlPan;
var ctrlEasyButton;
var ctrlSidebar;

$(document).ready(function () {
  //create leaflet map object
  myMap = L.map("map_div").setView([0, 0], 13);

  //adding marker to map
  marker = L.marker([0, 0]).addTo(myMap);

  //adding  raster layers as base map
  lyrOSM = L.tileLayer.provider("OpenStreetMap.Mapnik");

  myMap.addLayer(lyrOSM);
  //add panControl() method in myMap
  ctrlPan = L.control.pan().addTo(myMap);

  baseLayers = {
    OpenStreetMap: lyrOSM,
  };

  overlays = {
    OpenStreetMap: lyrOSM,
    countryBorder: countryBorderJson,
  };

  L.control.layers(baseLayers, overlays).addTo(myMap);

  //dropdown country list
  $("#select_country").click(function () {
    $.ajax({
      type: "GET",
      url: "php/getCountryBorders.php",
      dataType: "json",
      success: function (result) {
        console.log(result);

        for (var i = 0; i < result.data.length; i++) {
          $("#select_country").append(
            `<option value="${result.data[i].properties.iso_a3}">${result.data[i].properties.name}</option>`
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
      },
    });

    //adding geojson data in the map
    var countryBorderJson = L.geoJSON
      .ajax("php/countryBorders.geo.json", {
        pointToLayer: returnCountryBorder,
      })
      .addTo(myMap);
    countryBorderJson.on("data:loaded", function () {
      myMap.fitBounds(countryBorderJson.getBounds());
    });
  });
});

//function
function returnCountryBorder(geoJsonPoint, latlng) {
  return L.circleMarker(latlng, { radius: 10, color: "green" });
}
