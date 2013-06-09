/* ===================================================
 * hungrygothere.js v1.0
 * ===================================================
 * Copyright 2013 Earful - Hungry Go There
 *
 * ========================================================== */

function reset_fields() {
	var currlocinput = document.getElementById('currlocation');
	currlocinput.disabled = false;
	currlocinput.value = '';
	currlocinput.placeholder = 'Enter your start location!';

	var status = document.getElementById('status');
	if (status != null) {
		status.value = '';
	}

	var destinput = document.getElementById('destination');
	currlocinput.value = '';

	latitude = null;
	longitude = null;
}

//Navigation Buttons
function show_maps() {
	//hide main portion and display map
	var wholething = document.getElementById('wholething');
	var mapview = document.getElementById('mapview');
	wholething.style.display = 'none';
	mapview.style.display = 'block';
//================================================IAN'S EDITS START HERE=============
	g.initialize();
//================================================IAN'S EDITS END HERE===============		
}

function off_maps() {
	var wholething = document.getElementById('wholething');
	var mapview = document.getElementById('mapview');
	mapview.style.display = 'none';
	wholething.style.display = 'block';
}

function hideall() {
	var page1 = document.getElementById('page1');
	var wherecaneat = document.getElementById('wherecaneat');
	var halfwayeatwhere = document.getElementById('halfwayeatwhere');
	page1.style.display = 'none';
	wherecaneat.style.display = 'none';
	halfwayeatwhere.style.display = 'none';
}

function showPage1() {
	hideall();
	var page1 = document.getElementById('page1');
	page1.style.display = 'block';
}

function showWhereCanEat() {
	hideall();
	var wherecaneat = document.getElementById('wherecaneat');
	wherecaneat.style.display = 'block';
}

function showHalfwayEatWhere() {
	hideall();
	var halfwayeatwhere = document.getElementById('halfwayeatwhere');
	halfwayeatwhere.style.display = 'block';
}

//Functionality
function update_currlocation() {
	var currlocinput = document.getElementById('currlocation');
	var currlocinput1 = document.getElementById('currlocation1');
	if (currlocinput.disabled == false || currlocinput1.disabled == false) {
		currlocinput.disabled = true;
		currlocinput1.disabled = true;
		currlocinput.value = '(' + latitude +','+ longitude +')';
		currlocinput1.value = '(' + latitude +','+ longitude +')';
	} else {
		currlocinput.disabled = false;
		currlocinput1.disabled = false;
		currlocinput.value = '';
		currlocinput1.value = '';
	}
}

function collect_form_info() {
	//Extract All User Data
	var currentlocation = document.getElementById('currlocation');
	var status = document.getElementById('status');

	if ((currlocation.value == '') && (currlocation.disabled == false)) {
		alert('Please enter your start location, or choose "Use Current Location!"');
	} else if (status.value == '') {
		alert('Please choose a transport method!');
	} else {
		if (currentlocation.disabled == true){
//================================================IAN'S EDITS START HERE=============
			//print_curr_loc();
			alert('Searching your Current Location, going by ' + status.value);
			hgt.findNearby(hgt.currentLatitude, hgt.currentLongitude, hgt.leewayValues[status.value]);
//================================================IAN'S EDITS END HERE===============			
		} else {
			alert('Searching ' + currentlocation.value + ', going by ' + status.value);
		}
		show_maps();
	}
}

function collect_form2_info() {
	var currentlocation = document.getElementById('currlocation');
	var destination = document.getElementById('destination');

	if ((currlocation.value == '') && (currlocation.disabled == false)) {
		alert('Please enter your start location, or choose "Use Current Location!"');
	} else if (destination.value == '') {
		alert('Please enter your Destination!');
	} else {
		if (currentlocation.disabled == true) {
			print_curr_loc();
			alert('Searching NAISE Makan Places from your Current Location to ' + destination.value);	
		} else {
			alert('Searching NAISE Makan Places from ' + currentlocation.value + ' to ' + destination.value);
		}
		show_maps();
	}
}

function print_curr_loc() {
	document.getElementById('map-canvas').innerHTML = 'Your curent location is:<br />' + '(' + latitude +', '+ longitude + ')';
}

function drive() {
	var status = document.getElementById('status');
	status.value = 'drive';
}

function bus() {
	var status = document.getElementById('status');
	status.value = 'bus';
}

function walk() {
	var status = document.getElementById('status');
	status.value = 'walk';
}

//================================================IAN'S EDITS START HERE=============

//g object is for all the google maps related stuff
var g = new Object();
g.map = null;
g.geocoder = null;
g.markers = [];
g.polygons = [];
g.searchBounds = new google.maps.LatLngBounds(new google.maps.LatLng(1.22, 103.6, false), new google.maps.LatLng(1.472, 104.04, false)); //A box containing singapore; limit our searches to singpore only.

g.initialize = function() {
	g.geocoder = new google.maps.Geocoder();
	var mapOptions = {
		zoom: 11,
		center: new google.maps.LatLng(1.36835, 103.84415),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	g.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

//google.maps.event.addDomListener(window, 'load', g.initialize);

var hgt = new Object();
hgt.restaurants = []; //Aka the Master list of results
hgt.currentLocationAvailable = null;
hgt.currentLatitude = null;
hgt.currentLongitude = null;
hgt.leewayValues = {bus: 0.02, drive: 0.02, walk: 0.005};

var debugText = "";

//Detect USER LOCATION
hgt.findCurrentLocation = function() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(hgt.currentLocationFoundSuccess, hgt.currentLocationFoundFailure, {timeout: 5000});
	}
	else {
		hgt.currentLocationAvailable = false;
	}
}

hgt.currentLocationFoundSuccess = function(position) {
	hgt.currentLocationAvailable = true;
	hgt.currentLatitude = position.coords.latitude;
	hgt.currentLongitude = position.coords.longitude;
}

hgt.currentLocationFoundFailure = function() {
	hgt.currentLocationAvailable = false;
}

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
	debugText += v + "\n";
}