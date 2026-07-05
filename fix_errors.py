f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix 1: Add Intent import
if 'import android.content.Intent' not in content:
    content = content.replace('import android.content.Context', 'import android.content.Context\nimport android.content.Intent')

# Fix 2: LocalContext.current in LaunchedEffect - this is fine, LaunchedEffect IS composable context
# But the error says line 573 - let me check what's there
# The issue might be that setContext is called inside LaunchedEffect which IS composable
# But the error says it's not... maybe the LaunchedEffect placement is wrong

# Let me check: the setContext was added as:
# LaunchedEffect(Unit) {
#     bleManager.setContext(LocalContext.current)
# But LocalContext.current must be called in composable scope, not inside LaunchedEffect block
# Fix: capture context before LaunchedEffect

# Actually, LocalContext.current CAN be used inside LaunchedEffect since it's a composable function
# The error might be about something else. Let me look at line 573

# The error at line 573 might be about the DebugLogPanel or something else
# Let me just fix the Intent import first and see

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE - added Intent import')
