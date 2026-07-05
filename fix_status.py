f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# The status bar and navigation bar colors are already set in the theme
# But the issue might be that the Scaffold/Material3 is overriding them
# Let me also make sure the Scaffold uses the correct colors

# Also fix: the connected name bar background should match
# Currently: colors.bg.copy(alpha = 0.85f) - this might look wrong
# Change to use surface color for better contrast

old = '.background(colors.bg.copy(alpha = 0.85f))'
new = '.background(colors.surface)'

content = content.replace(old, new)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
