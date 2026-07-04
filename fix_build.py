import os

base = r'E:\APP\android'
path = os.path.join(base, 'app/src/main/java/com/dcsf/bms/MainActivity.kt')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = """val frame = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                        .toByteArray()"""

new = """val nums = json.trim('[', ']').split(',').mapNotNull { it.trim().toIntOrNull() }
                        val frame = ByteArray(nums.size) { nums[it].toByte() }"""

count = content.count(old)
content = content.replace(old, new)
print(f'Fixed {count} occurrences of toByteArray ambiguity')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
