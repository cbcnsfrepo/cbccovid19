
////////////////////////// GFF parsing code  ////////////////////////////////////////
const gffNameFields = ["Name", "gene_name", "gene", "gene_id", "alias", "locus", "name"];

/**
 * Decode a single gff record (1 line in file).  Aggregations such as gene models are constructed at a higher level.
 *      ctg123 . mRNA            1050  9000  .  +  .  ID=mRNA00001;Parent=gene00001
 * @param tokens
 * @param ignore
 * @returns {*}
 */
function decodeGFF(tokens, header) {

    var tokenCount, chr, start, end, strand, type, score, phase, attributeString, color, name,
        transcript_id, i,
        format = header.format

    tokenCount = tokens.length;
    if (tokenCount < 9) {
        return null;      // Not a valid gff record
    }

    chr = tokens[0];
    type = tokens[2];
    start = parseInt(tokens[3]) - 1;
    end = parseInt(tokens[4]);
    score = "." === tokens[5] ? 0 : parseFloat(tokens[5]);
    strand = tokens[6];
    phase = "." === tokens[7] ? 0 : parseInt(tokens[7]);
    attributeString = tokens[8];

    // Find ID and Parent, or transcript_id
    var delim = ('gff3' === format) ? '=' : /\s+/;
    var attributes = parseAttributeString(attributeString, delim);
    for (let [key, value] of Object.entries(attributes)) {
        const keyLower = key.toLowerCase()
        if ("color" === keyLower || "colour" === keyLower) {
            color = createColorString(value);
        } else if ('gff3' === format)
            try {
                attributes[key] = unescape(value);
            } catch (e) {
                attributes[key] = value;   // Invalid
                console.error(`Malformed gff3 attibute value: ${value}`);
            }
    }

    // Find name (label) property
    if (header.nameField) {
        name = attributes[header.nameField];
    } else {
        for (i = 0; i < gffNameFields.length; i++) {
            if (attributes.hasOwnProperty(gffNameFields[i])) {
                header.nameField = gffNameFields[i];
                name = attributes[header.nameField];
                break;
            }
        }
    }

    const id = attributes["ID"] || attributes["transcript_id"]
    const parent = attributes["Parent"]

    return {
        id: id,
        parent: parent,
        name: name,
        type: type,
        chr: chr,
        start: start,
        end: end,
        score: score,
        strand: strand,
        color: color,
        attributeString: attributeString,
        delim: delim,
        popupData: popupData
    }

}

function parseAttributeString(attributeString, keyValueDelim) {
    // parse 'attributes' string (see column 9 docs in https://github.com/The-Sequence-Ontology/Specifications/blob/master/gff3.md)
    var attributes = {};
    for (let kv of attributeString.split(';')) {
        const t = kv.trim().split(keyValueDelim, 2)
        if (t.length === 2) {
            const key = t[0].trim();
            let value = t[1].trim();
            //Strip off quotes, if any
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substr(1, value.length - 2);
            }
            attributes[key] = value;
        }
    }
    return attributes
}

function popupData(genomicLocation) {
    const kvs = this.attributeString.split(';')
    const pd = [];
    if (this.name) {
        pd.push({name: 'name:', value: this.name})
    }
    pd.push({name: 'type:', value: this.type})
    for (let kv of kvs) {
        const t = kv.trim().split(this.delim, 2);
        if (t.length === 2 && t[1] !== undefined) {
            const key = t[0].trim();
            if ('name' === key.toLowerCase()) continue;
            let value = t[1].trim();
            //Strip off quotes, if any
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substr(1, value.length - 2);
            }
            pd.push({name: key + ":", value: value});
        }
    }
    pd.push({
        name: 'position:',
        value: `${this.chr}:${numberFormatter(this.start + 1)}-${numberFormatter(this.end)}`
    })
    return pd;
}

function createColorString(str) {
    if (str.includes(",")) {
        return str.startsWith("rgb") ? str : "rgb(" + str + ")";
    } else {
        return str;
    }
}

function numberFormatter(rawNumber) {

    var dec = String(rawNumber).split(/[.,]/),
        sep = ',',
        decsep = '.';

    return dec[0].split('').reverse().reduce(function (prev, now, i) {
        return i % 3 === 0 ? prev + sep + now : prev + now;
    }).split('').reverse().join('') + (dec[1] ? decsep + dec[1] : '');
}

export {decodeGFF, parseAttributeString}