import re

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

old_text = '''                            Text("\u8bf7\u5148\u8fde\u63a5\u84dd\u7259\u8bbe\u5907", color = colors.fg3, fontSize = 14.sp)
                }
            }
        }
        DebugLogPanel(colors = colors)
    }
}
        }
    } else {'''

new_text = '''                            Text("\u8bf7\u5148\u8fde\u63a5\u84dd\u7259\u8bbe\u5907", color = colors.fg3, fontSize = 14.sp)
                        }
                    }
                }
            }
        } else {'''

if old_text in content:
    content = content.replace(old_text, new_text)
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED')
else:
    print('NOT FOUND')
    lines = content.split('\n')
    for i in range(655, 670):
        print(f'{i+1}: |{lines[i]}|')