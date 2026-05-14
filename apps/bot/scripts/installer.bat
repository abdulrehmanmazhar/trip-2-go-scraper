@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Copies the bot tree to a fixed location and adds <install>\scripts to PATH (User or Machine).
rem Run from repo or extracted bundle:   scripts\installer.bat
rem Options:   /user   (default)  -> %LOCALAPPDATA%\FiggoBot
rem              /system          -> %ProgramFiles%\FiggoBot  (run as Administrator)
rem Override:   set FIGGO_BOT_PREFIX=C:\Custom\FiggoBot

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

rem Strip trailing backslash
if "!DEST:~-1!"=="\" set "DEST=!DEST:~0,-1!"

if not exist "%SOURCE_ROOT%\package.json" (
    echo installer: expected package.json under "%SOURCE_ROOT%" 1>&2
    exit /b 1
)
if not exist "%SOURCE_ROOT%\dist\index.js" (
    echo installer: missing dist\index.js - run npm run dist in the bot folder before installing. 1>&2
    exit /b 1
)

echo Copying "%SOURCE_ROOT%" to "!DEST!" ...
if not exist "!DEST!" mkdir "!DEST!"
robocopy "%SOURCE_ROOT%" "!DEST!" /E /COPY:DAT /R:2 /W:2 /NFL /NDL /NJH /NJS >nul
set "RC=!ERRORLEVEL!"
if !RC! GEQ 8 (
    echo installer: robocopy failed with code !RC! 1>&2
    exit /b 1
)

set "SCRIPTS_DIR=!DEST!\scripts"
if /i "!MODE!"=="system" (
    set "PATH_SCOPE=Machine"
) else (
    set "PATH_SCOPE=User"
)

echo Adding "!SCRIPTS_DIR!" to !PATH_SCOPE! PATH (new consoles will see it^) ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$scripts = $env:SCRIPTS_DIR; $scope = $env:PATH_SCOPE; $cur = [Environment]::GetEnvironmentVariable('Path', $scope); if (-not $cur) { $cur = '' }; $parts = $cur -split ';' | Where-Object { $_ }; if ($parts -notcontains $scripts) { [Environment]::SetEnvironmentVariable('Path', ($cur.TrimEnd(';') + ';' + $scripts), $scope) }"
if errorlevel 1 (
    echo installer: could not update PATH. Add "!SCRIPTS_DIR!" to PATH manually. 1>&2
    exit /b 1
)

echo Done. Open a new terminal and run: figgo-bot --help
exit /b 0

:usage
echo Usage: scripts\installer.bat              [default: %LOCALAPPDATA%\FiggoBot + User PATH]
echo        scripts\installer.bat /user       same as default
echo        scripts\installer.bat /system     %ProgramFiles%\FiggoBot + Machine PATH (Administrator^)
echo Env:    FIGGO_BOT_PREFIX=C:\path          override install directory
exit /b 1
