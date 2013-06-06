var g = new Object();
g.map = null;
g.geocoder = null;
g.markers = [];
g.polygons = [];
g.searchBounds = new google.maps.LatLngBounds(new google.maps.LatLng(1.22, 103.6, false), new google.maps.LatLng(1.472, 104.04, false)); //A box containing singapore; limit our searches to singpore only.

var hgt = new Object();
hgt.restaurants = []; //Aka the Master list of results

g.initialize = function() {
	g.geocoder = new google.maps.Geocoder();
	var mapOptions = {
		zoom: 11,
		center: new google.maps.LatLng(1.36835, 103.84415),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	g.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

google.maps.event.addDomListener(window, 'load', g.initialize);

hgt.identifyLocation = function() {
	var query = $("#query").val();
	g.geocoder.geocode({'address': query, 'bounds': g.searchBounds},
		function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				d("Num of results from geocoder: " + results.length)
				for(var i = 0; i < results.length; i++) {
					d("Result " + (i+1) + " is: " + results[i].formatted_address)
				}
				hgt.findNearby(results[0].geometry.location.lat(), results[0].geometry.location.lng(), 0.02);
			}
			else {
				d('Geocode was not successful for the following reason: ' + status);
				if(status == "ZERO_RESULTS") {
					alert("No results were found for " + query + ". Please refine your search.");
				}
				if(status == "OVER_QUERY_LIMIT") {
					//do something?
					return;
				}
			}
		}
	);
}

hgt.findNearby = function(latitude, longitude, leeway) {
	latitude = parseFloat(latitude);
	longitude = parseFloat(longitude);
	leeway = parseFloat(leeway);

	$.post(
		"/getNearbyRestaurants",
		{latitude: latitude, longitude: longitude, leeway: leeway},
		function(data, status) {
			d("Find nearby returned " + data.restaurants.length + " results")
			hgt.clearMap();
			hgt.markBounderies(latitude, longitude, leeway);
			hgt.restaurants = data.restaurants;
			for(var i = 0; i < data.restaurants.length; i++) {
				g.markers.push(
					new google.maps.Marker({
						position: new google.maps.LatLng(data.restaurants[i].latitude, data.restaurants[i].longitude),
						map: g.map,
						title: data.restaurants[i].title
					})
				)
			}
		},
		"json"
	);
}

hgt.markBounderies = function(latitude, longitude, leeway) {
	latitude = parseFloat(latitude);
	longitude = parseFloat(longitude);
	leeway = parseFloat(leeway);

	var newPolygon = [
		new google.maps.LatLng(latitude - leeway, longitude - leeway),
		new google.maps.LatLng(latitude - leeway, longitude + leeway),
		new google.maps.LatLng(latitude + leeway, longitude + leeway),
		new google.maps.LatLng(latitude + leeway, longitude - leeway),
		new google.maps.LatLng(latitude - leeway, longitude - leeway)
	];

	if(g.polygons.length == 1) {
		g.polygons.pop().setMap(null);
	}
	
	// Construct the polygon
	g.polygons.push(
		new google.maps.Polygon({
			paths: newPolygon,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 1,
			fillColor: '#FF0000',
			fillOpacity: 0.35
		})
	);
	
	g.polygons[0].setMap(g.map);

	g.map.setZoom(14);
	g.map.panTo(new google.maps.LatLng(latitude, longitude));

	g.markers.push(
		new google.maps.Marker({
			position: new google.maps.LatLng(latitude, longitude),
			map: g.map,
			icon: "http://www.google.com/mapfiles/arrow.png",
			shadow: "http://www.google.com/mapfiles/arrowshadow.png",
			title: "Center"
		})
	);
}

hgt.clearMap = function() {
	while(g.markers.length != 0) {
		g.markers.pop().setMap(null);
	}
	while(g.polygons.length != 0) {
		g.polygons.pop().setMap(null);
	}
}

function d(v) {
	document.getElementById("debug").innerHTML += v + "<br>";
}