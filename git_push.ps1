$ErrorActionPreference = 'Stop'
$git = 'C:\flutter\bin\mingit\cmd\git.exe'

Write-Host "Configuring git identity..."
& $git config user.email "mortuza@decisionpilot.ai"
& $git config user.name "Golam Mortuza"

Write-Host "Staging all files..."
& $git add .

Write-Host "Committing all source files..."
& $git commit -m "feat: initial DecisionPilot AI - full production build"

Write-Host "Pushing to GitHub (force)..."
& $git push -u origin main --force

Write-Host "Push complete!"
