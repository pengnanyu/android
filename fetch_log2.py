import urllib.request, json, zipfile, io

token = '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'
headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}

run_id = 28711594908
url3 = f'https://api.github.com/repos/pengnanyu/android/actions/runs/{run_id}/logs'
req3 = urllib.request.Request(url3, headers=headers)
resp3 = urllib.request.urlopen(req3)
log_data = resp3.read()

with zipfile.ZipFile(io.BytesIO(log_data)) as z:
    for name in z.namelist():
        if 'Build APK' in name:
            print(f'=== {name} ===')
            with z.open(name) as f:
                content = f.read().decode('utf-8', errors='replace')
                for line in content.split('\n'):
                    # Remove timestamp prefix
                    if 'Z ' in line:
                        line = line.split('Z ', 1)[-1]
                    if 'e: file:' in line or 'error:' in line.lower() or 'FAILED' in line or 'Unexpected' in line or '@Composable' in line:
                        print(line[:300])
