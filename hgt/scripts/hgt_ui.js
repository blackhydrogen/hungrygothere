/* ===================================================
 * hungrygothere.js v1.0
 * ===================================================
 * Copyright 2013 Earful - Hungry Go There
 *
 * ========================================================== */

var hgtui = new Object();
hgtui.currlocation_previousValue = "";
hgtui.currlocation1_previousValue = "";
hgtui.lastViewed = "wherecaneat";
hgtui.lastViewedFromRestDetails = "mapview";
hgtui.geolist_resultList = null;
hgtui.geolist_functionToCall = null;
hgtui.geolist_queue = [];
hgtui.geolist_textboxId = null;

hgtui.setLoginDetails = function() {
	if(hgtuser.nickname == "") {
		document.getElementById("temp_login").innerHTML = "<a href='/a'>Login</a>";
	}
	else {
		document.getElementById("temp_login").innerHTML = "Logged in as " + hgtuser.nickname + ". <a href='" + hgtuser.logoutUrl + "'>Logout</a>";
	}
}

hgtui.reset_fields = function() {
	var currlocinput = document.getElementById('currlocation');
	currlocinput.disabled = false;
	currlocinput.value = 'Kent Ridge';
	currlocinput.placeholder = 'Enter your start location!';

	var status = document.getElementById('status');
	if (status != null) {
		status.value = '';
	}

	var currlocinput1 = document.getElementById('currlocation1');
	currlocinput1.disabled = false;
	currlocinput1.value = 'Kent Ridge';
	currlocinput1.placeholder = 'Enter your start location!';

	var destinput = document.getElementById('destination');
	destinput.value = 'Yio Chu Kang Mrt';
}


hgtui.loadlist = function() {
	listcanvas = document.getElementById('list-canvas');
	var addhtml = "";   
	for (var i = 0; i < hgt.restaurants.length; i++) {
		addhtml += '<tr><td><table id="innerList"><tr><td id="listTitle" class="bottomborder">';
		addhtml += '<a class="nodeco" href="#" onclick="hgtui.restdetails(' + i +')">';
		addhtml += '<div class="listviewtitle">' + hgt.restaurants[i].title + '</div></a>';
		addhtml += '<span id="listAddress">Address: ' + hgt.restaurants[i].address + '</span><br />';
		addhtml += '<span class="floatleft" id="list">' + hgt.restaurants[i].contact + '</span>'
		addhtml += '<span class="floatright" id="listRating">Rating: ' + hgt.restaurants[i].rating + '</span>'
		addhtml += '<br /></td></tr></table></td></tr>';
	}
	listcanvas.innerHTML= addhtml;
}

hgtui.loadFavourites = function() {
	favhistlistcanvas = document.getElementById('fav-hist-list-canvas');
	var addhtml = "";   
	for (var i = 0; i < hgt.restaurants.length; i++) {
		addhtml += '<tr><td><table id="innerList"><tr><td id="listTitle" class="bottomborder">';
		addhtml += '<a class="nodeco" href="#" onclick="hgtui.restdetails(' + i +')">';
		addhtml += '<div class="listviewtitle">' + hgt.restaurants[i].title + '</div></a>';
		addhtml += '<span id="listAddress">Address123: ' + hgt.restaurants[i].address + '</span><br />';
		addhtml += '<span class="floatleft" id="list">' + hgt.restaurants[i].contact + '</span>'
		addhtml += '<span class="floatright" id="listRating">Rating: ' + hgt.restaurants[i].rating + '</span>'
		addhtml += '<br /></td></tr></table></td></tr>';
	}
	favhistlistcanvas.innerHTML= addhtml;
}

hgtui.loadHistory = function() {
	favhistlistcanvas = document.getElementById('fav-hist-list-canvas');
	var addhtml = "";   
	for (var i = 0; i < hgt.restaurants.length; i++) {
		addhtml += '<tr><td><table id="innerList"><tr><td id="listTitle" class="bottomborder">';
		addhtml += '<a class="nodeco" href="#" onclick="hgtui.restdetails(' + i +')">';
		addhtml += '<div class="listviewtitle">' + hgt.restaurants[i].title + '</div></a>';
		addhtml += '<span id="listAddress">Address456: ' + hgt.restaurants[i].address + '</span><br />';
		addhtml += '<span class="floatleft" id="list">' + hgt.restaurants[i].contact + '</span>'
		addhtml += '<span class="floatright" id="listRating">Rating: ' + hgt.restaurants[i].rating + '</span>'
		addhtml += '<br /></td></tr></table></td></tr>';
	}
	favhistlistcanvas.innerHTML= addhtml;
}

