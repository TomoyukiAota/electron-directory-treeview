// API for Google Maps is referenced by <script> tag below in index.html
// <script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>

exports.render = function(locations, center) {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(center.latitude, center.longitude),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  
  const infowindow = new google.maps.InfoWindow();
  
  let marker, i;
  
  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map
    });
  
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent(locations[i][0]);
        infowindow.open(map, marker);
      }
    })(marker, i));
  }
}

function initialize() {
  const locations = [
    ['Bondi Beach', -33.890542, 151.274856],
    ['Coogee Beach', -33.923036, 151.259052],
    ['Cronulla Beach', -34.028249, 151.157507],
    ['Manly Beach', -33.80010128657071, 151.28747820854187],
    ['Maroubra Beach', -33.950198, 151.259302]
  ];
  const center = {
    latitude: -33.92,
    longitude: 151.25
  }
  exports.render(locations, center);
}

initialize();