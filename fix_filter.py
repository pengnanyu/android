f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

old = """        val filter = ScanFilter.Builder()
            .setServiceUuid(android.os.ParcelUuid.fromString(SERVICE_UUID))
            .build()"""

new = """        val filter = ScanFilter.Builder()
            .setManufacturerData(0x7030, byteArrayOf())
            .build()"""

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED')
else:
    print('NOT FOUND')
