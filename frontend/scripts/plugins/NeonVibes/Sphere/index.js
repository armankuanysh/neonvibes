/**
 * @class
 */
class Sphere {
	/**
	 * @constructor
	 * @param  {object} three - THREE.js instance
	 */
	constructor(three) {
		this.THREE = three;
	}

	/**
	 * @method
	 * @public
	 * @param  {number} radius
	 * @param  {object} color - THREE.Color
	 * @returns {object} - shpehere object
	 */
	createSphere(radius, color) {
		const geometry = this.THREE.SphereGeometry(radius, 64, 64);
		const material = this.THREE.MeshStandardMaterial({ color });
		const sphere = this.THREE.Mesh(geometry, material);

		return sphere;
	}
}

export default Sphere;
