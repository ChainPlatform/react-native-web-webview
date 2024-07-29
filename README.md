# @chainplatform/react-native-web-webview

React Native Web WebView implementation of RN's WebView, this package fork from https://www.npmjs.com/package/react-native-web-webview adn fix deprecated function.

## Getting started

`npm install @chainplatform/react-native-web-webview --save`
or
`yarn add @chainplatform/react-native-web-webview`

Alias the package in your webpack config:

```js
resolve: {
    alias: {
        'react-native$': 'react-native-web',
        'react-native-webview': '@chainplatform/react-native-web-webview',
        ... others alias
    }
}
```

Install File Loader:
```
yarn add --dev file-loader
```

Add the following rule to your webpack config:

```js
module.exports = {
  ... others line
  module: {
        rules: [
          ... others line
          {
            test: /postMocks.html$/,
            use: {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
              },
            }
          }
        ]
  }
  ... others line
}
```

## Usage

```js
import { WebView } from 'react-native-webview';
```

See [RN's doc](https://github.com/react-native-community/react-native-webview).

Supported props are:

- `source`
- `onMessage`
- `scrollEnabled`
- `injectedJavaScript`
- `style`

Additional, web-specific props are:

- `newWindow`: (_boolean_|_{ name: string, features: string}_)
  This will open the source in a new window, optionally giving it an [internal name and custom features](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).
  By default, the name is `webview` and there are no features set.
  This is useful when your target has X-Frame-Options or a no-CORS policy.
  It currently only supports a `source` prop with a `method` set to `POST`.
  Please feel free to do a PR to support more request types!
- `title`: (_string_) This prop will set the `webview` title.

## Contributing

PRs are welcome!
