"use strict";

var lazypipe = require("lazypipe");
var replace = require("gulp-replace");

// Replacers for source
module.exports = function(props) {
    props = props || {GIT: {}};
    return lazypipe()
        .pipe(replace, new RegExp("<!-- @if ENV=\"(?:.*?,|)" + props.ENV + "(?:,.*?|)\" -->([\\S\\s]*?)<!-- @endif -->", "gim"), "$1")
        .pipe(replace, new RegExp("\\/\\*\\s?@if ENV=\"(?:.*?,|)" + props.ENV + "(?:,.*?|)\"\\s?\\*\\/([\\S\\s]*?)\\/\\*\\s?@endif\\s?\\*\\/", "gim"), "$1")
        .pipe(replace, new RegExp("<!-- @if .*?=\".*?\" -->[\\S\\s]*?<!-- @endif -->", "gim"), "")
        .pipe(replace, new RegExp("\\/\\*\\s?@if .*?=\".*?\"\\s?\\*\\/[\\S\\s]*?\\/\\*\\s?@endif\\s?\\*\\/", "gim"), "")
        .pipe(replace, /##GIT_BRANCH##/g, props.GIT.branch)
        .pipe(replace, /##GIT_COMMIT##/g, props.GIT.commit)
        .pipe(replace, /##GIT_REV##/g, props.GIT.rev)
        .pipe(replace, /##TIMESTAMP##/g, (new Date()).valueOf())
        .pipe(replace, /##RANDOM##/g, Math.random())
        .pipe(replace, /##ENV##/g, props.ENV)
        .pipe(replace, /##FILE_PREFIX##/g, props.FILE_PREFIX);
};
