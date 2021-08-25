

class State {
    constructor() {
        this.varMap = {};
    }
    SetVariable(variable, num) {
        if (typeof num === 'number') {
            num = new Decimal(num);
        }
        this.varMap[variable] = num;
    }

    Evaluate(line) {
        const output = [];
        try {
            const tokens = new Lexer(line).Lex();
            const ast = new Parser(tokens).Parse();
            output.push(`Evaluating: ${ast.ToString()}`);
            const result = ast.Evaluate(this);
            if (result instanceof Decimal) {
                output.push(`Result: ${result.toFixed()}`);
            }
            else {
                Object.keys(result).forEach(k => {
                    // console.log(result[k]);
                    output.push(`${k}: ${result[k].toFixed()}`);
                    this.SetVariable(k, result[k]);
                });
            }
        } catch (e) {
            output.push(`Error: ${e}`);
            console.error(e);
        }
        return output;
    }

    GetVar (variable) {
        return this.varMap[variable];
    }
};