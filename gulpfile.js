var gulp = require('gulp');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var mocha = require('gulp-mocha');
var replace = require('gulp-replace');

var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @homepage <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['jshint']);
});

gulp.task('lint', () => {
    return gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task('test', function() {
    return gulp.src('test/*.js')
        .pipe(mocha());
});

gulp.task('build', ['lint', 'test'], function() {
    return gulp.src('src/**/*.js')
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(replace(/VERSION/g, pkg.version))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['lint', 'watch']);
