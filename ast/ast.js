class AstNode {
    type = "AstNode"
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

class Program extends AstNode {
    type = "Program"
    constructor(start, end, body, sourceType) {
        super(start, end);
        this.body = body;
        this.sourceType = sourceType;
    }
}

class VariableDeclaration extends AstNode {
    type = "VariableDeclaration"
    constructor(start, end, declarations, kind) {
        super(start, end);
        this.declarations = declarations;
        this.kind = kind;
    }
}

class VariableDeclarator extends AstNode {
    type = "VariableDeclarator"
    constructor(start, end, id, init) {
        super(start, end);
        this.id = id;
        this.init = init;
    }
}

class Identifier extends AstNode {
    type = "Identifier"
    constructor(start, end, name) {
        super(start, end);
        this.name = name;
    }
}

class Literal extends AstNode {
    type = "Literal"
    constructor(start, end, value, raw) {
        super(start, end);
        this.value = value;
        this.raw = raw;
    }
}

class BinaryExpression extends AstNode {
    type = "BinaryExpression"
    constructor(start, end, left, operator, right) {
        super(start, end);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class UpdateExpression extends AstNode {
    type = "UpdateExpression"
    constructor(start, end, operator, prefix, argument) {
        super(start, end);
        this.operator = operator;
        this.prefix = prefix;
        this.argument = argument;
    }
}

class AssignmentExpression extends AstNode {
    type = "AssignmentExpression"
    constructor(start, end, operator, left, right) {
        super(start, end);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class UnaryExpression extends AstNode {
    type = "UnaryExpression"
    constructor(start, end, operator, prefix, argument) {
        super(start, end);
        this.operator = operator;
        this.prefix = prefix;
        this.argument = argument;
    }
}

class ConditionalExpression extends AstNode {
    type = "ConditionalExpression"
    constructor(start, end, test, consequent, alternate) {
        super(start, end);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class ArrayExpression extends AstNode {
    type = "ArrayExpression"
    constructor(start, end, elements) {
        super(start, end);
        this.elements = elements;
    }
}

class SequenceExpression extends AstNode {
    type = "SequenceExpression"
    constructor(start, end, expressions) {
        super(start, end);
        this.expressions = expressions;
    }
}

class ObjectExpression extends AstNode {
    type = "ObjectExpression"
    constructor(start, end, properties) {
        super(start, end);
        this.properties = properties;
    }
}

class Property extends AstNode {
    type = "Property"
    constructor(start, end, method, shorthand, computed, key, value, kind) {
        super(start, end);
        this.method = method;
        this.shorthand = shorthand;
        this.computed = computed;
        this.key = key;
        this.value = value;
        this.kind = kind;
    }
}

class FunctionExpression extends AstNode {
    type = "FunctionExpression"
    constructor(start, end, id, expression, generator, _async, params, body) {
        super(start, end);
        this.start = start;
        this.end = end;
        this.id = id;
        this.expression = expression;
        this.generator = generator;
        this["async"] = _async;
        this.params = params;
        this.body = body;
    }
}

class CallExpression extends AstNode {
    type = "CallExpression"
    constructor(start, end, callee, _arguments, optional) {
        super(start, end);
        this.start = start;
        this.end = end;
        this.callee = callee;
        this["arguments"] = _arguments;
        this.optional = optional;
    }
}

class MemberExpression extends AstNode {
    type = "MemberExpression"
    constructor(start, end, _object, property, computed, optional) {
        super(start, end);
        this.start = start;
        this.end = end;
        this["object"] = _object;
        this.property = property;
        this.computed = computed;
        this.optional = optional;
    }
}

class NewExpression extends AstNode {
    type = "NewExpression"
    constructor(start, end, callee, _arguments) {
        super(start, end);
        this.callee = callee;
        this["arguments"] = _arguments;
    }
}

class ThisExpression extends AstNode {
    type = "ThisExpression"
    constructor(start, end) {
        super(start, end);
    }
}

class ExpressionStatement extends AstNode {
    type = "ExpressionStatement"
    constructor(start, end, expression) {
        super(start, end);
        this.expression = expression;
    }
}

class EmptyStatement extends AstNode {
    type = "EmptyStatement"
    constructor(start, end) {
        super(start, end);
    }
}

class BlockStatement extends AstNode {
    type = "BlockStatement"
    constructor(start, end, body) {
        super(start, end);
        this.body = body;
    }
}

class IfStatement extends AstNode {
    type = "IfStatement"
    constructor(start, end, test, consequent, alternate) {
        super(start, end);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class WhileStatement extends AstNode {
    type = "WhileStatement"
    constructor(start, end, test, body) {
        super(start, end);
        this.test = test;
        this.body = body;
    }
}

class ForStatement extends AstNode {
    type = "ForStatement"
    constructor(start, end, init, test, update, body) {
        super(start, end);
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
}

class DoWhileStatement extends AstNode {
    type = "DoWhileStatement"
    constructor(start, end, body, test) {
        super(start, end);
        this.body = body;
        this.test = test;
    }
}

class BreakStatement extends AstNode {
    type = "BreakStatement"
    constructor(start, end, label) {
        super(start, end);
        this.label = label;
    }
}

class ContinueStatement extends AstNode {
    type = "ContinueStatement"
    constructor(start, end, label) {
        super(start, end);
        this.label = label;
    }
}

class FunctionDeclaration extends AstNode {
    type = "FunctionDeclaration"
    constructor(start, end, id, expression, generator, _async, params, body) {
        super(start, end);
        this.id = id;
        this.expression = expression;
        this.generator = generator;
        this["async"] = _async;
        this.params = params;
        this.body = body;
    }
}

class ReturnStatement extends AstNode {
    type = "ReturnStatement"
    constructor(start, end, argument) {
        super(start, end);
        this.argument = argument;
    }
}

class TryStatement extends AstNode {
    type = "TryStatement"
    constructor(start, end, block, handler, finalizer) {
        super(start, end);
        this.block = block;
        this.handler = handler;
        this.finalizer = finalizer;
    }
}

class CatchClause extends AstNode {
    type = "CatchClause"
    constructor(start, end, param, body) {
        super(start, end);
        this.param = param;
        this.body = body;
    }
}

class LabeledStatement extends AstNode {
    type = "LabeledStatement"
    constructor(start, end, body, label) {
        super(start, end);
        this.body = body;
        this.label = label;
    }
}

class DebuggerStatement extends AstNode {
    type = "DebuggerStatement"
    constructor(start, end) {
        super(start, end);
    }
}

class SwitchStatement extends AstNode {
    type = "SwitchStatement"
    constructor(start, end, discriminant, cases) {
        super(start, end);
        this.discriminant = discriminant;
        this.cases = cases;
    }
}

class SwitchCase extends AstNode {
    type = "SwitchCase"
    constructor(start, end, consequent, test) {
        super(start, end);
        this.consequent = consequent;
        this.test = test;
    }
}

class WithStatement extends AstNode {
    type = "WithStatement"
    constructor(start, end, object, body) {
        super(start, end);
        this.object = object;
        this.body = body;
    }
}

class ThrowStatement extends AstNode {
    type = "ThrowStatement"
    constructor(start, end, argument) {
        super(start, end);
        this.argument = argument;
    }
}

class ForInStatement extends AstNode {
    type = "ForInStatement"
    constructor(start, end, left, right, body) {
        super(start, end);
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

class SourceCode extends AstNode {
    type = "SourceCode"
    constructor(start, end, source) {
        super(start, end);
        this.source = source;
    }
}

const visitorKeys = {
    Identifier: ["name"],
    Literal: ["value", "raw"],
    Program: ["body", "sourceType"],
    ExpressionStatement: ["expression"],
    BlockStatement: ["body"],
    IfStatement: ["test", "consequen", "alternate"],
    WhileStatement: ["body"],
    ForStatement: ["init", "test", "update", "body"],
    DoWhileStatement: ["body", "test"],
    BreakStatement: ["label"],
    ContinueStatement: ["label"],
    TryStatement: ["block", "handler", "finalizer"],
    CatchClause: ["param", "body"],
    ReturnStatement: ["argument"],
    VariableDeclaration: ["declarations"],
    VariableDeclarator: ["id", "init"],
    BinaryExpression: ["left", "right"],
    UnaryExpression: ["argument"],
    UpdateExpression: ["argument"],
    AssignmentExpression: ["left", "right"],
    ConditionalExpression: ["test", "consequent", "alternate"],
    ArrayExpression: ["elements"],
    SequenceExpression: ["expressions"],
    ObjectExpression: ["properties"],
    Property: ["key", "value"],
    LabeledStatement: ["label", "body"],
    SwitchStatement: ["discriminant", "cases"],
    SwitchCase: ["test", "consequent"],
    WithStatement: ["object", "body"],
    ThrowStatement: ["argument"],
    ForInStatement: ["left", "right", "body"],
    FunctionExpression: ["params", "body"],
    FunctionDeclaration: ["params", "body"],
    CallExpression: ["callee", "arguments"],
    MemberExpression: ["object", "property"],
    NewExpression: ["callee", "arguments"],
    SourceCode: ["source"]
};

export {
    Program,
    VariableDeclaration,
    VariableDeclarator,
    Identifier,
    Literal,
    BinaryExpression,
    UpdateExpression,
    AssignmentExpression,
    UnaryExpression,
    ConditionalExpression,
    ArrayExpression,
    SequenceExpression,
    ObjectExpression,
    Property,
    FunctionExpression,
    CallExpression,
    MemberExpression,
    NewExpression,
    ThisExpression,
    ExpressionStatement,
    EmptyStatement,
    BlockStatement,
    IfStatement,
    WhileStatement,
    ForStatement,
    DoWhileStatement,
    BreakStatement,
    ContinueStatement,
    FunctionDeclaration,
    ReturnStatement,
    TryStatement,
    CatchClause,
    LabeledStatement,
    DebuggerStatement,
    SwitchStatement,
    SwitchCase,
    WithStatement,
    ThrowStatement,
    ForInStatement,
    SourceCode,
    visitorKeys
}