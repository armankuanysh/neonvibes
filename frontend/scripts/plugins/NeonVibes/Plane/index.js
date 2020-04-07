/**
 * @public
 */
class Plane {
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
	 * @param  {object} texture
	 * @param  {object} color
	 * @returns {object}
	 */
	createPlane(width, height, texture, color) {
		const geometry = new this.THREE.PlaneGeometry(width, height, 32, 32);
		const material = !texture
			? new this.THREE.MeshStandardMaterial({ color: color || 0xffffff })
			: new this.THREE.MeshStandardMaterial({ map: texture });
		const plane = new this.THREE.Mesh(geometry, material);
		return plane;
	}
}

export default Plane;
