f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# Fix else branch: lines 665-789 need proper indent
# Line 664: "        } else {\n" -> OK
# Lines 665-789: else branch content - find the closing of else
# The else branch closes where we have the closing of Box

# Find where else branch ends - it should be at "        }" before DebugLogPanel
new_lines = []
in_else = False
for i, line in enumerate(lines):
    lineno = i + 1
    if lineno == 664:
        in_else = True
        new_lines.append(line)
        continue
    if in_else:
        stripped = line.rstrip()
        # Check if this is the end of else branch
        # It should end with "        }" (8 spaces + }) before DebugLogPanel
        if stripped == '        }' and i + 1 < len(lines):
            next_stripped = lines[i + 1].strip()
            if 'DebugLogPanel' in next_stripped:
                in_else = False
                new_lines.append(line)
                continue
        # Add proper indent for else branch content
        if line.strip():
            # Current content has 8 spaces, needs 12 (4 more)
            new_lines.append('    ' + line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.writelines(new_lines)
f.close()
print('DONE')
