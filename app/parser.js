
class ASTNode {
    constructor() {
    }
};

class CountState {
    constructor() {
        this.unknownMap = {};
        this.knownMap = {};
    }
};
// Number
class LiteralNode extends ASTNode {
    constructor(value) {
        super();
        if (typeof value === 'number') {
            value = new Decimal(value);
        }
        this.value = value;
    }

    ToString() {
        return `${this.value}`;
    }

    Evaluate(state) {
        return this.value;
    }

    CountUnknown(state, countState) {
        return 0;
    }
};

// Identifier
class IdentifierNode extends ASTNode {
    constructor(id) {
        super();
        this.id = id;
    }

    ToString() {
        return this.id;
    }

    Evaluate(state) {
        if (state.GetVar(this.id) === undefined) {
            throw "Variable " + this.id + " not defined!";
        }
        console.debug(state.GetVar(this.id));
        return state.GetVar(this.id);
    }

    CountUnknown(state, countState) {
        if (state.GetVar(this.id) === undefined) {
            if (countState.unknownMap[this.id] === undefined) {
                countState.unknownMap[this.id] = 1;
            }
            else {
                countState.unknownMap[this.id]++;
            }
        }
        else {
            if (countState.knownMap[this.id] === undefined) {
                countState.knownMap[this.id] = 1;
            }
            else {
                countState.knownMap[this.id]++;
            }
        }
    }
};

class NegateNode extends ASTNode {
    constructor(sub) {
        super();
        this.sub = sub;
    }

    ToString() {
        return `(-${this.sub.ToString()})`;
    }

    Evaluate(state) {
        return this.sub.Evaluate(state).negated();
    }

    CountUnknown(state, countState) {
        this.sub.CountUnknown(state, countState);
    }
};

class BinOpNode extends ASTNode {
    constructor(lhs, rhs) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
    }
    CountUnknown(state, countState) {
        this.lhs.CountUnknown(state, countState);
        this.rhs.CountUnknown(state, countState);
    }
};

class AddNode extends BinOpNode {
    constructor(lhs, rhs) {
        super(lhs, rhs);
    }
    ToString() {
        return `(${this.lhs.ToString()} + ${this.rhs.ToString()})`;
    }

    Evaluate(state) {
        const left = this.lhs.Evaluate(state);
        const right = this.rhs.Evaluate(state);
        // console.log(left, right);
        return left.plus(right);
    }
};

class SubtractNode extends BinOpNode {
    constructor(lhs, rhs) {
        super(lhs, rhs);
    }
    ToString() {
        return `(${this.lhs.ToString()} - ${this.rhs.ToString()})`;
    }

    Evaluate(state) {
        const left = this.lhs.Evaluate(state);
        const right = this.rhs.Evaluate(state);
        // console.log(left, right);
        return left.minus(right);
    }
};

class MultiplyNode extends BinOpNode {
    constructor(lhs, rhs) {
        super(lhs, rhs);
    }
    ToString() {
        return `(${this.lhs.ToString()} * ${this.rhs.ToString()})`;
    }

    Evaluate(state) {
        const left = this.lhs.Evaluate(state);
        const right = this.rhs.Evaluate(state);
        // console.log(left, right);
        return left.times(right);
    }
};

class DivideNode extends BinOpNode {
    constructor(lhs, rhs) {
        super(lhs, rhs);
    }
    ToString() {
        return `(${this.lhs.ToString()} / ${this.rhs.ToString()})`;
    }

    Evaluate(state) {
        const left = this.lhs.Evaluate(state);
        const right = this.rhs.Evaluate(state);
        // console.log(left, right);
        return left.div(right);
    }
};

class PowerNode extends BinOpNode {
    constructor(lhs, rhs) {
        super(lhs, rhs);
    }
    ToString() {
        return `(${this.lhs.ToString()} ^ ${this.rhs.ToString()})`;
    }

    Evaluate(state) {
        const left = this.lhs.Evaluate(state);
        const right = this.rhs.Evaluate(state);
        // console.log(left, right);
        return this.lhs.Evaluate(state).pow(this.rhs.Evaluate(state));
    }
};

class EqualNode extends BinOpNode {
    constructor(lhs, rhs) {
        super(lhs, rhs);
    }

    ToString() {
        return `(${this.lhs.ToString()} = ${this.rhs.ToString()})`;
    }

    DerivativeLHS(state, variable, x) {
        // state.varMap[variable] = x;
        // const center = this.lhs.Evaluate(state);
        state.SetVariable(variable, x.minus(0.000005));
        const left = this.lhs.Evaluate(state);
        state.SetVariable(variable, x.plus(0.000005));
        const right = this.lhs.Evaluate(state);
        const answer = right.minus(left).div(0.00001);
        return answer;
    }

