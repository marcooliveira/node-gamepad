# gamepad

This is a pet project, a module for reading the input from an old PS3 like controller, which I will then be using to control my quadcopter.

## Introduction

This module provides the following basic mechanisms:

- `data` event that exposes not only the raw HID data, but also a parsed data object.
- A list of convenience events for each of the gamepad buttons (press, release and change in case of switches/analog sticks).
- Access to the current value of each input (button, switch or analog stick).

## Usage

Check `examples/` for more detailed usage examples.

Here's a very simple example of how you could get the data out of the gamepad:

```js
var Gamepad = require('node-gamepad');

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
```

This will output something like this on every `data` event:

```
{
    rawData: <Buffer 80 80 82 80 80 0f 00 40>,
    leftStick: { h: 128, v: 128, pressed: false },
    rightStick: { h: 128, v: 128, pressed: false },
    directional: { up: false, right: false, down: false, left: false },
    triangle: false,
    circle: false,
    cross: false,
    square: false,
    start: false,
    select: false,
    analog: true,
    l1: false,
    r1: false,
    l2: false,
    r2: false
}
```

The `rawData` property is the raw data read from the HID, while all the other properties are convenience properties already parsed from the raw data. Note that the stick `h` and `v` values range from 0 to 255.

## TODO

- add support for mappings. Maybe even support transformation functions that are executed on data prior to raising events.
- turn the sucker into a stream
- make the module resilient to accidental disconnections and make it recover automatically once it connects again
- make the value stabilizer sensible to the last X occurrances of a value and correct for sistematic errors

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
