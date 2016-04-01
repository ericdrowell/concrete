var gulp = require('gulp'); 
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var highlight = require('gulp-highlight');
var sass = require('gulp-sass');

var date = new Date();
var package = require('./package.json');

gulp.task('clean-build', function () {
  return gulp.src('build/*')
    .pipe(clean());
});

gulp.task('clean-web-public', function () {
  return gulp.src('web/public/*')
    .pipe(clean());
});

gulp.task('hint', function() {
  return gulp.src('src/concrete.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build-license-dev', function() {
  return gulp.src(['license.js', 'src/concrete.js'])
    .pipe(concat('concrete.js'))
    .pipe(replace('@@VERSION', package.version))
    .pipe(replace('@@DATE', date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear()))
    .pipe(replace('@@YEAR', date.getFullYear()))
    .pipe(gulp.dest('build'));
});

gulp.task('build-prod', function() {
  return gulp.src(['src/concrete.js'])
    .pipe(rename('concrete.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
});

gulp.task('license-prod', function() {
  return gulp.src(['LICENSE.js', 'build/concrete.min.js'])
    .pipe(concat('concrete.min.js'))
    .pipe(replace('@@VERSION', package.version))
    .pipe(replace('@@DATE', date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear()))
    .pipe(replace('@@YEAR', date.getFullYear()))
    .pipe(gulp.dest('build'));
});

gulp.task('highlight', function () {
  return gulp.src('web/src/index.html')
    .pipe(highlight())
    .pipe(gulp.dest('web/public'));
});

gulp.task('sass', function () {
  return gulp.src('web/src/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('web/public'));
});

gulp.task('img', function () {
  return gulp.src('web/img/PNG/*')
    .pipe(gulp.dest('web/public/img'));
});

// ================================ main builds ================================

gulp.task('build', function() {
  runSequence('clean-build', 'hint', 'build-license-dev', 'build-prod', 'license-prod');
});

gulp.task('web', function() {
  runSequence('clean-web-public', 'highlight', 'sass', 'img');
});

// Default Task
gulp.task('default', ['build', 'web']);