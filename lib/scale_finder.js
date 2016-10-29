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
    ScaleFinder.prototype.adapterStateChanged = function (adapterState) {
        if (chrome.runtime.lastError) {
            console.log('adapter state changed: ' + chrome.runtime.lastError.message);
            return;
        }
        console.log('adapter state changed');
        console.log(adapterState);
        var shouldDispatchReady = !this.adapterState;
        var shouldDispatchDiscovery = this.adapterState && this.adapterState.discovering !== adapterState.discovering;
        this.adapterState = adapterState;
        if (shouldDispatchReady)
            this.dispatchEvent(new Event('ready'));
        if (shouldDispatchDiscovery) {
            var event_1 = new CustomEvent('discoveryStateChanged', { 'detail': { 'discovering': adapterState.discovering } });
            this.dispatchEvent(event_1);
        }
    };
    ScaleFinder.prototype.deviceAdded = function (device) {
        if (!device.uuids || device.uuids.indexOf(constants_1.SCALE_SERVICE_UUID) < 0)
            return;
        if (device.address in this.devices) {
            console.log('WARN: device added that is already known ' + device.address);
            return;
        }
        var scale = new scale_1.Scale(device);
        this.devices[device.address] = scale;
        this.scales.push(scale);
    };
    ScaleFinder.prototype.logDiscovery = function () {
        if (chrome.runtime.lastError) {
            var msg = chrome.runtime.lastError.message;
            console.log('Failed to frob discovery: ' + msg);
        }
    };
    ScaleFinder.prototype.startDiscovery = function () {
        if (this.failed)
            return;
        var _device = null;
        var log = console.log.bind(console);
        bluetooth.requestDevice({ filters: [{ services: [constants_1.SCALE_SERVICE_UUID] }] })
            .then(function (device) {
            log('> Found ' + device.name);
            log('Connecting to GATT Server...');
            _device = device;
            console.log(device.name);
            console.log(device.uuids);
            for (var i = 0; i < device.uuids.length; i++) {
                if (constants_1.SCALE_SERVICE_UUID === device.uuids[i])
                    console.log('WE ARE LISTED');
            }
            return device.gatt.connect();
        }).then(function (server) {
            log('Getting primary service...');
            console.log(server);
            return _device.gatt.getPrimaryService(constants_1.SCALE_SERVICE_UUID);
        }, function (err) {
            console.log('ERRRR - ' + err);
            debugger;
            return null;
        }).then(function (service) {
            console.log('primary services ');
            return service.getCharacteristic(constants_1.SCALE_CHARACTERISTIC_UUID);
        }, function (err) {
            console.log('primary services ERR - ' + err);
            debugger;
        }).then(function (characteristic) {
            log('Reading Battery Level...');
            return characteristic.readValue();
        }, function (err) {
            console.log('err getting characteristic');
            debugger;
        }).then(function (buffer) {
            var data = new DataView(buffer);
            var batteryLevel = data.getUint8(0);
            log('> Battery Level is ' + batteryLevel + '%');
            debugger;
        }, function (err) {
            console.log('err reading val');
            debugger;
        }).catch(function (err) {
            debugger;
        });
    };
    ScaleFinder.prototype.stopDiscovery = function () {
        if (this.failed)
            return;
        chrome.bluetooth.stopDiscovery(this.logDiscovery);
    };
    return ScaleFinder;
})(event_target_1.BTSEventTarget);
exports.ScaleFinder = ScaleFinder;
if (typeof window !== 'undefined')
    window.ScaleFinder = ScaleFinder;
