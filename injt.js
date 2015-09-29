var fs = require('fs')
    , path = require('path')
    , _ = require('lodash')
    , ts = require('typescript')
    , babel = require('babel');

// http://stackoverflow.com/a/9924463
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null) {
        result = [];
    }
    return result;
}

// http://stackoverflow.com/a/19682189/386378
function requireFromString(src, filename) {
    var m = new module.constructor();
    m.paths = module.paths;
    m._compile(src, filename);
    return m.exports;
}


function getFileExtension(dir) {
    return path.extname(dir);
}

var self = {
    _maps: {},
    _aliases: {},
    _modules: {}
};

self.parsers = {
    '.js': function(dir) {
        return require(dir);
    },
    '.json': function(dir) {
        return require(dir);
    },
    '.ts': function(dir) {
        var source = fs.readFileSync(dir).toString();
        var result = ts.transpile(source, {
            module: ts.ModuleKind.CommonJS
        });
        return requireFromString(result, dir);
    },
    '.es': function(dir) {
        var source = fs.readFileSync(dir).toString();
        var result = babel.transform(source, {

        });

        return requireFromString(result.code);
    }
};

function discover(dir, options) {
    options = options || {};
    try {
        var files = fs.readdirSync(dir);
        _.each(files, function(file) {
            if (file.charAt(0) === '.') {
                return;
            }
            self.discover(path.join(dir, file), options);
        });
    } catch (e) {
        if (e.code === 'ENOTDIR') {
            // this is a file

            if (options.skip && options.skip.test(dir)) {
                return;
            }

            var ext = getFileExtension(dir);
            if (self.parsers[ext]) {
                var result = self.parsers[ext](dir);
                self.module(result.name || path.basename(dir, ext), result);
            } else {
                console.warn('Unsupport file type %s', ext);
            }
        } else {
            throw e;
        }
    }
}

function _module(name, fn) {
    if (_.isFunction(name)) {
        fn = name;
        name = fn.name;
    }

    if (!name) {
        throw 'Missing name';
    }

    // allow overwrite previously defined module
    if (self._modules[name]) {
        delete self._modules[name];
    }

    self._maps[name] = {
        deps: _.isFunction(fn) ? getParamNames(fn) : [],
        fn: fn
    };
}

function alias(to, from) {
    self._aliases[to] = from;
}

function inject(name) {
    var deps, fn;

    if (_.isString(name)) {
        if (self._aliases[name]) {
            name = self._aliases[name];
        }

        // check cache
        if (self._modules[name]) {
            return self._modules[name];
        }

        if (!self._maps[name]) {
            // delegate to npm
            self._modules[name] = require(name);
            return self._modules[name];
        }

        var mod = self._maps[name];
        deps = mod.deps;
        fn = mod.fn;
    } else if (_.isFunction(name)) {
        deps = getParamNames(name);
    } else {
        throw 'Unsupported type';
    }

    // this is the actual init process of the module
    var intersection = _.chain(_.keys(self._modules)).intersection(deps).value();
    var remaining = _.without.apply(_, _.union([deps], intersection));
    if (remaining.length) {
        // pending deps
        _.forEach(remaining, function(dep) {
            self.inject(dep);
        });
    }

    var resolved = [];
    _.forEach(deps, function(dep) {
        if (self._aliases[dep]) {
            dep = self._aliases[dep];
        }
        resolved.push(self._modules[dep]);
    });

    if (fn) {
        if (_.isFunction(fn)) {
            self._modules[name] = fn.apply(null, resolved);
        } else {
            self._modules[name] = fn;
        }

        return self._modules[name];
    } else {
        fn = name;
        return function() {
            fn.apply(null, resolved);
        };
    }
}

self.discover = discover;
self.module = _module;
self.alias = alias;
self.inject = inject;

module.exports = self;
