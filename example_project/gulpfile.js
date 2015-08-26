"use strict";

var gulp = require("gulp");
var dabus = require("dabus");

// Build modules array from package.json
var packageJson = require("./package.json");
var modules = [];
for (var moduleName in packageJson.dependencies) {
    if (packageJson.dependencies.hasOwnProperty(moduleName)) {
        // Ignore font-awesome as it is not a js lib
        if (moduleName === "font-awesome") {continue; }
        modules.push(moduleName);
    }
}

// Init dabus
dabus(gulp, {
    // Target build directory
    buildDir: "./build/",
    // Path to directory that contains js (added to search path when using import/require)
    scriptsDir: "./app/scripts/",
    // Is this is defined a seperate file is built containing these modules
    modules: {modules: modules, dest: "scripts/modules.js"},
    // Process HTML files (see more below)
    html: [{src: "./app/index.html", dest: "index.html"}],
    // Build JS(x) files
    js: [{src: "./app/scripts/app.jsx", dest: "scripts/app.js", babelify: true}],
    // Build sass
    scss: [
        {src: "./app/styles/app.scss", dest: "styles/app.css", watch: ["./app/styles/**/*.scss", "!./app/styles/font-awesome.scss"]},
        {src: "./app/styles/font-awesome.scss", dest: "styles/font-awesome.css", watch: ["./app/styles/font-awesome.scss"]}
    ],
    // Images are minified before copied over
    images: [{src: "./app/images/**/*.{gif,png}", dest: "images"}],
    // Static files are just copied over... nothing more, nothing less
    statics: [{src: "./node_modules/font-awesome/fonts/*", dest: "fonts"}],
    // Callback when build is done
    onBuildSuccess: function(options) {
        console.log("Build done:", options);
    }
});
