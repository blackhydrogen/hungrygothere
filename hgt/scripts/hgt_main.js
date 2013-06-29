Function.prototype.partial = function() {
	var fn = this, args = Array.prototype.slice.call(arguments);
	return function() {
		var arg = 0;
		for ( var i = 0; i < args.length && arg < arguments.length; i++)
			if ( args[i] === undefined )
				args[i] = arguments[arg++];
		return fn.apply(this, args);
	};
};

//g object is for all the google maps related stuff
var g = new Object();
g.map = null;
g.geocoder = new google.maps.Geocoder();
g.directionsService = new google.maps.DirectionsService();
g.directionsRenderer = new google.maps.DirectionsRenderer();
g.markers = [];
g.polygons = [];
g.infoWindow = new google.maps.InfoWindow({
	content: ""
})
g.searchBounds = new google.maps.LatLngBounds(new google.maps.LatLng(1.22, 103.6, false), new google.maps.LatLng(1.472, 104.04, false)); //A box containing singapore; limit our searches to singpore only.

g.initialize = function() {
	var mapOptions = {
		zoom: 11,
		center: new google.maps.LatLng(1.36835, 103.84415),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		//mapTypeControl: false,
		//overviewMapControl: false,
		//panControl: false,
		//rotateControl: false,
		//scaleControl: false,
		//streetViewControl: false,
		//zoomControl: false,
		backgroundColor: "#9b200a"
	}
	g.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	g.directionsRenderer.setMap(g.map);
}

//google.maps.event.addDomListener(window, 'load', g.initialize);

var hgt = new Object();
hgt.restaurants = []; //Aka the Master list of results
hgt.currentLocationAvailable = false;
hgt.currentLatitude = null;
hgt.currentLongitude = null;
hgt.leewayValues = {bus: 0.015, drive: 0.02, walk: 0.005};
hgt.getRestaurantsAlongRoute_callIdTracker = 0;
hgt.getRestaurantsAlongRoute_variables = [];

hgt.findCurrentLocation = function() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(hgt.currentLocationFoundSuccess, hgt.currentLocationFoundFailure, {timeout: 5000});
	}
	else {
		hgt.currentLocationAvailable = false;
	}
}

hgt.currentLocationFoundSuccess = function(position) {
	document.getElementById("useCurrentLocationButton").style.display = "block";
	document.getElementById("useCurrentLocationButton1").style.display = "block";
	hgt.currentLocationAvailable = true;
	hgt.currentLatitude = position.coords.latitude;
	hgt.currentLongitude = position.coords.longitude;
}

hgt.currentLocationFoundFailure = function() {
	document.getElementById("useCurrentLocationButton").style.display = "none";
	document.getElementById("useCurrentLocationButton1").style.display = "none";
	//disable current location button??
	//hgt.currentLocationAvailable = false;
}

//obsolete
hgt.identifyLocation = function(query) {
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

hgt.getNearbyRestaurantsByNamedLocation = function(namedLocation, leeway) {
	g.geocoder.geocode({'address': namedLocation, 'bounds': g.searchBounds},
		function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				results[0].formatted_address = results[0].formatted_address.replace(", Singapore", "");
				for(var i = 1; i < results.length; i++) {
					results[i].formatted_address = results[i].formatted_address.replace(", Singapore", "");
					if(results[i].formatted_address == results[i-1].formatted_address) {
						results.splice(i, 1);
						i--;
					}
				}

				if(results.length == 1) {
					hgt.getNearbyRestaurantsByLatLon(results[0].geometry.location.lat(), results[0].geometry.location.lng(), leeway)
				}
				else {
					hgtui.show_geolist(results, hgt.getNearbyRestaurantsByLatLon.partial(undefined, undefined, leeway), "currlocation");
				}
			}
			else {
				hgtui.hideLoadingScreen();
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
					hgtui.inform("No results were found for " + namedLocation + ". Please try with a different location.");
				}
				else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
					hgtui.inform("The server is busy. Please wait a while and try again.");
				}
				else {
					hgtui.inform("An error occured while contacting the server. Please try again in a while.");
				}
			}
		}
	);
}

