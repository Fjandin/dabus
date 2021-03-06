"use strict";

import React from "react"; // eslint-disable-line
import BaseComponent from "components/_base";

export default class ExampleComponent extends BaseComponent {
    constructor() {
        super();
        this._bind("test");
        this.state = {
            message: "Hello! Click me!",
            color: "green"
        };
    }
    test() {
        // this.setState({message: "Whoopty doo!"});
        this.setState({color: "red"});
    }
    render() {
        let style = {color: this.state.color};
        return <div onClick={this.test} style={style}>{this.state.message}</div>;
    }
}
