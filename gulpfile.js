//* --> GULP START <-- *//
const gulp = require('gulp');
const plumber = require('gulp-plumber');
//-
const gNunjucks = require('gulp-nunjucks-render');
const prettify = require('gulp-prettify');
//-
const gSass = require('gulp-sass');
const gPostcss = require('gulp-postcss');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const hexrgba = require('postcss-hexrgba');
const colorRgbaFallback = require('postcss-color-rgba-fallback');
//-
const gWebpack = require('gulp-webpack');
const wStream = require('webpack-stream');
const webpack = require('webpack');
const named = require('vinyl-named');
const uglify = require('gulp-uglify');
//-
const svgSprites = require('gulp-svg-sprite');
//-
const del = require('del');
const inject = require('gulp-inject');
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const gUseref = require('gulp-useref');
const size = require('gulp-size');
const browserSync = require('browser-sync');
const gIf = require('gulp-if');
//-
const fs = require('fs');
const rl = require('readline');
const webpackConfig = require('./webpack.config');

const { reload } = browserSync;

//* ==> PATHS <== *//
const DEV = 'frontend';
const BUILD = 'web';
const TMP = '.tmp';
const PATHS = {
	dest: BUILD,
	tmp: TMP,
	views: {
		pages: `${DEV}/views/*.njk`,
		src: `${DEV}/views`,
		dest: BUILD
	},
	styles: {
		main: `${DEV}/styles/main.scss`,
		src: `${DEV}/styles/*.scss`,
		dest: `${BUILD}/css`
	},
	js: {
		src: `${DEV}/scripts/*.js`,
		dest: `${BUILD}/scripts`
	},
	assets: {
		fonts: {
			src: `${DEV}/fonts/**/*`,
			dest: `${BUILD}/fonts`
		},
		images: {
			src: `${DEV}/images/**/*`,
			dest: `${BUILD}/images`
		},
		svg: {
			src: `${DEV}/images/svg/*.svg`,
			dest: `${DEV}/images/`
		}
	}
};

const isProd = true;

//* ==> CONFIG TASKS <== *//
//* * *
//* -> CLEAN BUILD DIR START <- *//
gulp.task(
	'clean',
	del.bind(null, [
		TMP,
		`${BUILD}/**`,
		`!${BUILD}`,
		`!${BUILD}/css/**`,
		`!${BUILD}/js/**`,
		`!${BUILD}/*.php`,
		`!${BUILD}/assets/**`,
		`!${BUILD}/media/**`,
		`!${BUILD}/i/**`
	])
);
//* -> CLEAN BUILD DIR END <- *//
//* *
//* -> BUILD TEMPLATES START <- *//
function nunjucks() {
	return gulp
		.src(PATHS.views.pages)
		.pipe(plumber())
		.on('error', err => console.log('VIEWS error: ', err))
		.pipe(
			gNunjucks({
				path: PATHS.views.src,
				data: { markup: !isProd }
			})
		)
		.pipe(gulp.dest(PATHS.tmp))
		.pipe(gIf(browserSync.active, reload({ stream: true, once: true })));
}
function indexTemplate() {
	return gulp
		.src(`${PATHS.tmp}/index.html`)
		.pipe(
			inject(
				gulp.src([`${PATHS.tmp}/*.html`, `!${PATHS.tmp}/index.html`], {
					read: false,
					allowEmty: true
				}),
				{
					transform: filepath => {
						if (
							filepath.indexOf('assets') > -1 ||
							filepath.indexOf('index.html') > -1
						) {
							return;
						}
						filepath = filepath.replace(`/${PATHS.tmp}/`, '');
						if (filepath.slice(-5) === '.html') {
							return `
                <li><a href="${filepath}" target="_blank">${filepath}</a></li>
              `;
						}
						return inject.transform.apply(inject.transform, arguments);
					}
				}
			)
		)
		.pipe(gulp.dest(PATHS.tmp));
}
exports.nunjucks = nunjucks;
exports.indexTemplate = indexTemplate;

