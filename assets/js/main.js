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
var piece = new Piece({}, { filename: uri.search(true).p })
piece.fetch()

piece.on("sync", function() {
  audio = $("<audio>").attr("src", "media/" + piece.get("media"))
    .appendTo($("body"))[0]
  main()
})

function main() {
  $(".controller").each(function() {
    new Controller({ el: this, audio: audio, model: piece })
  })
  $(".timeline").each(function() {
    new Timeline({ el: this, audio: audio, model: piece })
  })
}


