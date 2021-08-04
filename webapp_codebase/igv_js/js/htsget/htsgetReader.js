/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
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

import {igvxhr} from "igv-utils/src";
import {buildOptions} from "../util/igvUtils.js";

class HtsgetReader {

    constructor(config, genome) {
        this.config = config;
        this.genome = genome;
        this.format = config.format ? config.format.toUpperCase() : "BAM";    // Backward compatibility
        if (!(this.format === "BAM" || this.format === "VCF")) {
            throw  Error(`htsget format ${config.format} is not supported`);
        }
    }

    async readHeader() {
        let endpointURL = this.config.url + (this.config.endpoint ? this.config.endpoint : "");
        const url = `${endpointURL}${this.config.id}?class=header`;
        const ticket = await igvxhr.loadJson(url, buildOptions(this.config));
        return await this.loadUrls(ticket.htsget.urls);
    }

    async readData(chr, start, end) {
        let endpointURL = this.config.url + (this.config.endpoint ? this.config.endpoint : "");
        const url = `${endpointURL}${this.config.id}?format=${this.format}&referenceName=${chr}&start=${start}&end=${end}`;
        const ticket = await igvxhr.loadJson(url, buildOptions(this.config));
        return this.loadUrls(ticket.htsget.urls);
    }

    async loadUrls(urls) {

        const promiseArray = [];
        for (let urlData of urls) {

            if (urlData.url.startsWith('data:')) {
                // this is a data-uri
                promiseArray.push(Promise.resolve(dataUriToBytes(urlData.url)));

            } else {

                const options = buildOptions(this.config || {});

                if (urlData.headers) {
                    options.headers = Object.assign(options.headers || {}, urlData.headers);
                }

                promiseArray.push(igvxhr.loadArrayBuffer(urlData.url, options));
            }
        }
        const arrayBuffers = await Promise.all(promiseArray);
        return concatArrays(arrayBuffers);
    }
}

/**
 * Concatenate a list of array buffers, returning an UInt8Array
 * @param arrayBuffers
 */
function concatArrays(arrayBuffers) {

    let len = 0;
    for (let a of arrayBuffers) {
        len += a.byteLength;
    }

    let offset = 0;
    const newArray = new Uint8Array(len);
    for (let buf of arrayBuffers) {
        const a = new Uint8Array(buf);
        newArray.set(a, offset);
        offset += a.length;
    }

    return newArray;
}

function dataUriToBytes(dataUri) {

    const split = dataUri.split(',');
    const info = split[0].split(':')[1];
    let dataString = split[1];

    if (info.indexOf('base64') >= 0) {
        dataString = atob(dataString);
    } else {
        dataString = decodeURI(dataString);
    }

    const bytes = new Uint8Array(dataString.length);
    for (var i = 0; i < dataString.length; i++) {
        bytes[i] = dataString.charCodeAt(i);
    }

    return bytes;
}


export default HtsgetReader;