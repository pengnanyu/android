f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix BluetoothPage visibility - hide when on tab 1
old = """                    BluetoothPage(
                        bleManager = bleManager,
                        colors = colors,
                        onRequestPermissions = onRequestPermissions,
                        onConnectDevice = onConnectDevice,
                        onDisconnect = onDisconnect,
                        onConnectedClick = { selectedTab = 1 },
                        modifier = Modifier.padding(padding).then(if (selectedTab == 0) Modifier else Modifier),
                    )"""

new = """                    BluetoothPage(
                        bleManager = bleManager,
                        colors = colors,
                        onRequestPermissions = onRequestPermissions,
                        onConnectDevice = onConnectDevice,
                        onDisconnect = onDisconnect,
                        onConnectedClick = { selectedTab = 1 },
                        modifier = Modifier
                            .padding(padding)
                            .then(if (selectedTab == 0) Modifier.fillMaxSize() else Modifier.fillMaxSize().alpha(0f)),
                    )"""

content = content.replace(old, new)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
