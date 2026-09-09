Add-Type -AssemblyName System.Drawing

$srcDir = Join-Path $PSScriptRoot '..\public\cars-listing' | Resolve-Path
$outDir = Join-Path $PSScriptRoot '..\public\cars'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$rects = @(
  @{ f = 'strada-1'; x = 0.09; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'strada-2'; x = 0.64; y = 0.56; w = 0.24; h = 0.14 }
  @{ f = 'strada-3'; x = 0.12; y = 0.54; w = 0.16; h = 0.10 }
  @{ f = 'polo-1'; x = 0.07; y = 0.66; w = 0.16; h = 0.10 }
  @{ f = 'polo-1'; x = 0.90; y = 0.14; w = 0.10; h = 0.08 }
  @{ f = 'polo-2'; x = 0.08; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'polo-2'; x = 0.00; y = 0.48; w = 0.14; h = 0.10 }
  @{ f = 'polo-3'; x = 0.82; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'polo-4'; x = 0.06; y = 0.54; w = 0.16; h = 0.18 }
  @{ f = 'polo-4'; x = 0.90; y = 0.48; w = 0.10; h = 0.08 }
  @{ f = 'polo-5'; x = 0.56; y = 0.58; w = 0.30; h = 0.16 }
  @{ f = 'onix-2'; x = 0.88; y = 0.58; w = 0.10; h = 0.10 }
  @{ f = 'onix-3'; x = 0.08; y = 0.54; w = 0.18; h = 0.12 }
  @{ f = 'onix-3'; x = 0.38; y = 0.18; w = 0.12; h = 0.08 }
  @{ f = 'hb20-1'; x = 0.07; y = 0.57; w = 0.13; h = 0.10 }
  @{ f = 'hb20-2'; x = 0.66; y = 0.70; w = 0.14; h = 0.09 }
  @{ f = 'argo-1'; x = 0.78; y = 0.76; w = 0.13; h = 0.08 }
  @{ f = 'argo-2'; x = 0.12; y = 0.62; w = 0.14; h = 0.09 }
  @{ f = 'argo-3'; x = 0.70; y = 0.70; w = 0.14; h = 0.09 }
  @{ f = 'tcross-1'; x = 0.08; y = 0.62; w = 0.14; h = 0.10 }
  @{ f = 'tcross-3'; x = 0.38; y = 0.62; w = 0.16; h = 0.08 }
  @{ f = 'compass-1'; x = 0.28; y = 0.70; w = 0.18; h = 0.10 }
  @{ f = 'compass-1'; x = 0.02; y = 0.56; w = 0.14; h = 0.12 }
  @{ f = 'compass-2'; x = 0.38; y = 0.62; w = 0.16; h = 0.09 }
  @{ f = 'compass-3'; x = 0.40; y = 0.62; w = 0.16; h = 0.09 }
  @{ f = 'creta-1'; x = 0.08; y = 0.62; w = 0.14; h = 0.11 }
  @{ f = 'creta-2'; x = 0.42; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'pulse-1'; x = 0.11; y = 0.54; w = 0.14; h = 0.14 }
  @{ f = 'pulse-2'; x = 0.18; y = 0.30; w = 0.14; h = 0.14 }
  @{ f = 'corolla-1'; x = 0.08; y = 0.66; w = 0.16; h = 0.10 }
  @{ f = 'corolla-2'; x = 0.18; y = 0.62; w = 0.16; h = 0.09 }
  @{ f = 'corolla-3'; x = 0.12; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'corolla-cross-1'; x = 0.48; y = 0.66; w = 0.38; h = 0.14 }
  @{ f = 'corolla-cross-1'; x = 0.80; y = 0.38; w = 0.10; h = 0.08 }
  @{ f = 'corolla-cross-1'; x = 0.92; y = 0.34; w = 0.08; h = 0.08 }
  @{ f = 'corolla-cross-2'; x = 0.28; y = 0.62; w = 0.18; h = 0.10 }
  @{ f = 'corolla-cross-3'; x = 0.38; y = 0.58; w = 0.16; h = 0.08 }
  @{ f = 'saveiro-1'; x = 0.05; y = 0.63; w = 0.17; h = 0.10 }
  @{ f = 'saveiro-2'; x = 0.10; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'saveiro-3'; x = 0.10; y = 0.56; w = 0.16; h = 0.10 }
  @{ f = 'tracker-1'; x = 0.07; y = 0.63; w = 0.13; h = 0.11 }
  @{ f = 'tracker-2'; x = 0.42; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'kwid-1'; x = 0.58; y = 0.54; w = 0.36; h = 0.14 }
  @{ f = 'kwid-2'; x = 0.40; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'kwid-3'; x = 0.12; y = 0.58; w = 0.14; h = 0.10 }
  @{ f = 'mobi-1'; x = 0.76; y = 0.57; w = 0.10; h = 0.11 }
  @{ f = 'mobi-2'; x = 0.12; y = 0.58; w = 0.14; h = 0.10 }
  @{ f = 'mobi-3'; x = 0.38; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'hrv-1'; x = 0.70; y = 0.62; w = 0.28; h = 0.12 }
  @{ f = 'hrv-1'; x = 0.76; y = 0.16; w = 0.14; h = 0.08 }
  @{ f = 'hrv-1'; x = 0.00; y = 0.22; w = 0.08; h = 0.08 }
  @{ f = 'hrv-2'; x = 0.18; y = 0.62; w = 0.14; h = 0.10 }
  @{ f = 'kicks-1'; x = 0.26; y = 0.58; w = 0.12; h = 0.08 }
  @{ f = 'kicks-2'; x = 0.18; y = 0.58; w = 0.14; h = 0.09 }
  @{ f = 'kicks-3'; x = 0.08; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'nivus-1'; x = 0.19; y = 0.48; w = 0.08; h = 0.11 }
  @{ f = 'nivus-1'; x = 0.22; y = 0.30; w = 0.10; h = 0.06 }
  @{ f = 'nivus-1'; x = 0.78; y = 0.28; w = 0.08; h = 0.06 }
  @{ f = 'nivus-2'; x = 0.08; y = 0.54; w = 0.26; h = 0.14 }
  @{ f = 'nivus-3'; x = 0.40; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'virtus-1'; x = 0.18; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'virtus-1'; x = 0.10; y = 0.20; w = 0.10; h = 0.08 }
  @{ f = 'virtus-2'; x = 0.12; y = 0.58; w = 0.14; h = 0.10 }
  @{ f = 'virtus-3'; x = 0.62; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'city-1'; x = 0.78; y = 0.60; w = 0.10; h = 0.08 }
  @{ f = 'city-2'; x = 0.38; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'city-3'; x = 0.38; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'cronos-1'; x = 0.05; y = 0.55; w = 0.11; h = 0.10 }
  @{ f = 'cronos-2'; x = 0.18; y = 0.62; w = 0.14; h = 0.09 }
  @{ f = 'cronos-3'; x = 0.40; y = 0.62; w = 0.16; h = 0.09 }
  @{ f = 'renegade-1'; x = 0.20; y = 0.68; w = 0.18; h = 0.11 }
  @{ f = 'renegade-2'; x = 0.42; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'renegade-3'; x = 0.12; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'onix-plus-1'; x = 0.00; y = 0.56; w = 0.18; h = 0.14 }
  @{ f = 'onix-plus-2'; x = 0.40; y = 0.62; w = 0.18; h = 0.12 }
  @{ f = 'onix-plus-3'; x = 0.28; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'montana-1'; x = 0.10; y = 0.50; w = 0.16; h = 0.12 }
  @{ f = 'montana-2'; x = 0.40; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'montana-3'; x = 0.18; y = 0.58; w = 0.14; h = 0.10 }
  @{ f = 'dolphin-1'; x = 0.08; y = 0.70; w = 0.14; h = 0.10 }
  @{ f = 'dolphin-2'; x = 0.38; y = 0.62; w = 0.16; h = 0.10 }
  @{ f = 'dolphin-3'; x = 0.40; y = 0.58; w = 0.16; h = 0.10 }
  @{ f = 'versa-1'; x = 0.62; y = 0.68; w = 0.12; h = 0.08 }
  @{ f = 'versa-2'; x = 0.38; y = 0.70; w = 0.18; h = 0.10 }
  @{ f = 'versa-3'; x = 0.40; y = 0.70; w = 0.18; h = 0.10 }
  @{ f = 'toro-1'; x = 0.06; y = 0.52; w = 0.14; h = 0.10 }
  @{ f = 'toro-2'; x = 0.10; y = 0.56; w = 0.14; h = 0.10 }
  @{ f = 'toro-3'; x = 0.10; y = 0.56; w = 0.16; h = 0.10 }
)

