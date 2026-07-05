f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix UiPage: use key=connected to rebuild on disconnect, but keep alive during tab switches
old = """fun UiPage(
    bleManager: BleManager,
    colors: AppColors,
    webView: MutableState<WebView?>,
    darkTheme: Boolean = false,
    modifier: Modifier = Modifier,
    createWebView: (android.content.Context) -> WebView,
    pushToUi: (String, String) -> Unit,
) {
    Box(modifier = modifier) {
        AndroidView(
            factory = createWebView,
            modifier = Modifier.fillMaxSize(),
        )
        if (!bleManager.connected.value) {
            Box(
                modifier = Modifier.fillMaxSize().background(colors.bg),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.BluetoothDisabled, contentDescription = null, modifier = Modifier.size(48.dp), tint = colors.fg3)
                    Spacer(Modifier.height(8.dp))
                    Text("\u8bf7\u5148\u8fde\u63a5\u84dd\u7259\u8bbe\u5907", color = colors.fg3, fontSize = 14.sp)
                }
            }
        }
    }
}"""

new = """fun UiPage(
    bleManager: BleManager,
    colors: AppColors,
    webView: MutableState<WebView?>,
    darkTheme: Boolean = false,
    modifier: Modifier = Modifier,
    createWebView: (android.content.Context) -> WebView,
    pushToUi: (String, String) -> Unit,
) {
    val connectedKey = bleManager.connected.value
    Box(modifier = modifier) {
        AndroidView(
            factory = createWebView,
            modifier = Modifier.fillMaxSize(),
            key = connectedKey,
        )
        if (!bleManager.connected.value) {
            Box(
                modifier = Modifier.fillMaxSize().background(colors.bg),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.BluetoothDisabled, contentDescription = null, modifier = Modifier.size(48.dp), tint = colors.fg3)
                    Spacer(Modifier.height(8.dp))
                    Text("\u8bf7\u5148\u8fde\u63a5\u84dd\u7259\u8bbe\u5907", color = colors.fg3, fontSize = 14.sp)
                }
            }
        }
    }
}"""

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED UiPage with key')
else:
    print('UiPage NOT FOUND')
