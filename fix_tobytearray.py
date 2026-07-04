import os
path = os.path.join(r'E:\\APP\\android', 'app/src/main/java/com/dcsf/bms/MainActivity.kt')
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
old1 = "val frame = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                        .toByteArray()
                    bleManager.send(frame)"
new1 = "val nums = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                    val frame = ByteArray(nums.size) { nums[it].toByte() }
                    bleManager.send(frame)"
old2 = "val frame = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                            .toByteArray()
                        bleManager.send(frame)"
new2 = "val nums = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                        val frame = ByteArray(nums.size) { nums[it].toByte() }
                        bleManager.send(frame)"
n1 = c.count(old1)
n2 = c.count(old2)
c = c.replace(old1, new1).replace(old2, new2)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print(f'Fixed {n1}+{n2} occurrences')
