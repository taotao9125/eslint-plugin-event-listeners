
module.exports = {
    /**
     * Return the name of the function of the CallExpression`s node
     * exp: Dimensions.addListener(), return 'addListener'
     * @param {} node 
     */
    getServiceMethodName(node) {
        return node.callee.property && node.callee.property.name;
    },
    
    /**
     * Return the caller name of the function of the CallExpression`s node
     * this method only return the direct caller`s name
     * exp: Dimensions.addListener(), return 'Dimensions'
     * @param {*} node 
     */
    getServicePropertyName(node) {
        if(node.type === 'CallExpression') {
            let callee = node.callee;
        
            // 只考虑直接节点
            if(callee.object) {
                let callerType = callee.object.type;
                if(callerType === 'MemberExpression') {
                    return callee.object.property.name;
                }

                if(callerType === 'Identifier'){
                    return callee.object.name;
                }
            }
        }
    },

    isCallInGlobalScope(context, node) {
        let ancestors = context.getAncestors(node);
        for(let i = 0; i < ancestors.length; i++) {
            if(ancestors[i].type === 'ClassDeclaration') {
                return false;
            }
        }
        return true;
    },
    
    /**
     * return the second argument of ServiceMethod
     * @param {*} node 
     * @return {*} node
     */
    getSecondArgumentOfServiceMethod(node) {
        return node.arguments[1]
    },
    
    /**
     * return the first argument of ServiceMethod
     * @param {*} node 
     * @return {*} node
     */
    getFirstArgumentOfServiceMethod(node) {
        return node.arguments[0]
    },
    
    /**
     * all the system event listener has 2 arguments
     * example: Dimensions.addEventListener('change', () => {})
     * @param {node} node 
     */
    isNotUserDefinedListener(node) {
        return node.arguments.length === 2;
    },
    /**
     * judge the listener is a class method or not
     * (maybe it is a 'bind' method)
     * @param {*} node 
     */
    isListenerClassMethod(node) {
        let arg = this.getSecondArgumentOfServiceMethod(node);
        if (arg) {
            let callbackType =  arg.type;
            if (callbackType  === 'MemberExpression') {
                return true;
            }
        }
    },
    
    /**
     * Return the listener`s name
     * @param {*} node 
     */
    getListenerCallbackName(node) {
        let arg = this.getSecondArgumentOfServiceMethod(node);
        if (arg && this.isListenerClassMethod(node)) {
            let callbackType =  arg.type;
            if (callbackType  === 'MemberExpression') {
                return arg.property.name;
            } 
        }
    },
    
    /**
     * Register method all like xxxx.addListener('onchange', this.cancelable);
     * 'onchange' is the event type
     * @param {*} node 
     */
    getEventTypeName(node) {
        let arg1 = this.getFirstArgumentOfServiceMethod(node);
        // type is a string
        if (arg1.type === "Literal") {
            return arg1.value;
        }
    
        // type is a 
        if (arg1.type === "Identifier") {
            return arg1.name;
        }
    
        if(arg1.type === "MemberExpression") {
            if(arg1.property) {
                return arg1.property.name;
            }                
        }
    },

    /**
     * Verify a node is a listener method with input method`s name, also it must not defined by user
     * @param {string} method name
     * @param {node} node 
     */
    isSystemListenerMethod(method , node) {
        return (this.getServiceMethodName(node) === method) && this.isNotUserDefinedListener(node);
    },

    /**
     * Verify a node is a listener method with input method`s name
     * @param {string} method name
     * @param {node} node 
     */
    isListenerMethod(method , node) {
        return (this.getServiceMethodName(node) === method)
    },

    /**
     * Register method return a cancelable object, get if develpoer save it
     * @param {*} node 
     */
    getAssignVariable(node) {
        let parent = node.parent;
        
        if (parent && parent.type === 'AssignmentExpression') {
            // the cancelable object has been assigned to a class variable
            if(parent.left && parent.left.type === 'MemberExpression') {
                return parent.left.property.name;
            }
        } else if (parent && parent.type === 'VariableDeclarator') {
            // the cancelable object hase been assigned to a function variable
            if(parent.id && parent.id.type === 'Identifier') {
                return parent.id.name;
            }
        }
    }
}
