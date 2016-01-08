export interface IEventListener {
    addEventListener(event: string, handler: Function): void;
    removeEventListener(event: string, handler: Function): void;
}
export interface IScale extends IEventListener {
    weight: number;
}
