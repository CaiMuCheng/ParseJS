import fs from "fs";
import { Tokenizer } from "./lexer/index.js";
import { CodeGenerator } from "./codegen/index.js";
import { EOF, NewLine } from "./token/index.js";
import { Parser } from "./parser/index.js";
import Interpreter from "./interpreter/index.js";

function makeIndex(tokens) {
    // for each the token, we needed to transform index to line column.
    let line = 1;
    let column = 0;
    let index = 0;
    while (index < tokens.length) {
        let token = tokens[index];
        let startLine = line;
        let startColumn = column;
        if (token.tokenKind === NewLine) {
            line += token.end - token.start;
            column = 0;
            // set the position.
            token.startLine = startLine;
            token.startColumn = startColumn;
            token.endLine = line;
            token.endColumn = column;
        } else {
            let value = token.value;
            let valueIndex = 0;
            while (valueIndex < value.length) {
                let ch = value[valueIndex];
                if (ch == '\r' || ch == '\n') {
                    ++line;
                    column = 0;
                } else {
                    ++column;
                } ++valueIndex;
            }
            token.startLine = startLine;
            token.startColumn = startColumn;
            token.endLine = line;
            token.endColumn = column;
        } ++index;
    }
}

function tokenizeAll(str) {
    const tokenizer = new Tokenizer(str);
    const tokens = [];
    let token = tokenizer.nextToken();
    while (token.tokenKind !== EOF) {
        tokens.push(token);
        token = tokenizer.nextToken();
    }

    // make index for tokens
    makeIndex(tokens, str);

    // return the tokens
    return tokens;
}

function codegen(
    ast,
    format = false,
    computedMode = "default",
    bracketForExpressionStatement = false) {
    const codeGenerator = new CodeGenerator(ast);
    codeGenerator.setFormat(format);
    codeGenerator.setComputedMode(computedMode);
    codeGenerator.setBracketForExpressionStatement(bracketForExpressionStatement);
    return codeGenerator.generate();
}

function generateAST(tokens) {
    const parser = new Parser(tokens);
    parser.parseProgram();
    return parser.ast;
}

const source = fs.readFileSync("./input.js")
    .toString();

const tokens = tokenizeAll(source);
fs.writeFileSync("./tokens.txt", tokens.join("\n"));

const ast = generateAST(tokens);
fs.writeFileSync("./ast.json", JSON.stringify(ast, null, 2));

const code = codegen(ast, true);
fs.writeFileSync("./output.js", code);