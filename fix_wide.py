f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix wide screen WebView - same pattern: always keep WebView, overlay placeholder when not connected
old = """                ) {
                    if (bleManager.connected.value) {
                        AndroidView(
                            factory = createWebView,
                            modifier = Modifier.fillMaxSize(),
                        )
                    } else {
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
                }"""

new = """                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
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

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED wide screen WebView')
else:
    print('Wide screen NOT FOUND')
