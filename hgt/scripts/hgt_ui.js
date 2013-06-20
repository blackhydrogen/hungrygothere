/* ===================================================
 * hungrygothere.js v1.0
 * ===================================================
 * Copyright 2013 Earful - Hungry Go There
 *
 * ========================================================== */

var hgtui = new Object();
hgtui.currlocation_previousValue = "";
hgtui.currlocation1_previousValue = "";

hgtui.reset_fields = function() {
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
}


hgtui.loadlist = function() {
	listcanvas = document.getElementById('list-canvas');
	var addhtml = "";   
	for (var i = 0; i < hgt.restaurants.length; i++) {
		addhtml += '<tr><td><table id="innerList"><tr><th id="listTitle"><h1 class="title2">' + hgt.restaurants[i].title + '</h1></th></tr><tr><th id="listRating">Rating:' + hgt.restaurants[i].rating + '</th></tr></table><hr></td></tr>';
	}
	listcanvas.innerHTML= addhtml;
}

//Navigation Buttons
hgtui.show_maps = function() {
	//hide main portion and display map
	
	document.body.style.cssText = "padding-top:0px; padding-bottom:0px";
	document.documentElement.style.cssText = "height: 100%";

	var wholething = document.getElementById('wholething');
	wholething.style.display = 'none';
	var mapview = document.getElementById('mapview');
	mapview.style.display = 'block';
	g.initialize();
}

hgtui.toggle_map = function() {
	//hide main portion and display map
	
	document.body.style.cssText = "padding-top:0px; padding-bottom:0px";
	document.documentElement.style.cssText = "height: 100%";


	var listview = document.getElementById('listview');
	listview.style.display = 'none';
	var mapview = document.getElementById('mapview');
	mapview.style.display = 'block';
}

hgtui.toggle_list = function() {
	//hide main portion and display list
	
	document.body.style.cssText = "padding-top:0px; padding-bottom:0px";
	document.documentElement.style.cssText = "height: 100%";

	hgtui.loadlist();

	var mapview = document.getElementById('mapview');
	mapview.style.display = 'none';
	var listview = document.getElementById('listview');
	listview.style.display = 'block';
}

hgtui.off_maps = function() {
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";

	var mapview = document.getElementById('mapview');
	mapview.style.display = 'none';
	var wholething = document.getElementById('wholething');
	wholething.style.display = 'block';
}

hgtui.off_list = function() {
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";


	var listview = document.getElementById('listview');
	listview.style.display = 'none';	
	var wholething = document.getElementById('wholething');
	wholething.style.display = 'block';
}


hgtui.hideall = function() {
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";

	var page1 = document.getElementById('page1');
	var wherecaneat = document.getElementById('wherecaneat');
	var halfwayeatwhere = document.getElementById('halfwayeatwhere');
	var mapview = document.getElementById('mapview');
	var listview = document.getElementById('listview');
	page1.style.display = 'none';
	wherecaneat.style.display = 'none';
	halfwayeatwhere.style.display = 'none';
	mapview.style.display = 'none';
	listview.style.display = 'none';

	document.getElementById("overlay_background").style.display = "none";
	document.getElementById("overlay_items").style.display = "none";
}

hgtui.showPage1 = function() {
	hgtui.hideall();
	var page1 = document.getElementById('page1');
	page1.style.display = 'block';
}

hgtui.showWhereCanEat = function() {
	hgtui.hideall();
	var wherecaneat = document.getElementById('wherecaneat');
	wherecaneat.style.display = 'block';
}

hgtui.showHalfwayEatWhere = function() {
	hgtui.hideall();
	var halfwayeatwhere = document.getElementById('halfwayeatwhere');
	halfwayeatwhere.style.display = 'block';
}

//Functionality
hgtui.update_currlocation = function() {
	var currlocinput = document.getElementById('currlocation');
	if (currlocinput.disabled == false) {
		hgtui.currlocation_previousValue = currlocinput.value;
		currlocinput.disabled = true;
		currlocinput.value = '(' + hgt.currentLatitude +','+ hgt.currentLongitude +')';
	} else {
		currlocinput.disabled = false;
		currlocinput.value = hgtui.currlocation_previousValue;
	}
}

hgtui.update_currlocation1 = function() {
	var currlocinput1 = document.getElementById('currlocation1');
	if (currlocinput1.disabled == false) {
		hgtui.currlocation1_previousValue = currlocinput1.value;
		currlocinput1.disabled = true;
		currlocinput1.value = '(' + hgt.currentLatitude +','+ hgt.currentLongitude +')';
	} else {
		currlocinput1.disabled = false;
		currlocinput1.value = hgtui.currlocation1_previousValue;
	}
}

hgtui.collect_wherecaneat_info = function() {
	//Extract All User Data
	var currentlocation = document.getElementById('currlocation');
	var status = document.getElementById('status');

	if ((currentlocation.value == '') && (currentlocation.disabled == false)) {
		hgtui.inform('Please enter your start location, or choose "Use Current Location!"');
	} else if (status.value == '') {
		hgtui.inform('Please choose a transport method!');
	} else {
		hgtui.showLoadingScreen();
		if (currentlocation.disabled == true) {
			hgt.centreName = "Current Location";
			hgt.getNearbyRestaurantsByLatLon(hgt.currentLatitude, hgt.currentLongitude, hgt.leewayValues[status.value]);
		} else {
			hgt.centreName = currentlocation.value;
			hgt.getNearbyRestaurantsByNamedLocation(currentlocation.value, hgt.leewayValues[status.value]);
		}
	}
}

hgtui.collect_halfwayeatwhere_info = function() {
	var currentlocation = document.getElementById('currlocation1');
	var destination = document.getElementById('destination');

	if ((currentlocation.value == '') && (currentlocation.disabled == false)) {
		hgtui.inform('Please enter your start location, or choose "Use Current Location!"');
	} else if (destination.value == '') {
		hgtui.inform('Please enter your Destination!');
	} else {
		hgtui.showLoadingScreen();
		if (currentlocation.disabled == true) {
			hgt.getRestaurantsAlongRoute(null, destination.value);
			//alert('Searching NAISE Makan Places from your Current Location to ' + destination.value);
		} else {
			hgt.getRestaurantsAlongRoute(currentlocation.value, destination.value);
			//alert('Searching NAISE Makan Places from ' + currentlocation.value + ' to ' + destination.value);
		}
	}
}

hgtui.setDrive = function() {
	var status = document.getElementById('status');
	status.value = 'drive';
}

hgtui.setBus = function() {
	var status = document.getElementById('status');
	status.value = 'bus';
}

hgtui.setWalk = function() {
	var status = document.getElementById('status');
	status.value = 'walk';
}

hgtui.showLoadingScreen = function() {
	document.getElementById("overlay_content").innerHTML = "Loading...";
	hgtui.showOverlays();
}

hgtui.hideLoadingScreen = function() {
	hgtui.hideOverlays();
}

hgtui.showOverlays = function() {
	document.getElementById("overlay_background").style.display = ""; //not "block", "" is correct
	document.getElementById("overlay_items").style.display = ""; //not "block", "" is correct
}

hgtui.hideOverlays = function() {
	document.getElementById("overlay_background").style.display = "none";
	document.getElementById("overlay_items").style.display = "none";
}

hgtui.inform = function(msg) {
	msg += "<br><input type='button' value='Okay' onclick='hgtui.hideOverlays()'>";
	document.getElementById("overlay_content").innerHTML = msg;
	hgtui.showOverlays();
	//alert(msg);
}
