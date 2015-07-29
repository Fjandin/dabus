"use strict";

var del = require("del");
var runSequence = require("run-sequence");
var browserSync = require("browser-sync");
var program = require("commander");
var assign = require("lodash").assign;
var gitInfo = require("./lib/git.js");
var jsTask = require("./lib/js.js");
var scssTask = require("./lib/scss.js");
var htmlTask = require("./lib/html.js");
// var staticTask = require("./lib/static.js");

module.exports = function bob(gulp, options) {
    options = assign({
        buildDir: "./build/",
        modules: false,
        js: [],
        scss: [],
        props: {},
        root: (module.parent.id || __dirname).replace("gulpfile.js", "")
    }, options);

    // Program arguments
    program
        .version("0.0.1")
        .usage("[task] [options]")
        .option("-e, --env [enviroment]", "Build enviroment (development,production) [development]", "development")
        .option("-m, --minify", "Build minified/uglified")
        .option("-d, --debug", "Build in debug mode")
        .parse(process.argv);


    // Some auto values in props
    options.minify = program.minify;
    options.debug = program.debug;
    options.props.GIT = gitInfo(options.root);
    options.props.ENV = program.env;

    // Create js build tasks
    options.js.forEach(function(file) {
        var filename = file.split("/").pop();
        var jsOptions = {
            watch: false,
            transform: true,
            minify: options.minify,
            buildDir: options.buildDir,
            external: options.modules,
            props: options.props,
            entries: file,
            root: options.root,
            filename: file.split("/").pop()
        };
        gulp.task("build-" + filename.replace(/\./g, "-"), jsTask(jsOptions));
    });

    // Create js build tasks (watchers)
    options.js.forEach(function(file) {
        var filename = file.split("/").pop();
        var jsOptions = {
            watch: true,
            transform: true,
            minify: options.minify,
            buildDir: options.buildDir,
            external: options.modules,
            props: options.props,
            entries: file,
            root: options.root,
            filename: file.split("/").pop()
        };
        gulp.task("build-watch-" + filename.replace(/\./g, "-"), jsTask(jsOptions));
    });

    // Libs task
    var libsOptions = {
        watch: false,
        minify: options.minify,
        buildDir: options.buildDir,
        require: options.modules,
        filename: "libs.js",
        root: options.root
    };
    gulp.task("build-libs", jsTask(libsOptions));

    // SCSS tasks
    options.scss.forEach(function(file) {
        var filename = file.split("/").pop();
        var cssOptions = {
            watch: options.watch,
            debug: options.debug,
            minify: options.minify,
            buildDir: options.buildDir,
            src: file
        };
        gulp.task("build-" + filename.replace(/\./g, "-"), scssTask(cssOptions));
    });

    // INDEX.HTML
    gulp.task("build-html", htmlTask({props: options.props, buildDir: options.buildDir}));

    // STATIC FILES
    // TODO: Make staticTask method
    gulp.task("copy-static", function(cb) {
        // gulp.src(["./node_modules/font-awesome/fonts/*"])
        //    .pipe(gulp.dest(options.buildDir + "fonts"));
        gulp.src(["./app/images/**/*"])
            .pipe(gulp.dest(options.buildDir + "images"));
        cb();
    });

    // clean
    gulp.task("build-clean", function(cb) {
        return del([options.buildDir], cb);
    });

    // BUILD ALL
    var tasks = ["copy-static", "build-html", "build-libs"]
        .concat(options.js.map(function(file) {return "build-" + file.split("/").pop().replace(/\./g, "-"); }))
        .concat(options.scss.map(function(file) {return "build-" + file.split("/").pop().replace(/\./g, "-"); }));

    gulp.task("build", function(cb) {
        runSequence.use(gulp)("build-clean", tasks, cb);
    });

    // BUILD ALL AND SERVE AND WATCH
    var watchTasks = ["copy-static", "build-html", "build-libs"]
        .concat(options.js.map(function(file) {return "build-watch-" + file.split("/").pop().replace(/\./g, "-"); }))
        .concat(options.scss.map(function(file) {return "build-" + file.split("/").pop().replace(/\./g, "-"); }));

    gulp.task("build-serve", function(cb) {
        runSequence.use(gulp)("build-clean", watchTasks, cb);
    });

    gulp.task("serve", ["build-serve"], function() {
        browserSync({
            open: false,
            server: {
                baseDir: options.buildDir
            }
        });

        var watchScssTasks = options.scss.map(function(file) {return "build-" + file.split("/").pop().replace(/\./g, "-"); });
        watchScssTasks.push(function() {
            return gulp.src(["./build/styles/**/*.css"])
                .pipe(browserSync.reload({stream: true}));
        });

        // listeners
        gulp.watch("app/**/*.scss", { interval: 500 }, watchScssTasks);
        gulp.watch("app/index.html", { interval: 500 }, ["build-html", browserSync.reload]);
    });
};
