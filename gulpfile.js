'use strict';

var gulp = require('gulp');
var merge = require('merge2');
var ts = require('gulp-typescript');
var rjs = require('gulp-requirejs-bp');
var lint = require('gulp-tslint');
var mocha = require('gulp-mocha');

var project = ts.createProject('tsconfig.json', {
    sortOutput: true,
    declaration: true,
});
var testProject = ts.createProject('tsconfig.json', { sortOutput: true });

gulp.task('lint', function() {
    return gulp.src('src/*.ts')
        .pipe(lint())
        .pipe(lint.report('verbose'));
});

gulp.task('lib', ['lint'], function() {
    var tsLib = gulp.src('src/*.ts')
        .pipe(ts(project));

    return merge(tsLib.js, tsLib.dts)
        .pipe(gulp.dest('lib'));
});

gulp.task('test', ['lib'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project)).js
	.pipe(gulp.dest('test'))
	.pipe(mocha());
});

gulp.task('btscale.js', ['lib'], function() {
    return rjs({
        baseUrl: 'lib',
        include: ['scale_finder'],
        optimize: 'none',
        name: '../src/bower_components/almond/almond',
        wrap: {
            startFile: 'src/build/start.frag.js',
            endFile: 'src/build/end.frag.js'
        },
        out: 'btscale.js',
    }).pipe(gulp.dest('.'));
});

gulp.task('btscale.min.js', ['lib'], function() {
    return rjs({
        baseUrl: 'lib',
        include: ['scale_finder'],
        name: '../src/bower_components/almond/almond',
        wrap: {
            startFile: 'src/build/start.frag.js',
            endFile: 'src/build/end.frag.js'
        },
        out: 'btscale.min.js',
    }).pipe(gulp.dest('.'));
});

gulp.task('default', ['test', 'btscale.js', 'btscale.min.js']);
