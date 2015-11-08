var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var stylish = require('jshint-stylish');
var header = require('gulp-header');
var mocha = require('gulp-mocha');

var package = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    '',
    '',
].join('\n');

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['jshint']);
});

gulp.task('jshint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', function() {
    return gulp.src('test/*.js')
        .pipe(mocha());
});

gulp.task('build', ['jshint', 'test'], function() {
    return gulp.src('src/**/*.js')
        .pipe(header(banner, {
            pkg: package
        }))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(header(banner, {
            pkg: package
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['jshint', 'watch']);
