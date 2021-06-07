import { Descriptors } from "./descriptors";
import { getTime } from "./utils";

export class Observer {

    private HAS_WEBKIT_FALLBACK_BUG: boolean | null = null;
    private HAS_SAFARI_10_BUG: boolean | null = null;
    private SUPPORTS_STRETCH: boolean | null = null;
    private SUPPORTS_NATIVE_FONT_LOADING: boolean | null = null;
    private DEFAULT_TIMEOUT = 3000;

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

    public load(text: string, timeout: number) {
        const testString = text || 'BESbswy';
        let timeoutId = 0;
        const timeoutValue = timeout || this.DEFAULT_TIMEOUT;
        const start = getTime();

        if (this.supportsNativeFontLoading() && !this.hasSafari10Bug()) {
            const loader = new Promise<void>((resolve, reject) => {
                var check = function () {
                    var now = getTime();

                    if (now - start >= timeoutValue) {
                        reject(new Error('' + timeoutValue + 'ms timeout exceeded'));
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
                    function () { reject(new Error('' + timeoutValue + 'ms timeout exceeded')); },
                    timeoutValue
                );
            });
            const q = Promise.race([timer, loader]);
            return new Promise((resolve, reject) => {
                Promise.race([timer, loader]).then(() => {
                    clearTimeout(timeoutId);
                    resolve(this);
                }, reject) 
            })
        } else {
            return Promise.reject('the brower doe not support NativeFontLoading')
        }
    }

    public getUserAgent() {
        return window.navigator.userAgent;
    }

    public getNavigatorVendor() {
        return window.navigator.vendor;
    }

    public hasWebKitFallbackBug() {
        if (this.HAS_WEBKIT_FALLBACK_BUG === null) {
            var match = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(this.getUserAgent());

            this.HAS_WEBKIT_FALLBACK_BUG = !!match &&
                (parseInt(match[1], 10) < 536 ||
                    (parseInt(match[1], 10) === 536 &&
                        parseInt(match[2], 10) <= 11));
        }
        return this.HAS_WEBKIT_FALLBACK_BUG;
    }

    public hasSafari10Bug() {
        if (this.HAS_SAFARI_10_BUG === null) {
            if (this.supportsNativeFontLoading() && /Apple/.test(this.getNavigatorVendor())) {
                var match = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(this.getUserAgent());

                this.HAS_SAFARI_10_BUG = !!match && parseInt(match[1], 10) < 603;
            } else {
                this.HAS_SAFARI_10_BUG = false;
            }
        }
        return this.HAS_SAFARI_10_BUG;
    }

    public supportsNativeFontLoading() {
        if (this.SUPPORTS_NATIVE_FONT_LOADING === null) {
            this.SUPPORTS_NATIVE_FONT_LOADING = !!document['fonts'];
        }
        return this.SUPPORTS_NATIVE_FONT_LOADING;
    }

    public supportStretch() {
        if (this.SUPPORTS_STRETCH === null) {
            const div = document.createElement('div');

            try {
                div.style.font = 'condensed 100px sans-serif';
            } catch (e) { }
            this.SUPPORTS_STRETCH = (div.style.font !== '');
        }

        return this.SUPPORTS_STRETCH;
    }

    private getStyle(family) {
        return [this.style, this.weight, this.supportStretch() ? this.stretch : '', '100px', family].join(' ');
    }
}