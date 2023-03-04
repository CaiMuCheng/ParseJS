import * as Ast from "../ast/ast.js";

const types = new Proxy({}, {
    get(obj, prop) {
        var handleProp = prop[0].toUpperCase() + prop.substring(1, prop.length);
        if (!Ast[handleProp]) {
            return;
        }
        
        return function(...args) {
            return new Ast[handleProp](undefined, undefined, ...args);
        }
    }
});

export default types;