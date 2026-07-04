import urllib.request, json

token = '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'
headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}

run_id = 28711275356
url2 = f'https://api.github.com/repos/pengnanyu/android/actions/runs/{run_id}/jobs'
req2 = urllib.request.Request(url2, headers=headers)
resp2 = urllib.request.urlopen(req2)
jobs = json.loads(resp2.read())
job_id = jobs['jobs'][0]['id']

# Try run-level logs instead
url3 = f'https://api.github.com/repos/pengnanyu/android/actions/runs/{run_id}/logs'
req3 = urllib.request.Request(url3, headers=headers)
try:
    resp3 = urllib.request.urlopen(req3)
    redirect_url = resp3.url
    print(f'Redirect: {redirect_url[:80]}')
    log_data = resp3.read()
    with open(r'E:\APP\android\logs.zip', 'wb') as f:
        f.write(log_data)
    print(f'Downloaded {len(log_data)} bytes')
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} {e.reason}')
    # Try getting the redirect URL manually
    import http.client
    conn = http.client.HTTPSConnection('api.github.com')
    conn.request('GET', f'/repos/pengnanyu/android/actions/runs/{run_id}/logs', headers=headers)
    r = conn.getresponse()
    print(f'Status: {r.status}')
    if r.status == 302:
        loc = r.getheader('Location')
        print(f'Location: {loc[:80]}')
        # Download from redirect
        req4 = urllib.request.Request(loc)
        resp4 = urllib.request.urlopen(req4)
        log_data = resp4.read()
        with open(r'E:\APP\android\logs.zip', 'wb') as f:
            f.write(log_data)
        print(f'Downloaded {len(log_data)} bytes from redirect')
