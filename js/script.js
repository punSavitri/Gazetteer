var myMap;
var lyrOsm;
var layer;
var marker;
var circle;
var zoomed;
var border;
var easyButton;
var easyButtonWeather;
var markerCluster;
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

  // create leaflet map object
  myMap = L.map("map_div").setView([51.2665, 1.0924], 18);

  // Basemap
  lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 13,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  myMap.addLayer(lyrOsm);

  // ploting border to selected country
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
        $("#continent").append(result["data"][0]["continent"]);
        $("#capital").append(result["data"][0]["capital"]);
        $("#population").append(result["data"][0]["population"]);
        $("#languages").append(result["data"][0]["languages"]);
        $("#currencyCode").append(result["data"][0]["currencyCode"]);

        $("#myModal").modal("show");

        $.ajax({
          url: "php/countryWeatherInfo.php",
          type: "GET",
          dataType: "json",
          data: {
            city: result["data"][0]["capital"],
          },
          success: function (data) {
            console.log(data);
            let temp = data.data.main.temp;
            temp = Math.floor(temp);

            let min_temp = data.data.main.temp_min;
            min_temp = Math.floor(min_temp);

            let max_temp = data.data.main.temp_max;
            max_temp = Math.floor(max_temp);

            $("#weather_info").append(
              "<div><p><b>City</b>:" +
                data.data.name +
                "," +
                data.data.sys.country +
                "<br><b>Weather</b>:" +
                data.data.weather[0].main +
                "<br><b>Weather Description</b>:<img src='http://openweathermap.org/img/w/" +
                data.data.weather[0].icon +
                ".png'>" +
                data.data.weather[0].description +
                "<br><b>Temperature</b>:" +
                +temp +
                "&deg;C" +
                "<br><b>Pressure</b>:" +
                data.data.main.pressure +
                "hPa" +
                "<br><b>Humidity</b>:" +
                data.data.main.humidity +
                "&#37;" +
                "<br><b>Min.Temperature</b>:" +
                min_temp +
                " &deg;C" +
                "<br><b>Max.Temperature<b/>:" +
                max_temp +
                "&deg;C" +
                "<br><b>Wind Speed</b>:" +
                data.data.wind.speed +
                "m/s" +
                "<br><b>Wind Direction<b>:" +
                data.data.wind.deg +
                "&deg;</p></div>"
            );

            $("#myModal2").modal("show");
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
          },

          //
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
      },
    });
    $.ajax({
      url: "php/wikipediaSearch.php",
      type: "GET",
      dataType: "json",
      data: {
        placename: $("#select_country option:selected").text(),
      },
      success: function (response) {
        console.log(response);
        $("#title").append(response["data"][0]["title"]);
        $("#summary").append(response["data"][0]["summary"]);
        $("#thumbnailImg").append(response["data"][0]["thumbnailImg"]);
        $("#wikiLink").attr(
          "href",
          "https://" + response.data.geonames[0].wikipediaUrl
        );
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
      },
    });
  });
  //
  //Getting user location based on country selection

  if (navigator.geolocation) {
    console.log("hello");
  }
  navigator.geolocation.getCurrentPosition(success, error);

  function success(position) {
    console.log(position);
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    let accuracy = position.coords.accuracy;
    L.marker([lat, lng]).addTo(myMap);
    L.circle([lat, lng], { radius: accuracy }).addTo(myMap);
  }
  function error(err) {
    if (err.code === 1) {
      alert("Please allow geolocation access");
    } else {
      alert("Browser do not support geolocation.");
    }
  }

  //setting position of user
  // function success(position) {
  //   let latitude = position.coords.latitude;
  //   let longitude = position.coords.longitude;
  //   let accuracy = position.coords.accuracy;
  //   L.marker([latitude, longitude]).addTo(myMap);
  //   L.circle([latitude, longitude], { radius: accuracy }).addTo(myMap);
  // }

  easyButton = L.easyButton(" fa-circle-info fa-1.99x ", function (btn, map) {
    $("#myModal").modal("show");
  }).addTo(myMap);

  easyButtonWeather = L.easyButton("fa-cloud fa-1.99x", function (btn, map) {
    $("#myModal2").modal("show");
  }).addTo(myMap);
});

//easyButton global variable