    Evaluate(state) {
        this.lhs = new SubtractNode(this.lhs, this.rhs);
        this.rhs = new LiteralNode(new Decimal(0));

        const countState = new CountState();
        this.CountUnknown(state, countState);
        console.log(countState);
        const unknownKeys = Object.keys(countState.unknownMap);
        const knownKeys = Object.keys(countState.knownMap);
        // First we check the count states 
        // If we have more than one unknown, we can't decide
        if (unknownKeys.length > 1) {
            throw "Too many unknowns to solve...";
        }
        if (unknownKeys.length === 0 && knownKeys.length > 1) {
            throw "Multiple known variables, ambiguity as to which to solve...";
        }
        if (unknownKeys.length === 0 && knownKeys.length === 0) {
            throw "No variables, this is not an equality check!";
        }
        const unknown = unknownKeys.length > 0 ? unknownKeys[0] : knownKeys[0];
      
        // Newtons Method
        const guesses = [];
        const errors = [];
        try {
            for (let i = 0; i < 3; i++) {
                // Try a bunch of poinst
                try {
                    const bNum = new Decimal(i);
                    state.SetVariable(unknown, bNum);
                    const result = this.lhs.Evaluate(state);
                    if (result.isNaN() || !result.isFinite()) {
                        throw "Nan Guess";
                    }
                    guesses.push(bNum);
                }    
                catch (e) {
                    errors.push(e);
                }
                if (guesses.length > 0) break;
            }
            if (guesses.length === 0) {
                throw "Could not find a valid starting point! Errors are below:\n" + errors.join("\n");
            }
            let guess = guesses[0];
            console.log("Starting guess on ", guess.toString());
            for (let i = 0; ; i++) {
                if (i > 300) throw "Exceeded 300 iterations of Newtons!";
                state.SetVariable(unknown, guess);
                const result = this.lhs.Evaluate(state);
                if (result.abs().lessThan("0.0000001")) {
                    // console.warn(result.abs().toString());
                    // console.warn(result.abs().compare("0.000000001"));
                    break;
                }
                const derivative = this.DerivativeLHS(state, unknown, guess);
                // console.log(result, derivative);
                guess = guess.minus(result.div(derivative));
                console.log(result.toString());
            }
            delete state.varMap[unknown];
            const result = {};
            result[unknown] = guess;
            return result;
        }
        catch (e) {
            delete state.varMap[unknown];
            throw e;
        }
    }
};

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.ptr = 0;
    }

    Match(tokenType) {
        if (this.ptr < this.tokens.length) {
            if (this.tokens[this.ptr].type === tokenType) {
                this.ptr++;
                return true;
            }
        }
        return false;
    }

    ParsePrimary() {
        if (this.Match(TOKEN_NUMBER)) {
            return new LiteralNode(new Decimal(this.tokens[this.ptr - 1].value));
        }
        else if (this.Match(TOKEN_IDENTIFIER)) {
            return new IdentifierNode(this.tokens[this.ptr - 1].value);
        }
        else if (this.Match(TOKEN_LPAREN)) {
            let left = this.ParseAdditive();
            if (!this.Match(TOKEN_RPAREN)) {
                throw "Expected right parentheses";
            }
            return left;
        }
        else {
            throw "Unexpected primary token!" + this.tokens[this.ptr].ToString();
        }
    }

    ParseUnary() {
        while (this.Match(TOKEN_MINUS)) {
            let left = this.ParsePrimary();
            return new NegateNode(left);
        }
        return this.ParsePrimary();
    }
    
    ParsePower() {
        let left = this.ParseUnary();
        while (this.Match(TOKEN_CARET)) {
            let right = this.ParsePower();
            left = new PowerNode(left, right);
        }
        return left;
    }

    ParseMultiplicative() {
        let left = this.ParsePower();
        while (this.Match(TOKEN_STAR) || this.Match(TOKEN_SLASH)) {
            if (this.tokens[this.ptr - 1].type === TOKEN_STAR) {
                let right = this.ParsePower();
                left = new MultiplyNode(left, right);
            }
            else {
                let right = this.ParsePower();
                left = new DivideNode(left, right);
            }
        }
        return left;
    }

    ParseAdditive() {
        let left = this.ParseMultiplicative();
        while (this.Match(TOKEN_PLUS) || this.Match(TOKEN_MINUS)) {
            if (this.tokens[this.ptr - 1].type === TOKEN_PLUS) {
                let right = this.ParseMultiplicative();
                left = new AddNode(left, right);
            }
            else {
                let right = this.ParseMultiplicative();
                left = new SubtractNode(left, right);
            }
        }
        return left;
    }

    ParseEqual() {
        let left = this.ParseAdditive();
        if (this.Match(TOKEN_EQUAL)) {
            let right = this.ParseAdditive();
            left = new EqualNode(left, right);
        }
        return left;
    }

    Parse() {
        const result = this.ParseEqual();
        if (this.ptr < this.tokens.length) {
            throw "Unexpected token " + this.tokens[this.ptr].ToString() + " at " + this.ptr;
        }
        return result;
    }
}