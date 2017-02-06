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
		this.connect();
	}


	connect(): void {
		if (this.connected)
			return;

		let log = console.log.bind(console);

		this.device.gatt.connect()
			.then((server: any) => {
				return this.device.gatt.getPrimaryService(SCALE_SERVICE_UUID);
			}, (err: any) : any => {
				console.log('error connecting - ' + err);
				return null;
			}).then((service: any) => {
				this.service = service;
				console.log('primary services ');
				return service.getCharacteristic(SCALE_CHARACTERISTIC_UUID);
			}, (err: any) => {
				console.log('primary services ERR - ' + err);
				debugger;
			}).then((characteristic: any) => {
				log('Starting notifications...');
				this.characteristic = characteristic;
				return characteristic.startNotifications();
			}, (err: any) => {
				console.log('err getting characteristic');
				debugger;
			}).then((characteristic: any) => {
				characteristic.addEventListener(
					'characteristicvaluechanged',
					this.characteristicValueChanged.bind(this));
				this.notificationsReady();
			}, (err: any) => {
				log('FAILED: ' + err);
				debugger;
			});
	}

	characteristicValueChanged(event: any): void {
		let msg = packet.decode(event.target.value.buffer);
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
		if (this.device)
			this.device.gatt.connect();
	}

	notificationsReady(): void {
		console.log('scale ready');

		this.connected = true;

		this.poll();
		setInterval(this.poll.bind(this), 1000);

		this.dispatchEvent(new CustomEvent('ready', {'detail': {'scale': this}}));
	}

	tare(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeTare();
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

		return true;
	}

	startTimer(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeStartTimer();
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

		return true;
	}

	pauseTimer(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodePauseTimer();
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

		return true;
	}

	stopTimer(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeStopTimer();
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

		return true;
	};

	getTimer(count: number): boolean {
		if (!this.connected)
			return false;

		if (!count)
			count = 1;

		let msg = packet.encodeGetTimer(count);
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

		return true;
	}

	getBattery(cb: Function): boolean {
		if (!this.connected)
			return false;

		this.batteryCb = cb;

		let msg = packet.encodeGetBattery();
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

		return true;
	}

	poll(): boolean {
		if (!this.connected)
			return false;

		let msg = packet.encodeWeight();
		this.characteristic.writeValue(msg)
			.then(() => {
			}, (err: any) => {
				console.log('write failed: ' + err);
			});

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
