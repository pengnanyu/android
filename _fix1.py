import pathlib

f = pathlib.Path(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt')
t = f.read_text(encoding='utf-8')

old = '"bms:request-status" -> {\n                                val status = if (bleManager.connected.value) "connected" else "disconnected"\n                                pushToUi(webView, "bms:connection-status", """{"status":"$status"}""")\n                            }'

new = '"bms:request-status", "bms:ui-ready" -> {\n                                val status = if (bleManager.connected.value) "connected" else "disconnected"\n                                LogCollector.log("JS", "ui-ready/request-status -> push $status")\n                                pushToUi(webView, "bms:connection-status", """{"status":"$status"}""")\n                            }'

if old in t:
    t = t.replace(old, new)
    f.write_text(t, encoding='utf-8')
    print('OK')
else:
    print('NOT FOUND')
    # debug: show surrounding lines
    for i, line in enumerate(t.split('\n')):
        if 'bms:request-status' in line:
            print(f'Line {i+1}: {line}')