class MapMap<K, V> {
    constructor(private map = new Map()) {
    }

    get(ks: K[]): V {
        let acc = this.map;
        for (let k of ks) {
            acc = acc.get(k) as any;
        }
        return acc as any;
    }

    set(ks: K[], v: V) {
        let acc = this.map;
        for (let i = 0; i < ks.length - 1; i++) {
            let k = ks[i];
            if (!acc.has(k)) {
                acc.set(k, new Map());
            }
            acc = acc.get(k);
        }
        acc.set(ks[ks.length - 1], v);
    }
}

class DecisionTable<A> {
    constructor(public featureIdxs: number[]) {
    }

    predict<A>(xs: A[]): true | false | DecisionTree<A> {

    }
}

class DecisionTree<A> {
    predict(xs: A[]): boolean {

    }
}

function gen_range(min: number, max: number): number[] {
    let res: number[] = [];
    for (let i = min; i <= max; i++) {
        res.push(i);
    }
    return res;
}

function random_int(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * @param source    to be updated inplace
 * @param m         number of element to be selected
 * */
function random_select<A>(source: A[], m: number): A[] {
    let selected: A[] = [];
    for (let i = 0; i < m; i++) {
        let idx = random_int(0, source.length - 1);
        let [x] = source.splice(idx, 1);
        selected.push(x);
    }
    return selected;
}

class RandomForest<X, L> {
    trees: DecisionTree<X>[];

    constructor(public nTree: number, public mFeature: number) {
    };

    train(xss: X[][], labels: L[], train_idxs: number[], test_idxs: number[]) {
        this.trees = new Array(this.nTree);
        for (let n = 0; n < this.nTree; n++) {
            let tree: DecisionTree<X> =;
            let feature_idx_pool = gen_range(0, xss[0].length);
            let selected_feature_idxs = random_select(feature_idx_pool, this.mFeature);

            /*
            * https://www.youtube.com/watch?v=7VeUPuFGJHk
            *
            * gini impurity = 1 - (prob label a)^2 - (prob label b)^2
            * weighted gini impurity = gini impurity * population of leaf / total population
            *
            * for each feature's leaf nodes, find the sum of all weighted gini impurity
            *
            * select feature of lowest impurity
            * */
            // https://www.youtube.com/watch?v=7VeUPuFGJHk

            for (let i = 0; i < train_idxs.length; i++) {
                let idx = train_idxs[i];
                let xs = xss[idx];
                let label = labels[idx];

            }
            this.trees.push(tree);
        }
    }

    batchPredict() {
    }

    predict(x) {
    }
}

function select_idx_for_training(n: number): [number[], number[]] {
    let used: { [k: number]: boolean } = {};
    let train: number[] = new Array(n);
    let test: number[] = [];
    for (let i = 0; i < n; i++) {
        let x = Math.round(Math.random() * (n - 1));
        used[x] = true;
        train[i] = x;
    }
    for (let i = 0; i < n; i++) {
        if (!used[i]) {
            test.push(i);
        }
    }
    return [train, test];
}