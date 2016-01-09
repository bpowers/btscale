'use strict';

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var lint = require('gulp-tslint');
var merge = require('merge2');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');

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
        var b = browserify({
            entries: ['./lib/scale_finder.js'],
            builtins: false,
            insertGlobalVars: {
                // don't do anything when seeing use of 'process' - we
                // handle this ourselves.
                'process': function() { return "" },
                'Buffer': function() { return "" },
                'buffer': function() { return "" },
            },
        });

        return b.bundle()
            .pipe(source('./lib/scale_finder.js'))
            .pipe(buffer())
        //  .pipe(uglify())
            .on('error', gutil.log)
            .pipe(rename('btscale.js'))
            .pipe(gulp.dest('.'));
});

gulp.task('btscale.min.js', ['lib'], function() {
        var b = browserify({
            entries: ['./lib/scale_finder.js'],
            builtins: false,
            insertGlobalVars: {
                // don't do anything when seeing use of 'process' - we
                // handle this ourselves.
                'process': function() { return "" },
                'Buffer': function() { return "" },
                'buffer': function() { return "" },
            },
        });

        return b.bundle()
            .pipe(source('./lib/scale_finder.js'))
            .pipe(buffer())
            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(rename('btscale.min.js'))
            .pipe(gulp.dest('.'));
});

gulp.task('default', ['test', 'btscale.js', 'btscale.min.js']);
