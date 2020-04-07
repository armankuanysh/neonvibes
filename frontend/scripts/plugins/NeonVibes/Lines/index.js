class Lines {
	constructor(three) {
		this.THREE = three;
	}

	createLines() {
		const geometry = new this.THREE.Geometry();
		const material = new this.THREE.LineBasicMaterial({ color: 0xffffff });
		geometry.vertices.push(
			new this.THREE.Vector3(-10, 0, 0),
			new this.THREE.Vector3(0, 10, 0),
			new this.THREE.Vector3(10, 0, 0)
		);
		const line = new this.THREE.Line(geometry, material);
		return line;
	}
}

export default Lines;
