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
