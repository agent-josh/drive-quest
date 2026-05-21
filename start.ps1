# Drive Quest - Expo 개발 서버 시작 (PATH 설정 포함)
param(
    [switch]$Tunnel,
    [int]$Port = 8083
)

$env:Path = "C:\Program Files\nodejs;" + $env:Path
Remove-Item Env:CI -ErrorAction SilentlyContinue
Set-Location $PSScriptRoot

if (-not (Test-Path ".\node_modules")) {
    Write-Host "처음 실행: 패키지 설치 중..." -ForegroundColor Yellow
    npm install
}

$lanIp = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -match '^192\.168\.' } |
    Select-Object -First 1
).IPAddress
if ($lanIp) {
    Write-Host "Expo Go URL: exp://${lanIp}:$Port" -ForegroundColor Yellow
    Write-Host "QR 페이지: QR-미리보기.html (포트 $Port)" -ForegroundColor Yellow
    Write-Host "PC 브라우저: http://localhost:$Port" -ForegroundColor Yellow
}

if ($Tunnel) {
    Write-Host "터널 모드..." -ForegroundColor Cyan
    npx expo start --tunnel --port $Port
} else {
    Write-Host "LAN 모드 (포트 $Port). 연결 안 되면: .\start.ps1 -Tunnel" -ForegroundColor Cyan
    npx expo start --lan --port $Port
}
Write-Host "종료: Ctrl+C" -ForegroundColor Green
