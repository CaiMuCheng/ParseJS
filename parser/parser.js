import {
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
    ForInStatement
} from "../ast/ast.js";
import {
    keywordMap,
    EOF,
    Token,
    Operator,
    Id,
    Keyword,
    Str,
    Num,
    Special,
    Regex,
    WhiteSpace,
    NewLine,
    Comment
} from "../token/tokenKind.js";

const errorMessages = {
    unexpectedToken: "Unexpected token '${0}'",
    unexpectedString: "Unexpected string",
    unexpectedEOF: "Unexpected end of input",
    missingInit: "Missing initializer in ${0}",
    invalidLeftHandSide: "Invalid left-hand side expression in prefix operation",
    illegalStatement: "Illegal ${0} statement",
};

function format(str) {
    let args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\${(\d+)}/g, function (_match, number) {
        return typeof args[number] != 'undefined' ? args[number] : "";
    });
};

class ParseError extends SyntaxError {
    constructor(
        error,
        start,
        end,
        startLine,
        startColumn,
        endLine,
        endColumn
    ) {
        super(error);
        this.start = start;
        this.end = end;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }
}

class Parser {
    node = null;
    parentNode = null;
    constructor(tokens) {
        this.tokens = tokens;
    }
    parseProgram() {
        // init properties
        this.index = 0;
        this.length = this.tokens.length;
        let lastToken = this.tokens[this.length - 1];
        if (lastToken != null) {
            if (lastToken.tokenKind != EOF) {
                let token = new Token(
                    EOF,
                    lastToken.end,
                    lastToken.end);
                token.startLine = lastToken.endLine;
                token.startColumn = lastToken.endColumn;
                token.endLine = lastToken.endLine;
                token.endColumn = lastToken.endColumn;
                this.eof = token;
            }
        } else {
            let token = new Token(
                EOF,
                0,
                0);
            token.startLine = 1;
            token.startColumn = 0;
            token.endLine = 1;
            token.endColumn = 0;
            this.eof = token;
            this.ast = new Program(
            0, this.eof.end, [], "module");
            return;
        }
        // set the current node
        this.ast = new Program(
            0, this.eof.end, [], "module");
        this.error = null;
        this.node = {};
        this.parentNode = null;
        this.getToken();
        this.parseBlockOrModuleBlockBody(
            this.ast.body, this.eof);
    }
    parseBlockOrModuleBlockBody(body, endToken) {
        this.endToken = endToken;
        while (!this.match(endToken.tokenKind)) {
            // parse statement
            let statement = this.parseStatement();
            body.push(statement);
        }

    }
    parseStatement(
        allowReturnStatement = false,
        allowBreakStatement = false,
        allowContinueStatement = false
    ) {
        switch (this.token.tokenKind) {
            case keywordMap["var"]:
            case keywordMap["let"]:
            case keywordMap["const"]:
                return this.parseVarStatement(this.token.value);
            case keywordMap["if"]:
                return this.parseIfStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
            case keywordMap["switch"]:
                return this.parseSwitchStatement(allowReturnStatement, allowContinueStatement);
            case keywordMap["while"]:
                return this.parseWhileStatement(allowReturnStatement);
            case keywordMap["for"]:
                return this.parseForStatement(allowReturnStatement);
            case keywordMap["do"]:
                return this.parseDoWhileStatement(allowReturnStatement);
            case keywordMap["break"]:
                if (!allowBreakStatement) {
                    this.throwError(format(errorMessages.illegalStatement, "break"));
                }
                return this.parseBreakStatement();
            case keywordMap["continue"]:
                if (!allowContinueStatement) {
                    this.throwError(format(errorMessages.illegalStatement, "continue"));
                }
                return this.parseContinueStatement();
            case keywordMap["function"]:
                return this.parseFunctionStatement();
            case keywordMap["return"]:
                if (!allowReturnStatement) {
                    this.throwError(format(errorMessages.illegalStatement, "return"));
                }
                return this.parseReturnStatement();
            case keywordMap["with"]:
                return this.parseWithStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
            case keywordMap["debugger"]:
                return this.parseDebuggerStatement();
            case keywordMap["try"]:
                return this.parseTryStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
            case keywordMap["throw"]:
                return this.parseThrowStatement();
            case Operator:
                let op = this.token.value;
                if (op == "{") {
                    return this.parseBlock();
                }
                break;
            case Id:
                let start = this.index;
                let label = this.parseIdentifier();
                if (this.matchVal(":")) {
                    return this.parseLabeledStatement(label, allowReturnStatement, allowBreakStatement, allowContinueStatement);
                } else {
                    this.index = start;
                    this.getToken();
                }
                break;
        }

        if (this.matchVal(";")) {
            let emptyStatement = this.parseEmptyStatement();
            this.nextToken();
            return emptyStatement;
        }

        let expressionStatement = this.parseExpressionStatement();
        this.semicolon();
        return expressionStatement;
    }
    parseThrowStatement() {
        let start = this.token.start;
        this.nextToken();
        let argument = this.parseExpression();
        this.semicolon();
        return new ThrowStatement(
            start, argument.end, argument
        );
    }
    parseWithStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement) {
        let start = this.token.start;
        this.nextToken();
        this.expectVal("(");
        let object = this.parseExpression();
        this.expectVal(")");
        let body = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
        return new WithStatement(start, this.token.start, object, body);
    }
    parseSwitchStatement(allowReturnStatement, allowContinueStatement) {
        let start = this.token.start;
        this.nextToken();
        this.expectVal("(");
        let discriminant = this.parseExpression();
        this.expectVal(")");
        let cases = this.parseSwitchCases(allowReturnStatement, allowContinueStatement);
        return new SwitchStatement(
            start, this.token.start, discriminant, cases
        );
    }
    parseSwitchCases(allowReturnStatement, allowContinueStatement) {
        let cases = [];
        this.expectVal("{");
        while (!this.match(this.endToken.tokenKind)) {
            if (this.matchVal("}")) {
                break;
            }
            if (this.matchVal("case")) {
                let consequent = [];
                let start = this.token.start;
                this.expectVal("case");
                let test = this.parseExpression();
                this.expectVal(":");
                while (!this.matchVal("}") &&
                    !this.matchVal("case") &&
                    !this.matchVal("default")
                ) {
                    let statement = this.parseStatement(allowReturnStatement, true, allowContinueStatement);
                    consequent.push(statement);
                }
                cases.push(
                    new SwitchCase(start, this.token.start, consequent, test)
                );
            } else {
                let consequent = [];
                let start = this.token.start;
                this.expectVal("default");
                let test = null;
                this.expectVal(":");
                while (!this.matchVal("}")) {
                    let statement = this.parseStatement(allowReturnStatement, true, allowContinueStatement);
                    consequent.push(statement);
                }
                cases.push(
                    new SwitchCase(start, this.token.start, consequent, test)
                );
            }
        }
        this.expectVal("}");
        return cases;
    }
    parseDebuggerStatement() {
        let start = this.token.start;
        this.nextToken();
        let end = this.token.end;
        this.semicolon();
        return new DebuggerStatement(
            start, end
        );
    }
    parseLabeledStatement(label, allowReturnStatement, allowBreakStatement, allowContinueStatement) {
        this.nextToken();
        let body = this.parseStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
        return new LabeledStatement(
            label.start, body.end, body, label
        );
    }
    parseBlock(allowReturnStatement = false, allowBreakStatement = false, allowContinueStatement = false) {
        let start = this.token.start;
        let body = [];
        this.expectVal("{");
        while (!this.match(this.endToken.tokenKind)) {
            if (this.matchVal("{")) {
                body.push(this.parseBlock());
                continue;
            }
            if (this.matchVal("}")) {
                break;
            }
            let statement = this.parseStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
            body.push(statement);
        }
        this.expectVal("}");
        let end = this.token.start;
        let blockStatement = new BlockStatement(
            start,
            end,
            body
        );
        return blockStatement;
    }
    parseVarStatement(kind) {
        let start = this.token.start;
        this.nextToken();
        // build variable declaration
        let variableDeclaration = new VariableDeclaration(
            start,
            /* placeholder */
            null, [],
            kind);
        this.parseVar(variableDeclaration);
        variableDeclaration.end = this.token.end;
        this.semicolon();
        return variableDeclaration;
    }
    parseVar(variableDeclaration) {
        let declarators = variableDeclaration.declarations;
        let kind = variableDeclaration.kind;
        // parse declarators
        while (!this.match(this.endTokenKind)) {
            let identifier = this.parseIdentifier();
            let declarator = new VariableDeclarator(
                identifier.start,
                /* placeholder */
                null,
                identifier,
                null);
            declarator.init = this.eatVal('=') ? this.parseExpression(false) : null;
            declarator.end = this.token.start;
            declarators.push(declarator);
            this.checkVarInit(kind, declarator.init);
            if (!this.eatVal(',')) break;
        }
    }
    parseIfStatement(allowReturnStatement = false, allowBreakStatement = false, allowContinueStatement = true) {
        let start = this.token.start;
        this.nextToken();
        this.expectVal("(");
        let test = this.parseExpression();
        this.expectVal(")");
        let consequent = null;
        let alternate = null;
        if (this.matchVal("{")) {
            consequent = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
            if (this.matchVal("else")) {
                let elseStart = this.token.start;
                this.nextToken();
                if (this.matchVal("{")) {
                    alternate = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
                } else if (this.matchVal("if")) {
                    alternate = this.parseIfStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
                } else {
                    alternate = this.parseStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
                }
            }
        } else {
            consequent = this.parseStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
            
            if (this.matchVal("else")) {
                let elseStart = this.token.start;
                this.nextToken();
                if (this.matchVal("{")) {
                    alternate = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
                } else if (this.matchVal("if")) {
                    alternate = this.parseIfStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
                } else {
                    alternate = this.parseStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement);
                }
            }
        }
        let end = this.token.start;
        this.semicolon();
        return new IfStatement(
            start,
            end,
            test,
            consequent,
            alternate
        );
    }
    parseWhileStatement(allowReturnStatement = false) {
        let start = this.index;
        this.nextToken();
        this.expectVal("(");
        let test = this.parseExpression();
        this.expectVal(")");
        let body = null;
        let end = null;
        if (this.matchVal("{")) {
            body = this.parseBlock(allowReturnStatement, true, true);
            end = body.end;
        } else if (!this.matchVal(";")) {
            body = this.parseStatement(allowReturnStatement, true, true);
            end = body.end;
        } else {
            body = this.parseEmptyStatement();
            end = body.end;
            this.semicolon();
        }
        return new WhileStatement(
            start, end, test, body
        );
    }
    parseForStatement(allowReturnStatement = false) {
        let start = this.index;
        this.nextToken();
        this.expectVal("(");
        let init = null;
        let left = null;
        if (!this.matchVal(";")) {
            if (this.matchVal("var") ||
                this.matchVal("let") ||
                this.matchVal("const")
            ) {
                let start = this.index;
                let begin = this.token.start;
                this.nextToken();
                let id = this.parseIdentifier();
                if (this.eatVal("in")) {
                    init = new VariableDeclaration(
                        begin, id.end, [
                            new VariableDeclarator(
                                id.start, id.end, id
                            )
                        ], null
                    );
                    left = init;
                } else {
                    this.index = start;
                    this.getToken();
                    init = this.parseVarStatement(this.token.value);
                }
            } else {
                init = this.parseExpression(true, false);
                if (this.eatVal("in")) {
                    left = init;
                } else {
                    this.expectVal(";");
                }
            }
        } else {
            this.expectVal(";");
        }
        
        if (left != null) {
            let right = this.parseExpression();
            this.expectVal(")");
            let body = null;
            let end = null;
            if (this.matchVal("{")) {
                body = this.parseBlock(allowReturnStatement, true, true);
                end = body.end;
            } else if (!this.matchVal(";")) {
                body = this.parseStatement(allowReturnStatement, true, true);
                end = body.end;
            } else {
                body = this.parseEmptyStatement();
                end = body.end;
                this.semicolon();
            }
            return new ForInStatement(
                start, this.token.start, left, right, body
            );
        }
        
        let test = null;
        if (!this.matchVal(";")) {
            test = this.parseExpression();
        }
        this.expectVal(";");
        let update = null;
        if (!this.matchVal(")")) {
            update = this.parseExpression();
        }
        this.expectVal(")");
        let body = null;
        let end = null;
        if (this.matchVal("{")) {
            body = this.parseBlock(allowReturnStatement, true, true);
            end = body.end;
        } else if (!this.matchVal(";")) {
            body = this.parseStatement(allowReturnStatement, true, true);
            end = body.end;
        } else {
            body = this.parseEmptyStatement();
            end = body.end;
            this.semicolon();
        }
        return new ForStatement(
            start,
            end,
            init,
            test,
            update,
            body
        );
    }
    parseDoWhileStatement(allowReturnStatement = false) {
        let start = this.index;
        this.nextToken();
        let body = this.parseBlock(allowReturnStatement, true, true);
        this.expectVal("while");
        this.expectVal("(");
        let test = this.parseExpression();
        this.expectVal(")");
        let end = this.token.start;
        this.semicolon();
        return new DoWhileStatement(
            start,
            end,
            body,
            test
        );
    }
    parseBreakStatement() {
        let start = this.token.start;
        let end = null;
        this.nextToken();
        let label = null;
        if (this.matchVal(";")) {
            end = this.token.start;
            this.semicolon();
        } else if (this.matchVal("}")) {
            end = this.token.start;
        } else if (this.match(Id)) {
            label = this.parseIdentifier();
            end = label.end;
            this.semicolon();
        } else {
            end = this.token.start;
            this.semicolon();
        }
        return new BreakStatement(
            start, this.token.start, label
        );
    }
    parseContinueStatement() {
        let start = this.token.start;
        let end = null;
        this.nextToken();
        let label = null;
        if (this.matchVal(";")) {
            end = this.token.start;
            this.semicolon();
        } else if (this.matchVal("}")) {
            end = this.token.start;
        } else if (this.match(Id)) {
            label = this.parseIdentifier();
            end = label.end;
            this.semicolon();
        } else {
            end = this.token.start;
            this.semicolon();
        }
        return new ContinueStatement(
            start, this.token.start, label
        );
    }
    parseTryStatement(allowReturnStatement, allowBreakStatement, allowContinueStatement) {
        let start = this.token.start;
        this.nextToken();
        let block = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
        let catchClauseStart = this.token.start;
        this.expectVal("catch");
        this.expectVal("(");
        let param = this.parseIdentifier();
        this.expectVal(")");
        let body = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
        let finalizer = null;
        if (this.eatVal("finally")) {
            finalizer = this.parseBlock(allowReturnStatement, allowBreakStatement, allowContinueStatement);
        }
        return new TryStatement(
            start, this.token.start, block, new CatchClause(
                catchClauseStart, this.token.start, param, body
            ), finalizer
        );
    }
    parseFunctionStatement() {
        let start = this.token.start;
        this.nextToken();
        let id = this.parseIdentifier();
        let params = this.parseIdArguments();
        let body = this.parseBlock(true);
        return new FunctionDeclaration(
            start,
            body.end,
            id,
            false,
            false,
            false,
            params,
            body
        );
    }
    parseFunctionExpression() {
        // parse function expression
        // function (id) (p, p2, ...) {}
        let start = this.token.start;
        let _async = false;
        if (this.matchVal("async")) {
            _async = true;
            this.nextToken();
            if (!this.matchVal("function")) {
                this.unexpected();
            }
        }
        this.nextToken();
        let id = null;
        let generator = false;
        if (this.match(Id)) {
            id = this.parseIdentifier();
        } else if (this.eatVal("*")) {
            generator = true;
            if (this.match(Id)) {
                id = this.parseIdentifier();
            }
        }
        // parse arguments
        let params = this.parseIdArguments();
        // parse body
        let body = this.parseBlock(true);
        return new FunctionExpression(
            start, body.end, id, _async, generator, false, params, body
        );
    }
    parseReturnStatement() {
        let start = this.token.start;
        let end = null;
        this.nextToken();
        let argument = null;
        if (this.matchVal(";")) {
            end = this.token.start;
            this.semicolon();
        } else if (this.matchVal("}")) {
            end = this.token.start;
        } else {
            argument = this.parseExpression();
            end = argument.end;
            this.semicolon();
        }
        return new ReturnStatement(
            start, this.token.start, argument
        );
    }
    parseIdArguments() {
        this.expectVal("(");
        let commaCount = 0;
        let params = [];
        let tag = -1;
        while (
            !this.matchVal(")")
        ) {
            // parse the expressions.
            params.push(this.parseIdentifier());
            if (this.matchVal(")")) {
                break;
            } else if (this.match(this.endToken.tokenKind)) {
                break;
            } else {
                let start = this.index;
                this.expectVal(",");
                ++commaCount;
                if (this.match(this.endToken.tokenKind)) {
                    tag = start;
                    break;
                }
            }
        }
        if (commaCount > params.length) {
            // Trace back to the exception's token
            if (tag > -1) {
                this.index = tag;
                this.getToken();
            }
            this.unexpected();
        }
        this.expectVal(")");
        return params;
    }
    parseExpressionArguments() {
        this.expectVal("(");
        let commaCount = 0;
        let params = [];
        let tag = -1;
        while (
            !this.matchVal(")")
        ) {
            // parse the expressions.
            params.push(this.parseExpression(false));
            if (this.matchVal(")")) {
                break;
            } else if (this.match(this.endToken.tokenKind)) {
                break;
            } else {
                let start = this.index;
                this.expectVal(",");
                ++commaCount;
                if (this.match(this.endToken.tokenKind)) {
                    tag = start;
                    break;
                }
            }
        }
        if (commaCount > params.length) {
            // Trace back to the exception's token
            if (tag > -1) {
                this.index = tag;
                this.getToken();
            }
            this.unexpected();
        }
        this.expectVal(")");
        return params;
    }
    parseEmptyStatement() {
        if (!this.matchVal(";")) {
            this.unexpected();
        }
        return new EmptyStatement(
            this.token.start,
            this.token.end
        );
    }
    parseExpressionStatement() {
        let expr = this.parseExpression();
        let expressionStatement = new ExpressionStatement(
            expr.start,
            expr.end,
            expr
        );
        return expressionStatement;
    }
    parseExpression(parseSequence = true, parseIn = true) {
        let left = this.factor(parseSequence);
        let lastOpLevel = -1;
        if (left == null) {
            this.unexpected();
            return;
        }

        while (
            (
                this.match(Operator) ||
                this.matchVal("instanceof") ||
                this.matchVal("in")
            ) &&
            !this.matchVal(")") &&
            !this.matchVal("]") &&
            !this.matchVal("{") &&
            !this.matchVal("}") &&
            !this.matchVal(";") &&
            !this.matchVal("?") &&
            !this.matchVal(":") &&
            !this.matchVal(",") &&
            !this.matchVal(".")
        ) {
            let opLevel = this.level();
            let op = this.token.value;
            let start = this.index;
            if (!parseIn && op == "in") {
                break;
            }
            if (op == "!" || op == "~") {
                break;
            }
            this.nextToken();

            let right = this.factor(parseSequence);
            if (right == null) {
                this.index = start;
                this.getToken();
                this.unexpected();
                break;
            }
            if (
                left.type == "UpdateExpression" &&
                right.type == "UpdateExpression" &&
                op == "("
            ) {
                this.index = start;
                this.getToken();
                this.throwError(errorMessages.invalidLeftHandSide);
            }

            if (lastOpLevel == -1) {
                left = new BinaryExpression(
                    left.start,
                    right.end,
                    left,
                    op,
                    right
                );

            } else if (opLevel > lastOpLevel) {
                left.right = new BinaryExpression(
                    left.right.start,
                    right.end,
                    left.right,
                    op,
                    right
                );
                left.end = left.right.end;
            } else {
                left = new BinaryExpression(
                    left.start,
                    right.end,
                    left,
                    op,
                    right
                );
            }
            lastOpLevel = opLevel;
        }

        return left;
    }
    factor(parseSequence = true) {
        let result = null;
        let factorStart = this.index;
        if (this.isUpdate()) {
            let start = this.token.start;
            let op = this.token.value;
            this.nextToken();
            let factorStart = this.index;
            let factor = this.factor(parseSequence);
            
            if (factor == null) {
                this.index = this.lastFactorStart;
                this.getToken();
                this.unexpected();
            }
            if (factor.type != "Identifier" && factor.type != "MemberExpression") {
                this.index = this.lastFactorStart;
                this.getToken();
                this.throwError(
                    errorMessages.invalidLeftHandSide,
                    []
                );
            }
            result = new UpdateExpression(
                start, factor.end, op, true, factor
            );
        } else if (this.match(Id)) {
            let idStart = this.index;
            let id = this.parseIdentifier();

            if (id.name == "async") {
                if (this.matchVal("function")) {
                    this.index = idStart;
                    this.getToken();
                    let functionExpression = this.parseFunctionExpression();
                    result = functionExpression;
                }
            } else if (this.isAssignment()) {
                let op = this.token.value;
                this.nextToken();
                let right = this.parseExpression();
                result = new AssignmentExpression(
                    id.start, right.end, op, id, right
                );
            } else {
                result = id;
            }
        } else if (this.matchVal("this")) {
            let thisExpression = new ThisExpression(
                this.token.start, this.token.end
            );
            this.nextToken();
            result = thisExpression;
        } else if (this.eatVal("(")) {
            let expr = this.parseExpression();
            this.expectVal(")");
            result = expr;
        } else if (this.matchVal("[")) {
            let start = this.token.start
            let elements = [];
            this.nextToken();
            while (!this.eatVal("]")) {
                if (this.match(this.endToken.tokenKind)) {
                    this.unexpected();
                }
                if (this.eatVal(",")) {
                    elements.push(null);
                    continue;
                }
                elements.push(this.parseExpression(false));
                if (this.eatVal("]")) {
                    break;
                } else {
                    this.expectVal(",");
                }
            }
            let arrayExpression = new ArrayExpression(
                start, this.token.start, elements
            );
            result = arrayExpression;
        } else if (this.matchVal("{")) {
            let start = this.token.start;
            let properties = [];
            this.nextToken();
            while (!this.eatVal("}")) {
                if (this.match(this.endToken.tokenKind)) {
                    this.unexpected();
                }
                let key = this.parseIdentifierForce();
                this.expectVal(":")
                let value = this.parseExpression(false);
                properties.push(new Property(key.start, value.end, false, false, false, key, value, "init"));
                if (this.eatVal("}")) {
                    break;
                } else {
                    let start = this.index;
                    this.expectVal(",");
                    if (this.matchVal(",")) {
                        this.unexpected();
                    }
                }
            }
            result = new ObjectExpression(
                start, this.token.start, properties
            );
        } else if (
            this.matchVal("+") ||
            this.matchVal("-") ||
            this.matchVal("~") ||
            this.matchVal("!") ||
            this.matchVal("void") ||
            this.matchVal("typeof") ||
            this.matchVal("delete")
        ) {
            let tokenStart = this.index;
            let start = this.token.start;
            let op = this.token.value;
            this.nextToken();
            let argument = this.factor(parseSequence);
            if (argument == null) {
                this.index = tokenStart;
                this.getToken();
                this.unexpected();
            }
            let end = argument.end;
            let unaryExpression = new UnaryExpression(
                start,
                end,
                op,
                true,
                argument
            );
            result = unaryExpression
        } else if (this.matchVal("function")) {
            let functionExpression = this.parseFunctionExpression();
            result = functionExpression;
        } else if (this.matchVal("new")) {
            let start = this.token.start;
            this.nextToken();
            let expr = this.parseExpression();
            let callee = null;
            let args = null;
            if (expr.type == "CallExpression") {
                callee = expr.callee;
                args = expr["arguments"];
            } else {
                callee = expr;
                args = [];
            }
            let newExpression = new NewExpression(
                start, this.token.start, callee, args
            );
            result = newExpression;
        } else {
            let literal = this.parseLiteral();
            result = literal;
        }
        
        let handle = false;
        do {
        handle = false;
        if (result != null && (this.matchVal(".") || this.matchVal("["))) {
            while (this.matchVal(".") || this.matchVal("[")) {
                let computed = this.matchVal("[");
                this.nextToken();
                let id = null;
                if (computed) {
                    id = this.parseExpression();
                    this.expectVal("]");
                } else {
                    id = this.parseIdentifier(true);
                }
                result = new MemberExpression(
                    result.start, id.end, result, id, computed, false
                );
            }
            handle = true;
        }

        if (result != null && this.matchVal("(")) {
            while (this.matchVal("(")) {
                let args = this.parseExpressionArguments();
                let end = this.token.start;
                result = new CallExpression(
                    result.start, end, result, args, false
                );
            }
            handle = true;
        }
        if (result != null && this.isUpdate()) {
            if (result.type != "Identifier" && result.type != "MemberExpression") {
                this.throwError(errorMessages.invalidLeftHandSide);
            } else {
                result = new UpdateExpression(
                    result.start, this.token.end, this.token.value, false, result
                );
                this.nextToken();
                handle = true;
            }
        }
        
        if (result != null && parseSequence && this.matchVal(",")) {
            let expressions = [result];
            while (this.matchVal(",")) {
                this.nextToken();
                expressions.push(this.parseExpression(false));
            }
            result = new SequenceExpression(
                result.start, this.token.start, expressions
            );
            handle = true;
        }
        
        if (result != null && this.matchVal("?")) {
            this.nextToken();
            let consequent = this.parseExpression(false);
            this.expectVal(":");
            let alternate = this.parseExpression(false);
            result = new ConditionalExpression(
                result.start, this.token.start, result, consequent, alternate
            );
            handle = true;
        }
        } while(handle);
        this.lastFactorStart = factorStart;
        return result;
    }
    checkVarInit(kind, init) {
        if (kind == "const" && init == null) {
            this.throwError(errorMessages.missingInit, ["const declaration"]);
        }
    }
    parseIdentifierForce() {
        if (
            (this.token.realType != null && this.token.realType === Keyword) ||
            this.match(Id) ||
            this.match(Str) ||
            this.match(Num) ||
            this.match(Special)
        ) {
            let id = new Identifier(
                this.token.start,
                this.token.end,
                this.token.value
            );
            this.nextToken();
            return id;
        }
        this.unexpected();
    }
    parseIdentifier(allowKeyword = false) {
        let id = new Identifier(
            this.token.start,
            this.token.end,
            this.token.value);
        if (allowKeyword && keywordMap[this.token.value] != null) {
            this.nextToken();
        } else {
            this.expect(Id);
        }
        return id;
    }
    parseLiteral() {
        let literal = new Literal(
            this.token.start,
            this.token.end,
            this.token.value,
            JSON.stringify(this.token.value)
        );

        if (
            this.match(Str) ||
            this.match(Num) ||
            this.match(Special) ||
            this.match(Regex)
        ) {
            if (this.match(Regex)) {
                literal.isRegex = function () { return true; }
            }
            this.nextToken();
            return literal;
        }
        return null;
    }
    getToken() {
        this.getTokenDef();
        while (
            this.match(WhiteSpace) ||
            this.match(NewLine) ||
            this.match(Comment)
        ) {
            ++this.index;
            this.getTokenDef();
        }
    }
    getTokenDef() {
        if (this.index >= this.length) {
            this.token = this.endToken;
        } else {
            this.token = this.tokens[this.index];
        }
    }
    nextToken() {
        if (this.index + 1 > this.length) {
            return this.token;
        }

        ++this.index;
        this.getToken();
    }
    match(tokenKind) {
        if (this.token != null && this.token.tokenKind === tokenKind) {
            return true;
        }
        return false;
    }
    matchVal(value) {
        return this.token != null && this.token.value == value;
    }
    eat(tokenKind) {
        if (this.match(tokenKind)) {
            this.nextToken();
            return true;
        }
        return false;
    }
    eatVal(value) {
        if (this.matchVal(value)) {
            this.nextToken();
            return true;
        }
        return false;
    }
    expect(tokenKind) {
        if (!this.eat(tokenKind)) {
            this.unexpected();
        }
    }
    expectVal(value) {
        if (!this.eatVal(value)) {
            this.unexpected();
        }
    }
    assert(tokenKind) {
        if (!this.match(tokenKind)) {
            this.unexpected();
        }
    }
    assertVal(value) {
        if (!this.matchVal(value)) {
            this.unexpected();
        }
    }
    throwError(
        error,
        formatedArgs = [],
        start = this.token.start,
        end = this.token.end,
        startLine = this.token.startLine,
        startColumn = this.token.startColumn,
        endLine = this.token.endLine,
        endColumn = this.token.endColumn
    ) {
        let concated = [error].concat(formatedArgs);
        let composingText = format.apply(null, concated) + " " + `(#${startLine}:${startColumn}-#${endLine}:${endColumn})`
        throw new ParseError(composingText, start, end, startLine, startColumn, endLine, endColumn);
    }
    unexpected() {
        if (this.match(EOF)) {
            this.throwError(errorMessages.unexpectedEOF);
        } else if (this.match(Str)) {
            this.throwError(errorMessages.unexpectedString);
        } else {
            this.throwError(errorMessages.unexpectedToken, [this.token.value]);
        }
    }
    semicolon() {
        if (this.match(this.endToken.tokenKind)) {
            return;
        }
        if (this.matchVal(";")) {
            while (this.matchVal(";")) {
                this.nextToken();
            }
            return;
        }
        let start = this.index;
        while (this.index >= 0) {
            --this.index;
            this.getTokenDef();
            if (this.matchVal(";") || this.match(NewLine)) {
                this.index = start;
                this.getToken();
                return;
            }
        }
        this.index = start;
        this.getToken();
        this.unexpected();
    }
    isAssignment() {
        return this.token.isAssignment == true;
    }
    isBinary() {
        return this.token.isBinary == true;
    }
    isUpdate() {
        return this.token.isUpdate == true;
    }
    level() {
        return this.token.level;
    }
}

export {
    Parser
}