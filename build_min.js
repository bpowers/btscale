({
    baseUrl: 'lib',
    include: ['btscale'],
    name: 'vendor/almond',
    wrap: {
        startFile: 'src/build/start.frag.js',
        endFile: 'src/build/end.frag.js'
    },
    out: 'btscale.min.js',
})
