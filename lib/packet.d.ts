import { MessageType } from './constants';
export declare function setSequenceId(id: number): void;
export declare class Message {
    type: MessageType;
    id: number;
    payload: Uint8Array;
    value: number;
    constructor(type: MessageType, id: number, payload: Uint8Array);
}
export declare function decode(data: ArrayBuffer): Message;
export declare function encodeWeight(period?: number, time?: number, type?: number): ArrayBuffer;
export declare function encodeTare(): ArrayBuffer;
export declare function encodeStartTimer(): ArrayBuffer;
export declare function encodePauseTimer(): ArrayBuffer;
export declare function encodeStopTimer(): ArrayBuffer;
export declare function encodeGetTimer(count?: number): ArrayBuffer;
export declare function encodeGetBattery(): ArrayBuffer;
