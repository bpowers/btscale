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

		bluetooth.requestDevice(
			{filters: [{services: [SCALE_SERVICE_UUID]}]})
			.then((device: any) => {
				this.deviceAdded(device);
			});
		//.then((server: any) => {
		// 		log('Getting primary service...');

		// 	console.log(server);

		// 	return _device.gatt.getPrimaryService(SCALE_SERVICE_UUID);
		// }, (err: any) : any => {
		// 	console.log('ERRRR - ' + err);
		// 	debugger;
		// 	return null;
		// }).then((service: any) => {
		// 	console.log('primary services ');
		// 	return service.getCharacteristic(SCALE_CHARACTERISTIC_UUID);
		// }, (err: any) => {
		// 	console.log('primary services ERR - ' + err);
		// 	debugger;
		// }).then((characteristic: any) => {
		// 	log('Starting notifications...');
		// 	return characteristic.startNotifications();
		// }, (err: any) => {
		// 	console.log('err getting characteristic');
		// 	debugger;
		// }).then((characteristic: any) => {
		// 	characteristic.addEventListener('characteristicvaluechanged', (val: any) => {

		// 	});
		// 	debugger;
		// 	let data = new DataView(buffer);
		// 	let batteryLevel = data.getUint8(0);
		// 	log('> Battery Level is ' + batteryLevel + '%');
		// 	debugger;
		// }, (err: any) => {
		// 	console.log('err reading val');
		// 	debugger;
		// }).catch((err: any) => {
		// 	debugger;
		// });:

		// ).then((characteristic: any) => {
		// 	log('Reading Battery Level...');
		// 	return characteristic.readValue();
		// }).then((buffer: any) => {
		// 	let data = new DataView(buffer);
		// 	let batteryLevel = data.getUint8(0);
		// 	log('> Battery Level is ' + batteryLevel + '%');
		// }).catch((error: any) => {
		// 	log('Argh! ' + error);
		// 	log(error);
		// });
	}

	stopDiscovery(): void {
		if (this.failed)
			return;
	}
}

// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).ScaleFinder = ScaleFinder;
