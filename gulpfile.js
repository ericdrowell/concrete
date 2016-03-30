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
  gulp.src('build/*')
    .pipe(clean());
});

gulp.task('clean-web-public', function () {
  gulp.src('web/public/*')
    .pipe(clean());
});

gulp.task('hint', function() {
  gulp.src('src/concrete.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build-license-dev', function() {
  return gulp.src(['license.js', 'src/concrete.js'])
    .pipe(concat('concrete-v' + package.version + '.js'))
    .pipe(replace('@@VERSION', package.version))
    .pipe(replace('@@DATE', date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear()))
    .pipe(replace('@@YEAR', date.getFullYear()))
    .pipe(gulp.dest('build'));
});

gulp.task('build-prod', function() {
  return gulp.src(['src/concrete.js'])
    .pipe(rename('concrete-v' + package.version + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
});

gulp.task('license-prod', function() {
  return gulp.src(['LICENSE.js', 'build/concrete-v' + package.version + '.min.js'])
    .pipe(concat('concrete-v' + package.version + '.min.js'))
    .pipe(replace('@@VERSION', package.version))
    .pipe(replace('@@DATE', date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear()))
    .pipe(replace('@@YEAR', date.getFullYear()))
    .pipe(gulp.dest('build'));
});

gulp.task('highlight', function () {
  gulp.src('web/src/index.html')
    .pipe(highlight())
    .pipe(gulp.dest('web/public'));
});

gulp.task('sass', function () {
  return gulp.src('web/src/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('web/public'));
});

// ================================ main builds ================================

gulp.task('concrete', function() {
  runSequence('clean-build', 'hint', 'build-license-dev', 'build-prod', 'license-prod');
});

gulp.task('web', function() {
  runSequence('clean-web-public', 'highlight', 'sass');
});

// Default Task
gulp.task('default', ['concrete', 'web']);