// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define([], function() {
    'use strict';

    function Recorder(scale) {
        this.start = Date.now()/1000;
        this.series = [];
        this.scale = scale;
        // for purposes of removing event listener later
        this.recordCb = this.record.bind(this);

        this.record();

        scale.addEventListener('weightMeasured', this.recordCb);
    }

    Recorder.prototype.stop = function() {
        this.record();
        this.scale.removeEventListener('weightMeasured', this.recordCb);
        this.scale = null;
        this.recordCb = null;

        return this.series;
    };

    Recorder.prototype.record = function() {
        var time = Date.now()/1000 - this.start;
        this.series.push([time, this.scale.weight]);
    };

    return {
        Recorder: Recorder,
    };
});
