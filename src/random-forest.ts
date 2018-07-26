function compare<A>(a: A, b: A): 1 | 0 | -1 {
    return a > b ? 1 : (a < b ? -1 : 0);
}

type mapmap<K, V> = Map<K, Map<K, V> | V>;

function mapmap_lastmap<K, V>(map: Map<K, Map<K, V> | V>, ks: K[]): Map<K, V> {
    let acc = map;
    for (let i = 0; i < ks.length - 1; i++) {
        let k = ks[i];
        if (acc.has(k)) {
            acc = acc.get(k) as Map<K, V>;
        } else {
            let map = new Map();
            acc.set(k, map);
            acc = map;
        }
    }
    return acc as Map<K, V>;
}

function inc_mapmap<K>(mapmap: mapmap<K, number>, ks: K[]): number {
    let map = mapmap_lastmap(mapmap, ks);
    let k = ks[ks.length - 1];
    let count = 1;
    if (map.has(k)) {
        count += map.get(k);
    }
    map.set(k, count);
    return count;
}

function mapmap_set<K, V>(map: Map<K, Map<K, V> | V>, ks: K[], v: V) {
    mapmap_lastmap(map, ks).set(ks[ks.length - 1], v);
}

function mapmap_get<K, V>(map: Map<K, Map<K, V> | V>, ks: K[]): V {
    return mapmap_lastmap(map, ks).get(ks[ks.length - 1]);
}

class TreeNode<X, L> {
    constructor(public featureIdx: number, public mapping: Map<X, L | TreeNode<X, L>>) {
    }

    predict(xs: X[]): TreeNode<X, L> | L {
        return this.mapping.get(xs[this.featureIdx]);
    }
}

class DecisionTree<X, L> {
    constructor(public rootNode: TreeNode<X, L>) {
    }

    predict(xs: X[]): L {
        let res = this.rootNode.predict(xs);
        for (; ;) {
            if (res instanceof TreeNode) {
                res = res.predict(xs);
            } else {
                return res;
            }
        }
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
    // FIXME what if source is not sufficient?
    for (let i = 0; i < m && source.length > 0; i++) {
        let idx = random_int(0, source.length - 1);
        let [x] = source.splice(idx, 1);
        selected.push(x);
    }
    return selected;
}

/**
 * feature idx -> feature value -> label -> count
 * */
type decision_count<X, L> = Map<number, Map<X, Map<L, number>>>

function cloneArray<A>(xs: A[]): A[] {
    return xs.slice();
    // return xs.map(x => x);
}

/**
 * @apiNote
 * assert xss.length === labels.length
 *
 * @reference
 * https://www.youtube.com/watch?v=7VeUPuFGJHk
 *
 * @logic
 * gini impurity = 1 - (prob label a)^2 - (prob label b)^2
 * weighted gini impurity = gini impurity * population of leaf / total population
 *
 * for each feature's leaf nodes, find the sum of all weighted gini impurity
 *
 * select feature of lowest impurity
 * */
function buildTreeNode<X, L>(xss: [][], labels: L[], training_idxs: number[], feature_idx_pool: number[], m_feature: number): TreeNode<X, L> {
    if (feature_idx_pool.length < 1) {
        throw new Error('expect at least one feature in the pool');
    }
    feature_idx_pool = cloneArray(feature_idx_pool);
    let n = labels.length;
    let selected_feature_idxs = random_select(feature_idx_pool, m_feature);
    let feature_label_counts: decision_count<X, L> = new Map();
    for (let i = 0; i < n; i++) {
        let data_idx = training_idxs[i];
        let xs = xss[data_idx];
        let label = labels[data_idx];
        for (let feature_idx of selected_feature_idxs) {
            let feature_value = xs[feature_idx];
            inc_mapmap(feature_label_counts as mapmap<any, any>, [feature_idx, feature_value, label]);
        }
    }
    /**
     * Array<[feature idx, impurity]>
     * */
    let featureidx_featurevalue_impurity;
    let feature_impurity_list: Array<[number, number]> = [];
    let featureIdx_weightedImpurities: Array<[number, number]> = [];
    for (let feature_idx of selected_feature_idxs) {
        let label_counts = feature_label_counts.get(feature_idx);
        let total_population = 0;
        /**
         * feature value -> [impurity, leaf population]
         * */
        let feature_impurity: Map<X, [number, number]> = new Map();
        label_counts.forEach((label_count, feature) => {
            let leaf_population = 0;
            label_count.forEach((count, label) => {
                leaf_population += count;
            });
            total_population += leaf_population;
            let impurity = 1;
            label_count.forEach((count, label) => {
                let prob = count / leaf_population;
                impurity -= prob * prob;
            });
            feature_impurity.set(feature, [impurity, leaf_population]);
        });
        let weighted_impurity = 0;
        feature_impurity.forEach(([impurity, leaf_population], feature) => {
            weighted_impurity += impurity * leaf_population / total_population;
        });
        featureIdx_weightedImpurities.push([feature_idx, weighted_impurity]);
    }

    featureIdx_weightedImpurities.sort((a, b) => compare(a[1], b[1]));
    let [selected_feature_idx, weighted_impurity] = featureIdx_weightedImpurities[0];

    /* add back other features to the pool */
    for (let idx of selected_feature_idxs) {
        if (idx !== selected_feature_idx) {
            feature_idx_pool.push(idx);
        }
    }

    let mapping: Map<X, L | TreeNode<X, L>> = new Map();
    feature_label_counts.get(selected_feature_idx).forEach((label_count, feature) => {
        if (label_count.size > 1) {
            /* not sure */
            let child = buildTreeNode<X, L>(xss, labels, training_idxs, feature_idx_pool, m_feature);
            mapping.set(feature, child);
        } else {
            /* sure, should be only 1 label */
            label_count.forEach((count, label) => {
                mapping.set(feature, label);
            });
        }
    });
    return new TreeNode<X, L>(selected_feature_idx, mapping);
}

class RandomForest<X, L> {
    trees: DecisionTree<X, L>[];

