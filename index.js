/* eslint-disable global-require */

'use strict';

const allRules = {
    'remove-device-event-listener': require('./lib/rules/remove-device-event-listener')
};

function configureAsError(rules) {
    const result = {};
    for (const key in rules) {
        if (!rules.hasOwnProperty(key)) {
            continue;
        }
        result['event-listener/' + key] = 2;
    }
    return result;
}

const allRulesConfig = configureAsError(allRules);

module.exports = {
    deprecatedRules: {},
    rules: allRules,
    configs: {
        recommended: {
            rules: allRulesConfig
        }
    },
};
