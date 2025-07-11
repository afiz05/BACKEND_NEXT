# PowerShell script for Windows deployment
param(
    [string]$Environment = "production",
    [int]$Port = 8080,
    [switch]$Force = $false
)

Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Sintesa Backend Deployment" -ForegroundColor Green
Write-Host "   PowerShell Script for Windows" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    Write-Host "✅ Running as Administrator" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not running as Administrator - some features may not work" -ForegroundColor Yellow
}

# Check Node.js installation
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check PM2 installation
try {
    $pm2Version = pm2 --version
    Write-Host "✅ PM2 version: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install PM2" -ForegroundColor Red
        exit 1
    }
}

# Create directories
$directories = @("logs", "public/uploads", "temp")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "📁 Created directory: $dir" -ForegroundColor Green
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
if ($Environment -eq "production") {
    npm install --production
} else {
    npm install
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Stop existing processes
Write-Host "🛑 Stopping existing processes..." -ForegroundColor Yellow
pm2 stop sintesa-backend 2>$null
pm2 delete sintesa-backend 2>$null

# Start application
Write-Host "🚀 Starting application..." -ForegroundColor Green
pm2 start ecosystem.config.windows.json --env windows

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start application" -ForegroundColor Red
    exit 1
}

# Save PM2 configuration
pm2 save

# Setup PM2 startup (only if admin)
if ($isAdmin) {
    Write-Host "🔧 Setting up PM2 startup..." -ForegroundColor Yellow
    pm2 startup
    pm2 save
} else {
    Write-Host "⚠️  Skipping PM2 startup setup (requires administrator)" -ForegroundColor Yellow
}

# Show status
Write-Host "`n📊 Application Status:" -ForegroundColor Green
pm2 status

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`nApplication is running on:" -ForegroundColor White
Write-Host "- Port: $Port" -ForegroundColor White
Write-Host "- URL: http://localhost:$Port" -ForegroundColor White
Write-Host "- Environment: $Environment" -ForegroundColor White

Write-Host "`nUseful PM2 commands:" -ForegroundColor Yellow
Write-Host "- pm2 status         : Check application status"
Write-Host "- pm2 logs           : View logs"
Write-Host "- pm2 monit          : Monitor resources"
Write-Host "- pm2 restart all    : Restart all processes"
Write-Host "- pm2 reload all     : Reload all processes (zero downtime)"
Write-Host "- pm2 stop all       : Stop all processes"

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
