export class Visualizer {
	constructor(source, canvas) {
		this.sampleCount = 1024;

		// Web audio nodes
		this.source = source;
		this.audioCtx = this.source.context;

		this.analyser = this.audioCtx.createAnalyser();
		this.source.connect(this.analyser);
		this.analyser.fftSize = this.sampleCount * 2;
		this.analyser.smoothingTimeConstant = 0;

		// Left channel
		this.analyserL = this.audioCtx.createAnalyser();
		this.analyserL.fftSize = this.sampleCount * 2;
		this.analyserL.smoothingTimeConstant = 0;

		// Right channel
		this.analyserR = this.audioCtx.createAnalyser();
		this.analyserR.fftSize = this.sampleCount * 2;
		this.analyserR.smoothingTimeConstant = 0;

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
				mix: new Float32Array(this.sampleCount),
				l: new Float32Array(this.sampleCount),
				r: new Float32Array(this.sampleCount)
			},
			freqNormalized: {
				mix: new Float32Array(this.sampleCount),
				l: new Float32Array(this.sampleCount),
				r: new Float32Array(this.sampleCount)
			},
			wave: {
				mix: new Float32Array(this.sampleCount),
				l: new Float32Array(this.sampleCount),
				r: new Float32Array(this.sampleCount)
			},
			bass: {
				total: 0,
				average: 0,
				normalized: 0,
				relative: 0
			},
			mid: {
				total: 0,
				average: 0,
				normalized: 0,
				relative: 0
			},
			treble: {
				total: 0,
				average: 0,
				normalized: 0,
				relative: 0
			},
			volume: 0
		};

		// FPS data
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
		// Raw wave data
		this.analyser.getFloatTimeDomainData(this.soundData.wave.mix);
		this.analyserL.getFloatTimeDomainData(this.soundData.wave.l);
		this.analyserR.getFloatTimeDomainData(this.soundData.wave.r);

		// Raw frequency data
		this.analyser.getFloatFrequencyData(this.soundData.freq.mix);
		this.analyserL.getFloatFrequencyData(this.soundData.freq.l);
		this.analyserR.getFloatFrequencyData(this.soundData.freq.r);

		// Normalized frequency data
		let normalize = (val) => {
			let scale = 1.0 / (this.analyser.maxDecibels - this.analyser.minDecibels);
			return scale * (val - this.analyser.minDecibels);
		};

		this.soundData.freqNormalized.mix = this.soundData.freq.mix.map(normalize);
		this.soundData.freqNormalized.l = this.soundData.freq.l.map(normalize);
		this.soundData.freqNormalized.r = this.soundData.freq.r.map(normalize);

		// Calculate the frequency range for each of 3 frequency bands
		let range = {
			min: 100,
			max: this.audioCtx.sampleRate / 4
		};

		let octaves = Math.log(range.max / range.min) / Math.log(2);
		let octavesPerBand = octaves / 3;

		let bassStart = range.min;
		let midStart = range.min * Math.pow(2, octavesPerBand);
		let trebleStart = range.min * Math.pow(2, octavesPerBand * 2);

		let bass = [];
		let mid = [];
		let treble = [];

		// Divide audio into bass, mid, and treble
		for (let i = 0; i < this.sampleCount / 2; i++) {
			let hz = i * (range.max / (this.sampleCount / 2));

			if (hz >= bassStart && hz < midStart) {
				bass.push(this.soundData.freq.mix[i]);
			}

			else if (hz >= midStart && hz < trebleStart) {
				mid.push(this.soundData.freq.mix[i]);
			}

			else if (hz >= trebleStart) {
				treble.push(this.soundData.freq.mix[i]);
			}
		}

		// Calculate total and average levels
		let sum = (total, val) => {
			return total + val;
		};
		this.soundData.bass.total = bass.reduce(sum);
		this.soundData.bass.average = this.soundData.bass.total / bass.length;
		this.soundData.mid.total = mid.reduce(sum);
		this.soundData.mid.average = this.soundData.mid.total / mid.length;
		this.soundData.treble.total = treble.reduce(sum);
		this.soundData.treble.average = this.soundData.treble.total / treble.length;

		// Average levels relative to one another; [0, 1]
		let norm = {
			min: Math.min(this.soundData.bass.average, this.soundData.mid.average, this.soundData.treble.average),
			max: Math.max(this.soundData.bass.average, this.soundData.mid.average, this.soundData.treble.average)
		};
		this.soundData.bass.relative = (this.soundData.bass.average - norm.min) / (norm.max - norm.min);
		this.soundData.mid.relative = (this.soundData.mid.average - norm.min) / (norm.max - norm.min);
		this.soundData.treble.relative = (this.soundData.treble.average - norm.min) / (norm.max - norm.min);

		// Average levels normalized by minimum and maximum decibels; [0, 1]
		this.soundData.bass.normalized = normalize(this.soundData.bass.average);
		this.soundData.mid.normalized = normalize(this.soundData.mid.average);
		this.soundData.treble.normalized = normalize(this.soundData.treble.average);
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
