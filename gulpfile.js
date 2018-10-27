const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');

const imagemin = require('gulp-imagemin')
const imageminPngquant = require('imagemin-pngquant');

const uglify = require('gulp-uglify');
const pump = require('pump');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');


gulp.task('default', ['minify-css', 'scripts'])

gulp.task('styles', () => {
    return gulp.src('./css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        })
        )
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-html', () => {
    gulp.src('*.html')
        .pipe(gulp.dest('dist'))
})

gulp.task('copy-images', () => {
    return gulp.src('images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
})

gulp.task('scripts', function() {
    gulp.src('js/*.js')
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'))
})

gulp.task('scripts-dist', function() {
    gulp.src('js/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'))
})

gulp.task('dist', [
    'styles',
    'scripts-dist',
    'copy-html',
    'copy-images'
])



