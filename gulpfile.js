var _ = require('lodash'),
	gulp = require('gulp'),
	del = require('del'),
	runSequence = require('run-sequence'),
	sass = require('gulp-sass'),
	newer = require('gulp-newer'),
	autoprefixer = require('gulp-autoprefixer'),

	pkg = require('./package.json'),

	paths = {
		css: {
			source: pkg.project.source + '/' + pkg.css.source + '/**/*.scss',
			dest: pkg.project.source + '/' + pkg.css.dest
		}
	},

	options = {
		autoprefixer: {
			default: {
				cascade: true,
				browsers: ['last 2 version', 'ie 9', 'android >= 2.3']
			},
			oldie: {
				browsers: ['ie 7','ie 8']
			}
		}
	},

	defaults = function(dest, source){
		return _.merge(dest, _.cloneDeep(source));
	};

gulp.task('sass:dist', function(){
	return gulp.src(paths.css.source)
		.pipe(sass(
			defaults({
				outputStyle: 'compressed'
			},
			options.sass)
		))
		.on('error', sass.logError)
		.pipe(gulp.dest(paths.css.dest));
});

gulp.task('sass:dev', function(){
	return gulp.src(paths.css.source)
		.pipe(sass(
			defaults({
				outputStyle: 'expanded',
				sourceComments: true
			},
			options.sass)
		))
		.on('error', sass.logError)
		.pipe(gulp.dest(paths.css.dest));
});


gulp.task('sass:watch', function(){
	gulp.watch(paths.css.source, ['styles-dev']);
});

gulp.task('autoprefixer:default', function(){
	return gulp.src(paths.css.dest + '/default.css')
		.pipe(autoprefixer(options.autoprefixer.default))
		.pipe(gulp.dest(pkg.project.source + '/' + pkg.css.dest));
});

gulp.task('clean', function(callback){
	del(pkg.project.dest, callback);
});

gulp.task('copy:assets', ['styles-dist'], function(){
	return gulp.src([pkg.project.source + '/assets/**/*', '!**/empty'])
		.pipe(newer(pkg.project.dest + '/assets'))
		.pipe(gulp.dest(pkg.project.dest + '/assets'));
});

gulp.task('default', function(callback){
	runSequence('copy:assets', callback);
});

gulp.task('dev', ['styles-dev', 'sass:watch']);

gulp.task('styles-dist', function(callback){
	runSequence('sass:dist', callback);
});

gulp.task('styles-dev', function(callback){
	runSequence('sass:dev', ['autoprefixer:default'], callback);
});
