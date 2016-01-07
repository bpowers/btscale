// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

import {IScale} from './types';

export class Recorder {
	start: number;
	series: Array<[number, number]>;
	scale: IScale;
	recordCb: any;

	constructor(scale: IScale) {
		this.start = Date.now()/1000;
		this.series = [];
		this.scale = scale;
		// for purposes of removing event listener later
		this.recordCb = this.record.bind(this);

		this.record();

		scale.addEventListener('weightMeasured', this.recordCb);
	}

	stop(): Array<[number, number]> {
		this.record();
		this.scale.removeEventListener('weightMeasured', this.recordCb);
		this.scale = null;
		this.recordCb = null;

		return this.series;
	}

	record(): void {
		let time = Date.now()/1000 - this.start;
		this.series.push([time, this.scale.weight]);
	}
}
