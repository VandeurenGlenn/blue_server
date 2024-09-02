export function ago(dateString: string): string {
	const now = new Date();
	const pastDate = new Date(dateString);
	const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

	const intervals: {[key: string]: number} = {
		year: 31536000,
		month: 2592000,
		day: 86400,
		hour: 3600,
		minute: 60,
		second: 1,
	};

	for (const [unit, value] of Object.entries(intervals)) {
		const interval = Math.floor(seconds / value);
		if (interval >= 1) {
			return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
		}
	}

	return 'just now';
}
