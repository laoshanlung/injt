var pkg = require('./package.json')
    , injt = require('./injt');

injt.version = pkg.version;

module.exports = injt;
