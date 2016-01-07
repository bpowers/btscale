// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

import {SCALE_SERVICE_UUID} from './constants';
import {BTSEventTarget} from './event_target';
import {Scale} from './scale';

declare var chrome: any;

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

		if (typeof chrome !== 'undefined' && chrome.bluetooth && chrome.bluetoothLowEnergy) {
			chrome.bluetooth.onAdapterStateChanged.addListener(this.adapterStateChanged.bind(this));
			chrome.bluetooth.onDeviceAdded.addListener(this.deviceAdded.bind(this));

			chrome.bluetooth.getAdapterState(this.adapterStateChanged.bind(this));
		} else {
			console.log("couldn't find chrome.bluetooth APIs");
			this.failed = true;
		}
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
		chrome.bluetooth.startDiscovery(this.logDiscovery);
	}

	stopDiscovery(): void {
		if (this.failed)
			return;
		chrome.bluetooth.stopDiscovery(this.logDiscovery);
	}
}
