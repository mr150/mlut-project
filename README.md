# MLUT project
Project template for development with MLUT.

## Installation requirements
* [Node.js](https://nodejs.org/en/)
* Git Bash - for Windows users.

## Installation
While MLUT in the v0, installation and update is performed through a Git. In one of the next versions, the project will be published in NPM.

```
git clone https://MrZidan150@bitbucket.org/MrZidan150/mlut-project.git
git remote add mlut https://MrZidan150@bitbucket.org/MrZidan150/mlut-lib.git  
git fetch mlut 
git merge --allow-unrelated-histories mlut/master 
npm i
```

## How to use
For building and automation in MLUT uses the `gulp` task runner.
### Build MLUT
You can build MLUT in css and link it to html. For building use npm script:
```
npm run mlut-build-css
```
or similarly for build scss if you want include it to `style.scss`
```
npm run mlut-build-scss
```
both scripts put `mlut.min.*` to `src/libs` directory.

Before building you can change some options or flags in `src/sass/includes/_vars.scss` and get bundle with the required options.

### Git ignore MLUT sources
If you don't want commit MLUT sources run:
```
npm run mlut-git-ignore
```

### Build the project
To start development server with livereload run gulp watcher:
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
by default your `index.html` will be on `localhost:3000`.

To build project without watcher or minify images use:
```
npm run build 
```
or
```
gulp build
```

All code and assets for production are in `build` directory.

#### Code
For writing html by default is used Pug template engine. Files from `src/pug` will be compiled to html in `src` except those in the `src/pug/includes`. It contains code for reuse on different pages. If you don't want use `pug` delete `src/pug` directory from the project.

For writing styles is used LibSass (scss syntax).

All styles should be written or included in `src/sass/style.scss`:
```scss
@import "my-block";
```
similarly for js in `src/js/script.js` via `gulp-rigger`:
```js
//= block.js
```

All styles from `src/sass` will be linted by `stylelint`. 

For store third party libs use `src/libs` directory. Files from this directory is not linted. Also they is ignored by git except for `mlut.*` files.

You can include MLUT blocks and utils in `style.sccs` optionally or remove their from file if you already use styles bundle.

All build configs are in `gulpfile.js` and `package.json`.

#### Assets
Images put in `src/img` directory. All images from there will be minified except for those in the `src/img/sprite-parts`. This directory is needed for store the parts of css sprites.

Web fonts put in `src/fonts`.

All assets for production also are in `build` directory.