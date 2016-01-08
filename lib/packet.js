'use strict';
var constants_1 = require('./constants');
var MAX_PAYLOAD_LENGTH = 10;
var sequenceId = 0;
function nextSequenceId() {
    var next = sequenceId++;
    sequenceId &= 0xff;
    return next;
}
function setSequenceId(id) {
    sequenceId = id & 0xff;
}
exports.setSequenceId = setSequenceId;
function getSequenceId() {
    return sequenceId;
}
var Message = (function () {
    function Message(type, id, payload) {
        this.type = type;
        this.id = id;
        this.payload = payload;
        this.value = null;
        if (type === 5) {
            var value = ((payload[1] & 0xff) << 8) + (payload[0] & 0xff);
            for (var i = 0; i < payload[4]; i++)
                value /= 10;
            if ((payload[6] & 0x02) === 0x02)
                value *= -1;
            this.value = value;
        }
    }
    return Message;
})();
exports.Message = Message;
function encipher(out, input, sequenceId) {
    for (var i = 0; i < out.byteLength; i++) {
        var offset = (input[i] + sequenceId) & 0xff;
        out[i] = constants_1.TABLE1[offset];
    }
}
function decipher(input, sequenceId) {
    var result = new Uint8Array(input.byteLength);
    for (var i = 0; i < input.byteLength; i++) {
        var offset = input[i] & 0xff;
        result[i] = (constants_1.TABLE2[offset] - sequenceId) & 0xff;
    }
    return result;
}
function checksum(data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++)
        sum += data[i];
    return sum & 0xff;
}
function encode(msgType, id, payload) {
    if (payload.length > MAX_PAYLOAD_LENGTH)
        throw 'payload too long: ' + payload.length;
    var buf = new ArrayBuffer(8 + payload.length);
    var bytes = new Uint8Array(buf);
    var sequenceId = nextSequenceId();
    bytes[0] = constants_1.MAGIC1;
    bytes[1] = constants_1.MAGIC2;
    bytes[2] = 5 + payload.length;
    bytes[3] = msgType;
    bytes[4] = sequenceId;
    bytes[5] = id;
    bytes[6] = payload.length & 0xff;
    var payloadOut = new Uint8Array(buf, 7, payload.length);
    encipher(payloadOut, payload, sequenceId);
    var contentsToChecksum = new Uint8Array(buf, 3, payload.length + 4);
    bytes[7 + payload.length] = checksum(contentsToChecksum);
    return buf;
}
function decode(data) {
    var len = data.byteLength;
    if (!len)
        return;
    var bytes = new Uint8Array(data);
    if (len < 8)
        throw 'data too short: ' + len;
    if (bytes[0] !== constants_1.MAGIC1 && bytes[1] !== constants_1.MAGIC2)
        throw "don't have the magic";
    var len1 = bytes[2];
    var contentsToChecksum = new Uint8Array(data.slice(3, len - 1));
    var cs = checksum(contentsToChecksum);
    if (bytes[len - 1] !== cs)
        throw 'checksum mismatch ' + bytes[len - 1] + ' !== ' + cs;
    var msgType = bytes[3];
    var sequenceId = bytes[4];
    var id = bytes[5];
    var len2 = bytes[6];
    if (len1 !== len - 3)
        throw 'length mismatch 1 ' + len1 + ' !== ' + (len - 3);
    if (len2 !== len - 8)
        throw 'length mismatch 2';
    var payloadIn = new Uint8Array(data.slice(7, len - 1));
    var payload = decipher(payloadIn, sequenceId);
    return new Message(msgType, id, payload);
}
exports.decode = decode;
function encodeWeight(period, time, type) {
    if (period === void 0) { period = 1; }
    if (time === void 0) { time = 100; }
    if (type === void 0) { type = 1; }
    var payload = [period & 0xff, time & 0xff, type & 0xff];
    return encode(4, 0, payload);
}
exports.encodeWeight = encodeWeight;
function encodeTare() {
    var payload = [0x0, 0x0];
    return encode(12, 0, payload);
}
exports.encodeTare = encodeTare;
function encodeStartTimer() {
    var payload = [0x5];
    return encode(12, 0, payload);
}
exports.encodeStartTimer = encodeStartTimer;
function encodePauseTimer() {
    var payload = [0x6];
    return encode(12, 0, payload);
}
exports.encodePauseTimer = encodePauseTimer;
function encodeStopTimer() {
    var payload = [0x7];
    return encode(12, 0, payload);
}
exports.encodeStopTimer = encodeStopTimer;
function encodeGetTimer(count) {
    if (count === void 0) { count = 20; }
    var payload = [0x8, count & 0xff];
    return encode(12, 0, payload);
}
exports.encodeGetTimer = encodeGetTimer;
function encodeGetBattery() {
    return encode(2, 0, []);
}
exports.encodeGetBattery = encodeGetBattery;
