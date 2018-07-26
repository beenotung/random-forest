import {evaluate_logic_expression, gen_logic_expression} from '../src/logic-expression';
import {RandomForest, select_idx_for_training} from '../src/random-forest';

let N_data = 1000;
let M_dimension = 10;

let n_tree = 100;
let m_feature = Math.round(Math.sqrt(M_dimension));

let expr = gen_logic_expression(M_dimension);

let dataset: boolean[][] = new Array(N_data);
let labels: boolean[] = new Array(N_data);
for (let i = 0; i < N_data; i++) {
    let data: boolean[] = new Array(M_dimension);
    for (let i = 0; i < M_dimension; i++) {
        data[i] = Math.random() < 0.5;
    }
    dataset[i] = data;
    labels[i] = evaluate_logic_expression(expr, data);
}

let [training_idxs, testing_idxs] = select_idx_for_training(N_data);

let forest = new RandomForest(n_tree, m_feature);

forest.train(dataset, labels, training_idxs, testing_idxs);

let n_correct = 0;
let n_wrong = 0;
let prob_sum = 0;
for (let idx of testing_idxs) {
    let [label, prob] = forest.predict(dataset[idx]);
    prob_sum += prob;
    if (labels[idx] === label) {
        n_correct++;
    } else {
        n_wrong++;
    }
}
console.log({
    n_training: training_idxs.length,
    n_testing: testing_idxs.length,
    avg_confident_in_test: prob_sum / testing_idxs.length,
    n_correct,
    n_wrong,
    prob_correct: n_correct / (n_correct + n_wrong),
    prob_wrong: n_wrong / (n_correct + n_wrong),
    n_tree,
    M_dimension,
    m_feature_group_size: m_feature,
});