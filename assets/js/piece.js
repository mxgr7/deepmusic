"use strict"

var Backbone = require("backbone"),
  _ = require("underscore"),
  moment = require("moment")

module.exports = Backbone.Model.extend({

  initialize: function(attrs, opts) {
    opts || (opts = {})
    if (opts.filename)
      this.url = "analysis/" + opts.filename + ".json"
  },

  parse: function(attrs) {
    var d = attrs.duration
    if ((d.match(/:/g) || []).length < 2)
      d = "0:" + d
    attrs.duration = moment.duration(d).asMilliseconds() / 1000
    return attrs
  }

})
