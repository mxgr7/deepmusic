"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore"),
  moment = require("moment"),
  Color = require("color")

var PopupMaker = module.exports = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.popups = []
    _(this.model.get("popups")).each(function(data) {
      var popupView = new PopupView({
        model: new PopupModel(data, { parse: true }),
        audio: this.audio
      })
      this.listenTo(popupView, "before-show", function() {
        _(this.popups).each(function(p) {
          p.hide()
        })
      })
      this.$el.append(popupView.render())
    }, this)
  }

})

var PopupModel = Backbone.Model.extend({
  parse: function(attrs) {
    var s = attrs.start
    if ((s.match(/:/g) || []).length < 2)
      s = "0:" + s
    attrs.start = moment.duration(s).asMilliseconds() / 1000
    var e = attrs.end
    if ((e.match(/:/g) || []).length < 2)
      e = "0:" + e
    attrs.end = moment.duration(e).asMilliseconds() / 1000
    return attrs
  }
})

var PopupView = Backbone.View.extend({
  className: "popup panel panel-default",

  initialize: function(opts) {
    this.audio = opts.audio
    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))
  },

  timeUpdate: function() {
    var pastEnd = 0 <= this.audio.currentTime - this.model.get("end"),
      pastStart = 0 <= this.audio.currentTime - this.model.get("start")

    if(pastEnd)
    {
      if(this.isShowing)
        this.hide()
    }
    else if(pastStart)
    {
      if(!this.isShowing)
        this.show()
    }
  },

  show: function() {
    this.isShowing = true
    this.trigger("before-show")
    this.$el.show()
  },

  hide: function() {
    this.isShowing = false
    this.$el.hide()
  },

  render: function() {
    return this.$el.empty().hide().append(
      $("<div class='panel-body'>").html(this.model.get("body"))
    )
  }
})
