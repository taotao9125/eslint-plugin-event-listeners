/**
 * @fileoverview remind remove listener
 * @author SinLucifer
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/remove-device-event-listener');
var lint = require("eslint");
var RuleTester = lint.RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2018
    }
});

ruleTester.run("remove-event-listener", rule, {

    // good case
    valid: [
        // give me some code that won't trigger a warning
        `
        class C extends Component {
            componentDidMount() {
               // BackHandler.addEventListener('hardwareBackPress', this.sizeChange.bind(this));
            }
            componentWillUnmount() {
                global.eventObj.removeAllListeners('FUWU_ORDER_LIST_SCROLL');
            }
        }
        `.trim()
    ],

    // bad case
    invalid: [
        // {
        //     code: `
        //         class C extends Component {
        //             componentDidMount() {
        //                 BackHandler.addEventListener('hardwareBackPress', this.sizeChange.bind(this));
        //             }
        //             componentWillUnmount() {
        //                 global.eventObj.removeAllListeners('FUWU_ORDER_LIST_SCROLL');
        //                 BackHandler.addEventListener('hardwareBackPress', this.sizeChange.bind(this));
        //             }
        //         }
        //     `.trim(),
        //     errors: [{
        //         message: "Fill me in.",
        //         type: 'CallExpression'
        //     }]
        // }
    ]
});
