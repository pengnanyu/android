# Fix mojibake by exact line numbers - most reliable approach
$bytes = [System.IO.File]::ReadAllBytes("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt")
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$content = $content -replace "`r`n", "`n"
$lines = $content -split "`n"

# Build replacement map: original_line_number -> new_content
# These are line numbers from the ORIGINAL file (before adding import)
$replacements = @{
    334 = '    // Format 1: 9+ bytes (old format, first 2 bytes are prefix)'
    343 = '    // Format 2: 7 bytes (new format, no prefix)'
    427 = '                // Method 1: Use getManufacturerSpecificData API (API 21+, more reliable)'
    445 = '                // Method 2: If API method fails, try raw byte parsing'
    959 = '                    Text(stringResource(R.string.please_connect_ble), color = colors.fg3, fontSize = 14.sp)'
    1022 = '                        contentDescription = if (sidebarVisible) stringResource(R.string.hide_sidebar) else stringResource(R.string.show_sidebar),'
    1050 = '                            if (bleManager.connected.value) stringResource(R.string.connected) else stringResource(R.string.bluetooth),'
    1068 = '                        contentDescription = stringResource(R.string.scan),'
    1076 = '                            stringResource(R.string.scan),'
    1094 = '                            stringResource(R.string.console),'
    1147 = '                stringResource(R.string.nearby_devices),'
    1174 = '                    Text(stringResource(R.string.no_device_found), color = colors.fg3, fontSize = 14.sp)'
    1185 = '                        Text(stringResource(R.string.start_scan))'
    1208 = '                        stringResource(R.string.saved_devices),'
    1235 = '                            stringResource(R.string.new_devices),'
    1307 = '            if (isSave) stringResource(R.string.save_memory) else stringResource(R.string.cancel_memory),'
    1551 = '                    Text(stringResource(R.string.please_connect_ble), color = colors.fg3, fontSize = 14.sp)'
}

# Add import after line 66 (import androidx.compose.ui.viewinterop.AndroidView)
$importLine = 'import androidx.compose.ui.res.stringResource'
$importInserted = $false

# Build new lines array
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1  # 1-indexed

    # Check if this line needs replacement
    if ($replacements.ContainsKey($lineNum)) {
        $newLines += $replacements[$lineNum]
    } else {
        $newLines += $lines[$i]
    }

    # Add import after the AndroidView import line
    if (-not $importInserted -and $lines[$i] -match 'import androidx\.compose\.ui\.viewinterop\.AndroidView') {
        $newLines += $importLine
        $importInserted = $true
    }
}

$result = $newLines -join "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText("e:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt", $result, $utf8NoBom)
Write-Output "Done. Import inserted: $importInserted"