//Navigation Buttons
hgtui.show_maps = function() {
	//hide main portion and display map
	
	document.body.style.cssText = "padding-top:0px; padding-bottom:0px";
	document.documentElement.style.cssText = "height: 100%";

	hgtui.hideall();
	document.getElementById('mapview').style.display = 'block';
	g.initialize();
}


hgtui.show_navbar = function() {
	document.getElementById('navigationbar').style.display = 'block';
}

//textboxId = the html id of the textbox that the user typed the geo-query into
hgtui.show_geolist = function(resultsList, functionToCallOnClick, textboxId) {
	if(hgtui.geolist_queue.length != 0) { //means there's a current geolist showing, so queue this new call
		hgtui.geolist_queue.push(hgtui.show_geolist.partial(resultsList, functionToCallOnClick, textboxId));
		return;
	}
	else {
		hgtui.geolist_queue.push("geolist_showing"); //just a placeholder to say there's a geolist currently showing
	}
	hgtui.hideLoadingScreen();

	hgtui.geolist_resultList = resultsList;
	hgtui.geolist_functionToCall = functionToCallOnClick;
	hgtui.geolist_textboxId = textboxId;

	var addhtml = "";   
	for (var i = 0; i < resultsList.length; i++) {
		addhtml += '<tr><td class="bottomborder">';
		addhtml += '<div class="listviewtitle"><a href="#" class="nodeco" onclick="hgtui.geolist_entryClick(' + i + ')">' + resultsList[i].formatted_address + '</a></div>';
		addhtml += '</td></tr>';
	}
	document.getElementById('geolist-canvas').innerHTML = addhtml;

	document.getElementById('geolist-query').innerHTML = document.getElementById(textboxId).value;

	hgtui.hideall();
	document.getElementById('geolist').style.display = "block";
}

hgtui.geolist_entryClick = function(index) {
	document.getElementById(hgtui.geolist_textboxId).value = hgtui.geolist_resultList[index].formatted_address;

	//the two functions called in the if-else will call hgtui.hideall(), so hgtui.hide_geolist() not necessary
	if(hgtui.lastViewed == "wherecaneat") {
		hgtui.showWhereCanEat();
	}
	else {
		hgtui.showHalfwayEatWhere();
	}
	hgtui.showLoadingScreen();

	hgtui.geolist_functionToCall(hgtui.geolist_resultList[index].geometry.location.lat(), hgtui.geolist_resultList[index].geometry.location.lng());

	hgtui.geolist_queue.shift();
	if(hgtui.geolist_queue.length != 0) { //there's something in the queue
		hgtui.geolist_queue.shift()(); //remove the first element, which (the first element) is a function, then call that function
	}
}

hgtui.show_lastviewed_page = function() {
	hgtui.hideall();
	hgtui.show_navbar();
	document.getElementById(hgtui.lastViewed).style.display = "block";
}


hgtui.hide_geolist = function() {
	document.getElementById('geolist').style.display = "none";
}

hgtui.geolist_cancel = function() {
	hgtui.geolist_queue = []; //empty queue
	hgtui.hide_geolist();
	if(hgtui.lastViewed == "wherecaneat") {
		hgtui.showWhereCanEat();
	}
	else {
		hgtui.showHalfwayEatWhere();
	}
}

hgtui.toggle_map = function() {
	//hide main portion and display map
	
	document.body.style.cssText = "padding-top:0px; padding-bottom:0px";
	document.documentElement.style.cssText = "height: 100%";
	hgtui.hideall();
	document.getElementById('mapview').style.display = 'block';
	hgtui.lastViewedFromRestDetails = 'mapview';
}

hgtui.toggle_list = function() {
	//hide main portion and display list
	
	document.body.style.cssText = "padding-top:0px; padding-bottom:0px";
	document.documentElement.style.cssText = "height: 100%";

	hgtui.loadlist();
	hgtui.hideall();
	document.getElementById('navigationbar').style.display = 'block';
	document.getElementById('listview').style.display = 'block';
	hgtui.lastViewedFromRestDetails = 'listview';

	//document.getElementById("mapViewButton").style.display = "";
}

hgtui.hide_maps = function() {
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";

	var mapview = document.getElementById('mapview');
	mapview.style.display = 'none';
	var wholething = document.getElementById('wholething');
	wholething.style.display = 'block';
}

/*
hgtui.hide_list = function() {
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";


	var listview = document.getElementById('listview');
	listview.style.display = 'none';	
	var wholething = document.getElementById('wholething');
	wholething.style.display = 'block';
}
*/


