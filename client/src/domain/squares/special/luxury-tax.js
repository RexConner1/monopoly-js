"use strict";

const { Special } = require("./special");

class LuxuryTax extends Special {
    constructor() {
        super("luxury-tax", [75]);
    }
}

module.exports = {
    LuxuryTax
}
