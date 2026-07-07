# Fix remaining mojibake strings with corrected regex patterns
$bytes = [System.IO.File]::ReadAllBytes("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt")
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$content = $content -replace "`r`n", "`n"

# Fix remaining Text("[mojibake]", color = colors.fg3, fontSize = 14.sp) - add " before comma
$content = $content -replace 'Text\("[^"]*?", color = colors\.fg3, fontSize = 14\.sp\)', 'Text(stringResource(R.string.please_connect_ble), color = colors.fg3, fontSize = 14.sp)'

# Fix no_device_found: Text("[mojibake]?, color = colors.fg3, fontSize = 14.sp)
$content = $content -replace 'Text\("[^"]*?\?, color = colors\.fg3, fontSize = 14\.sp\)', 'Text(stringResource(R.string.no_device_found), color = colors.fg3, fontSize = 14.sp)'

# Fix start_scan: Text("[mojibake]?)
$content = $content -replace 'Text\("[^"]*?\?\)', 'Text(stringResource(R.string.start_scan))'

# Fix standalone string labels with ? issue (new_devices)
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if (-not ($line -match '[^\x00-\x7F]')) { continue }
    $trimmed = $line.Trim()
    if ($trimmed -match 'Copyright|stringResource|^//') { continue }

    $indent = ''
    if ($line -match '^(\s*)') { $indent = $matches[1] }

    # Standalone string with ? -> new_devices
    if ($trimmed -match '^"[^"]*\?,\s*$') {
        $lines[$i] = $indent + 'stringResource(R.string.new_devices),'
        continue
    }

    # Standalone string without ? -> determine by context
    if ($trimmed -match '^"[^"]*",\s*$') {
        # Check nearby lines for context
        $prev2 = if ($i -gt 1) { $lines[$i-2].Trim() } else { '' }
        $next = if ($i -lt $lines.Count-1) { $lines[$i+1].Trim() } else { '' }
        $next2 = if ($i -lt $lines.Count-2) { $lines[$i+2].Trim() } else { '' }
        $next3 = if ($i -lt $lines.Count-3) { $lines[$i+3].Trim() } else { '' }

        if ($next -match 'fontSize = 16') {
            $lines[$i] = $indent + 'stringResource(R.string.nearby_devices),'
        } elseif ($next -match 'color = if \(selectedTab == 1\)') {
            $lines[$i] = $indent + 'stringResource(R.string.console),'
        } elseif ($next3 -match 'top = 8') {
            $lines[$i] = $indent + 'stringResource(R.string.saved_devices),'
        } elseif ($next3 -match 'top = 12') {
            $lines[$i] = $indent + 'stringResource(R.string.new_devices),'
        } elseif ($next -match 'color = colors\.fg2,' -and $prev2 -match 'Text\(') {
            $lines[$i] = $indent + 'stringResource(R.string.scan),'
        } else {
            $lines[$i] = $indent + 'stringResource(R.string.scan),'
        }
        continue
    }
}

$result = $lines -join "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt", $result, $utf8NoBom)

# Verify
$verify = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt"))
$vlines = $verify -split "`n"
$nonAscii = @()
for ($i = 0; $i -lt $vlines.Count; $i++) {
    if ($vlines[$i] -match '[^\x00-\x7F]' -and $vlines[$i] -notmatch 'Copyright' -and $vlines[$i] -notmatch 'stringResource') {
        $nonAscii += "L$($i+1): $($vlines[$i].Trim())"
    }
}
Write-Output "Remaining non-ASCII: $($nonAscii.Count)"
$nonAscii | ForEach-Object { Write-Output $_ }
Write-Output ""
$sr = $vlines | Where-Object { $_ -match 'stringResource' }
Write-Output "stringResource calls: $($sr.Count)"
$sr | ForEach-Object { Write-Output $_.Trim() }
