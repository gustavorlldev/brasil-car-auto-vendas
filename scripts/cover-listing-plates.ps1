Add-Type -AssemblyName System.Drawing

$rawDir = Join-Path $PSScriptRoot '..\public\cars-listing' | Resolve-Path
$outDir = Join-Path $PSScriptRoot '..\public\cars'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$metaPath = Join-Path $rawDir 'meta.json'
$skip = @{
  'hb20-3.jpg' = $true
  'pulse-3.jpg' = $true
  'tracker-3.jpg' = $true
  'hrv-3.jpg' = $true
}
if (Test-Path $metaPath) {
  $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
  foreach ($row in $meta) {
    if ($row.skipPlate) { $skip[$row.file] = $true }
  }
}

$code = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class PlateCover {
  static bool PlatePixel(Color c) {
    int max = Math.Max(c.R, Math.Max(c.G, c.B));
    int min = Math.Min(c.R, Math.Min(c.G, c.B));
    bool gray = (max - min) < 48;
    bool bright = c.R > 148 && c.G > 148 && c.B > 148 && (c.R + c.G + c.B) > 470;
    bool blue = c.B > 95 && c.B > c.R + 32 && c.B > c.G + 12 && c.R < 150;
    bool yellow = c.R > 168 && c.G > 138 && c.B < 95 && c.R > c.B + 70;
    return (gray && bright) || blue || yellow;
  }

  static Rectangle Find(Bitmap src) {
    int tw = 480;
    int th = Math.Max(1, src.Height * tw / src.Width);
    using (var small = new Bitmap(tw, th)) {
      using (var g = Graphics.FromImage(small)) {
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.DrawImage(src, 0, 0, tw, th);
      }
      int y0 = (int)(th * 0.40);
      int y1 = (int)(th * 0.95);
      int x0 = (int)(tw * 0.10);
      int x1 = (int)(tw * 0.90);
      int w = x1 - x0;
      int h = y1 - y0;
      bool[,] m = new bool[w, h];
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          m[x, y] = PlatePixel(small.GetPixel(x0 + x, y0 + y));
        }
      }
      bool[,] seen = new bool[w, h];
      int bestA = 0;
      int bx = 0, by = 0, bw = 0, bh = 0;
      int[] qx = new int[w * h];
      int[] qy = new int[w * h];
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          if (!m[x, y] || seen[x, y]) continue;
          int n = 0;
          int minx = x, maxx = x, miny = y, maxy = y;
          qx[0] = x; qy[0] = y; seen[x, y] = true;
          int qs = 0, qe = 1;
          while (qs < qe) {
            int cx = qx[qs], cy = qy[qs]; qs++;
            n++;
            if (cx < minx) minx = cx; if (cx > maxx) maxx = cx;
            if (cy < miny) miny = cy; if (cy > maxy) maxy = cy;
            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };
            for (int i = 0; i < 4; i++) {
              int nx = cx + dx[i], ny = cy + dy[i];
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
              if (seen[nx, ny] || !m[nx, ny]) continue;
              seen[nx, ny] = true;
              qx[qe] = nx; qy[qe] = ny; qe++;
            }
          }
          int pw = maxx - minx + 1;
          int ph = maxy - miny + 1;
          if (ph < 8 || pw < 22) continue;
          double ar = (double)pw / ph;
          if (ar < 1.8 || ar > 6.8) continue;
          double frac = (double)(pw * ph) / (tw * th);
          if (frac < 0.002 || frac > 0.09) continue;
          int cxp = minx + pw / 2;
          int center = Math.Abs(cxp - w / 2);
          int score = n - center * 3;
          if (score > bestA) {
            bestA = score;
            bx = minx; by = miny; bw = pw; bh = ph;
          }
        }
      }
      if (bestA <= 0) return Rectangle.Empty;
      double sx = (double)src.Width / tw;
      double sy = (double)src.Height / th;
      int rx = (int)((x0 + bx) * sx);
      int ry = (int)((y0 + by) * sy);
      int rw = (int)(bw * sx);
      int rh = (int)(bh * sy);
      int padX = Math.Max(8, (int)(rw * 0.16));
      int padY = Math.Max(8, (int)(rh * 0.28));
      rx = Math.Max(0, rx - padX);
      ry = Math.Max(0, ry - padY);
      rw = Math.Min(src.Width - rx, rw + padX * 2);
      rh = Math.Min(src.Height - ry, rh + padY * 2);
      return new Rectangle(rx, ry, rw, rh);
    }
  }

  public static string Process(string srcPath, string destPath, bool skipPlate) {
    using (var src = new Bitmap(srcPath)) {
      int maxW = 1600;
      int nw = src.Width;
      int nh = src.Height;
      if (nw > maxW) {
        nh = (int)(src.Height * (maxW / (double)src.Width));
        nw = maxW;
      }
      using (var outBmp = new Bitmap(nw, nh)) {
        using (var g = Graphics.FromImage(outBmp)) {
          g.InterpolationMode = InterpolationMode.HighQualityBicubic;
          g.SmoothingMode = SmoothingMode.HighQuality;
          g.DrawImage(src, 0, 0, nw, nh);
          string mark = "none";
          if (!skipPlate) {
            using (var scaled = new Bitmap(nw, nh)) {
              using (var gs = Graphics.FromImage(scaled)) {
                gs.DrawImage(src, 0, 0, nw, nh);
              }
              Rectangle box = Find(scaled);
              if (box.Width > 0) {
                using (var tape = new SolidBrush(Color.FromArgb(255, 10, 10, 10))) {
                  g.FillRectangle(tape, box);
                }
                mark = box.X + "," + box.Y + "," + box.Width + "x" + box.Height;
              }
            }
          } else {
            mark = "skip";
          }
          var codec = GetJpeg();
          var enc = Encoder.Quality;
          var p = new EncoderParameters(1);
          p.Param[0] = new EncoderParameter(enc, 84L);
          outBmp.Save(destPath, codec, p);
          return mark;
        }
      }
    }
  }

  static ImageCodecInfo GetJpeg() {
    foreach (var c in ImageCodecInfo.GetImageEncoders()) {
      if (c.MimeType == "image/jpeg") return c;
    }
    return null;
  }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

Get-ChildItem $rawDir -Filter '*.jpg' | ForEach-Object {
  $out = Join-Path $outDir $_.Name
  $skipPlate = $skip.ContainsKey($_.Name)
  $mark = [PlateCover]::Process($_.FullName, $out, $skipPlate)
  Write-Host ($_.Name + ' ' + $mark)
}
