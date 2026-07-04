f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# Replace lines 613-793 (0-indexed: 612-792) with correct layout
new_layout = '''    Box(modifier = Modifier.fillMaxSize()) {
        if (isWideScreen) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .background(colors.bg)
            ) {
                Box(
                    modifier = Modifier
                        .width(360.dp)
                        .fillMaxHeight()
                ) {
                    BluetoothPage(
                        bleManager = bleManager,
                        colors = colors,
                        onRequestPermissions = onRequestPermissions,
                        onConnectDevice = onConnectDevice,
                        onDisconnect = onDisconnect,
                        onConnectedClick = { selectedTab = 1 },
                        modifier = Modifier.fillMaxSize(),
                    )
                }
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .fillMaxHeight()
                        .background(colors.border)
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
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
                }
            }
        } else {
            val showBottomBar = !(bleManager.connected.value && selectedTab == 1)
            Scaffold(
                containerColor = colors.bg,
                bottomBar = {
                    if (showBottomBar) {
                        NavigationBar(
                            containerColor = colors.navBg,
                            tonalElevation = 2.dp,
                        ) {
                            NavigationBarItem(
                                selected = selectedTab == 0,
                                onClick = { selectedTab = 0 },
                                icon = {
                                    Icon(
                                        if (bleManager.connected.value) Icons.Default.BluetoothConnected
                                        else Icons.Default.Bluetooth,
                                        contentDescription = null,
                                        tint = if (selectedTab == 0) colors.primary else colors.fg2
                                    )
                                },
                                label = {
                                    Text(
                                        if (bleManager.connected.value) "\u5df2\u8fde\u63a5" else "\u84dd\u7259",
                                        color = if (selectedTab == 0) colors.primary else colors.fg2,
                                        fontSize = 12.sp
                                    )
                                },
                            )
                            NavigationBarItem(
                                selected = false,
                                onClick = { },
                                icon = {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .background(colors.primary, RoundedCornerShape(20.dp)),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        Icon(
                                            Icons.Default.QrCodeScanner,
                                            contentDescription = "\u626b\u7801",
                                            tint = colors.primaryFg,
                                            modifier = Modifier.size(22.dp),
                                        )
                                    }
                                },
                                label = {
                                    Text(
                                        "\u626b\u7801",
                                        color = colors.fg2,
                                        fontSize = 12.sp
                                    )
                                },
                            )
                            NavigationBarItem(
                                selected = selectedTab == 1,
                                onClick = { if (bleManager.connected.value) selectedTab = 1 },
                                icon = {
                                    Icon(
                                        Icons.Default.BluetoothDisabled,
                                        contentDescription = null,
                                        tint = if (selectedTab == 1) colors.primary else colors.fg2
                                    )
                                },
                                label = {
                                    Text(
                                        "\u63a7\u5236\u53f0",
                                        color = if (selectedTab == 1) colors.primary else colors.fg2,
                                        fontSize = 12.sp
                                    )
                                },
                            )
                        }
                    }
                }
            ) { padding ->
                when (selectedTab) {
                    0 -> BluetoothPage(
                        bleManager = bleManager,
                        colors = colors,
                        onRequestPermissions = onRequestPermissions,
                        onConnectDevice = onConnectDevice,
                        onDisconnect = onDisconnect,
                        onConnectedClick = { selectedTab = 1 },
                        modifier = Modifier.padding(padding),
                    )
                    1 -> Column(modifier = Modifier.fillMaxSize().padding(if (showBottomBar) padding else PaddingValues())) {
                        if (!showBottomBar) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(40.dp)
                                    .background(colors.bg.copy(alpha = 0.85f))
                                    .clickable { selectedTab = 0 }
                                    .padding(horizontal = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Icon(
                                    Icons.Default.BluetoothConnected,
                                    contentDescription = null,
                                    tint = colors.primary,
                                    modifier = Modifier.size(16.dp),
                                )
                                Spacer(Modifier.width(6.dp))
                                Text(
                                    bleManager.connectedDevice.value?.name ?: "BMS",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = colors.fg,
                                )
                            }
                        }
                        UiPage(
                            bleManager = bleManager,
                            colors = colors,
                            webView = webView,
                            darkTheme = darkTheme,
                            modifier = Modifier.fillMaxSize().weight(1f),
                            createWebView = createWebView,
                            pushToUi = { type, payload -> pushToUi(webView, type, payload) },
                        )
                    }
                }
            }
        }
        DebugLogPanel(colors = colors)
    }
}
'''

# Replace lines 612 to 792 (0-indexed)
new_lines = lines[:612] + [new_layout] + lines[793:]

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.writelines(new_lines)
f.close()
print('DONE')
