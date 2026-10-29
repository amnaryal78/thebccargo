@echo off
rem Instant project backup. Copies the source tree to ..\production_project_backups\<timestamp>
rem Skips heavy/rebuildable folders (node_modules, dist, .git) and zips. Keeps the newest 10 backups.
setlocal EnableExtensions
cd /d "%~dp0"

for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"`) do set "STAMP=%%T"
set "DEST=%~dp0..\production_project_backups\%STAMP%"

echo Backing up to: "%DEST%"
robocopy "%~dp0." "%DEST%" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP ^
  /XD node_modules dist .git .vercel production_project_backups ^
  /XF *.zip
rem robocopy exit codes 0-7 are success
if %ERRORLEVEL% GEQ 8 (
  echo BACKUP FAILED with robocopy code %ERRORLEVEL%
  exit /b 1
)

rem Retention: keep newest 10
powershell -NoProfile -Command "Get-ChildItem -Directory '%~dp0..\production_project_backups' | Sort-Object Name -Descending | Select-Object -Skip 10 | Remove-Item -Recurse -Force"

echo BACKUP OK: "%DEST%"
exit /b 0
