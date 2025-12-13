"use strict";

const { Special } = require("./special");

class FreeParking extends Special {
    constructor() {
        super("parking");
    }
}

module.exports = {
    FreeParking
}