$byFile = $rects | Group-Object f | ForEach-Object { @{ $_.Name = $_.Group } }
$map = @{}
foreach ($row in $rects) {
  if (-not $map.ContainsKey($row.f)) { $map[$row.f] = @() }
  $map[$row.f] += $row
}

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = New-Object System.Drawing.Imaging.EncoderParameters 1
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]84)
$tape = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 12, 10, 10))

Get-ChildItem $srcDir -Filter '*.jpg' | ForEach-Object {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
  $src = [System.Drawing.Bitmap]::new($_.FullName)
  $nw = $src.Width
  $nh = $src.Height
  if ($nw -gt 1600) {
    $nh = [int]($src.Height * (1600.0 / $src.Width))
    $nw = 1600
  }
  $out = New-Object System.Drawing.Bitmap $nw, $nh
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'HighQuality'
  $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($src, 0, 0, $nw, $nh)
  $n = 0
  if ($map.ContainsKey($name)) {
    foreach ($b in $map[$name]) {
      $x = [Math]::Max(0, [int]([double]$b.x * $nw))
      $y = [Math]::Max(0, [int]([double]$b.y * $nh))
      $w = [Math]::Min($nw - $x, [int]([double]$b.w * $nw))
      $h = [Math]::Min($nh - $y, [int]([double]$b.h * $nh))
      $g.FillRectangle($tape, $x, $y, $w, $h)
      $n += 1
    }
  }
  $g.Flush()
  $out.Save((Join-Path $outDir $_.Name), $jpeg, $enc)
  $g.Dispose(); $out.Dispose(); $src.Dispose()
  Write-Host ($_.Name + ' ' + $n)
}

$tape.Dispose()
