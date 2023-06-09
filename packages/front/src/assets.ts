import fireGif from '/assets/img/fire.png';
import snailGif from '/assets/img/snail.png';

function createIcon(src: string) {
	const img = new Image();
	img.src = src;
	img.width = 24;
	return img;
}

export const placeFireImg = () => createIcon(fireGif);
export const placeSnailImg = () => createIcon(snailGif);
