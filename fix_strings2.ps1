# Replace non-ASCII strings using regex pattern matching on ASCII context
$bytes = [System.IO.File]::ReadAllBytes("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt")
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$content = $content -replace "`r`n", "`n"

# Replace patterns - match ASCII context, replace with stringResource calls
# Pattern: Text("[non-ascii]", color = colors.fg3, fontSize = 14.sp)
$content = $content -replace 'Text\("[^"]*?, color = colors\.fg3, fontSize = 14\.sp\)', 'Text(stringResource(R.string.please_connect_ble), color = colors.fg3, fontSize = 14.sp)'

# Pattern: Text("[non-ascii]?)
$content = $content -replace 'Text\("[^"]*?\?\)', 'Text(stringResource(R.string.start_scan))'

# Pattern: Text("[non-ascii]?, color = colors.fg3
$content = $content -replace 'Text\("[^"]*?\?, color = colors\.fg3, fontSize = 14\.sp\)', 'Text(stringResource(R.string.no_device_found), color = colors.fg3, fontSize = 14.sp)'

# Pattern: contentDescription = if (sidebarVisible) "[non-ascii]" else "[non-ascii]",
$content = $content -replace 'contentDescription = if \(sidebarVisible\) "[^"]*" else "[^"]*",', 'contentDescription = if (sidebarVisible) stringResource(R.string.hide_sidebar) else stringResource(R.string.show_sidebar),'

# Pattern: if (bleManager.connected.value) "[non-ascii]" else "[non-ascii]",
$content = $content -replace 'if \(bleManager\.connected\.value\) "[^"]*" else "[^"]*",', 'if (bleManager.connected.value) stringResource(R.string.connected) else stringResource(R.string.bluetooth),'

# Pattern: contentDescription = "[non-ascii]",
$content = $content -replace 'contentDescription = "[^"]*",', 'contentDescription = stringResource(R.string.scan),'

# Pattern: if (isSave) "[non-ascii]" else "[non-ascii]",
$content = $content -replace 'if \(isSave\) "[^"]*" else "[^"]*",', 'if (isSave) stringResource(R.string.save_memory) else stringResource(R.string.cancel_memory),'

# Now handle standalone string labels on their own lines
# These are lines like:    "[non-ascii]",
# Need to determine which string resource based on context

$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if (-not ($line -match '[^\x00-\x7F]')) { continue }

    $trimmed = $line.Trim()

    # Skip copyright comments
    if ($trimmed -match 'Copyright') { continue }
    # Skip already-replaced lines
    if ($trimmed -match 'stringResource') { continue }
    # Skip comments (already fixed)
    if ($trimmed.StartsWith('//')) { continue }

    # Match standalone string: "[non-ascii]",
    if ($trimmed -match '^"[^"]*"?[,\)]?\s*$') {
        $indent = ''
        if ($line -match '^(\s*)') { $indent = $matches[1] }

        # Determine which string based on context
        $prev = if ($i -gt 0) { $lines[$i-1].Trim() } else { '' }
        $next = if ($i -lt $lines.Count-1) { $lines[$i+1].Trim() } else { '' }

        if ($next -match 'fontSize = 16') {
            # nearby_devices
            $lines[$i] = $indent + 'stringResource(R.string.nearby_devices),'
        } elseif ($next -match 'color = colors\.fg2' -and $next -notmatch 'selectedTab') {
            # scan label (second occurrence, after Text()
            $lines[$i] = $indent + 'stringResource(R.string.scan),'
        } elseif ($next -match 'color = if \(selectedTab == 1\)') {
            # console
            $lines[$i] = $indent + 'stringResource(R.string.console),'
        } elseif ($next -match 'fontSize = 12.*Medium' -and $prev -match 'top = 8') {
            # saved_devices
            $lines[$i] = $indent + 'stringResource(R.string.saved_devices),'
        } elseif ($next -match 'fontSize = 12.*Medium' -and $prev -match 'top = 12') {
            # new_devices
            $lines[$i] = $indent + 'stringResource(R.string.new_devices),'
        } elseif ($trimmed -match '\?') {
            # has ? issue
            $lines[$i] = $indent + 'stringResource(R.string.new_devices),'
        } else {
            # default to scan
            $lines[$i] = $indent + 'stringResource(R.string.scan),'
        }
    }
}

$result = $lines -join "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt", $result, $utf8NoBom)

# Verify
$verify = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt"))
$vlines = $verify -split "`n"
$nonAscii = 0
foreach ($l in $vlines) {
    if ($l -match '[^\x00-\x7F]' -and $l -notmatch 'Copyright' -and $l -notmatch 'stringResource') { $nonAscii++ }
}
Write-Output "Remaining non-ASCII lines (excl copyright/stringResource): $nonAscii"
$sr = ($vlines | Where-Object { $_ -match 'stringResource' }).Count
Write-Output "stringResource calls: $sr"
