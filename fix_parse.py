f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

old = '''fun parseAdData(bytes: ByteArray): IntArray? {
    var i = 0
    while (i < bytes.size - 3) {
        val len = bytes[i].toInt() and 0xFF
        if (len == 0 || i + len >= bytes.size) break
        val type = bytes[i + 1].toInt() and 0xFF
        if (type == 0xFF && len >= 12) {
            val mfgId = ((bytes[i + 3].toInt() and 0xFF) shl 8) or (bytes[i + 2].toInt() and 0xFF)
            if (mfgId == 0xFF0A) {
                val off = i + 4
                val soc = bytes[off + 2].toInt() and 0xFF
                val voltage = ((bytes[off + 4].toInt() and 0xFF) shl 8) or (bytes[off + 3].toInt() and 0xFF)
                val current = ((bytes[off + 6].toInt() and 0xFF) shl 8) or (bytes[off + 5].toInt() and 0xFF)
                val safety = ((bytes[off + 8].toInt() and 0xFF) shl 8) or (bytes[off + 7].toInt() and 0xFF)
                return intArrayOf(soc, voltage, current, safety)
            }
        }
        i += len + 1
    }
    return null
}'''

new = '''fun parseAdData(bytes: ByteArray): IntArray? {
    val hex = bytes.joinToString("") { "%02x".format(it) }
    LogCollector.log("BLE", "Adv raw: $hex")
    var i = 0
    while (i < bytes.size - 3) {
        val len = bytes[i].toInt() and 0xFF
        if (len == 0 || i + len >= bytes.size) break
        val type = bytes[i + 1].toInt() and 0xFF
        if (type == 0xFF) {
            val mfgId = ((bytes[i + 3].toInt() and 0xFF) shl 8) or (bytes[i + 2].toInt() and 0xFF)
            LogCollector.log("BLE", "0xFF mfg=%04x len=%d".format(mfgId, len))
            if (mfgId == 0xFF0A) {
                val dataLen = len - 3
                if (dataLen >= 7) {
                    val off = i + 4
                    val soc = bytes[off + 2].toInt() and 0xFF
                    val voltage = ((bytes[off + 4].toInt() and 0xFF) shl 8) or (bytes[off + 3].toInt() and 0xFF)
                    val current = ((bytes[off + 6].toInt() and 0xFF) shl 8) or (bytes[off + 5].toInt() and 0xFF)
                    val safety = if (dataLen >= 9) ((bytes[off + 8].toInt() and 0xFF) shl 8) or (bytes[off + 7].toInt() and 0xFF) else 0
                    return intArrayOf(soc, voltage, current, safety)
                }
            }
        }
        i += len + 1
    }
    return null
}'''

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED parseAdData')
else:
    print('NOT FOUND')