hgtui.restdetails = function(index) {
	if(hgtuser.nickname == "") {
		hgtui.displayRestaurantDetails(index, false);
	}
	else {
		hgtui.showLoadingScreen();
		$.post(
			"/isFavouriteRestaurant",
			{id: hgt.restaurants[index].id},
			function(data, status) {
				if(data.error) {
					hgtui.inform("An error occured when trying to get more information regarding this restaurant.<br>Please try again.")
				}
				else {
					hgtui.displayRestaurantDetails(index, data.isFavourite);
				}
			},
			"json"
		);
	}
}

hgtui.displayRestaurantDetails = function(index, isFavourite) {
	hgtui.hideLoadingScreen();

	hgtui.hideall();
	hgtui.show_navbar();
	document.getElementById('restdetails').style.display = 'block';
	var addhtml = "";
	addhtml += '<tr><td><div class="listviewtitle"><br />' + hgt.restaurants[index].title + '</div><hr></td></tr>';
	addhtml += '<tr><td id="listAddress">' + hgt.restaurants[index].address + '</td></tr><tr><td class="placeholder3"></td></tr>';
	addhtml += '<tr><td id="list">' + hgt.restaurants[index].contact + '</td></tr><tr><td class="placeholder3"></td></tr>';
	addhtml += '<tr><th id="list">Queue How Long: ' + hgt.restaurants[index].waitingtime_queuing + ' min<br />Wait How Long: ' + hgt.restaurants[index].waitingtime_serving + ' min<hr></th></tr><tr><td class="placeholder3"></td></tr>';
	addhtml += '<tr><th id="listRating">Overall Rating: ' + hgt.restaurants[index].rating + '</th></tr><tr><td class="placeholder3"></td></tr>';
	addhtml += '<tr><td id="list"><ul><li>Ambience: ' + hgt.restaurants[index].rating + '</li><li>Food: ' + hgt.restaurants[index].rating_food + '</li><li>Service: ' + hgt.restaurants[index].rating_service + '</li><li>Value: ' + hgt.restaurants[index].rating_value + '</li></td></tr><tr><td class="placeholder3"></td></tr>';

	if(hgtuser.nickname == "") {
		addhtml += '<tr><th id="list"><a href="#" onclick="hgtui.inform(\'Please login to use this feature.\');" class="nodeco">Add To Favourites</a></td></tr><tr><td class="placeholder3"></th></tr>';
	}
	else {
		if(isFavourite) {
			addhtml += '<tr><th id="list"><span id="addToFavouriteLink">Already a Favourite Restaurant!</span></td></tr><tr><td class="placeholder3"></th></tr>';
		}
		else {
			addhtml += '<tr><th id="list"><span id="addToFavouriteLink"><a href="#" onclick="hgtui.addToFavourites(' + index + ');" class="nodeco">Add To Favourites</a></span></td></tr><tr><td class="placeholder3"></th></tr>';
		}
	}
	
	addhtml += '<tr><th id="listURL"><a target="_blank" href="' + hgt.restaurants[index].url + '#moreReview" class="nodeco">Click here to read reviews!</a></td></tr><tr><td class="placeholder3"></th></tr>';
	document.getElementById('rest-details-canvas').innerHTML=addhtml;

	hgtui.addToRecents(index);
}

hgtui.offrestdetails = function() {
	hgtui.hideall();
	hgtui.show_navbar();
	document.getElementById(hgtui.lastViewedFromRestDetails).style.display = 'block';
}

hgtui.addToFavourites = function(index) {
	if(hgtuser.nickname == "") {
		hgtui.inform("This feature is for logged in users only. Please login to enjoy this feature.");
		return;
	}
	$.post(
		"/addFavouriteRestaurant",
		{id: hgt.restaurants[index].id},
		function(data, status) {
			if(data.error) {
				hgtui.inform("An error occured when trying to add this restaurant as your favourite.<br>The server returned with the following error message: " + data.errorMsg + "<br>Please try again.")
			}
			else {
				hgtui.inform("Restaurant added as favourite!")
				document.getElementById("addToFavouriteLink").innerHTML = "Added as Favourite Restaurant!";
			}
		},
		"json"
	);
}

hgtui.addToRecents = function(index) {
	if(hgtuser.nickname == "") {
		return;
	}
	$.post(
		"/addRecentRestaurant",
		{id: hgt.restaurants[index].id},
		function(data, status) { d(data.error); d(data.errorMsg) },
		"json"
	);
}

