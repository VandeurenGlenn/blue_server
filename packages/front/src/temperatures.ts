export type ColorPair = {
	background: string;
	foreground: string;
};

const thresholds: number[] = [0.3, 2, 5, 10, 25, 50, 100];

const grayColor: ColorPair = {background: '#bdbdbd', foreground: '#000000'};

const greenGradients: ColorPair[] = [
	{background: '#1b5e20', foreground: '#fff'}, // 10 (dark)
	{background: '#2e7d32', foreground: '#fff'}, // 9
	{background: '#388e3c', foreground: '#fff'}, // 8
	{background: '#43a047', foreground: '#fff'}, // 7
	{background: '#4caf50', foreground: '#fff'}, // 6
	{background: '#66bb6a', foreground: '#000'}, // 5
	{background: '#81c784', foreground: '#000'}, // 4
	// {background: '#a5d6a7', foreground: '#000'}, // 3
	// {background: '#c8e6c9', foreground: '#000'}, // 2
	// {background: '#e8f5e9', foreground: '#000'}, // 1 (bright)
];

const redGradients: ColorPair[] = [
	// {background: '#ffebee', foreground: '#000'}, // 1 (bright)
	// {background: '#ffcdd2', foreground: '#000'}, // 2
	// {background: '#ef9a9a', foreground: '#000'}, // 3
	{background: '#e57373', foreground: '#fff'}, // 4
	{background: '#ef5350', foreground: '#fff'}, // 5
	{background: '#f44336', foreground: '#fff'}, // 6
	{background: '#e53935', foreground: '#fff'}, // 7
	{background: '#d32f2f', foreground: '#fff'}, // 8
	{background: '#c62828', foreground: '#fff'}, // 9
	{background: '#b71c1c', foreground: '#fff'}, // 10 (dark)
];

export function determineColor(change: number): ColorPair {
	const absChange = Math.abs(change);

	// Check for gray range
	if (absChange < thresholds[0]) {
		return grayColor;
	}

	const index = thresholds.findIndex((threshold) => absChange < threshold);
	const colors = change >= 0 ? greenGradients : redGradients;

	return colors[index !== -1 ? index - 1 : colors.length - 1];
}
