"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore")

var youtubeApiSource = "https://www.youtube.com/iframe_api"

var Youtube = module.exports = Backbone.View.extend({

  YT: null,

  initialize: function(opts) {
    this.videoId = opts.videoId
    if(!this.YT) {
      window.onYouTubeIframeAPIReady = this.onAPIReady.bind(this)
      $("<script>").attr("src", youtubeApiSource)
      .insertBefore(this.el)
    }
  },

  onAPIReady: function() {
    this.YT = window.YT

    this.player = new this.YT.Player(this.el, {
      height: '160',
      width: '280',
      videoId: this.videoId,
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      },
      playerVars: {
        disablekb: 1,           // Disable keyboard controls
        controls: 0,            // Hide controls
        iv_load_plolicy: 3,     // Remove annotations
        rel: 0,                 // Don't show related videos
        showinfo: 0             // Don't display information like video title
      }
    })
  },

  onPlayerReady: function() {
    this.trigger("player-ready")
  },

  onPlayerStateChange: function() {
    this.trigger("state-change")
  }

})

