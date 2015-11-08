var expect = require('chai').expect;
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

    });
});
