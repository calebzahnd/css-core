//**************************
// Set the production Paths
//**************************

// Location to source your scss files from. Usually a specific file, but you can use **/*.scss wildcard
var styles_src				= 'src/scss/*.scss'; 

// Destination to send your compiled CSS. Will also send a production ready minified css file to this directory
var styles_dest				= 'dist/assets/styles/'; 

var js_dest		= 'dist/assets/scripts'; // Destination to send your compiled JS scripts to. Will also send a production ready minified css file to this directory

var js_filename	= 'css-core.js';

// Array of Javascript files to concatenate and minify
var js_concat = [
	'src/js/core-css.js',
];

// Array of directories (and those to skip) to validate HTML
var validate_src = 'dist/templates';

// Array of directories and font files to copy to production assets
var fonts_src = [
	'src/media/fonts/**/*',
];
var fonts_dest = 'dist/assets/media/fonts'; // Destination to send your font files;


var img_src		= [
	'src/media/images/**/*', // Directory to copy all images from. This will grab all file extensions.
];
var img_dest	= 'dist/assets/media/images'; // Destination to send all images to.

// Directories to wipe out. Be careful. Everything in these directories will be deleted.
var clean_dir = [
	'dist/assets/styles',
	'dist/assets/scripts',
	'dist/assets/media/images'
];

//---------------------------------------------------------------------------------------------
// Load the dependencies
//---------------------------------------------------------------------------------------------

var gulp			= require('gulp'),
	sass			= require('gulp-sass'),
	postcss			= require('gulp-postcss'),
	gulpStylelint	= require('gulp-stylelint'),
	reporter    	= require('postcss-reporter'),
	syntax_scss 	= require('postcss-scss'),
	stylelint   	= require('stylelint'),
	autoprefixer	= require('gulp-autoprefixer'),
	csscomb			= require('gulp-csscomb'),
	cssnano			= require('gulp-cssnano'),
	htmlhint		= require("gulp-htmlhint"),
	uglify 			= require('gulp-uglify'),
	imagemin 		= require('gulp-imagemin'),
	modernizr		= require('gulp-modernizr'),
	rename 			= require('gulp-rename'),
	rimraf			= require('gulp-rimraf'),
	concat 			= require('gulp-concat'),
	notify 			= require('gulp-notify'),
	plumber 		= require('gulp-plumber'),
	gutil			= require('gulp-util'),
	runSequence		= require('run-sequence'),
	pngquant		= require('imagemin-pngquant'),
	gulpif			= require('gulp-if'),
	filesize		= require('gulp-filesize');

var onError = function (err) {
  gutil.beep();
  console.log(err);
};


//---------------------------------------------------------------------------------------------
// TASK: Styles
//---------------------------------------------------------------------------------------------

gulp.task("lint-css", function() {

 	// Stylelint config rules are managed in .stylelintrc

	var processors = [
		stylelint(),
		reporter({
			clearMessages: true,
			//throwError: true
		})
	];

  return gulp.src(
      ['src/scss/**/*.scss']
    )
    .pipe(postcss(processors, {syntax: syntax_scss}));
});

//---------------------------------------------------------------------------------------------
// TASK: Styles
//---------------------------------------------------------------------------------------------

gulp.task('styles', function () {
	return gulp.src(styles_src)
		.pipe(plumber())
		.pipe(sass({ style: 'expanded'}).on('error', sass.logError).on('error', onError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'ios 8', 'android 4']
    	}))
		.pipe(csscomb())
		.pipe(gulp.dest(styles_dest))
		.pipe(filesize())
		.pipe(rename({ suffix: '.min' }))
		.pipe(cssnano({
			autoprefixer: false
		}))
		.pipe(gulp.dest(styles_dest))
		.pipe(filesize())
		.pipe(notify({ message: 'Styles task complete' }));
});

//---------------------------------------------------------------------------------------------
// TASK: Modernizr
//---------------------------------------------------------------------------------------------

gulp.task('modernizr', function() {
  gulp.src('src/js/*.js')
	.pipe(modernizr({

	// Based on default settings on http://modernizr.com/download/
	"options" : [
		"setClasses",
		"addTest",
		"html5shiv",
		"html5printshiv",
		"testProp",
		"fnBind"
	],

	// Define any tests you want to explicitly include
	"tests" : [
		//"hiddenscroll",
		"ie8compat",
		"ligatures",
		"svg",
		"backgroundblendmode",
		"backgroundcliptext",
		"backgroundsizecover",
		"flexbox",
		"flexboxlegacy",
		"flexboxtweener",
		"lastchild",
		"objectfit",
		"picture",
		"vhunit",
		"vwunit"
	],

}))
	.pipe(uglify())
	.pipe(gulp.dest(js_dest))

});

//---------------------------------------------------------------------------------------------
// TASK: scripts
//---------------------------------------------------------------------------------------------

gulp.task('scripts', function() {
	return gulp.src(js_concat)
		.pipe(plumber())
		.pipe(concat(js_filename))
		.pipe(gulp.dest(js_dest))
		.pipe(filesize())
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest(js_dest))
		.pipe(filesize())
		.pipe(notify({ message: 'Scripts concat task complete.' }));
});


//---------------------------------------------------------------------------------------------
// TASK: fonts
//---------------------------------------------------------------------------------------------
gulp.task('fonts', function() {

	return gulp.src(fonts_src)
		.pipe(gulp.dest(fonts_dest))
		.pipe(notify({ message: 'Fonts task complete.' }))
		.pipe(filesize());
});


//---------------------------------------------------------------------------------------------
// TASK: Images
//---------------------------------------------------------------------------------------------

gulp.task('images', function () {
	return gulp.src(img_src)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(img_dest))
		.pipe(filesize());
});

//---------------------------------------------------------------------------------------------
// TASK: Validate
//---------------------------------------------------------------------------------------------

gulp.task('validate', function() {

  return gulp.src(validate_src)
	.pipe(htmlhint())
	.pipe(htmlhint.reporter())
});


//---------------------------------------------------------------------------------------------
// TASK: Clean
//---------------------------------------------------------------------------------------------

gulp.task('clean', function() {
  return gulp.src(clean_dir, { read: false }) // much faster
	.pipe(rimraf({ force: true }))
	.pipe(notify({ message: 'Clean task complete.' }));
});


//---------------------------------------------------------------------------------------------
// Build TASK: Run `gulp build`
// This is the production task, It will clean out all of the specified directories,
// compile and minify your sass, concatencate and minify your scripts, move necessary
// fonts, and compress and move images to the assets directory.
//---------------------------------------------------------------------------------------------

gulp.task('build', function() {
	runSequence('clean',
	['styles', 'scripts', 'modernizr', 'fonts', 'images']);
});


//---------------------------------------------------------------------------------------------
// DEVELOPMENT/WATCH TASK: Run `gulp`
// This is the development task. It is the task you will primarily use. It will watch
// for changes in your sass files, and recompile new CSS when it sees changes. It
// will do the same for javascript files as well.
//---------------------------------------------------------------------------------------------

gulp.task('default', function() {

	// Watch .scss files
	gulp.watch('src/**/*.scss', function(event) {
		 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
		 gulp.start('styles');
	});
	
	// Watch .js files
	gulp.watch('src/js/**/*.js', function(event) {
		 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
		 gulp.start('scripts');
	});

	// Watch .html files
	gulp.watch('public/**/*.html', function(event) {
		 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
		 gulp.start('validate');
	});
	
	// Watch IMG files
	gulp.watch('src/media/images/**/*', function(event) {
		 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
		 gulp.start('images');
	});

});
