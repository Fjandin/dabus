"use strict";

import React from "react"; // eslint-disable-line
import BaseComponent from "components/_base";

export default class ExampleComponent extends BaseComponent {
    constructor() {
        super();
        this._bind("test");
        this.state = {
            message: "Hello! Click me!"
        };
    }
    test() {
        this.setState({message: "Whoopty doo!"});
    }
    render() {
        return <div onClick={this.test}>{this.state.message}</div>;
    }
}
