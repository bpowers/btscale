// Copyright 2016 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

export interface IEventListener {
	addEventListener(event: string, handler: Function): void;
	removeEventListener(event: string, handler: Function): void;
}

export interface IScale extends IEventListener {
	weight: number;
}
