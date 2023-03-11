import traverse from "../traverse/index.js";

class Interpreter {

    constructor(ast, topLevelScope) {
        this.ast = ast;
        this.scope = null;

        this.topLevelScope(topLevelScope ? topLevelScope : {
            toString() { return "T" }
        });
    }

    run() {
        // Pre-tnterprete for recording variables and functions
        traverse(this.ast, {
            enter: (path) => {
                const node = path.node;
                const type = node.type;

                switch (type) {
                    case "BlockStatement":
                        if (path.parent.type == "FunctionDeclaration" ||
                            path.parent.type == "FunctionExpression") {
                            this.functionScope();
                        } else {
                            this.blockScope();
                        }
                        break;
                    case "VariableDeclarator":
                        let kind = path.parent.kind;
                        let variableName = node.id.name;
                        this.scope.define(variableName, {
                            type: "variable",
                            kind: kind
                        });
                        break;
                    case "FunctionDeclaration":
                        let functionName = node.id.name;
                        this.scope.define(functionName, {
                            type: "function"
                        });
                        break;
                }
            },
            exit: (path) => {
                const node = path.node;
                const type = node.type;

                switch (type) {
                    case "BlockStatement":
                        this.scope = this.scope.parent;
                        break;
                }
            }
        });

        traverse(this.ast, {
            enter: (path) => {
                const node = path.node;
                const type = node.type;

                if (type == "BlockStatement") {
                    if (this.scope.childIndex === undefined) {
                        this.scope.childIndex = 0
                    } else {
                        ++this.scope.childIndex;
                    }
                    this.scope = this.scope.children[this.scope.childIndex];
                    if (this.scope.childIndex == this.scope.children.length - 1) {
                        delete this.scope.childIndex;
                    }
                }

                switch (type) {
                    case "Identifier":
                        this.res = this.identifier(node.name);
                        break;
                    case "Literal":
                        this.res = this.literal(node);
                        break;
                    case "VariableDeclarator":
                        this.res = this.variableDeclarator(path, node);
                        break;
                    case "AssignmentExpression":
                        this.res = this.assignmentExpression(path, node);
                        break;
                    case "BinaryExpression":
                        this.res = this.binaryExpression(path, node);
                        break;
                }
            },
            exit: (path) => {
                const node = path.node;
                const type = node.type;

                switch (type) {
                    case "BlockStatement":
                        this.scope = this.scope.parent;
                        break;
                }
            }
        });
        return this.res;
    }

    identifier(key) {
        return this.scope.getDeclaration(key);
    }

    literal(node) {
        return node.isRegex ? new RegExp(node.value) : node.value;
    }

    variableDeclarator(path, node) {
        path.skip();

        const key = node.id.name;
        let res = undefined;
        if (node.init) {
            res = this.traverseEx(path, "init");
        }

        this.scope.set(key, res);
    }

    assignmentExpression(path, node) {
        path.skip();

        const operator = node.operator;
        const key = node.left.name;
        const topLevelScope = this.scope.getTopLevel();
        const declarationObj = topLevelScope.obj;
        const right = this.traverseEx(path, "right");

        switch (operator) {
            case "=":
                return declarationObj[key] = right;
            case "+=":
                return declarationObj[key] += right;
            case "-=":
                return declarationObj[key] -= right;
            case "*=":
                return declarationObj[key] *= right;
            case "/=":
                return declarationObj[key] /= right;
            case "%=":
                return declarationObj[key] %= right;
            case "^=":
                return declarationObj[key] ^= right;
            case "|=":
                return declarationObj[key] |= right;
            case "||=":
                return declarationObj[key] ||= right;
            case "&=":
                return declarationObj[key] &= right;
            case "&&=":
                return declarationObj[key] &&= right;
            case ">>=":
                return declarationObj[key] >>= right;
            case ">>>=":
                return declarationObj[key] >>>= right;
            case "<<=":
                return declarationObj[key] <<= right;
        }
    }

    binaryExpression(path, node) {
        path.skip();
        const left = this.traverseEx(path, "left");
        const operator = node.operator;
        const right = this.traverseEx(path, "right");

        switch (operator) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                return left / right;
            case "%":
                return left % right;
            case "<<":
                return left << right;
            case ">>":
                return left >> right;
            case ">>>":
                return left >>> right;
            case "<":
                return left < right;
            case ">":
                return left > right;
            case "<=":
                return left <= right;
            case ">=":
                return left >= right;
            case "instanceof":
                return left instanceof right;
            case "in":
                return left in right;
            case "==":
                return left == right;
            case "!=":
                return left != right;
            case "===":
                return left === right;
            case "!==":
                return left !== right;
            case "&":
                return left & right;
            case "^":
                return left ^ right;
            case "|":
                return left | right;
            case "&&":
                return left && right;
            case "||":
                return left || right;
        }
    }

    traverseEx(path, key) {
        path.traverse(key);
        return this.res;
    }

    /* Below about scopes */
    topLevelScope(topLevelScope) {
        this.scope = new Scope("TopLevelScope", topLevelScope);
    }

    functionScope() {
        let scope = new Scope("FunctionScope", {}, this.scope);
        this.scope.addScope(scope);
        this.scope = scope;
    }

    blockScope() {
        let scope = new Scope("BlockScope", {}, this.scope);
        this.scope.addScope(scope);
        this.scope = scope;
    }

}

class Scope {
    constructor(type, obj, parent) {
        this.type = type;
        this.vars = Object.create(null);
        this.obj = obj;
        this.children = [];
        this.parent = parent;
    }

    addScope(scope) {
        this.children.push(scope);
    }

    define(key, container) {
        this.vars[key] = container;
    }

    set(key, value) {
        if (this.has(key)) {
            this.obj[key] = value;
        } else if (this.parent != null) {
            this.parent.set(key, value);
        }
    }

    getDeclaration(key) {
        if (this.has(key)) {
            return this.obj[key];
        }

        if (this.parent != null) {
            return this.parent.getDeclaration(key);
        }

        throw new ReferenceError(key + " is not defined");
    }

    getDeclarationObj() {
        if (this.has(key)) {
            return this.obj;
        }

        if (this.parent != null) {
            return this.parent.getDeclarationObj(key);
        }

        throw new ReferenceError(key + " is not defined");
    }

    has(key) {
        if (this.vars[key]) {
            return true;
        }

        return this.obj[key] !== undefined;
    }

    hasDeclaration(key) {
        if (this.has(key)) {
            return true;
        }

        if (this.parent != null) {
            return this.parent.hasDeclaration(key);
        }

        return false;
    }

    getTopLevel() {
        return this.parent ? this.parent.getTopLevel() : this;
    }

    toString() {
        return "[object " + this.type + "]";
    }
}

export {
    Interpreter
};