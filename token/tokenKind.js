import {
    keywords,
    isKeyword,
    isOperator,
    isSpecial,
    priorities
} from "./collections.js";

class TokenKind {
    constructor(tag) {
        this.tag = tag;
    }
    toString() {
        return `TokenKind(tag=${this.tag})`;
    }
}

class Token {
    constructor(tokenKind, start, end, value) {
        this.tokenKind = tokenKind;
        this.start = start;
        this.end = end;
        if (value != null) {
            this.value = value;
        }
        this.startLine = -1;
        this.startColumn = -1;
        this.endLine = -1;
        this.endColumn = -1;
    }
    setValue(value) {
        this.value = value;
    }
    getValue() {
        return this.value;
    }
    toString() {
        let val = `#${this.value}#`;
        if (this.startLine != -1) {
            val = `#${this.value}#,
            startLine=${this.startLine},
            startColumn=${this.startColumn},
            endLine=${this.endLine},
            endColumn=${this.endColumn}`;
        }
        return `Token(
                    tokenKind=${this.tokenKind.tag},
                    start=${this.start},
                    end=${this.end},
                    value=${val}
                    )`.split("\n").map((it) => it.trim()).join("\n");
    }
}

const EOF = new TokenKind("EOF");
const Comment = new TokenKind("Comment");
const NewLine = new TokenKind("NewLine");
const WhiteSpace = new TokenKind("WhiteSpace");
const Keyword = new TokenKind("Keyword");
const Operator = new TokenKind("Operator");
const Id = new TokenKind("Identifier");
const Special = new TokenKind("Special");
const Num = new TokenKind("Number");
const Regex = new TokenKind("Regexp");
const Str = new TokenKind("String");
const keywordMap = {};
let index = 0;
while (index < keywords.length) {
    let key = keywords[index];
    keywordMap[key] = new TokenKind(key);
    ++index;
}

export {
    TokenKind,
    Token,
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
    Str,
    keywordMap,
    isKeyword,
    isOperator,
    isSpecial,
    priorities
};