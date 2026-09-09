Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..\public\cars' | Resolve-Path

function Test-Blue([System.Drawing.Color]$c) {
  return ($c.B -gt 90 -and $c.B -gt ($c.R + 20) -and $c.B -gt ($c.G + 5) -and $c.R -lt 120)
}

function Test-Whiteish([System.Drawing.Color]$c) {
  return ($c.R -gt 185 -and $c.G -gt 185 -and $c.B -gt 185 -and [Math]::Abs($c.R - $c.G) -lt 35)
}

function Find-Plate([System.Drawing.Bitmap]$bmp) {
  $w = $bmp.Width
  $h = $bmp.Height
  $stepY = [Math]::Max(2, [int]($h / 140))
  $stepX = [Math]::Max(2, [int]($w / 180))
  $best = $null
  $bestScore = 0

  for ($y = [int]($h * 0.42); $y -lt [int]($h * 0.92); $y += $stepY) {
    $runStart = -1
    $runLen = 0
    $bestRunStart = 0
    $bestRunLen = 0
    for ($x = [int]($w * 0.12); $x -lt [int]($w * 0.88); $x += $stepX) {
      $c = $bmp.GetPixel($x, $y)
      $hit = (Test-Blue $c) -or (Test-Whiteish $c)
      if ($hit) {
        if ($runStart -lt 0) { $runStart = $x; $runLen = $stepX }
        else { $runLen += $stepX }
      } else {
        if ($runLen -gt $bestRunLen) { $bestRunLen = $runLen; $bestRunStart = $runStart }
        $runStart = -1; $runLen = 0
      }
    }
    if ($runLen -gt $bestRunLen) { $bestRunLen = $runLen; $bestRunStart = $runStart }

    $frac = $bestRunLen / $w
    if ($frac -lt 0.07 -or $frac -gt 0.28) { continue }

    $cx = $bestRunStart + ($bestRunLen / 2)
    $centerBias = 1 - ([Math]::Abs(($cx / $w) - 0.42) / 0.5)
    $lowBias = ($y / $h)
    $score = $frac * 10 + $centerBias * 2 + $lowBias
    if ($score -gt $bestScore) {
      $bestScore = $score
      $pw = $bestRunLen * 1.12
      $ph = $pw * 0.38
      $x0 = $bestRunStart - ($pw * 0.06)
      $y0 = $y - ($ph * 0.18)
      $best = @(
        [Math]::Max(0, [Math]::Round($x0 / $w, 3)),
        [Math]::Max(0, [Math]::Round($y0 / $h, 3)),
        [Math]::Round($pw / $w, 3),
        [Math]::Round($ph / $h, 3)
      )
    }
  }
  return $best
}

Get-ChildItem $root -Filter '*.jpg' | Where-Object { $_.Name -match '-\d\.jpg$' } | ForEach-Object {
  $bmp = [System.Drawing.Bitmap]::FromFile($_.FullName)
  $box = Find-Plate $bmp
  $bmp.Dispose()
  $key = [IO.Path]::GetFileNameWithoutExtension($_.Name)
  if ($box) { Write-Output ("{0} {1} {2} {3} {4}" -f $key, $box[0], $box[1], $box[2], $box[3]) }
  else { Write-Output "$key NONE" }
}
