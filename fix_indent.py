import re

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# Fix: line 614-664 area
# Line 614: "        if (isWideScreen) {\n" -> OK
# Line 615: "        Row(\n" -> should be "            Row(\n" (12 spaces)
# Lines 615-663: wide screen content needs +8 spaces (4 more indent)
# Line 664: "        } else {\n" -> OK

# Find the lines to fix
new_lines = []
in_wide_screen = False
for i, line in enumerate(lines):
    lineno = i + 1
    if lineno == 614:
        in_wide_screen = True
        new_lines.append(line)
        continue
    if lineno == 664:
        in_wide_screen = False
        new_lines.append(line)
        continue
    if in_wide_screen:
        # Add 8 spaces of indent
        if line.strip():
            new_lines.append('        ' + line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.writelines(new_lines)
f.close()
print('DONE')
