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
            description: "remind removeListener or call listener.remove() for addListener in React-Native",
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
        let removeMethodCallerName = [];

        const addNodeToNodes = ({
            propertyName,
            methodName,
            node,
            callbackType,
            callbackMethodName,
            assignVariableName
        }) => {

            if(nodes[propertyName] === undefined) {
                nodes[propertyName] = {}
            } 

            nodes[propertyName] = Object.assign({}, nodes[propertyName], {
                [callbackType]: {
                    node,
                    methodName,
                    callbackMethodName,
                    assignVariableName
                }
            })
        }

        const forgetMethodTable = {
            addListener: 'removeListener',
            removeListener: 'addListener'
        }

        return {
            CallExpression(node) {
                if (AstHelper.isSystemListenerMethod('addListener' ,node) 
                    || AstHelper.isSystemListenerMethod('removeListener', node)) {
                    
                    // Anonymous method as callback
                    if (!AstHelper.isListenerClassMethod(node)) {
                        // Developer did not save the cancelable object
                        if(!AstHelper.getAssignVariable(node)){
                            context.report(
                                node,
                                `Use a anonymous fuction in ${AstHelper.getServiceMethodName(node)} and did not assign cancelable object to class member`
                            )
                        }
                    }
                }

                if (AstHelper.isSystemListenerMethod('addListener' ,node)) {
                    let assignVariableName = AstHelper.getAssignVariable(node);

                    // Save all register listener node
                    addNodeToNodes({
                        propertyName: AstHelper.getServicePropertyName(node),
                        methodName: AstHelper.getServiceMethodName(node),
                        callbackType: AstHelper.getEventTypeName(node),
                        callbackMethodName: AstHelper.getListenerCallbackName(node),
                        node,
                        assignVariableName
                    })
                }

                if (AstHelper.isSystemListenerMethod('removeListener' ,node)) {

                    let serviceName = AstHelper.getServicePropertyName(node);
                    let serviceClass = nodes[serviceName];
                    let eventType = AstHelper.getEventTypeName(node);

                    if (serviceClass && serviceClass[eventType]) {
                        const addCallbackName = serviceClass[eventType].callbackMethodName;
                        let removeCallBackName = AstHelper.getListenerCallbackName(node);
                        if (addCallbackName !== removeCallBackName) {
                            context.report(
                                node,
                                `Removing different method in same EventType "${eventType}" then used in "${serviceName}.addListener".
            In addListener is "${addCallbackName? addCallbackName: " (Maybe an Anonymous function)"}"
            In removeListener is ${removeCallBackName}"
                        `
                            )
                        } 
                        
                        delete serviceClass[eventType];
                        return;
                    }

                    // Develper call removeListener, but did not call addListener
                    addNodeToNodes({
                        propertyName: AstHelper.getServicePropertyName(node),
                        methodName: AstHelper.getServiceMethodName(node),
                        callbackMethodName: AstHelper.getListenerCallbackName(node),
                        callbackType: AstHelper.getEventTypeName(node),
                        node,
                    });
                }

                if(AstHelper.isListenerMethod("remove", node)) {
                    // Develper save and call cancelable object for addListener, record the caller`s name
                    let callerName = AstHelper.getServicePropertyName(node);
                    callerName && removeMethodCallerName.push(callerName);
                }
            },
            'Program:exit'() {
                // Develper properly call cancelable.remove()
                removeMethodCallerName.forEach( callerName =>{
                    Object.entries(nodes).forEach(entries => {
                        let callerTypeObj = entries[1];
                        for(let eventType in callerTypeObj) {
                            const {
                                assignVariableName
                            } = entries[1][eventType]
                            if(callerName === assignVariableName) {
                                delete entries[1][eventType];
                                break;
                            }
                        } 
                    })
                });

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