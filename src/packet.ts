// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

import {MessageType, MAGIC1, MAGIC2, TABLE1, TABLE2} from './constants';

// TODO(bp) this is a guess
const MAX_PAYLOAD_LENGTH = 10;

// packet sequence id in the range of 0-255 (unsigned char)
let sequenceId = 0;

function nextSequenceId(): number {
	let next = sequenceId++;
	sequenceId &= 0xff;

	return next;
}

export function setSequenceId(id: number): void {
	sequenceId = id & 0xff;
}

function getSequenceId(): number {
	return sequenceId;
}

export class Message {
	type:    MessageType;
	id:      number;
	payload: Uint8Array;
	value:   number;

	constructor(type: MessageType, id: number, payload: Uint8Array) {
		this.type = type;
		this.id = id;
		this.payload = payload;
		this.value = null;

		if (type === MessageType.WEIGHT_RESPONSE) {
			let value = ((payload[1] & 0xff) << 8) + (payload[0] & 0xff);
			for (let i = 0; i < payload[4]; i++)
				value /= 10;
			if ((payload[6] & 0x02) === 0x02)
				value *= -1;
			this.value = value;
		}
	}
}

function encipher(out: Uint8Array, input: Array<number>, sequenceId: number): void {
	for (let i = 0; i < out.byteLength; i++) {
		let offset = (input[i] + sequenceId) & 0xff;
		out[i] = TABLE1[offset];
	}
}

function decipher(input: Uint8Array, sequenceId: number): Uint8Array {
	let result = new Uint8Array(input.byteLength);

	for (let i = 0; i < input.byteLength; i++) {
		let offset = input[i] & 0xff;
		result[i] = (TABLE2[offset] - sequenceId) & 0xff;
	}

	return result;
}

function checksum(data: Uint8Array): number {
	let sum = 0;

	for (let i = 0; i < data.length; i++)
		sum += data[i];

	return sum & 0xff;
}

function encode(msgType: MessageType, id: number, payload: Array<number>): ArrayBuffer {
	if (payload.length > MAX_PAYLOAD_LENGTH)
		throw 'payload too long: ' + payload.length;

	let buf = new ArrayBuffer(8 + payload.length);
	let bytes = new Uint8Array(buf);

	let sequenceId = nextSequenceId();

	bytes[0] = MAGIC1;
	bytes[1] = MAGIC2;
	bytes[2] = 5 + payload.length;
	bytes[3] = msgType;
	bytes[4] = sequenceId;
	bytes[5] = id;
	bytes[6] = payload.length & 0xff;

	let payloadOut = new Uint8Array(buf, 7, payload.length);

	encipher(payloadOut, payload, sequenceId);

	let contentsToChecksum = new Uint8Array(buf, 3, payload.length + 4);

	bytes[7 + payload.length] = checksum(contentsToChecksum);

	return buf;
}

export function decode(data: ArrayBuffer): Message {
	const len = data.byteLength;
	if (!len)
		return;

	const bytes = new Uint8Array(data);

	if (len < 8)
		throw 'data too short: ' + len;

	if (bytes[0] !== MAGIC1 && bytes[1] !== MAGIC2)
		throw "don't have the magic";

	const len1 = bytes[2];

	const contentsToChecksum = new Uint8Array(data.slice(3, len - 1));

	const cs = checksum(contentsToChecksum);
	if (bytes[len - 1] !== cs)
		throw 'checksum mismatch ' + bytes[len - 1] + ' !== ' + cs;

	const msgType = bytes[3];
	const sequenceId = bytes[4];
	const id = bytes[5];
	const len2 = bytes[6];

	if (len1 !== len - 3)
		throw 'length mismatch 1 ' + len1 + ' !== ' + (len - 3);
	if (len2 !== len - 8)
		throw 'length mismatch 2';

	const payloadIn = new Uint8Array(data.slice(7, len - 1));
	const payload = decipher(payloadIn, sequenceId);

	return new Message(msgType, id, payload);
}

export function encodeWeight(period: number = 1, time: number = 100, type: number = 1): ArrayBuffer {
	let payload = [period & 0xff, time & 0xff, type & 0xff];

	return encode(MessageType.WEIGHT, 0, payload);
}

export function encodeTare(): ArrayBuffer {
	let payload = [0x0, 0x0];

	return encode(MessageType.CUSTOM, 0, payload);
}

export function encodeStartTimer(): ArrayBuffer {
	let payload = [0x5];

	return encode(MessageType.CUSTOM, 0, payload);
}

export function encodePauseTimer(): ArrayBuffer {
	let payload = [0x6];

	return encode(MessageType.CUSTOM, 0, payload);
}

export function encodeStopTimer(): ArrayBuffer {
	let payload = [0x7];

	return encode(MessageType.CUSTOM, 0, payload);
}

export function encodeGetTimer(count: number = 20): ArrayBuffer {
	let payload = [0x8, count & 0xff];

	return encode(MessageType.CUSTOM, 0, payload);
}

export function encodeGetBattery(): ArrayBuffer {
	return encode(MessageType.BATTERY, 0, []);
}
