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
		let bins = Math.floor(soundData.wave.mix.length * 0.6);

		let sliceWidth = canvas.width / bins / 2;
		let centreX = canvas.width / 2;
		let centreY = canvas.height / 2;

		ctx.fillStyle = `hsl(0, 0%, 20%)`;

		// Left freq
		for (const [i, val] of soundData.freq.l.entries()) {
			if (i == bins) {
				break;
			}

			let height = Math.floor((val / 255.0) * canvas.height / 2);
			let hue = Math.floor((i * 1.0 / soundData.freq.l.length) * 360.0);
			let y = centreY - height;

			ctx.fillRect(centreX - ((i + 1) * sliceWidth), y, 1, height * 2);
		}

		// Right freq
		for (const [i, val] of soundData.freq.r.entries()) {
			if (i == bins) {
				break;
			}

			let height = Math.floor((val / 255.0) * canvas.height / 2);
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
				ctx.moveTo((i - 1) * sliceWidth, Math.floor((soundData.wave.l[i - 1] / 255.0) * canvas.height));
			}

			ctx.strokeStyle = `hsl(${hue}, 50%, 50%)`;
			ctx.lineWidth = 3;
			ctx.lineTo(
				i * sliceWidth,
				Math.floor((soundData.wave.l[i] / 255.0) * canvas.height)
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
				ctx.moveTo(canvas.width - ((i - 1) * sliceWidth), Math.floor((soundData.wave.r[i - 1] / 255.0) * canvas.height));
			}

			ctx.strokeStyle = `hsl(${hue}, 50%, 50%)`;
			ctx.lineWidth = 3;
			ctx.lineTo(
				canvas.width - (i * sliceWidth),
				Math.floor((soundData.wave.r[i] / 255.0) * canvas.height)
			);

			ctx.stroke();
		}
	});

	vis.start();
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sc-load').onclick = initAudio;
});
