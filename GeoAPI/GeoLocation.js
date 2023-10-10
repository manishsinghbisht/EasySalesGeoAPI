var GeoLocation = new Object();

var geocoder; //To use later
var map; //Your map
var lstTrenTonZipCodes = [08601, 08602, 08603, 08604, 08605, 08606, 08607, 08608, 08609, 08610, 08611, 08618, 08625, 08629, 08638, 08645, 08646, 08647, 08666, 08695];
var arrayZipCodes = [];
var rcvdData;
var zipCodeCity = '';
var zipCodeState = '';

GeoLocation.init = function () {

    GeoLocation.Initialize();
    //alert('');
    // $(document).ready(Attendance.ready);
    //$("#btnSearch").click(GeoLocation.CodeAddress);
    $("#btnSearch").click(GeoLocation.GetNearByLocations);
    $("#btnSearchRegion").click(GeoLocation.GetNearByLocations);

    //$('input[type="submit"]').click(GeoLocation.CodeAddress);
    // $('.glyphicon-remove-circle').click(Attendance.ClearPrevInputControl);
};

GeoLocation.Initialize = function () {

    geocoder = new google.maps.Geocoder();

    //Default setup
    var latlng = new google.maps.LatLng(40.241914, -74.806212);
    var lstLat = [40.241914, 40.241914, 40.241914];
    var lstLng = [-74.806214, -74.7988214, -74.780214];

    //Set options
    var myOptions = {
        zoom: 12,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    //Initiaize map
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    //Place Marker on click Event Listener
    google.maps.event.addListener(map, 'click', function (event) {
        placeMarker(map, event.latLng);
    });


    ////Adding markers
    //for (var i = 0; i < lstLat.length; i++) {
    //    latlng = new google.maps.LatLng(lstLat[i], lstLng[i])

    //    var marker = new google.maps.Marker({
    //        map: map,
    //        position: latlng
    //    });
    //}

    ////Setup Circle
    //var myCircle = new google.maps.Circle({
    //    center: latlng,
    //    radius: 5000,
    //    strokeColor: "#0000FF",
    //    strokeOpacity: 0.8,
    //    strokeWeight: 2,
    //    fillColor: "#0000FF",
    //    fillOpacity: 0.4
    //});

    ////Draw Circle on map
    //myCircle.setMap(map);
}


GeoLocation.GetNearByLocations = function () {
    //Setup Circle
    var location = $("#location option:selected").text();
    var state = $("#state option:selected").text();
    var zipCode = $("#txtZipCode").val();
    var inputParamForAPI;

    if (state != "" && location != "" && zipCode == "") {
        inputParamForAPI = { city: location, state: state, zipCode: '' };
        GeoLocation.CallAPI(inputParamForAPI);
    } else if (zipCode != "") {
        $('#state').val('');
        $('#location').val('');
        //$('#state').change();
        GeoLocation.ZipCodeAddress();
    }
};

//"http://localhost/GeoAPI/Api/Csv/GetNearbyLocations"
//http://geo.myinetwork.net/Api/Csv/GetNearbyLocations
GeoLocation.CallAPI = function (inputParamForAPI) {
    $.ajax({
        type: "GET",
        url: "http://Kaalika.in/Geo/Api/Csv/GetNearbyLocations",
        data: inputParamForAPI,
        contentType: 'application/json',
        beforeSend: function () {
            $("#divMessage").html("In process...");
        },
        error: function (xhr, status, error) {
            //do something about the error
            var errMsg = xhr.status + "\r\n" + status + "\r\n" + error;
            alert("Ajax postback error occured: " + errMsg);
            $("#divMessage").html("Error...");
        },
        success: function (response) {
            rcvdData = response;
            GeoLocation.SetupMap();
            $("#divMessage").html("Success");
        }
    });
}

GeoLocation.ZipCodeAddress = function () {
    var zipCode = $("#txtZipCode").val();
    //var arrayZipCodes = zipCode.split(',');

    geocoder.geocode({ 'address': zipCode.trim() + ', USA' }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            var addressComponent = results[0]['address_components'];

            // find state data
            var stateQueryable = $.grep(addressComponent, function (x) {
                return $.inArray('administrative_area_level_1', x.types) != -1;
            });

            if (stateQueryable.length) {
                zipCodeState = stateQueryable[0]['long_name'];

                var cityQueryable = $.grep(addressComponent, function (x) {
                    return $.inArray('locality', x.types) != -1;
                });

                // find city data
                if (cityQueryable.length) {
                    zipCodeCity = cityQueryable[0]['long_name'];
                }
            }

            var inputParamForAPI = { city: zipCodeCity, state: zipCodeState, zipCode: zipCode }
            GeoLocation.CallAPI(inputParamForAPI);

        }
        else {
            alert("Geocode was not successful for the following reason: " + status);
        }

        return true;
    });
}


