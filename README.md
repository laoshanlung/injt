# Nodejs dependency injection
Yet another attempt to bring dependency injection into CommonJS

# Installation
`npm install injt`

# Usage

## Inline module definition
```
var injector = require('injt')
    , Backbone = require('backbone');

injector.module('Model', function() {
  return Backbone.Model({});
});

injector.module('anotherLib', function(Model, lodash) {
  return {};
});

var Model = injetor.inject('Model');
var model = new Model();
```

## Use function name as module name
```
injector.module(function Model() {});
injector.inject('Model');
```

## Module in its own file
```
// model.js
module.exports = function(lodash) {

}
// index.js
injector.module('Model', require('./model.js');
```

## Use alias
```
injector.alias('_', 'lodash');

injector.module('Model', function(_) {

});
```

## Auto discovery mode
Use this when you want to automatically discover all modules in a given directory. The injector will automatically use the file name as module name if you don't provide any function name.
```
injector.discover(__dirname);
```

## Inject globally
Instead of calling `injector.inject`, you can also assign it to global
```
global.inject = injector.inject
```

# TODO
- Improve documentations
- Write more unit tests
- Support event hook before/after initializing a module
- Support more parsers (CoffeeScript, TypeScript etc...)
- Support filtering hooks (for Babel and similar pre-processing libraries)

# License
MIT
