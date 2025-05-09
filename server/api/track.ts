import { ref } from "vue";
import { getAverageColor } from "fast-average-color-node";

const config = useRuntimeConfig();

export default defineEventHandler(
	async () => await getCurrentlyListeningTrack(),
);

const songState = ref<TrackInfo | null>(null);

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
		.then(async (track): Promise<TrackInfo> => {
			if (songState?.value?.trackName === track?.name) return songState.value;

			if (
				track.image[3]["#text"] ===
				"https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"
			)
				track.image[3]["#text"] = "";

			let hex = "#00000000";
			if (track.image[3]["#text"] !== "") {
				hex = await getAvgColor(track.image[3]["#text"]);
			}
			return {
				isPlaying: track["@attr"].nowplaying === "true",
				trackName: track.name,
				artistName: track.artist["#text"],
				albumImageUrl: track.image[3]["#text"],
				trackUrl: track.url,
				hex,
			};
		})
		.catch(() => null);

async function getAvgColor(imgUrl: string) {
	try {
		const res = await $fetch<ArrayBuffer>(imgUrl, {
			responseType: "arrayBuffer",
		});

		const buffer = Buffer.from(res);

		if (buffer.length === 0) {
			throw new Error("Empty image data");
		}

		const c = await getAverageColor(buffer, {
			ignoredColor: [0, 0, 0, 0],
		});

		return c.hex;
	} catch (error) {
		return "#000000";
	}
}
