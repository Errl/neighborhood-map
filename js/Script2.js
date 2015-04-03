ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
          mapOptions = {
              zoom: 10,
              center: new google.maps.LatLng(value.centerLat, value.centerLon),
              mapTypeId: google.maps.MapTypeId.ROADMAP
          },
          map = new google.maps.Map(element, mapOptions);

        for (var l in value.locations()) {
            var latLng = new google.maps.LatLng(
                            value.locations()[l].latitude,
                            value.locations()[l].longitude);
            var marker = new google.maps.Marker({
                position: latLng,
                map: map
            });
        }
    }
};

var vm = {
    locations: ko.observableArray([
        { name: "Cleveland", latitude: 41.48, longitude: -81.67 },
        { name: "Parma", latitude: 41.40, longitude: -81.73 }
    ])
}

ko.applyBindings(vm);

