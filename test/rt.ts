// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as chai from 'chai';

import {MessageType} from '../lib/constants';
import * as packet from '../lib/packet';

const TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];
const WEIGHT_PACKET = [0xdf, 0x78, 0x8, 0x4, 0x2, 0x0, 0x3, 0x50, 0xe3, 0x50, 0x8c];
const WEIGHT_RESPONSE_PACKET = [0xdf, 0x78, 0xc, 0x5, 0x62, 0x2, 0x7, 0x7, 0x7, 0x7, 0x7, 0x94, 0x98, 0xc, 0xc4];

const expect = chai.expect;

function pack(input: Array<number>): ArrayBuffer {
	let buf = new ArrayBuffer(input.length);
	let bytes = new Uint8Array(buf);

	for (let i = 0; i < input.length; i++)
		bytes[i] = input[i];

	return buf;
}

function contentsEqual(msg: ArrayBuffer, ref: Array<number>): void {
	let bytes = new Uint8Array(msg);
	for (let i = 0; i < msg.byteLength; i++)
		expect(bytes[i]).to.equal(ref[i]);
}

describe('encode', () => {
	it('should-encode tare', () => {
		packet.setSequenceId(TARE_PACKET[4]);
		let encodedMsg = packet.encodeTare();

		expect(encodedMsg).to.be.ok;
		expect(encodedMsg.byteLength).to.equal(TARE_PACKET.length);
		contentsEqual(encodedMsg, TARE_PACKET);
	});

	it('should-encode weight', () => {
		packet.setSequenceId(WEIGHT_PACKET[4]);
		let encodedMsg = packet.encodeWeight();

		expect(encodedMsg).to.be.ok;
		expect(encodedMsg.byteLength).to.equal(WEIGHT_PACKET.length);
		contentsEqual(encodedMsg, WEIGHT_PACKET);
	});
});

describe('decode', () => {
	it('should-decode', () => {
		let msg: packet.Message;

		try {
			msg = packet.decode(pack(WEIGHT_RESPONSE_PACKET));
		} catch (e) {
			console.log(e);
			expect(false);
		}

		expect(msg).to.be.ok;
		expect(msg.type).to.equal(MessageType.WEIGHT_RESPONSE);
		expect(msg.value).to.equal(0);
	});
});
