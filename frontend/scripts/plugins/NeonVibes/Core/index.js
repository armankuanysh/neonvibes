/* eslint-disable class-methods-use-this */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * @class
 */
class Core {
	/**
	 * @constructor
	 * @param  {object} opt
	 * @param  {string} opt.container - selector of container '.container'
	 * @param  {array} opt.images
	 */
	constructor(opt) {
		console.log('🐞: Core -> constructor -> opt', opt);
		this.Container =
			opt && opt.container && document.querySelector(opt.container || 'body');
		this.Width = this.Container.offsetWidth || this.Container.innerWidth;
		this.Height = this.Container.offsetHeight || this.Container.innerHeight;
		this.Aspect = this.Width / this.Height;

		this.THREE = THREE;

		this.Scene = new THREE.Scene();
		this.Scene.background = this.color('#fdb35d');
		this.Scene.fog = new THREE.Fog(this.color('#e25a53'), 0, 800);

		this.Camera = new THREE.PerspectiveCamera(50, this.Aspect, 0.1, 1000);
		this.Camera.lookAt(this.Scene.position);
		this.Camera.position.set(0, 50, 200);

		this.Renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.Renderer.setSize(this.Width, this.Height);
		this.Container.appendChild(this.Renderer.domElement);

		this.Loader = new THREE.TextureLoader();
		this.ModelLoader = new GLTFLoader();

		this.Raycaster = new THREE.Raycaster();
		this.Mouse = new THREE.Vector2();

		window.addEventListener('resize', this.Resize, false);
		window.addEventListener('click', this.ClickManager.bind(this), false);

		this.SetLight();
		this.PostProcess();
	}

	/**
	 * @private
	 */
	Resize() {
		this.Width = this.Container.offsetWidth;
		this.Heigth = this.Container.offsetHeight;
		this.Camera.aspect = this.Width / this.Heigth;
		this.Renderer.setSize(this.Width, this.Heigth);
		this.Camera.updateProjectionMatrix();
		this.Renderer.render(this.Scene, this.Camera);
	}

	/**
	 * @private
	 */
	SetLight() {
		this.Ambient = new THREE.AmbientLight(0xffffff, 0.75);
		this.Scene.add(this.Ambient);

		this.Point1 = new THREE.PointLight(0xd45e98, 0.25, 100);
		this.Point1.position.set(80, 50, 100);
		this.Scene.add(this.Point1);

		this.Point2 = new THREE.PointLight(0x675e95, 0.25, 100);
		this.Point2.position.set(-80, 50, 100);
		this.Scene.add(this, this.Point2);
	}

	/**
	 * @private
	 */
	PostProcess() {
		this.Composer = new EffectComposer(this.Renderer);
		this.renderPass = new RenderPass(this.Scene, this.Camera);
		this.Composer.addPass(this.renderPass);

		const bloom = new UnrealBloomPass(
			[this.Width, this.Height],
			0.25,
			0.01,
			0.75
		);
		this.Composer.addPass(bloom);

		this.renderPass.renderToScreen = true;
	}

	/**
	 * @private
	 * @param  {object} event
	 */
	ClickManager(event) {
		event.preventDefault();

		this.Mouse.x =
			(event.clientX / this.Renderer.domElement.clientWidth) * 2 - 1;
		this.Mouse.y =
			-(event.clientY / this.Renderer.domElement.clientHeight) * 2 + 1;

		this.Raycaster.setFromCamera(this.Mouse, this.Camera);

		const intersects = this.Raycaster.intersectObjects(this.Scene.children);

		if (intersects.length > 0) {
			intersects[0].object.callback();
		}
	}

	/**
	 * @public
	 * @param  {string} color
	 * @returns  {object} THREE.Color object
	 */
	color(color) {
		return new THREE.Color(color);
	}

	/**
	 * @public
	 * @param {string} url - url to texture
	 * @returns  {object} Promise of loading texture
	 */
	textureLoader(url) {
		return new Promise(resolve => this.Loader.load(url, resolve));
	}

	/**
	 * @method
	 * @public
	 * @param  {number} limit
	 * @returns  {number} random number
	 */
	getRandom(limit) {
		return Math.floor(Math.random() * limit);
	}

	/**
	 * @public
	 * @param  {string} url - url to model
	 * @returns  {object} Promise of loading 3D model
	 */
	modelLoader(url) {
		return new Promise(resolve => this.ModelLoader.load(url, resolve));
	}

	/**
	 * @public
	 */
renderManager() {
	window.requestAnimationFrame(this.render.bind(this));
	this.Composer.render();
}
}

export default Core;
