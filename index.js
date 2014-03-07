'use strict';

var HID  = require('node-hid'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    VS = require('./lib/value-stabilizer')
;

var Gamepad = function (hid) {
    // Duplex.call(this);
    EventEmitter.call(this);

    // store hid
    this._hid = hid;

    // prepare stabilizers used for reducing unstable analog values
    this._prepareValueStabilizers();

    this._lastData = this._parseData(
        this._stabLH.stabilize.bind(this._stabLH),
        this._stabLV.stabilize.bind(this._stabLV),
        this._stabRH.stabilize.bind(this._stabRH),
        this._stabRV.stabilize.bind(this._stabRV),
        new Buffer([0x80, 0x80, 0x82, 0x80, 0x80, 0x0f, 0x00, 0x40])
    );

    // listen to data and pass the stabilizers.
    // function is curried to reduce lookups, considering
    // that the 'data' event happens very often
    hid.on('data', this._handleData.bind(
        this,
        this._stabLH.stabilize.bind(this._stabLH),
        this._stabLV.stabilize.bind(this._stabLV),
        this._stabRH.stabilize.bind(this._stabRH),
        this._stabRV.stabilize.bind(this._stabRV)
    ));

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

Gamepad.prototype.value = function (property) {
    return this._lastData[property];
};

// -----------------------------------------------------------------------------

Gamepad.prototype._write = function (chunk, encoding, callback) {
    // TODO: implement this
};

Gamepad.prototype._read = function (size) {
    // TODO: implement this
};

// -----------------------------------------------------------------------------

Gamepad.prototype._prepareValueStabilizers = function () {
    // left stick stabilizer
    this._stabLH = new VS({ min: 0, max: 255 });
    this._stabLV = new VS({ min: 0, max: 255 });

    // right stick stabilizer
    this._stabRH = new VS({ min: 0, max: 255 });
    this._stabRV = new VS({ min: 0, max: 255 });
};

Gamepad.prototype._handleData = function (stabLH, stabLV, stabRH, stabRV, data) {
    var oldData = this._lastData,
        newData,
        inputChanges;

    // parse data and replace last data with new
    this._lastData = newData = this._parseData.apply(this, arguments);

    // check for changes in any of the inputs and dispatch respective events
    inputChanges = this._checkDataChanges(oldData, newData);
    this._emitInputChanges(inputChanges);

    this.emit('data', newData);
};

Gamepad.prototype._checkDataChanges = function (oldData, newData) {
    var changes = [],
        k,
        newValue,
        oldValue,
        directionalChanged,
        keyName,
        i,
        directionalKeys = ['up', 'right', 'left', 'down']
    ;

    for (k in newData) {
        oldValue = oldData[k];
        newValue = newData[k];

        switch (k) {
        case 'rawData':
            // ignore this property
            continue;
        case 'leftStick':
            // check if direction changed
            if (newValue.h !== oldValue.h || newValue.v !== oldValue.v) {
                changes.push(['leftStickChange', {
                    h: newValue.h,
                    v: newValue.v
                }]);
            }

            // check if press state changed
            (oldValue.pressed !== newValue.pressed) && (changes.push(['leftStick' + (newValue ? 'Press' : 'Release')]));
            break;
        case 'rightStick':
            // check if direction changed
            if (newValue.h !== oldValue.h || newValue.v !== oldValue.v) {
                changes.push(['rightStickChange', {
                    h: newValue.h,
                    v: newValue.v
                }]);
            }

            // check if press state changed
            (oldValue.pressed !== newValue.pressed) && (changes.push(['rightStick' + (newValue ? 'Press' : 'Release')]));
            break;
        case 'directional':
            directionalChanged = false;

            // check if direction changed
            for (i in directionalKeys) {
                keyName = directionalKeys[i];
                // for each direction, if the press state changed
                if (newValue[keyName] !== oldValue[keyName]) {
                    // add that button change
                    changes.push([keyName + (newValue[keyName] ? 'Press' : 'Release')]);
                    directionalChanged = true;
                }
            }

            // if any direction changed
            (directionalChanged) && changes.push(['directionalChange', newValue]);
            break;
        case 'analog':
            (oldValue !== newValue) && (changes.push(['analogChange', newValue]));
            break;
        default:
            // if something changed, store new value
            (oldValue !== newValue) && (changes.push([k + (newValue ? 'Press' : 'Release')]));
        }
    }

    return changes;
};

Gamepad.prototype._emitInputChanges = function (changes) {
    var k;

    for (k in changes) {
        this.emit.apply(this, changes[k]);
    }
};

Gamepad.prototype._parseData = function (stabLH, stabLV, stabRH, stabRV, data) {
    // get directional and main buttons (square, circle, triangle and X)
    var mainBtns = data[5],
        // secondary buttons
        secBtns = data[6],
        padData
    ;

    padData = {
        rawData: data,
        leftStick: {
            h:       stabLH(data[0]),
            v:       stabLV(data[1]),
            pressed: !!(secBtns & 0x40)
        },
        rightStick: {
            h:       stabRH(data[3]),
            v:       stabRV(data[4]),
            pressed: !!(secBtns & 0x80)
        },
        directional: {
            up:    (mainBtns >= 0 && mainBtns <= 1) || mainBtns === 7,
            right: mainBtns >= 1 && mainBtns <= 3,
            down:  mainBtns >= 3 && mainBtns <= 5,
            left:  mainBtns >= 5 && mainBtns <= 7
        },
        triangle: !!(mainBtns & 0x10),
        circle:   !!(mainBtns & 0x20),
        cross:    !!(mainBtns & 0x40),
        square:   !!(mainBtns & 0x80),
        start:    !!(secBtns & 0x20),
        select:   !!(secBtns & 0x10),
        analog:   !(data[7] & 0x80),
        l1:       !!(secBtns & 0x01),
        r1:       !!(secBtns & 0x02),
        l2:       !!(secBtns & 0x04),
        r2:       !!(secBtns & 0x08)
    };

    return padData;
};

module.exports = Gamepad;
