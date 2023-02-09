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
  var myMap = L.map("map_div").setView([51.2665, 1.0924], 10);

  // //Basemap
  var lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

        //clear border layer
        if (border) {
          border.clearLayers();
        }
        //fetch weather api for country listed in geojson file for current weather
        border = L.geoJSON(data.data, {
          onEachFeature: funcForEachFeature,
          style: funcStyle,
        }).addTo(myMap);

        function funcForEachFeature(feature, layer) {
          layer.on("click", function (e) {
            fetch(
              "http://api.weatherapi.com/v1/current.json?key=39485f949c7847c58a2110603230902&q=" +
                feature.properties.name +
                "&aqi=no"
            )
              .then((response) => response.json())
              .then((data) => {
                var weather =
                  "<div><p><b>Weather:</b>" +
                  data.current.condition.text +
                  data.current.condition.icon +
                  "<br><b>Humidity:</b>" +
                  data.current.humidity +
                  "<br><b>Temperature in &deg;C:</b>" +
                  data.current.temp_c +
                  "<p></div>";
                layer.bindPopup(
                  '<img src="https://countryflagsapi.com/png/' +
                    feature.properties.name +
                    '"width="30px" height="20px"/><h2>' +
                    feature.properties.name +
                    "</h2>" +
                    weather
                );
              })
              .catch((error) => console.log(error));
          });
        }
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
});
