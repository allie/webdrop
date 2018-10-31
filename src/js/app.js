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
		let bins = Math.floor(soundData.freq.mix.length * 0.75);

		let sliceWidth = Math.floor(canvas.width / bins / 2);
		let centreX = canvas.width / 2;
		let centreY = canvas.height / 2;

		// Left
		for (const [i, val] of soundData.freq.l.entries()) {
			if (i == bins) {
				break;
			}

			let height = Math.floor((val / 255.0) * canvas.height / 2);
			let hue = Math.floor((i * 1.0 / soundData.freq.l.length) * 360.0);
			let y = centreY - height;

			ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;
			ctx.fillRect(centreX - ((i + 1) * sliceWidth), y, sliceWidth, height * 2);
		}

		// Right
		for (const [i, val] of soundData.freq.r.entries()) {
			if (i == bins) {
				break;
			}

			let height = Math.floor((val / 255.0) * canvas.height / 2);
			let hue = Math.floor((i * 1.0 / soundData.freq.r.length) * 360.0);
			let y = centreY - height;

			ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;
			ctx.fillRect(centreX + (i * sliceWidth), y, sliceWidth, height * 2);
		}
	});

	vis.start();
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sc-load').onclick = initAudio;
});
