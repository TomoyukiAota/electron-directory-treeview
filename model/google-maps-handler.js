// Google Maps JavaScript API is referenced by <script> tag below in index.html
// <script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>

exports.render = function(locations) {
  if(locations.length === 0) {
    renderInitialState();
  } else {
    renderWithLocations(locations);
  }
}

function renderWithLocations(locations) {
  const map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  const infowindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds();

  let marker, i;
  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map
    });
    bounds.extend(marker.position);
    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        infowindow.setContent(locations[i][0]);
        infowindow.open(map, marker);
      };
    })(marker, i));
  }

  google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
    const initialMaxZoomLevel = 15;
    if (this.getZoom() > initialMaxZoomLevel) {
      this.setZoom(initialMaxZoomLevel);
    }
  });

  map.fitBounds(bounds);
}

function renderInitialState() {
  const map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: { lat: 0.0, lng: 0.0 },
    zoom: 0
  });
}

function initialize() {
  renderInitialState();
}

initialize();


