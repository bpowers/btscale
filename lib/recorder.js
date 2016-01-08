'use strict';
var Recorder = (function () {
    function Recorder(scale) {
        this.start = Date.now() / 1000;
        this.series = [];
        this.scale = scale;
        this.recordCb = this.record.bind(this);
        this.record();
        scale.addEventListener('weightMeasured', this.recordCb);
    }
    Recorder.prototype.stop = function () {
        this.record();
        this.scale.removeEventListener('weightMeasured', this.recordCb);
        this.scale = null;
        this.recordCb = null;
        return this.series;
    };
    Recorder.prototype.record = function () {
        var time = Date.now() / 1000 - this.start;
        this.series.push([time, this.scale.weight]);
    };
    return Recorder;
})();
exports.Recorder = Recorder;
