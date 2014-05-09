var cssParser = require('raptor-css-parser');

module.exports = {
    contentType: 'css',
    
    name: module.id,

    stream: false,

    transform: function(code, contentType, context) {
        if (contentType === 'css') {

            var optimizer = context.optimizer;

            var output = cssParser.replaceUrls(code, function(url) {
                return optimizer.optimizeResource(url, context)
                    .then(function(optimizedResource) {
                        return optimizedResource.url;
                    });
            });

            // NOTE: output could be either the String code or a promise, but we don't care
            return output;
        }
        else {
            return code;
        }
    }
};