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

app = webapp2.WSGIApplication([
	("/", MainHandler),
	("/ajax", AjaxHandler)
], debug=True)