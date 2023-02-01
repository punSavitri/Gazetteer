//global variables
var myMap;
var lyrOSM;
var lyrOpenTopo;
var lyrEsriWorldImagery;
var baseLayers;
var overlays;
var ctrlPan;
var ctrlEasyButton;
var ctrlSidebar;

$(document).ready(function () {
  //create leaflet map object
  myMap = L.map("map_div", {
    center: [51.2625, -1.0871],
    zoom: 13,
    zoomControl: false,
  });

  //adding marker to map
  L.marker([51.2625, -1.0871])
    .addTo(myMap)
    .bindPopup("Basingstoke")
    .openPopup();

  //adding  raster layers as base map
  lyrOSM = L.tileLayer.provider("OpenStreetMap.Mapnik");

  lyrOpenTopo = L.tileLayer.provider("OpenTopoMap");

  lyrEsriWorldImagery = L.tileLayer
    .provider("Esri.WorldImagery")
    .myMap.addLayer(lyrOSM);

  baseLayers = {
    "OpenStreetMap" : lyrOSM,
    "OpenTopoMap" : lyrOpenTopo,
    "Esri.WorldImagery" : lyrEsriWorldImagery,
  };
  overlays = {
    "OpenStreetMap": lyrOSM,
    "OpenTopoMap": lyrOpenTopo,
    "Esri.WorldImagery": lyrEsriWorldImagery,
  };

  L.control.layers(baseLayers, overlays).addTo(myMap);

  //add panControl() method in myMap
  ctrlPan = L.control.pan();
  ctrlPan.addTo(myMap);

  //adding easybutton and sidebar toggle()
  ctrlEasyButton = L.easyButton("fas fa-exchange", function () {
    ctrlSidebar.toggle();
  }).addTo(myMap);

  //country list
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
});
