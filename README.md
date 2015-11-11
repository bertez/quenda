# Quenda

[![Build Status](https://travis-ci.org/bertez/quenda.svg?branch=master)](https://travis-ci.org/bertez/quenda)

Quenda is a simple javascript function queue. With quenda you can create queues of functions and execute them in order with a delay. It also has controls for executing next and previous functions, playing and pausing the queue and many more...

- IE9+
- No jQuery needed.
- Just one dependency: [merge](https://github.com/yeikos/js.merge)
- AMD and CommonJS compatible.
- Works both node and browser environments.


## Install

```npm install quenda```

```bower install quenda```

### Using in a CommonJS environment (node, webpack, ...)

``` var Quenda = require('quenda');```

### Using in a AMD environment (requirejs, webpack,...)

```js
require(['quenda'], function(Quenda) {
  //..
});
```

## Simple example

You can easily create new queues like this:

```js
require(['quenda'], function(Quenda) {

  var myQueue = Quenda.new().add([
    {
        nextDelay: 2000,
        fn: function() {
            console.log('first');
        }
    },
    {
        fn: function() {
            console.log('second');
        }
    }
  ]);

  myQueue.play();

  console.log(Quenda.getAll()); //Prints an array with all the queues (1 queue in this case)
});
```

After executing this code you will se in your console log output the word 'first' and after 2 seconds the word 'second'.

## Advanced example

Check [demo/index.html](https://github.com/bertez/quenda/blob/master/demo/index.html) for a more complex example.

## Main object (Quenda) API

Quenda is the main object that creates and stores queues.


Method | Description |
---------|---------------|
new(config) | Creates new queues (see below for config options)
getAll() | Get an array with all queues
delete(index) | Delete a queue by index
deleteAll() | Deletes all queues

### New queue config options

Variable | Default Value | Description | Type
---------|---------------|-------------|--------------
loop| false | Defines if the queue should loop | boolean
maxLoops | Infinity | Defines the max number of loops | number (integer)
defaultDelay | undefined | Define the default delay for the queue steps with no delay defined | number (ms)

## Queues API

The new queues created with Quenda.new() have this API:

Method | Description |
---------|---------------|
add(stepConfig) | Adds a step to the queue (see below for config options)
play() | Plays the queue
pause() | Pauses the queue
next() | Executes the next step in the queue. Loops if the queue is configured to loop.
prev() | Executes the previous step in the queue. Does not loop, stops when the queue reaches the first element.

### New step config options

You can create new steps using Quenda.new(stepConfig) and also Quenda.new([stepConfig, stepConfig, ...]). See basic example above.

Variable |  Description | Type
---------|-------------|--------------
nextDelay| The number of miliseconds to wait before executing the next step. If it is not present and the queue is configured with a defaultDelay this value will be used. | number (ms)
fn | Function to execute in this step. The *this* value is the queue and the first argument is the step. See the demo for an example. | function
autoDestroy | If true the step will be executed once and then removed from the queue | boolean
preload | An array of image urls that will be preloaded before this step is executed. The delay value will start to count after the preload is completed. *Note: this only works in browser environments*. | array

# Building

1. ```npm install```
2. ```gulp build```

# Changelog

- 1.0.5: bower and npm
- 1.0.4: first public version
- 1.0.3: Bug fixes. Implemented autoDestroy.
- 1.0.2: Travis integration
- 1.0.1: Bug fixes
- 1.0.0: Initial version.

# License

MIT.

Created by Berto Yáñez [@bertez](https://twitter.com/bertez)