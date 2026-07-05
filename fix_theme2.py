f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Change loadUrl to include theme parameter
old = 'loadUrl("https://ui.bms.pub")'
new = 'loadUrl("https://ui.bms.pub/?theme=$themeStr")'

content = content.replace(old, new)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
