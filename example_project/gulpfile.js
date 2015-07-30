"use strict";

var gulp = require("gulp");
var dabus = require("dabus");

// Build modules array from package.json
var packageJson = require("./package.json");
var modules = [];
var moduleName;
for (moduleName in packageJson.dependencies) {
    if (packageJson.dependencies.hasOwnProperty(moduleName)) {
        modules.push(moduleName);
    }
}

// Remove font-awesome as it is not a js lib
var faIndex = modules.indexOf("font-awesome");
if (faIndex > -1) {
    modules.splice(modules.indexOf("font-awesome"), 1);
}

// Init dabus
dabus(gulp, {
    buildDir: "./build/",
    scriptsDir: "./app/scripts/",
    scssDir: "./app/styles/",
    babelify: true,
    modules: modules,
    modulesDest: "scripts/modules.js",
    html: [{src: "./app/index.html", dest: "index.html"}],
    js: [{src: "./app/scripts/app.jsx", dest: "scripts/app.js"}],
    scss: [{src: "./app/styles/app.scss", dest: "styles/app.css"}],
    images: [{src: "./app/images/**/*.{gif,png}", dest: "images"}],
    statics: [{src: "./node_modules/font-awesome/fonts/*", dest: "fonts"}],
    onBuildSuccess: function(options) {
        console.log("Build done:", options);
    }
});
