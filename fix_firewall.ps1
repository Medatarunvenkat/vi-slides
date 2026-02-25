New-NetFirewallRule -DisplayName 'Allow Vi-Slides' -Direction Inbound -LocalPort 5001,5173 -Protocol TCP -Action Allow
Write-Host "✅ Firewall rules added for ports 5001 and 5173!" -ForegroundColor Green
Read-Host "Press Enter to close"
