'use strict';

var Gamepad = require('../index')
;

Gamepad.device(function (err, gamepad) {
    if (err) {
        return console.error('Unable to get pad:', err);
    }

    var dataHandler = function (data) {
            Array.prototype.reduce.call(data.rawData, function (prev, curr, index) {
                console.log(index + ':', curr, '->', curr.toString(2));
            }, '');
            console.log('data:', data);
        },
        errorHandler = function (err) {
            console.error('error:', err);
        }
    ;

    gamepad.on('data', dataHandler);
    gamepad.on('error', errorHandler);
});
