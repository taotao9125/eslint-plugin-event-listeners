# Do not forget to remove listener or you will cause memory leak(remove listener)

When we use addListener/addEventListener in React-Native to monitor some events, we need to remove the listeners when the component is destroyed

## Rule Details

This rule enforces developer remove listener when the component is destroyed. For example:

```js
/*eslint-env es6*/

sizeChange = (param) => {
    // do something
}

// Bad
componentDidMount() {
    Dimensions.addEventListener('change', this.sizeChange);
}

// Good
componentDidMount() {
    Dimensions.addEventListener('change', this.sizeChange);
}

componentWillUnmount() {
    Dimensions.removeEventListener('change', this.sizeChange);
}

// Or
componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.sizeChange);
}

componentWillUnmount() {
    this.backHandler.remove();
}
```

In some cases, developer defines listeners as anonymous arrow function and do not save cancelable object, this will cause memory leak because we can not unregister a anoymous function. (We didn`t event hold the listener).For example: 


```js
/*eslint-env es6*/

// Bad
componentDidMount() {
    Dimensions.addEventListener('change', (param) => {
        // do something
    });
    
    // Or (Actually we still use anonymous function)
    Dimensions.addEventListener('change', (param) => this.sizeChange(param));
}
```

To bind `this`, developer probably will call `this.sizeChange.bind(this)` as a argument that past to addEventListener and removeEventListener, that is not a good idea because `bind()` will return a new function object which is different between two function:

```js
/*eslint-env es6*/

// Bad
componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.sizeChange.bind(this));
}

componentWillUnmount() {
    BackHandler.addEventListener('hardwareBackPress', this.sizeChange.bind(this));
}

// Good
componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.sizeChange);
}

componentWillUnmount() {
    BackHandler.addEventListener('hardwareBackPress', this.sizeChange);
}

// We can bind `this` as using arrow function in function defined
sizeChange = (param) => {
    // do something
}
```

Some services class can call `removeAllListener` function to avoid memory leak, such as `Keyboard` For example:

```js
/*eslint-env es6*/

// Good
componentDidMount() {
    Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
}

componentWillUnmount() {
    Keyboard.removeAllListeners('keyboardDidShow');
}

_keyboardDidShow () {
    // do something
}
```

## Further Reading

 [reactnative.dev](https://reactnative.dev/docs/keyboard).