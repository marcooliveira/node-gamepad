'use strict';

var Gamepad = require('../index')
;

Gamepad.device(function (err, gamepad) {
    if (err) {
        return console.error('Unable to get pad:', err);
    }

    function output(event) {
        console.log.apply(console, arguments);
    }

    var eventsPress = [
        // directional buttons
        'upPress',
        'rightPress',
        'downPress',
        'leftPress',
        'upRelease',
        'rightRelease',
        'downRelease',
        'leftRelease',
        'directionalChange', // calls back with something like { up: false, right: false, down: false, left: false }

        // main buttons
        'trianglePress',
        'circlePress',
        'crossPress',
        'squarePress',
        'triangleRelease',
        'circleRelease',
        'crossRelease',
        'squareRelease',

        // left stick
        'leftStickChange', // calls back with something like { h: 128, v: 111 }. h and v go from 0 to 255
        'leftStickPress',
        'leftStickRelease',

        // right stick
        'rightStickChange', // calls back with something like { h: 128, v: 111 }. h and v go from 0 to 255
        'rightStickPress',
        'rightStickRelease',

        // secondary buttons
        'l1Press',
        'r1Press',
        'l2Press',
        'r2Press',
        'l1Release',
        'r1Release',
        'l2Release',
        'r2Release',

        // miscellaneous
        'selectPress',
        'startPress',
        'selectRelease',
        'startRelease',

        'analogChange' // calls back with true or false
    ];

    eventsPress.forEach(function (event) {
        gamepad.on(event, output.bind(null, event));
    });

    gamepad.on('error', function (err) {
        console.error(err);
    });
});
