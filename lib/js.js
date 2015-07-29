"use strict";

var path = require("path");
var gulpif = require("gulp-if");
var gutil = require("gulp-util");
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
    options = assign({
        src: undefined,
        watch: undefined,
        minify: undefined,
        require: undefined,
        external: undefined,
        filename: undefined,
        props: undefined,
        transform: undefined
    }, options);

    var replacer = createReplacer(options.props);
    var browserifyOptions = assign({}, watchify.args, {
        basedir: options.root || __dirname,
        entries: [options.src],
        extensions: options.transform ? [".jsx"] : undefined,
        debug: true,
        paths: [path.join(options.root, "./node_modules"), path.join(options.root, "./app/scripts")]
    });

    // Create bundle
    var browserifyBundle = browserify(browserifyOptions);

    // Watchify bundle
    if (options.watch) {
        browserifyBundle = watchify(browserifyBundle);
        browserifyBundle.on("update", bundle);
        browserifyBundle.on("log", gutil.log);
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
    if (options.transform) {
        browserifyBundle.transform("./node_modules/bob/node_modules/babelify");
    }

    function bundle() {
        if (options.watch) {
            browserSync.notify("Building JS");
        }
        return browserifyBundle.bundle()
            .on("error", gutil.log.bind(gutil, "Browserify Error:"))
            .pipe(source(options.filename))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(gulpif(options.props, replacer()))
            .pipe(gulpif(options.minify, uglify()))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(options.buildDir + "scripts"));

    }
    return bundle;
};
