import * as Ast from "../ast/index.js";

const types = {
    program(body, sourceType) {
        return new Ast.Program(undefined, undefined, body, sourceType);
    },
    variableDeclaration(declarations, kind) {
        return new Ast.VariableDeclaration(undefined, undefined, declarations, kind);
    },
    variableDeclarator(id, init) {
        return new Ast.VariableDeclarator(undefined, undefined, id, init);
    },
    identifier(name) {
        return new Ast.Identifier(undefined, undefined, name);
    },
    literal(value, raw) {
        return new Ast.Literal(undefined, undefined, value, raw);
    },
    binaryExpression(left, operator, right) {
        return new Ast.BinaryExpression(undefined, undefined, left, operator, right);
    },
    updateExpression(operator, prefix, argument) {
        return new Ast.UpdateExpression(undefined, undefined, operator, prefix, argument);
    },
    assignmentExpression(operator, left, right) {
        return new Ast.AssignmentExpression(undefined, undefined, operator, left, right);
    },
    unaryExpression(operator, prefix, argument) {
        return new Ast.UnaryExpression(undefined, undefined, operator, prefix, argument);
    },
    conditionalExpression(test, consequent, alternate) {
        return new Ast.ConditionalExpression(undefined, undefined, test, consequent, alternate);
    },
    arrayExpression(elements) {
        return new Ast.ArrayExpression(undefined, undefined, elements);
    },
    sequenceExpression(expressions) {
        return new Ast.SequenceExpression(undefined, undefined, expressions);
    },
    objectExpression(properties) {
        return new Ast.ObjectExpression(undefined, undefined, properties);
    },
    property(method, shorthand, computed, key, value, kind) {
        return new Ast.Property(undefined, undefined, method, shorthand, computed, key, value, kind);
    },
    functionExpression(id, expression, generator, _async, params, body) {
        return new Ast.FunctionExpression(undefined, undefined, id, expression, generator, _async, params, body);
    },
    callExpression(callee, _arguments, optional) {
        return new Ast.CallExpression(undefined, undefined, callee, _arguments, optional);
    },
    memberExpression(_object, property, computed, optional) {
        return new Ast.MemberExpression(undefined, undefined, _object, property, computed, optional);
    },
    newExpression(callee, _arguments) {
        return new Ast.NewExpression(undefined, undefined, callee, _arguments);
    },
    thisExpression() {
        return new Ast.ThisExpression(undefined, undefined);
    },
    expressionStatement(expression) {
        return new Ast.ExpressionStatement(undefined, undefined, expression);
    },
    emptyStatement() {
        return new Ast.EmptyStatement(undefined, undefined);
    },
    blockStatement(body) {
        return new Ast.BlockStatement(undefined, undefined, body);
    },
    ifStatement(test, consequent, alternate) {
        return new Ast.IfStatement(undefined, undefined, test, consequent, alternate);
    },
    whileStatement(test, body) {
        return new Ast.WhileStatement(undefined, undefined, test, body);
    },
    forStatement(init, test, update, body) {
        return new Ast.ForStatement(undefined, undefined, init, test, update, body);
    },
    doWhileStatement(body, test) {
        return new Ast.DoWhileStatement(undefined, undefined, body, test);
    },
    breakStatement(label) {
        return new Ast.BreakStatement(undefined, undefined, label);
    },
    continueStatement(label) {
        return new Ast.ContinueStatement(undefined, undefined, label);
    },
    functionDeclaration(id, expression, generator, _async, params, body) {
        return new Ast.FunctionDeclaration(undefined, undefined, id, expression, generator, _async, params, body);
    },
    returnStatement(argument) {
        return new Ast.ReturnStatement(undefined, undefined, argument);
    },
    tryStatement(block, handler, finalizer) {
        return new Ast.TryStatement(undefined, undefined, block, handler, finalizer)
    },
    catchClause(param, body) {
        return new Ast.CatchClause(undefined, undefined, param, body);
    },
    labeledStatement(body, label) {
        return new Ast.LabeledStatement(undefined, undefined, body, label);
    },
    debuggerStatement() {
        return new Ast.DebuggerStatement(undefined, undefined);
    },
    switchStatement(discriminant, cases) {
        return new Ast.SwitchStatement(undefined, undefined, discriminant, cases);
    },
    switchCase(consequent, test) {
        return new Ast.SwitchCase(undefined, undefined, consequent, test);
    },
    withStatement(object, body) {
        return new Ast.WithStatement(undefined, undefined, object, body);
    },
    throwStatement(argument) {
        return new Ast.ThrowStatement(undefined, undefined, argument);
    },
    forInStatement(left, right, body) {
        return new Ast.ForInStatement(undefined, undefined, left, right, body);
    },
    sourceCode(source) {
        return new Ast.SourceCode(undefined, undefined, source);
    }
};

export default types;