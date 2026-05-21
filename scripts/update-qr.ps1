# LAN IP로 QR-미리보기.html 갱신
param([int]$Port = 8083)

$lanIp = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -match '^192\.168\.' } |
    Select-Object -First 1
).IPAddress

if (-not $lanIp) {
    Write-Host "192.168.x.x IP를 찾지 못했습니다. Wi-Fi 연결을 확인하세요." -ForegroundColor Red
    exit 1
}

$expoUrl = "exp://${lanIp}:${Port}"
$root = Split-Path $PSScriptRoot -Parent
$htmlPath = Join-Path $root "QR-미리보기.html"

$html = @"
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>운전면허 퀘스트 - Expo QR</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      max-width: 420px;
      margin: 0 auto;
      padding: 24px;
      background: #f8fafc;
      color: #0f172a;
    }
    h1 { font-size: 1.35rem; color: #4f46e5; margin-bottom: 8px; }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(15,23,42,.08);
      border: 1px solid #e2e8f0;
    }
    img { width: 260px; height: 260px; margin: 16px 0; border-radius: 12px; }
    code {
      display: block;
      background: #eef2ff;
      color: #3730a3;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      word-break: break-all;
      margin: 12px 0;
    }
    ol { text-align: left; line-height: 1.7; padding-left: 1.2rem; }
    .warn {
      background: #fef3c7;
      color: #92400e;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-top: 16px;
      text-align: left;
    }
    button {
      margin-top: 12px;
      padding: 12px 20px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
    }
    .updated { font-size: 0.8rem; color: #64748b; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>운전면허 퀘스트</h1>
  <p>Expo Go로 QR 스캔 (최신 개발 버전)</p>

  <div class="card">
    <img id="qr" alt="Expo QR Code" width="260" height="260" />
    <p><strong>연결 주소</strong></p>
    <code id="url">$expoUrl</code>
    <button type="button" onclick="copyUrl()">주소 복사</button>
    <p class="updated">갱신: $(Get-Date -Format 'yyyy-MM-dd HH:mm')</p>
  </div>

  <ol>
    <li>PC에서 <strong>.\start.ps1</strong> 실행 중인지 확인</li>
    <li>폰·PC <strong>같은 Wi‑Fi</strong></li>
    <li>Expo Go → <strong>Scan QR code</strong></li>
    <li>앱 → <strong>필기 준비</strong> 탭</li>
  </ol>

  <div class="warn">
    ⚠️ 서버 포트 <strong>$Port</strong>. 연결 안 되면 <code>.\start.ps1 -Tunnel</code> 후 이 페이지를 새로고침하세요.
  </div>

  <script>
    const expoUrl = '$expoUrl';
    document.getElementById('url').textContent = expoUrl;
    document.getElementById('qr').src =
      'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' +
      encodeURIComponent(expoUrl);

    function copyUrl() {
      navigator.clipboard.writeText(expoUrl).then(() => alert('복사됨: ' + expoUrl));
    }
  </script>
</body>
</html>
"@

Set-Content -Path $htmlPath -Value $html -Encoding UTF8
Write-Host "QR 갱신: $expoUrl" -ForegroundColor Green
Write-Host "파일: $htmlPath" -ForegroundColor Cyan
