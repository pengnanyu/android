f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# 1. Add scan cycle fields to BleManager
old_manager = """    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleConnection: BleConnection? = null"""

new_manager = """    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleConnection: BleConnection? = null
    private val scanHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private var scanCycleRunnable: Runnable? = null"""

content = content.replace(old_manager, new_manager)

# 2. Replace startScan with optimized version (filter + cycle)
old_scan = """        devices.clear()
        scanning.value = true
        scanStatus.value = "Scanning..."
        val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()
        try {
            scanner.startScan(null, settings, scanCallback)
        } catch (e: SecurityException) {
            scanStatus.value = "SecurityException: ${e.message}"
            scanning.value = false
        }
    }

    fun stopScan() {
        scanning.value = false
        bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
    }"""

new_scan = """        devices.clear()
        scanning.value = true
        scanStatus.value = "Scanning..."
        val filter = ScanFilter.Builder()
            .setDeviceName(NAME_PREFIX)
            .build()
        val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()
        startScanCycle(scanner, listOf(filter), settings)
    }

    private fun startScanCycle(
        scanner: android.bluetooth.le.BluetoothLeScanner,
        filters: List<ScanFilter>,
        settings: android.bluetooth.le.ScanSettings
    ) {
        try {
            scanner.startScan(filters, settings, scanCallback)
        } catch (e: SecurityException) {
            scanStatus.value = "SecurityException: ${e.message}"
            scanning.value = false
            return
        }
        scanCycleRunnable = object : Runnable {
            override fun run() {
                if (!scanning.value) return
                try { scanner.stopScan(scanCallback) } catch (_: Exception) {}
                scanCycleRunnable = object : Runnable {
                    override fun run() {
                        if (!scanning.value) return
                        try { scanner.startScan(filters, settings, scanCallback) } catch (_: Exception) {}
                        scanHandler.postDelayed(this, 3000)
                    }
                }
                scanHandler.postDelayed(scanCycleRunnable!!, 500)
            }
        }
        scanHandler.postDelayed(scanCycleRunnable!!, 3000)
    }

    fun stopScan() {
        scanning.value = false
        scanCycleRunnable?.let { scanHandler.removeCallbacks(it) }
        try { bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback) } catch (_: Exception) {}
    }"""

content = content.replace(old_scan, new_scan)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
