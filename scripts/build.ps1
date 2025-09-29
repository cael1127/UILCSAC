# PowerShell build script for Netlify
Write-Host "Starting build process..."

try {
    # Install dependencies
    Write-Host "Installing dependencies..."
    npm ci
    
    # Run the build
    Write-Host "Building application..."
    npm run build
    
    # Check if build was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!"
        exit 0
    } else {
        Write-Host "Build failed with exit code: $LASTEXITCODE"
        exit 1
    }
} catch {
    Write-Host "Build failed with error: $($_.Exception.Message)"
    exit 1
}
