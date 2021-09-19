/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Broad Institute
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {StringUtils} from "igv-utils/src";


/**
 *  Define parser for seg files  (.bed, .gff, .vcf, etc).  A parser should implement 2 methods
 *
 *     parseHeader(data) - return an object representing a header.  Details are format specific
 *
 *     parseFeatures(data) - return a list of features
 *
 */


class SegParser {

    constructor(type) {
        this.type = type || 'seg';   // One of seg, mut, or maf'
        switch (this.type) {
            case 'mut':
                this.sampleColumn = 3;
                this.chrColumn = 0;
                this.startColumn = 1;
                this.endColumn = 2;
                this.dataColumn = 4; // type
                this.valueColumn = 5; // gene
                this.noteColumn = 6;
                break;
            case 'maf':
                this.sampleColumn = 15;
                this.chrColumn = 4;
                this.startColumn = 5;
                this.endColumn = 6;
                this.dataColumn = 8;
                break;
            default:
                this.sampleColumn = 0;
                this.chrColumn = 1;
                this.startColumn = 2;
                this.endColumn = 3;
            // Data column determined after reading header
        }
    }

    async parseHeader(dataWrapper) {
        let line;
        while ((line = await dataWrapper.nextLine()) !== undefined) {
            if (line.startsWith("#")) {
                // skip
            } else {
                const tokens = line.split("\t");
                this.header = {headings: tokens};
                break;
            }
        }
        return this.header;
    }

    async parseFeatures(dataWrapper) {

        const allFeatures = [];
        let extraHeaders;
        if (!this.header) {
            this.header = await this.parseHeader(dataWrapper);  // This will only work for non-indexed files

        }
        if ('seg' === this.type) {
            this.dataColumn = this.header.headings.length - 1;
        }
        if (this.header.headings.length > 7) {
            extraHeaders = this.extractExtraColumns(this.header.headings);
        }

        let line;
        while ((line = await dataWrapper.nextLine()) !== undefined) {
            const temp_tokens = line.split("\t");
            // const value = ('seg' === this.type) ? parseFloat(tokens[this.dataColumn]) : tokens[this.dataColumn];
            // handle potential errors in \t seperated values
            const tokens = []
            for (let i = 0; i < temp_tokens.length; i++) {
                if (temp_tokens[i] !== "") {
                    tokens.push(temp_tokens[i]);
                }
            }
            if (tokens.length != 0) {
                const feature = new SegFeature({
                    sample: tokens[this.sampleColumn],
                    chr: tokens[this.chrColumn],
                    start: parseInt(tokens[this.startColumn]),
                    end: parseInt(tokens[this.endColumn]),
                    type: tokens[this.dataColumn],
                    gene: tokens[this.valueColumn],
                    notes: tokens[this.noteColumn],
                })
                feature.setHeader(this.header)
                if (extraHeaders) {
                    const extraValues = this.extractExtraColumns(tokens);
                    feature.setAttributes({names: extraHeaders, values: extraValues});
                }
                allFeatures.push(feature);
            }
        }
        return allFeatures;
    }

    extractExtraColumns(tokens) {
        const extras = []
        for (let i = 0; i < tokens.length; i++) {
            if (i !== this.chrColumn && i !== this.startColumn && i !== this.endColumn) {
                extras.push(tokens[i]);
            }
        }
        return extras;
    }

}

class SegFeature {

    constructor({sample, chr, start, end, type, gene, notes}) {
        this.sample = sample;
        this.chr = chr;
        this.start = start;
        this.end = end;
        this.type = type;
        this.gene = gene;
        this.notes = notes;
    }

    setHeader(headers) {
        this.headers = headers
    }
 
    setAttributes({names, values}) {
        this.attributeNames = names;
        this.attributeValues = values;
    }

    getAttribute(name) {
        if (this.attributeNames) {
            const idx = this.attributeNames.indexOf(name);
            if (idx >= 0) {
                return this.attributeValues[idx];
            }
        }
        return undefined;
    }

    popupData() {
        console.warn(this.header)
        const locationString = (this.chr + ":" +
            StringUtils.numberFormatter(this.start + 1) + "-" +
            StringUtils.numberFormatter(this.end));
        /*
        const pd = [
            {name: "Sample", value: this.sample},
            {name: "Location", value: locationString},
            {name: "Nucleotide", value: this.gene},
            {name: "Type", value: this.type},
            {name: "Quality Value", value: this.notes}
        ];
        */
        const temp = [this.chr, this.start, this.end, this.sample, this.gene, this.type, this.notes];
        const pd = []
        console.warn("created temp:" + temp);
        for (let i = 0; i < this.headers.headings.length; i++) {
            pd.push({name: this.headers.headings[i], value: temp[i]});
        }
        console.warn("loading extra");
        if (this.attributeNames && this.attributeNames.length > 0) {
            pd.push("<hr/>")
            for (let i = 0; i < this.attributeNames.length; i++) {
                pd.push({name: this.attributeNames[i], value: this.attributeValues[i]});
            }
            pd.push("<hr/>");  // In case there are multiple features selected
        }
        return pd;
    }
}

export default SegParser;