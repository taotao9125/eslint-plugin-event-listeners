# eslint-plugin-event-listeners

Check react-native memory leak by remind developer to remove any addEventListener in React-Native

**This project is fork from [eslint-plugin-change-listeners](https://www.npmjs.com/package/eslint-plugin-change-listeners) and modify some code**

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-event-listener`:

```
$ npm install eslint-plugin-event-listener --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-event-listener` globally.

## Usage

Add `plugin:event-listeners/recommended` to the extends section of your `.eslintrc` configuration file.

Add `event-listener` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "extends": ["plugin:event-listeners/recommended"]
    "plugins": [
        "event-listener"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "event-listener/event-listener": 2
    }
}
```

## Thanks
[eslint-plugin-change-listeners](https://www.npmjs.com/package/eslint-plugin-change-listeners)





