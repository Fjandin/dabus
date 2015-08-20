"use strict";

var path = require("path");
var gulpif = require("gulp-if");
var watchify = require("watchify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var assign = require("lodash").assign;
var browserSync = require("browser-sync");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var createReplacer = require("./replace.js");

module.exports = function createJSBuildTask(gulp, options) {
    var replacer = createReplacer(options.props);
    var browserifyOptions = assign({}, watchify.args, {
        basedir: options.root,
        entries: options.file && options.file.src || undefined,
        extensions: options.babelify ? [".jsx"] : undefined,
        debug: options.sourcemaps,
        paths: [path.join(options.root, "./node_modules"), path.join(options.root, options.scriptsDir)]
    });

    // Create bundle
    var browserifyBundle = browserify(browserifyOptions);

    // Watchify bundle
    if (options.watch) {
        browserifyBundle = watchify(browserifyBundle);
        browserifyBundle.on("update", bundle);
        browserifyBundle.on("log", console.log);
        browserifyBundle.on("time", browserSync.reload);
    }

    // Requires
    (options.require || []).forEach(function(moduleName) {
        browserifyBundle.require(moduleName);
    });

    // Externals
    (options.external || []).forEach(function(moduleName) {
        browserifyBundle.external(moduleName);
    });

    // transform
    if (options.babelify) {
        browserifyBundle.transform("./node_modules/dabus/node_modules/babelify");
    }

    var filename = options.file.dest.split("/").pop();
    var dest = options.file.dest.split("/").slice(0, -1).join("/");

    function bundle() {
        if (options.watch) {
            browserSync.notify("Building JS");
        }
        return browserifyBundle.bundle()
            .on("error", function(err) {console.log("Browserify Error:", err.message); this.emit("end"); })
            .pipe(source(filename))
            .pipe(buffer())
            .pipe(gulpif(options.sourcemaps, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(options.props, replacer()))
            .pipe(gulpif(options.minify, uglify()))
            .pipe(gulpif(options.sourcemaps, sourcemaps.write(".")))
            .pipe(gulp.dest(path.join(options.buildDir, dest)));

    }
    return bundle;
};
