// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

import {SCALE_SERVICE_UUID, SCALE_CHARACTERISTIC_UUID} from './constants';
import {BTSEventTarget} from './event_target';
import {Scale} from './scale';

declare var chrome: any;

let bluetooth = (<any>navigator).bluetooth;

export interface ScaleMap {
	[addr: string]: Scale;
}

export class ScaleFinder extends BTSEventTarget {
	ready:        boolean      = false;
	devices:      ScaleMap     = {};
	scales:       Array<Scale> = [];
	adapterState: any          = null;
	failed:       boolean      = false;

	constructor() {
		super();
		console.log('new ScaleFinder');
	}

	adapterStateChanged(adapterState: any): void {
		if (chrome.runtime.lastError) {
			console.log('adapter state changed: ' + chrome.runtime.lastError.message);
			return;
		}
		console.log('adapter state changed');
		console.log(adapterState);

		let shouldDispatchReady = !this.adapterState;
		let shouldDispatchDiscovery = this.adapterState && this.adapterState.discovering !== adapterState.discovering;

		this.adapterState = adapterState;

		if (shouldDispatchReady)
			this.dispatchEvent(new Event('ready'));
		if (shouldDispatchDiscovery) {
			let event = new CustomEvent(
				'discoveryStateChanged',
				{'detail': {'discovering': adapterState.discovering}});
			this.dispatchEvent(event);
		}
	}

	deviceAdded(device: any): void {
		if (!device.uuids || device.uuids.indexOf(SCALE_SERVICE_UUID) < 0)
			return;

		if (device.address in this.devices) {
			console.log('WARN: device added that is already known ' + device.address);
			return;
		}
		let scale = new Scale(device);
		this.devices[device.address] = scale;
		this.scales.push(scale);
	}

	logDiscovery(): void {
		if (chrome.runtime.lastError) {
			let msg = chrome.runtime.lastError.message;
			console.log('Failed to frob discovery: ' + msg);
		}
	}

	startDiscovery(): void {
		if (this.failed)
			return;

		let log = console.log.bind(console);

		bluetooth.requestDevice(
			{filters: [{services: [SCALE_SERVICE_UUID]}]})
		.then((device: any) => {
			log('> Found ' + device.name);
			log('Connecting to GATT Server...');
			return device.connectGATT();
		}).then((server: any) => {
			log('Getting Battery Service...');
			return server.getPrimaryService(SCALE_SERVICE_UUID);
		}).then((service: any) => {
			log('Getting Battery Level Characteristic...');
			return service.getCharacteristic(SCALE_CHARACTERISTIC_UUID);
		}).then((characteristic: any) => {
			log('Reading Battery Level...');
			return characteristic.readValue();
		}).then((buffer: any) => {
			let data = new DataView(buffer);
			let batteryLevel = data.getUint8(0);
			log('> Battery Level is ' + batteryLevel + '%');
		}).catch((error: any) => {
			log('Argh! ' + error);
			log(error);
		});
	}

	stopDiscovery(): void {
		if (this.failed)
			return;
		chrome.bluetooth.stopDiscovery(this.logDiscovery);
	}
}

// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).ScaleFinder = ScaleFinder;
