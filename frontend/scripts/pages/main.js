import NeonVibes from '../plugins/NeonVibes/index';

const nv = new NeonVibes({
	container: '.hero',
	images: [
		'images/assets/pic1.png',
		'images/assets/pic2.png',
		'images/assets/pic3.png'
	]
});

nv.render();
