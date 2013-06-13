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
	g.initialize();
	var wholething = document.getElementById('wholething');
	var mapview = document.getElementById('mapview');
	wholething.style.display = 'none';
	mapview.style.display = 'block';
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
		currlocinput.value = '(' + hgt.currentLatitude +','+ hgt.currentLongitude +')';
		currlocinput1.value = '(' + hgt.currentLatitude +','+ hgt.currentLongitude +')';
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
			print_curr_loc();
			alert('Searching your Current Location, going by ' + status.value);	
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
	//document.getElementById('map-canvas').innerHTML 
	var text = 'Your curent location is:<br />' + '(' + hgt.currentLatitude +', '+ hgt.currentLongitude + ')';
	alert(text);
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