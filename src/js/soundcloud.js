export class SoundCloudAudio {
	constructor() {
		this.apiEndpoint = 'https://api.soundcloud.com';
		this.clientId = '237d195ad90846f5e6294ade2e8cf87b';
		this.audio = new Audio();
		this.audio.crossOrigin = 'anonymous';
		this.np = {};
		this.loadRandomTrack();
	}

	async loadTrack(url) {
		let resolveUrl = `${this.apiEndpoint}/resolve.json?url=${url}/tracks&client_id=${this.clientId}`;

		const response = await fetch(resolveUrl, {method: 'get'});
		const json = await response.json();

		this.np = json;
		this.audio.src = `${this.apiEndpoint}/tracks/${json.id}/stream?client_id=${this.clientId}`;
	}

	async loadRandomTrack() {
		let tracksUrl = `${this.apiEndpoint}/tracks?client_id=${this.clientId}`;

		const response = await fetch(tracksUrl, {method: 'get'});
		const json = await response.json();

		this.np = json[Math.floor(Math.random()*json.length)];
		this.audio.src = `${this.np.stream_url}?client_id=${this.clientId}`;
	}
}
