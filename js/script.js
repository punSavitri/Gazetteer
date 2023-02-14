var myMap;
var lyrOsm;
var marker;
var circle;
var zoomed;
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

    //call ajax to get information about country

    $.ajax({
      url: "php/getCountryInfo.php",
      type: "GET",
      dataType: "json",
      data: {
        country: $("#select_country").val(),
        lang: "en",
      },
      success: function (result) {
        console.log(result);
        $("#country").append(result["data"][0]["countryName"]);
        $("#capital").append(result["data"][0]["capital"]);
        $("#population").append(result["data"][0]["population"]);
        $("#languages").append(result["data"][0]["languages"]);
        $("#myModal").modal("show");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
      },
    });

    //selected country weather
    $.ajax({
      url: "php/countryWeatherInfo.php",
      type: "GET",
      dataType: "json",
      data: {
        country: $("#select_country").val(),
        city: "city",
      },
      success: function (data) {
        console.log(data);
        $("#weather_info").append(
          "<h3>Current Weather for" +
            data.name +
            "," +
            data.sys.country +
            "</h3>" +
            "<h3><b>Weather</b>:" +
            data.weather[0].main +
            "</h3>" +
            "<h3><b>Description</b>:<img src='http://openweathermap.org/img/w/" +
            data.weather[0].icon +
            ".png'>" +
            data.weather[0].description +
            "</h3>" +
            "<h3><b>Temperature</b>:" +
            data.main.temp +
            "&deg;C</h3>" +
            "<h3><b>Pressure</b>:" +
            data.main.pressure +
            "hPa</h3>" +
            "<h3><b>Humidity</b>:" +
            data.main.humidity +
            "%</h3>" +
            "<h3><b>Min.Temperature</b>:" +
            data.main.temp_min +
            " &deg;C</h3>" +
            "<h3><b>Max.Temperature<b/>:" +
            data.main.temp_max +
            "&deg;C</h3>" +
            "<h3><b>Wind Speed</b>:" +
            data.wind.speed +
            "m/s</h3>" +
            "<h3><b>Wind Direction<b>:" +
            data.wind.deg +
            "&deg;</h3>"
        );
        $("#weatherModal").modal("show");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
      },
    });
  });
  easyButton = L.easyButton("fa-globe", function (btn, map) {
    $("#myModal").modal("show");
  }).addTo(myMap);
});

//easyButton global variable
