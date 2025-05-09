interface BreadcrumbItem {
	text: string;
	to?: string;
}

interface Work {
	active: boolean;
	title: string;
	start_date: string; // YYYY-MM-DD
	end_date: string; // YYYY-MM-DD
	company: string;
	location: string;
	description_items: string[];
	short_description: string;
	link?: string;
}

interface Command {
	id: string;
	label: string;
	icon?: string;
	to?: string;
	action?: () => void;
	shortcuts?: string[];
}

interface CommandGroup {
	key: string;
	label: string;
	commands: Command[];
}

interface LastFmTrack {
	artist: {
		mbid: string;
		"#text": string;
	};
	streamable: string;
	image: {
		size: string;
		"#text": string;
	}[];
	mbid: string;
	album: {
		mbid: string;
		"#text": string;
	};
	name: string;
	"@attr": {
		nowplaying: string;
	};
	url: string;
}

interface TrackInfo {
	isPlaying: boolean;
	trackName: string | null;
	artistName: string | null;
	albumImageUrl: string | null;
	trackUrl: string | null;
	hex: string | null; // hex color of the album image
}

interface Command {
	id: string;
	label: string;
	icon?: string;
	to?: string;
	action?: () => void;
	shortcuts?: string[];
}

interface CommandGroup {
	key: string;
	label: string;
	commands: Command[];
}

interface FetchedPost {
	path: string;
	title: string;
}

interface ReadingTime {
	text: string;
	minutes: number;
	time: number;
	words: number;
}
