@echo off
echo Syncing with GitHub...
git add .
git commit -m "feat: built trainer payroll engine, broadcast system, and patched RBAC security"
git push origin main
if errorlevel 1 (
    echo Push to main failed, trying master...
    git push origin master
)
echo Sync complete!
pause
