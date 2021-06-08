import { Descriptors } from './descriptors';
import { getTime } from './utils';

// eslint-disable-next-line prefer-named-capture-group
const AppleWebKit = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/;
const SUPPORTS_NATIVE_FONT_LOADING = Boolean(document['fonts']);
const DEFAULT_TIMEOUT = 3000;

export class Observer {

	private HAS_WEBKIT_FALLBACK_BUG: boolean | null = null;
	private HAS_SAFARI_10_BUG: boolean | null = null;
	private SUPPORTS_STRETCH: boolean | null = null;
	private SUPPORTS_NATIVE_FONT_LOADING: boolean | null = null;

	private family: string;
	private style: string;
	private weight: string;
	private stretch: string;

	constructor(family: string, descriptors: Descriptors) {
		this.family = family;
		this.stretch = descriptors.stretch || 'normal';
		this.weight = descriptors.weight || 'normal';
		this.stretch = descriptors.stretch || 'normal';
	}

	public load(params?: { text?: string, timeout?: number }): Promise<void> {
		if (!SUPPORTS_NATIVE_FONT_LOADING) {
			throw new Error('the brower doe not support native font loading');
		}
		if (this.hasSafari10Bug()) {
			throw new Error('this library does\'t support the Safari10 now');
		}
		const testString = params?.text || 'BESbswy';
		const timeoutValue = params?.timeout || DEFAULT_TIMEOUT;
		let timeoutId: ReturnType<typeof setTimeout>;

		const start = getTime();

		const loader = new Promise<void>((resolve, reject) => {
			const check = function () {
				const now = getTime();

				if (now - start >= timeoutValue) {
					reject(new Error(String(timeoutValue) + 'ms timeout exceeded'));
				} else {
					document['fonts'].load(this.getStyle('"' + this.family + '"'), testString).then(fonts => {
						if (fonts.length >= 1) {
							resolve();
						} else {
							setTimeout(check, 25);
						}
					}, reject);
				}
			};
			check();
		});

		const timer = new Promise((resolve, reject) => {
			timeoutId = setTimeout(
				() => {
					reject(new Error(String(timeoutValue) + 'ms timeout exceeded'));
				},
				timeoutValue
			);
		});
		return new Promise((resolve, reject) => {
			Promise.race([timer, loader]).then(() => {
				clearTimeout(timeoutId);
				resolve();
			}, reject);
		});
	}

	private getStyle(family: string) {
		return [this.style, this.weight, this.supportStretch() ? this.stretch : '', '100px', family].join(' ');
	}

	private supportStretch(): boolean {
		const div = document.createElement('div');

		try {
			div.style.font = 'condensed 100px sans-serif';
			// eslint-disable-next-line no-empty
		} catch (e) { }

		return div.style.font !== '';
	}

	private getUserAgent(): string {
		return window.navigator.userAgent;
	}


	private getNavigatorVendor(): string {
		return window.navigator.vendor;
	}

	private hasSafari10Bug(): boolean {
		if (/Apple/.test(this.getNavigatorVendor())) {

			const match = AppleWebKit.exec(this.getUserAgent());

			return Boolean(match) && parseInt(match[1], 10) < 603;
		}
		return false;
	}
}
