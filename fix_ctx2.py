f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

old = '    LaunchedEffect(Unit) {\n        bleManager.setContext(LocalContext.current)'
new = '    val ctx = LocalContext.current\n    LaunchedEffect(Unit) {\n        bleManager.setContext(ctx)'

content = content.replace(old, new)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
