var myMap;
$(document)
  .ready(function () {
    //dropdown list of countries
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

    // //create leaflet map object
    var myMap = L.map("map_div").setView([0, 0], 13);

    // //adding marker to map

    // //adding  raster layers as base map
    var lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 13,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    myMap.addLayer(lyrOsm);

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
        url: "php/getCountryBorders.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
          console.log(response);
          L.geoJson(
            response,
            { onEachFeature: forEachFeature },
            { style: myStyle }
          ).addTo(myMap);
        },
        error: function (error) {
          console.log(error);
        },
      });
      myMap.fitBounds(response.getBounds());
    });

    function forEachFeature(feature, layer) {
      if (feature.geometry.type === "MultiPolygon") {
        layer.bindPopup(feature.geometry.coordinates.join(""));
      }
    }
  })
  .addTo(myMap);

//set style for layer
function myStyle(feature) {
  return {
    fillColor: "yello",
    color: "green",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.7,
  };
}