hgt.getNearbyRestaurantsByLatLon = function(latitude, longitude, leeway) {
	latitude = parseFloat(latitude);
	longitude = parseFloat(longitude);
	leeway = parseFloat(leeway);

	$.post(
		"/getNearbyRestaurants",
		{latitude: latitude, longitude: longitude, leeway: leeway},
		function(data, status) {
			//d("Find nearby returned " + data.restaurants.length + " results")
			hgtui.hideLoadingScreen();

			if(data.restaurants.length == 0) {
				hgtui.inform("No restaurants were found near the given location. Please try a different location or choose a different transport option.");
				return;
			}

			hgtui.show_maps();
			hgt.clearMap();

			//hgt.markBoundarySquare(latitude, longitude, leeway); //for debug only - to remove in production
			
			g.map.fitBounds(new google.maps.LatLngBounds(
				new google.maps.LatLng(latitude - leeway, longitude - leeway),
				new google.maps.LatLng(latitude + leeway, longitude + leeway))
			)

			g.markers.push(
				new google.maps.Marker({
					position: new google.maps.LatLng(latitude, longitude),
					map: g.map,
					icon: "http://www.google.com/mapfiles/arrow.png",
					shadow: "http://www.google.com/mapfiles/arrowshadow.png",
					title: document.getElementById('currlocation').value
				})
			);

			hgt.restaurants = data.restaurants;
			hgtui.populateMapWithRestaurants();
		},
		"json"
	);
}

//use startLocation = null to use current location
hgt.getRestaurantsAlongRoute = function(startLocation, endLocation) {
	var callId = hgt.getRestaurantsAlongRoute_callIdTracker;
	hgt.getRestaurantsAlongRoute_callIdTracker++;
	hgt.getRestaurantsAlongRoute_variables.push({status: "waiting", leeway: hgt.leewayValues.drive}); //leeway assumed currently, option to drive/transit may be added later

	if(startLocation != null) {
		g.geocoder.geocode({'address': startLocation, 'bounds': g.searchBounds},
			function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					results[0].formatted_address = results[0].formatted_address.replace(", Singapore", "");
					for(var i = 1; i < results.length; i++) {
						results[i].formatted_address = results[i].formatted_address.replace(", Singapore", "");
						if(results[i].formatted_address == results[i-1].formatted_address) {
							results.splice(i, 1);
							i--;
						}
					}

					if(results.length == 1) {
						hgt.getRestaurantsAlongRoute_setStartCoordinates(callId, results[0].geometry.location.lat(), results[0].geometry.location.lng())
					}
					else {
						hgtui.show_geolist(results, hgt.getRestaurantsAlongRoute_setStartCoordinates.partial(callId, undefined, undefined), "currlocation1");
					}
				}
				else {
					hgtui.hideLoadingScreen();
					hgt.getRestaurantsAlongRoute_variables[callId].status = "cancelled";
					if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
						hgtui.inform("No results were found for " + namedLocation + ". Please try with a different location.");
					}
					else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						hgtui.inform("The server is busy. Please wait a while and try again.");
					}
					else {
						hgtui.inform("An error occured while contacting the server. Please try again in a while.");
					}
				}
			}
		);
	}
	else {
		hgt.getRestaurantsAlongRoute_setStartCoordinates(callId, hgt.currentLatitude, hgt.currentLongitude);
	}

	g.geocoder.geocode({'address': endLocation, 'bounds': g.searchBounds},
		function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				results[0].formatted_address = results[0].formatted_address.replace(", Singapore", "");
				for(var i = 1; i < results.length; i++) {
					results[i].formatted_address = results[i].formatted_address.replace(", Singapore", "");
					if(results[i].formatted_address == results[i-1].formatted_address) {
						results.splice(i, 1);
						i--;
					}
				}	
				if(results.length == 1) {
					hgt.getRestaurantsAlongRoute_setEndCoordinates(callId, results[0].geometry.location.lat(), results[0].geometry.location.lng())
				}
				else {
					hgtui.show_geolist(results, hgt.getRestaurantsAlongRoute_setEndCoordinates.partial(callId, undefined, undefined), "destination");
				}
			}
			else {
				hgtui.hideLoadingScreen();
				hgt.getRestaurantsAlongRoute_variables[callId].status = "cancelled";
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
					hgtui.inform("No results were found for " + namedLocation + ". Please try with a different location.");
				}
				else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
					hgtui.inform("The server is busy. Please wait a while and try again.");
				}
				else {
					hgtui.inform("An error occured while contacting the server. Please try again in a while.");
				}
			}
		}
	);
}

hgt.getRestaurantsAlongRoute_setStartCoordinates = function(callId, latitude, longitude) {
	if(hgt.getRestaurantsAlongRoute_variables[callId].status == "waiting") {
		hgt.getRestaurantsAlongRoute_variables[callId].startLatitude = parseFloat(latitude);
		hgt.getRestaurantsAlongRoute_variables[callId].startLongitude = parseFloat(longitude);
		if(hgt.getRestaurantsAlongRoute_variables[callId].endLatitude != undefined) {
			hgt.getRestaurantsAlongRoute_variables[callId].status = "plottingRoute";
			hgt.getRestaurantsAlongRoute_plotRoute(callId);
		}
	}
	//else do nothing - the current callId is invalid
}

