"use strict";
//list of pre-populated important places
var locations = [
    {
        name: '9/11 Tribute Center',
        myLat: 40.709784,
        myLng: -74.012432,
        photo: 'img/911tribute.jpg',
        address: '120 Liberty St, New York, NY 10006 (212) 393-9160'
    },

    {
        name: 'NY Stock Exchange',
        myLat: 40.707096,
        myLng: -74.010675,
        photo: 'img/stockexchange.jpg',
        address: '11 Wall St, New York, NY 10005 (212) 656-3000'
    },

    {
        name: 'The National September 11 Memorial',
        myLat: 40.713160,
        myLng: -74.013365,
        photo: 'img/911 memorial.jpg',
        address: '10007, 80 Greenwich St, New York, NY 10006'
    },

     {
         name: 'South Street Seaport',
         myLat: 40.705856,
         myLng: -74.001900,
         photo: 'img/seaport.jpg',
         address: 'New York, NY 10038 (212) 732-8257'
     },

     {
         name: 'NY City Hall',
         myLat: 40.713160,
         myLng: -74.006389,
         photo: 'img/cityhall.jpg',
         address: 'City Hall Park New York, NY (212) 639-9675'
     },

     {
         name: 'US Post Office',
         myLat: 40.720497,
         myLng: -74.004107,
         photo: 'img/postoffice.jpg',
         address: '350 Canal St New York, NY 10013'
     },

      {
          name: 'Tribeca Grand Hotel',
          myLat: 40.719418,
          myLng: -74.004788,
          photo: 'img/tribeca.jpg',
          address: '2 Avenue of the Americas, New York, NY 10013, United States tribecagrand.com (212) 519-6600'
      }
];

//declare the place object
var Place = function (data) {
    this.name = ko.observable(data.name);
    this.myLat = data.myLat;
    this.myLng = data.myLng;
    this.marker = data.marker;
    this.position = data.position;
    this.address = ko.observable(data.address);
    this.photo = data.photo;
    this.content = data.content;
    this.icon = data.icon;
    this.type = data.types;
};
//global map variable
var map;
var i;
//These next few functions load google maps and its dependency infobox.js asynchronous.
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

