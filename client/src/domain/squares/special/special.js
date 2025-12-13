"use strict";

const { precondition } = require("@infrastructure/contract");

class Special {
    constructor(id, args = []) {
        this._id = id;
        this._args = args;
    }

    match(visitor) {
        if (_.isFunction(visitor[this._id])) {
            return visitor[this._id].apply(this, this._args);
        }
        return visitor["_"]();
    }

    equals(other) {
        if (_.isFunction(other.match)) {
            const matcher = { _: () => false };
            matcher[this._id] = () => true;
            return other.match(matcher);
        }
        return false;
    }
}

module.exports = { Special };
