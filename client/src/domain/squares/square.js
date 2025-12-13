"use strict";

class Square {
    constructor(id, position, type) {
        this._id = id;
        this._position = position;
        this._type = type;
    }

    id() { return this._id; }
    position() { return this._position; }
    type() { return this._type; }
}

module.exports = { Square };
