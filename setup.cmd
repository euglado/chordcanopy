@echo off
cd /d "%~dp0"
node scripts/launch.mjs setup
if errorlevel 1 pause
