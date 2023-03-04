import { Transformer } from "../transform/transformer.js";

class CodeGenerator {
    constructor(ast) {
        this.ast = ast;
        this.data = [];
        this.transformer = new Transformer(
            this.visitorRoot()
        );
        this.format = false;
        this.computedMode = "default";
        this.bracketForExpressionStatement = false;
    }
    setFormat(format) {
        this.format = format;
    }
    isFormat() {
        return this.format;
    }
    setComputedMode(computedMode) {
        this.computedMode = computedMode;
    }
    getComputedMode() {
        return this.computedMode;
    }
    setBracketForExpressionStatement(bracketForExpressionStatement) {
        this.bracketForExpressionStatement = bracketForExpressionStatement;
    }
    isBracketForExpressionStatement() {
        return this.bracketForExpressionStatement;
    }
    visitorRoot() {
        let obj = {};
        obj.enter = (path) => {
            let node = path.node;
            let type = node.type;
            switch (type) {
                case "SourceCode":
                    this.emit(node.source);
                    break;
                case "ExpressionStatement":
                    if (this.bracketForExpressionStatement) {
                        this.emit("(");
                    }
                    break;
                case "Identifier":
                    this.emit(node.name);
                    break;
                case "Literal":
                    this.emit(node.value);
                    break;
                case "VariableDeclaration":
                    this.emit(node.kind);
                    this.space();
                    break;
                case "VariableDeclarator":
                    path.skip();
                    path.exec(node.id);
                    if (node.init != null) {
                        this.spaceFormat();
                        this.emit("=");
                        this.spaceFormat();
                        path.exec(node.init);
                    }
                    break;
                case "FunctionDeclaration":
                case "FunctionExpression":
                    path.skip();
                    if (node.type == "FunctionExpression") {
                        this.emit("(");
                    }
                    if (node["async"]) {
                        this.emit("async");
                        this.space();
                    }
                    this.emit("function");
                    if (node.generator) {
                        this.emit("*");
                        this.spaceFormat();
                    }
                    if (node.id != null) {
                        this.space();
                        this.emit(node.id.name);
                    }
                    this.emit("(");
                    for (let index = 0;index < node.params.length;index++) {
                        let value = node.params[index];
                        path.exec(value);
                        if (index < node.params.length - 1) {
                            this.emit(",");
                            this.spaceFormat();
                        }
                    }
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.body);
                    if (node.type == "FunctionExpression") {
                        this.emit(")");
                    }
                    break;
                case "ReturnStatement":
                    path.skip();
                    this.emit("return");
                    this.space();
                    path.exec(node.argument);
                    this.end();
                    break;
                case "IfStatement":
                    path.skip();
                    this.emit("if");
                    this.spaceFormat();
                    this.emit("(");
                    path.exec(node.test);
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.consequent);
                    if (node.alternate != null) {
                        this.spaceFormat();
                        this.emit("else");
                        this.space();
                        path.exec(node.alternate);
                    }
                    this.end();
                    break;
                case "WhileStatement":
                    path.skip();
                    this.emit("while");
                    this.spaceFormat();
                    this.emit("(");
                    path.exec(node.test);
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.body);
                    this.end();
                    break;
                case "DoWhileStatement":
                    path.skip();
                    this.emit("do");
                    this.spaceFormat();
                    path.exec(node.body);
                    this.spaceFormat();
                    this.emit("while");
                    this.emit("(");
                    path.exec(node.test);
                    this.emit(")");
                    this.end();
                    break;
                case "ForStatement":
                    path.skip();
                    this.emit("for");
                    this.spaceFormat();
                    this.emit("(");
                    path.exec(node.init);
                    this.end();
                    path.exec(node.test);
                    this.end();
                    path.exec(node.update);
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.body);
                    this.end();
                    break;
                case "BreakStatement":
                    path.skip();
                    this.emit("break");
                    if (node.label != null) {
                        this.space();
                        path.exec(node.label);
                    }
                    this.end();
                    break;
                case "ContinueStatement":
                    path.skip();
                    this.emit("continue");
                    if (node.label != null) {
                        this.space();
                        path.exec(node.label);
                    }
                    this.end();
                    break;
                case "TryStatement":
                    path.skip();
                    this.emit("try");
                    this.spaceFormat();
                    path.exec(node.block);
                    this.spaceFormat();
                    path.exec(node.handler);
                    if (node.finalizer != null) {
                        this.spaceFormat();
                        this.emit("finally");
                        this.spaceFormat();
                        path.exec(node.finalizer);
                    }
                    break;
                case "CatchClause":
                    path.skip();
                    this.emit("catch");
                    this.emit("(");
                    path.exec(node.param);
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.body);
                    break;
                case "NewExpression":
                    path.skip();
                    this.emit("new");
                    this.space();
                    path.exec(node.callee);
                    this.emit("(");
                    for (let index = 0;index < node["arguments"].length;index++) {
                        let value = node["arguments"][index];
                        path.exec(value);
                        if (index < node["arguments"].length - 1) {
                            this.emit(",");
                            this.spaceFormat();
                        }
                    }
                    this.emit(")");
                    break;
                case "BlockStatement":
                    this.emit("{");
                    break;
                case "LabeledStatement":
                    path.skip();
                    path.exec(node.label);
                    this.spaceFormat();
                    this.emit(":");
                    this.spaceFormat();
                    path.exec(node.body);
                    this.end();
                    break;
                case "DebuggerStatement":
                    this.emit("debugger");
                    this.end();
                    break;
                case "SwitchStatement":
                    path.skip();
                    this.emit("switch");
                    this.spaceFormat();
                    this.emit("(");
                    path.exec(node.discriminant);
                    this.emit(")");
                    this.spaceFormat();
                    this.emit("{");
                    path.exec(node.cases);
                    this.emit("}");
                    break;
                case "SwitchCase":
                    path.skip();
                    if (node.test != null) {
                        this.emit("case");
                        this.space();
                        path.exec(node.test);
                    } else {
                        this.emit("default");
                    }
                    this.emit(":");
                    this.spaceFormat();
                    path.exec(node.consequent);
                    break;
                case "WithStatement":
                    path.skip();
                    this.emit("with");
                    this.spaceFormat();
                    this.emit("(");
                    path.exec(node.object);
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.body);
                    break;
                case "ThrowStatement":
                    path.skip();
                    this.emit("throw");
                    this.space();
                    path.exec(node.argument);
                    this.end();
                    break;
                    
                case "ForInStatement":
                    path.skip();
                    this.emit("for");
                    this.spaceFormat();
                    this.emit("(");
                    path.exec(node.left);
                    this.space();
                    this.emit("in");
                    this.space();
                    path.exec(node.right);
                    this.emit(")");
                    this.spaceFormat();
                    path.exec(node.body);
                    this.end();
                    break;
                case "BinaryExpression":
                    path.skip();
                    path.exec(node.left);
                    if (node.operator != "instanceof" && node.operator != "in") {
                        if (node.left.isRegex() && node.operator == "/") {
                            this.space();
                        } else {
                            this.spaceFormat();
                        }
                        this.emit(node.operator);
                        if (node.right.isRegex() && node.operator == "/") {
                            this.space();
                        } else {
                            this.spaceFormat();
                        }
                    } else {
                        this.space();
                        this.emit(node.operator);
                        this.space();
                    }
                    path.exec(node.right);
                    break;
                case "UpdateExpression":
                    path.skip();
                    this.emit("(");
                    if (node.prefix) {
                        this.emit(node.operator);
                        path.exec(node.argument);
                    } else {
                        path.exec(node.argument);
                        this.emit(node.operator);
                    }
                    this.emit(")");
                    break;
                case "AssignmentExpression":
                    path.skip();
                    this.emit("(");
                    path.exec(node.left);
                    this.spaceFormat();
                    this.emit(node.operator);
                    this.spaceFormat();
                    path.exec(node.right);
                    this.emit(")");
                    break;
                case "UnaryExpression":
                    path.skip();
                    if (node.prefix) {
                        this.emit(node.operator);
                        if (
                            node.operator == "void" ||
                            node.operator == "typeof" ||
                            node.operator == "delete"
                        ) {
                            this.space();
                        }
                        path.exec(node.argument);
                    } else {
                        path.exec(node.argument);
                        this.emit(node.operator);
                    }
                    break;
                case "MemberExpression":
                    path.skip();
                    path.exec(node.object);
                    let computedMode = this.computedMode;
                    if (computedMode == "onComputed") {
                        this.emit("[");
                        if (node.property.type == "Identifier" && !node.computed) {
                            this.emit("\"");
                            path.exec(node.property);
                            this.emit("\"");
                        } else {
                            path.exec(node.property);
                        }
                        this.emit("]");
                    } else if (computedMode == "offComputed") {
                        if (node.property.type == "Identifier" && !node.computed) {
                            this.emit(".");
                            path.exec(node.property);
                        } else {
                            this.emit("[");
                            path.exec(node.property);
                            this.emit("]");
                        }
                    } else {
                        if (node.computed) {
                            this.emit("[");
                            path.exec(node.property);
                            this.emit("]");
                        } else {
                            this.emit(".");
                            path.exec(node.property);
                        }
                    }
                    break;
                case "SequenceExpression":
                    path.skip();
                    let exprs = node.expressions;
                    let exprsLen = exprs.length;
                    for (let index = 0;index < exprsLen;index++) {
                        let value = exprs[index];
                        path.exec(value);
                        if (index < exprsLen - 1) {
                            this.emit(",");
                            this.spaceFormat();
                        }
                    }
                    break;
                case "ObjectExpression":
                    path.skip();
                    this.emit("{");
                    for (let index = 0;index < node.properties.length;index++) {
                        let props = node.properties[index];
                        let key = props.key;
                        let value = props.value;
                        path.exec(key);
                        this.spaceFormat();
                        this.emit(":");
                        this.spaceFormat();
                        path.exec(value);
                        if (index < node.properties.length - 1) {
                            this.emit(",");
                        }
                    }
                    this.emit("}");
                    break;
                case "ArrayExpression":
                    path.skip();
                    this.emit("[");
                    for (let index = 0;index < node.elements.length;index++) {
                        let element = node.elements[index];
                        path.exec(element);
                        if (index < node.elements.length - 1) {
                            this.emit(",");
                        }
                    }
                    this.emit("]");
                    break;
                case "ThisExpression":
                    this.emit("this");
                    break;
                case "ConditionalExpression":
                    path.skip();
                    path.exec(node.test);
                    this.spaceFormat();
                    this.emit("?");
                    this.spaceFormat();
                    path.exec(node.consequent);
                    this.spaceFormat();
                    this.emit(":");
                    this.spaceFormat();
                    path.exec(node.alternate);
                    break;
                case "CallExpression":
                    path.skip();
                    path.exec(node.callee);
                    this.emit("(");
                    let args = node["arguments"];
                    let argsLen = args.length;
                    for (let index = 0;index < argsLen;index++) {
                        let value = args[index];
                        path.exec(value);
                        if (index < argsLen - 1) {
                            this.emit(",");
                            this.spaceFormat();
                        }
                    }
                    this.emit(")");
                    break;
            }
        };
        obj.exit = (path) => {
            let node = path.node;
            let type = node.type;
            switch (type) {
                case "ExpressionStatement":
                    if (this.bracketForExpressionStatement) {
                        this.emit(")");
                    }
                    this.end();
                    break;
                case "EmptyStatement":
                    this.end();
                    break;
                case "VariableDeclaration":
                    this.remove();
                    this.end();
                    break;
                case "VariableDeclarator":
                    this.emit(",");
                    break;
                case "BlockStatement":
                    this.emit("}");
                    break;
            }
        };
        return obj;
    }
    emit(str) {
        if (str != null) {
            this.data.push(str);
        }
    }
    end() {
        if (this.current() != ";") {
            this.emit(";");
        }
    }
    remove() {
        return this.data.pop();
    }
    space() {
        this.emit(" ");
    }
    spaceFormat() {
        if (this.isFormat()) {
            this.space();
        }
    }
    current() {
        return this.data[this.data.length - 1];
    }
    generate() {
        this.transformer.transform(this.ast.body);
        if (this.isFormat()) {
            let result = "";
            let index = 0;
            while (index < this.data.length) {
                let sliceCode = this.data[index];
                result += sliceCode;
                if (sliceCode == ";" && index < this.data.length - 1) {
                    result += "\n";
                }
                ++index;
            }
            return result;
        }
        return this.data.join("");
    }
}

export {
    CodeGenerator
}