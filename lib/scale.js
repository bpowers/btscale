// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./constants', './event_target', './packet', './recorder'], function(constants, event_target, packet, recorder) {
    'use strict';

    function Scale(device, service) {
        this.initialized = false;
        this.name = device.name;
        this.device = device;
        this.service = service;
        this.characteristic = null;
        this.weight = null;
        this.recorder = null;

        chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(
            this.characteristicValueChanged.bind(this));

        chrome.bluetoothLowEnergy.getCharacteristics(
            this.service.instanceId,
            this.allCharacteristics.bind(this));

        console.log('created scale for ' + this.device.address + ' (' + this.device.name + ')');
    }

    Scale.prototype = new event_target.EventTarget();

    Scale.prototype.characteristicValueChanged = function(event) {
        var msg = packet.decode(event.value);
        if (!msg) {
            console.log('characteristic value update, but no message');
            return;
        }

        if (msg.type === constants.MessageType.WEIGHT_RESPONSE) {
            var prevWeight = this.weight;
            var shouldDispatchChanged = this.weight !== msg.value;
            this.weight = msg.value;

            var detail = {'detail': {'value': msg.value, 'previous': prevWeight}};

            // always dispatch a measured event, useful for data
            // logging, but also issue a less-noisy weightChanged
            // event for UI updates.
            this.dispatchEvent(new CustomEvent('weightMeasured', detail));
            if (shouldDispatchChanged)
                this.dispatchEvent(new CustomEvent('weightChanged', detail));
        } else if (msg.type === constants.MessageType.BATTERY_RESPONSE) {
            var cb = this.batteryCb;
            this.batteryCb = null;
            if (cb)
                cb(msg.payload/100);
        } else {
            console.log('non-weight response');
            console.log(msg);
        }
    };

    Scale.prototype.disconnect = function() {
        this.initialized = false;
        chrome.bluetoothLowEnergy.disconnect(this.device.address);
    };

    Scale.prototype.logError = function() {
        if (chrome.runtime.lastError)
            console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
    };

    Scale.prototype.tare = function() {
        if (!this.initialized)
            return false;

        var msg = packet.encodeTare();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.startTimer = function() {
        if (!this.initialized)
            return false;

        var msg = packet.encodeStartTimer();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.pauseTimer = function() {
        if (!this.initialized)
            return false;

        var msg = packet.encodePauseTimer();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.stopTimer = function() {
        if (!this.initialized)
            return false;

        var msg = packet.encodeStopTimer();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.getTimer = function(count) {
        if (!this.initialized)
            return false;

        if (!count)
            count = 1;

        var msg = packet.encodeGetTimer(count);

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.getBattery = function(cb) {
        if (!this.initialized)
            return false;

        this.batteryCb = cb;

        var msg = packet.encodeGetBattery();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.poll = function() {
        if (!this.initialized)
            return false;

        var msg = packet.encodeWeight();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.allCharacteristics = function(characteristics) {
        if (chrome.runtime.lastError) {
            console.log('failed listing characteristics: ' +
                        chrome.runtime.lastError.message);
            return;
        }

        var found = false;
        for (var i = 0; i < characteristics.length; i++) {
            if (characteristics[i].uuid == constants.SCALE_CHARACTERISTIC_UUID) {
                this.characteristic = characteristics[i];
                found = true;
                break;
            }
        }

        if (found) {
            chrome.bluetoothLowEnergy.startCharacteristicNotifications(
                this.characteristic.instanceId,
                this.notificationsReady.bind(this));
        } else {
            console.log('scale doesnt have required characteristic');
            console.log(characteristics);
        }
    };

    Scale.prototype.notificationsReady = function() {
        if (chrome.runtime.lastError) {
            console.log('failed enabling characteristic notifications: ' +
                        chrome.runtime.lastError.message);
            // FIXME(bp) exit early once this call succeeds on android.
            //return;
        }

        this.initialized = true;

        this.poll();
        setInterval(this.poll.bind(this), 1000);

        this.dispatchEvent(new CustomEvent('ready', {'detail': {'scale': this}}));
    };

    Scale.prototype.startRecording = function() {
        if (this.recorder)
            return;

        this.recorder = new recorder.Recorder(this);
    };

    Scale.prototype.stopRecording = function() {
        this.series = this.recorder.stop();
        this.recorder = null;

        return this.series;
    };

    return {
        Scale: Scale,
    };
});
