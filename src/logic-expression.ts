export type logic_op = '&&' | '||';
export type logic_expression = number | [any, logic_op, any] ;

export function gen_logic_expression(size: number): logic_expression {
    if (size === 1) {
        return 1;
    }
    let acc: logic_expression = 1;
    for (let n = 1; n < size; n++) {
        let op: logic_op = Math.random() < 0.5 ? '&&' : '||';
        if (Math.random() < 0.5) {
            acc = [acc, op, n];
        } else {
            acc = [n, op, acc];
        }
    }
    return acc;
}

export function evaluate_logic_expression(expr: logic_expression, xs: boolean[]): boolean {
    if (typeof expr === 'number') {
        return xs[expr];
    }
    let [x, op, y] = expr;
    return op === '&&'
        ? evaluate_logic_expression(x, xs) && evaluate_logic_expression(y, xs)
        : evaluate_logic_expression(x, xs) || evaluate_logic_expression(y, xs)
        ;
}