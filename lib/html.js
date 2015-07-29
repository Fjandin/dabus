"use strict";

var gulp = require("gulp");
var replace = require("gulp-replace");
var browserSync = require("browser-sync");
var createReplacer = require("./replace.js");

module.exports = function(options) {

    var replacer = createReplacer((options || {}).props);

    return function() {
        browserSync.notify("Building HTML");

        return gulp.src("app/index.html")
            .pipe(replacer())
            .pipe(replace(/^\s+?\n/gim, ""))
            .pipe(gulp.dest(options.buildDir));
    }
};
