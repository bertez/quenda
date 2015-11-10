var expect = require('chai').expect;
var sinon = require('sinon');
var Quenda = require('../src/quenda');

describe('Quenda', function() {
    describe('Instancing', function() {
        it('should return an error if first argument is not an object', function() {
            expect(function() {
                return Quenda.new(123);
            }).to.throw(Error);
        });

        it('should return an instance of the main object prototype', function() {
            var queue = Quenda.new();

            expect(Object.getPrototypeOf(queue) === Quenda.prototype).to.be.true;
        });
    });

    describe('Creating and deleting queues', function() {
        beforeEach(function() {
            Quenda.deleteAll();
        });

        it('should create new queues', function() {
            var myQueue = Quenda.new({});

            expect(Quenda.getAll().length).to.equal(1);
            expect(Quenda.getAll()[0].instance).to.equal(myQueue);
        });

        it('should delete queues', function() {
            Quenda.new({});
            Quenda.new({}, 'second');

            Quenda.delete(0);

            expect(Quenda.getAll().length).to.equal(1);
            expect(Quenda.getAll()[0].name).to.equal('second');
        });

        it('should bulk delete queues', function() {
            Quenda.new({});
            Quenda.new({});
            Quenda.new({});

            expect(Quenda.getAll().length).to.equal(3);

            Quenda.deleteAll();

            expect(Quenda.getAll().length).to.equal(0);
        });

        it('should create a named queue if a name is passed', function() {
            Quenda.new({}, 'hello');

            expect(Quenda.getAll()[0].name).to.equal('hello');
        });


        it('should merge the passed config with the default queue config', function() {
            var queue = Quenda.new({
                loop: true,
                foo: 'bar'
            });

            expect(queue.config.loop).to.be.true;
            expect(queue.config.foo).to.equal('bar');
        });
    });

    describe('Queues API', function() {
        var clock;

        beforeEach(function() {
            Quenda.deleteAll();
            clock = sinon.useFakeTimers();
        });

        afterEach(function() {
            clock.restore();
        });

        it('should add a step', function() {
            var myQueue = Quenda.new().add({
                nextDelay: 1000
            });

            expect(myQueue.steps.length).to.equal(1);
        });

        it('should add an array of steps', function() {
            var myQueue = Quenda.new().add([{
                nextDelay: 1000
            }, {
                nextDelay: 1000
            }]);

            expect(myQueue.steps.length).to.equal(2);
        });

        it('should throw an error if a step is added without arguments', function() {
            expect(function() {
                return Quenda.new().add();
            }).to.throw(Error);
        });

        it('should throw an error if a step is added with a negative nextDelay', function() {
            expect(function() {
                return Quenda.new().add({
                    nextDelay: -1
                });
            }).to.throw(Error);
        });

        it('should pause', function() {
            var counter = 0;

            Quenda.new().add([{
                nextDelay: 1000
            }, {
                nextDelay: 1000,
                fn: function() {
                    counter++;
                }
            }]).play().pause();

            expect(counter).to.equal(0);
            clock.tick(1000);
            expect(counter).to.equal(0);

        });

        it('should move to next ignoring the delay', function() {
            var counter = 0;

            Quenda.new().add([{
                nextDelay: 1000
            }, {
                nextDelay: 1000,
                fn: function() {
                    counter++;
                }
            }]).play().next();

            expect(counter).to.equal(1);
        });

        it('should auto destroy one step', function() {

            var myQueue = Quenda.new().add({
                autoDestroy: true
            }).play();

            expect(myQueue.steps.length).to.equal(0);
        });

        it('should loop', function() {
            var counter;

            Quenda.new({
                loop: true
            }).add([{
                nextDelay: 1000,
                fn: function() {
                    counter = 0;
                }
            }, {
                nextDelay: 1000,
                fn: function() {
                    counter = 1;
                }
            }]).play();

            expect(counter).to.equal(0);
            clock.tick(1000);
            expect(counter).to.equal(1);
            clock.tick(1000);
            expect(counter).to.equal(0);
        });

        it('should stop looping after reaching maxLoops', function() {
            var counter = 0;

            Quenda.new({
                loop: true,
                maxLoops: 2
            }).add([{
                nextDelay: 1000,
                fn: function() {
                    counter++;
                }
            }, {
                nextDelay: 1000,
                fn: function() {
                    counter++;
                }
            }]).play();

            expect(counter).to.equal(1);
            clock.tick(1000);
            expect(counter).to.equal(2);
            clock.tick(1000);
            expect(counter).to.equal(3);
            clock.tick(1000);
            expect(counter).to.equal(4);
            clock.tick(1000);
            expect(counter).to.equal(5);
            clock.tick(1000);
            expect(counter).to.equal(6);
            clock.tick(1000);
            expect(counter).to.equal(6);
            clock.tick(1000);
            expect(counter).to.equal(6);

        });
    });
});
