f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Replace when(selectedTab) with both pages always composed, visibility controlled
old = """            ) { padding ->
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
                    1 -> Column(modifier = Modifier.fillMaxSize().padding(if (showBottomBar) padding else PaddingValues())) {"""

new = """            ) { padding ->
                Box(modifier = Modifier.fillMaxSize()) {
                    BluetoothPage(
                        bleManager = bleManager,
                        colors = colors,
                        onRequestPermissions = onRequestPermissions,
                        onConnectDevice = onConnectDevice,
                        onDisconnect = onDisconnect,
                        onConnectedClick = { selectedTab = 1 },
                        modifier = Modifier.padding(padding).then(if (selectedTab == 0) Modifier else Modifier),
                    )
                    if (selectedTab == 1) {
                        Column(modifier = Modifier.fillMaxSize().padding(if (showBottomBar) padding else PaddingValues())) {"""

content = content.replace(old, new)

# Also need to close the Box - find the closing of when
# The when block ends with the closing of Column for tab 1
# Need to add } for Box after the Column closing
# Find the pattern after UiPage call in tab 1
old2 = """                    )
                }
            }
        }"""

# This is tricky - there might be multiple matches. Let me be more specific
# The closing should be after UiPage in tab 1
# Let me search for the exact pattern

import re
# Find the section after UiPage in the narrow screen tab 1
pattern = r'(pushToUi = \{ type, payload -> pushToUi\(webView, type, payload\) \},\s*\))'
matches = list(re.finditer(pattern, content))
print(f'Found {len(matches)} matches for UiPage closing')

# The second match should be in the narrow screen layout
if len(matches) >= 2:
    m = matches[1]
    # Find the closing braces after this
    after = content[m.end():m.end()+100]
    print(f'After UiPage: {repr(after[:80])}')

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE - partial fix, need to verify')
