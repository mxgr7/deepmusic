"use strict"

var Backbone = require("backbone"),
  _ = require("underscore")

module.exports = Backbone.Model.extend({

  initialize: function(attrs, opts) {
    opts || (opts = {})
    if (opts.filename)
      this.url = "analysis/" + opts.filename + ".json"
  }

})
