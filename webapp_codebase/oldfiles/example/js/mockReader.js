import {decodeGFF, parseAttributeString} from "./gff.js";

class MockReader {

    static sampleMap = new Map();

    static async  init(url) {
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split(/\r?\n/);
        for (let line of lines) {
            if (line.startsWith("#")) continue;
            const tokens = line.split('\t');
            const feature = decodeGFF(tokens, {format: 'gff3'});
            if (feature) {
                const attributes = parseAttributeString(feature.attributeString, '=');
                const sample = attributes["sample"];
                let featureList = MockReader.sampleMap.get(sample);
                if (!featureList) {
                    featureList = [];
                    MockReader.sampleMap.set(sample, featureList);
                }
                featureList.push(feature);
            }
        }
    }

    constructor(sample) {
        this.sample = sample;
    }

    async readFeatures(chr, start, end) {
        return MockReader.sampleMap.get(this.sample);
    }
}

export {MockReader}