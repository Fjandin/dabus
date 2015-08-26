"use strict";

var exec = require("sync-exec");

// Get GIT info from dir
module.exports = function getGitInfo(path) {
    try {
        var cmd = "cd " + path + ";echo $(git symbolic-ref HEAD | sed 's!refs\/heads\/!!')";
        var result = {
            branch: exec(cmd, {cwd: __dirname}).stdout.replace(/\n/, "") || "",
            commit: exec("cd " + path + "; git log --format='%H' -n 1", {cwd: __dirname}).stdout.replace(/\n/, "") || ""
        };
        result.rev = result.commit.substr(0, 7);
        return result;
    } catch (e) {
        return {
            branch: "",
            commit: "",
            rev: ""
        };
    }
};
