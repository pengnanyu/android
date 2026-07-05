f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# Remove extra } at line 342 (0-indexed 341)
if lines[341].strip() == '}' and lines[342].strip() == '}':
    lines.pop(341)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.writelines(lines)
    f.close()
    print('FIXED')
else:
    print('Line 342: ' + lines[341].rstrip())
    print('Line 343: ' + lines[342].rstrip())
