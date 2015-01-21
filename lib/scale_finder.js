// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./constants', './event_target', './scale'], function(constants, event_target, scale) {
    'use strict';

    var Scale = scale.Scale;

    function ScaleFinder() {
        this.ready = false;
        this.devices = {};
        this.scales = [];
        this.adapterState = null;
        this.failed = false;

        if (typeof chrome !== 'undefined' && chrome.bluetooth && chrome.bluetoothLowEnergy) {
            chrome.bluetooth.onAdapterStateChanged.addListener(this.adapterStateChanged.bind(this));
            chrome.bluetooth.onDeviceAdded.addListener(this.deviceAdded.bind(this));

            chrome.bluetooth.getAdapterState(this.adapterStateChanged.bind(this));
        } else {
            console.log("couldn't find chrome.bluetooth APIs");
            this.failed = true;
        }
    }

    ScaleFinder.prototype = new event_target.EventTarget();

    ScaleFinder.prototype.adapterStateChanged = function(adapterState) {
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
            var event = new CustomEvent(
                'discoveryStateChanged',
                {'detail': {'discovering': adapterState.discovering}});
            this.dispatchEvent(event);
        }
    };

    ScaleFinder.prototype.deviceAdded = function(device) {
        if (!device.uuids || device.uuids.indexOf(constants.SCALE_SERVICE_UUID) < 0)
            return;

        if (device.address in this.devices) {
            console.log('WARN: device added that is already known ' + device.address);
            return;
        }
        var scale = new Scale(device);
        this.devices[device.address] = scale;
        this.scales.push(scale);
    };

    ScaleFinder.prototype.logDiscovery = function() {
        if (chrome.runtime.lastError)
            console.log('Failed to frob discovery: ' +
                        chrome.runtime.lastError.message);
    };

    ScaleFinder.prototype.startDiscovery = function() {
        if (this.failed)
            return;
        chrome.bluetooth.startDiscovery(this.logDiscovery);
    };

    ScaleFinder.prototype.stopDiscovery = function() {
        if (this.failed)
            return;
        chrome.bluetooth.stopDiscovery(this.logDiscovery);
    };

    return {
        ScaleFinder: ScaleFinder,
    };
});
