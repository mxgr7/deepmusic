"use strict"

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt)

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      options: {
        watch: true
      },
      dev: {
        options: {
          browserifyOptions: {
            insertGlobals: true,
            debug: true,
            noParse: [
              'jquery',
              'backbone',
              'underscore',
              'bootstrap'
            ]
          }
        },
        src: './assets/js/main.js',
        dest: 'public/assets/js/main.js'
      },
      dist: {
        src: './assets/js/main.js',
        dest: 'public/assets/js/main.js'
      },
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'assets/js/**/*.js']
    },

    sass: {
      dist: {
        options: {
          style: 'expanded',
          precision: 8,
          loadPath: ['node_modules'],
          update: true,
          sourceMap: true,
          outputStyle: 'compressed'
        },
        files: {
          'public/assets/css/main.min.css': 'assets/stylesheets/main.scss'
        }
      },
      dev: {
        options: {
          style: 'expanded',
          precision: 8,
          loadPath: ['node_modules'],
          update: true,
          sourceMap: true,
          outputStyle: 'expanded'
        },
        files: {
          'public/assets/css/main.css': 'assets/stylesheets/main.scss',
        }
      }
    },

    watch: {
      options: {
        spawn: false,
        livereload: {
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      style: {
        files: ['assets/stylesheets/**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      },
    }

  });

  grunt.registerTask('default', ["browserify:dev", "sass:dev"]);
  grunt.registerTask('dist', []);

};