gulp.task('views', gulp.series(nunjucks, indexTemplate));
//* -> BUILD TEMPLATES END <- *//
//* *
//* -> BUILD STYLES START <- *//
function sass() {
	return gulp
		.src(PATHS.styles.src)
		.pipe(plumber())
		.on('error', err => {
			console.log('STYLES error: ', err);
		})
		.pipe(
			gSass
				.sync({
					outputStyle: 'expanded',
					precision: 10,
					includePaths: ['.']
				})
				.on('error', gSass.logError)
		)
		.pipe(
			gPostcss([
				cssnext({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] }),
				hexrgba(),
				colorRgbaFallback()
			])
		)
		.pipe(gulp.dest(`${PATHS.tmp}/styles`))
		.pipe(browserSync.stream());
}
exports.sass = sass;

gulp.task('styles', gulp.series(sass));
//* -> BUILD STYLES END <- *//
//* *
//* -> BUILD JS START *//
function js() {
	return gulp
		.src(PATHS.js.src)
		.pipe(named())
		.pipe(wStream(webpackConfig), webpack)
		.pipe(gulp.dest(`${PATHS.tmp}/scripts`))
		.pipe(browserSync.stream());
}
function buildJs() {
	return gulp
		.src(PATHS.js.src)
		.pipe(named())
		.pipe(gWebpack(webpackConfig, webpack))
		.pipe(gulp.dest(`${BUILD}/scripts`));
}
exports.js = js;

gulp.task('js', gulp.series(js));
gulp.task('buildJs', gulp.series(buildJs));
//* -> BUILD JS END *//
//* *
//* -> USEREF START *//
function userefAssets() {
	return gulp
		.src(`${TMP}/index.html`)
		.pipe(gUseref({ searchPath: [TMP, DEV, '.'] }))
		.pipe(
			gIf(
				'*.bundle.js',
				uglify({ compress: { drop_console: true } }).on('error', err => {
					console.log('🐞: useref -> err', err);
				})
			)
		)
		.pipe(
			gIf('*.css', gPostcss([cssnano({ safe: true, autoprefixer: false })]))
		)
		.pipe(gIf('!*.html', gulp.dest(BUILD)));
}
function userefHtml() {
	return gulp
		.src(`${TMP}/*.html`)
		.pipe(prettify({ indent_size: 2, eol: '\r\n' }))
		.pipe(gUseref({ noAssets: true }))
		.pipe(gulp.dest(BUILD));
}

exports.userefAssets = userefAssets;
exports.userefHtml = userefHtml;

gulp.task(
	'useref',
	gulp.series(['views', 'styles', 'buildJs'], userefAssets, userefHtml)
);
//* -> USEREF START *//
//* *
//* -> COPY ASSETS START *//
function fonts() {
	return gulp
		.src(PATHS.assets.fonts.src)
		.pipe(gulp.dest(PATHS.assets.fonts.dest))
		.pipe(gIf(browserSync.active, reload({ stream: true, once: true })));
}
function images() {
	return gulp
		.src(PATHS.assets.images.src)
		.pipe(
			gIf(
				!'sprite.symbol.svg',
				cache(
					imagemin({
						progressive: true,
						interlaced: true,
						optimizationLevel: 5,
						// don't remove IDs from SVGs, they are often used
						// as hooks for embedding and styling
						svgoPlugins: [
							{
								cleanupIDs: false
							},
							{
								removeViewBox: false
							}
						]
					})
				)
			)
		)
		.pipe(gulp.dest(PATHS.assets.images.dest))
		.pipe(gIf(browserSync.active, reload({ stream: true, once: true })));
}
function svgs() {
	return gulp
		.src(PATHS.assets.svg.src)
		.pipe(plumber())
		.pipe(
			svgSprites({
				mode: {
					symbol: true
				}
			})
		)
		.on('error', err => {
			console.log('🐞: svgs -> err', err);
		})
		.pipe(gulp.dest(PATHS.assets.svg.dest));
}

exports.fonts = fonts;
exports.images = images;
exports.svgs = svgs;

