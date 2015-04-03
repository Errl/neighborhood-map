var locations = [
    {
        name: 'Newport Rental Office',
        myLat: 40.726820,
        myLng: -74.033282
    },

    {
        name: 'Newport Mall',
        myLat: 40.727662,
        myLng: -74.038607
    },

    {
        name: 'The National September 11 Memorial & Museum',
        myLat: 40.713160,
        myLng: -74.013365
    },

     {
         name: 'Holland Tunnel',
         myLat: 40.727416,
         myLng: -74.021116
     },

     {
         name: 'Path Train',
         myLat: 40.726690,
         myLng: -74.034464
     }
]

var ImpPlace = function (data) {
    this.name = data.name;
    this.myLat = data.myLat;
    this.myLng = data.myLng;
    this.marker = data.marker;
    this.position = data.position;
}

var Place = function (data) {
    this.place_id = data.place_id;
    this.position = data.geometry.location;
    this.name = data.name;
    this.marker = data.marker;
    this.image = data.photos;
    this.myLat = data.myLat;
    this.myLng = data.myLng;
}

var Coupon = function (data) {
    this.name = data.name;
    this.strAddress = data.address;
    this.city = data.city;
    this.state = data.state;
    this.myLng = data.lon;
    this.myLat = data.lat;
    this.position = data.position;
    this.marker = data.marker;
}
var ViewModel = function () {
    var self = this;
    var map;
    var markers = [];
    var newport = new google.maps.LatLng(40.729029, -74.034419);
    self.placeList = ko.observableArray([]);
    self.impPlaceList = ko.observableArray([]);
    self.searchTerm = ko.observable('restaurant');
    self.couponList = ko.observableArray([]);
    var mapOptions = {
        zoom: 15,
        center: newport,
        draggableCursor: null
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var request = {
        location: newport,
        radius: 50,
        query: self.searchTerm()
    };

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
    setImpPlaces();
    infowindow = new google.maps.InfoWindow();
    var couponList = (document.getElementById('couponList'));
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(couponList);
    var impList = (document.getElementById('impList'));
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(impList);
    var list = (document.getElementById('list'));
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(list);
    var input = (document.getElementById('search-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(
      (input));
    getDeals();
    searchListener();
    self.clickMarker = function (place) {
        map.panTo(place.position);
        place.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () { stopBounce(place); }, 4000);
    }

    function stopBounce(place) {
        place.marker.setAnimation(null);
    }

    function callbackDetails(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            place.marker = createSearchMarker(place);
            self.placeList.push(new Place(place));
        }
    }

    function searchListener() {
        google.maps.event.addListener(searchBox, 'places_changed', function () {
            var sw = new google.maps.LatLng(40.720024, -74.053204);
            var ne = new google.maps.LatLng(40.739049, -74.014537);
            var bounds = new google.maps.LatLngBounds(sw, ne);
            searchBox.setBounds(bounds);
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // For each place, get the icon, place name, and location.
            self.placeList.removeAll();
            removeMarkers();

            for (var i = 0, place; place = places[i]; i++) {
                var search = {
                    placeId: place.place_id
                };
                service.getDetails(search, callbackDetails);

            }

            map.fitBounds(bounds);
        });
        google.maps.event.addListener(map, 'bounds_changed', function () {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });
    }

    function setImpPlaces() {
        for (i = 0; i < locations.length; i++) {
            var currentPlace = locations[i];
            currentPlace.position = new google.maps.LatLng(currentPlace.myLat, currentPlace.myLng);

            currentPlace.marker = createMarker(currentPlace);

            self.impPlaceList.push(new ImpPlace(currentPlace));

        }
    }

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var search = {
                    placeId: place.place_id
                };
                service.getDetails(search, callbackDetails);
            }
        }
    }
    function createSearchMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function () {
            //if (marker.getAnimation() != null) {
            //    marker.setAnimation(null);
            //} else {
            //    marker.setAnimation(google.maps.Animation.BOUNCE);
            //}
            var photo = place.photos[0].getUrl({ 'maxWidth': 200, 'maxHeight': 200 });
            var address = place.formatted_address;
            var phone = place.formatted_phone_number;
            var rating = place.rating;
            var reviews = place.reviews[0].text;
            infoBox = new InfoBox({
                content: '<div id="infobox"><img src="' + photo + '"><p>' + place.name + '</p><p>' + phone + '</p><p>' + address + '</p><p> Avg. Rating:' + rating + '</p><p>' + reviews + '</p></div>',
                disableAutoPan: false,
                maxWidth: 150,
                pixelOffset: new google.maps.Size(-140, 0),
                zIndex: null,
                boxStyle: {
                    background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
                    opacity: 0.75,
                    width: "280px"
                },
                closeBoxMargin: "12px 4px 2px 2px",
                closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
                infoBoxClearance: new google.maps.Size(1, 1)
            });

            infoBox.open(map, this);
        });
        return marker;
    }
    function createMarker(place) {
        var lat = place.myLat;
        var lng = place.myLng;
        var title = place.name;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map,
            title: title,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
        return marker;
    }


    function removeMarkers() {
        //remove all markers from map
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    function getDeals() {

        // load wikipedia data
        var couponsUrl = 'http://api.8coupons.com/v1/getdeals?key=aa790cd6591f41e79107106f31e1f7ac7e49e42b87087d2b01ad22925d563beb6e24f8a729609425014d48c126143c40&zip=07310&mileradius=5&limit=15';
        //var wikiRequestTimeout = setTimeout(function () {
        //    $wikiElem.text("failed to get wikipedia resources");
        //}, 8000);

        $.ajax({
            url: couponsUrl,
            dataType: "jsonp",
            //jsonp: "callback",
            success: function (response) {
                for (var i = 0; i < response.length; i++) {
                    var coupon = response[i];
                   // coupon.position = new google.maps.LatLng(coupon.lat, coupon.lng);
                    createCouponMarker(coupon);
                };

               // clearTimeout(wikiRequestTimeout);
            }
        });
    }

    function createCouponMarker(coupon) {
        var lat = coupon.lat;
        var lng = coupon.lon;
        coupon.position = new google.maps.LatLng(lat, lng);
        var title = coupon.name;
        coupon.marker = new google.maps.Marker({
            position: coupon.position,
            map: map,
            title: title,
            icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            animation: google.maps.Animation.DROP
        });
        markers.push(coupon.marker);
        google.maps.event.addListener(coupon.marker, 'click', function () {
            var photo = coupon.showImageStandardSmall;
            var address = coupon.address + '<br/>' + coupon.city + ', ' + coupon.state;
            var phone = coupon.phone;
            var dealTitle = coupon.dealTitle;
            var dealSavings = coupon.dealSavings;
            infoBox = new InfoBox({
                content: '<div id="infobox"><img src="' + photo + '"><p>' + coupon.name + '</p><p>' + phone + '</p><p>' + address + '</p><p> Coupon:<br/>' + dealTitle + '</p><p> Savings: $' + dealSavings + '</p></div>',
                disableAutoPan: false,
                maxWidth: 150,
                pixelOffset: new google.maps.Size(-140, 0),
                zIndex: null,
                boxStyle: {
                    background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
                    opacity: 0.75,
                    width: "280px"
                },
                closeBoxMargin: "12px 4px 2px 2px",
                closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
                infoBoxClearance: new google.maps.Size(1, 1)
            });

            infoBox.open(map, this);
        });
        self.couponList.push(new ImpPlace(coupon));
    }
}

ko.applyBindings(new ViewModel)