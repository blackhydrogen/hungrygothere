#!/usr/bin/env python
import webapp2
import jinja2
import os
import json
import logging
from operator import itemgetter
from google.appengine.ext import db

jinja_environment = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"))

##### Direct File Imports #####
execfile("admin.py")

##### Page Handlers #####
class MainHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("index.html")
		self.response.out.write(template.render())

class DLHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("dl.html")
		self.response.out.write(template.render())

class whereCanEatHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("whereCanEat.html")
		self.response.out.write(template.render())

class genericTestHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("directions_test.html")
		self.response.out.write(template.render())

class halfwayEatWhereHandler(webapp2.RequestHandler):
	def get(self):
		self.response.out.write("output page template here")

##### Ajax Handlers #####
class getNearbyRestaurantsHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"restaurants": [], "error": True, "errorMsg": "GET method not supported."}))
	def post(self):
		results = findNearbyRestaurants(self.request.get("latitude"), self.request.get("longitude"), self.request.get("leeway"));
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"restaurants": results, "error": False}))

class getRestaurantsAlongRouteHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"restaurants": [], "error": True, "errorMsg": "GET method not supported."}))
	def post(self):
		results = findRestaurantsAlongRoute(self.request.get("route"), self.request.get("leeway"))
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"restaurants": results, "error": False}))

class AjaxHandler(webapp2.RequestHandler):
	def post(self):
		path_lon_lat = eval(self.request.get("path_lon_lat"))
		self.response.out.write(path_lon_lat);

##### Pages defination #####

app = webapp2.WSGIApplication([
	("/", MainHandler),
	("/ajax", AjaxHandler),
	("/dl", DLHandler),
	("/test", genericTestHandler),
	("/whereCanEat", whereCanEatHandler),
	("/getNearbyRestaurants", getNearbyRestaurantsHandler),
	("/getRestaurantsAlongRoute", getRestaurantsAlongRouteHandler),
	("/admin", AdminPageHandler)
], debug=True)

##### Models #####

class Restaurant(db.Model):
	uid = db.IntegerProperty(required=True)
	title = db.StringProperty(required=True)
	address = db.StringProperty(required=True, multiline=True)
	contact = db.StringProperty()
	rating_overall = db.IntegerProperty()
	rating_food = db.IntegerProperty()
	rating_ambience = db.IntegerProperty()
	rating_value = db.IntegerProperty()
	rating_service = db.IntegerProperty()
	review_count = db.IntegerProperty(required=True)
	latitude = db.FloatProperty(required=True)
	longitude = db.FloatProperty(required=True)
	waitingtime_queuing = db.IntegerProperty()
	waitingtime_serving = db.IntegerProperty()
	url = db.StringProperty()

##### Functions #####

# find restaurants within longitude/latitude +/- leeway; 0.02 ~= 4.4 km box
def findNearbyRestaurants(userLatitude, userLongitude, leeway = 0.02):
	userLatitude = float(userLatitude)
	userLongitude = float(userLongitude)
	leeway = float(leeway)

	leewaySquared = leeway ** 2

	query = db.GqlQuery(
		"""SELECT title, address, contact, rating_overall, rating_food, rating_ambience, rating_value, rating_service, review_count, latitude, longitude, url FROM Restaurant
		WHERE longitude >= %f AND longitude <= %f"""
		% (userLongitude - leeway, userLongitude + leeway)
	)

	results = []
	for i in query:
		#if i.latitude < userLatitude - leeway or i.latitude > userLatitude + leeway:
		#squares are awkward, circles less so
		if ((i.latitude - userLatitude) ** 2 + (i.longitude - userLongitude) ** 2) >= leewaySquared:
			continue
		results.append({
			"title": i.title,
			"address": i.address,
			"contact": i.contact,
			"rating": i.rating_overall,
			"rating_food": i.rating_food,
			"rating_ambience": i.rating_ambience,
			"rating_value": i.rating_value,
			"rating_service": i.rating_service,
			"reviewCount": i.review_count,
			"latitude": i.latitude,
			"longitude": i.longitude,
			"waitingtime_serving": 10,
			"waitingtime_queuing": 10,
			"url": i.url,
			"ratingReviewCountIndex": calcRatingReviewCountIndex(i.rating_overall, i.review_count)
		})

	#results = multikeysort(results, ['-ratingReviewCountIndex'])[0:15]
	return filterAndSortResults(results)

