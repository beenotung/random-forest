import * as IrisDataset from 'ml-dataset-iris';
import {RandomForestClassifier as RFClassifier} from 'ml-random-forest';

var trainingSet = IrisDataset.getNumbers();
var predictions = IrisDataset.getClasses().map((elem) =>
    IrisDataset.getDistinctClasses().indexOf(elem)
);

var options = {
    seed: 3,
    maxFeatures: 0.8,
    replacement: true,
    nEstimators: 200
};

var classifier = new RFClassifier(options);
classifier.train(trainingSet, predictions);
var result = classifier.predict(trainingSet);

let score = 0;
for (let i = 0; i < result.length; i++) {
    if (result[i] == predictions[i]) {
        score++;
    }
}
console.log(
    {
        rate: score / result.length,
        score,
        total: result.length,
    }
);