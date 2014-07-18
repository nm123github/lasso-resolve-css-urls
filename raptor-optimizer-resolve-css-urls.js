var cssParser = require('raptor-css-parser');

module.exports = {
    contentType: 'css',
    
    name: module.id,

    // true: The transform function will RECEIVE and RETURN a stream that can be used to read the transformed out
    // false: The transform function will RECEIVE full code and RETURN a value or promise
    stream: false,

    transform: function(code, contentType, optimizerContext) {
        if (contentType === 'css') {

            var optimizer = optimizerContext.optimizer;

            // NOTE: output could be either the String code or a promise, but we don't care
            //       replaceUrls returns a promise
            return cssParser.replaceUrls(code,

                // the replacer function
                function(url, start, end, callback) {
                    optimizer.optimizeResource(url, optimizerContext, function(err, optimizedResource) {
                        if (err) {
                            // TODO: Log error?
                        }
                        callback(null, optimizedResource && optimizedResource.url);
                    });
                });
        }
        else {
            return code;
        }
    }
};