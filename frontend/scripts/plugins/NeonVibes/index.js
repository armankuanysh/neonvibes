/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import { TimelineMax, TweenMax } from 'gsap';
import Core from './Core/index';
import Lines from './Lines/index';
import Plane from './Plane/index';
import Box from './Box/index';
import Events from './Events/index';
import Sphere from './Sphere/index';

/**
 * @class
 * @extends Core
 */
class NeonVibes extends Core {
	/**
	 * @constructor
	 * @param  {object} opt
	 * @param  {string} opt.container - selector of container '.container'
	 * @param  {array} opt.images
	 */
	constructor(opt) {
		super(opt);
		this.Options = opt;

		this.LineSpawner = new Lines(this.THREE);
		this.PlaneSpawner = new Plane(this.THREE);
		this.BoxSpawner = new Box(this.THREE);
		this.SphereSpawner = new Sphere(this.THREE);
		this.EventListener = new Events(this.THREE, this.Camera);

		this.Images = opt.images;

		this.Stars = [];

		this.Planes = [];
		this.BoxesState = [
			{
				name: 'box_left',
				x: -75
			},
			{
				name: 'box_center',
				x: 0
			},
			{
				name: 'box_right',
				x: 75
			},
			{
				name: 'box_left',
				x: -75
			},
			{
				name: 'box_center',
				x: 0
			},
			{
				name: 'box_right',
				x: 75
			}
		];
		this.Boxes = [];
		this.Counter = 0;
		this.TL = new TimelineMax();

		this.Level = 1.25;
		this.CurrentLevel = 0;
		this.Levels = [50, 100, 150];

		this.ScoreEl = document.querySelector('#score');
		this.Score = 0;

		this.SpawnLines();
		this.RenderFloor();
		this.RenderPerson();
		this.RenderBox();
		this.RenderStars();
		this.ListenKeyboard();
	}

	/**
	 * @private
	 */
	SpawnLines() {
		for (let i = 0; i < 100; i += 1) {
			this.Scene.add(this.LineSpawner.createLines());
		}
	}

	/**
	 * @private
	 */
	async RenderImage() {
		for (let index = 0; index < this.Images.length; index += 1) {
			const texture = await this.textureLoader(this.Images[index]);
			const plane = this.PlaneSpawner.createPlane(180, 90, texture);
			plane.position.set(index * 2, 75, -50);
			plane.rotation.x = 5 * (Math.PI / 180);
			plane.name = `plane_${index}`;
			plane.callback = () => {
				const el = this.Scene.getObjectByName(`plane_${index}`);
				const TL = new TimelineMax();
				let isMoved = false;
				if (!isMoved) {
					TL.to(el.position, 0.5, { x: 150 });
					isMoved = true;
				} else {
					TL.to(el.position, 0.5, { x: 0 });
					isMoved = false;
				}
			};
			this.Planes.push(plane);
			this.Scene.add(plane);
			if (index - 1 === this.Images.length) {
				this.Loaded = true;
			}
		}
	}

	/**
	 * @private
	 */
	async RenderLaptop() {
		this.Laptop = await this.modelLoader('images/assets/laptop/scene.gltf');
		console.log('🐞: NeonVibes -> RenderLaptop -> this.Laptop', this.Laptop);
		this.Laptop.scene.scale.set(30, 30, 30);
		this.Laptop.scene.rotation.x = 5 * (Math.PI / 180);
		this.Scene.add(this.Laptop.scene);
	}

	/**
	 * @method
	 * @private
	 */
	RenderPerson() {
		this.Person = this.BoxSpawner.createBox(10, 50, 5, this.color('#a4d9d6'));
		this.Person.position.y = 10;
		this.Person.position.z = 80;

		this.Scene.add(this.Person);
	}

	/**
	 * @method
	 * @private
	 */
	RenderBox() {
		const colors = ['#2F4858', '#675E95', '#00524D'];
		this.BoxesState.forEach((item, i) => {
			const box = this.BoxSpawner.createBox(
				50,
				50,
				50,
				this.color(colors[this.getRandom(3)])
			);
			box.name = `${item.name}_${i}`;
			box.position.x = item.x;
			box.position.y = 25;
			box.position.z = -1500;
			this.Boxes.push(box);

			this.Scene.add(box);
		});
	}

	/**
	 * @private
	 */
	RenderFloor() {
		const horizontalPosition = -(90 * (Math.PI / 180));
		const floor = this.PlaneSpawner.createPlane(250, 1000);
		floor.rotation.x = horizontalPosition;

		const underFloor = this.PlaneSpawner.createPlane(
			this.Width,
			1000,
			null,
			this.color('#a4d9d6')
		);
		underFloor.rotation.x = horizontalPosition;
		underFloor.position.y = -10;

		for (let i = 1; i < 6; i += 1) {
			const line = this.PlaneSpawner.createPlane(
				5,
				1000,
				null,
				this.color('#fdb35d')
			);
			line.rotation.x = horizontalPosition;
			line.position.y = 2;
			line.position.x = -100 + i * 33.3;
			this.Scene.add(line);
		}

		this.Scene.add(floor);
		this.Scene.add(underFloor);
	}

	/**
	 * @private
	 */
	RenderStars() {
		for (let z = -1000; z < 1000; z += 20) {
			const plane = this.PlaneSpawner.createPlane(2, 2, null, '#ffffff');
			plane.position.x = Math.random() * 1000 - 500;
			plane.position.y = Math.random() * 1000 - 500;
			plane.position.z = z;
			this.Scene.add(plane);
			this.Stars.push(plane);
		}
	}

	/**
	 * @private
	 */
	Listen() {
		this.Planes.forEach((plane, index) => {
			const TL = new TimelineMax();
			window.addEventListener('click', () => {
				TL.to(plane.position, 0.5, { x: 250 + index * 2 });
			});
		});
	}

	/**
	 * @method
	 * @private
	 */
	ListenKeyboard() {
		this.EventListener.keydown(this.Camera, this.Person);
	}

	/**
	 * @method
	 * @public
	 */
	render() {
		this.renderManager();
		this.Counter = this.getRandom(3);
		const counter = { var: this.Score };
		this.Boxes[this.Counter].position.y = 25;
		if (this.Boxes[this.Counter].position.z <= 199) {
			if (
				this.Boxes[this.Counter].position.z >= 80 &&
				this.Boxes[this.Counter].position.x === this.Person.position.x
			) {
				this.Boxes[this.Counter].position.z = -1500;
				this.Boxes[this.Counter].position.y = 0;
				this.Score += 1;
				TweenMax.to(counter, 0.25, {
					var: this.Score,
					onUpdate: () => {
						this.ScoreEl.innerHTML = Math.ceil(counter.var);
					}
				});
				if (this.Score > this.Levels[this.CurrentLevel]) {
					this.CurrentLevel += 1;
					this.Level -= 0.25;
				}
			}
			console.log('🐞: NeonVibes -> render -> this.Level', this.Level);
			this.TL.to(this.Boxes[this.Counter].position, this.Level, { z: 200 });
		} else {
			this.Boxes[this.Counter].position.z = -1500;
		}

		for (let i = 0; i < this.Stars.length; i += 1) {
			const star = this.Stars[i];

			star.position.z += i / 10;

			if (star.position.z > 1000) star.position.z -= 2000;
		}
	}
}

export default NeonVibes;
