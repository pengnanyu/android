f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix wide screen: add key to AndroidView
old = """                    Box(modifier = Modifier.fillMaxSize()) {
                        AndroidView(
                            factory = createWebView,
                            modifier = Modifier.fillMaxSize(),
                        )"""

new = """                    Box(modifier = Modifier.fillMaxSize()) {
                        AndroidView(
                            factory = createWebView,
                            modifier = Modifier.fillMaxSize(),
                            key = bleManager.connected.value,
                        )"""

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED wide screen key')
else:
    print('NOT FOUND')
