import { SoundCloudAudio } from './soundcloud';
import { Visualizer } from './visualizer';

async function initAudio() {
	let url = document.getElementById('sc-url').value;

	let sc = new SoundCloudAudio();
	await sc.loadTrack(url);

	let ctx = new (window.AudioContext || window.webkitAudioContext);
	let source = ctx.createMediaElementSource(sc.audio);

	let vis = new Visualizer(source, 'render-area');
	vis.node.connect(ctx.destination);

	await source.mediaElement.play();

	vis.setDrawFunc((canvas, ctx, soundData) => {
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
	});

	vis.start();
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sc-load').onclick = initAudio;
	document.getElementById('sc-url').onkeyup = (e) => {
		if (e.keyCode === 13) {
			initAudio();
		}
	};
	document.getElementById('sc-url').value = `https://soundcloud.com/seanmusicc/moe-shop-the-new-moe-groove-buy-link-is-free-download`;
});
