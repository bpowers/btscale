import { BTSEventTarget } from './event_target';
import { Scale } from './scale';
export interface ScaleMap {
    [addr: string]: Scale;
}
export declare class ScaleFinder extends BTSEventTarget {
    ready: boolean;
    devices: ScaleMap;
    scales: Array<Scale>;
    adapterState: any;
    failed: boolean;
    constructor();
    adapterStateChanged(adapterState: any): void;
    deviceAdded(device: any): void;
    logDiscovery(): void;
    startDiscovery(): void;
    stopDiscovery(): void;
}
