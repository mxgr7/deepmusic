"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore"),
  moment = require("moment"),
  Color = require("color")

var segmentHeight = 2 * 1.2

var Timeline = module.exports = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    new ProgressView({ el: this.$(".timeline-progress"), audio: this.audio })
    this.render()
  },

  render: function() {
    this.$(".timeline-bar").css({
      "background-color": this.model.get("main-color")
    })

    var mainColor = Color(this.model.get("main-color"))
    var cursorColor = mainColor.clone()
    if(mainColor.luminosity() > 0.1)
      cursorColor.darken(0.3)
    else
      cursorColor.lighten(5)

    this.$(".timeline-cursor").css({
      "background-color": cursorColor.hexString()
    })

    $("<img>").attr("src", "media/" + this.model.get("waveform"))
      .appendTo(this.$(".waveform"))

    var $segmentsContainer = this.$("> .segments")
    _(this.model.get("segments")).each(function(row) {
      var r = new SegmentRow({
        depth: row.depth,
        segments: row.children,
        model: this.model,
        audio: this.audio,
        timeline: this
      })
      $segmentsContainer.append(r.el)
      r.render()
    }, this)

    var $popupsContainer = this.$("> .popups")
    _(this.model.get("popups")).each(function(popup) {
      var p = new PopupView({
        model: new Backbone.Model(popup),
        audio: this.audio
      })
      $popupsContainer.append(p.$el)
    }, this)
    return this.$el
  }
})

var ProgressView = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.$bar = this.$(".timeline-bar")
    this.$cursor = this.$(".timeline-cursor")

    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))
  },

  timeUpdate: function() {
    if(this.mouseIsDown)
      return
    var percentage = this.audio.currentTime / this.audio.duration
    this.$bar.width(percentage * this.$el.width())
  },

  events: {
    "mousedown": "mouseDown",
    "mouseup": "mouseUp",
    "mousemove": "mouseMove",
    "mouseout": "mouseOut"
  },

  mouseDown: function(e) {
    this.mouseIsDown = true
    this.mouseMove(e)
  },

  mouseUp: function(e) {
    this.mouseIsDown = false
    var percentage = (e.pageX - this.$el.offset().left) / this.$el.width()
    this.audio.currentTime = percentage * this.audio.duration
  },

  mouseMove: function(e) {
    var percentage = (e.pageX - this.$el.offset().left) / this.$el.width()
    if(this.mouseIsDown) {
      this.$bar.width(percentage * this.$el.width())
      return
    }

    this.$cursor.css("left", percentage * this.$el.width())
    .show()
  },

  mouseOut: function() {
    this.$cursor.hide()
  }
})

var SegmentRow = Backbone.View.extend({
  className: "segments-row",

  initialize: function(opts) {
    this.depth = opts.depth
    this.segments = opts.segments
    this.audio = opts.audio
    this.timeline = opts.timeline
  },

  render: function() {
    var maxHeight = 0
    var segmentViews = []
    _(this.segments).each(function(segment) {
      var s = new SegmentView({
        model: new Segment(segment, { piece: this.model, parse: true }),
        audio: this.audio,
        row: this,
        timeline: this.timeline
      })
      this.$el.append(s.el)
      s.render()
      maxHeight = Math.max(maxHeight, s.$el.outerHeight())
      segmentViews.push(s)
    }, this)

    _(segmentViews).each(function(s) {
      s.$el.outerHeight(maxHeight)
    })

    this.$el.height(maxHeight).css({
      "border-color": this.model.get("main-color")
    })

    return this.$el
  }
})

var SegmentView = Backbone.View.extend({
  className: "segment",
  tagName: "span",

  initialize: function(opts) {
    this.audio = opts.audio
    this.row = opts.row
    this.timeline = opts.timeline
    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))
  },

  events: {
    "click": "onClick",
    "mouseover": "mouseOver",
    "mouseout": "mouseOut"
  },

  onClick: function(e) {
    e.preventDefault()
    this.activate()
    this.audio.currentTime = this.model.get("start")
    this.audio.play()
  },

  activate: function() {
    if(this.timeline.activeSegment)
      this.timeline.activeSegment.deactivate()
    this.timeline.activeSegment = this
    this.$bar.show()
  },

  deactivate: function() {
    this.$bar.hide()
  },

  render: function() {
    var m = this.model.toJSON()
    var p = this.model.piece.toJSON()
    this.$el.css({
      "left": (m.start / p.duration * 100) + "%",
      "width": (m.duration / p.duration * 100) + "%",
      "background-color": this.bgColor().hexString(),
      "color": Color(m.color).luminosity() > 0.25 ? "#000" : "#fff" 
    })
    $("<span class='segment-text'>").text(m.name)
    .appendTo(this.$el)
    this.$bar = $("<span class='segment-progress'>")
    .css({
      "background-color": this.bgColor().darken(0.5).hexString()
    })
    .appendTo(this.$el)
    return this.$el
  },

  bgColor: function(hover) {
    var c = Color(this.model.get("color"))
    if (hover)
      c.lighten(0.15)
    return c
  },

  timeUpdate: function() {
    if(this != this.timeline.activeSegment)
      return
    var percentage = (this.audio.currentTime - this.model.get("start")) /
      this.model.get("duration")
    if (percentage >= 0 && percentage <= 1)
      this.$bar.width(percentage * this.$el.width()).show()
    else
    {
      this.deactivate()
      delete this.timeline.activeSegment
      this.audio.pause()
    }
  },

  mouseOver: function() {
    this.$el.css({
      "background-color": this.bgColor(true).hexString()
    })
  },

  mouseOut: function() {
    this.$el.css({
      "background-color": this.bgColor(false).hexString()
    })
  }

})

var Segment = Backbone.Model.extend({
  initialize: function(attrs, opts) {
    this.piece = opts.piece
  },

  parse: function(attrs) {
    var s = attrs.start
    if ((s.match(/:/g) || []).length < 2)
      s = "0:" + s
    attrs.start = moment.duration(s).asMilliseconds() / 1000
    var e = attrs.end
    if ((e.match(/:/g) || []).length < 2)
      e = "0:" + e
    attrs.end = moment.duration(e).asMilliseconds() / 1000
    attrs.duration = attrs.end - attrs.start
    return attrs
  }
})

var PopupView = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio

    this.$el.hide()

    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))
  },

  timeUpdate: function() {
  },

  show: function() {
  }
})
