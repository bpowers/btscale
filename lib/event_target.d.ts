export declare class BTSEventTarget {
    listeners_: any;
    addEventListener(type: string, handler: Function): void;
    removeEventListener(type: string, handler: Function): void;
    dispatchEvent(event: any): boolean;
}
