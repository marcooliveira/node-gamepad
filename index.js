'use strict';

var HID  = require('node-hid'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    VS = require('./lib/value-stabilizer')
;

var Gamepad = function (hid) {
    var stabLH,
        stabLV,
        stabRH,
        stabRV
    ;

    // Duplex.call(this);
    EventEmitter.call(this);

    // store hid
    this._hid = hid;

    // left stick stabilizer
    this._stabLH = new VS({ min: 0, max: 255 });
    this._stabLV = new VS({ min: 0, max: 255 });
    stabLH = this._stabLH.stabilize.bind(this._stabLH);
    stabLV = this._stabLV.stabilize.bind(this._stabLV);

    // right stick stabilizer
    this._stabRH = new VS({ min: 0, max: 255 });
    this._stabRV = new VS({ min: 0, max: 255 });
    stabRH = this._stabRH.stabilize.bind(this._stabRH);
    stabRV = this._stabRV.stabilize.bind(this._stabRV);

    // TODO: move this to _parseData()
    hid.on('data', function (data) {
        var dir = data[5],
            padData = {
            rawData: data,
            leftStick: {
                h: stabLH(data[0]),
                v: stabLV(data[1])
            },
            rightStick: {
                h: stabRH(data[3]),
                v: stabRV(data[4])
            },
            directional: {
                up:    (dir >= 0 && dir <= 1) || dir === 7,
                right: dir >= 1 && dir <= 3,
                down:  dir >= 3 && dir <= 5,
                left:  dir >= 5 && dir <= 7
            }
        };
        this.emit('data', padData);
    }.bind(this));

    hid.on('error', function (err) {
        this.emit('error', err);
    }.bind(this));
};

util.inherits(Gamepad, EventEmitter);

Gamepad.device = function (opt, callback) {
    var hid,
        gamepad
    ;

    if (typeof opt === 'function') {
        callback = opt;
        opt = {};
    }

    opt = opt || {};

    opt.path = opt.path || 'USB_0079_0006_fd120000';

    // try to get the hid
    try {
        hid = new HID.HID(opt.path);
    } catch (err) {
        return callback(err);
    }

    gamepad = new Gamepad(hid);

    callback(null, gamepad);
};

// -----------------------------------------------------------------------------

Gamepad.prototype._write = function (chunk, encoding, callback) {
    // TODO: implement this
};

Gamepad.prototype._read = function (size) {
    // TODO: implement this
};

// -----------------------------------------------------------------------------

Gamepad.prototype._parseData = function (data) {

};

module.exports = Gamepad;
