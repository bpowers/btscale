import { BTSEventTarget } from './event_target';
import { Recorder } from './recorder';
export declare class Scale extends BTSEventTarget {
    connected: boolean;
    name: string;
    device: any;
    service: any;
    characteristic: any;
    weight: number;
    recorder: Recorder;
    batteryCb: Function;
    series: Array<[number, number]>;
    constructor(device: any);
    connect(): void;
    characteristicValueChanged(event: any): void;
    disconnect(): void;
    notificationsReady(): void;
    tare(): boolean;
    startTimer(): boolean;
    pauseTimer(): boolean;
    stopTimer(): boolean;
    getTimer(count: number): boolean;
    getBattery(cb: Function): boolean;
    poll(): boolean;
    startRecording(): void;
    stopRecording(): Array<[number, number]>;
}