    constructor(public nTree: number, public mFeature: number) {
    };

    train(xss: X[][], labels: L[], train_idxs: number[], test_idxs: number[]) {
        this.trees = new Array(this.nTree);
        for (let n = 0; n < this.nTree; n++) {
            let tree: DecisionTree<X> =;
            let feature_idx_pool = gen_range(0, xss[0].length);
            let selected_feature_idxs = random_select(feature_idx_pool, this.mFeature);

            let decision_count: decision_count<X, L> = new Map();

            let features = new Set<X>();
            for (let i = 0; i < train_idxs.length; i++) {
                let idx = train_idxs[i];
                let xs = xss[idx];
                let label = labels[idx];
                for (let j = 0; j < selected_feature_idxs.length; j++) {
                    let feature_idx = selected_feature_idxs[j];
                    let feature_value: X = xs[feature_idx];
                    features.add(feature_value);
                    inc_feature_label(decision_count, feature_value, label);
                }
            }
            /**
             * feature -> [population of leaf, gini impurity]
             * */
            let gini_impurity = new Map<X, [number, number]>();
            let total_population = 0;
            features.forEach(feature => {
                let impurity = 1;
                let leaf_population = 0;
                decision_count.get(feature).forEach((count, label) => {
                    leaf_population += count;
                });
                total_population += leaf_population;
                decision_count.get(feature).forEach((count, label) => {
                    let prob = count / leaf_population;
                    impurity -= prob * prob;
                });
                gini_impurity.set(feature, [leaf_population, impurity]);
            });
            /**
             * weight the gini impurity
             * Array<[feature, impurity]>
             * */
            let weighted_gini_impurity: Array<[X, number]> = [];
            gini_impurity.forEach(([leaf_population, impurity], feature) => {
                let weighted_impurity = impurity * leaf_population / total_population;
                weighted_gini_impurity.push([feature, weighted_impurity]);
            });
            weighted_gini_impurity.sort((a, b) => compare(a[1], b[1]));
            let best_feature = weighted_gini_impurity[0][0];

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