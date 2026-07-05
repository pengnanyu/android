f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Add context field to BleManager for starting service
old = """    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleConnection: BleConnection? = null
    private val scanHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private var scanCycleRunnable: Runnable? = null"""

new = """    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleConnection: BleConnection? = null
    private var appContext: Context? = null
    private val scanHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private var scanCycleRunnable: Runnable? = null"""

content = content.replace(old, new)

# Add context setter
old2 = """    fun rememberDevice(address: String) {"""
new2 = """    fun setContext(ctx: Context) { appContext = ctx.applicationContext }

    fun rememberDevice(address: String) {"""

content = content.replace(old2, new2)

# Start foreground service in startScan
old3 = """        devices.clear()
        scanning.value = true
        scanStatus.value = "Scanning..."
        val filter = ScanFilter.Builder()"""

new3 = """        devices.clear()
        scanning.value = true
        scanStatus.value = "Scanning..."
        appContext?.let {
            val intent = Intent(it, BleScanService::class.java)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                it.startForegroundService(intent)
            } else {
                it.startService(intent)
            }
        }
        val filter = ScanFilter.Builder()"""

content = content.replace(old3, new3)

# Stop foreground service in stopScan
old4 = """    fun stopScan() {
        scanning.value = false
        scanCycleRunnable?.let { scanHandler.removeCallbacks(it) }
        try { bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback) } catch (_: Exception) {}
    }"""

new4 = """    fun stopScan() {
        scanning.value = false
        scanCycleRunnable?.let { scanHandler.removeCallbacks(it) }
        try { bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback) } catch (_: Exception) {}
        appContext?.let {
            val intent = Intent(it, BleScanService::class.java)
            it.stopService(intent)
        }
    }"""

content = content.replace(old4, new4)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
