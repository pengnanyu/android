f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Add more detailed logging in postMessage handler
old = """                    } catch (_: Exception) {}"""
new = """                    } catch (e: Exception) {
                        LogCollector.log("JS", "postMessage error: ${e.message}")
                    }"""

content = content.replace(old, new)

# Also add logging for sendFrame
old2 = """                fun sendFrame(json: String) {
                    val nums = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                    val frame = ByteArray(nums.size) { nums[it].toByte() }
                    bleManager.send(frame)"""

new2 = """                fun sendFrame(json: String) {
                    LogCollector.log("JS", "sendFrame: ${json.take(40)}")
                    val nums = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                    val frame = ByteArray(nums.size) { nums[it].toByte() }
                    bleManager.send(frame)"""

content = content.replace(old2, new2)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
