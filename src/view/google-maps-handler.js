// Google Maps JavaScript API is referenced by <script> tag below in index.html
// <script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>

/* global google */

const infoWindowContentGenerator = require('./info-window-content-generator');

exports.render = function (photos) {
  if (photos.length === 0) {
    renderInitialState();
  } else {
    renderWithPhotos(photos);
  }
};

function renderWithPhotos(photos) {
  const map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  const infoWindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds();

  let marker, i;
  for (i = 0; i < photos.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(photos[i].latitude, photos[i].longitude),
      map: map
    });
    bounds.extend(marker.position);
    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        const content = infoWindowContentGenerator.generate(photos[i]);
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      };
    })(marker, i));
  }

  google.maps.event.addListenerOnce(map, 'bounds_changed', function (event) {
    const initialMaxZoomLevel = 15;
    if (this.getZoom() > initialMaxZoomLevel) {
      this.setZoom(initialMaxZoomLevel);
    }
  });

  map.fitBounds(bounds);
}

function renderInitialState() {
  // "new" for google.maps.Map is required although the reference to the instantiated object is not required.
  // Without "new", the map is not rendered.

  // eslint-disable-next-line no-new
  new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: { lat: 0.0, lng: 0.0 },
    zoom: 0
  });
}

function initialize() {
  renderInitialState();
}

initialize();

