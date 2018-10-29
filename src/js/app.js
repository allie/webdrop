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

	vis.setDrawFunc((canvas, ctx, freqData) => {
		let sliceWidth = Math.floor(canvas.width / freqData.length);

		for (const [i, val] of freqData.entries()) {
			let height = Math.floor((val / 128.0) * canvas.height);
			let hue = Math.floor((i * 1.0 / freqData.length) * 360.0);
			let y = canvas.height - height;

			ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
			ctx.fillRect(i * sliceWidth, y, sliceWidth, height);
		}
	});

	vis.start();
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sc-load').onclick = initAudio;
});
