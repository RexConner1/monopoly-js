"use strict";

const { Special } = require("./special");

class CommunityChest extends Special {
    constructor() {
        super("community-chest", []);
    }
}

module.exports = {
    CommunityChest
}
