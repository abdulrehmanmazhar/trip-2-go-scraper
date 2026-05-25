@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Stable launcher — never points at a fixed version directory.
rem Resolves active version via current\version.txt (and optional current\app junction).

for %%I in ("%~dp0.") do set "_SCRIPT=%%~fI"

set "INSTALL_ROOT="
set "SEARCH=%_SCRIPT%"
:find_install_root
if exist "!SEARCH!\current\version.txt" (
    set "INSTALL_ROOT=!SEARCH!"
    goto :install_root_done
)
for %%I in ("!SEARCH!\..") do set "PARENT=%%~fI"
if "!PARENT!"=="!SEARCH!" goto :install_root_fallback
set "SEARCH=!PARENT!"
goto :find_install_root

:install_root_fallback
for %%I in ("%_SCRIPT%\..") do set "INSTALL_ROOT=%%~fI"

:install_root_done

set "VERSION_FILE=%INSTALL_ROOT%\current\version.txt"
set "VERSION="

if exist "%VERSION_FILE%" (
    set /p VERSION=<"%VERSION_FILE%"
)

if not defined VERSION (
    if exist "%INSTALL_ROOT%\dist\index.js" (
        set "APP_ROOT=%INSTALL_ROOT%"
        goto :resolve_node
    )
    echo figgo-bot: no active version in current\version.txt and no legacy dist\index.js 1>&2
    exit /b 1
)

set "APP_ROOT=%INSTALL_ROOT%\versions\%VERSION%"
if exist "%INSTALL_ROOT%\current\app\dist\index.js" (
    set "APP_ROOT=%INSTALL_ROOT%\current\app"
)

if not exist "%APP_ROOT%\dist\index.js" (
    echo figgo-bot: active version "%VERSION%" missing dist\index.js at "%APP_ROOT%" 1>&2
    exit /b 1
)

set "ENTRY=%APP_ROOT%\dist\index.js"
set "FIGGO_INSTALL_ROOT=%INSTALL_ROOT%"
set "FIGGO_ACTIVE_VERSION=%VERSION%"

:resolve_node
set "NODE_BIN=%APP_ROOT%\runtime\win-x64\node\node.exe"
if exist "%NODE_BIN%" goto :run

where node >nul 2>&1
if errorlevel 1 (
    echo figgo-bot: no bundled Node and no node on PATH. 1>&2
    exit /b 1
)
for /f "usebackq tokens=* delims=" %%i in (`where node`) do (
    set "NODE_BIN=%%i"
    goto :run
)

:run
set "PATH=%APP_ROOT%\runtime\win-x64\node;%PATH%"
"%NODE_BIN%" "%ENTRY%" %*
exit /b %ERRORLEVEL%
