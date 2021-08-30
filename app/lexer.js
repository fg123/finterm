const TOKEN_NUMBER       = "TOKEN_NUMBER";
const TOKEN_PLUS         = "TOKEN_PLUS";
const TOKEN_MINUS        = "TOKEN_MINUS";
const TOKEN_STAR         = "TOKEN_STAR";
const TOKEN_SLASH        = "TOKEN_SLASH";
const TOKEN_LPAREN       = "TOKEN_LPAREN";
const TOKEN_RPAREN       = "TOKEN_RPAREN";
const TOKEN_PERCENT      = "TOKEN_PERCENT"; // unused
const TOKEN_CARET        = "TOKEN_CARET";
const TOKEN_EQUAL        = "TOKEN_EQUAL";
const TOKEN_IDENTIFIER   = "TOKEN_IDENTIFIER";

class Token {
    constructor (type, value) {
        this.type = type;
        this.value = value;
    }

    ToString() {
        return `(${this.type}) "${this.value}"`;
    }
};

function IsAlpha(char) {
    return char == '_' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
}

function IsDigit(char) {
    return char >= '0' && char <= '9';
}

function IsAlNum(char) {
    return IsAlpha(char) || IsDigit(char);
}

class Lexer {
    constructor(line) {
        this.line = line;
        this.ptr = 0;
        this.tokens = [];
    }

    AddToken(type, value) {
        this.tokens.push(new Token(type, value));
    }

    ProcessNumber() {
        const start = this.ptr;
        while (this.ptr < this.line.length) {
            if (!IsDigit(this.line[this.ptr])) {
                break;
            }
            this.ptr++;
        }
        if (this.ptr < this.line.length && this.line[this.ptr] === '.') {
            // Decimal, keep going
            this.ptr++;
            while (this.ptr < this.line.length) {
                if (!IsDigit(this.line[this.ptr])) {
                    break;
                }
                this.ptr++;
            }
        }  

        let value = parseFloat(this.line.substr(start, this.ptr - start));
        if (this.ptr < this.line.length && this.line[this.ptr] === '%') {
            this.ptr++;
            value /= 100;
        }

        this.AddToken(TOKEN_NUMBER, value);
        this.ptr--;
    }

    ProcessIdentifier() {
        const start = this.ptr;
        this.ptr++;
        while (this.ptr < this.line.length) {
            if (!IsAlNum(this.line[this.ptr])) {
                break;
            }
            this.ptr++;
        }
        this.AddToken(TOKEN_IDENTIFIER, this.line.substr(start, this.ptr - start));
        this.ptr--;
    }

    Lex() {
        while (this.ptr < this.line.length) {
            // console.log(this.ptr);
            const char = this.line[this.ptr];
                 if (char === "+") this.AddToken(TOKEN_PLUS, char);
            else if (char === "-") this.AddToken(TOKEN_MINUS, char);
            else if (char === "*") this.AddToken(TOKEN_STAR, char);
            else if (char === "/") this.AddToken(TOKEN_SLASH, char);
            else if (char === "(") this.AddToken(TOKEN_LPAREN, char);
            else if (char === ")") this.AddToken(TOKEN_RPAREN, char);
            else if (char === "=") this.AddToken(TOKEN_EQUAL, char);
            else if (char === "^") this.AddToken(TOKEN_CARET, char);
            else if (IsDigit(char)) {
                // Process Number
                this.ProcessNumber();
            }
            else if (char.trim() === '') {
                // Whitespace
            }
            else if (IsAlpha(char)) {
                // Identifier
                this.ProcessIdentifier();
            }
            else {
                throw "Invalid character " + char + " at position " + this.ptr;
            }
            this.ptr += 1;
        }
        return this.tokens;
    }
};