hgtui.hideall = function() {
	document.body.style.cssText = "";
	document.documentElement.style.cssText = "";
	document.getElementById("navigationbar").style.display = "none";
	document.getElementById("page1").style.display = "none";
	document.getElementById("wherecaneat").style.display = "none";
	document.getElementById("halfwayeatwhere").style.display = "none";
	document.getElementById("mapview").style.display = "none";
	document.getElementById("listview").style.display = "none";
	document.getElementById("fav-hist-listview").style.display = "none";
	document.getElementById("geolist").style.display = "none";
	document.getElementById("restdetails").style.display = "none";
	document.getElementById("overlay_background").style.display = "none";
	document.getElementById("overlay_items").style.display = "none";
}

hgtui.showPage1 = function() {
	hgtui.hideall();
	hgtui.show_navbar();
	var page1 = document.getElementById('page1');
	page1.style.display = 'block';
}

hgtui.showWhereCanEat = function() {
	hgtui.lastViewed = "wherecaneat";
	hgtui.hideall();
	hgtui.show_navbar();
	var wherecaneat = document.getElementById('wherecaneat');
	wherecaneat.style.display = 'block';
}

hgtui.showHalfwayEatWhere = function() {
	hgtui.lastViewed = "halfwayeatwhere"
	hgtui.hideall();
	hgtui.show_navbar();
	var halfwayeatwhere = document.getElementById('halfwayeatwhere');
	halfwayeatwhere.style.display = 'block';
}

hgtui.showFavourites = function() {
	hgtui.lastViewedFromRestDetails = "fav-hist-listview"
	hgtui.hideall();
	hgtui.show_navbar();
	hgtui.loadFavourites();
	var halfwayeatwhere = document.getElementById('fav-hist-listview').style.display = 'block';
}

hgtui.showHistory = function() {
	hgtui.lastViewedFromRestDetails = "fav-hist-listview"
	hgtui.hideall();
	hgtui.show_navbar();
	hgtui.loadHistory();
	var halfwayeatwhere = document.getElementById('fav-hist-listview').style.display = 'block';
}


//Functionality
hgtui.update_currlocation = function() {
	var currlocinput = document.getElementById('currlocation');
	if (currlocinput.disabled == false) {
		hgtui.currlocation_previousValue = currlocinput.value;
		currlocinput.disabled = true;
		currlocinput.value = "Current Location";
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
		currlocinput1.value = "Current Location";
	} else {
		currlocinput1.disabled = false;
		currlocinput1.value = hgtui.currlocation1_previousValue;
	}
}

hgtui.collect_wherecaneat_info = function() {
	var currentlocation = document.getElementById('currlocation');
	var status = document.getElementById('status');

	if ((currentlocation.value == '') && (currentlocation.disabled == false)) {
		hgtui.inform('Please enter your start location, or choose "Use Current Location!"');
	} else if (status.value == '') {
		hgtui.inform('Please choose a transport method!');
	} else {
		hgtui.showLoadingScreen();
		if (currentlocation.disabled == true) {
			hgt.getNearbyRestaurantsByLatLon(hgt.currentLatitude, hgt.currentLongitude, hgt.leewayValues[status.value]);
		} else {
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
		} else {
			hgt.getRestaurantsAlongRoute(currentlocation.value, destination.value);
		}
	}
}

hgtui.markerClick = function(index, markerIndex) {
	g.infoWindow.setContent(
		"<span class='infoWindow'><b><u>" + hgt.restaurants[index].title + "</u></b><br>" + 
		"Rating: " + hgt.restaurants[index].rating + "<br>" +
		"Address: " + hgt.restaurants[index].address.replace("\n", "<br>") + "<br>" +
		"<a href='#' onclick='hgtui.restdetails(" + index + ")'>More Information</a></span>"
	)
	g.infoWindow.open(g.map, g.markers[markerIndex]);
}

//adds a marker for each of the restaurants in hgt.restaurants
hgtui.populateMapWithRestaurants = function() {
	for(var i = 0; i < hgt.restaurants.length; i++) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(hgt.restaurants[i].latitude, hgt.restaurants[i].longitude),
			map: g.map,
			title: hgt.restaurants[i].title + " (" + hgt.restaurants[i].rating + ")"
		});
		google.maps.event.addListener(marker, 'click', hgtui.markerClick.partial(i, g.markers.length));
		g.markers.push(marker);
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
	msg += "<br><div class='placeholder3'></div><input class='btn btn-warning mininav' type='button' value='Okay' onclick='hgtui.hideOverlays()'>";
	document.getElementById("overlay_content").innerHTML = msg;
	hgtui.showOverlays();
}
