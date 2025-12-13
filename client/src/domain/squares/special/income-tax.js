"use strict";

const { Special } = require("./special");

class IncomeTax extends Special {
    constructor() {
        super("income-tax", [10, 200]);
    }
}

module.exports = {
    IncomeTax
}
