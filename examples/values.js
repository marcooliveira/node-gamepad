'use strict';

var Gamepad = require('../index')
;

Gamepad.device(function (err, gamepad) {
    if (err) {
        return console.error('Unable to get pad:', err);
    }

    var properties = [
        // directional buttons
        'directional',

        // main buttons
        'triangle',
        'circle',
        'cross',
        'square',

        // left stick
        'leftStick',

        // right stick
        'rightStick',

        // secondary buttons
        'l1',
        'r1',
        'l2',
        'r2',

        // miscellaneous
        'select',
        'start',

        'analog'
    ];

    properties.forEach(function (property) {
        console.log(property, gamepad.value(property));
    });
});
