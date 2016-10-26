"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore")


module.exports = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.$bar = this.$(".timeline-bar")

    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))

    this.render(this.model)
  },

  timeUpdate: function() {
    this.$bar.width(this.audio.currentTime / this.audio.duration * this.$el.width())
  },

  events: {
    "mousedown": "mouseDown",
  },

  mouseDown: function(e) {
    var percentage = (e.pageX - this.$el.offset().left) / this.$el.width()
    this.audio.currentTime = percentage * this.audio.duration
  },

  render: function(model) {
    _(model.get("segments")).each(function(segment) {
      var $s = $("<span>").text(segment.name)
      .appendTo(this.$el)
    }, this)
  }
})
