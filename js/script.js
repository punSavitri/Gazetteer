var myMap;
var lyrOsm;
var layer;
var marker;
var circle;
var zoomed;
var border;
var easyButton;
var easyButtonWeather;
var lat, lng, accuracy;
var bounds;

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
  myMap = L.map("map_div").fitWorld();

  // Basemap
  lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  var stamenTerrain = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      minZoom: 0,
      maxZoom: 18,
      ext: "png",
    }
  );
  var stamenTonerLite = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      minZoom: 0,
      maxZoom: 20,
      ext: "png",
    }
  );

  myMap.addLayer(lyrOsm);

  //leaflet layer control
  var baseMaps = {
    "Open Street Map": lyrOsm,
    "Stamen Terrain": stamenTerrain,
    "Stamen Toner Lite": stamenTonerLite,
  };

  // var overlayMaps = {
  //   "Police Station": policeStation,
  //   Airports: airports,
  // };
  L.control.layers(baseMaps).addTo(myMap);

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
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.textStatus);
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

        $("#myModal").modal("show");

        //exchange rate based on currencyCode
        $.ajax({
          url: "php/exchangeRate.php",
          type: "GET",
          dataType: "json",
          data: {
            currencies: result["data"][0]["currencyCode"],
          },
          success: function (data) {
            console.log(data);
            let code = Object.keys(data.data);
            console.log(code);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.textStatus);
          },
        });
        //citiesInfo and set marker on cities
        $.ajax({
          url: "php/citiesInfo.php",
          type: "GET",
          dataType: "json",
          data: {
            //parameter value got from countryInfo
            north: result["data"][0]["north"],
            south: result["data"][0]["south"],
            east: result["data"][0]["east"],
            west: result["data"][0]["west"],
          },
          success: function (response) {
            console.log(response);
            var latitude = response.data[0].lat;
            var longitude = response.data[0].lng;

            var iconOptions = {
              iconUrl: "images/city.png",
              iconSize: [40, 40],
            };
            var customIcon = L.icon(iconOptions);
            var markerOptions = {
              icon: customIcon,
              draggable: true,
            };
            var cityMarker = L.marker([latitude, longitude], markerOptions)
              .addTo(myMap)
              .bindPopup("<b>City: " + response.data[0].name + "</b>")
              .openPopup();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.textStatus);
          },
        });

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
            console.log(jqXHR.textStatus);
          },
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.textStatus);
      },
    });

    $.ajax({
      url: "php/wikipediaSearch.php",
      type: "GET",
      dataType: "json",
      data: {
        placename: $("#select_country").val(),
      },
      success: function (response) {
        console.log(response);
        $("#title").append(response["data"]["geonames"][0]["title"]);
        $("#summary").append(response["data"]["geonames"][0]["summary"]);
        $("#thumbnailImg").attr(
          "src",
          response["data"]["geonames"][0]["thumbnailImg"]
        );
        $("#wikiLink").attr(
          "href",
          "https://" + response["data"]["geonames"][0]["wikipediaUrl"]
        );
        $("#wikiModal").modal("show");
        $(".wikiSearch").click(function () {
          $("#wikiModal").modal("show");
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.textStatus);
      },
    });
  });

  // Get User Location
  if (navigator.geolocation) {
    console.log("Browser support geolocation");
  }
  navigator.geolocation.getCurrentPosition(success, error);

  function success(position) {
    console.log(position);
    $.ajax({
      url: "php/getUserLocation.php",
      type: "GET",
      dataType: "json",
      data: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      success: function (data) {
        console.log(data);
        $("#select_country").val(data.data.countryCode).change();

        lat = position.coords.latitude;
        lng = position.coords.longitude;
        accuracy = position.coords.accuracy;

        var iconOptionsTwo = {
          iconUrl: "images/person.png",
          iconSize: [40, 40],
        };
        var customIconTwo = L.icon(iconOptionsTwo);
        var markerOption = {
          icon: customIconTwo,
          draggable: true,
        };
        var cityMarker = L.marker([lat, lng], markerOption)
          .addTo(myMap)
          .bindPopup("<b>Your are in " + data.data.countryName + ".</b>")
          .openPopup();
        circle = L.circle([lat, lng], {
          radius: accuracy,
          stroke: true,
          color: "black",
          opacity: 1,
          weight: 1,
          fill: true,
          fillColor: "yellow",
          fillOpacity: 0.2,
        }).addTo(myMap);

        myMap.fitBounds(circle.getBounds());
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.textStatus);
      },
    });
  }
  function error(err) {
    if (err.code === 1) {
      alert("Please allow geolocation access");
    } else {
      alert("Browser do not support geolocation.");
    }
  }

  easyButton = L.easyButton(" fa-circle-info fa-2x ", function (btn, map) {
    $("#myModal").modal("show");
  }).addTo(myMap);

  easyButtonWeather = L.easyButton("fa-cloud-sun fa-2x", function (btn, map) {
    $("#myModal2").modal("toggle");
  }).addTo(myMap);

  easyButtonUserLocation = L.easyButton("fa-person fa-3x", function (btn, map) {
    $("#myModal2").modal("show");
  }).addTo(myMap);
});

//easyButton global variable
