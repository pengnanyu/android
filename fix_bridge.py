f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix pushToUi: when handler not ready, retry after delay
old = '''fun pushToUi(webView: MutableState<WebView?>, type: String, payloadJson: String) {
    val wv = webView.value ?: return
    Log.d("BMS_UI", "pushToUi: type=$type payload=${payloadJson.take(100)}")
    LogCollector.log("UI", "push $type ${payloadJson.take(60)}")
    val js = "if(window.__APP_BRIDGE__&&window.__APP_BRIDGE__._handler){window.__APP_BRIDGE__._handler({type:'" + type + "',payload:" + payloadJson + "})}else{console.log('BRIDGE:_handler_not_ready')}"
    wv.post {
        wv.evaluateJavascript(js, object : android.webkit.ValueCallback<String> {
            override fun onReceiveValue(result: String?) {
                if (result == null || result == "null") {
                    LogCollector.log("UI", "push $type -> handler not ready")
                }
            }
        })
    }
}'''

new = '''fun pushToUi(webView: MutableState<WebView?>, type: String, payloadJson: String) {
    val wv = webView.value ?: return
    Log.d("BMS_UI", "pushToUi: type=$type payload=${payloadJson.take(100)}")
    LogCollector.log("UI", "push $type ${payloadJson.take(60)}")
    val js = "if(window.__APP_BRIDGE__&&window.__APP_BRIDGE__._handler){window.__APP_BRIDGE__._handler({type:'" + type + "',payload:" + payloadJson + "});'ok'}else{'retry'}"
    wv.post {
        wv.evaluateJavascript(js, object : android.webkit.ValueCallback<String> {
            override fun onReceiveValue(result: String?) {
                if (result == "retry") {
                    LogCollector.log("UI", "push $type -> retry in 500ms")
                    wv.postDelayed({
                        wv.evaluateJavascript(js, object : android.webkit.ValueCallback<String> {
                            override fun onReceiveValue(result2: String?) {
                                if (result2 == "retry") {
                                    LogCollector.log("UI", "push $type -> handler still not ready")
                                }
                            }
                        })
                    }, 500)
                }
            }
        })
    }
}'''

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED pushToUi')
else:
    print('pushToUi NOT FOUND')