GeoLocation.SetupMap = function () {
    var zipCode = $("#txtZipCode").val();
    var location = '';
    var state = '';

    if (zipCode != "")
    {
        location = zipCodeCity;
        state = zipCodeState;
    }
    else
    {
        location = $("#location option:selected").text();
        state = $("#state option:selected").text();
    }

    geocoder.geocode({ 'address': location + ", " + state + ', USA' }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            //Set options
            var myOptions = {
                zoom: 11,
                center: results[0].geometry.location,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            //Initiaize map
            map = new google.maps.Map(document.getElementById("map"), myOptions);

            //City circles
            var myCircle = new google.maps.Circle({
                center: results[0].geometry.location,
                radius: 5000,
                strokeColor: rcvdData.length > 3 ? "#32CD32" : rcvdData.length <= 1 ? "#ff0000" : "#0000FF",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: rcvdData.length > 3 ? "#32CD32" : rcvdData.length <= 1 ? "#ff0000" : "#0000FF",
                fillOpacity: 0.1
            });
            myCircle.setMap(map);

            var meanLatitude = 0;
            var meanLongitude = 0;

            //Draw markers
            for (var i = 0; i < rcvdData.length; i++) {
                var lat1 = parseFloat(rcvdData[i].Latitude);
                var lng1 = parseFloat(rcvdData[i].Longitude);
                var newLatLng = new google.maps.LatLng(lat1, lng1);
                var marker = new google.maps.Marker({
                    map: map,
                    position: newLatLng,
                    title: rcvdData[i].LocationName
                });
                meanLatitude += lat1;
                meanLongitude += lng1;
            }

            //Median circles position of co-ordinates
            if (rcvdData.length > 1) {
                meanLatitude = meanLatitude / rcvdData.length;
                meanLongitude = meanLongitude / rcvdData.length;
                var meanLatLng = new google.maps.LatLng(meanLatitude, meanLongitude);
                var meanCircle = new google.maps.Circle({
                    center: meanLatLng,
                    radius: 5000,
                    strokeColor: rcvdData.length > 3 ? "#32CD32" : rcvdData.length <= 1 ? "#ff0000" : "#0000FF",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: rcvdData.length > 3 ? "#32CD32" : rcvdData.length <= 1 ? "#ff0000" : "#0000FF",
                    fillOpacity: 0.1
                });

                meanCircle.setMap(map);
            }

        }
    });
}

//Java Script function for reading CSV data
GeoLocation.ReadCSVData = function (allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j = 0; j < headers.length; j++) {
                ////This will push data with header. Ex: "City: Jaipur"
                //tarr.push(headers[j]+":"+data[j]);

                ////This will push data without header. Ex: "Jaipur"
                tarr.push(data[j]);
            }

            lines.push(tarr);
        }
    }
    alert(lines);
}



//Place Marker: Show location (Lat, Lng)
function placeMarker(map, location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    //Place Marker: Show info window with location (Lat, Lng)
    var infowindow = new google.maps.InfoWindow({
        content: 'Latitude: ' + location.lat() +
        '<br>Longitude: ' + location.lng()
    });
    infowindow.open(map, marker);
}

//Cascading Dropdowns
var locations = {
    'New Jersey': ['Newark', 'Jersey City', 'Trenton', 'Hoboken', 'Bayonne', 'Secaucus', 'Fair Lawn', 'AVENEL', 'EAST ORANGE', 'FLORHAM PARK', 'LINDEN'],
    'Florida': ['Miami', 'Orlando', 'Tampa'],
    'California': ['Los Angeles', 'San Fransisco', 'San Diego', 'Oakland', 'San Jose'],
    'Colorado': ['Denvetr', 'Colorado Springs', 'Boulder', 'Aspen'],
    'Washington': ['Seattle', 'Olympia', 'Redmond', 'Mapple Valley'],
    'Arizona': ['Phoenix', 'Tucson', 'Tempe', 'Scottsdale'],
}

var $locations = $('#location');
$('#state').change(function () {
    var state = $(this).val(), lcns = locations[state] || [];

    var html = $.map(lcns, function (lcn) {
        return '<option value="' + lcn + '">' + lcn + '</option>'
    }).join('');
    $locations.html(html);
});


GeoLocation.init();