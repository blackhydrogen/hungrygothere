#!/usr/bin/env python
import webapp2
import jinja2
import os
import json
import logging
from operator import itemgetter
from google.appengine.ext import db
from google.appengine.api import users

jinja_environment = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"))

###################################################################################################
##### Direct File Imports #########################################################################
###################################################################################################

execfile("admin.py")



###################################################################################################
###################################################################################################
##### Page Handlers (No authentication required) ##################################################
###################################################################################################
###################################################################################################

class MainHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("index.html")
		self.response.out.write(template.render())

class DLHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("dl.html")
		self.response.out.write(template.render())

class genericTestHandler(webapp2.RequestHandler):
	def get(self):
		self.response.out.write("No test page currently")
		#template = jinja_environment.get_template("directions_test.html")
		#self.response.out.write(template.render())



###################################################################################################
###################################################################################################
##### Page Handlers (Authentication required) #####################################################
###################################################################################################
###################################################################################################

class loginHandler(webapp2.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			self.redirect("/")
		else:
			self.redirect(self.request.host_url)



###################################################################################################
###################################################################################################
##### Dynamic Script Handlers #####################################################################
###################################################################################################
###################################################################################################

class userLoginInfoHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/javascript"

		writeValues = {
			"nickname": "",
			"logoutUrl": ""
		}

		user = users.get_current_user()
		if user:  # signed in already
			writeValues["nickname"] = users.get_current_user().nickname()
			writeValues["logoutUrl"] = users.create_logout_url(self.request.host_url)

		template = jinja_environment.get_template("userLoginInfo.js")
		self.response.out.write(template.render(writeValues))



###################################################################################################
###################################################################################################
##### Ajax Handlers ###############################################################################
###################################################################################################
###################################################################################################

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

class getFavouriteRestaurantsHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		user = users.get_current_user()

		if user:
			hgtUser = HgtUser.get_or_insert(user.user_id(), user = user)
			results = []

			restaurantList = hgtUser.favouriteRestaurants;
			restaurantList.order('-timeAdded')

			for i in restaurantList:
				results.append(convertToJSON(i.restaurant))

			self.response.out.write(json.dumps({"restaurants": results, "error": False}))
		else:
			self.response.out.write(json.dumps({"restaurants": [], "error": True, "errorMsg": "User not logged in."}))

class getRecentRestaurantsHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		user = users.get_current_user()

		if user:
			hgtUser = HgtUser.get_or_insert(user.user_id(), user = user)
			results = []

			restaurantList = hgtUser.favouriteRestaurants;
			restaurantList.order('-timeAdded')

			for i in restaurantList:
				results.append(convertToJSON(i.restaurant))

			self.response.out.write(json.dumps({"restaurants": results, "error": False}))
		else:
			self.response.out.write(json.dumps({"restaurants": [], "error": True, "errorMsg": "User not logged in."}))

class addFavouriteRestaurantHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"error": True, "errorMsg": "GET method not supported."}))
	def post(self):
		self.response.headers["Content-Type"] = "application/json"
		user = users.get_current_user()

		if user:
			try:
				hgtUser = HgtUser.get_or_insert(user.user_id(), user = user)
				restaurantId = int(self.request.get("id"))

				restaurant = Restaurant.get_by_id(restaurantId)

				if restaurant is None:
					raise Exception()
				
				FavouriteLink(user=hgtUser, restaurant=restaurant).put()
				self.response.out.write(json.dumps({"error": False}))
			except:
				self.response.out.write(json.dumps({"error": True, "errorMsg": "ID provided is invalid."}))
		else:
			self.response.out.write(json.dumps({"error": True, "errorMsg": "User not logged in."}))

class addRecentRestaurantHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"error": True, "errorMsg": "GET method not supported."}))
	def post(self):
		self.response.headers["Content-Type"] = "application/json"
		user = users.get_current_user()

		if user:
			try:
				hgtUser = HgtUser.get_or_insert(user.user_id(), user = user)
				restaurantId = int(self.request.get("id"))

				restaurant = Restaurant.get_by_id(restaurantId)

				if restaurant is None:
					raise Exception()
				
				RecentLink(user=hgtUser, restaurant=restaurant).put()
				#delete last entry if too long? or in the getRecent handler?
				self.response.out.write(json.dumps({"error": False}))
			except:
				self.response.out.write(json.dumps({"error": True, "errorMsg": "ID provided is invalid."}))
		else:
			self.response.out.write(json.dumps({"error": True, "errorMsg": "User not logged in."}))

class isFavouriteRestaurantHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json.dumps({"error": True, "errorMsg": "GET method not supported."}))
	def post(self):
		self.response.headers["Content-Type"] = "application/json"
		user = users.get_current_user()

		if user:
			try:
				hgtUser = HgtUser.get_or_insert(user.user_id(), user = user)
				restaurantId = int(self.request.get("id"))

				restaurant = Restaurant.get_by_id(restaurantId)

				if restaurant is None:
					raise Exception()
				
				#RecentLink(user=hgtUser, restaurant=restaurant).put()
				#delete last entry if too long? or in the getRecent handler?
				#placeholder
				###############################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################
				###############################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################
				###############################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################
				self.response.out.write(json.dumps({"error": False, "isFavourite": False}))
			except:
				self.response.out.write(json.dumps({"error": True, "errorMsg": "ID provided is invalid."}))
		else:
			self.response.out.write(json.dumps({"error": True, "errorMsg": "User not logged in."}))


###################################################################################################
###################################################################################################
###################################################################################################
##### Pages definition ############################################################################
###################################################################################################
###################################################################################################
###################################################################################################

app = webapp2.WSGIApplication([
	("/", MainHandler),
	("/a", loginHandler),

	("/getNearbyRestaurants", getNearbyRestaurantsHandler),
	("/getRestaurantsAlongRoute", getRestaurantsAlongRouteHandler),
	("/getFavouriteRestaurants", getFavouriteRestaurantsHandler),
	("/getRecentRestaurants", getRecentRestaurantsHandler),
	("/addFavouriteRestaurant", addFavouriteRestaurantHandler),
	("/addRecentRestaurant", addRecentRestaurantHandler),
	("/isFavouriteRestaurant", isFavouriteRestaurantHandler),

	("/dscripts/userLoginInfo.js", userLoginInfoHandler),

	("/dl", DLHandler),
	("/test", genericTestHandler),
	("/admin", AdminPageHandler)
], debug=True)



###################################################################################################
###################################################################################################
###################################################################################################
##### Models ######################################################################################
###################################################################################################
###################################################################################################
###################################################################################################

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

class HgtUser(db.Model):
	user = db.UserProperty()

class RecentLink(db.Model):
	user = db.ReferenceProperty(reference_class=HgtUser, collection_name="recentRestaurants")
	restaurant = db.ReferenceProperty(reference_class=Restaurant, collection_name="usersRecented")
	timeAdded = db.DateTimeProperty(auto_now_add=True)

class FavouriteLink(db.Model):
	user = db.ReferenceProperty(reference_class=HgtUser, collection_name="favouriteRestaurants")
	restaurant = db.ReferenceProperty(reference_class=Restaurant, collection_name="usersFavourited")
	timeAdded = db.DateTimeProperty(auto_now_add=True)



###################################################################################################
###################################################################################################
###################################################################################################
##### Functions ###################################################################################
###################################################################################################
###################################################################################################
###################################################################################################

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
		results.append(convertToJSON(i))

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
			results.append(convertToJSON(i))

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

def convertToJSON(restaurant):
	return {
		"title": restaurant.title,
		"address": restaurant.address,
		"contact": restaurant.contact,
		"rating": restaurant.rating_overall,
		"rating_food": restaurant.rating_food,
		"rating_ambience": restaurant.rating_ambience,
		"rating_value": restaurant.rating_value,
		"rating_service": restaurant.rating_service,
		"reviewCount": restaurant.review_count,
		"latitude": restaurant.latitude,
		"longitude": restaurant.longitude,
		"waitingtime_serving": 10,
		"waitingtime_queuing": 10,
		"url": restaurant.url,
		"ratingReviewCountIndex": calcRatingReviewCountIndex(restaurant.rating_overall, restaurant.review_count),
		"id": restaurant.key().id()
	}


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