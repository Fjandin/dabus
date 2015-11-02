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
var packageJson = require("./package.json");

var dabus = function dabus(gulp, options) {
    options = assign({
        buildDir: "./build/",
        scriptsDir: "./app/scripts/",
        babelify: true,
        modules: null,
        js: [],
        scss: [],
        html: [],
        images: [],
        statics: []
    }, options);

    if (Array.isArray(options.modules)) {
        options.modules = {modules: options.modules, dest: options.modulesDest};
    }

    // Program arguments
    program
        .version(packageJson.version)
        .usage("[task] [options]")
        .option("-e, --environment [enviroment]", "Build enviroment (development,test,staging,production) [development]", "development")
        .option("-m, --minify (0/1) [minify]", "Build minified css and minified/uglified js", parseInt, 0)
        .option("-s --sourcemaps (0/1) [sourcemaps]", "Build with sourcemaps (js and css)", parseInt, 1)
        .option("-p --prefix (0/1) [prefix]", "Prefix built js/css files with timestamp", parseInt, 0)
        .parse(process.argv);

    // Some auto values in props
    options.root = module.parent.id.replace("gulpfile.js", "");
    options.props = {};
    options.minify = !!program.minify;
    options.sourcemaps = !!program.sourcemaps;
    options.props.GIT = gitInfo(options.root);
    options.props.ENV = program.environment;
    options.props.FILE_PREFIX = program.prefix ? (options.props.GIT.rev || Date.now()) + "." : "";

    // DISABLE PREFIX IF SERVE
    if (program.args[0] === "serve") {
        options.props.FILE_PREFIX = "";
    }

    // Create js build tasks
    var JS_TASKS = [];
    options.js.forEach(function(file) {
        var taskName = "build-" + file.dest.split("/").join("-").replace(/\./g, "-");
        JS_TASKS.push(taskName);
        if (options.props.FILE_PREFIX) {
            file.dest = file.dest.split("/");
            file.dest[file.dest.length - 1] = options.props.FILE_PREFIX + file.dest[file.dest.length - 1];
            file.dest = file.dest.join("/");
        }
        file.dest = path.join(file.dest);
        var jsOptions = {
            watch: false,
            babelify: file.babelify !== undefined ? file.babelify : options.babelify,
            minify: options.minify,
            sourcemaps: options.sourcemaps,
            buildDir: options.buildDir,
            scriptsDir: options.scriptsDir,
            external: options.modules && options.modules.modules || [],
            props: options.props,
            file: file,
            root: options.root
        };
        gulp.task(taskName, jsTask(gulp, jsOptions));
    });

    // Create js build tasks (watchers)
    var JS_WATCHIFY_TASKS = [];
    options.js.forEach(function(file) {
        var taskName = "build-watch-" + file.dest.split("/").join("-").replace(/\./g, "-");
        JS_WATCHIFY_TASKS.push(taskName);
        file.dest = path.join(file.dest);
        var jsOptions = {
            watch: true,
            babelify: options.babelify,
            minify: options.minify,
            sourcemaps: options.sourcemaps,
            buildDir: options.buildDir,
            scriptsDir: options.scriptsDir,
            external: options.modules.modules,
            props: options.props,
            file: file,
            root: options.root
        };
        gulp.task(taskName, jsTask(gulp, jsOptions));
    });

    // modules
    var JS_MODULES_TASK;
    if (options.modules) {
        JS_MODULES_TASK = "build-" + options.modules.dest.split("/").join("-").replace(/\./g, "-");
        if (options.props.FILE_PREFIX) {
            options.modules.dest = options.modules.dest.split("/");
            options.modules.dest[options.modules.dest.length - 1] = options.props.FILE_PREFIX + options.modules.dest[options.modules.dest.length - 1];
            options.modules.dest = options.modules.dest.join("/");
        }
        options.modules.dest = path.join(options.modules.dest);
        var libsOptions = {
            watch: false,
            minify: options.minify,
            sourcemaps: options.sourcemaps,
            buildDir: options.buildDir,
            scriptsDir: options.scriptsDir,
            require: options.modules.modules,
            file: {src: null, dest: options.modules.dest},
            root: options.root
        };
        gulp.task(JS_MODULES_TASK, jsTask(gulp, libsOptions));
    }

    // SCSS tasks
    var SCSS_TASKS = [];
    options.scss.forEach(function(file) {
        var taskName = "build-" + file.dest.split("/").join("-").replace(/\./g, "-");
        SCSS_TASKS.push(taskName);
        if (options.props.FILE_PREFIX) {
            file.dest = file.dest.split("/");
            file.dest[file.dest.length - 1] = options.props.FILE_PREFIX + file.dest[file.dest.length - 1];
            file.dest = file.dest.join("/");
        }
        file.dest = path.join(file.dest);
        var cssOptions = {
            watch: options.watch,
            minify: options.minify,
            sourcemaps: options.sourcemaps,
            buildDir: options.buildDir,
            file: file
        };
        gulp.task(taskName, scssTask(gulp, cssOptions));
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

    // TASK SEQUENCE
    var tasks = (JS_MODULES_TASK ? [JS_MODULES_TASK] : [])
    .concat(options.statics.map(function(s) {return "build-static-" + s.dest.split("/").join("-"); }))
    .concat(options.images.map(function(s) {return "build-images-" + s.dest.split("/").join("-"); }))
    .concat(options.html.map(function(file) {return "build-" + file.dest.split("/").join("-").replace(/\./g, "-"); }))
    .concat(SCSS_TASKS);

    // BUILD ALL

    gulp.task("build", function(cb) {
        runSequence.use(gulp)("build-clean", tasks.concat(JS_TASKS), function() {
            // Custom callback
            if (typeof options.onBuildSuccess === "function") {
                options.onBuildSuccess(options);
            }
            cb(null, options);
        });
    });

    // BUILD ALL (WATCH MODE)

    gulp.task("build-serve", function(cb) {
        runSequence.use(gulp)("build-clean", tasks.concat(JS_WATCHIFY_TASKS), cb);
    });

    // BUILD ALL AND SERVE AND WATCH
    gulp.task("serve", ["build-serve"], function() {
        browserSync({
            open: false,
            server: {
                baseDir: options.buildDir
            }
        });

        // Watch js
        // This happens in the js-watch tasks with watchify

        // Watch scss
        options.scss.map(function(file) {
            var watchSrc = file.watch || file.src.split("/").slice(0, -1).join("/") + "/**/*.scss";
            gulp.watch(watchSrc, {interval: 500}, [
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

dabus.readModulesFromPackage = function readModulesFromPackage(packagePath) {
    console.log(__dirname);
    packagePath = packagePath || "./package.json";
    var packageContent = require("./package.json");
    var modules = [];
    for (var moduleName in packageContent.dependencies) {
        if (packageJson.dependencies.hasOwnProperty(moduleName)) {
            // Ignore font-awesome as it is not a js lib
            if (moduleName === "font-awesome") {continue; }
            modules.push(moduleName);
        }
    }
    return modules;
};

module.exports = dabus;
