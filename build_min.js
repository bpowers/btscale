({
    baseUrl: 'lib',
    include: ['btscale'],
    name: 'vendor/almond',
    wrap: {
        startFile: 'lib/build/start.frag.js',
        endFile: 'lib/build/end.frag.js'
    },
    out: 'dist/btscale.min.js',
})
