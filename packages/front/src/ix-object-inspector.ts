import 'inspector-elements';

const inspector = document.createElement('ix-object-inspector');
inspector.style.cssText =
	'position:fixed;max-height:500px;overflow:auto;bottom:0;';
document.body.appendChild(inspector);

export function inspect(data: any) {
	inspector.data = data;
}
