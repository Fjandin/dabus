"use strict";

var path = require("path");

module.exports = function(gulp, options) {
    return function() {
        return gulp.src(options.src)
            .pipe(gulp.dest(path.join(options.buildDir + options.dest)));
    };
};
