f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix 1: Update manufacturer ID comment back to 0xFF0A
content = content.replace('mfgId == 0x7030', 'mfgId == 0xFF0A')

# Wait, the actual Company ID in BLE data is 0x7030 (bytes 30 70 little-endian)
# But user says 厂商ID = 0xFF0A. So the BLE Company ID field IS 0xFF0A?
# Let me check: bytes are 30 70 = 0x7030 in little-endian
# But user says 厂商ID = 0xFF0A...
# This is confusing. The actual bytes in the data are 30 70.
# In BLE standard, Company ID is little-endian, so 30 70 = 0x7030
# But user insists it's 0xFF0A...
# Maybe the bytes are actually 0a ff (little-endian = 0xFF0A)?
# But from the raw hex: 0a ff 30 70...
# 0a = length, ff = type, then 30 70 = Company ID
# Unless... the structure is different from standard BLE

# Actually, let me just match on the actual bytes. The code currently
# checks mfgId which reads bytes[i+2] and bytes[i+3] as little-endian.
# From the data: bytes after 0xFF are 30 70, so mfgId = 0x7030
# But user says 厂商ID = 0xFF0A

# I think the user means the BLE Company ID should be 0xFF0A
# and the protocol field (0x7030) comes after it.
# So maybe the data structure is:
# 0a ff 0a ff 30 70 17 82 09 00 00 00 00 00
# Wait, that doesn't match the raw hex either.

# Let me just keep 0x7030 for matching since that's what works with the actual data
# and fix the scan filter instead

# Fix 2: Update scan filter to use 128-bit UUID
old = """        val filter = ScanFilter.Builder()
            .setManufacturerData(0x7030, byteArrayOf())
            .build()
        val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()"""

new = """        val filter = ScanFilter.Builder()
            .setServiceUuid(android.os.ParcelUuid.fromString(SERVICE_UUID))
            .build()
        val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()"""

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED scan filter')
else:
    print('Scan filter NOT FOUND')
    # Check current content
    import re
    m = re.search(r'ScanFilter.*?\.build\(\)', content, re.DOTALL)
    if m:
        print('Current filter:', m.group()[:200])
