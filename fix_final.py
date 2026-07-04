f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# The issue: inside Box { if (isWideScreen) { ... } else { ... } }
# The if-else must be a single expression inside the Box content lambda
# Line 614: "        if (isWideScreen) {"  (8 spaces)
# The content inside if block should be at 12 spaces
# The else should be at 8 spaces: "        } else {"
# The content inside else block should be at 12 spaces

# Find the if line and else line
if_line = None
else_line = None
for i, line in enumerate(lines):
    if 'if (isWideScreen) {' in line and 'Box' not in line:
        if_line = i
    if line.strip() == '} else {' and if_line is not None and else_line is None:
        else_line = i
        break

print(f'if at line {if_line+1}, else at line {else_line+1}')

# Fix if block: lines from if_line+1 to else_line-1
# These should be indented at 12 spaces (currently some are at 16)
for i in range(if_line + 1, else_line):
    line = lines[i]
    stripped = line.lstrip()
    if stripped:
        # Count current leading spaces
        current_indent = len(line) - len(stripped)
        # Target indent for if block content is 12
        # But we need to preserve relative indentation
        # The first non-blank line should be at 12 spaces
        # Let's check what the first content line's indent is
        break

first_content_indent = len(lines[if_line + 1]) - len(lines[if_line + 1].lstrip())
print(f'First content indent: {first_content_indent} (should be 12)')

# Calculate the offset to add/remove
offset = 12 - first_content_indent
print(f'Offset: {offset}')

# Apply offset to all lines in if block
for i in range(if_line + 1, else_line):
    line = lines[i]
    stripped = line.lstrip()
    if stripped:
        current_indent = len(line) - len(stripped)
        new_indent = current_indent + offset
        lines[i] = ' ' * new_indent + stripped

# Now fix else block: from else_line+1 to the line before DebugLogPanel
# Find where else block ends
else_end = None
for i in range(else_line + 1, len(lines)):
    if 'DebugLogPanel' in lines[i]:
        else_end = i - 1
        break

print(f'else block ends at line {else_end+1}')

# Fix else block content: should be at 12 spaces
# Check first line of else block
first_else_indent = len(lines[else_line + 1]) - len(lines[else_line + 1].lstrip())
print(f'First else content indent: {first_else_indent} (should be 12)')

else_offset = 12 - first_else_indent
print(f'Else offset: {else_offset}')

for i in range(else_line + 1, else_end + 1):
    line = lines[i]
    stripped = line.lstrip()
    if stripped:
        current_indent = len(line) - len(stripped)
        new_indent = current_indent + else_offset
        lines[i] = ' ' * new_indent + stripped

# Also fix the closing braces
# else_end should be "        }" (8 spaces) closing else
# else_end-1 might need adjustment too
lines[else_end] = '        }\n'

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.writelines(lines)
f.close()
print('DONE')
