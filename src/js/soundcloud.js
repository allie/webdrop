export class SoundCloudAudio {
	constructor() {
		this.apiEndpoint = 'https://api.soundcloud.com/resolve.json';
		this.clientId = '237d195ad90846f5e6294ade2e8cf87b';
		this.audio = new Audio();
		this.audio.crossOrigin = 'anonymous';
	}

	async loadTrack(url) {
		let resolveUrl = `${this.apiEndpoint}?url=${url}/tracks&client_id=${this.clientId}`;

		const response = await fetch(resolveUrl, {method: 'get'});
		const json = await response.json();

		this.audio.src = `http://api.soundcloud.com/tracks/${json.id}/stream?client_id=${this.clientId}`;
	}
}
