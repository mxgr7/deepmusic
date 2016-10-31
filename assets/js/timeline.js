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

    $("<img>").attr("src", "media/" + this.model.get("waveform"))
      .appendTo(this.$(".waveform"))

    var $segments = this.$("> .segments")
    _(this.model.get("segments")).each(function(row) {
      var r = new SegmentRow({
        depth: row.depth,
        segments: row.children,
        model: this.model,
        audio: this.audio
      })
      $segments.append(r.el)
      r.render()
    }, this)
    return this.$el
  }
})

var ProgressView = Backbone.View.extend({
  initialize: function(opts) {
    this.audio = opts.audio
    this.$bar = this.$(".timeline-bar")

    $(this.audio).on("timeupdate", this.timeUpdate.bind(this))
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
  }
})

var SegmentRow = Backbone.View.extend({
  className: "segments-row",

  initialize: function(opts) {
    this.depth = opts.depth
    this.segments = opts.segments
    this.audio = opts.audio
  },

  render: function() {
    var maxHeight = 0
    var segmentViews = []
    _(this.segments).each(function(segment) {
      var s = new SegmentView({
        model: new Segment(segment, { piece: this.model, parse: true }),
        audio: this.audio
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
  tagName: "a",

  initialize: function(opts) {
    this.audio = opts.audio
    this.$el.attr("href", "#")
  },

  events: {
    "click": "onClick"
  },

  onClick: function(e) {
    e.preventDefault()
    this.audio.currentTime = this.model.get("start")
    this.audio.play()
  },

  render: function() {
    var m = this.model.toJSON()
    var p = this.model.piece.toJSON()
    this.$el.text(m.name)
    .css({
      "left": (m.start / p.duration * 100) + "%",
      "width": (m.duration / p.duration * 100) + "%",
      "background-color": m.color,
      "color": Color(m.color).luminosity() > 0.25 ? "#000" : "#fff" 
    })
    return this.$el
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
