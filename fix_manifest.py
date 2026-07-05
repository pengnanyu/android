f = open(r'E:\APP\android\app\src\main\AndroidManifest.xml', 'r', encoding='utf-8')
content = f.read()
f.close()

old = '    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.INTERNET" />'
new = '    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n    <uses-permission android:name="android.permission.INTERNET" />'

content = content.replace(old, new)

# Add service declaration
old2 = '    </application>'
new2 = '        <service\n            android:name=".BleScanService"\n            android:foregroundServiceType="connectedDevice"\n            android:exported="false" />\n    </application>'

content = content.replace(old2, new2)

f = open(r'E:\APP\android\app\src\main\AndroidManifest.xml', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
