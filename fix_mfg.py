f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix 1: Change mfgId from 0xFF0A to 0x7030
content = content.replace('mfgId == 0xFF0A', 'mfgId == 0x7030')

# Fix 2: Remove protocol offset - data starts directly with soc
# Current: off = i + 4, soc = bytes[off + 2]
# Should be: off = i + 4, soc = bytes[off]
old_parse = '''                if (mfgId == 0x7030) {
                val dataLen = len - 3
                if (dataLen >= 7) {
                    val off = i + 4
                    val soc = bytes[off + 2].toInt() and 0xFF
                    val voltage = ((bytes[off + 4].toInt() and 0xFF) shl 8) or (bytes[off + 3].toInt() and 0xFF)
                    val current = ((bytes[off + 6].toInt() and 0xFF) shl 8) or (bytes[off + 5].toInt() and 0xFF)
                    val safety = if (dataLen >= 9) ((bytes[off + 8].toInt() and 0xFF) shl 8) or (bytes[off + 7].toInt() and 0xFF) else 0
                    return intArrayOf(soc, voltage, current, safety)'''

new_parse = '''                if (mfgId == 0x7030) {
                val dataLen = len - 3
                if (dataLen >= 5) {
                    val off = i + 4
                    val soc = bytes[off].toInt() and 0xFF
                    val voltage = ((bytes[off + 2].toInt() and 0xFF) shl 8) or (bytes[off + 1].toInt() and 0xFF)
                    val current = if (dataLen >= 7) ((bytes[off + 4].toInt() and 0xFF) shl 8) or (bytes[off + 3].toInt() and 0xFF) else 0
                    val safety = if (dataLen >= 9) ((bytes[off + 6].toInt() and 0xFF) shl 8) or (bytes[off + 5].toInt() and 0xFF) else 0
                    LogCollector.log("BLE", "Parsed: soc=%d V=%d I=%d safety=%d".format(soc, voltage, current, safety))
                    return intArrayOf(soc, voltage, current, safety)'''

content = content.replace(old_parse, new_parse)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
