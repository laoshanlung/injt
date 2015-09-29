var gulp = require('gulp')
    , eslint = require('gulp-eslint')
    , Jasmine = require('jasmine');

gulp.task('test', ['lint'], function(done) {
    var jasmine = new Jasmine()
        , config = {
            'spec_files': [
                'injt.spec.js'
            ]
        };

    config.spec_dir = './';
    jasmine.loadConfig(config);
    jasmine.configureDefaultReporter({
        showColors: true,
        forceExit: true
    });

    jasmine.onComplete(function() {
        done();
    });

    jasmine.execute();
});

gulp.task('lint', function() {
    var paths = [
        'examples/*.+(js|es|ts)',
        'index.js',
        'injt.js',
        'injt.spec.js'
    ];
    return gulp.src(paths)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});
