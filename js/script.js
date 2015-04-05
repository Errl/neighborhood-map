var locations = [
    {
        name: '9/11 Tribute Center',
        myLat: 40.709784,
        myLng: -74.012432,
        photo: 'img/911tribute.jpg'
    },

    {
        name: 'NY Stock Exchange',
        myLat: 40.707096,
        myLng: -74.010675,
        photo: 'img/stockexchange.jpg'
    },

    {
        name: 'The National September 11 Memorial',
        myLat: 40.713160,
        myLng: -74.013365,
        photo: 'img/911 memorial.jpg'
    },

     {
         name: 'South Street Seaport',
         myLat: 40.705856,
         myLng: -74.001900,
         photo: 'img/seaport.jpg'
     },

     {
         name: 'NY City Hall',
         myLat: 40.713160,
         myLng: -74.006389,
         photo: 'img/cityhall.jpg'
     },

     {
         name: 'US Post Office',
         myLat: 40.716313,
         myLng: -74.036905,
         photo: 'img/postoffice.jpg'
     }
]


var Place = function (data) {
    this.name = ko.observable(data.name);
    this.myLat = data.myLat;
    this.myLng = data.myLng;
    this.marker = data.marker;
    this.position = data.position;
    this.address =ko.observable(data.address);
    this.photo = data.photo;
    this.content = data.content;
    this.icon = data.icon;
    this.type = data.types;
}
var map;
function addScript(url, callback) {
    var script = document.createElement('script');
    if (callback) script.onload = callback;
    script.type = 'text/javascript';
    script.src = url;
    document.body.appendChild(script);
}

function loadMapsAPI() {
    addScript('https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyDLRxZMTqapXSFfZG3_NGCTJc3R_NvBAro&sensor=false&callback=mapsApiReady');
}

function mapsApiReady() {
    addScript('js/lib/infobox.js', initialize);
}

window.onload = loadMapsAPI;

