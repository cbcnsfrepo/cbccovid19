var igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    //clientId: "...",
    // apiKey: "...",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened.
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
                    type: "variant",
                    format: "vcf",
                    url: "./datafiles/test.vcf",
                    name: "Variants",
                    squishedCallHeight: 1,
                    expandedCallHeight: 4,
                    displayMode: "expanded",
                    visibilityWindow: 30000
                },
                {
                     name: "Mutation Frequency",
                     type: "wig",
                     format: "wig",
                     url: "./datafiles/test.wig",
                     height: 200
                },
                {
                    type: "mut",
                    format: "mut",
                    url: "./datafiles/cle_clinic.mut",
                    displayMode: "expanded",
                    height: 300,
                }
            ]
        }
}
