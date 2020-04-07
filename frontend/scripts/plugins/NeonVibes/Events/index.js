/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable prefer-rest-params */
import { TimelineMax } from 'gsap';

/**
 * @class
 * @param  {object} three - THREE.js instance
 */
class Events {
	constructor(three) {
		this.THREE = three;
	}

	/**
	 * @method
	 * @public
	 * @param  {object} camera
	 * @param  {object} person
	 */
	keydown(camera, person) {
		const Camera = camera;
		const Person = person;
		const TL = new TimelineMax();
		console.log('🐞: Events -> keydown -> TL', TL);
		const step = 100;
		const personStep = 75;

		window.addEventListener('keydown', e => {
			e.stopImmediatePropagation();
			e.preventDefault();

			switch (e.keyCode) {
				case 68:
					if (Camera.position.x < 100) {
						// TL.isActive()
						if (!TL.isActive()) {
							TL.to(Camera.position, 0.25, { x: Camera.position.x + step });
							TL.to(
								Person.position,
								0.25,
								{ x: Person.position.x + personStep },
								'-=.25'
							);
						}
					}
					break;
				case 65:
					if (Camera.position.x > -100) {
						if (!TL.isActive()) {
							TL.to(Camera.position, 0.25, { x: Camera.position.x - step });
							TL.to(
								Person.position,
								0.25,
								{ x: Person.position.x - personStep },
								'-=.25'
							);
						}
					}
					break;
				default:
					break;
			}
		});
	}
}

export default Events;
