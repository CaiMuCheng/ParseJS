import types from "../types/index.js";
import traverse from "../traverse/index.js";

class Interpreter {
    constructor(ast) {
        this.ast = ast;
        this.topLevelScope = {
            toString() {
                return "[object InternalScope]";
            }
        };
    }

    createScopes() {
        traverse(this.ast, {
            enter: (path) => {
                const {
                    node
                } = path;
                const {
                    type
                } = node;
                if (type == "Program") {
                    this.scopeUUID = 0;
                    this.scope = this.createScope()
                    this.scope.toString = () => {
                        return "TopLevelScope";
                    }
                }
                if (type == "FunctionExpression" || type == "FunctionDeclaration") {
                    ++this.scopeUUID;
                    const scope = this.createScope();
                    this.scope.children.push(scope);
                    this.scope = scope;
                }
                if (type == "VariableDeclarator") {
                    this.variables(node);
                }
                if (type == "FunctionDeclaration") {
                    this.functions(node);
                }
            },
            exit: (path) => {
                const {
                    node
                } = path;
                const {
                    type
                } = node;
                if (type == "FunctionExpression" || type == "FunctionDeclaration") {
                    this.scope = this.scope.parent;
                }
            }
        });
    }

    createScope() {
        const scope = Object.create(null);
        scope.map = Object.create(null);
        scope.declarations = Object.create(null);
        scope.uuid = this.scopeUUID;
        scope.children = [];
        scope.parent = this.scope;
        scope.toString = () => {
            return "BlockScope";
        }
        scope.declarations.undefined = true
        scope.declarations.NaN = true
        scope.map.undefined = undefined;
        scope.map.NaN = NaN;
        scope.value = function(key) {
            if (this.declarations[key]) {
                return this.map[key];
            }
            if (this.parent != null) {
                return this.parent.value(key);
            }
            throw new ReferenceError(key + " is not defined");
        }
        scope.hasDeclaration = function(key) {
            if (this.declarations[key]) {
                return true;
            }
            if (this.parent != null) {
                return this.parent.hasDeclaration(key);
            }
            return false;
        }
        return scope;
    }

    interprete() {
        this.createScopes();

        traverse(this.ast, {
            enter: (path) => {
                const {
                    node
                } = path;
                const {
                    type
                } = node;
                if (type == "VariableDeclarator") {
                    path.skip();
                    this.result = undefined;
                    path.traverse("init");
                    this.set(node.id.name, this.result);
                    return;
                }
                if (type == "FunctionExpression" || type == "FunctionDeclaration") {
                    if (this.scopeIndex === undefined) {
                        this.scopeIndex = 0;
                    }
                    this.scope = this.scope.children[this.scopeIndex];
                    ++this.scopeIndex;
                }

                switch (type) {
                    case "Identifier":
                        this.result = this.scope.value(node.name);
                        break;
                    case "Literal":
                        if (node.isRegex) {
                            return RegExp(node.value);
                        }
                        this.result = node.value;
                        break;
                    case "ObjectExpression":
                        path.skip();
                        this.result = {};
                        path.traverse("properties");
                        break;
                    case "Property":
                        path.skip();
                        const attach = this.result;
                        path.traverse("value");
                        attach[node.key.name] = this.result;
                        this.result = attach;
                        break;
                    case "BinaryExpression":
                        path.skip();
                        this.calculateBinaryExpression(path);
                        break;
                    case "UpdateExpression":
                        path.skip();
                        const operator = node.operator;
                        const id = node.argument;
                        path.traverse("argument");
                        if (node.prefix) {
                            this.scope.map[id.name] = ++this.result;
                        } else {
                            this.scope.map[id.name] = this.result + 1;
                        }
                        break;
                }
            },
            exit: (path) => {
                const {
                    node
                } = path;
                const {
                    type
                } = node;
                if (type == "FunctionExpression" || type == "FunctionDeclaration") {
                    this.scope = this.scope.parent;
                }
            }
        });
        return this.result;
    }

    calculateBinaryExpression(path) {
        const node = path.node;
        let left = null;
        let op = null;
        let right = null;
        if (node.left.type != "Literal") {
            path.traverse("left");
            left = this.result;
        } else {
            left = node.left.value;
        }
        op = node.operator;
        if (node.right.type != "Literal") {
            path.traverse("right");
            right = this.result;
        } else {
            right = node.right.value;
        }
        switch (op) {
            case "+":
                this.result = left + right;
                break;
            case "-":
                this.result = left - right;
                break;
            case "*":
                this.result = left * right;
                break;
            case "/":
                this.result = left / right;
                break;
            case "%":
                this.result = left % right;
                break;
            case "<<":
                this.result = left << right;
                break;
            case ">>":
                this.result = left >> right;
                break;
            case ">>>":
                this.result = left >>> right;
                break;
            case "<":
                this.result = left < right;
                break;
            case ">":
                this.result = left > right;
                break;
            case "<=":
                this.result = left <= right;
                break;
            case ">=":
                this.result = left >= right;
                break;
            case "instanceof":
                this.result = left instanceof right;
                break;
            case "in":
                this.result = left in right;
                break;
            case "==":
                this.result = left == right;
                break;
            case "!=":
                this.result = left != right;
                break;
            case "===":
                this.result = left === right;
                break;
            case "!==":
                this.result = left !== right;
                break;
            case "&":
                this.result = left & right;
                break;
            case "^":
                this.result = left ^ right;
                break;
            case "|":
                this.result = left | right;
                break;
            case "&&":
                this.result = left && right;
                break;
            case "||":
                this.result = left || right;
                break;
        }
    }

    variables(node) {
        this.scope.declarations[node.id.name] = true;
    }

    functions(node) {
        this.scope.declarations[node.id.name] = true;
    }

    set(key, value) {
        this.scope.map[key] = value;
    }

}

export {
    Interpreter
};