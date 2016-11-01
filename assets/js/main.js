"use strict"

var $ = require("jquery"),
  Backbone = require("backbone"),
  _ = require("underscore"),
  URI = require("urijs"),
  Piece = require("./piece"),
  Controller = require("./controller"),
  Timeline = require("./timeline")

var audio

var uri = new URI(document.location)
var piece = new Piece({}, { filename: uri.segment(0) })
piece.fetch()

piece.on("sync", function() {
  audio = $("<audio>").attr("src", "media/" + piece.get("media"))
    .appendTo($("body"))[0]
  $(audio).on("loadedmetadata", function() {
    main()
  })
})

$(document).on("keyup", function(e) {
  switch(e.which) {
    case 32:
      if (audio.paused)
        audio.play()
      else
        audio.pause()
      break
  }
})

function main() {
  $(".controller").each(function() {
    new Controller({ el: this, audio: audio, model: piece })
  })
  $(".timeline").each(function() {
    new Timeline({ el: this, audio: audio, model: piece })
  })
  $(".piece-title").text(piece.get("title")).css({
    "color": piece.get("main-color")
  })

  $("body > .loading-overlay").fadeOut(400, "linear")
}


