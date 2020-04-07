/* eslint-disable no-unused-vars */
const path = require('path');
const RocketFrontCore = require('./bin/index');

const context = path.resolve(__dirname, 'frontent');
const Core = new RocketFrontCore(context, __dirname);

const arg = process.argv[2];

switch (arg) {
	case 'page':
		Core.CreatePage();
		break;
	case 'vue':
		Core.AddVue();
		break;
	case 'plugin':
		Core.CreatePlugin();
		break;
	case 'component':
		Core.CreateComponent();
		break;
	default:
		break;
}

// if (arg === 'page') {
// 	Core.CreatePage();
// } else if (arg === 'vue') {
// 	Core.AddVue();
// }
