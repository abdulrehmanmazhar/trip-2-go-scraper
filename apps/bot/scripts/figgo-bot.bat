@echo off
setlocal EnableExtensions

rem Launcher: <install-root>\scripts\figgo-bot.bat -> <install-root>\dist\index.js + bundled Node
for %%I in ("%~dp0.") do set "_SCRIPT=%%~fI"
for %%I in ("%_SCRIPT%\..") do set "BOT_ROOT=%%~fI"

set "ENTRY=%BOT_ROOT%\dist\index.js"
if not exist "%ENTRY%" (
    echo figgo-bot: missing "%ENTRY%" - run npm run dist first. 1>&2
    exit /b 1
)

set "NODE_BIN=%BOT_ROOT%\runtime\win-x64\node\node.exe"
if exist "%NODE_BIN%" goto :run

where node >nul 2>&1
if errorlevel 1 (
    echo figgo-bot: no bundled Node in runtime\win-x64\node and no node on PATH. 1>&2
    exit /b 1
)
for /f "usebackq tokens=* delims=" %%i in (`where node`) do (
    set "NODE_BIN=%%i"
    goto :run
)

:run
set "PATH=%BOT_ROOT%\runtime\win-x64\node;%PATH%"
"%NODE_BIN%" "%ENTRY%" %*
exit /b %ERRORLEVEL%
