'use strict';

var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var exec = require('child_process').exec;
var fs = require('fs');
var responsive = require('gulp-responsive');
var { formatLatex } = require('./cv/utils');
var { getData } = require('./web/utils');
const nunjucks = require('gulp-nunjucks');
var data = null;

gulp.task('styles', function () {
  return gulp.src('./web/css/*.css')
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest('./dist/css'))
});

gulp.task('scripts', function() {
  return gulp.src('./web/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
});

gulp.task('data.build.json', async function() {
  if(data)
    return data;
  data = await getData();
  return data;
});


gulp.task('pages', gulp.series('data.build.json', function render_pages() {
  return gulp.src('./web/**/*.html')
    .pipe(nunjucks.compile(data, {
      filters: require('./web/utils/filters'),
      autoescape: true,
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('./dist'));
}));


gulp.task('build-cv', gulp.series('data.build.json', function cv() {
  return gulp.src('./cv/kulhanek-cv.tex')
    .pipe(formatLatex('./cv'))
    .pipe(gulp.dest('./web/public/assets'));
}));


gulp.task('responsive-images', function() {
  return gulp.src('./web/images/*.{png,jpg,jpeg}')
    .pipe(
      responsive({
        'profile.png': [{
            rename: 'profile.jpg',
            format: 'jpg',
            width: 240,
            progressive: true,
            quality: 80,
          }, {
            rename: 'profile@2x.jpg',
            format: 'jpg',
            width: 240 * 2,
            progressive: true,
            quality: 80,
          }, {
            rename: 'profile.webp',
            format: 'webp',
            width: 240,
          }, {
            rename: 'profile@2x.webp',
            format: 'webp',
            width: 240 * 2,
            progressive: true,
            quality: 80,
          }],
        'project-*': [{
          width: 86,
          height: 86,
          rename: () => ({extname: '.jpg'}),
          progressive: true,
          withoutEnlargement: false,
        }, {
          width: 86 * 2,
          height: 86 * 2,
          rename: () => ({suffix: '@2x', extname: '.jpg'}),
          progressive: true,
          withoutEnlargement: false,
        }, {
          width: 86,
          height: 86,
          rename: () => ({extname: '.webp'}),
          withoutEnlargement: false,
        }, {
          width: 86 * 2,
          height: 86 * 2,
          rename: () => ({suffix: '@2x', extname: '.webp'}),
          withoutEnlargement: false,
        }]
      })
    )
    .pipe(gulp.dest('dist/images'))
});

gulp.task('copy', function () {
  return gulp.src('./web/public/**/*')
    .pipe(gulp.dest('./dist/'));
});


// Clean output directory
gulp.task('clean', () => del(['dist', 'build']));

// Gulp task to minify all files
gulp.task('web', gulp.series('clean', 
    'copy',
    'styles',
    'scripts',
    'pages',
    'responsive-images'
));

// Gulp task to minify all files
gulp.task('default', gulp.series('clean', 
    'web',
));
