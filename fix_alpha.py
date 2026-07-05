f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

if 'import androidx.compose.ui.draw.alpha' not in content:
    content = content.replace(
        'import androidx.compose.ui.graphics.drawscope.Stroke',
        'import androidx.compose.ui.draw.alpha\nimport androidx.compose.ui.graphics.drawscope.Stroke'
    )
    f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('Added alpha import')
else:
    print('Already imported')