def findRestaurantsAlongRoute(route, leeway):
	route = eval(route)
	leeway = float(leeway)

	leewaySquared = leeway ** 2

	leftMostLongitude = 105.0
	rightMostLongitude = 103.0

	for i in route:
		if i[1] < leftMostLongitude:
			leftMostLongitude = i[1]
		if i[1] > rightMostLongitude:
			rightMostLongitude = i[1]
	
	query = db.GqlQuery(
		"""SELECT title, address, contact, rating_overall, rating_food, rating_ambience, rating_value, rating_service, review_count, latitude, longitude, url FROM Restaurant
		WHERE longitude >= %f AND longitude <= %f"""
		% (leftMostLongitude - leeway, rightMostLongitude + leeway)
	)

	results = []
	for i in query:
		restaurantWithinRange = False
		for j in route:
			if ((j[0] - i.latitude) ** 2 + (j[1] - i.longitude) ** 2) <= leewaySquared:
				restaurantWithinRange = True
				break

		if restaurantWithinRange:
			results.append({
				"title": i.title,
				"address": i.address,
				"contact": i.contact,
				"rating": i.rating_overall,
				"rating_food": i.rating_food,
				"rating_ambience": i.rating_ambience,
				"rating_value": i.rating_value,
				"rating_service": i.rating_service,
				"reviewCount": i.review_count,
				"latitude": i.latitude,
				"longitude": i.longitude,
				"waitingtime_serving": 10,
				"waitingtime_queuing": 10,
				"url": i.url,
				"ratingReviewCountIndex": calcRatingReviewCountIndex(i.rating_overall, i.review_count)
			})

	#results = multikeysort(results, ['-ratingReviewCountIndex'])[0:15]
	return filterAndSortResults(results)

def filterAndSortResults(results):
	results = multikeysort(results, ['-ratingReviewCountIndex'])
	returnValue = [];
	for i in range(1, len(results)):
		addToReturnValue = True
		for j in range(0, i):
			if(results[i]["longitude"] == results[j]["longitude"] and results[i]["latitude"] == results[j]["latitude"]):
				addToReturnValue = False
				break
		if addToReturnValue:
			returnValue.append(results[i]);
	return returnValue[0:15]


# this index calculator is a bit crude, could be improved.
# basic idea: (can be changed)
# low reviewCount + low rating = very low index
# low reviewCount + normal rating = low index
# low reviewCount + high rating = low-to-normal index
# normal reviewCount + low rating = low-to-normal index
# normal reviewCount + normal rating = normal index
# normal reviewCount + high rating = normal-to-high index
# high reviewCount + low rating = low index
# high reviewCount + normal rating = normal-to-high index 
# high reviewCount + high rating = very high index
def calcRatingReviewCountIndex(rating, reviewCount):
	if reviewCount >= 25:
		return rating * 1.1
	if reviewCount >= 8:
		return rating * (1 + (reviewCount / 250.0))
	return rating * (reviewCount / 8.0)

# use it like multikeysort(b, ['-COL_A', 'COL_B'])
def multikeysort(items, columns):
	from operator import itemgetter
	comparers = [ ((itemgetter(col[1:].strip()), -1) if col.startswith('-') else (itemgetter(col.strip()), 1)) for col in columns]  
	def comparer(left, right):
		for fn, mult in comparers:
			result = cmp(fn(left), fn(right))
			if result:
				return mult * result
		else:
			return 0
	return sorted(items, cmp=comparer)


def d(*v):
	output = ""
	for i in v:
		output += str(i) + "::"
	logging.warning(output)