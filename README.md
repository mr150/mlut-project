# MLUT project #
Project template for development with [MLUT](https://github.com/mr150/mlut).

## System requirements ##
- [Node.js](https://nodejs.org/en/)
- Git Bash - for Windows users.

## Installation ##
```
git clone https://github.com/mr150/mlut-project.git
cd mlut-project
npm i
```

## Build the project ##
For building and automation uses the [Gulp](https://github.com/gulpjs/gulp) task runner.

### Basic commands ###
Enter the following commands in your terminal.

#### Dev server ####
To start development server with livereload, run gulp watcher:
```
npm run gulp
```
or add path to `gulp` in environment variable `PATH`
```bash
export PATH=./node_modules/.bin:$PATH
```
and run gulp easier
```
gulp
```
server start in `src/` folder by default and your `src/index.html` will be on `localhost:3000`.

To stop dev server press `Ctrl + c` in your terminal

#### Build ####
To build project without watcher, execute:
```
npm run build
```
or
```
gulp build
```

#### Minify images ####
```
npm run imgmin
```
or
```
gulp imgmin
```
You can minify images with `build` task too.

All code for production are in `dist/` folder.

### Code ###
For writing html by default is used [Pug](https://github.com/pugjs/pug) template engine. Files from `src/pug/` will be compiled to html in `src/` except those in the `src/pug/includes/` or other sub folders. `src/pug/includes/` contains code for reuse on different pages, variables with templates for data, and mixins. If you don't want use pug delete `src/pug/` folder from the project.

For html validation, a [gulp-w3c-html-validation](https://github.com/Aakash-Goel/gulp-w3c-html-validation) is used. It creates a file with the result of the check in the `logs/` directory. I do not know how to disable this report so the `logs/` is simply ignored by git.

For writing styles is used [LibSass](https://github.com/sass/libsass) (SCSS syntax).

All styles should be written or included in `src/sass/style.scss`:
```scss
@import "my-block";
```

Scripts similarly should be written or included in `src/js/script.js`. To store parts of scripts use `src/js/includes/` directory. You can include code via `gulp-rigger`:
```js
//= includes/block.js
```

All styles from `src/sass/` will be linted by [Stylelint](https://github.com/stylelint/stylelint). CSS properties order is linted according to [rational order](https://github.com/constverum/stylelint-config-rational-order) but not so strict.

In the process of assembling styles, the [purgecss](https://github.com/FullHuman/purgecss) is used. If the CSS class is not used in html or js, it will be deleted from assembled CSS file.

For store third party libs use `src/libs/` directory. Files from this directory is not linted. Also they is ignored by git except for `mlut.*` files.

### Configs ###
Files in which you can find configs:

- `gulpfile.js` - project assembly
- `package.json` - npm scripts and package info
- `.stylelintrc` - Stylelint rules
- `.browserslistrc` - list of browsers for which vendor prefixes are generated by [Autoprefixer](https://github.com/postcss/autoprefixer)
- `src/sass/includes/_settings.scss` - MLUT styles settings and compilation flags

### Assets ###
Images put in `src/img/` directory. All images from there will be minified except for those in the `src/img/assets/`. This directory is needed to store additional files like a parts of CSS sprites. By default it ignored by git.

By default, [guetzli](https://github.com/google/guetzli) with [mozjpeg](https://github.com/mozilla/mozjpeg) is used for jpg images minification. Guetzli consumes a lot of CPU and RAM, and also works slowly. If you have a weak computer or you don't want to wait, then turn it off in the `gulpfile.js`. By default for guetzli is set a limit on RAM consumption of 1GB.

Web fonts put in `src/fonts/`.

All assets for production also are in `dist/` folder.

## Work with MLUT ##
There are 2 ways to start using MLUT:

- assembled dist
- developer toolkit

### Dist ###
You can link assembled MLUT files to page. For get all dist, enter:
```
npm run mlut-dist
```
If you want to link only CSS, execute:
```
npm run mlut-get-css
```
or similarly for get SCSS if you want include it to `style.scss`
```
npm run mlut-get-scss
```
All scripts put files in `src/libs/` directory.

Then link file to your page:
``` html
<link href="libs/mlut.min.css" rel="stylesheet">
```
or import to `style.scss`
``` scss
@import "../libs/mlut.min";
```
And just add MLUT classes to markup:
``` html
<div class="row D-f">
	<div class="row__col W3gc_md">
		<h3>Simple text</h3>
```

### Toolkit ###
You can get MLUT sources for using full toolkit: sass mixins, functions, utilities etc. Also you can build custom bundle of blocks and utilities.

For get sources:
```
npm run mlut-src
```
After that sources appear in project folder.

#### Styles ####
To get started, uncomment imports of sass settings and tools in `src/sass/style.scss`:
``` scss
@import "includes/settings";
@import "includes/functions";
@import "includes/mixins";
```
Then you can import blocks, utilities and use sass tools:
```scss
@import "../core-blocks/wrapper/wrapper";
@import "../core-utils/display";

@include mlu-bpm($mlu-bp-md) {
	.input--common {
		padding: mlu-px2em(16px) 16px;
	}
}
```
You can import only files that you want and build custom bundle or redefine existing with new settings.

After execution `mlut-src` in `src/sass/` will appear `mlut.scss` which contains imports for build default bundle. If you want use it execute:
```
npm run mlut-scss
```
This write content `mlut.scss` to `src/sass/style.scss` and delete `mlut.scss`.

By default all MLUT sources written in `.gitignore`.
