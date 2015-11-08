/**
 * quenda - A simple javascript function queue.
 * @version v0.0.1
 * @author Berto Yáñez <berto@ber.to>
 * @link https://github.com/bertez/quenda
 * @license MIT
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['merge'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('merge'));
    } else {
        root.Quenda = factory(root.merge);
    }
}(this, function(merge) {
    'use strict';

    var defaultConfig = {
        loop: false,
        defaultDelay: 1000,
        maxLoops: Infinity
    };

    var Quenda = {
        queues: [],
        prototype: {
            add: function(step) {
                if (!step) {
                    throw new Error('Not enough arguments');
                }

                if (Array.isArray(step)) {
                    step.forEach(function(s) {
                        this.add(s);
                    }, this);
                } else {
                    if (step.nextDelay < 0) {
                        throw new Error('Steps shold have at least a nextDelay property greater than 0');
                    }

                    this.steps.push(step);
                }
                return this;
            },
            play: function() {
                this._ExecuteNext(this._getNext());
                this.paused = false;
                return this;
            },
            pause: function() {
                if (this._currentTimeout) {
                    clearTimeout(this._currentTimeout);
                }
                this.paused = true;
                return this;
            },
            next: function() {
                this.pause();
                this.play();

                return this;
            },
            getSteps: function() {
                return this.steps;
            },
            _current: 0,
            loops: 0,
            _ExecuteNext: function(step) {
                if (step.autoDestroy) {
                    var index = this.steps.indexOf(step);
                    --this._current;
                    this.steps.splice(index, 1);
                }

                if (step.preload && !step.preloaded) {
                    this._handlePreload(step.preload, function() {
                        this._setNextTimeout(parseInt(step.nextDelay, 10));
                        step.preloaded = true;
                        step.fn && step.fn();
                    }.bind(this));
                } else {
                    this._setNextTimeout(parseInt(step.nextDelay));
                    step.fn && step.fn();
                }
            },
            _getNext: function() {
                var nextStep;

                if (this._current === this.steps.length) {
                    if (this.config.loop && this.loops < this.config.maxLoops) {
                        this.loops++;
                        nextStep = this._current = 0;
                    } else {
                        return;
                    }
                } else {
                    nextStep = this._current;
                }

                this._current++;

                return this.steps[nextStep];
            },
            _setNextTimeout: function(nextDelay) {
                if (!this.paused) {
                    this._currentTimeout = setTimeout(function() {
                        this._ExecuteNext(this._getNext());
                    }.bind(this), nextDelay || this.config.defaultDelay);
                }
            },
            _handlePreload: function(images, callback) {
                var loaded = 0;
                images.forEach(function(src) {
                    var image = new Image();
                    image.onload = function() {
                        ++loaded;
                        loaded === images.length && callback();
                    };
                    image.src = src;
                });
            }
        },
        getAll: function() {
            return this.queues;
        },
        deleteAll: function() {
            this.getAll().forEach(function(queue) {
                queue.instance.pause();
            });

            this.queues = [];
        },
        delete: function(index) {
            var queue = this.queues.splice(index, 1);
            queue[0].instance.pause();
            return this;
        },
        new: function(config, name) {
            if (config && config !== Object(config)) {
                throw new Error('Config object should be a key/value object.');
            }

            var instance = Object.create(this.prototype);

            this.queues.push(name ? {
                name: name,
                instance: instance
            } : {
                instance: instance
            });

            instance.config = merge({}, defaultConfig, config);
            instance.steps = [];
            return instance;
        }
    };

    return Quenda;
}));
