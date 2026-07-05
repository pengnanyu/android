f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

old = """        val filter = ScanFilter.Builder()
            .setDeviceName(NAME_PREFIX)
            .build()
        val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_BALANCED)
            .build()
        try {
            scanner.startScan(listOf(filter), settings, scanCallback)"""

new = """        val filter = ScanFilter.Builder()
            .setServiceUuid(java.util.UUID.fromString(SERVICE_UUID))
            .build()
        val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()
        try {
            scanner.startScan(listOf(filter), settings, scanCallback)"""

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED scan filter')
else:
    print('NOT FOUND')
