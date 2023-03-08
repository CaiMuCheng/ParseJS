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
                const { node } = path;
                const { type } = node;
                if (type == "Program") {
                    this.scopeUUID = 0;
                    this.scope = this.createScope()
                    this.scope.toString = () => { return "TopLevelScope"; }
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
                const { node } = path;
                const { type } = node;
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
        scope.toString = () => { return "BlockScope"; }
        scope.declarations.undefined = true
        scope.declarations.NaN = true
        scope.map.undefined = undefined;
        scope.map.NaN = NaN;
        return scope;
    }

    interprete() {
        this.createScopes();

        traverse(this.ast, {
            enter: (path) => {
                const { node } = path;
                const { type } = node;
                if (type == "VariableDeclarator") {
                    this.set(node.id.name, this.require(node.init));
                    path.skip();
                    return;
                }
                if (type == "Identifier") {
                    if (path.parent.type != "MemberExpression") {
                        if (!this.isDeclaration(node.name)) {
                            throw new ReferenceError(node.name + " is not defined");
                        }
                        this.result = this.value(node.name);
                    }
                }
                if (type == "FunctionExpression" || type == "FunctionDeclaration") {
                    if (this.scopeIndex === undefined) {
                        this.scopeIndex = 0;
                    }
                    this.scope = this.scope.children[this.scopeIndex];
                    ++this.scopeIndex;
                }
            },
            exit: (path) => {
                const { node } = path;
                const { type } = node;
                if (type == "FunctionExpression" || type == "FunctionDeclaration") {
                    this.scope = this.scope.parent;
                }
            }
        });
        return this.result;
    }

    require(node) {
        if (node == null) {
            return;
        } else {
            return this.exec(node);
        }
    }

    exec(node) {
        const { type } = node;
        switch (type) {
            case "Literal":
                if (node.isRegex) {
                    return RegExp(node.value);
                }
                return node.value;
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

    value(key) {
        return this.scope.map[key];
    }

    isDeclaration(key) {
        return !!this.scope.declarations[key];
    }
}

export {
    Interpreter
};