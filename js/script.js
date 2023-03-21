var myMap;
var lyrOsm;
var layer;
var cluster;
var circle;

var border;
var easyButton;
var easyButtonWeather;
var easyButtonOceanInfo;
var clusterMarkers;
var control;

var bounds;
var earthquakeMarkers;
var earthquake;
var toponymMarkers;
var cityMarkers;
var cities;
var cityIcon;
var poiPlace;
var poiIcon;
var markers;
var userMarker;
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
  var streets = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
  );
  var satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    }
  );
  //basemaps
  var basemaps = {
    Streets: streets,
    Satellite: satellite,
  };
  //declare myMap object
  myMap = L.map("map_div", {
    layers: [streets],
  }).setView([54.5, -4], 6);

  L.control.locate().addTo(myMap);

  // Marker Cluster Group
  //earthquake cluster marker
  earthquake = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "orange",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5,
    },
  }).addTo(myMap);

  //cities cluster group
  cities = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5,
    },
  }).addTo(myMap);

  //point of interest(poi) cluster group
  poiPlace = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#ffcccb",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5,
    },
  }).addTo(myMap);

  var overlays = {
    Earthquake: earthquake,
    Cities: cities,
    POIPlace: poiPlace,
  };

  var layerControl = L.control.layers(basemaps, overlays).addTo(myMap);
  //custom icon
  earthquakeIcon = L.ExtraMarkers.icon({
    icon: "fa-house-crack",
    markerColor: "orange",
    shape: "penta",
    prefix: "fa",
  });

  cityIcon = L.ExtraMarkers.icon({
    icon: "fa-city",
    markerColor: "green",
    shape: "square",
    prefix: "fa",
  });

  poiIcon = L.ExtraMarkers.icon({
    icon: "fa-location-crosshairs",
    markerColor: "purple",
    shape: "circle",
    prefix: "fa",
  });

  //

  //all markers stored in clusterMarkers
  clusterMarkers = L.markerClusterGroup();

  // sorting country name in alphabetical order
  $("#select_country").change(function () {
    //remove markercluseter
    if (clusterMarkers) {
      clusterMarkers.clearLayers();
    }
    var my_options = $("#select_country option");
    var selected = $("#select_country").val();
    my_options.sort(function (a, b) {
      if (a.text > b.text) return 1;
      if (a.text < b.text) return -1;
      return 0;
    });
    $("#select_country").empty().append(my_options);
    $("#select_country").val(selected);

    //plotting border for selected country
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

        //added country flag
        $.ajax({
          url: "php/countryFlag.php",
          type: "GET",
          dataType: "json",
          data: {
            country_code: result["data"][0]["countryCode"],
          },
          success: function (output) {
            console.log(output);
            $("#flagImg").attr("src", output.data[0].flags.png);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.textStatus);
          },
        });

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
        //     let code = data.data.data[Object.keys(data.data.data)[0]]["code"];
        //     let value =
        //       data.data.data[Object.keys(data.data.data)[0]]["value"].toFixed(
        //         2
        //       );

        //     $("#currency2").append(`<option value="${code}">${code}</option>`);
        //     $("#currency1").append(
        //       `<option value="${value}">${value}</option>`
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

              L.marker([lat, lng], { icon: earthquakeIcon })

                .bindPopup(
                  "<div><h5>Earthquake Details</h5><table><tr><th>Date and Time</th><td>" +
                    output.data[i].datetime +
                    "</td></tr><tr><th>Depth</th><td>" +
                    output.data[i].depth +
                    "</td></tr><tr><th>Magnitude</th><td>" +
                    output.data[i].magnitude +
                    "</td></tr></table></div>",
                  { direction: "top", sticky: true }
                )
                .addTo(earthquake);

              // clusterMarkers.addLayer(earthquakeMarker);
            }
            // myMap.addLayer(clusterMarkers);

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

                for (let i = 0; i < result.data.geonames.length; i++) {
                  var lat = result.data.geonames[i].lat;
                  var lng = result.data.geonames[i].lng;
                  var iconOptions = {
                    iconUrl: "images/placemarker.png",
                    iconSize: [35, 40],
                  };
                  var customIcon = L.icon(iconOptions);
                  var markerOptions = {
                    icon: customIcon,
                  };
                  var toponymMarker = L.marker([lat, lng], markerOptions)
                    .bindPopup(
                      "<b>Toponym Place</b><br>" +
                        result.data.geonames[i].toponymName
                    )
                    .openPopup();
                  clusterMarkers.addLayer(toponymMarker);
                  //toponymModal
                  $("#toponymName").append(result.data.geonames[i].toponymName);
                  $("#name").append(result.data.geonames[i].name);
                  $("#toponymcountryName").append(
                    result.data.geonames[i].countryName
                  );
                  $("#fclName").append(result.data.geonames[i].fclName);
                  $("#distance").append(result.data.geonames[i].distance);
                  $("#time").append(
                    result.data.geonames[i].timezone.timeZoneId
                  );
                }
                myMap.addLayer(clusterMarkers);
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

              L.marker([latitude, longitude], { icon: cityIcon })
                .bindTooltip(response.data[i].name, {
                  direction: "top",
                  sticky: true,
                })
                .addTo(cities);
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

                  L.marker([latitude, longitude], { icon: poiIcon })
                    .bindTooltip(output.data.poi[i].name, {
                      direction: "top",
                      sticky: true,
                    })
                    .addTo(poiPlace);
                }
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

            $("#city").append(data.data.name);
            $("#countryWeather").append(data.data.sys.country);
            $("#weather").append(data.data.weather[0].main);
            $("#weatherobservation").append(data.data.weather[0].description);
            $("#temperature").append(temp).append("&deg;C");
            $("#humidity").append(data.data.main.humidity).append("&#37;");
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
    "fa-circle-info fa-1x",
    function (btn, map) {
      $("#myModal").modal("toggle");
    },
    "Country Information"
  ).addTo(myMap);

  easyButtonWeather = L.easyButton(
    "fa-cloud-sun fa-1x",
    function (btn, map) {
      $("#myModal2").modal("toggle");
    },
    "Weather"
  ).addTo(myMap);

  timeZoneButton = L.easyButton(
    "fa-clock-o fa-1x",
    function (btn, map) {
      $("#timezoneModal").modal("toggle");
    },
    "Time Zone"
  ).addTo(myMap);
  toponymButton = L.easyButton(
    "fa-location-dot fa-1x ",
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
    "fa-solid fa-dollar fa-1x ",
    function (btn, map) {
      $("#currencyModal").modal("show");
    },
    "Current Exchange Rate"
  ).addTo(myMap);
});
