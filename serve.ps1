# Dxign CRM - Native Windows Localhost HTTP Server (Zero Dependencies)
param (
    [int]$Port = 5000
)

$baseDir = $PSScriptRoot
$prefix = "http://localhost:$Port/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "  DXIGN CRM LOCALHOST SERVER IS ONLINE!" -ForegroundColor Green
    Write-Host "  URL: $prefix" -ForegroundColor Yellow
    Write-Host "  Root: $baseDir" -ForegroundColor Gray
    Write-Host "========================================================`n" -ForegroundColor Cyan

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

        $rawUrl = $request.RawUrl.Split('?')[0]
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        # Normalize relative path
        $relPath = $rawUrl.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $baseDir $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawUrl")
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Server stopped: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
    $listener.Close()
}
