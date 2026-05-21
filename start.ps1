# 운전면허 퀘스트 - Expo 개발 서버 + QR 갱신
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

& "$PSScriptRoot\scripts\update-qr.ps1" -Port $Port
Start-Process (Join-Path $PSScriptRoot "QR-미리보기.html")

$lanIp = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -match '^192\.168\.' } |
    Select-Object -First 1
).IPAddress
if ($lanIp) {
    Write-Host "Expo Go URL: exp://${lanIp}:$Port" -ForegroundColor Yellow
    Write-Host "QR 페이지가 브라우저에서 열렸습니다." -ForegroundColor Yellow
}

if ($Tunnel) {
    Write-Host "터널 모드..." -ForegroundColor Cyan
    npx expo start --tunnel --port $Port
} else {
    Write-Host "LAN 모드 (포트 $Port). 연결 안 되면: .\start.ps1 -Tunnel" -ForegroundColor Cyan
    npx expo start --lan --port $Port
}
Write-Host "종료: Ctrl+C" -ForegroundColor Green
