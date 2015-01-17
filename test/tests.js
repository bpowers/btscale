// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['../lib/constants', '../lib/packet'], function(constants, packet) {
    'use strict';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];
    var WEIGHT_PACKET = [0xdf, 0x78, 0x8, 0x4, 0x2, 0x0, 0x3, 0x50, 0xe3, 0x50, 0x8c];
    var WEIGHT_RESPONSE_PACKET = [0xdf, 0x78, 0xc, 0x5, 0x62, 0x2, 0x7, 0x7, 0x7, 0x7, 0x7, 0x94, 0x98, 0xc, 0xc4];

    var suite = {};

    var contentsEqual = function(test, msg, ref) {
        var ok = true;
        for (var i = 0; i < msg.byteLength; i++) {
            ok &= msg[i] === ref[i];
            test.ok(msg[i] === ref[i], 'position ' + i + ' matches');
        }
        return ok;
    };

    suite.encode = function(test) {
        var encodedMsg;

        packet.setSequenceId(TARE_PACKET[4]);
        encodedMsg = packet.encodeTare();

        test.ok(encodedMsg, 'no encoded message returned');
        test.ok(encodedMsg.byteLength === TARE_PACKET.length, 'bad length');

        test.ok(contentsEqual(test, encodedMsg, TARE_PACKET), 'contents match');

        packet.setSequenceId(WEIGHT_PACKET[4]);
        encodedMsg = packet.encodeWeight();

        test.ok(encodedMsg, 'no encoded message returned');
        test.ok(encodedMsg.byteLength === WEIGHT_PACKET.length, 'bad length');

        test.ok(contentsEqual(test, encodedMsg, WEIGHT_PACKET), 'contents match');

        test.done();
    };

    suite.decode = function(test) {
        var msg;

        try {
            msg = packet.decode(WEIGHT_RESPONSE_PACKET);
        } catch (e) {
            console.log(e);
            test.ok(false, 'threw: ' + e);
        }

        test.ok(msg, 'no decoded message returned');
        test.ok(msg.type === constants.MessageType.WEIGHT_RESPONSE, 'bad type ' + msg.type);
        test.ok(msg.value === 0, 'value mismatch');

        test.done();
    };

    return suite;
});
