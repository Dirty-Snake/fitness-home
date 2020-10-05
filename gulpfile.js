const preprocessor = 'sass';

const {src, dest, parallel, series, watch} = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
// const uglify = require('gulp-uglify-es').default
const uglifyES5 = require('gulp-uglify')
const sass = require('gulp-sass')
const less = require('gulp-less')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const del = require('del')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
const sourcemaps = require('gulp-sourcemaps')

function browser() {
  browserSync.init({
    server: {baseDir: 'app/'},
    notify: false,
    online: true,
  })
}

function scripts() {
  return src([
    'app/js/main.js',
  ])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['@babel/env'],
      }))
      .pipe(concat('main.min.js'))
      .pipe(uglifyES5())
      .pipe(dest('app/js/'))
      .pipe(browserSync.stream())
}
function styles() {
  return src([
    `app/${preprocessor}/main.${preprocessor}`,
  ])
      .pipe(eval(preprocessor)())
      .pipe(concat('main.min.css'))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true,
      }))
      .pipe(cleanCSS({
        level: {
          1: {specialComments: 0},
        },
      // format: 'beautify'
      }))
      .pipe(dest('app/css/'))
      .pipe(browserSync.stream())
}
function images() {
  return src('app/images/src/**/*')
      .pipe(newer('app/images/dest/'))
      .pipe(imagemin())
      .pipe(dest('app/images/dest/'))
}
function cleanImg() {
  return del('app/images/dest/**/*', {
    force: true,
  })
}
function build() {
  return src([
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/images/dest/**/*',
    'app/**/*.html',
  ], {
    base: 'app',
  })
      .pipe(dest('dist'))
}
function cleanDist() {
  return del('dist/**/*', {
    force: true,
  })
}
// watcher project
function startWatch() {
  watch(`app/**/${preprocessor}/**/*`, styles)
  watch([
    'app/**/*.js',
    '!app/**/*.min.js',
  ], scripts)
  watch('app/**/*.html').on('change', browserSync.reload)
  watch('app/images/src/**/*', images)
}
// update scripts
exports.scripts = scripts
// update styles
exports.styles = styles
// image minification
exports.images = images
// clean image
exports.cleanImg = cleanImg
// clean directory production
exports.cleanDist = cleanDist
// production project
exports.build = series(cleanDist, styles, scripts, images, build)
// dev project
exports.default = parallel(scripts, styles, browser, startWatch)
