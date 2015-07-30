"use strict";

var path = require("path");

var del = require("del");
var runSequence = require("run-sequence");
var browserSync = require("browser-sync");
var program = require("commander");
var assign = require("lodash").assign;
var gitInfo = require("./lib/git.js");
var jsTask = require("./lib/js.js");
var scssTask = require("./lib/scss.js");
var htmlTask = require("./lib/html.js");
var imageTask = require("./lib/image.js");
var staticTask = require("./lib/static.js");

module.exports = function bob(gulp, options) {
    options = assign({
        buildDir: "./build/",
        scriptsDir: "./app/scripts/",
        scssDir: "./app/styles/",
        babelify: true,
        modules: [],
        modulesDest: "scripts/modules.js",
        js: [],
        scss: [],
        html: [],
        images: [],
        statics: []
    }, options);

    // Program arguments
    program
        .version("0.0.3")
        .usage("[task] [options]")
        .option("-e, --env [enviroment]", "Build enviroment (development,production) [development]", "development")
        .option("-m, --minify", "Build minified/uglified")
        .parse(process.argv);

    // Some auto values in props
    options.root = module.parent.id.replace("gulpfile.js", "");
    options.props = {};
    options.minify = program.minify;
    options.props.GIT = gitInfo(options.root);
    options.props.ENV = program.env;

    // Create js build tasks
    options.js.forEach(function(file) {
        file.dest = path.join(file.dest);
        var jsOptions = {
            watch: false,
            babelify: options.babelify,
            minify: options.minify,
            buildDir: options.buildDir,
            scriptsDir: options.scriptsDir,
            external: options.modules,
            props: options.props,
            file: file,
            root: options.root
        };
        gulp.task("build-" + file.dest.split("/").join("-").replace(/\./g, "-"), jsTask(gulp, jsOptions));
    });

    // Create js build tasks (watchers)
    options.js.forEach(function(file) {
        file.dest = path.join(file.dest);
        var jsOptions = {
            watch: true,
            babelify: options.babelify,
            minify: options.minify,
            buildDir: options.buildDir,
            scriptsDir: options.scriptsDir,
            external: options.modules,
            props: options.props,
            file: file,
            root: options.root
        };
        gulp.task("build-watch-" + file.dest.split("/").join("-").replace(/\./g, "-"), jsTask(gulp, jsOptions));
    });

    // modules
    options.modulesDest = path.join(options.modulesDest);
    var libsOptions = {
        watch: false,
        minify: options.minify,
        buildDir: options.buildDir,
        scriptsDir: options.scriptsDir,
        require: options.modules,
        file: {src: null, dest: options.modulesDest},
        root: options.root
    };
    gulp.task("build-" + options.modulesDest.split("/").join("-").replace(/\./g, "-"), jsTask(gulp, libsOptions));

    // SCSS tasks
    options.scss.forEach(function(file) {
        file.dest = path.join(file.dest);
        var cssOptions = {
            watch: options.watch,
            minify: options.minify,
            buildDir: options.buildDir,
            file: file
        };
        gulp.task("build-" + file.dest.split("/").join("-").replace(/\./g, "-"), scssTask(gulp, cssOptions));
    });

    // HTML
    // Create js build tasks (watchers)
    options.html.forEach(function(file) {
        file.dest = path.join(file.dest);
        var htmlOptions = {
            buildDir: options.buildDir,
            props: options.props,
            file: file
        };
        gulp.task("build-" + file.dest.split("/").join("-").replace(/\./g, "-"), htmlTask(gulp, htmlOptions));
    });

    // IMAGES
    options.images.forEach(function(s) {
        var imagesOptions = {
            src: s.src,
            dest: s.dest,
            buildDir: options.buildDir
        };
        gulp.task("build-images-" + s.dest.split("/").join("-"), imageTask(gulp, imagesOptions));
    });

    // STATIC FILES
    options.statics.forEach(function(s) {
        var staticOptions = {
            src: s.src,
            dest: s.dest,
            buildDir: options.buildDir
        };
        gulp.task("build-static-" + s.dest.split("/").join("-"), staticTask(gulp, staticOptions));
    });

    // CLEAN BUILD DIR
    gulp.task("build-clean", function(cb) {
        return del([options.buildDir], cb);
    });

    // BUILD ALL
    var tasks = [
        "build-" + options.modulesDest.split("/").join("-").replace(/\./g, "-")
    ]
    .concat(options.statics.map(function(s) {return "build-static-" + s.dest.split("/").join("-"); }))
    .concat(options.images.map(function(s) {return "build-images-" + s.dest.split("/").join("-"); }))
    .concat(options.html.map(function(file) {return "build-" + file.dest.split("/").join("-").replace(/\./g, "-"); }))
    .concat(options.js.map(function(file) {return "build-" + file.dest.split("/").join("-").replace(/\./g, "-"); }))
    .concat(options.scss.map(function(file) {return "build-" + file.dest.split("/").join("-").replace(/\./g, "-"); }));
    gulp.task("build", function(cb) {
        runSequence.use(gulp)("build-clean", tasks, cb);
    });

    // BUILD ALL (WATCH MODE)
    var watchTasks = [
        "build-" + options.modulesDest.split("/").join("-").replace(/\./g, "-")
    ]
    .concat(options.statics.map(function(s) {return "build-static-" + s.dest.split("/").join("-"); }))
    .concat(options.images.map(function(s) {return "build-images-" + s.dest.split("/").join("-"); }))
    .concat(options.html.map(function(file) {return "build-" + file.dest.split("/").join("-").replace(/\./g, "-"); }))
    .concat(options.js.map(function(file) {return "build-watch-" + file.dest.split("/").join("-").replace(/\./g, "-"); }))
    .concat(options.scss.map(function(file) {return "build-" + file.dest.split("/").join("-").replace(/\./g, "-"); }));
    gulp.task("build-serve", function(cb) {
        runSequence.use(gulp)("build-clean", watchTasks, cb);
    });

    // BUILD ALL AND SERVE AND WATCH
    gulp.task("serve", ["build-serve"], function() {
        browserSync({
            open: false,
            server: {
                baseDir: options.buildDir
            }
        });

        // Watch scss
        options.scss.map(function(file) {
            gulp.watch(file.src.split("/").slice(0, -1).join("/") + "/**/*.scss", {interval: 500}, [
                "build-" + file.dest.split("/").join("-").replace(/\./g, "-"),
                function() {
                    return gulp.src(path.join(options.buildDir, file.dest)).pipe(browserSync.reload({stream: true}));
                }
            ]);
        });

        // Watch html
        options.html.map(function(file) {
            gulp.watch(file.src, {interval: 500}, [
                "build-" + file.dest.split("/").join("-").replace(/\./g, "-"),
                browserSync.reload
            ]);
        });
    });
};
