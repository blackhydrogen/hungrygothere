#!/usr/bin/env python
import webapp2
import jinja2
import os
import json
import logging
from google.appengine.ext import db

jinja_environment = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"))

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

class halfwayEatWhereHandler(webapp2.RequestHandler):
	def get(self):
		self.response.out.write("output page template here")

##### Ajax Handlers #####
class getNearbyRestaurantsHandler(webapp2.RequestHandler):
	#def get(self):
		#self.response.headers["Content-Type"] = "application/json"
		#self.response.out.write(json.dumps({"restaurants": [], "error": True, "errorMsg": "GET method not supported."}))
	def post(self):
		results = findNearbyRestaurants(self.request.get("latitude"), self.request.get("longitude"), 0.002);
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
	("/whereCanEat", whereCanEatHandler),
	("/getNearbyRestaurants", getNearbyRestaurantsHandler)
], debug=True)

##### Models #####

class Restaurant(db.Model):
	title = db.StringProperty(required=True)
	address = db.StringProperty(required=True, multiline=True)
	contact = db.StringProperty()
	rating_overall = db.IntegerProperty()
	rating_food = db.IntegerProperty()
	rating_ambience = db.IntegerProperty()
	rating_value = db.IntegerProperty()
	rating_service = db.IntegerProperty()
	review_count = db.IntegerProperty(required=True)
	latitude_longitude = db.GeoPtProperty(required=True)
	waitingtime_queuing = db.IntegerProperty()
	waitingtime_serving = db.IntegerProperty()
	url = db.StringProperty()

##### Functions #####

# find restaurants within longitude/latitude +/- leeway; 0.02 ~= 4.4 km box
def findNearbyRestaurants(userLatitude, userLongitude, leeway = 0.02):
	userLatitude = float(userLatitude)
	userLongitude = float(userLongitude)
	leeway = float(leeway)

	query = db.GqlQuery(
		"""SELECT title, address, rating_overall, latitude_longitude FROM Restaurant
		WHERE latitude_longitude >= GEOPT(%f, %f) AND latitude_longitude <= GEOPT(%f, %f)"""
		% (userLatitude - leeway, userLongitude - leeway, userLatitude + leeway, userLongitude + leeway)
	)

	results = []
	for i in query:
		results.append({
			"title": i.title,
			"address": i.address,
			"rating": i.rating_overall,
			"latitude": i.latitude_longitude.lat,
			"longitude": i.latitude_longitude.lon
		})

	return results