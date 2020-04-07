/**
 * @class
 */
class Box {
	/**
	 * @constructor
	 * @param {object} three - THREE.js instance
	 */
	constructor(three) {
		this.THREE = three;
	}

	/**
	 * @public
	 * @param  {number} width
	 * @param  {number} height
	 * @param  {number} depth
	 * @param  {string} color
	 * @returns {object}
	 */
	createBox(width, height, depth, color) {
		const geometry = new this.THREE.BoxGeometry(width, height, depth);
		const material = new this.THREE.MeshStandardMaterial({ color });
		const box = new this.THREE.Mesh(geometry, material);

		return box;
	}
}

export default Box;
