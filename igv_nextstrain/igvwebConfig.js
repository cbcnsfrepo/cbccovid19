var igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    //clientId: "...",
    // apiKey: "...",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened .
    urlShortener: {
        provider: "tinyURL"
    },

    //restoreLastGenome: true,

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "ASM985889v3",
            showSVGButton: false,
            tracks: [
                
                {
                     name: "Mutational Data",
                     type: "wig",
                     format: "wig",
                     url: "./datafiles/test.wig",
                     height: 200
                },
                {
                     type: "variant",
                     format: "vcf",
                     url: "./datafiles/test.vcf",
                     name: "Variants",
                     squishedCallHeight: 1,
                     expandedCallHeight: 4,
                     displayMode: "squished",
                     visibilityWindow: 30000
                },
                {
                    type: "annotation",
                    format: "gff3",
                    url: getFile() ? "./GFF3_files/" + getFile() + ".gff3" : "./GFF3_files/J3PY8_051.gff3",
                    displayMode: "expanded",
                    expandedRowHeight: 20
                }
            ]
        }
}

function getFile() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const name = urlParams.get('name');
    return name;
}
