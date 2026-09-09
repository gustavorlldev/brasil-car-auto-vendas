Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..\public\cars' | Resolve-Path
$raw = Join-Path $PSScriptRoot '..\public\cars-raw' | Resolve-Path
$letters = 'ABCDEFGHJKLMNPRSTUVXYZ'.ToCharArray()

function Get-FakePlate([int]$seed) {
  $digit = (($seed % 9) + 1).ToString()
  $series = $letters[$seed % 20]
  $last = ($seed % 100).ToString().PadLeft(2, '0')
  return "BCA$digit$series$last"
}

$seeds = @{
  'strada' = 11; 'polo' = 12; 'onix' = 13; 'hb20' = 14; 'argo' = 15
  'tcross' = 16; 'compass' = 17; 'creta' = 18; 'pulse' = 19; 'corolla' = 20
  'corolla-cross' = 21; 'saveiro' = 22; 'tracker' = 23; 'kwid' = 24; 'mobi' = 25
  'hrv' = 26; 'kicks' = 27; 'nivus' = 28; 'virtus' = 29; 'city' = 30
  'cronos' = 31; 'renegade' = 32; 'onix-plus' = 33; 'montana' = 34; 'dolphin' = 35
  'versa' = 36; 'toro' = 37
}

$front = @(0.20, 0.56, 0.34, 0.18)
$rear = @(0.40, 0.54, 0.30, 0.16)
$boxes = @{
  'onix-1' = $front; 'onix-2' = $rear
  'onix-plus-1' = @(0.26, 0.50, 0.34, 0.18); 'onix-plus-2' = $rear
  'polo-1' = $front; 'polo-2' = $front
  'hb20-1' = $front; 'hb20-2' = $rear
  'pulse-1' = $front; 'pulse-2' = $rear
  'montana-1' = @(0.18, 0.58, 0.38, 0.20)
  'renegade-1' = $front
  'virtus-1' = $front; 'virtus-2' = $front
  'nivus-1' = $front
  'kwid-1' = $front; 'kwid-2' = $front
  'mobi-1' = $front; 'mobi-2' = $front
  'tracker-1' = $front; 'tracker-2' = $rear
  'cronos-1' = $front; 'cronos-2' = $front
  'kicks-1' = @(0.30, 0.54, 0.32, 0.16)
  'hrv-1' = $front
  'dolphin-1' = @(0.28, 0.48, 0.32, 0.18)
  'saveiro-1' = $front; 'saveiro-2' = $front
  'strada-1' = $front; 'strada-2' = $rear
  'argo-1' = @(0.28, 0.60, 0.32, 0.16); 'argo-2' = $front
  'tcross-1' = $rear; 'tcross-2' = $front
  'compass-1' = $front; 'compass-2' = $front
  'creta-1' = $front; 'creta-2' = $front
  'corolla-1' = @(0.24, 0.60, 0.34, 0.18); 'corolla-2' = $front
  'corolla-cross-1' = $front; 'corolla-cross-2' = $front
  'city-1' = $front
  'versa-1' = $front; 'versa-2' = $front
  'toro-1' = $front; 'toro-2' = $front
}

function Draw-StorePlate($g, [int]$x, [int]$y, [int]$w, [int]$h, [string]$code) {
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $tape = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(250, 8, 8, 8))
  $g.FillRectangle($tape, $x, $y, $w, $h)
  $storeH = [Math]::Max(12, [int]($h * 0.26))
  $bandH = [Math]::Max(10, [int]($h * 0.18))
  $red = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 196, 18, 32))
  $blue = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 0, 51, 153))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 244, 246, 248))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 18, 22, 28))
  $whiteT = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $g.FillRectangle($red, $x, $y, $w, $storeH)
  $g.FillRectangle($white, $x, ($y + $storeH), $w, ($h - $storeH))
  $g.FillRectangle($blue, $x, ($y + $storeH), $w, $bandH)
  $center = New-Object System.Drawing.StringFormat
  $center.Alignment = 'Center'
  $center.LineAlignment = 'Center'
  $storeFont = New-Object System.Drawing.Font 'Arial', ([Math]::Max(8, [int]($storeH * 0.5))), ([System.Drawing.FontStyle]::Bold)
  $bandFont = New-Object System.Drawing.Font 'Arial', ([Math]::Max(7, [int]($bandH * 0.45))), ([System.Drawing.FontStyle]::Bold)
  $codeH = $h - $storeH - $bandH
  $codeFont = New-Object System.Drawing.Font 'Arial', ([Math]::Max(12, [int]($codeH * 0.52))), ([System.Drawing.FontStyle]::Bold)
  $g.DrawString('BRASIL CARS', $storeFont, $whiteT, (New-Object System.Drawing.RectangleF $x, $y, $w, $storeH), $center)
  $g.DrawString('BR  BRASIL  MERCOSUL', $bandFont, $whiteT, (New-Object System.Drawing.RectangleF $x, ($y + $storeH), $w, $bandH), $center)
  $g.DrawString($code, $codeFont, $ink, (New-Object System.Drawing.RectangleF $x, ($y + $storeH + $bandH), $w, $codeH), $center)
  $storeFont.Dispose(); $bandFont.Dispose(); $codeFont.Dispose()
  $red.Dispose(); $blue.Dispose(); $white.Dispose(); $ink.Dispose(); $whiteT.Dispose(); $tape.Dispose()
}

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = New-Object System.Drawing.Imaging.EncoderParameters 1
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]90)

Get-ChildItem $raw -Filter '*.jpg' | Where-Object { $_.Name -notmatch 'hatch|debug' } | ForEach-Object {
  $key = [IO.Path]::GetFileNameWithoutExtension($_.Name)
  $prefix = ($key -replace '-\d+$', '')
  if (-not $seeds.ContainsKey($prefix)) { return }
  $code = Get-FakePlate $seeds[$prefix]
  $box = if ($boxes.ContainsKey($key)) { $boxes[$key] } else { $front }

  $src = [System.Drawing.Bitmap]::FromFile($_.FullName)
  $bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, 0, 0, $src.Width, $src.Height)
  $src.Dispose()

  $x = [int]($bmp.Width * $box[0])
  $y = [int]($bmp.Height * $box[1])
  $w = [int]($bmp.Width * $box[2])
  $h = [int]($bmp.Height * $box[3])
  Draw-StorePlate $g $x $y $w $h $code
  $g.Dispose()

  $dest = Join-Path $root $_.Name
  $tmp = "$dest.tmp.jpg"
  $bmp.Save($tmp, $jpeg, $enc)
  $bmp.Dispose()
  Move-Item -Force $tmp $dest
  Write-Output "$key $code"
}
