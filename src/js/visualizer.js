export class Visualizer {
	constructor(source, canvas) {
		this.sampleCount = 512;

		// Web audio nodes
		this.source = source;
		this.audioCtx = this.source.context;

		this.analyser = this.audioCtx.createAnalyser();
		this.source.connect(this.analyser);
		this.analyser.fftSize = this.sampleCount * 2;
		this.analyser.smoothingTimeConstant = 0.85;

		// Left channel
		this.analyserL = this.audioCtx.createAnalyser();
		this.analyserL.fftSize = this.sampleCount * 2;
		this.analyserL.smoothingTimeConstant = 0.85;

		// Right channel
		this.analyserR = this.audioCtx.createAnalyser();
		this.analyserR.fftSize = this.sampleCount * 2;
		this.analyserR.smoothingTimeConstant = 0.85;

		// Split left and right channels
		this.splitter = this.audioCtx.createChannelSplitter(2);
		this.source.connect(this.splitter);
		this.splitter.connect(this.analyserL, 0);
		this.splitter.connect(this.analyserR, 1);

		// Output node
		this.node = this.analyser;

		// Visualization data
		this.soundData = {
			freq: {
				mix: new Uint8Array(this.sampleCount),
				l: new Uint8Array(this.sampleCount),
				r: new Uint8Array(this.sampleCount),
			},
			wave: {
				mix: new Uint8Array(this.sampleCount),
				l: new Uint8Array(this.sampleCount),
				r: new Uint8Array(this.sampleCount),
			},
			bass: 0.0,
			bassAttenuated: 0.0,
			mid: 0.0,
			midAttenuated: 0.0,
			treble: 0.0,
			trebleAttenuated: 0.0,
			volume: 0.0,
			volumeAttenuated: 0.0
		};

		this.lastFrameTime = Date.now();
		this.fps = 0;
		this.frame = 0;
		this.time = 0;

		this.displayFps = true;

		// Canvas
		this.canvas = document.getElementById(canvas);
		this.canvasCtx = this.canvas.getContext('2d');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	start() {
		this.nextFrame();
	}

	sampleData() {
		this.analyser.getByteFrequencyData(this.soundData.freq.mix);
		this.analyserL.getByteFrequencyData(this.soundData.freq.l);
		this.analyserR.getByteFrequencyData(this.soundData.freq.r);
		this.analyser.getByteTimeDomainData(this.soundData.wave.mix);
		this.analyserL.getByteTimeDomainData(this.soundData.wave.l);
		this.analyserR.getByteTimeDomainData(this.soundData.wave.r);
	}

	nextFrame() {
		this.frame++;

		if (!this.lastFrameTime) {
			this.lastFrameTime = Date.now();
			this.fps = 0;
			return;
		}

		let delta = (Date.now() - this.lastFrameTime) / 1000;
		this.lastFrameTime = Date.now();
		this.fps = 1 / delta;

		this.sampleData();

		this.draw();

		window.requestAnimationFrame(this.nextFrame.bind(this));
	}

	draw() {
		this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawFunc(this.canvas, this.canvasCtx, this.soundData);

		if (this.displayFps) {
			this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
			this.canvasCtx.textBaseline = 'top';
			this.canvasCtx.font = '20px Verdana';
			this.canvasCtx.fillText(this.fps.toFixed(2), 0, 0);
		}
	}

	setDrawFunc(draw) {
		this.drawFunc = draw;
	}
}
