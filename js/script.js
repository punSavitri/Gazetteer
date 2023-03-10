var myMap;
var lyrOsm;
var layer;
var cluster;
var circle;
var marker;

var border;
var easyButton;
var easyButtonWeather;
var easyButtonOceanInfo;

var bounds;
var earthquakeMarker;
var userMarker;
var cityMarker;
var stamenWatercolor;
var stamenTerrain;

$(document).ready(() => {
  //shows dropdown list of countries from countryBordersgeojson file
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

  // Basemap layers default is open street map layer (lyrOsm)
  lyrOsm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  stamenTerrain = L.tileLayer(
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
  stamenWatercolor = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      minZoom: 1,
      maxZoom: 16,
      ext: "jpg",
    }
  );
  myMap.addLayer(lyrOsm);

  //create marker cluster group
  cluster = L.markerClusterGroup();
  // var markers = L.markerClusterGroup({
  //   iconCreateFunction: function(cluster) {
  //     return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
  //   }
  // });

  //leaflet layer control
  var baseMaps = {
    "Open Street Map": lyrOsm,
    "Stamen Terrain": stamenTerrain,
    "Stamen Water Color": stamenWatercolor,
  };
  // var overlayMap = {
  //   "Marker Cluster": cluster,
  // };
  L.control.layers(baseMaps).addTo(myMap);

  // ploting border to selected country
  $("#select_country").change(function () {
    var my_options = $("#select_country option");
    var selected = $("#select_country").val();
    my_options.sort(function (a, b) {
      if (a.text > b.text) return 1;
      if (a.text < b.text) return -1;
      return 0;
    });
    $("#select_country").empty().append(my_options);
    $("#select_country").val(selected);

    //added country flag api
    $("#flagImg").attr(
      "src",
      "https://countryflagsapi.com/png/" + $("#select_country").val()
    );
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

    //it return country information
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

        // //return current exchange rate base currency is USD
        // $.ajax({
        //   url: "php/exchangeRate.php",
        //   type: "GET",
        //   dataType: "json",
        //   data: {
        //     currencies: result["data"][0]["currencyCode"],
        //   },
        //   success: function (data) {
        //     console.log(data);
        //     let code = data.data.data[Object.keys(data.data.data)[0]].code;
        //     let value = data.data.data[Object.keys(data.data.data)[0]].value;
        //     value = value.toFixed(2);
        //     console.log(code);
        //     console.log(value);
        //     $("#exchangeRate").append(
        //       `<h6>Current Currency Exchange Rate</h6> 1USD = ${value}&nbsp;${code}`
        //     );
        //   },
        //   error: function (jqXHR, textStatus, errorThrown) {
        //     console.log(jqXHR.textStatus);
        //   },
        // });

        // returns a list of earthquakes, ordered by magnitude, based on country selection
        $.ajax({
          url: "php/earthquakeInfo.php",
          type: "GET",
          dataType: "json",
          data: {
            north: result["data"][0]["north"],
            south: result["data"][0]["south"],
            east: result["data"][0]["east"],
            west: result["data"][0]["west"],
          },
          success: function (output) {
            console.log(output);
            for (var i = 0; i < output.data.length; i++) {
              let lat = output.data[i].lat;
              let lng = output.data[i].lng;
              var iconOptions = {
                iconUrl: "images/earthquake.png",
                iconSize: [40, 40],
              };
              var customIcon = L.icon(iconOptions);
              var markerOptions = {
                icon: customIcon,
              };
              earthquakeMarker = L.marker([lat, lng], markerOptions)
                .addTo(myMap)
                .bindPopup(
                  "<div><p><b>Earthquake Activity</b><br><b>Date and Time:</b> " +
                    output.data[i].datetime +
                    "<br><b>Depth:</b> " +
                    output.data[i].depth +
                    "<br><b>Magnitude:</b> " +
                    output.data[i].magnitude +
                    "</p></div>"
                )
                .openPopup();
            }

            //it returns the  closest toponym places for the lat/lng query
            $.ajax({
              url: "php/findNearbyToponym.php",
              type: "GET",
              dataType: "json",
              data: {
                lat: output.data[0].lat,
                lng: output.data[0].lng,
              },
              success: function (result) {
                console.log(result);
                var lat = result.data.geonames[0].lat;
                var lng = result.data.geonames[0].lng;
                var iconOptions = {
                  iconUrl: "images/placemarker.png",
                  iconSize: [35, 40],
                };
                var customIcon = L.icon(iconOptions);
                var markerOptions = {
                  icon: customIcon,
                };
                var toponymMarker = L.marker([lat, lng], markerOptions)
                  .addTo(myMap)
                  .bindPopup(
                    "<b>Toponyn Name:</b>" + result.data.geonames[0].toponymName
                  )
                  .openPopup();

                $("#toponymName").append(result.data.geonames[0].toponymName);
                $("#name").append(result.data.geonames[0].name);
                $("#toponymcountryName").append(
                  result.data.geonames[0].countryName
                );
                $("#fclName").append(result.data.geonames[0].fclName);

                $("#distance").append(result.data.geonames[0].distance);
                $("#time").append(result.data.geonames[0].timezone.timeZoneId);
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
        //it returns cities information of selected country and added on overlay map
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
            for (let i = 0; i < response.data.length; i++) {
              var latitude = response.data[i].lat;
              var longitude = response.data[i].lng;

              var iconOptions = {
                iconUrl: "images/city.png",
                iconSize: [35, 35],
              };
              var customIcon = L.icon(iconOptions);
              var markerOptions = {
                icon: customIcon,
              };
              cityMarker = L.marker([latitude, longitude], markerOptions)
                .addTo(myMap)
                .bindPopup("<b>City:</b>" + response.data[i].name)
                .openPopup();
            }

            // it will returns the nearest points of interests for the given latitude/longitude at selected country and show as cluster group on map
            $.ajax({
              url: "php/pointOfInterestInfo.php",
              type: "GET",
              dataType: "json",
              data: {
                lat: response.data[0].lat,
                lng: response.data[0].lng,
              },
              success: function (output) {
                console.log(output);
                for (let i = 0; i < output.data.poi.length; i++) {
                  let latitude = output.data.poi[i].lat;
                  let longitude = output.data.poi[i].lng;
                  console.log(latitude);
                  console.log(longitude);

                  var iconOptions = {
                    iconUrl: "images/location.png",
                    iconSize: [35, 35],
                  };
                  var customIcon = L.icon(iconOptions);
                  var markerOption = {
                    icon: customIcon,
                  };
                  var markerOne = L.marker([latitude, longitude], markerOption)
                    .addTo(myMap)
                    .bindPopup(output.data.poi[i].name);

                  var iconOptions = {
                    iconUrl: "images/orange.png",
                    iconSize: [35, 35],
                  };
                  var customIcon = L.icon(iconOptions);
                  var markerOption = {
                    icon: customIcon,
                  };

                  var markerTwo = L.marker([latitude, longitude], markerOption)
                    .addTo(myMap)
                    .bindPopup(output.data.poi[i].typeClass);

                  cluster.addLayer(markerOne, markerTwo);
                }
                myMap.addLayer(cluster);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.textStatus);
              },
            });

            //Time zone for given latitude and longitude
            $.ajax({
              url: "php/getTimeZoneInfo.php",
              type: "GET",
              dataType: "json",
              data: {
                lat: latitude, // get value from citiesInfo
                lng: longitude, //get value from citiesInfo
              },
              success: function (output) {
                console.log(output);
                $("#countryname").append(output.data.countryName);
                $("#sunrise").append(output.data.sunrise);
                $("#sunset").append(output.data.sunset);
                $("#timenow").append(output.data.time);
                $("#timezone").append(output.data.timezoneId);
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

        //current weather information of selected country
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
                " &deg;C" +
                "<br><b>Wind Speed</b>:" +
                data.data.wind.speed +
                " m/s" +
                "<br><b>Wind Direction<b>:" +
                data.data.wind.deg +
                " &deg;</p></div>"
            );
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
    // Wikipedia Fulltext Search/returns the wikipedia entries found for the searchterm country
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

        $("#wikiLink").attr(
          "href",
          "https://" + response["data"]["geonames"][0]["wikipediaUrl"]
        );
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.textStatus);
      },
    });
  });

  // show current location of user's device and highlighting their country on map
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

        var iconOptions = {
          iconUrl: "images/person.png",
          iconSize: [40, 40],
        };
        var customIcon = L.icon(iconOptions);
        var markerOption = {
          icon: customIcon,
        };

        var userMarker = L.marker([lat, lng], markerOption)
          .addTo(myMap)
          .bindTooltip("<b>You are in " + data.data.countryName + ".</b>")
          .openTooltip();
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

        var lc = L.control
          .locate({
            position: "topleft",
            setView: true,
            maxZoom: 16,
            strings: {
              title: "Show My Location",
            },
          })
          .addTo(myMap);

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

  //leaflet easy button

  easyButton = L.easyButton(
    "fa-circle-info fa-2x",
    function (btn, map) {
      $("#myModal").modal("toggle");
    },
    "Country Information"
  ).addTo(myMap);

  easyButtonWeather = L.easyButton(
    "fa-cloud-sun fa-2x",
    function (btn, map) {
      $("#myModal2").modal("toggle");
    },
    "Weather"
  ).addTo(myMap);

  timeZoneButton = L.easyButton(
    "fa-clock-o fa-2x",
    function (btn, map) {
      $("#timezoneModal").modal("toggle");
    },
    "Time Zone"
  ).addTo(myMap);
  toponymButton = L.easyButton(
    "fa-location-dot fa-2x",
    function (btn, map) {
      $("#toponymModal").modal("toggle");
    },
    "Toponym Place Name"
  ).addTo(myMap);
  wikipediaButton = L.easyButton(
    "fa-wikipedia-w fa-1x",
    function (btn, map) {
      $("#wikiModal").modal("show");
    },
    "wikipedia Search"
  ).addTo(myMap);
  currencyModal = L.easyButton(
    "fa-solid fa-dollar fa-2x ",
    function (btn, map) {
      $("#currencyModal").modal("show");
    },
    "Current Exchange Rate"
  ).addTo(myMap);
});
