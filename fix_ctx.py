f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Find where bleManager is used in BmsApp and add setContext
# Look for the LaunchedEffect that sets up data received
old = '    LaunchedEffect(Unit) {'
new = '    LaunchedEffect(Unit) {\n        bleManager.setContext(LocalContext.current)'

# Only replace the first occurrence
idx = content.find(old)
if idx >= 0:
    content = content[:idx] + new + content[idx + len(old):]
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('DONE')
else:
    print('NOT FOUND')
