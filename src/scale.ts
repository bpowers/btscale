// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

import {SCALE_CHARACTERISTIC_UUID, SCALE_SERVICE_UUID, MessageType} from './constants';
import {BTSEventTarget} from './event_target';
import {Recorder} from './recorder';
import * as packet from './packet';

declare var chrome: any;

export class Scale extends BTSEventTarget {
	connected:      boolean  = false;
	name:           string;
	device:         any;
	service:        any      = null;
	characteristic: any      = null;
	weight:         number   = null;
	recorder:       Recorder = null;
	batteryCb:      Function = null;

	series: Array<[number, number]> = null;

	constructor(device: any) {
		super();

		this.device = device;
		this.name = this.device.name;

		console.log('created scale for ' + this.device.address + ' (' + this.device.name + ')');
	}


	connect(): void {
		if (this.connected)
			return;

		chrome.bluetoothLowEnergy.onServiceAdded.addListener(
			this.serviceAdded.bind(this));
		chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(
			this.characteristicValueChanged.bind(this));

		chrome.bluetoothLowEnergy.connect(
			this.device.address,
			{'persistent': true},
			this.deviceConnected.bind(this));
	}

	deviceConnected(): void {
		if (chrome.runtime.lastError) {
			console.log('connect failed: ' + chrome.runtime.lastError.message);
			return;
		}
		chrome.bluetoothLowEnergy.getServices(
			this.device.address,
			this.servicesAdded.bind(this));
	}

	serviceAdded(service: any): void {
		if (service.uuid !== SCALE_SERVICE_UUID)
			return;
		if (this.service)
			return;

		this.service = service;

		chrome.bluetoothLowEnergy.getCharacteristics(
			this.service.instanceId,
			this.allCharacteristics.bind(this));
	}

	servicesAdded(services: any): void {
		for (let i in services) {
			if (!services.hasOwnProperty(i))
				continue;
			let service = services[i];
			this.serviceAdded(service);
		}
	}

	characteristicValueChanged(event: any): void {
		let msg = packet.decode(event.value);
		if (!msg) {
			console.log('characteristic value update, but no message');
			return;
		}

		if (msg.type === MessageType.WEIGHT_RESPONSE) {
			let prevWeight = this.weight;
			let shouldDispatchChanged = this.weight !== msg.value;
			this.weight = msg.value;

			let detail = {'detail': {'value': msg.value, 'previous': prevWeight}};

			// always dispatch a measured event, useful for data
			// logging, but also issue a less-noisy weightChanged
			// event for UI updates.
			this.dispatchEvent(new CustomEvent('weightMeasured', detail));
			if (shouldDispatchChanged)
				this.dispatchEvent(new CustomEvent('weightChanged', detail));
		} else if (msg.type === MessageType.BATTERY_RESPONSE) {
			let cb = this.batteryCb;
			this.batteryCb = null;
			if (cb)
				cb(msg.payload[0]/100);
		} else {
			console.log('non-weight response');
			console.log(msg);
		}
	}

	disconnect(): void {
		this.connected = false;
		chrome.bluetoothLowEnergy.disconnect(this.device.address);
	}

	allCharacteristics(characteristics: any): void {
		if (chrome.runtime.lastError) {
			console.log(
				'failed listing characteristics: ' +
					chrome.runtime.lastError.message);
			return;
		}

		let found = false;
		for (let i = 0; i < characteristics.length; i++) {
			if (characteristics[i].uuid === SCALE_CHARACTERISTIC_UUID) {
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
	}

	notificationsReady(): void {
		if (chrome.runtime.lastError) {
			console.log(
				'failed enabling characteristic notifications: ' +
					chrome.runtime.lastError.message);
			// FIXME(bp) exit early once this call succeeds on android.
			//return;
		}

		console.log('scale ready');

		this.connected = true;

		this.poll();
		setInterval(this.poll.bind(this), 1000);

		this.dispatchEvent(new CustomEvent('ready', {'detail': {'scale': this}}));
	}

	logError(): void {
		if (chrome.runtime.lastError)
			console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
	}

	tare(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeTare();

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	}

	startTimer(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeStartTimer();

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	}

	pauseTimer(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodePauseTimer();

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	}

	stopTimer(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeStopTimer();

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	};

	getTimer(count: number): boolean {
		if (!this.connected)
			return false;

		if (!count)
			count = 1;

		let msg = packet.encodeGetTimer(count);

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	}

	getBattery(cb: Function): boolean {
		if (!this.connected)
			return false;

		this.batteryCb = cb;

		let msg = packet.encodeGetBattery();

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	}

	poll(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeWeight();

		chrome.bluetoothLowEnergy.writeCharacteristicValue(
			this.characteristic.instanceId, msg, this.logError.bind(this));

		return true;
	}

	startRecording(): void {
		if (this.recorder)
			return;

		this.recorder = new Recorder(this);
	}

	stopRecording(): Array<[number, number]> {
		this.series = this.recorder.stop();
		this.recorder = null;

		return this.series;
	}
}
