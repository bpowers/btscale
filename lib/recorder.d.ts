import { IScale } from './types';
export declare class Recorder {
    start: number;
    series: Array<[number, number]>;
    scale: IScale;
    recordCb: any;
    constructor(scale: IScale);
    stop(): Array<[number, number]>;
    record(): void;
}
