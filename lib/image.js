"use strict";

var path = require("path");
var imagemin = require("gulp-imagemin");

module.exports = function(gulp, options) {
    return function() {
        return gulp.src(options.src)
            .pipe(imagemin({
                progressive: true,
                interlaced: true,
                optimizationLevel: 3
            }))
            .pipe(gulp.dest(path.join(options.buildDir + options.dest)));
    };
};
