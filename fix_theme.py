f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Add onPageStarted to inject theme before page renders
old = """            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    Log.d("BMS_UI", "Page finished: $url")
                    LogCollector.log("UI", "Page loaded: ${url?.take(40)}")
                    super.onPageFinished(view, url)
                    view?.evaluateJavascript("localStorage.setItem('bms-theme','$themeStr')", null)"""

new = """            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    view?.evaluateJavascript("localStorage.setItem('bms-theme','$themeStr')", null)
                }
                override fun onPageFinished(view: WebView?, url: String?) {
                    Log.d("BMS_UI", "Page finished: $url")
                    LogCollector.log("UI", "Page loaded: ${url?.take(40)}")
                    super.onPageFinished(view, url)"""

content = content.replace(old, new)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
