var injector = require('./')
    , path = require('path');

describe('injt', function() {
    beforeEach(function() {
        injector.alias('_', 'lodash');
    });

    afterEach(function() {
        injector._modules = {};
        injector._aliases = {};
        injector._maps = {};
    });

    describe('#alias', function() {
        it('should set alias', function() {
            injector.alias('_', 'lodash');
            expect(injector._aliases).toEqual({'_': 'lodash'});
        });
    });

    describe('#module', function() {
        it('should add module to internal maps', function() {
            var spy = jasmine.createSpy();
            injector.module('test', spy);

            expect(injector._modules).toEqual({});
            expect(injector._maps).toEqual({
                test: {
                    deps: [],
                    fn: spy
                }
            });
        });

        it('should handle object', function() {
            injector.module('test', {a: 1});
            expect(injector._modules).toEqual({});
            expect(injector._maps.test).toBeDefined();
            expect(injector._maps.test.deps).toEqual([]);
            expect(injector._maps.test.fn).toEqual({a: 1});
        });

        it('should use function name as module name', function() {
            injector.module(function test() {
                return {a: 1};
            });

            expect(injector._modules).toEqual({});
            expect(injector._maps.test).toBeDefined();
            expect(injector._maps.test.fn()).toEqual({a: 1});
        });

        it('should throw exception when not having name', function() {
            try {
                injector.module(function() {});
                fail('Should throw exception');
            } catch (e) {
                expect(e).toEqual('Missing name');
            }
        });
    });

    describe('#discover', function() {
        it('should automatically discover all modules', function() {
            injector.discover(path.join(__dirname, 'examples'));
            expect(injector._maps.random).toEqual({
                deps: ['Service', 'User'],
                fn: require('./examples/random')
            });

            expect(injector._maps.Service).toEqual({
                deps: ['_', 'User'],
                fn: require('./examples/service')
            });

            expect(injector._maps.User).toEqual({
                deps: [],
                fn: require('./examples/user')
            });

            expect(injector._maps.data).toEqual({
                deps: [],
                fn: {
                    'a': 1
                }
            });
        });
    });

    describe('#inject', function() {
        beforeEach(function() {
            injector.discover(path.join(__dirname, 'examples'));
        });

        it('should return the defined module', function() {
            expect(injector.inject('random')).toBeDefined();
            expect(injector.inject('User')).toBeDefined();
            expect(injector.inject('Service')).toBeDefined();
        });

        it('should delegate to npm when not find the module', function() {
            expect(injector.inject('lodash')).toBeDefined();
        });

        it('should be able to use alias', function() {
            expect(injector.inject('_')).toBeDefined();
        });

        it('should throw exception when not having the module at all', function() {
            try {
                injector.inject('blablabla');
                fail('Should throw exception');
            } catch (e) {
                expect(e.code).toEqual('MODULE_NOT_FOUND');
            }
        });

        it('should initialize the module once', function() {
            var spy = jasmine.createSpy();
            injector.module('test', spy);
            injector.inject('test');
            expect(spy.calls.count()).toBe(1);
        });

        it('should support overwrite module', function() {
            var spy1 = jasmine.createSpy('initial_module').and.returnValue({a: 1});
            var spy2 = jasmine.createSpy('overwritten_module').and.returnValue({a: 2});
            var test;

            injector.module('test', spy1);
            test = injector.inject('test');
            expect(test.a).toEqual(1);

            injector.module('test', spy2);
            test = injector.inject('test');
            expect(test.a).toEqual(2);
            expect(spy2).toHaveBeenCalled();
        });

        it('should support inject function mode', function(done) {
            var fn = injector.inject(function(random, User, Service) {
                expect(random).toBeDefined();
                expect(User).toBeDefined();
                expect(Service).toBeDefined();

                done();
            });
            fn();
        });
    });
});
