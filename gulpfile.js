var gulp = require('gulp'); 
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var date = new Date();
var package = require('./package.json');

gulp.task('clean', function () {
  gulp.src('build/*')
    .pipe(clean());
});

gulp.task('hint', function() {
  gulp.src('src/candy.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build-license-dev', function() {
  return gulp.src(['license.js', 'src/candy.js'])
    .pipe(concat('candy-v' + package.version + '.js'))
    .pipe(replace('@@VERSION', package.version))
    .pipe(replace('@@DATE', date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear()))
    .pipe(replace('@@YEAR', date.getFullYear()))
    .pipe(gulp.dest('build'));
});

gulp.task('build-prod', function() {
  return gulp.src(['src/candy.js'])
    .pipe(rename('candy-v' + package.version + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
});

gulp.task('license-prod', function() {
  return gulp.src(['LICENSE.js', 'build/candy-v' + package.version + '.min.js'])
    .pipe(concat('candy-v' + package.version + '.min.js'))
    .pipe(replace('@@VERSION', package.version))
    .pipe(replace('@@DATE', date.getMonth()+1 + '-' + date.getDate() + '-' + date.getFullYear()))
    .pipe(replace('@@YEAR', date.getFullYear()))
    .pipe(gulp.dest('build'));
});

gulp.task('fast', function() {
  runSequence('clean', 'build-license-dev', 'build-prod', 'license-prod');
});

gulp.task('build', function() {
  runSequence('clean', 'hint', 'build-license-dev', 'build-prod', 'license-prod');
});

// Default Task
gulp.task('default', ['build']);