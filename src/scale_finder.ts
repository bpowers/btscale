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

	deviceAdded(device: any): void {
		if (device.address in this.devices) {
			console.log('WARN: device added that is already known ' + device.address);
			return;
		}
		let scale = new Scale(device);
		this.devices[device.address] = scale;
		this.scales.push(scale);
	}

	startDiscovery(): void {
		if (this.failed)
			return;

		bluetooth.requestDevice(
			{filters: [{services: [SCALE_SERVICE_UUID]}]})
			.then((device: any) => {
				this.deviceAdded(device);
			});
	}

	stopDiscovery(): void {
		if (this.failed)
			return;
	}
}

// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).ScaleFinder = ScaleFinder;
