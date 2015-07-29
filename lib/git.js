"use strict";

var exec = require("sync-exec");

// Get GIT info from dir
module.exports = function getGitInfo(path) {
    try {
        var cmd = "cd " + path + ";echo $(git symbolic-ref HEAD | sed 's!refs\/heads\/!!')";
        return {
            branch: exec(cmd, {cwd: __dirname}).stdout.replace(/\n/, "") || "NO-GIT",
            commit: exec("cd " + path + "; git log --format='%H' -n 1", {cwd: __dirname}).stdout.replace(/\n/, "") || "NULL"
        };
    } catch (e) {
        return {
            branch: "NO-GIT",
            commit: "NULL"
        };
    }
};
