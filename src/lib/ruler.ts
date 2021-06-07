/* eslint-disable max-len, no-unused-vars, callback-return */
const style = 'max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;';
export class Ruler {

	private element: HTMLDivElement;
	private collapsible: HTMLSpanElement;
	private expandable: HTMLSpanElement;
	private collapsibleInner: HTMLSpanElement;
	private expandableInner: HTMLSpanElement;
	private lastOffsetWidth = -1;

	constructor(text: string) {
		this.element = document.createElement('div');
		this.element.setAttribute('aria-hidden', 'true');
		this.element.appendChild(document.createTextNode(text));

		this.collapsible = document.createElement('span');
		this.expandable = document.createElement('span');
		this.collapsibleInner = document.createElement('span');
		this.expandableInner = document.createElement('span');

		this.collapsible.setAttribute('style', style);
		this.expandable.setAttribute('style', style);
		this.collapsibleInner.setAttribute('style', style);
		this.expandableInner.setAttribute('style', 'display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;');

		this.collapsible.appendChild(this.collapsibleInner);
		this.expandable.appendChild(this.expandableInner);

		this.element.appendChild(this.collapsible);
		this.element.appendChild(this.expandable);
	}

	public setFont(font: string) {
		if (font) {
			this.element.setAttribute('style', this.element.style + `max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font: ${font};`);
		}
	}

	public getWidth(): number {
		return this.element.offsetWidth;
	}

	public setWidth(width: number) {
		this.element.style.width = `${width}px`;
	}

	public onScroll(callback: (number) => void) {
		if (this.reset() && this.element.parentNode !== null) {
			callback(this.lastOffsetWidth);
		}
	}

	public onResize(callback: (number) => void) {

		const onScroll = () => {
			this.onScroll(callback);
		};

		this.collapsible.addEventListener('scroll', onScroll);
		this.expandable.addEventListener('scroll', onScroll);
		this.reset();
	}

	private reset() {
		const offsetWidth = this.getWidth();
		const _with = offsetWidth + 100;
		this.expandableInner.style.width = `${_with}px`;
		this.expandable.scrollLeft = _with;
		this.collapsible.scrollLeft = this.collapsible.scrollWidth + 100;

		if (this.lastOffsetWidth !== offsetWidth) {
			this.lastOffsetWidth = offsetWidth;
			return true;
		}
		return false;

	}
}
