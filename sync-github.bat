@echo off
echo 🚀 Syncing Gym SaaS to GitHub...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/vishal-45/gym-saas
git add .
git commit -m "Elite Aesthetic Overhaul & Global Communication Hub Implementation"
git branch -M main
git push -u origin main
echo ✅ Done! Your code is now live on GitHub.
pause
