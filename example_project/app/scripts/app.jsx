"use strict";

import React from "react";
import ExampleComponent from "components/example";

// Need this here as babelify for some reason renders some code after the @if comment tag
void 0;
/* @if ENV="development" */
console.log("Environment:", "##ENV##, git:", "##GIT_BRANCH##@##GIT_REV##");
/* @endif */

// Start app
React.render(<ExampleComponent />, document.getElementById("app"));
