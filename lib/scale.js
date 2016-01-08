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
    }
    Scale.prototype.connect = function () {
        if (this.connected)
            return;
        chrome.bluetoothLowEnergy.onServiceAdded.addListener(this.serviceAdded.bind(this));
        chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(this.characteristicValueChanged.bind(this));
        chrome.bluetoothLowEnergy.connect(this.device.address, { 'persistent': true }, this.deviceConnected.bind(this));
    };
    Scale.prototype.deviceConnected = function () {
        if (chrome.runtime.lastError) {
            console.log('connect failed: ' + chrome.runtime.lastError.message);
            return;
        }
        chrome.bluetoothLowEnergy.getServices(this.device.address, this.servicesAdded.bind(this));
    };
    Scale.prototype.serviceAdded = function (service) {
        if (service.uuid !== constants_1.SCALE_SERVICE_UUID)
            return;
        if (this.service)
            return;
        this.service = service;
        chrome.bluetoothLowEnergy.getCharacteristics(this.service.instanceId, this.allCharacteristics.bind(this));
    };
    Scale.prototype.servicesAdded = function (services) {
        for (var i in services) {
            if (!services.hasOwnProperty(i))
                continue;
            var service = services[i];
            this.serviceAdded(service);
        }
    };
    Scale.prototype.characteristicValueChanged = function (event) {
        var msg = packet.decode(event.value);
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
        chrome.bluetoothLowEnergy.disconnect(this.device.address);
    };
    Scale.prototype.allCharacteristics = function (characteristics) {
        if (chrome.runtime.lastError) {
            console.log('failed listing characteristics: ' +
                chrome.runtime.lastError.message);
            return;
        }
        var found = false;
        for (var i = 0; i < characteristics.length; i++) {
            if (characteristics[i].uuid === constants_1.SCALE_CHARACTERISTIC_UUID) {
                this.characteristic = characteristics[i];
                found = true;
                break;
            }
        }
        if (found) {
            chrome.bluetoothLowEnergy.startCharacteristicNotifications(this.characteristic.instanceId, this.notificationsReady.bind(this));
        }
        else {
            console.log('scale doesnt have required characteristic');
            console.log(characteristics);
        }
    };
    Scale.prototype.notificationsReady = function () {
        if (chrome.runtime.lastError) {
            console.log('failed enabling characteristic notifications: ' +
                chrome.runtime.lastError.message);
        }
        console.log('scale ready');
        this.connected = true;
        this.poll();
        setInterval(this.poll.bind(this), 1000);
        this.dispatchEvent(new CustomEvent('ready', { 'detail': { 'scale': this } }));
    };
    Scale.prototype.logError = function () {
        if (chrome.runtime.lastError)
            console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
    };
    Scale.prototype.tare = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeTare();
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
        return true;
    };
    Scale.prototype.startTimer = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeStartTimer();
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
        return true;
    };
    Scale.prototype.pauseTimer = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodePauseTimer();
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
        return true;
    };
    Scale.prototype.stopTimer = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeStopTimer();
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
        return true;
    };
    ;
    Scale.prototype.getTimer = function (count) {
        if (!this.connected)
            return false;
        if (!count)
            count = 1;
        var msg = packet.encodeGetTimer(count);
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
        return true;
    };
    Scale.prototype.getBattery = function (cb) {
        if (!this.connected)
            return false;
        this.batteryCb = cb;
        var msg = packet.encodeGetBattery();
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
        return true;
    };
    Scale.prototype.poll = function () {
        if (!this.connected)
            return false;
        var msg = packet.encodeWeight();
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristic.instanceId, msg, this.logError.bind(this));
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
