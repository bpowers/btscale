(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
;
exports.SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
exports.SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';
exports.MAGIC1 = 0xdf;
exports.MAGIC2 = 0x78;
exports.TABLE1 = [
    0x00, 0x76, 0x84, 0x50, 0xDB, 0xE4, 0x6F, 0xB2,
    0xFA, 0xFB, 0x4D, 0x4F, 0x8E, 0x57, 0x8C, 0x5F,
    0x9E, 0xAE, 0xB0, 0xB5, 0x5D, 0x96, 0x15, 0xB9,
    0x0F, 0xFC, 0xFD, 0x70, 0x1B, 0x80, 0xBB, 0xF4,
    0x93, 0xFE, 0xFF, 0x69, 0x68, 0x83, 0xCF, 0xA7,
    0xD2, 0xEB, 0x3C, 0x64, 0x41, 0x77, 0xC6, 0x86,
    0xCB, 0xD3, 0xDD, 0x48, 0xEE, 0xF0, 0x1E, 0x58,
    0x4C, 0x8A, 0x8F, 0xA4, 0x02, 0x4B, 0x06, 0x24,
    0x8D, 0xB7, 0xBF, 0x28, 0x63, 0xAD, 0xB8, 0x56,
    0x89, 0xA0, 0xC4, 0x51, 0xC5, 0x52, 0x27, 0x3D,
    0xC9, 0xD6, 0xDC, 0x42, 0x2C, 0xD7, 0xE6, 0xEF,
    0xF9, 0x35, 0xD9, 0xBC, 0x7A, 0x1F, 0x43, 0x6C,
    0x36, 0x38, 0x07, 0x94, 0x98, 0xD8, 0xE3, 0xB6,
    0x53, 0x3F, 0x0C, 0x92, 0x9A, 0xC2, 0xD1, 0xD5,
    0x34, 0x1D, 0x62, 0xA9, 0x20, 0x7E, 0xAC, 0x09,
    0x5E, 0x59, 0x31, 0x9C, 0xA3, 0x97, 0xB3, 0x74,
    0xC1, 0xED, 0xF2, 0x10, 0x2E, 0x4A, 0xE1, 0x23,
    0x2B, 0x81, 0xF7, 0x61, 0x19, 0x08, 0x1A, 0x39,
    0x65, 0x3E, 0x73, 0x3B, 0x7B, 0x0B, 0x67, 0x04,
    0x6A, 0x22, 0x46, 0x0E, 0x55, 0x66, 0x54, 0x01,
    0x45, 0x6B, 0x32, 0x8B, 0xAB, 0x18, 0xBA, 0xCC,
    0xD4, 0x26, 0xE2, 0xE7, 0x1C, 0x44, 0x14, 0x95,
    0x99, 0x85, 0xDA, 0x4E, 0x6E, 0xE0, 0xE8, 0x37,
    0xBE, 0xF3, 0x7F, 0xDF, 0xF6, 0xF8, 0x2D, 0x30,
    0x21, 0x13, 0x17, 0x0D, 0x16, 0x25, 0x5B, 0x33,
    0x11, 0x5C, 0x7C, 0x87, 0xA1, 0xBD, 0x05, 0x90,
    0x9F, 0xA6, 0x6D, 0xB4, 0xC7, 0xCA, 0xC3, 0x12,
    0x03, 0xE5, 0xDE, 0xE9, 0x9B, 0x88, 0x2F, 0xEA,
    0xEC, 0xC8, 0x29, 0x71, 0x49, 0x5A, 0x72, 0x47,
    0x7D, 0xA2, 0xA5, 0x91, 0xAF, 0xB1, 0x0A, 0xCD,
    0x60, 0xC0, 0x9D, 0x78, 0xCE, 0xD0, 0x79, 0x3A,
    0xAA, 0xA8, 0x2A, 0x40, 0xF1, 0x75, 0xF5, 0x82,
];
exports.TABLE2 = [
    0x00, 0x9F, 0x3C, 0xD8, 0x97, 0xCE, 0x3E, 0x62,
    0x8D, 0x77, 0xEE, 0x95, 0x6A, 0xC3, 0x9B, 0x18,
    0x83, 0xC8, 0xD7, 0xC1, 0xAE, 0x16, 0xC4, 0xC2,
    0xA5, 0x8C, 0x8E, 0x1C, 0xAC, 0x71, 0x36, 0x5D,
    0x74, 0xC0, 0x99, 0x87, 0x3F, 0xC5, 0xA9, 0x4E,
    0x43, 0xE2, 0xFA, 0x88, 0x54, 0xBE, 0x84, 0xDE,
    0xBF, 0x7A, 0xA2, 0xC7, 0x70, 0x59, 0x60, 0xB7,
    0x61, 0x8F, 0xF7, 0x93, 0x2A, 0x4F, 0x91, 0x69,
    0xFB, 0x2C, 0x53, 0x5E, 0xAD, 0xA0, 0x9A, 0xE7,
    0x33, 0xE4, 0x85, 0x3D, 0x38, 0x0A, 0xB3, 0x0B,
    0x03, 0x4B, 0x4D, 0x68, 0x9E, 0x9C, 0x47, 0x0D,
    0x37, 0x79, 0xE5, 0xC6, 0xC9, 0x14, 0x78, 0x0F,
    0xF0, 0x8B, 0x72, 0x44, 0x2B, 0x90, 0x9D, 0x96,
    0x24, 0x23, 0x98, 0xA1, 0x5F, 0xD2, 0xB4, 0x06,
    0x1B, 0xE3, 0xE6, 0x92, 0x7F, 0xFD, 0x01, 0x2D,
    0xF3, 0xF6, 0x5C, 0x94, 0xCA, 0xE8, 0x75, 0xBA,
    0x1D, 0x89, 0xFF, 0x25, 0x02, 0xB1, 0x2F, 0xCB,
    0xDD, 0x48, 0x39, 0xA3, 0x0E, 0x40, 0x0C, 0x3A,
    0xCF, 0xEB, 0x6B, 0x20, 0x63, 0xAF, 0x15, 0x7D,
    0x64, 0xB0, 0x6C, 0xDC, 0x7B, 0xF2, 0x10, 0xD0,
    0x49, 0xCC, 0xE9, 0x7C, 0x3B, 0xEA, 0xD1, 0x27,
    0xF9, 0x73, 0xF8, 0xA4, 0x76, 0x45, 0x11, 0xEC,
    0x12, 0xED, 0x07, 0x7E, 0xD3, 0x13, 0x67, 0x41,
    0x46, 0x17, 0xA6, 0x1E, 0x5B, 0xCD, 0xB8, 0x42,
    0xF1, 0x80, 0x6D, 0xD6, 0x4A, 0x4C, 0x2E, 0xD4,
    0xE1, 0x50, 0xD5, 0x30, 0xA7, 0xEF, 0xF4, 0x26,
    0xF5, 0x6E, 0x28, 0x31, 0xA8, 0x6F, 0x51, 0x55,
    0x65, 0x5A, 0xB2, 0x04, 0x52, 0x32, 0xDA, 0xBB,
    0xB5, 0x86, 0xAA, 0x66, 0x05, 0xD9, 0x56, 0xAB,
    0xB6, 0xDB, 0xDF, 0x29, 0xE0, 0x81, 0x34, 0x57,
    0x35, 0xFC, 0x82, 0xB9, 0x1F, 0xFE, 0xBC, 0x8A,
    0xBD, 0x58, 0x08, 0x09, 0x19, 0x1A, 0x21, 0x22,
];

},{}],2:[function(require,module,exports){
'use strict';
var BTSEventTarget = (function () {
    function BTSEventTarget() {
    }
    BTSEventTarget.prototype.addEventListener = function (type, handler) {
        if (!this.listeners_)
            this.listeners_ = Object.create(null);
        if (!(type in this.listeners_)) {
            this.listeners_[type] = [handler];
        }
        else {
            var handlers = this.listeners_[type];
            if (handlers.indexOf(handler) < 0)
                handlers.push(handler);
        }
    };
    BTSEventTarget.prototype.removeEventListener = function (type, handler) {
        if (!this.listeners_)
            return;
        if (type in this.listeners_) {
            var handlers = this.listeners_[type];
            var index = handlers.indexOf(handler);
            if (index >= 0) {
                if (handlers.length === 1)
                    delete this.listeners_[type];
                else
                    handlers.splice(index, 1);
            }
        }
    };
    BTSEventTarget.prototype.dispatchEvent = function (event) {
        if (!this.listeners_)
            return true;
        var self = this;
        event.__defineGetter__('target', function () {
            return self;
        });
        var type = event.type;
        var prevented = 0;
        if (type in this.listeners_) {
            var handlers = this.listeners_[type].concat();
            for (var i = 0, handler = void 0; (handler = handlers[i]); i++) {
                if (handler.handleEvent)
                    prevented |= (handler.handleEvent.call(handler, event) === false);
                else
                    prevented |= (handler.call(this, event) === false);
            }
        }
        return !prevented && !event.defaultPrevented;
    };
    return BTSEventTarget;
})();
exports.BTSEventTarget = BTSEventTarget;

},{}],3:[function(require,module,exports){
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

},{"./constants":1}],4:[function(require,module,exports){
'use strict';
var Recorder = (function () {
    function Recorder(scale) {
        this.start = Date.now() / 1000;
        this.series = [];
        this.scale = scale;
        this.recordCb = this.record.bind(this);
        this.record();
        scale.addEventListener('weightMeasured', this.recordCb);
    }
    Recorder.prototype.stop = function () {
        this.record();
        this.scale.removeEventListener('weightMeasured', this.recordCb);
        this.scale = null;
        this.recordCb = null;
        return this.series;
    };
    Recorder.prototype.record = function () {
        var time = Date.now() / 1000 - this.start;
        this.series.push([time, this.scale.weight]);
    };
    return Recorder;
})();
exports.Recorder = Recorder;

},{}],5:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var constants_1 = require('./constants');
var event_target_1 = require('./event_target');
var recorder_1 = require('./recorder');
var packet = require('./packet');
var Scale = (function (_super) {
    __extends(Scale, _super);
    function Scale(device) {
        _super.call(this);
        this.connected = false;
        this.service = null;
        this.characteristic = null;
        this.weight = null;
        this.recorder = null;
        this.batteryCb = null;
        this.series = null;
        this.device = device;
        this.name = this.device.name;
        console.log('created scale for ' + this.device.address + ' (' + this.device.name + ')');
        this.connect();
    }
    Scale.prototype.connect = function () {
        var _this = this;
        if (this.connected)
            return;
        var log = console.log.bind(console);
        this.device.gatt.connect()
            .then(function (server) {
            return _this.device.gatt.getPrimaryService(constants_1.SCALE_SERVICE_UUID);
        }, function (err) {
            console.log('error connecting - ' + err);
            return null;
        }).then(function (service) {
            _this.service = service;
            console.log('primary services ');
            return service.getCharacteristic(constants_1.SCALE_CHARACTERISTIC_UUID);
        }, function (err) {
            console.log('primary services ERR - ' + err);
            debugger;
        }).then(function (characteristic) {
            log('Starting notifications...');
            _this.characteristic = characteristic;
            return characteristic.startNotifications();
        }, function (err) {
            console.log('err getting characteristic');
            debugger;
        }).then(function (characteristic) {
            characteristic.addEventListener('characteristicvaluechanged', _this.characteristicValueChanged.bind(_this));
            _this.notificationsReady();
        }, function (err) {
            log('FAILED: ' + err);
            debugger;
        });
    };
    Scale.prototype.characteristicValueChanged = function (event) {
        var msg = packet.decode(event.target.value.buffer);
        if (!msg) {
            console.log('characteristic value update, but no message');
            return;
        }
        if (msg.type === 5) {
            var prevWeight = this.weight;
            var shouldDispatchChanged = this.weight !== msg.value;
            this.weight = msg.value;
            var detail = { 'detail': { 'value': msg.value, 'previous': prevWeight } };
            this.dispatchEvent(new CustomEvent('weightMeasured', detail));
            if (shouldDispatchChanged)
                this.dispatchEvent(new CustomEvent('weightChanged', detail));
        }
        else if (msg.type === 3) {
            var cb = this.batteryCb;
            this.batteryCb = null;
            if (cb)
                cb(msg.payload[0] / 100);
        }
        else {
            console.log('non-weight response');
            console.log(msg);
        }
    };
    Scale.prototype.disconnect = function () {
        this.connected = false;
        if (this.device)
            this.device.gatt.connect();
    };
    Scale.prototype.notificationsReady = function () {
        console.log('scale ready');
        this.connected = true;
        this.poll();
        setInterval(this.poll.bind(this), 1000);
        this.dispatchEvent(new CustomEvent('ready', { 'detail': { 'scale': this } }));
    };
    Scale.prototype.tare = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeTare();
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    Scale.prototype.startTimer = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeStartTimer();
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    Scale.prototype.pauseTimer = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodePauseTimer();
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    Scale.prototype.stopTimer = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeStopTimer();
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    ;
    Scale.prototype.getTimer = function (count) {
        if (!this.connected)
            return false;
        if (!count)
            count = 1;
        var msg = packet.encodeGetTimer(count);
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    Scale.prototype.getBattery = function (cb) {
        if (!this.connected)
            return false;
        this.batteryCb = cb;
        var msg = packet.encodeGetBattery();
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    Scale.prototype.poll = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeWeight();
        this.characteristic.writeValue(msg)
            .then(function () {
        }, function (err) {
            console.log('write failed: ' + err);
        });
        return true;
    };
    Scale.prototype.startRecording = function () {
        if (this.recorder)
            return;
        this.recorder = new recorder_1.Recorder(this);
    };
    Scale.prototype.stopRecording = function () {
        this.series = this.recorder.stop();
        this.recorder = null;
        return this.series;
    };
    return Scale;
})(event_target_1.BTSEventTarget);
exports.Scale = Scale;

},{"./constants":1,"./event_target":2,"./packet":3,"./recorder":4}],6:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var constants_1 = require('./constants');
var event_target_1 = require('./event_target');
var scale_1 = require('./scale');
var bluetooth = navigator.bluetooth;
var ScaleFinder = (function (_super) {
    __extends(ScaleFinder, _super);
    function ScaleFinder() {
        _super.call(this);
        this.ready = false;
        this.devices = {};
        this.scales = [];
        this.adapterState = null;
        this.failed = false;
        console.log('new ScaleFinder');
    }
    ScaleFinder.prototype.deviceAdded = function (device) {
        if (device.address in this.devices) {
            console.log('WARN: device added that is already known ' + device.address);
            return;
        }
        var scale = new scale_1.Scale(device);
        this.devices[device.address] = scale;
        this.scales.push(scale);
    };
    ScaleFinder.prototype.startDiscovery = function () {
        var _this = this;
        if (this.failed)
            return;
        bluetooth.requestDevice({ filters: [{ services: [constants_1.SCALE_SERVICE_UUID] }] })
            .then(function (device) {
            _this.deviceAdded(device);
        });
    };
    ScaleFinder.prototype.stopDiscovery = function () {
        if (this.failed)
            return;
    };
    return ScaleFinder;
})(event_target_1.BTSEventTarget);
exports.ScaleFinder = ScaleFinder;
if (typeof window !== 'undefined')
    window.ScaleFinder = ScaleFinder;

},{"./constants":1,"./event_target":2,"./scale":5}]},{},[6]);
