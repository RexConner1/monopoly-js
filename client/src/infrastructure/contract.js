"use strict";

const precondition = (check, message) => {
    if (!check) {
        throw new Error("Precondition: " + message);
    }
};

module.exports = {
    precondition
};
