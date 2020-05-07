/**
 * @fileoverview remind removeEventListener method
 * @author SinLucifer
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "remind removeEventListener",
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
            // nodes = Object.assign({}, nodes, {
            //     [propertyName]: {
            //         node,
            //         methodName,
            //         callbackMethodName,
            //         callbackType
            //     },
            // })

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
            removeEventListener: 'addEventListener',
        }

        const getObjectPropertyName = node => {
            if (node.callee.object && node.callee.object.object && node.callee.object.object.property) {
                return node.callee.object.object.property.name;
            }
        }

        const getServiceMethodName = node => {
            return node.callee.property && node.callee.property.name;
        }

        const getServicePropertyName = node => {
            return node.callee.object.name
        }

        const getSecondArgumentOfServiceMethod = node => {
            return node.arguments[1]
        }

        const getFirstArgumentOfServiceMethod = node => {
            return node.arguments[0]
        }

        const isAddEventListener = node => {
            return getServiceMethodName(node) === 'addEventListener'
        }

        const isRemoveEventListener = node => {
            return getServiceMethodName(node) === 'removeEventListener'
        }

        const isClassMethod = node => {
            if (getSecondArgumentOfServiceMethod(node)) {
                return getSecondArgumentOfServiceMethod(node).type === 'MemberExpression'
            }
        }

        const getClassMethodName = node => {
            if (getSecondArgumentOfServiceMethod(node) && isClassMethod(node)) {
                return getSecondArgumentOfServiceMethod(node).property.name
            }
        }

        const getEventTypeName = node => {
            // type is a string
            if (getFirstArgumentOfServiceMethod(node).type === "Literal") {
                return getFirstArgumentOfServiceMethod(node).value;
            }

            // type is a 
            if (getFirstArgumentOfServiceMethod(node).type === "Identifier") {
                return getFirstArgumentOfServiceMethod(node).name;
            }

            if(getFirstArgumentOfServiceMethod(node).type === "MemberExpression") {
                let n = getFirstArgumentOfServiceMethod(node);
                if(n.property) {
                    return n.property.name;
                }                
            }
        }

        return {
            CallExpression(node) {
                if (isAddEventListener(node) || isRemoveEventListener(node)) {
                    if (!isClassMethod(node)) {
                        context.report(
                            node,
                            `Use a anonymous fuction in ${getServiceMethodName(node)}`
                        )
                    }
                }

                if (isAddEventListener(node)) {
                    addNodeToNodes({
                        propertyName: getServicePropertyName(node),
                        methodName: getServiceMethodName(node),
                        callbackType: getEventTypeName(node),
                        callbackMethodName: getClassMethodName(node),
                        node,
                    })
                }

                if (isRemoveEventListener(node)) {
                    let serviceClass = nodes[getServicePropertyName(node)]
                    if (serviceClass && serviceClass[getEventTypeName(node)]) {
                        const callbackMethodName = serviceClass[getEventTypeName(node)].callbackMethodName;

                        if (callbackMethodName !== getClassMethodName(node)) {
                            context.report(
                                node,
                                `Removing different method in same EventType "${getEventTypeName(node)}" then used in "${getServicePropertyName(node)}.addEventListener".
            In addEventListener is "${callbackMethodName? callbackMethodName: callbackMethodName + " (Maybe an Anonymous function)"}"
            In removeEventListener is ${getClassMethodName(node)}"
                        `
                            )
                        } 
                        
                        delete (nodes[getServicePropertyName(node)])[getEventTypeName(node)];
                        return;
                    }

                    addNodeToNodes({
                        propertyName: getServicePropertyName(node),
                        methodName: getServiceMethodName(node),
                        callbackMethodName: getClassMethodName(node),
                        callbackType: getEventTypeName(node),
                        node,
                    })
                }

            },
            'Program:exit'() {
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