hgt.getRestaurantsAlongRoute_setEndCoordinates = function(callId, latitude, longitude) {
	if(hgt.getRestaurantsAlongRoute_variables[callId].status == "waiting") {
		hgt.getRestaurantsAlongRoute_variables[callId].endLatitude = parseFloat(latitude);
		hgt.getRestaurantsAlongRoute_variables[callId].endLongitude = parseFloat(longitude);
		if(hgt.getRestaurantsAlongRoute_variables[callId].startLatitude != undefined) {
			hgt.getRestaurantsAlongRoute_variables[callId].status = "plottingRoute";
			hgt.getRestaurantsAlongRoute_plotRoute(callId);
		}
	}
	//else do nothing - the current callId is invalid
}

hgt.getRestaurantsAlongRoute_plotRoute = function(callId) {
	if(hgt.getRestaurantsAlongRoute_variables[callId].status == "plottingRoute") {
		hgt.getRestaurantsAlongRoute_variables[callId].status = "plottingRoute_executing";

		var request = {
			origin: new google.maps.LatLng(
				hgt.getRestaurantsAlongRoute_variables[callId].startLatitude,
				hgt.getRestaurantsAlongRoute_variables[callId].startLongitude
			),
			destination: new google.maps.LatLng(
				hgt.getRestaurantsAlongRoute_variables[callId].endLatitude,
				hgt.getRestaurantsAlongRoute_variables[callId].endLongitude
			),
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

		g.directionsService.route(request,
			function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					hgt.getRestaurantsAlongRoute_variables[callId].status = "gettingRestaurants";
					hgt.getRestaurantsAlongRoute_getRestaurants(callId, response);
				}
				else {
					hgt.getRestaurantsAlongRoute_variables[callId].status = "cancelled";
				}
			}
		);
		hgt.getRestaurantsAlongRoute_variables[callId].status = "plottingRoute_waiting";
	}
	//else do nothing - the current callId is invalid
}

hgt.getRestaurantsAlongRoute_getRestaurants = function(callId, routesResult) {
	if(hgt.getRestaurantsAlongRoute_variables[callId].status == "gettingRestaurants") {
		hgt.getRestaurantsAlongRoute_variables[callId].status = "gettingRestaurants_executing";

		$.post(
			"/getRestaurantsAlongRoute",
			{route: routesResult.routes[0].overview_path.toString(), leeway: hgt.getRestaurantsAlongRoute_variables[callId].leeway},
			function(data, status) {
				hgtui.hideLoadingScreen();

				if(data.restaurants.length == 0) {
					hgt.getRestaurantsAlongRoute_variables[callId].status = "cancelled";
					hgtui.inform("No restaurants were found near the given route.");
					return;
				}

				hgtui.show_maps();
				hgt.clearMap();

				var startInfoWindowContent = "<span class='infoWindow'>Start Location: "
				startInfoWindowContent += document.getElementById('currlocation1').value
				startInfoWindowContent += "<br>(" + routesResult.routes[0].legs[0].start_address + ")</span>"
				routesResult.routes[0].legs[0].start_address = startInfoWindowContent;

				var endInfoWindowContent = "<span class='infoWindow'>End Location: "
				endInfoWindowContent += document.getElementById('destination').value
				endInfoWindowContent += "<br>(" + routesResult.routes[0].legs[routesResult.routes[0].legs.length - 1].end_address + ")</span>"
				routesResult.routes[0].legs[routesResult.routes[0].legs.length - 1].end_address = endInfoWindowContent;

				g.directionsRenderer.setDirections(routesResult);

				hgt.restaurants = data.restaurants;
				hgtui.populateMapWithRestaurants();

				hgt.getRestaurantsAlongRoute_variables[callId].status = "done";
			},
			"json"
		);
	}
	//else do nothing - the current callId is invalid
}

hgt.markBoundarySquare = function(latitude, longitude, leeway) {
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
}

hgt.clearMap = function() {
	while(g.markers.length != 0) {
		g.markers.pop().setMap(null);
	}
	while(g.polygons.length != 0) {
		g.polygons.pop().setMap(null);
	}
	g.directionsRenderer.setDirections({routes: []});
}



function d(v) {
	console.log(v);
}