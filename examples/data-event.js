'use strict';

var Gamepad = require('../index')
;

Gamepad.device(function (err, gamepad) {
    if (err) {
        return console.error('Unable to get pad:', err);
    }

    gamepad.on('data', function (data) {
        console.log(data);
    });
    gamepad.on('error', function (err) {
        console.error(err);
    });
});
