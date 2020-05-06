/* eslint-disable global-require */

'use strict';

module.exports = {
    deprecatedRules: {},
    rules: {
        'event-listener': require('./lib/rules/event-listener.js'),
    },
    configs: {
        recommended: {
            rules: {
                'event-listeners/event-listener': 2
            },
            globals: {
                'Ext': false,
                'QView': false,
                'QComponent': false
            },
        }
    },
};
