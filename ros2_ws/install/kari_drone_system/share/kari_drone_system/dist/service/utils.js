"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
const wait = async (miliseconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, miliseconds);
    });
};
exports.wait = wait;
//# sourceMappingURL=utils.js.map