var gulp = require("gulp"),
		sass = require("gulp-sass"),
		browserSync = require("browser-sync"),
		rigger = require("gulp-rigger"),
		cleancss = require("gulp-clean-css"),
		uglify = require("gulp-uglify"),
		rename = require("gulp-rename"),
		del = require("del"),
		imagemin = require("gulp-imagemin"),
		pngquant = require("imagemin-pngquant"),
		mozjpeg = require("imagemin-mozjpeg"),
		guetzli = require("imagemin-guetzli"),
		plumber = require("gulp-plumber"),
		pug = require("gulp-pug"),
		stylelint = require("gulp-stylelint"),
		groupMedia = require("gulp-group-css-media-queries"),
		tabify = require("gulp-tabify"),
		size = require("gulp-size"),
		htmlValid = require("gulp-w3c-html-validation"),
		purgecss = require("gulp-purgecss"),
		sourcemaps = require("gulp-sourcemaps"),
		autoprefixer = require("gulp-autoprefixer");

var dirs = {
	src: "src/",
	libs: "src/libs/",
	build: "dist/"
};

var path = {
	src: {
		css: dirs.src + "css/",
		sass: dirs.src + "sass/",
		js: dirs.src + "js/",
		pug: dirs.src + "pug/",
		img: dirs.src + "img/",
		fonts: dirs.src + "fonts/"
	},
	build: {
		css: dirs.build + "css/",
		js: dirs.build + "js/",
		img: dirs.build + "img/",
		fonts: dirs.build + "fonts/"
	}
};

var files = {
	styles: "**/*.{scss,css}",
	js: "**/*.js",
	pug: "**/*.pug",
	img: "*.{png,jpg,svg,webp}",
	html: "**/*.html",
	all: "**/*"
};

path = Object.assign({
	watch: {
		styles: [
			path.src.fonts + "*.{scss,css}",
			dirs.libs + files.styles,
			path.src.sass + files.styles
		],
		pug: dirs.src + files.pug,
		html: dirs.src + files.html,
		js: [
			path.src.js + "script.js",
			path.src.js + "*/" + files.js,
			dirs.libs + files.js
		]
	}
}, path);

var servConfig = {
	server: {
		baseDir: "src"
	},
	notify: false,
	open: false
},
sizeConfig = {
	gzip: true,
	pretty: false,
	showFiles: true
};

gulp.task("css-lint", function(){
	return gulp.src([
		path.src.fonts + "*.css",
		"!" + path.src.sass + "**/_*.scss",
		path.src.sass + files.styles
	], {allowEmpty: true})
		.pipe(stylelint({
			reporters:[
				{formatter: "string", console: true}
			]
		}));
});

gulp.task("style", gulp.series("css-lint", function(){
	return gulp.src(path.src.sass + "*.scss", {allowEmpty: true})
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({
			indentType: "tab",
			outputStyle: "expanded",
			indentWidth: 1
		}))
		.pipe(groupMedia())
		.pipe(autoprefixer({
			cascade: false,
			flexbox: false
		}))
		.pipe(tabify(2, false))
		.pipe(gulp.dest(path.src.css))
		.pipe(purgecss({
			content: [
				dirs.src + files.html,
				path.src.js + files.js
			]
		}))
		.pipe(cleancss({
			level: 2,
			compatibility: "ie8"
		}))
		.pipe(rename({suffix: ".min"}))
		.pipe(size(sizeConfig))
		.pipe(gulp.dest(path.build.css))
		.pipe(sourcemaps.write(""))
		.pipe(gulp.dest(path.src.css))
		.pipe(browserSync.stream());
}));

gulp.task("css-update", function(){
	return gulp.src([
		path.src.css + "*.css",
		"!" + path.src.css + "*.min.css"
	])
		.pipe(purgecss({
			content: [
				dirs.src + files.html,
				path.src.js + files.js
			]
		}))
		.pipe(cleancss({
			level: 2,
			compatibility: "ie8"
		}))
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest(path.build.css))
		.pipe(size(sizeConfig))
		.pipe(gulp.dest(path.src.css))
});

gulp.task("scripts", function(){
	return gulp.src(path.src.js + "script.js", {allowEmpty: true})
		.pipe(plumber())
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(rename("scripts.js"))
		.pipe(gulp.dest(path.src.js))
		.pipe(uglify())
		.pipe(rename({suffix: ".min"}))
		.pipe(size(sizeConfig))
		.pipe(gulp.dest(path.build.js))
		.pipe(sourcemaps.write(""))
		.pipe(gulp.dest(path.src.js))
		.pipe(browserSync.stream());
});

gulp.task("pug", function(){
	return gulp.src(path.src.pug + "*.pug", {allowEmpty: true})
		.pipe(plumber())
		.pipe(pug({"pretty": "\t"}))
		.pipe(gulp.dest(dirs.src))
		.pipe(gulp.dest(dirs.build));
});

gulp.task("server", function(){
	browserSync(servConfig);
});

gulp.task("html", function(){
	return gulp.src(dirs.build + files.html, {allowEmpty: true})
		.pipe(htmlValid({
			generateReport: false,
			reportpath: false,
			statusPath: "logs/html-validation-status.json"
		}))
		.pipe(size(sizeConfig))
		.pipe(browserSync.stream());
});

gulp.task("default", gulp.parallel("server", "style", "pug", "scripts", function(){
	gulp.watch(path.watch.styles, gulp.series("style"));
	gulp.watch(path.watch.pug, gulp.series("pug"));
	gulp.watch(path.watch.html, gulp.parallel("html", "css-update"));
	gulp.watch(path.watch.js, gulp.parallel("scripts", "css-update"));
}));

gulp.task("jpgmin", function(){
	return gulp.src(path.src.img + "*.jpg", {allowEmpty: true})
		.pipe(imagemin([
			guetzli({
				quality: "90",
				memlimit: 1024
			}),
			mozjpeg({
				quality: "85"
			})
		]))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("jpgmin100", function(){
	return gulp.src(path.src.img + "*.jpg", {allowEmpty: true})
		.pipe(imagemin([
			guetzli({
				quality: "100",
				memlimit: 1024
			}),
			imagemin.jpegtran({progressive: true}),
		]))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("imgmin", gulp.series("jpgmin", function(){
	return gulp.src(path.src.img + "*.{png,svg}", {allowEmpty: true})
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({
				quality: [0.75, 0.8],
				strip: true
			}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: true},
				]
			})
		]))
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(gulp.dest(path.build.img));
}));

gulp.task("clear", function(cb){
	del.sync(dirs.build);
	cb();
});

gulp.task("build", gulp.series("clear", "style", "pug", "scripts", "imgmin", function(){
	return gulp.src([
		"!"+path.src.fonts + "*.{scss,css}",
		path.src.fonts + files.all
	], {allowEmpty: true})
		.pipe(gulp.dest(path.build.fonts));
}));

