"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore"),
  moment = require("moment")
require("moment-duration-format")

var TechnicalInfo = module.exports = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.timeUpdate()
    $(this.audio).on("loadedmetadata timeupdate", this.timeUpdate.bind(this))
    this.render()
  },

  timeUpdate: function() {
    var d = moment.duration(this.audio.currentTime, "seconds")
    var t = d.format("h:mm:ss.SSS")
    this.$el.text(t)
  }

})
