f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# Fix lines 789-790
# 789 should be "            }" (12 spaces) - closes Scaffold
# 790 should be "        }" (8 spaces) - closes else branch
lines[788] = '            }\n'
lines[789] = '        }\n'

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.writelines(lines)
f.close()
print('DONE')