gulp.task('fonts', gulp.series(fonts));
gulp.task('images', gulp.series(images));
gulp.task('svgs', gulp.series(svgs));
//* -> COPY ASSETS END *//
//* * * *
//* * *
//* *
//* * *
//* * * *
//* -> RUN DEV START *//
function LoacalServer() {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: [TMP, DEV],
			routes: {
				'/node_modules': 'node_modules'
			}
		},
		logPrefix: '🚀: ROCKETFRONT :🌑',
		logConnections: true,
		ghostMode: false
	});

	gulp.watch(`${DEV}/views/**/*.njk`, gulp.series('views'));
	gulp.watch(`${DEV}/styles/**/*.scss`, gulp.series('styles'));
	gulp.watch(`${DEV}/scripts/**/*.js`, gulp.series('js'));
	gulp.watch(`${DEV}/images/**/*`, gulp.series('images'));
	gulp.watch(`${DEV}/fonts/**/*`, gulp.series('fonts'));
	gulp.watch(`${DEV}/images/svg/*`, gulp.series('svgs'));
}
function LocalServerWeb() {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: [PATHS.dest]
		}
	});
}
exports.LoacalServer = LoacalServer;
gulp.task(
	'serve',
	gulp.series(gulp.series('views', 'styles', 'js', 'svgs'), LoacalServer)
);
gulp.task('serve:web', gulp.series(LocalServerWeb));
//* -> RUN DEV END *//
//* * * *
//* * *
//* *
//* * *
//* * * *
//* -> BUILD START *//
function BuildMarkup() {
	return gulp
		.src([`${BUILD}/**/*`, `!${BUILD}/media/**/*`])
		.pipe(size({ title: 'build', gzip: true }));
}
exports.BuildMarkup = BuildMarkup;
gulp.task(
	'build',
	gulp.series(['clean', 'useref', 'images', 'fonts'], BuildMarkup)
);
//* -> BUILD END *//
//* * * *
//* * *
//* *
//* * *
//* * * *
//* -> ADD SYNC START *//
function AddSync() {
	const init = () => {
		const filename = 'package.json';
		let obj = {};
		const prompts = rl.createInterface(process.stdin, process.stdout);
		const command =
			'rsync -auFFv --del --delete-excluded web/ rocketman@rocketfirm.net:/var/www/vhosts/rocketfirm.net/markup.rocketfirm.net/';
		const commandName = 'sync';

		const writeToFile = cmd => {
			if (obj) {
				if (!obj.scripts) obj.scripts = {};
				obj.scripts[commandName] = cmd;
				const json = JSON.stringify(obj, null, 4);
				fs.watchFile(filename, json, 'utf8', err => {
					if (err) {
						console.log('Что-то пошло не так :3(');
					} else {
						console.log(
							`Все сделано! Теперь можешь заливать изменения \nпо комманде 'npm run ${commandName}' или 'yarn ${commandName}'`
						);
					}
				});
			}
		};

		const RARL = () => {
			prompts.question(
				'Введи название папки на маркапе (название проекта): /',
				answer => {
					const foldername = answer.trim();
					if (foldername === 'exit') {
						console.log('Ну, пока!');
						prompts.close();
						return process.exit(1);
					} else if (!foldername.length) {
						prompts.close();
						RARL();
					} else {
						prompts.close();
						writeToFile(command + foldername);
					}
				}
			);
		};

		fs.readFile(filename, 'utf8', function readFileCallback(err, data) {
			if (err) {
				console.error(err);
				process.exit(1);
			} else {
				obj = JSON.parse(data); // now it an object

				if (obj.scripts && obj.scripts[commandName]) {
					const cmd = obj.scripts[commandName];
					if (typeof cmd === 'string' && cmd.length) {
						const re = /(?:\/[^\\/\r\n]*)$/g;
						const current = re.exec(cmd);
						prompts.question(
							`Синхронизация уже настроена. \nПапка ${current} \nПеренастроить? (y/n)`,
							answer => {
								if (answer === 'exit' || answer === 'n') {
									console.log('Ну пока (:');
									prompts.close();
									return process.exit(1); // closing RL and returning from function.
								} else if (answer === 'y') {
									// prompts.close();
									RARL();
								}
							}
						);
					}
				} else {
					RARL();
				}
			}
		});
	};
	return init();
}

exports.AddSync = AddSync;

gulp.task('add-sync', gulp.series(AddSync));
//* -> ADD SYNC END *//
