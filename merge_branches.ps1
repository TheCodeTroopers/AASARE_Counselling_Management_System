# merge_branches.ps1
# This script will fetch all remote branches and attempt to merge them into the local main branch one-by-one.

# Set error action preference to continue so we can inspect git exit codes manually
$ErrorActionPreference = "Continue"

Write-Host "=== Starting Branch Merging Process ===" -ForegroundColor Cyan

# 1. Fetch all remote branches
Write-Host "`nFetching all remote branches..." -ForegroundColor Yellow
git fetch --all

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to fetch remote branches. Please check your network connection and git permissions."
    exit $LASTEXITCODE
}

# 2. Checkout main branch and pull latest changes
Write-Host "`nChecking out 'main' branch..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to checkout main branch."
    exit $LASTEXITCODE
}

git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Failed to pull latest main from origin. Working with local main branch instead."
}

# Define the list of branches to merge
$branches = @(
    "pages/counselor-ui",
    "feature/admin-panel",
    "page/userpanel"
)

$successfulMerges = 0

foreach ($branch in $branches) {
    Write-Host "`n--------------------------------------------------" -ForegroundColor Gray
    Write-Host "Merging branch: $branch" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    
    # Check if remote branch exists
    git rev-parse --verify "origin/$branch" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Remote branch 'origin/$branch' does not exist or has not been fetched. Skipping..."
        continue
    }
    
    # Attempt to merge remote branch into local main
    Write-Host "Running: git merge origin/$branch --no-edit --allow-unrelated-histories" -ForegroundColor Yellow
    git merge "origin/$branch" --no-edit --allow-unrelated-histories
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully merged 'origin/$branch' into 'main'." -ForegroundColor Green
        $successfulMerges++
    } else {
        Write-Host "Conflict or issue detected while merging 'origin/$branch' into 'main'!" -ForegroundColor Red
        Write-Host "Please resolve the conflict(s) in your editor (e.g. VS Code)." -ForegroundColor Yellow
        Write-Host "Once resolved, add and commit the changes using:" -ForegroundColor Gray
        Write-Host "  git add ." -ForegroundColor Gray
        Write-Host "  git commit -m 'Merge branch origin/$branch into main'" -ForegroundColor Gray
        Write-Host "Then, run this script again to continue merging the remaining branches." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "All $successfulMerges branches successfully merged locally!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "To verify the workspace files, look at: d:\AASARE_Counselling_Management_System" -ForegroundColor Yellow
Write-Host "To push the merged changes to the remote repository, run:" -ForegroundColor Yellow
Write-Host "  git push origin main" -ForegroundColor Yellow
