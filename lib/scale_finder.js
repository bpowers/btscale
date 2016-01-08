'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var constants_1 = require('./constants');
var event_target_1 = require('./event_target');
var scale_1 = require('./scale');
var ScaleFinder = (function (_super) {
    __extends(ScaleFinder, _super);
    function ScaleFinder() {
        _super.call(this);
        this.ready = false;
        this.devices = {};
        this.scales = [];
        this.adapterState = null;
        this.failed = false;
        if (typeof chrome !== 'undefined' && chrome.bluetooth && chrome.bluetoothLowEnergy) {
            chrome.bluetooth.onAdapterStateChanged.addListener(this.adapterStateChanged.bind(this));
            chrome.bluetooth.onDeviceAdded.addListener(this.deviceAdded.bind(this));
            chrome.bluetooth.getAdapterState(this.adapterStateChanged.bind(this));
        }
        else {
            console.log("couldn't find chrome.bluetooth APIs");
            this.failed = true;
        }
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
        chrome.bluetooth.startDiscovery(this.logDiscovery);
    };
    ScaleFinder.prototype.stopDiscovery = function () {
        if (this.failed)
            return;
        chrome.bluetooth.stopDiscovery(this.logDiscovery);
    };
    return ScaleFinder;
})(event_target_1.BTSEventTarget);
exports.ScaleFinder = ScaleFinder;
