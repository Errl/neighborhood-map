// JavaScript source code
var map;
var infowindow;

function initialize() {
    var pyrmont = new google.maps.LatLng(-33.8665433, 151.1956316);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: pyrmont,
        zoom: 15
    });

    var request = {
        location: pyrmont,
        radius: 500,
        query: 'restaurant'
    };
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);

    var ViewModel = function () {
        self = this;
        self.searchTerm = ko.observable('');




    }
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
