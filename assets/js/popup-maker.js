"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore"),
  moment = require("moment"),
  Color = require("color")

var PopupMaker = module.exports = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.timeline = opts.timeline
    this.popups = []
    _(this.model.get("popups")).each(function(data) {
      var popupView = new PopupView({
        model: new PopupModel(data, { parse: true }),
        audio: this.audio,
        timeline: this.timeline
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
    this.timeline = opts.timeline
    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))
  },

  events: {
    "click [data-target]": "clickTarget"
  },

  timeUpdate: function() {
    var pastEnd = this.audio.currentTime > this.model.get("end"),
      pastStart = this.audio.currentTime > this.model.get("start")

    if(pastStart && ! pastEnd)
    {
      if(!this.isShowing)
        this.show()
    }
    else
      if(this.isShowing)
        this.hide()
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

  clickTarget: function(e) {
    var targetId = $(e.target).attr("data-target")
    this.timeline.playSegment(targetId)
  },

  render: function() {
    var body = this.model.get("body")
      .replace(/#([a-z0-9._-]+)/gi, function(match, id) {
        var content = $("<span>").attr("data-target", id)
        .addClass("btn btn-default btn-xs").html("♫")
        return $("<div>").append(content).html()
      })
    return this.$el.empty().hide().append(
      $("<div class='panel-body'>").html(body)
    )
  }
})
