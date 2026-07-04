import urllib.request, json, sys, subprocess

# Get fresh token from git credential manager
result = subprocess.run(
    [r'C:\Users\nanyu\AppData\Local\GitHubDesktop\app-3.6.2\resources\app\git\cmd\git.exe', 'credential', 'fill'],
    input=b'protocol=https\nhost=github.com\n',
    capture_output=True
)
lines = result.stdout.decode().strip().split('\n')
token = None
for line in lines:
    if line.startswith('password='):
        token = line.split('=', 1)[1].strip()
        break

if not token:
    print("Failed to get token")
    sys.exit(1)

print(f"Got token: {token[:8]}...")

headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json'}
repo = 'pengnanyu/android'

# Get latest run
req = urllib.request.Request(f'https://api.github.com/repos/{repo}/actions/runs?per_page=3', headers=headers)
data = json.loads(urllib.request.urlopen(req).read())

for run in data['workflow_runs']:
    rid = run['id']
    status = run['status']
    conclusion = run.get('conclusion', 'in_progress')
    msg = run['head_commit']['message'][:60]
    print(f"Run {rid} | {status} | {conclusion} | {msg}")

# Find latest completed run (success or failure)
target_run = None
for run in data['workflow_runs']:
    if run['status'] == 'completed':
        target_run = run
        break

if not target_run:
    # Try the latest one regardless
    target_run = data['workflow_runs'][0]

run_id = target_run['id']
print(f"\nFetching logs for run {run_id} (conclusion: {target_run.get('conclusion')})...")

# Get jobs
req = urllib.request.Request(f'https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs', headers=headers)
jobs_data = json.loads(urllib.request.urlopen(req).read())

for job in jobs_data['jobs']:
    job_id = job['id']
    print(f"\nJob: {job['name']} | {job.get('conclusion', 'in_progress')}")
    
    try:
        log_req = urllib.request.Request(f'https://api.github.com/repos/{repo}/actions/jobs/{job_id}/logs', headers=headers)
        log_resp = urllib.request.urlopen(log_req)
        log_text = log_resp.read().decode('utf-8', errors='replace')
        
        lines = log_text.split('\n')
        print(f"Total log lines: {len(lines)}")
        
        error_lines = []
        for i, line in enumerate(lines):
            low = line.lower()
            if any(kw in low for kw in ['e: file', 'error:', 'unresolved', 'type mismatch', 'no value passed', 'too many arguments', 'cannot access', 'compilation error', 'expecting', 'incompatible']):
                start = max(0, i - 3)
                end = min(len(lines), i + 5)
                for j in range(start, end):
                    error_lines.append(f"{j+1}: {lines[j]}")
                error_lines.append('---')
        
        if error_lines:
            print(f"\n=== ERRORS FOUND ({len(error_lines)} context lines) ===")
            for el in error_lines[:300]:
                print(el)
        else:
            print("\nNo specific errors found. Last 80 lines:")
            for line in lines[-80:]:
                print(line)
    except Exception as e:
        print(f"Failed to fetch logs: {e}")
