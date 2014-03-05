'use strict';

var Gamepad = require('../index')
;

Gamepad.device(function (err, gamepad) {
    if (err) {
        return console.error('Unable to get pad:', err);
    }

    var prettyRaw = function (rawData) {
        Array.prototype.reduce.call(rawData, function (prev, curr, index) {
            var bin = curr.toString(2);
            while (bin.length < 8) {
                bin = 0 + bin;
            }
            console.log(index + ':', bin, '->', curr);
        }, '');
    };

    var dataHandler = function (data) {
            prettyRaw(data.rawData);

            console.log('data:', data);
        },
        errorHandler = function (err) {
            console.error('error:', err);
        }
    ;

    gamepad.on('data', dataHandler);
    gamepad.on('error', errorHandler);
});
