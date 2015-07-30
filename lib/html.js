"use strict";

var path = require("path");
var replace = require("gulp-replace");
var browserSync = require("browser-sync");
var createReplacer = require("./replace.js");
var rename = require("gulp-rename");

module.exports = function(gulp, options) {

    var replacer = createReplacer((options || {}).props);

    var filename = options.file.dest.split("/").pop();
    var dest = options.file.dest.split("/").slice(0, -1).join("/");

    return function() {
        browserSync.notify("Building HTML");
        return gulp.src(options.file.src)
            .pipe(rename(filename))
            .pipe(replacer())
            .pipe(replace(/^\s+?\n/gim, ""))
            .pipe(gulp.dest(path.join(options.buildDir, dest)));
    };
};
