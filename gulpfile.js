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
		minWebp = require("imagemin-webp"),
		svgStore = require("gulp-svgstore"),
		plumber = require("gulp-plumber"),
		pug = require("gulp-pug"),
		stylelint = require("gulp-stylelint"),
		groupMedia = require("gulp-group-css-media-queries"),
		tabify = require("gulp-tabify"),
		size = require("gulp-size"),
		htmlValid = require("gulp-w3c-html-validation"),
		ftp = require("vinyl-ftp"),
		purgecss = require("gulp-purgecss"),
		sourcemaps = require("gulp-sourcemaps"),
		autoprefixer = require("gulp-autoprefixer");

var dirs = {
	src: "src/",
	libs: "src/libs/",
	build: "dist/",
	ftp: ""
};

var path = {
	src: {
		css: dirs.src + "css/",
		sass: dirs.src + "sass/",
		js: dirs.src + "js/",
		pug: dirs.src + "pug/",
		img: dirs.src + "img/",
		imgAssets: dirs.src + "img/assets/",
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
},
ftpConfig = {
	host: "site.com",
	user: "",
	password: "",
	parallel: 10
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

gulp.task("compile", gulp.series("style", "pug", "scripts", "css-update"));

gulp.task("default", gulp.parallel("server", "compile", function(){
	gulp.watch(path.watch.styles, gulp.series("style"));
	gulp.watch(path.watch.pug, gulp.series("pug"));
	gulp.watch(path.watch.html, gulp.parallel("html", "css-update"));
	gulp.watch(path.watch.js, gulp.parallel("scripts", "css-update"));
}));

gulp.task("jpgmin", function(){
	return gulp.src(path.src.img + "*.jpg", {allowEmpty: true})
		.pipe(imagemin([
			guetzli({
				quality: 90,
				memlimit: 1024
			}),
			mozjpeg({
				quality: 85
			})
		]))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("jpgmin100", function(){
	return gulp.src(path.src.img + "*.jpg", {allowEmpty: true})
		.pipe(imagemin([
			guetzli({
				quality: 100,
				memlimit: 1024
			}),
			imagemin.jpegtran({progressive: true}),
		]))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("webpmin", function(){
	return gulp.src(path.src.img + "*.{png,jpg}", {allowEmpty: true})
		.pipe(imagemin([
			minWebp({
				quality: 77,
				method: 5
			})
		]))
		.pipe(rename({extname: ".webp"}))
		.pipe(gulp.dest(path.src.img))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("pngmin", function(){
	return gulp.src(path.src.img + "*.{png,svg}", {allowEmpty: true})
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({
				quality: [0.75, 0.8],
				speed: 3,
				strip: true
			}),
			imagemin.svgo({
				plugins: [
					{cleanupIDs: false},
					{removeViewBox: true},
					{removeUselessDefs: false}
				]
			})
		]))
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(gulp.dest(path.build.img));
});

gulp.task("svg-sprite", function(){
	return gulp.src(path.src.imgAssets + "*.svg", {allowEmpty: true})
		.pipe(rename({prefix: "icon-"}))
		.pipe(svgStore({inlineSvg: true}))
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest(path.src.img));
});

gulp.task("imgmin", gulp.parallel("jpgmin", "pngmin"));

gulp.task("clear", function(cb){
	del.sync(dirs.build);
	cb();
});

gulp.task("ftp", function(){
	var conn = ftp.create(ftpConfig);
	return gulp.src(dirs.build + files.all, {buffer: false})
		.pipe(conn.newer(dirs.ftp))
		.pipe(conn.dest(dirs.ftp));
});

gulp.task("build", gulp.series("clear", "compile", "html", "imgmin", function(){
	return gulp.src([
		"!"+path.src.fonts + "*.{scss,css}",
		path.src.fonts + files.all
	], {allowEmpty: true})
		.pipe(gulp.dest(path.build.fonts));
}));