initialize = function () {
    var newport = new google.maps.LatLng(40.715369, -73.998259);

    var mapOptions = {
        zoom: 14,
        center: newport,
        draggablecursur: null,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER
        },
        panControl: false,
        panControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_TOP
        },
        scaleControl: true,  // fixed to BOTTOM_RIGHT
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        }
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var ViewModel = function () {
        var self = this;
        var markers = [];
        var infoBoxes = [];
        self.placeList = ko.observableArray([]);
        self.impPlaceList = ko.observableArray([]);
        self.searchTerm = ko.observable('restaurant');
        self.couponList = ko.observableArray([]);
        self.filter = ko.observable('');
        self.filterDeal = ko.observable('');

        var couponList = (document.getElementById('couponList'));
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(couponList);
        var impList = (document.getElementById('impList'));
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(impList);
        var list = (document.getElementById('list'));
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(list);
        var input = (document.getElementById('search-input'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var search = (document.getElementById('search'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(search);
        var searchBox = new google.maps.places.SearchBox(
          (input));

        var service = new google.maps.places.PlacesService(map);

        var request = {
            location: newport,
            radius: 2500,
            query: 'food'
        };

        getSqoot('restaurant');
        service.textSearch(request, callback);
        searchListener(searchBox);
        setImpPlaces();

        self.filteredItems = ko.computed(function () {
            var filter = this.filter().toLowerCase();
            if (!filter) {
                return self.placeList();
            } else {
                return ko.utils.arrayFilter(self.placeList(), function (item) {
                    var results = (item.name().toLowerCase().indexOf(filter) !== -1) || (item.address().toLowerCase().indexOf(filter) !== -1);
                    return results;
                });
            }
        }, self);

        self.filteredDeals = ko.computed({
            read: function () {
                var filter = this.filter().toLowerCase();
                if (!filter) {
                    return self.couponList();
                } else {
                    return ko.utils.arrayFilter(self.couponList(), function (item) {
                        var results = (item.name().toLowerCase().indexOf(filter) !== -1) || (item.address().toLowerCase().indexOf(filter) !== -1);

                        return results;
                    });
                }
            }
        }, self);

        self.togglePlacesMarkers = ko.dependentObservable(function () {
            //find out the categories that are missing from uniqueNames
            var differences = ko.utils.compareArrays(self.placeList(), self.filteredItems());
            //return a flat list of differences
            var results = [];
            var retained = [];
            ko.utils.arrayForEach(differences, function (difference) {
                if (difference.status === "deleted") {
                    results.push(difference.value);
                }
                else if (difference.status === "retained") {
                    retained.push(difference.value);
                }
            });

            for (i = 0; i < results.length; i++) {
                var place = results[i];
                place.marker.setVisible(false);
            };

            for (i = 0; i < retained.length; i++) {
                var place = retained[i];
                place.marker.setVisible(true);
            };

            return results;
        }, self);

        self.toggleDealsMarkers = ko.dependentObservable(function () {
            //find out the categories that are missing from uniqueNames
            var differences = ko.utils.compareArrays(self.couponList(), self.filteredDeals());
            //return a flat list of differences
            var results = [];
            var retained = [];
            ko.utils.arrayForEach(differences, function (difference) {
                if (difference.status === "deleted") {
                    results.push(difference.value);
                }
                else if (difference.status === "retained") {
                    retained.push(difference.value);
                }
            });

            for (i = 0; i < results.length; i++) {
                var place = results[i];
                place.marker.setVisible(false);
            };

            for (i = 0; i < retained.length; i++) {
                var place = retained[i];
                place.marker.setVisible(true);
            };

            return results;
        }, self);

        self.clickMarker = function (place) {
            closeAllBoxes();
            map.panTo(place.position);
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () { stopBounce(place); }, 4000);
        };

        function stopBounce(place) {
            place.marker.setAnimation(null);
        };


        function callback(results, status) {
            var service = new google.maps.places.PlacesService(map);
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    var search = {
                        placeId: place.place_id
                    };
                    service.getDetails(search, callbackDetails);
                };
            };
        };

        function callbackDetails(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                place.address = place.formatted_address;
                place.phone = place.formatted_phone_number;
                place.position = place.geometry.location;
                if (place.reviews) {
                    place.review = place.reviews[0].text;
                    //for (i = 0; i > place.reviews.length; i++) {
                    //    var fullReviews = place.reviews[i];
                    //var rev = fullReviews.aspect[0].rating;
                    //var tev = fullReviews.aspect[0].type;
                    //console.log(rev + tev);
                    //}
                }
                if (place.photos) {
                    place.photo = place.photos[0].getUrl({ 'maxWidth': 200, 'maxHeight': 200 });
                }
                place.content = '<div id="infobox"><img src="' + place.photo + '"><p>' + place.name + '</p><p>' + place.phone + '</p><p>' + place.address + '</p><p> Avg. Rating:' + place.rating + '</p><p>' + place.review + '</p></div>'
                place.icon = 'http://google.com/mapfiles/ms/micons/red-pushpin.png'
                place.marker = createSearchMarker(place);
                self.placeList.push(new Place(place));
                markerListener(place);
            }
        }

        function createSearchMarker(place) {
            var marker = new google.maps.Marker({
                map: map,
                position: place.position,
                animation: google.maps.Animation.DROP,
                icon: place.icon
            });
            marker.setVisible(false);
            return marker;
            markers.push(marker);
        }

        function markerListener(place) {
            google.maps.event.addListener(place.marker, 'click', function () {
                closeAllBoxes();
                infoBox = new InfoBox({
                    content: place.content,
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
                infoBoxes.push(infoBox);
                infoBox.open(map, this);
                setTimeout(function () { infoBox.close(); }, 10000);
            });
        }

        function searchListener(searchBox) {
            var service = new google.maps.places.PlacesService(map);

            google.maps.event.addListener(searchBox, 'places_changed', function () {
                var bounds = map.getBounds();
                var input = $('#search-input').val();
                var request = {
                    location: newport,
                    radius: 2000,
                    query: input
                };
                removeMarkers(self.placeList);
                removeMarkers(self.couponList)
                self.placeList.removeAll();
                self.couponList.removeAll();
                getSqoot(input);
                service.textSearch(request, callback);
                map.fitBounds(bounds);
                map.setZoom(14);
            });
            google.maps.event.addListener(map, 'bounds_changed', function () {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });
        }

        function getSqoot(input) {
            // load wikipedia data
            var sqootUrl = 'http://api.sqoot.com/v2/deals?api_key=sq7r8u&query=' + input + '&location=10013&radius=1';
            var sqootRequestTimeout = setTimeout(function () {
              $('#dealTitle').text("failed to get wikipedia resources");
            }, 8000);

            $.ajax({
                url: sqootUrl,
                dataType: "jsonp",
                //jsonp: "callback",
                success: function (response) {
                    var dealList = response['deals'];

                    for (var i = 0; i < dealList.length; i++) {
                        deal = dealList[i];
                        getSqootPlaces(deal);
                    };
                    clearTimeout(sqootRequestTimeout);
                }
            });
        }

        function getSqootPlaces(deals) {
            var lat = deals.deal.merchant.latitude;
            var lng = deals.deal.merchant.longitude;
            deal.position = new google.maps.LatLng(lat, lng);
            deal.icon = 'http://maps.google.com/mapfiles/kml/pal2/icon61.png';
            deal.photo = deals.deal.image_url;
            deal.addressFormatted = deals.deal.merchant.address + '<br/>' + deals.deal.merchant.locality + ', ' + deals.deal.merchant.region;
            deal.address = deals.deal.merchant.address + '  ' + deals.deal.merchant.locality + ', ' + deals.deal.merchant.region;
            deal.dealTitle = deals.deal.short_title;
            deal.name = deals.deal.merchant.name;
            deal.marker = createSearchMarker(deal);
            deal.url = deals.deal.url;
            deal.content = '<div id="infobox"><img class="markerImg" src="' + deal.photo + '"><p>' + deal.name + '</p><p>' + deal.addressFormatted + '</p><p> Coupon:<br/>' + deal.dealTitle + '</p><li><a class="dealUrl" href="' + deal.url + '">' + deal.url + '</a></li></div>';
            self.couponList.push(new Place(deal));
            markerListener(deal);
        }

        function setImpPlaces() {
            for (i = 0; i < locations.length; i++) {
                var place = locations[i];
                place.position = new google.maps.LatLng(place.myLat, place.myLng);
                place.icon = 'http://google.com/mapfiles/ms/micons/flag.png',
                place.marker = createSearchMarker(place);
                place.marker.setVisible(true);
                place.content = '<div id="infobox"><img class="photo" src="' + place.photo + '"><p>' + place.name + '</p></div>'
                self.impPlaceList.push(new Place(place));
                markerListener(place);
            }
        }

        function closeAllBoxes() {
            //remove all markers from map
            for (var i = 0; i < infoBoxes.length; i++) {
                infoBoxes[i].close();
            }
        }

        function removeMarkers(list) {
            //remove all markers from map
            for (var i = 0; i < list().length; i++) {
                var marker = list()[i].marker;
                marker.setVisible(false);
            }
        }
    }

    ko.applyBindings(new ViewModel());
}


