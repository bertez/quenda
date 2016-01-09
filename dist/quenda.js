/**
 * quenda - A simple javascript function queue.
 * @version v1.0.6
 * @author Berto Yáñez <berto@ber.to>
 * @homepage https://github.com/bertez/quenda
 * @license MIT
 */
(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['merge'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('merge'));
    } else {
        root.Quenda = factory(root.merge);
    }
}(this, function(merge) {
    'use strict';

    var Queue = {

        /**
         * Adds a new step to this queue
         * @param {Object} Step definition
         * @return {Object} This queue instance
         */
        add: function(step) {
            if (!step) {
                throw new Error('Not enough arguments');
            }


            if (Array.isArray(step)) {
                step.forEach(function(s) {
                    this.add(s);
                }, this);
            } else {
                if (step.nextDelay && step.nextDelay < 0) {
                    throw new Error('nextDelay property must be greater than 0');
                }

                if (step.fn && typeof(step.fn) !== 'function') {
                    throw new Error('The property fn must be a function');
                }

                if (step.autoDestroy && typeof(step.autoDestroy) !== 'boolean') {
                    throw new Error('The property autoDestroy must be a boolean');
                }

                if (step.preload && !Array.isArray(step.preload)) {
                    throw new Error('The property preload must be an array of urls');
                }

                this.steps.push(step);
            }
            return this;
        },
        /**
         * Plays this queue
         * @return {Object} This queue instance
         */
        play: function() {
            if (!this._playing) {
                this._playing = true;
                this._executeStep(this._current);
            }

            return this;
        },
        /**
         * Pauses this queue
         * @return {Object} This queue instance
         */
        pause: function() {
            if (this._currentTimeout) {
                clearTimeout(this._currentTimeout);
            }

            this._playing = false;

            return this;
        },
        /**
         * Moves to next element in this queue
         * @return {Object} This queue instance
         */
        next: function() {
            this.pause();

            if (this._recentDestroy) {
                this._executeStep(this._current);
                this._recentDestroy = false;
            } else {
                this._executeStep(++this._current);
            }

            return this;
        },
        /**
         * Moves to the previous element in this queue
         * @return {Object} This queue instance
         */
        prev: function() {
            this.pause();
            this._executeStep(--this._current);

            return this;
        },
        _current: 0,
        _loops: 0,
        _playing: false,
        _recentDestroy: false,
        /**
         * Executes one element of the queue
         * @param  {number} index the element index
         */
        _executeStep: function(index) {
            var step;

            if (!this.steps[index]) {
                if (this.config.loop && this._loops < this.config.maxLoops) {
                    this._loops++;
                    step = this.steps[this._current = 0];
                } else {
                    return false;
                }
            } else {
                step = this.steps[index];
            }

            if (step.preload && !step.preloaded) {
                this._handlePreload(step.preload, function() {
                    step.preloaded = true;
                    this._setNext(step.nextDelay);
                    step.fn && step.fn.call(this, step);
                }.bind(this));
            } else {
                this._setNext(step.nextDelay);
                step.fn && step.fn.call(this, step);
            }

            if (step.autoDestroy) {
                var i = this.steps.indexOf(step);
                this._current = i;
                this._recentDestroy = true;
                this.steps.splice(i, 1);
            }
        },
        /**
         * Sets the execution timeout of the next element in the queue
         * @param {number} nextDelay the delay in ms
         */
        _setNext: function(nextDelay) {
            var delay = nextDelay || this.config.defaultDelay;

            if (delay && this._playing) {
                this._currentTimeout = setTimeout(function() {
                    this._executeStep(++this._current);
                }.bind(this), delay);
            }
        },
        /**
         * Handles the image preload
         * @param  {Array}   images   array of image urls
         * @param  {Function} callback callback to execute after all the images are loaded
         */
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
    };

    /**
     * Quenda object
     * @type {Object}
     */
    var Quenda = {
        queues: [],
        /**
         * Gets all the queues stored in the main object
         * @return {Array} Array of queue instances
         */
        getAll: function() {
            return this.queues;
        },
        /**
         * Deletes all the queues stored in the main object
         * @return {Quenda} The main object
         */
        deleteAll: function() {
            this.getAll().forEach(function(queue) {
                queue.instance.pause();
            });

            this.queues = [];

            return this;
        },
        /**
         * Delete a queue stored in the main object
         * @param  {number} [index] The queue index
         * @return {Quenda} The main object
         */
        delete: function(index) {
            var queue = this.queues.splice(index || 0, 1);
            queue[0].instance.pause();
            return this;
        },
        /**
         * Create a new queue
         * @param  {Object} [config] The queue configuration
         * @param  {[type]} [name] The queue name
         * @return {[type]} The queue instance
         */
        new: function(config, name) {
            if (config && config !== Object(config)) {
                throw new Error('Config object should be a key/value object.');
            }

            var defaultConfig = {
                loop: false,
                maxLoops: Infinity
            };

            var instance = Object.create(Queue);

            this.queues.push(name ? {
                name: name,
                instance: instance
            } : {
                instance: instance
            });

            merge(instance, {
                config: merge({}, defaultConfig, config),
                steps: []
            });

            return instance;
        }
    };

    Quenda.fn = Quenda.prototype = Queue;

    Quenda.version = '1.0.6';

    return Quenda;
}));
