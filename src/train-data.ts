import {forestjs} from "./randomforest";

interface ML<A, L> {
    run(xs: A[]): L

    batch_run(xss: A[][]): L[]

    batch_train(xss: A[][], ys: L[])
}

interface ML_Trainer<A, L> {
    generate_sample_set(n: number): [A[][], L[]]
}

interface LogicModel {
    expr: any[];

    expr_run(xs: boolean[]): boolean
}

function genLogicPair(x, y) {
    if (Math.random() < 0.5) {
        return [x, '&&', y]
    } else {
        return [x, '||', y]
    }
}

/* inclusive for min and max */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function genLogicStatement(size) {
    if (size === 1) {
        return ['x1'];
    }
    let n = 2;
    let acc = genLogicPair(1, 2);
    for (; n < size;) {
        n++;
        if (Math.random() < 0.5) {
            acc = genLogicPair(acc, n);
        } else {
            acc = genLogicPair(n, acc);
        }
    }
    return acc;
}

function runLogic(expr: any[] | number, xs: boolean[]): boolean {
    if (typeof expr === "number") {
        return xs[expr - 1];
    }
    let [x, op, y] = expr;
    switch (op) {
        case '&&':
            return runLogic(x, xs) && runLogic(y, xs);
        case '||':
            return runLogic(x, xs) || runLogic(y, xs);
        default:
            console.error({expr});
            throw new Error('unknown op:' + op)
    }
}

function genLogicModel(size: number): LogicModel {
    let expr = genLogicStatement(size);
    return {
        expr,
        expr_run: xs => runLogic(expr, xs)
    }
}

class LogicTrainer implements ML_Trainer<boolean, boolean> {
    model: LogicModel;

    constructor(public size: number) {
        this.model = genLogicModel(size);
    }

    generate_sample_set(n): [boolean[][], boolean[]] {
        let inputs: boolean[][] = [];
        let labels: boolean[] = [];
        for (let i = 0; i < n; i++) {
            let [input, label] = this.generate_train_pair();
            inputs.push(input);
            labels.push(label);
        }
        return [inputs, labels];
    }

    generate_train_pair(): [boolean[], boolean] {
        let xs = [];
        for (let i = 0; i < this.size; i++) {
            xs.push(Math.random() < 0.5);
        }
        let y = this.model.expr_run(xs);
        return [xs, y];
    }
}

function main() {
    let N = 100;
    let M = 20;
    let trainer = new LogicTrainer(M);
    let [data, labels] = trainer.generate_sample_set(N);
    let training_set: number[] = [];
    let used: boolean[] = [];
    for (let i = 0; i < N; i++) {
        let idx = randomInt(0, N - 1);
        used[idx] = true;
        training_set.push(idx);
    }
    let testing_set = [];
    for (let i = 0; i < N; i++) {
        if (used[i] === true) {
            continue;
        }
        testing_set.push(i)
    }

    let training_data: boolean[][] = [];
    let training_labels: boolean[] = [];
    for (let idx of training_set) {
        training_data.push(data[idx]);
        training_labels.push(labels[idx]);
    }

    let testing_data: boolean[][] = [];
    let testing_labels: boolean[] = [];
    for (let idx of testing_set) {
        testing_data.push(data[idx]);
        testing_labels.push(labels[idx]);
    }

    let forest = new forestjs.RandomForest();

    forest.train(training_data, training_labels);
    let test_results = forest.predict(testing_data);
    console.log({test_results: test_results.map((prob, i) => ({prob, ans: testing_labels[i]}))});
}

main();
