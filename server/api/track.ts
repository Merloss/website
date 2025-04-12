const config = useRuntimeConfig();

export default defineEventHandler(
	async (event) => await getCurrentlyListeningTrack(),
);

const getCurrentlyListeningTrack = async () =>
	await $fetch(
		`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&limit=10&user=${config.LASTFM_USERNAME}&api_key=${config.LASTFM_WEB_API_KEY}&format=json`,
	)
		.then(
			(res: { recenttracks: { track: LastFmTrack[] } } | unknown) =>
				(
					res as { recenttracks: { track: LastFmTrack[] } }
				).recenttracks.track.filter((song: LastFmTrack) =>
					Object.prototype.hasOwnProperty.call(song, "@attr"),
				)[0] || null,
		)
		.then((track): TrackInfo => {
			if (
				track.image[3]["#text"] ===
				"https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"
			)
				track.image[3]["#text"] = "";
			return {
				isPlaying: track["@attr"].nowplaying === "true",
				trackName: track.name,
				artistName: track.artist["#text"],
				albumImageUrl: track.image[3]["#text"],
				trackUrl: track.url,
			};
		})
		.catch(() => null);
