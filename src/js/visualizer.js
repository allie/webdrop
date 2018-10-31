export class Visualizer {
	constructor(source, canvas) {
		this.freqBins = 512;

		// Web audio nodes
		this.source = source;
		this.audioCtx = this.source.context;

		this.analyser = this.audioCtx.createAnalyser();
		this.source.connect(this.analyser);
		this.analyser.fftSize = this.freqBins * 2;
		this.analyser.smoothingTimeConstant = 0.5;

		// Left channel
		this.analyserL = this.audioCtx.createAnalyser();
		this.analyserL.fftSize = this.freqBins * 2;
		this.analyserL.smoothingTimeConstant = 0.5;

		// Right channel
		this.analyserR = this.audioCtx.createAnalyser();
		this.analyserR.fftSize = this.freqBins * 2;
		this.analyserR.smoothingTimeConstant = 0.5;

		this.splitter = this.audioCtx.createChannelSplitter(2);
		this.source.connect(this.splitter);
		this.splitter.connect(this.analyserL, 0);
		this.splitter.connect(this.analyserR, 1);

		// Output node
		this.node = this.analyser;

		// Visualization data
		this.soundData = {
			freqData: new Uint8Array(this.freqBins),
			freqDataL: new Uint8Array(this.freqBins),
			freqDataR: new Uint8Array(this.freqBins)
		};

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
		this.analyser.getByteFrequencyData(this.soundData.freqData);
		this.analyserL.getByteFrequencyData(this.soundData.freqDataL);
		this.analyserR.getByteFrequencyData(this.soundData.freqDataR);
	}

	setDrawFunc(draw) {
		this.drawFunc = draw;
	}

	draw() {
		this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawFunc(this.canvas, this.canvasCtx, this.soundData);
		window.requestAnimationFrame(this.draw.bind(this));
	}
}
