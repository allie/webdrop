export class Visualizer {
	constructor(source, canvas) {
		// Web audio nodes
		this.source = source;
		this.audioCtx = this.source.context;
		this.analyser = this.audioCtx.createAnalyser();
		this.source.connect(this.analyser);
		this.analyser.fftSize = 256;
		this.node = this.analyser;

		// Visualization data
		this.freqData = new Uint8Array(this.analyser.fftSize / 2);

		// Canvas
		this.canvas = document.getElementById(canvas);
		this.canvasCtx = this.canvas.getContext('2d');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		setInterval(this.process.bind(this), 20);
	}

	start() {
		this.draw();
	}

	process() {
		this.analyser.getByteFrequencyData(this.freqData);
	}

	setDrawFunc(draw) {
		this.drawFunc = draw;
	}

	draw() {
		this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawFunc(this.canvas, this.canvasCtx, this.freqData);
		window.requestAnimationFrame(this.draw.bind(this));
	}
}
