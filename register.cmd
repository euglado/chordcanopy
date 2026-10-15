@echo off
cd /d "%~dp0"
node scripts/launch.mjs register
if errorlevel 1 pause
