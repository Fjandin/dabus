"use strict";

var path = require("path");
var gulpif = require("gulp-if");
var browserSync = require("browser-sync");
var autoprefixer = require("autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var csswring = require("csswring");
var createReplacers = require("./replace.js");
var rename = require("gulp-rename");

module.exports = function(gulp, options) {
    var replacer = createReplacers(options.props);
    var postcssProcessors = [];

    // Autoprefix
    postcssProcessors.push(autoprefixer({browsers: ["last 2 version"]}));

    // Minify only on production
    options.minify && postcssProcessors.push(csswring);

    var filename = options.file.dest.split("/").pop();
    var dest = options.file.dest.split("/").slice(0, -1).join("/");

    return function() {
        browserSync.notify("Building CSS");

        return gulp.src(options.file.src)
            .pipe(rename(filename))
            .pipe(gulpif(options.sourcemaps, sourcemaps.init()))
            .pipe(gulpif(options.props, replacer()))
            .pipe(sass().on("error", function(err) {console.warn("Error:", err.message); this.emit("end"); }))
            .pipe(postcss(postcssProcessors))
            .pipe(gulpif(options.sourcemaps, sourcemaps.write(".")))
            .pipe(gulp.dest(path.join(options.buildDir, dest)));
    };
};
