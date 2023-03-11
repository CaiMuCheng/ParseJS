import * as tokenKind from "../token/index.js";
const {
    Token, keywordMap,
    isKeyword, isOperator, isSpecial, priorities,
    EOF,
    Comment,
    NewLine,
    WhiteSpace,
    Keyword,
    Operator,
    Id,
    Special,
    Num,
    Regex,
    Str
} = tokenKind;

class Tokenizer {
    content = ""
    index = 0
    end = 0
    state = {
        lastToken: null
    }
    constructor(content) {
        if (content != null) {
            this.content = content;
            this.end = content.length;
        }
    }
    /**
     * @param {string} content
     */
    set content(content) {
        this.content = content;
        this.index = 0;
        this.end = content.length;
    }
    get content() {
        return this.content;
    }
    /**
     * @param {number} index
     */
    set index(index) {
        this.index = index;
    }
    get index() {
        return this.index;
    }
    /**
     * @param {number} end
     */
    set end(end) {
        this.end = end;
    }
    get end() {
        return this.end;
    }

    nextToken() {
        this.getChar();
        if (this.isEOF()) {
            // EOF Token
            return new Token(
                EOF,
                this.index,
                this.index,
                '\u0000');
        }
        // Comment first
        if (this.ch == "/") {
            let start = this.index;
            this.yyChar();
            if (this.ch == '/') {
                while (this.isNotEOF() && !this.isNewLine()) {
                    this.yyChar();
                }
                let end = this.index;
                let token = new Token(
                    Comment,
                    start,
                    end,
                    this.content.substring(start, end));
                token.isMultiComment = false;
                this.state.lastToken = token;
                return token;
            } else if (this.ch == '*') {
                this.yyChar();
                while (this.isNotEOF()) {
                    if (this.ch == '*') {
                        this.yyChar();
                        if (this.ch == '/') {
                            this.yyChar();
                            break;
                        }
                        continue;
                    }
                    this.yyChar();
                }
                let end = this.index;
                let token = new Token(
                    Comment,
                    start,
                    end,
                    this.content.substring(start, end));
                token.isMultiComment = true;
                this.state.lastToken = token;
                return token;
            } else {
                this.index = start;
                this.getChar();
            }
        }

        // NewLine second
        if (this.isNewLine()) {
            let start = this.index;
            while (this.isNewLine()) {
                this.yyChar();
            }
            let end = this.index;
            let token = new Token(
                NewLine,
                start,
                end,
                this.content.substring(start, end));
            this.state.lastToken = token;
            return token;
        }

        // Space third
        if (this.isSpace()) {
            let start = this.index;
            while (this.isSpace()) {
                this.yyChar();
            }
            let end = this.index;
            let token = new Token(
                WhiteSpace,
                start,
                end,
                this.content.substring(start, end));
            return token;
        }

        // String Token
        if (this.ch == '"' || this.ch == "'" || this.ch == '`') {
            let start = this.index;
            if (this.ch == '"') {
                this.yyChar();
                while (this.isNotEOF() && !this.isNewLine()) {
                    if (this.ch == '"') {
                        let start = this.index;
                        // check before
                        this.prevChar();
                        if (this.ch == '\\') {
                            let escapeEnd = this.index;
                            while (this.index >= 0 && this.ch == '\\') {
                                this.prevChar();
                            }
                            let escapeStart = this.index + 1;
                            let distance = escapeEnd - escapeStart + 1;
                            if (distance % 2 == 0) {
                                // break while
                                this.index = start;
                                this.yyChar();
                                break;
                            } else {
                                // continue while
                                this.index = start;
                                this.yyChar();
                                continue;
                            }
                        } else {
                            this.index = start;
                            this.yyChar();
                            break;
                        }
                    }
                    this.yyChar();
                }
                let end = this.index;
                let token = new Token(
                    Str,
                    start,
                    end,
                    this.content.substring(start, end));
                this.state.lastToken = token;
                return token;
            }

            if (this.ch == "'") {
                this.yyChar();
                while (this.isNotEOF() && !this.isNewLine()) {
                    if (this.ch == "'") {
                        let start = this.index;
                        // check before
                        this.prevChar();
                        if (this.ch == '\\') {
                            let escapeEnd = this.index;
                            while (this.index >= 0 && this.ch == '\\') {
                                this.prevChar();
                            }
                            let escapeStart = this.index + 1;
                            let distance = escapeEnd - escapeStart + 1;
                            if (distance % 2 == 0) {
                                // break while
                                this.index = start;
                                this.yyChar();
                                break;
                            } else {
                                // continue while
                                this.index = start;
                                this.yyChar();
                                continue;
                            }
                        } else {
                            this.index = start;
                            this.yyChar();
                            break;
                        }
                    }
                    this.yyChar();
                }
                let end = this.index;
                let token = new Token(
                    Str,
                    start,
                    end,
                    this.content.substring(start, end));
                token.isTemplate = false;
                this.state.lastToken = token;
                return token;
            }

            // handle template string.
            this.yyChar();
            let quasics = [];
            while (this.isNotEOF()) {
                if (this.ch == "`") {
                    let start = this.index;
                    // check before
                    this.prevChar();
                    if (this.ch == '\\') {
                        let escapeEnd = this.index;
                        while (this.index >= 0 && this.ch == '\\') {
                            this.prevChar();
                        }
                        let escapeStart = this.index + 1;
                        let distance = escapeEnd - escapeStart + 1;
                        if (distance % 2 == 0) {
                            // break while
                            this.index = start;
                            this.yyChar();
                            break;
                        } else {
                            // continue while
                            this.index = start;
                            this.yyChar();
                            continue;
                        }
                    } else {
                        this.index = start;
                        this.yyChar();
                        break;
                    }
                }
                if (this.ch == "$") {
                    let start = this.index;
                    // check before
                    this.prevChar();
                    if (this.ch == '\\') {
                        let escapeEnd = this.index;
                        while (this.index >= 0 && this.ch == '\\') {
                            this.prevChar();
                        }
                        let escapeStart = this.index + 1;
                        let distance = escapeEnd - escapeStart + 1;
                        if (distance % 2 == 0) {
                            // do parse
                            this.index = start;
                            this.yyChar();
                            if (this.ch == '{') {
                                let blockBegin = this.index;
                                while (this.isNotEOF()) {
                                    if (this.ch == '}') {
                                        break;
                                    }
                                    this.yyChar();
                                }
                                let blockEnd = this.index;
                                let buildObject = {
                                    name: "TemplateElement",
                                    start: start,
                                    end: blockEnd + 1,
                                    value: []
                                };
                                // do parse again.
                                let tokenizer = new Tokenizer(this.content);
                                tokenizer.index = blockBegin + 1;
                                tokenizer.end = blockEnd;
                                let token = tokenizer.nextToken();
                                while (token.tokenKind !== EOF) {
                                    buildObject.value.push(token);
                                    token = tokenizer.nextToken();
                                }
                                quasics.push(buildObject);
                                this.yyChar();
                                continue;
                            }
                        } else {
                            // continue while
                            this.index = start;
                            this.yyChar();
                            continue;
                        }
                    } else {
                        this.index = start;
                        this.yyChar();
                        if (this.ch == '{') {
                            let blockBegin = this.index;
                            while (this.isNotEOF()) {
                                if (this.ch == '}') {
                                    break;
                                }
                                this.yyChar();
                            }
                            let blockEnd = this.index;
                            let buildObject = {
                                name: "TemplateElement",
                                start: start,
                                end: blockEnd + 1,
                                value: []
                            };
                            // do parse again.
                            let tokenizer = new Tokenizer(this.content);
                            tokenizer.index = blockBegin + 1;
                            tokenizer.end = blockEnd;
                            let token = tokenizer.nextToken();
                            while (token.tokenKind !== EOF) {
                                buildObject.value.push(token);
                                token = tokenizer.nextToken();
                            }
                            quasics.push(buildObject);
                            this.yyChar();
                            continue;
                        }
                        continue;
                    }
                }
                this.yyChar();
            }
            let end = this.index;
            let token = new Token(
                Str,
                start,
                end,
                this.content.substring(start, end));
            token.isTemplate = true;
            token.quasics = quasics;
            this.state.lastToken = token;
            return token;
        }

        if (this.ch == '/') {
            if (
                this.state.lastToken.tokenKind === Operator ||
                this.state.lastToken.tokenKind === NewLine ||
                this.state.lastToken.isBinary ||
                this.state.lastToken.isAssignment ||
                this.state.lastToken.isUpdate
            ) {
                let isEnd = false;
                let start = this.index;
                this.yyChar();
                while (this.isNotEOF() && !this.isNewLine()) {
                    if (this.ch == "/") {
                        let start = this.index;
                        // check before
                        this.prevChar();
                        if (this.ch == '\\') {
                            let escapeEnd = this.index;
                            while (this.index >= 0 && this.ch == '\\') {
                                this.prevChar();
                            }
                            let escapeStart = this.index + 1;
                            let distance = escapeEnd - escapeStart + 1;
                            if (distance % 2 == 0) {
                                // break while
                                this.index = start;
                                this.yyChar();
                                isEnd = true;
                                break;
                            } else {
                                // continue while
                                this.index = start;
                                this.yyChar();
                                continue;
                            }
                        } else {
                            this.index = start;
                            this.yyChar();
                            isEnd = true;
                            break;
                        }
                    }
                    this.yyChar();
                }
                if (isEnd) {
                    // The regexp mode - /reg/mode
                    while (this.isLetter()) {
                        this.yyChar();
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Regex,
                        start,
                        end,
                        substring);
                    this.state.lastToken = token;
                    return token;
                } else {
                    this.index = start;
                    this.getChar();
                }
            }
        }

        if (isOperator(this.ch)) {
            let start = this.index;
            let ch = this.ch;
            if (ch == '=') {
                this.yyChar();
                if (this.ch == '=') {
                    this.yyChar();
                    if (this.ch == '=') {
                        this.yyChar();
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                let end = this.index;
                let substring = this.content.substring(start, end);
                let token = new Token(
                    Operator,
                    start,
                    end,
                    substring);
                token.isAssignment = true;
                token.isUpdate = false;
                token.isBinary = false;
                token.level = priorities[substring];
                this.state.lastToken = token;
                return token;
            }
            if (ch == '+') {
                this.yyChar();
                if (this.ch == '+') {
                    this.yyChar();
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = true;
                    token.isBinary = false;
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (ch == '-') {
                this.yyChar();
                if (this.ch == '-') {
                    this.yyChar();
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = true;
                    token.isBinary = false;
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (ch == '!') {
                this.yyChar();
                if (this.ch == '=') {
                    this.yyChar();
                    if (this.ch == '=') {
                        this.yyChar();
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (ch == '&') {
                this.yyChar();
                if (this.ch == '&') {
                    this.yyChar();
                    if (this.ch == '=') {
                        this.yyChar();
                        let end = this.index;
                        let token = new Token(
                            Operator,
                            start,
                            end,
                            this.content.substring(start, end));
                        token.isAssignment = true;
                        token.isUpdate = false;
                        token.isBinary = false;
                        token.level = priorities[substring];
                        this.state.lastToken = token;
                        return token;
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                if (this.ch == '=') {
                    this.yyChar();
                    let end = this.index;
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        this.content.substring(start, end));
                    token.isAssignment = true;
                    token.isUpdate = false;
                    token.isBinary = false;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (ch == '|') {
                this.yyChar();
                if (this.ch == '|') {
                    this.yyChar();
                    if (this.ch == '=') {
                        this.yyChar();
                        let end = this.index;
                        let token = new Token(
                            Operator,
                            start,
                            end,
                            this.content.substring(start, end));
                        token.isAssignment = true;
                        token.isUpdate = false;
                        token.isBinary = false;
                        token.level = priorities[substring];
                        this.state.lastToken = token;
                        return token;
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                if (this.ch == '=') {
                    this.yyChar();
                    let end = this.index;
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        this.content.substring(start, end));
                    token.isAssignment = true;
                    token.isUpdate = false;
                    token.isBinary = false;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (ch == '<') {
                this.yyChar();
                if (this.ch == '<') {
                    this.yyChar();
                    if (this.ch == '=') {
                        this.yyChar();
                        let end = this.index;
                        let token = new Token(
                            Operator,
                            start,
                            end,
                            this.content.substring(start, end));
                        token.isAssignment = true;
                        token.isUpdate = false;
                        token.isBinary = false;
                        token.level = priorities[substring];
                        this.state.lastToken = token;
                        return token;
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                } else if (this.ch == "=") {
                    this.yyChar();
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (ch == '>') {
                this.yyChar();
                if (this.ch == '>') {
                    this.yyChar();
                    if (this.ch == '=') {
                        this.yyChar();
                        let end = this.index;
                        let substring = this.content.substring(start, end);
                        let token = new Token(
                            Operator,
                            start,
                            end,
                            substring);
                        token.isAssignment = true;
                        token.isUpdate = false;
                        token.isBinary = false;
                        token.level = priorities[substring];
                        this.state.lastToken = token;
                        return token;
                    }
                    if (this.ch == '>') {
                        this.yyChar();
                        if (this.ch == '=') {
                            this.yyChar();
                            let end = this.index;
                            let substring = this.content.substring(start, end);
                            let token = new Token(
                                Operator,
                                start,
                                end,
                                substring);
                            token.isAssignment = true;
                            token.isUpdate = false;
                            token.isBinary = false;
                            token.level = priorities[substring];
                            this.state.lastToken = token;
                            return token;
                        }
                    }
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                } else if (this.ch == "=") {
                    this.yyChar();
                    let end = this.index;
                    let substring = this.content.substring(start, end)
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                this.index = start;
                this.getChar();
            }
            if (
                ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '^' || ch == '%') {
                this.yyChar();
                if (this.ch == '=') {
                    this.yyChar();
                    let end = this.index;
                    let substring = this.content.substring(start, end);
                    let token = new Token(
                        Operator,
                        start,
                        end,
                        substring);
                    token.isAssignment = true;
                    token.isUpdate = false;
                    token.isBinary = false;
                    token.level = priorities[substring];
                    this.state.lastToken = token;
                    return token;
                }
                this.prevChar();
            }

            this.yyChar();
            let end = this.index;
            let substring = this.content.substring(start, end);
            let token = new Token(
                Operator,
                start,
                end,
                substring);
            token.isAssignment = false;
            token.isUpdate = false;
            token.isBinary = true;
            token.level = priorities[substring];
            this.state.lastToken = token;
            return token;
        }

        if (this.isDigit()) {
            let start = this.index;
            if (this.ch == '0') {
                this.yyChar();
                if (this.ch == 'x') {
                    this.yyChar();
                    while (this.isDigit() || this.isHex()) {
                        this.yyChar();
                    }
                    let end = this.index;
                    let token = new Token(
                        Num,
                        start,
                        end,
                        this.content.substring(start, end));
                    this.state.lastToken = token;
                    return token;
                }
                this.prevChar();
            }
            while (this.isDigit()) {
                this.yyChar();
            }
            if (this.ch == '.') {
                this.yyChar();
                while (this.isDigit()) {
                    this.yyChar();
                }
            }
            let end = this.index;
            let token = new Token(
                Num,
                start,
                end,
                this.content.substring(start, end));
            this.state.lastToken = token;
            return token;
        }

        if (this.isIdentifier() && !this.isDigit()) {
            let start = this.index;
            while (this.isIdentifier()) {
                this.yyChar();
            }
            let end = this.index;
            let str = this.content.substring(start, end);
            if (isKeyword(str)) {
                let token = new Token(
                    keywordMap[str],
                    start,
                    end,
                    str);
                token.realType = Keyword
                if (str == "instanceof" || str == "in") {
                    token.isAssignment = false;
                    token.isUpdate = false;
                    token.isBinary = true;
                    token.level = priorities[str];
                }
                this.state.lastToken = token;
                return token;
            }

            if (isSpecial(str)) {
                let token = new Token(
                    Special,
                    start,
                    end,
                    str);
                this.state.lastToken = token;
                return token;
            }

            let token = new Token(
                Id,
                start,
                end,
                str);
            this.state.lastToken = token;
            return token;
        }

        // EOF Token
        return new Token(
            EOF,
            this.index,
            this.index,
            '\u0000');
    }

    getChar() {
        this.ch = this.content[this.index];
        return this.ch;
    }

    yyChar() {
        ++this.index;
        ++this.column;
        if (this.index >= this.end) {
            //++this.column;
            this.ch = null;
        } else {
            this.getChar();
        }
    }

    prevChar() {
        --this.index;
        this.getChar();
    }

    isSpace() {
        return this.ch != null && (this.getChar() == ' ' || this.getChar() == '\t');
    }

    isNewLine() {
        let ch = this.getChar();
        return ch != null && (ch == '\r' || ch == '\n');
    }

    isEOF() {
        return this.index >= this.end
    }

    isNotEOF() {
        return !this.isEOF();
    }

    isLetter() {
        let ch = this.ch;
        return ch != null && ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'));
    }

    isDigit() {
        let ch = this.ch;
        return ch != null && ((ch >= '0') && (ch <= '9'));
    }

    isHex() {
        let ch = this.ch;
        return ch != null && (((ch >= 'a') && (ch <= 'f')) || ((ch >= 'A') && (ch <= 'F')));
    }

    isIdentifier() {
        return this.isNotEOF() && !this.isSpace() && !this.isNewLine() && (!isOperator(this.ch) || this.isDigit()) && this.ch != '"' && this.ch != "'" && this.ch != "`";
    }

}

export {
    Tokenizer
};