#!/usr/bin/env python
import webapp2
import jinja2
import os

jinja_environment = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"))

class MainHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("index.html")
		self.response.out.write(template.render())

class AjaxHandler(webapp2.RequestHandler):
	def post(self):
		path_lon_lat = eval(self.request.get("path_lon_lat"))
		self.response.out.write(path_lon_lat);

class DLHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("dl.html")
		self.response.out.write(template.render())

class LonLatFinderHandler(webapp2.RequestHandler):
	def get(self):
		template = jinja_environment.get_template("lon_lat_finder.html")
		self.response.out.write(template.render())

app = webapp2.WSGIApplication([
	("/", MainHandler),
	("/ajax", AjaxHandler),
	("/dl", DLHandler),
	("/llf", LonLatFinderHandler)
], debug=True)