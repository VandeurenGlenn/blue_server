export type ColorPair = {
	background: string;
	foreground: string;
};

const thresholds: number[] = [0.3, 5, 10, 25, 50, 100];

const grayColor: ColorPair = {background: '#bdbdbd', foreground: '#000000'};

const greenGradients: ColorPair[] = [
	{background: '#7ec17e', foreground: '#000000'},
	{background: '#518651', foreground: '#ffffff'},
	{background: '#215e2c', foreground: '#ffffff'},
	{background: '#17421e', foreground: '#ffffff'},
];

const redGradients: ColorPair[] = [
	{background: '#ed7171', foreground: '#ffffff'},
	{background: '#c84040', foreground: '#ffffff'},
	{background: '#aa2121', foreground: '#ffffff'},
	{background: '#801010', foreground: '#ffffff'},
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
