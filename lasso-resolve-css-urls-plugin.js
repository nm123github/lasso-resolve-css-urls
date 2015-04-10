var cssParser = require('raptor-css-parser');
var raptorModulesUtil = require('raptor-modules/util');
var resolver = require('raptor-modules/resolver');
var nodePath = require('path');
var REQUIRE_PREFIX = 'require:';

function defaultUrlResolver(url, lassoContext, callback) {
    if (url.charAt(0) === '/' && url.charAt(1) !== '/') {
        url = nodePath.join(raptorModulesUtil.getProjectRootDir(url), url);
    } else if (url.startsWith(REQUIRE_PREFIX)) {
        url = url.substring(REQUIRE_PREFIX.length).trim();

        var from;
        if (lassoContext.dependency) {
            from = lassoContext.dependency.getDir(lassoContext);
        } else {
            from = raptorModulesUtil.getProjectRootDir(url);
        }

        var query;
        var pos = url.indexOf('?');
        if (pos !== -1) {
            query = url.substring(pos + 1);
            url = url = url.substring(0, pos);
        }

        url = resolver.serverResolveRequire(url, from);

        if (query) {
            url += '?' + query;
        }
    }

    callback(null, url);
}

module.exports = function (lasso, pluginConfig) {

    var urlResolver = pluginConfig.urlResolver || defaultUrlResolver;

    lasso.addTransform({
        contentType: 'css',

        name: module.id,

        // true: The transform function will RECEIVE and RETURN a stream that can be used to read the transformed out
        // false: The transform function will RECEIVE full code and RETURN a value or promise
        stream: false,

        transform: function(code, lassoContext, callback) {
            var dependency = lassoContext.dependency;
            if (dependency && dependency.resolveCssUrlsEnabled === false) {
                return callback(null, code);
            }

            var lasso = lassoContext.lasso;
            cssParser.replaceUrls(
                code,

                // the replacer function
                function(url, start, end, callback) {
                    urlResolver(url, lassoContext, function(err, url) {
                        if (err || !url) {
                            return callback(err);
                        }

                        lasso.lassoResource(url, {lassoContext: lassoContext}, function(err, bundledResource) {
                            if (err) {
                                return callback(err);
                            }

                            callback(null, bundledResource && bundledResource.url);
                        });
                    });
                },

                // when everything is done
                function(err, code) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, code);
                });
        }
    });
};
