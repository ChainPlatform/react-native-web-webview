import Qs from 'qs';
import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator, unstable_createElement as createElement } from 'react-native';

export class WebView extends Component {
    static defaultProps = {
        scrollEnabled: true,
    };

    state = { html: null };

    constructor(props) {
        super(props);
        this.handleSource(props.source, props.newWindow);
    }

    setRef = (ref) => (this.frameRef = ref);

    handleSource = (source, newWindow) => {
        if (!source.method) return;

        if (newWindow) {
            this.handleSourceInNewWindow(source, newWindow);
        } else {
            this.handleSourceInIFrame(source);
        }
    };

    handleSourceInIFrame = (source) => {
        const { uri, ...options } = source;
        const baseUrl = uri.substr(0, uri.lastIndexOf('/') + 1);
        fetch(uri, options)
            .then((response) => response.text())
            .then((html) => this.setState({ html: `<base href="${baseUrl}" />` + html }));
    };

    handleSourceInNewWindow = (source, newWindow) => {
        if (source.method === 'POST') {
            const contentType = source.headers['Content-Type'];
            let body = '';
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                body = Qs.parse(source.body);
            } else {
                console.warn(
                    '[WebView] When opening a new window, this content-type is not supported yet, please make a PR!',
                    contentType
                );
                return;
            }

            window.open(
                require('./postMock.html') +
                '?' +
                Qs.stringify({
                    uri: source.uri,
                    body: JSON.stringify(body),
                }),
                newWindow.name || 'webview',
                newWindow.features || undefined
            );
        } else {
            console.warn(
                '[WebView] When opening a new window, this method is not supported yet, please make a PR!',
                source.method
            );
        }
    };

    componentDidMount() {
        if (this.props.onMessage) {
            window.addEventListener('message', this.onMessage, true);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (
            this.props.source.uri !== nextProps.source.uri ||
            this.props.source.method !== nextProps.source.method ||
            this.props.source.body !== nextProps.source.body
        ) {
            this.handleSource(nextProps.source, nextProps.newWindow);
        }
    }

    componentWillUnmount() {
        if (this.props.onMessage) {
            window.removeEventListener('message', this.onMessage, true);
        }
    }

    onMessage = (nativeEvent) => this.props.onMessage({ nativeEvent });

    postMessage = (message, origin) => {
        this.frameRef.contentWindow.postMessage(message, origin);
    };

    handleInjectedJavaScript = (html) => {
        if (this.props.injectedJavaScript) {
            if (html) {
                return html.replace('</body>', `<script>${this.props.injectedJavaScript}</script></body>`);
            } else {
                return html;
            }
        } else {
            return html;
        }
    };

    render() {
        if (this.props.newWindow) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            );
        }

        const { title, source, onLoad, scrollEnabled } = this.props;
        const styleObj = StyleSheet.flatten(this.props.style);
        return createElement('iframe', {
            title,
            ref: this.setRef,
            src: !source.method ? source.uri : undefined,
            srcDoc: this.handleInjectedJavaScript(this.state.html || source.html),
            width: styleObj && styleObj.width,
            height: styleObj && styleObj.height,
            style: StyleSheet.flatten([styles.iframe, scrollEnabled && styles.noScroll, this.props.style]),
            allowFullScreen: true,
            allowpaymentrequest: 'true',
            frameBorder: '0',
            seamless: true,
            onLoad,
        });
    }
}

export default WebView;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iframe: {
        width: '100%',
        height: '100%',
        borderWidth: 0,
    },
    noScroll: {
        overflow: 'hidden',
    },
});
