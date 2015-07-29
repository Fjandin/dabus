"use strict";

var replace = require("gulp-replace");
var browserSync = require("browser-sync");
var createReplacer = require("./replace.js");

module.exports = function(gulp, options) {

    var replacer = createReplacer((options || {}).props);

    return function() {
        browserSync.notify("Building HTML");

        return gulp.src("app/index.html")
            .pipe(replacer())
            .pipe(replace(/^\s+?\n/gim, ""))
            .pipe(gulp.dest(options.buildDir));
    };
};
