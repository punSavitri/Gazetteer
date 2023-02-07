var myMap;
var marker;
var border;

$(document).ready(function () {
  //dropdown list of countries
  $.ajax({
    type: "GET",
    url: "php/getCountryBorders.php",
    dataType: "json",
    success: function (result) {
      console.log(result);

      for (var i = 0; i < result.data.length; i++) {
        $("#select_country").append(
          `<option value="${result.data[i].properties.iso_a2}">${result.data[i].properties.name}</option>`
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });

  // //create leaflet map object
  var myMap = L.map("map_div").setView([51.2665, 1.0924], 8);

  // //adding  tile layer as base map
  var lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 13,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  myMap.addLayer(lyrOsm);

  // // adding customize marker to map
  var orangeLeafMarker = L.icon({
    iconUrl: "leaf-orange.png",
    shadowUrl: "leaf-shadow.png",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76],
  });

  marker = L.maker([51.2665, 1.0924], { icon: orangeLeafMarker });
  marker.addTo(myMap);

  // //add panControl() method in myMap
  var ctrlPan = L.control.pan().addTo(myMap);

  var objBaseLayers = {
    OpenStreetMap: lyrOsm,
  };

  var objOverlays = {
    OpenStreetMap: lyrOsm,
  };

  L.control.layers(objBaseLayers, objOverlays).addTo(myMap);

  //ploting border to selected country
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

        //remove border layer
        if (data.data.name == "ok") {
          if (myMap.hasLayer(border)) {
            myMap.removeLayer(border);
          }
        }
        //set style
        border = L.geoJSON(
          data.data,
          {
            style: function (feature) {
              return {
                color: "green",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3,
              };
            },
          },
          {
            //bind country name when we click on country
            onEachFeature: function (feature, layer) {
              layer.bindPopup(feature.data.properties.name);
            },
          }
        ).addTo(myMap);

        myMap.fitBounds(border.getBounds());
      },
      error: function (error) {
        console.log(error);
      },
    });
  });
});
