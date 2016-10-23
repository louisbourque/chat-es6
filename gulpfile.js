const gulp = require('gulp');
const minifycss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concatcss = require('gulp-concat-css');
const concat = require('gulp-concat');
const minifyhtml = require('gulp-minify-html');
const eslint = require('gulp-eslint');
const htmlreplace = require('gulp-html-replace');
const inline = require('gulp-inline');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const babelify = require('babelify');
const browserify = require('browserify')
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
var aliasify = require('aliasify');

var aliasifyConfig = {
    aliases: {
        "vue": "vue/dist/vue"
    },
    verbose: false
}

gulp.task('default', ['es6','css','html','watch']);

gulp.task('watch', function() {
  browserSync({
    server: {
      baseDir: './'
    }
  });
	gulp.watch('./src/js/*.js', ['es6-watch']);
  gulp.watch('./src/css/*.css', ['css']);
	gulp.watch('./src/*.html', ['html-watch']);
});

gulp.task('es6-watch',['es6'],browserSync.reload);
gulp.task('html-watch',['html'],browserSync.reload);

// CSS minification task
gulp.task('css', function() {
  return gulp.src(['src/css/*.css'])
    .pipe(concatcss('style.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
});
// JS minification task
gulp.task('js', function() {
  return gulp.src(['src/js/*.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('bundle.min.js'))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('js'));
});

gulp.task('es6', () => {
	return browserify('src/js/app.js')
		.transform('babelify', {
			presets: ['es2015']
		})
    .transform(aliasify, aliasifyConfig)
		.bundle().on('error', function(err){
      // print the error (can replace with gulp-util)
      console.log(err.message);
      // end this stream
      this.emit('end');
    })
		.pipe(source('bundle.min.js'))
		.pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    .pipe(uglify())
    .pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest('js'));
});

// minify HTML task
gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(htmlreplace({
        'js': 'js/bundle.min.js',
        'css': 'css/style.min.css'
    }))
    .pipe(minifyhtml())
    .pipe(gulp.dest(''));
});


gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['src/js/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint({
        rules: {
            'strict': 1
        },
        globals: [],
        envs: [
            'browser'
        ]
    }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});
