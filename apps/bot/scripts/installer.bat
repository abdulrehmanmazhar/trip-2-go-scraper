@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Versioned FiggoBot install — payload under versions\<semver>\; current\ tracks active version

for %%I in ("%~dp0.") do set "_SCRIPT=%%~fI"
for %%I in ("%_SCRIPT%\..") do set "SOURCE_ROOT=%%~fI"

set "MODE=auto"
:parse
if "%~1"=="" goto :parse_done
if /i "%~1"=="/user" set "MODE=user" & shift & goto :parse
if /i "%~1"=="--user" set "MODE=user" & shift & goto :parse
if /i "%~1"=="/system" set "MODE=system" & shift & goto :parse
if /i "%~1"=="--system" set "MODE=system" & shift & goto :parse
if /i "%~1"=="/?" goto :usage
if /i "%~1"=="-h" goto :usage
if /i "%~1"=="--help" goto :usage
echo Unknown option: %~1
goto :usage

:parse_done
if defined FIGGO_BOT_PREFIX (
    set "DEST=!FIGGO_BOT_PREFIX!"
) else if "!MODE!"=="system" (
    set "DEST=%ProgramFiles%\FiggoBot"
) else (
    set "DEST=%LOCALAPPDATA%\FiggoBot"
)

if "!DEST:~-1!"=="\" set "DEST=!DEST:~0,-1!"

if not exist "%SOURCE_ROOT%\package.json" (
    echo installer: expected package.json under "%SOURCE_ROOT%" 1>&2
    exit /b 1
)
if not exist "%SOURCE_ROOT%\dist\index.js" (
    echo installer: missing dist\index.js - run npm run dist first. 1>&2
    exit /b 1
)

for /f "usebackq delims=" %%v in (`powershell -NoProfile -Command "(Get-Content -Raw '%SOURCE_ROOT%\package.json' | ConvertFrom-Json).version"`) do set "PKG_VERSION=%%v"
if not defined PKG_VERSION set "PKG_VERSION=0.0.0"

set "VERSION_DIR=!DEST!\versions\!PKG_VERSION!"
echo Installing Figgo Bot !PKG_VERSION! to "!DEST!" ...

mkdir "!DEST!\current" 2>nul
mkdir "!DEST!\versions" 2>nul
mkdir "!DEST!\shared\logs" 2>nul
mkdir "!DEST!\shared\cache" 2>nul
mkdir "!DEST!\shared\sessions" 2>nul
mkdir "!DEST!\shared\temp\updates" 2>nul
mkdir "!DEST!\shared\temp\staging" 2>nul
mkdir "!VERSION_DIR!" 2>nul

rem Version payload (immutable install unit; includes scripts + updater)
for %%D in (dist node_modules runtime workflows package.json tsconfig.json scripts updater) do (
    if exist "%SOURCE_ROOT%\%%D" (
        robocopy "%SOURCE_ROOT%\%%D" "!VERSION_DIR!\%%D" /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NJH /NJS >nul
    )
)

echo !PKG_VERSION!> "!DEST!\current\version.txt"

rem Optional junction current\app
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Test-Path '!DEST!\current\app') { Remove-Item '!DEST!\current\app' -Recurse -Force -ErrorAction SilentlyContinue }; cmd /c mklink /J \"!DEST!\current\app\" \"!VERSION_DIR!\"" >nul 2>&1

set "SCRIPTS_DIR=!DEST!\current\app\scripts"
if /i "!MODE!"=="system" (set "PATH_SCOPE=Machine") else (set "PATH_SCOPE=User")

echo Adding "!SCRIPTS_DIR!" to !PATH_SCOPE! PATH ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$scripts = $env:SCRIPTS_DIR; $scope = $env:PATH_SCOPE; $cur = [Environment]::GetEnvironmentVariable('Path', $scope); if (-not $cur) { $cur = '' }; $parts = $cur -split ';' | Where-Object { $_ }; if ($parts -notcontains $scripts) { [Environment]::SetEnvironmentVariable('Path', ($cur.TrimEnd(';') + ';' + $scripts), $scope) }"

echo Done. Active version: !PKG_VERSION!
echo Open a new terminal: figgo-bot --help
exit /b 0

:usage
echo Usage: scripts\installer.bat [/user^|/system]
exit /b 1
