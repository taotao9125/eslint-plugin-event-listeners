/**
 * @fileoverview remind removeEventListener method
 * @author SinLucifer
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const AstHelper = require("../utils/AstHelper");

module.exports = {
    meta: {
        docs: {
            description: "remind removeEventListener for addEventListener in React-Native",
            category: "Best Practices",
            recommended: false
        },
        fixable: null,
        schema: [
            // fill in your schema
        ]
    },

    create: function (context) {
        let nodes = {}

        const addNodeToNodes = ({
            propertyName,
            methodName,
            node,
            callbackType,
            callbackMethodName,
        }) => {

            if(nodes[propertyName] === undefined) {
                nodes[propertyName] = {}
            } 

            nodes[propertyName] = Object.assign({}, nodes[propertyName], {
                [callbackType]: {
                    node,
                    methodName,
                    callbackMethodName
                }
            })
        }

        const forgetMethodTable = {
            addEventListener: 'removeEventListener',
            removeEventListener: 'addEventListener'
        }

        return {
            CallExpression(node) {
                if (AstHelper.isSystemListenerMethod("addEventListener", node) 
                        || AstHelper.isSystemListenerMethod("removeEventListener", node)) {
                    // Anonymous method as callback
                    if (!AstHelper.isListenerClassMethod(node)) {
                        context.report(
                            node,
                            `Use a anonymous fuction in ${AstHelper.getServiceMethodName(node)}`
                        )
                    }
                }

                if (AstHelper.isSystemListenerMethod("addEventListener", node)) {
                    // Save all register listener node
                    addNodeToNodes({
                        propertyName: AstHelper.getServicePropertyName(node),
                        methodName: AstHelper.getServiceMethodName(node),
                        callbackType: AstHelper.getEventTypeName(node),
                        callbackMethodName: AstHelper.getListenerCallbackName(node),
                        node,
                    })
                }

                if (AstHelper.isSystemListenerMethod("removeEventListener", node)) {
                    let serviceName = AstHelper.getServicePropertyName(node);
                    let serviceClass = nodes[serviceName];
                    let eventType = AstHelper.getEventTypeName(node);

                    if (serviceClass && serviceClass[eventType]) {
                        let addCallbackName = serviceClass[eventType].callbackMethodName;
                        let removeCallBackame = AstHelper.getListenerCallbackName(node);
                        if (addCallbackName !== removeCallBackame) {
                            context.report(
                                node,
                                `Removing different method in same EventType "${eventType}" then used in "${serviceName}.addEventListener".
            In addEventListener is "${addCallbackName? addCallbackName: " (Maybe an Anonymous function)"}"
            In removeEventListener is ${removeCallBackame}"
                        `
                            )
                        } 
                        
                        delete nodes[serviceName][eventType];
                        return;
                    }

                    // Develper call removeListener ,but did not call addListener
                    addNodeToNodes({
                        propertyName: AstHelper.getServicePropertyName(node),
                        methodName: AstHelper.getServiceMethodName(node),
                        callbackMethodName: AstHelper.getListenerCallbackName(node),
                        callbackType: AstHelper.getEventTypeName(node),
                        node,
                    })
                }

            },
            'Program:exit'() {
                // Print all forget register/unregister listener
                Object.entries(nodes).forEach(entries => {
                    Object.keys(entries[1]).forEach(eventType => {
                        const {
                            node,
                            methodName,
                        } = entries[1][eventType]
                        context.report(
                            node,
                            `Do not forget to call ${entries[0]}.${forgetMethodTable[methodName]} with EventType "${eventType}"`
                        )
                    })
                })
            }
        };
    }
};