"use strict";

var gulp = require("gulp");
var gulpif = require("gulp-if");
var browserSync = require("browser-sync");
var autoprefixer = require("autoprefixer-core");
var sourcemaps = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var csswring = require("csswring");
var assign = require("lodash").assign;
var createReplacers = require("./replace.js");

module.exports = function(options) {
    options = assign({
        watch: undefined,
        debug: undefined,
        minify: undefined,
        src: undefined,
        props: undefined
    }, options);

    var replacer = createReplacers(options.props);
    var postcssProcessors = [];

    // Autoprefix
    postcssProcessors.push(autoprefixer({browsers: ["last 2 version"]}));

    // Minify only on production
    options.minify && postcssProcessors.push(csswring);

    return function() {
        browserSync.notify("Building CSS");

        return gulp.src(options.src)
            .pipe(sourcemaps.init())
            .pipe(gulpif(options.props, replacer()))
            .pipe(sass({errLogToConsole: options.debug}))
            .pipe(postcss(postcssProcessors))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(options.buildDir + "styles"));
    };
};
