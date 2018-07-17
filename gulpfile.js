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
		plumber = require("gulp-plumber"),
		pug = require("gulp-pug"),
		stylelint = require("gulp-stylelint"),
		groupMedia = require("gulp-group-css-media-queries"),
		tabify = require("gulp-tabify"),
		size = require("gulp-size"),
		sourcemaps = require("gulp-sourcemaps"),
		autoprefixer = require("gulp-autoprefixer");

var dirs = {
	src: "src/",
	libs: "src/libs/",
	build: "dist/"
};

var path = {
	src: {
		blocks: dirs.src + "core-blocks/",
		utils: dirs.src + "core-utils/",
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
	img: "*.{png,jpg,svg}",
	html: "**/*.html",
	distCss: "style.min.css",
	distJs: "script.min.js",
	all: "**/*"
};

path = Object.assign({
	watch: {
		styles: [
			path.src.fonts + "*.css",
			path.src.blocks + files.styles,
			path.src.utils + files.styles,
			dirs.libs + files.styles,
			path.src.sass + files.styles
		],
		pug: dirs.src + files.pug,
		html: dirs.src + files.html,
		js: [
			path.src.js + "script.js",
			path.src.blocks + files.js,
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

gulp.task("style", ["css-lint"], function(){
	return gulp.src(path.src.sass + "style.scss")
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
			flexbox: "no-2009"
		}))
		.pipe(tabify(2, false))
		.pipe(gulp.dest(path.src.css))
		.pipe(cleancss({
			level: 2,
			compatibility: "ie8"
		}))
		.pipe(rename(files.distCss))
		.pipe(size(sizeConfig))
		.pipe(gulp.dest(path.build.css))
		.pipe(sourcemaps.write(""))
		.pipe(gulp.dest(path.src.css))
		.pipe(browserSync.stream());
});

gulp.task("css-lint", function(){
	return gulp.src([
		path.src.fonts + "*.css",
		path.src.blocks + files.styles,
		path.src.utils + files.styles,
		path.src.sass + files.styles
	])
		.pipe(stylelint({
			reporters:[
				{formatter: "string", console: true}
			]
		}));
});

gulp.task("scripts", function(){
	return gulp.src(path.src.js + "script.js")
		.pipe(plumber())
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(rename("scripts.js"))
		.pipe(gulp.dest(path.src.js))
		.pipe(uglify())
		.pipe(rename(files.distJs))
		.pipe(size(sizeConfig))
		.pipe(gulp.dest(path.build.js))
		.pipe(sourcemaps.write(""))
		.pipe(gulp.dest(path.src.js))
		.pipe(browserSync.stream());
});

gulp.task("pug", function(){
	return gulp.src(path.src.pug + "*.pug")
		.pipe(plumber())
		.pipe(pug({"pretty": "\t"}))
		.pipe(gulp.dest(dirs.src))
		.pipe(gulp.dest(dirs.build));
});

gulp.task("server", function(){
	browserSync(servConfig);
});

gulp.task("html", function(){
	return gulp.src(dirs.build + files.html)
		.pipe(size(sizeConfig))
		.pipe(browserSync.stream());
});

gulp.task("default", ["server", "style", "pug", "scripts"], function(){
	gulp.watch(path.watch.styles, ["style"]);
	gulp.watch(path.watch.pug, ["pug"]);
	gulp.watch(path.watch.html, ["html"]);
	gulp.watch(path.watch.js, ["scripts"]);
});

gulp.task("imgmin", function(){
	return gulp.src(path.src.img + files.img)
		.pipe(imagemin([
			imagemin.jpegtran({progressive: true}),
			mozjpeg({quality: "85"}),
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({quality: "85"}),
			imagemin.svgo()
		]))
		.pipe(size(sizeConfig))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("clear", function(){
	return del.sync(dirs.build);
});

gulp.task("build", ["clear", "style", "pug", "scripts", "imgmin"], function(){
	return gulp.src([
		"!"+path.src.fonts + "*.css",
		path.src.fonts + files.all
	])
		.pipe(gulp.dest(path.build.fonts));
});

