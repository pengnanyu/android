@echo off
cd /d e:\APP\android
call gradlew.bat assembleDebug --console=plain --stacktrace > build_result.txt 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> build_result.txt
