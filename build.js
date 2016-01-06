({
    baseUrl: 'lib',
    include: ['btscale'],
    optimize: 'none',
    name: 'vendor/almond',
    wrap: {
        startFile: 'src/build/start.frag.js',
        endFile: 'src/build/end.frag.js'
    },
    out: 'btscale.js',
})
