"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore"),
  moment = require("moment")
require("moment-duration-format")

var Controller = module.exports = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.$position = this.$(".position")
    this.timeUpdate()
    $(this.audio).on("loadedmetadata timeupdate", this.timeUpdate.bind(this))
    this.render()
  },

  timeUpdate: function() {
    var d = moment.duration(this.audio.currentTime, "seconds")
    var td = moment.duration(this.audio.duration, "seconds")
    var t = d.hours() ? d.format("h:mm:ss") : d.format("m:ss", { trim: false })
    t += " / " + (td.hours() ? td.format("h:mm:ss") : td.format("m:ss", { trim: false }))
    this.$position.text(t)
  },

  events: {
    "click .playpause": "togglePlay",
    "keyup": "keyUp"
  },

  keyUp: function(e) {
    switch(e.which) {
      case 32:
        if (this.audio.paused)
          this.audio.play()
        else
          this.audio.pause()
        break
    }
  },

  togglePlay: function() {
    if (this.audio.paused)
      this.audio.play()
    else
      this.audio.pause()
  },

  render: function() {
    this.$(".btn").css({
      "background-color": this.model.get("main-color")
    })

  }
})
