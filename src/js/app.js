import { SoundCloudAudio } from './soundcloud';
import { Visualizer } from './visualizer';

class App {
	constructor() {
		this.context = new (window.AudioContext || window.webkitAudioContext);
		this.source = null;
		this.visualizer = null;
		this.showControls = true;

		this.controls = {
			container: document.getElementById('controls-inner'),
			url: document.getElementById('sc-url'),
			load: document.getElementById('sc-load')
		};

		this.sc = new SoundCloudAudio();
		this.source = this.context.createMediaElementSource(this.sc.audio);
		this.visualizer = new Visualizer(this.source, 'render-area');
		this.visualizer.setDrawFunc(this.drawFunc);
		this.visualizer.node.connect(this.context.destination);
		this.initDOMElements();
		this.loadRandomTrack();
	}

	initDOMElements() {
		this.controls.load.onclick = this.loadTrackFromUrl.bind(this);
		this.controls.url.onkeyup = ((e) => {
			if (e.keyCode === 13) {
				this.loadTrackFromUrl();
			}
		}).bind(this);
	}

	loadTrackDOMElements() {

	}

	async loadTrackFromUrl() {
		this.visualizer.pause();
		let url = this.controls.url.value;
		await this.sc.loadTrack(url);
		this.startTrack();
	}

	async loadRandomTrack() {
		this.pause();
		await this.sc.loadRandomTrack();
		this.startTrack();
	}

	startTrack() {
		this.loadTrackDOMElements();
		this.play();
		this.hideControls();
	}

	async play() {
		if (this.source) {
			await this.source.mediaElement.play();
			this.visualizer.start();
		}
	}

	async pause() {
		if (this.source) {
			await this.source.mediaElement.pause();
			this.visualizer.pause();
		}
	}

	showControls() {
		this.controls.container.classList.add('inactive');
	}

	hideControls() {
		this.controls.container.classList.remove('inactive');
	}

	drawFunc(canvas, ctx, soundData) {
		// Cut off at a certain frequency
		let bins = Math.floor(soundData.wave.mix.length * 0.5);

		let sliceWidth = canvas.width / bins / 2;
		let centreX = canvas.width / 2;
		let centreY = canvas.height / 2;

		// Level circles
		let circleWidth = canvas.width / 3;
		let radius = circleWidth / 2;
		ctx.strokeStyle = `hsla(0, 0%, 100%, 0.3)`;
		ctx.lineWidth = 10;

		// Bass
		ctx.beginPath();
		ctx.arc(radius, centreY, radius * soundData.bass.normalized * 1.5, 0, 2 * Math.PI, false);
		ctx.stroke();

		// Mid
		ctx.beginPath();
		ctx.arc(circleWidth + radius, centreY, radius * soundData.mid.normalized * 1.5, 0, 2 * Math.PI, false);
		ctx.stroke();

		// Treble
		ctx.beginPath();
		ctx.arc(circleWidth * 2 + radius, centreY, radius * soundData.treble.normalized * 1.5, 0, 2 * Math.PI, false);
		ctx.stroke();

		ctx.fillStyle = `hsla(0, 0%, 100%, 0.1)`;

		// Left freq
		for (const [i, val] of soundData.freqNormalized.l.entries()) {
			if (i == bins) {
				break;
			}

			let height = Math.floor(val * canvas.height / 4);
			let hue = Math.floor((i * 1.0 / soundData.freq.l.length) * 360.0);
			let y = centreY - height;

			ctx.fillRect(centreX - ((i + 1) * sliceWidth), y, 1, height * 2);
		}

		// Right freq
		for (const [i, val] of soundData.freqNormalized.r.entries()) {
			if (i == bins) {
				break;
			}

			let height = Math.floor(val * canvas.height / 4);
			let hue = Math.floor((i * 1.0 / soundData.freq.r.length) * 360.0);
			let y = centreY - height;

			ctx.fillRect(centreX + (i * sliceWidth), y, 1, height * 2);
		}

		// Left wave
		for (const [i, val] of soundData.wave.l.entries()) {
			if (i == bins) {
				break;
			}

			let hue = Math.floor((i * 1.0 / bins) * 360.0);

			ctx.beginPath();

			if (i == 0) {
				ctx.moveTo(0, centreY);
			} else {
				ctx.moveTo((i - 1) * sliceWidth, soundData.wave.l[i - 1] * centreY + centreY);
			}

			ctx.strokeStyle = `hsl(${hue}, 50%, 50%)`;
			ctx.lineWidth = 3;
			ctx.lineTo(
				i * sliceWidth,
				soundData.wave.l[i] * centreY + centreY
			);

			ctx.stroke();
		}

		// Right wave
		for (const [i, val] of soundData.wave.r.entries()) {
			if (i == bins) {
				break;
			}

			let hue = Math.floor((i * 1.0 / bins) * 360.0);

			ctx.beginPath();

			if (i == 0) {
				ctx.moveTo(canvas.width, centreY);
			} else {
				ctx.moveTo(canvas.width - ((i - 1) * sliceWidth), soundData.wave.r[i - 1] * centreY + centreY);
			}

			ctx.strokeStyle = `hsl(${hue}, 50%, 50%)`;
			ctx.lineWidth = 3;
			ctx.lineTo(
				canvas.width - (i * sliceWidth),
				soundData.wave.r[i] * centreY + centreY
			);

			ctx.stroke();
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let app = new App();
});
