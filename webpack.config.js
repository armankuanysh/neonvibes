const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const context = path.resolve(__dirname, 'frontend/scripts');
const entry = require(`${context}/index.js`);
const mode = process.env.PROJECT_MODE;

const JSLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: {
				presets: [
					[
						'@babel/preset-env',
						{
							useBuiltIns: 'entry',
							targets: {
								esmodules: true
							}
						}
					]
				]
			}
		},
		'eslint-loader'
	];
	return loaders;
};

const CONFIG = {
	mode,
	context,
	entry,
	output: {
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: JSLoaders()
			}
		]
	}
};

module.exports = CONFIG;
