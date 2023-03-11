const keywords = [
    "var",
    "let",
    "const",
    "if",
    "else",
    "switch",
    "case",
    "default",
    "for",
    "while",
    "do",
    "break",
    "continue",
    "function",
    "return",
    "yield",
    "await",
    "throw",
    "try",
    "catch",
    "finally",
    "this",
    "with",
    "in",
    "of",
    "delete",
    "instanceof",
    "typeof",
    "new",
    "class",
    "extends",
    "import",
    "as",
    "from",
    "export",
    "void",
    "debugger"
];

const operators = [
    '+',
    '-',
    '*',
    '/',
    '!',
    '%',
    '^',
    '&',
    '?',
    ':',
    '~',
    '.',
    ',',
    ';',
    '=',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    '|',
    '<',
    '>'
];

const priorities = {
    '.': 18,
    '!': 15,
    '~': 15,
    '*': 13,
    '/': 13,
    '%': 13,
    '+': 12,
    '-': 12,
    '<<': 11,
    '>>': 11,
    '>>>': 11,
    '<': 10,
    '>': 10,
    '<=': 10,
    '>=': 10,
    'instanceof': 10,
    'in': 10,
    '==': 9,
    '!=': 9,
    '===': 9,
    '!==': 9,
    '&': 8,
    '^': 7,
    '|': 6,
    '&&': 5,
    '||': 4,
    '?': 3,
    ',': 1
};

const specials = [
    "false",
    "true",
    "null"
];

function isKeyword(str) {
    return keywords.indexOf(str) >= 0;
}

function isOperator(ch) {
    return operators.indexOf(ch) >= 0;
}

function isSpecial(str) {
    return specials.indexOf(str) >= 0;
}

export {
    keywords,
    isKeyword,
    operators,
    isOperator,
    specials,
    isSpecial,
    priorities
};