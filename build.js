({
    baseUrl: 'lib',
    include: ['btscale'],
    optimize: 'none',
    name: 'vendor/almond',
    wrap: {
        startFile: 'lib/build/start.frag.js',
        endFile: 'lib/build/end.frag.js'
    },
    out: 'dist/btscale.js',
})
