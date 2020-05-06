/**
 * @fileoverview remind remove listener
 * @author SinLucifer
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/remove-event-listener"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("remove-event-listener", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "please remove your listener",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
