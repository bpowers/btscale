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
