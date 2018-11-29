const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const inlineSource = require('gulp-inline-source')

const imagemin = require('gulp-imagemin')
const imageResize = require('gulp-image-resize')
const responsive = require('gulp-responsive')

const size = require('gulp-size')
const terser = require('gulp-terser')
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');

var browserSync = require('browser-sync').create();

gulp.task('js', ['main_js', 'restaurant_js', 'sw', 'idb']);

gulp.task('js-inject', ['js', 'copy-html'])
gulp.task('body', ['styles', 'js', 'copy-html']);

gulp.task('styles', () => {
    return gulp.src('./source/css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        })
        )
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-html', () => {
    var options = {
           compress: false
    };
    gulp.src('*.html')
        .pipe(inlineSource(options))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-images', () => {
    return gulp.src('source/img/*')
        .pipe(responsive({
            '*.jpg': [
                {width: 270, rename: { suffix: '-270'} },
                {width: 600, rename: { suffix: '-600'} },
            ]
        },{
        quality: 40,
        progressive: true,
        withMetaData: false,
        }
    ))
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/images'))
});

gulp.task('main_js', () => {
    return gulp.src(['source/js/dbhelper.js', 'source/js/main.js'] )
        .pipe(concat('main_bundle.js'))
        .pipe(terser())
        .pipe(size({title: 'main scripts'}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('restaurant_js', () => {
    return gulp.src(['source/js/dbhelper.js', 'source/js/restaurant_info.js'])
        .pipe(concat('restaurant_bundle.js'))
        .pipe(terser())
        .pipe(size({title: 'restaurant scripts'}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('sw', () => {
    return gulp.src('sw.js')
        .pipe(terser())
        .pipe(size({title: 'sw'}))
        .pipe(gulp.dest('dist'))

});

gulp.task('idb', () => {
    return gulp.src('idb-utility.js')
        .pipe(terser())
        .pipe(size({title: 'idb'}))
        .pipe(gulp.dest('dist'))
});



// gulp.task('browserSync', function() {
//     browserSync.init({
//       server: {
//         baseDir: 'dist'
//       },
//     });
// });






