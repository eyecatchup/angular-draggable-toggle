var gulp = require('gulp');
var runSequence = require('run-sequence');

var version = '0.0.5';

var copyright = [
    '/*!**********************************************************************',
    ' *  (c) 2015 Stephan Schmitz <eyecatchup@gmail.com>',
    ' *  AngularJS Draggable Toggle Buttons',
    ' *  @version: ' + version,
    ' *  @url: <https://github.com/eyecatchup/angular-draggable-toggle/>',
    ' *  @license: MIT license <http://eyecatchup.mit-license.org>',
    ' *  This copyright notice MUST APPEAR in all copies of the script!',
    ' ***********************************************************************/',
    ''
].join('\n');

/**
 * ----------------------------------------------------------------------
 * Main Tasks
 * ----------------------------------------------------------------------
 */

gulp.task('build', ['build:angularDraggableToggle']);
gulp.task('watch', ['watch:angularDraggableToggle']);
gulp.task('test', ['test:angularDraggableToggle']);

/**
 * ----------------------------------------------------------------------
 * AngularDraggableToggle Tasks
 * ----------------------------------------------------------------------
 */

var CODE_MODULE_NAME = 'angular-draggable-toggle';
var CODE_PATH_SRC = './src';
var CODE_PATH_DIST = './dist';

gulp.task('build:angularDraggableToggle', function () {
    runSequence('clean:angularDraggableToggle', [
        'js:angularDraggableToggle',
        'css:angularDraggableToggle'
    ]);
});

gulp.task('clean:angularDraggableToggle', function () {
    var rimraf = require('gulp-rimraf');

    return gulp.src([
            CODE_PATH_DIST + '/*'
          ],
          {read: false}
        )
        .pipe(rimraf());
});

gulp.task('js:angularDraggableToggle', function () {
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var ngAnnotate = require('gulp-ng-annotate');
    var rename = require('gulp-rename');
    var header = require('gulp-header');

    var sourceFiles = [
        '!**/*.spec.js',
        '!**/*.mock.js',
        CODE_PATH_SRC + '/js/*.js'
    ];
    gulp.src(sourceFiles)
        .pipe(concat(CODE_MODULE_NAME + '.min.js'))
        .pipe(header(copyright))
        .pipe(ngAnnotate())
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(gulp.dest(CODE_PATH_DIST));

    var vendorFiles = [
        './bower_components/jquery/dist/jquery.js'
    ];
    gulp.src(vendorFiles)
        .pipe(concat('vendors.js'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename(CODE_MODULE_NAME + '.vendors.min.js'))
        .pipe(gulp.dest(CODE_PATH_DIST));
});

gulp.task('css:angularDraggableToggle', function () {
    var sass = require('gulp-sass');
    var concat = require('gulp-concat');
    var autoprefixer = require('gulp-autoprefixer');

    var sourceFiles = [
        CODE_PATH_SRC + '/scss/**/*.scss'
    ];
    gulp.src(sourceFiles)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat(CODE_MODULE_NAME + '.css'))
        .pipe(gulp.dest(CODE_PATH_DIST));

    /*var vendorFiles = [
        './bower_components/angular-toggle-switch/angular-toggle-switch.css'
    ];
    return gulp.src(vendorFiles)
        .pipe(concat('styles.vendors.css'))
        .pipe(gulp.dest(CODE_PATH_DIST + '/Css'));*/

});

gulp.task('jshint:angularDraggableToggle', function () {
    var jshint = require('gulp-jshint');

    return gulp.src([
        CODE_PATH_SRC + '/js/*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test:angularDraggableToggle', ['build:angularDraggableToggle'], function () {
    var karma = require('gulp-karma');

    return gulp.src('non_exisiting_file.js')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('watch:angularDraggableToggle', ['js:angularDraggableToggle', 'css:angularDraggableToggle'], function () {
    gulp.watch(CODE_PATH_SRC + '/js/*.js', ['jshint:angularDraggableToggle', 'js:angularDraggableToggle']);
    gulp.watch(CODE_PATH_SRC + '/scss/**/*.scss', ['css:angularDraggableToggle']);
});