//the initialize function gets called after the js files above are loaded
 var initialize = function () {
    //this just hold a variable with our map centerpoint.
    var newport = new google.maps.LatLng(40.715369, -73.998259);
    //Here we set our map options and any controls we want visible.
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
    //this line created the map
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    //Below we begin our ViewModel which will bind all the map stuff to the view.
    var ViewModel = function () {
        var self = this;
        //array to hold markers
        var markers = [];
        //arrayinfoboxes to hold
        var infoBoxes = [];
        //arrays to hold our different lists
        self.placeList = ko.observableArray([]);
        self.impPlaceList = ko.observableArray([]);
        self.searchTerm = ko.observable('restaurant');
        self.couponList = ko.observableArray([]);
        self.filter = ko.observable('');
        //Now we need to set and place our map controls on the map.
        var responsive = (document.getElementById('responsive'));
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(responsive);
        var couponList = (document.getElementById('couponList'));
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(couponList);
        var impList = (document.getElementById('impList'));
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(impList);
        var list = (document.getElementById('list'));
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(list);
        var input = (document.getElementById('search-input'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        //Here we create a searchbox that is using google places api autocomplete
        var search = (document.getElementById('search'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(search);
        var searchBox = new google.maps.places.SearchBox(
          (input));
        //this creates a new  google places service. 
        var service = new google.maps.places.PlacesService(map);
        //Now we set our search options that will populate the page on initial load.
        var request = {
            location: newport,
            radius: 2500,
            query: 'food'
        };
        //get all lists and set them on the map
        getSqoot('restaurant');
        service.textSearch(request, callback);
        searchListener(searchBox);
        setImpPlaces();

        //This is a computed observable that we will use to populate our list. This computed observable is waht filters out the list based on user input.
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
        //Here we do the same thing as above but for our local deals list.
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

        //This is the  observable function I used to display and hide markers as the user is filtering the results. This needs improvement. It seems like it is too heavy to perform a simple task. I am thinking the correct way would 
        //be to create a custom binding directly to the view that will hold the markers, but I could not get that to work. 
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
            }

            for (i = 0; i < retained.length; i++) {
                var place2 = retained[i];
                place2.marker.setVisible(true);
            }

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
            }

            for (i = 0; i < retained.length; i++) {
                var place2 = retained[i];
                place2.marker.setVisible(true);
            }

            return results;
        }, self);
        //this is the function that is called when user clicks on a place in the list. It pans the map to the selected marker. I set the annimation of the marker to bounce. To get it to stop bouncing I used the setTimeout function to stop bouncing after 4 seconds.
        self.clickMarker = function (place) {
            closeAllBoxes();
            map.panTo(place.position);
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () { stopBounce(place); }, 4000);
        };

        function stopBounce(place) {
            place.marker.setAnimation(null);
        }

        //When we place a search with google maps, the results are returned to this callback function.
        //What we are doing here is getting the placeId from the returned results, and pass this Id into google places detailed search, which will return all the detailed results of each place.
        function callback(results, status) {
            var service = new google.maps.places.PlacesService(map);
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
        //This is the function that gets the results from the place detail search above. Once we get the results we need to parsse it and set some properties before we create the place object. I alos set icon and content here, which hold the info  for the marker.
        //Then we create a marker and hold the marker in the place.marker object. Then we push the place to the placeList and call the markerListener function, which sets an event listener on each marker.
        function callbackDetails(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                place.address = place.formatted_address;
                place.phone = place.formatted_phone_number;
                place.position = place.geometry.location;
                if (place.reviews) {
                    place.review = place.reviews[0].text;
                }
                if (place.photos) {
                    place.photo = place.photos[0].getUrl({ 'maxWidth': 200, 'maxHeight': 200 });
                }
                place.content = '<div id="infobox"><img src="' + place.photo + '"><p>' + place.name + '</p><p>' + place.phone + '</p><p>' + place.address + '</p><p> Avg. Rating:' + place.rating + '</p><p>' + place.review + '</p></div>';
                place.icon = 'http://google.com/mapfiles/ms/micons/red-pushpin.png';
                place.marker = createSearchMarker(place);
                self.placeList.push(new Place(place));
                markerListener(place);
            }
        }
        //Here we create the marker for each place and push each marker to the markers array.
        function createSearchMarker(place) {
            var marker = new google.maps.Marker({
                map: map,
                position: place.position,
                animation: google.maps.Animation.DROP,
                icon: place.icon
            });
            marker.setVisible(false);
            markers.push(marker);
            return marker;

        }
        //This is the marker listener that we called earlier. THis is the function that opens up the infobox when a marker is clicked.
        function markerListener(place) {
            google.maps.event.addListener(place.marker, 'click', function () {
                closeAllBoxes();
                var infoBox = new InfoBox({
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
        //This is the function that creates an event listener when user types in the searchbox. Earlier we used the google places searchbox for autocomplete results. But here I Decided to run the search with google maps api instead of the palces library. 
        //basically I preferd the autocomplete of google places and the search results of google maps text search. 
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
        //This function will launch the Ajax request to the sqoot server to get local deals.
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
                beforeSend: function () {
                    $('#image').show();
                },
                complete: function () {
                    $('#image').hide();
                },
                success: function (response) {
                    var dealList = response['deals'];

                    for (var i = 0; i < dealList.length; i++) {
                       var deal = dealList[i];
                        getSqootPlaces(deal);
                    }
                    clearTimeout(sqootRequestTimeout);
                }
            });
        }
        //This function takes the results from the ajax call, parses it appropriately andcreates the list of local deals.
        function getSqootPlaces(deals) {
            var lat = deals.deal.merchant.latitude;
            var lng = deals.deal.merchant.longitude;
            deals.position = new google.maps.LatLng(lat, lng);
            deals.icon = 'http://maps.google.com/mapfiles/kml/pal2/icon61.png';
            deals.photo = deals.deal.image_url;
            deals.addressFormatted = deals.deal.merchant.address + '<br/>' + deals.deal.merchant.locality + ', ' + deals.deal.merchant.region;
            deals.address = deals.deal.merchant.address + '  ' + deals.deal.merchant.locality + ', ' + deals.deal.merchant.region;
            deals.dealTitle = deals.deal.short_title;
            deals.name = deals.deal.merchant.name;
            deals.marker = createSearchMarker(deals);
            deals.url = deals.deal.url;
            deals.content = '<div id="infobox"><img class="markerImg" src="' + deals.photo + '"><p>' + deals.name + '</p><p>' + deals.addressFormatted + '</p><p> Coupon:<br/>' + deals.dealTitle + '</p><li><a class="dealUrl" href="' + deals.url + '">' + deals.url + '</a></li></div>';
            self.couponList.push(new Place(deals));
            markerListener(deals);
        }
        //This function takes our list of locations we created with important places and creates the proper place object with each location and creates markers and impPlaces list.
        function setImpPlaces() {
            for (i = 0; i < locations.length; i++) {
                var place = locations[i];
                place.position = new google.maps.LatLng(place.myLat, place.myLng);
                place.icon = 'http://google.com/mapfiles/ms/micons/flag.png';
                place.marker = createSearchMarker(place);
                place.marker.setVisible(true);
                place.content = '<div id="infobox"><img class="photo" src="' + place.photo + '"><p>' + place.name + '</p><p>' + place.address + '</p></div>';
                self.impPlaceList.push(new Place(place));
                markerListener(place);
            }
        }

        function closeAllBoxes() {
            //close all infoboxes on map
            for (var i = 0; i < infoBoxes.length; i++) {
                infoBoxes[i].close();
            }
        }

        function removeMarkers(list) {
            //Hide's all markers in list
            for (var i = 0; i < list().length; i++) {
                var marker = list()[i].marker;
                marker.setVisible(false);
            }
        }
    };

    ko.applyBindings(new ViewModel());
};



