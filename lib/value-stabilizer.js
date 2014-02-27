'use strict';

var abs = Math.abs;

var VS = function (opt) {
    this._min = opt.min;
    this._max = opt.max;
    this._threshold = abs(opt.threshold || ((this._max - this._min) * 0.005)); // default threshold 0.5%

    // fake last value for initialization, making sure it passes threshold
    this._lastValue = opt.max + this._threshold + 1;
    console.log('initial last value', this._lastValue);
};

VS.prototype.stabilize = function (value) {
    // if diff from last value > threshold, replace last value
    if (abs(this._lastValue - value) > this._threshold) {
        this._lastValue = value;
    }

    return this._lastValue;
};

module.exports = VS;
