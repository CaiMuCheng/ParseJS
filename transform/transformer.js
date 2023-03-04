import * as Ast from "../ast/ast.js";

class Transformer {
    constructor(visitorRoot) {
        this.visitorRoot = visitorRoot;
        visitorRoot.enter = visitorRoot.enter ? visitorRoot.enter : function() {};
        visitorRoot.exit = visitorRoot.exit ? visitorRoot.exit : function() {};
    }
    transform(
    defaultNode,
    parent = null,
    key = null,
    array = null) {
        if (Array.isArray(defaultNode)) {
            defaultNode.forEach((value, index) => {
                this.transform(value, parent, index, defaultNode);
            });
        } else {
            if (defaultNode == null) {
                return;
            }
            if (defaultNode.type == "Program") {
                throw Error("Cannot transform Program node.");
            }
            if (defaultNode.isAstNode()) {
                let skip = false;
                let removed = false;
                let replaced = false;
                let node = defaultNode;
                let path = {};
                path.node = node;
                path.parent = parent;

                path.skip = () => skip = true;
                path.exec = (node) => this.transform(node);
                path.remove = () => removed = true;
                path.replaceWith = (targetNode) => {
                    node = targetNode;
                    replaced = true;
                }
                path.replaceWithSource = (source) => path.replaceWith(
                new Ast.SourceCode(
                undefined, undefined, source));

                this.visitorRoot.enter(path);
                let type = skip || removed ? "" : node.type;
                switch (type) {
                    case "ExpressionStatement":
                        this.transform(node.expression, node, "expression");
                        break;

                    case "BlockStatement":
                        this.transform(node.body, node, "body");
                        break;

                    case "IfStatement":
                        this.transform(node.test, node, "test");
                        this.transform(node.consequen, node, "consequen");
                        this.transform(node.alternate, node, "alternate");
                        break;

                    case "WhileStatement":
                        this.transform(node.body, node, "body");
                        break;

                    case "ForStatement":
                        this.transform(node.init, node, "init");
                        this.transform(node.test, node, "test");
                        this.transform(node.update, node, "update");
                        this.transform(node.body, node, "body");
                        break;

                    case "DoWhileStatement":
                        this.transform(node.body, node, "body");
                        this.transform(node.test, node, "test");
                        break;

                    case "BreakStatement":
                    case "ContinueStatement":
                        this.transform(node.label, node, "label");
                        break;

                    case "TryStatement":
                        this.transform(node.block, node, "block");
                        this.transform(node.handler, node, "handler");
                        this.transform(node.finalizer, node, "finalizer");
                        break;

                    case "CatchClause":
                        this.transform(node.param, node, "param");
                        this.transform(node.body, node, "body");
                        break;

                    case "ReturnStatement":
                        this.transform(node.argument, node, "argument");
                        break;

                    case "VariableDeclaration":
                        this.transform(node.declarations, node, "declarations");
                        break;

                    case "VariableDeclarator":
                        this.transform(node.id, node, "id");
                        this.transform(node.init, node, "init");
                        break;

                    case "BinaryExpression":
                        this.transform(node.left, node, "left");
                        this.transform(node.right, node, "right");
                        break;

                    case "UnaryExpression":
                        this.transform(node.argument, node, "argument");
                        break;

                    case "UpdateExpression":
                        this.transform(node.argument, node, "argument");
                        break;

                    case "AssignmentExpression":
                        this.transform(node.left, node, "left");
                        this.transform(node.right, node, "right");
                        break;

                    case "ConditionalExpression":
                        this.transform(node.test, node, "test");
                        this.transform(node.consequent, node, "consequent");
                        this.transform(node.alternate, node, "alternate");
                        break;

                    case "ArrayExpression":
                        this.transform(node.elements, node, "elements");
                        break;

                    case "SequenceExpression":
                        this.transform(node.expressions, node, "expressions");
                        break;

                    case "ObjectExpression":
                        this.transform(node.properties, node, "properties");
                        break;

                    case "Property":
                        this.transform(node.key, node, "key");
                        this.transform(node.value, node, "value");
                        break;

                    case "LabeledStatement":
                        this.transform(node.label, node, "label");
                        this.transform(node.body, node, "body");
                        break;

                    case "SwitchStatement":
                        this.transform(node.discriminant, node, "discriminant");
                        this.transform(node.cases, node, "cases");
                        break;

                    case "SwitchCase":
                        this.transform(node.test, node, "test");
                        this.transform(node.consequent, node, "consequent");
                        break;

                    case "WithStatement":
                        this.transform(node.object, node, "object");
                        this.transform(node.body, node, "body");
                        break;

                    case "ThrowStatement":
                        this.transform(node.argument, node, "argument");
                        break

                    case "ForInStatement":
                        this.transform(node.left, node, "left");
                        this.transform(node.right, node, "right");
                        this.transform(node.body, node, "body");
                        break;

                    case "FunctionExpression":
                    case "FunctionDeclaration":
                        this.transform(node.params, node, "params");
                        this.transform(node.body, node, "body");
                        break;

                    case "CallExpression":
                        this.transform(node.callee, node, "callee");
                        this.transform(node["arguments"], node, "arguments");
                        break;

                    case "MemberExpression":
                        this.transform(node.object, node, "object");
                        this.transform(node.property, node, "property");
                        break;

                    case "NewExpression":
                        this.transform(node.callee, node, "callee");
                        this.transform(node["arguments"], node, "arguments");
                        break;
                }
                this.visitorRoot.exit(path);
                if (removed && replaced) {
                    throw Error("It is not allowed to replace and remove the node at the same time.");
                }
                if (removed) {
                    if (array != null) {
                        delete array[key];
                    } else if (parent != null) {
                        delete parent[key];
                    }
                    return;
                }
                if (array != null) {
                    array[key] = node;
                } else if (parent != null) {
                    parent[key] = node;
                }
            }
        }
    }
}

export {
    Transformer
}