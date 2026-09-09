Add-Type -AssemblyName System.Drawing

$rawDir = Join-Path $PSScriptRoot '..\public\cars-raw' | Resolve-Path
$outDir = Join-Path $PSScriptRoot '..\public\cars' | Resolve-Path
$cutDir = Join-Path $PSScriptRoot '..\public\cars-cut'
if (-not (Test-Path $cutDir)) { New-Item -ItemType Directory -Path $cutDir | Out-Null }
$cutDir = Resolve-Path $cutDir
$lotPath = Join-Path $PSScriptRoot 'bg\lot.jpg' | Resolve-Path
$showroomPath = Join-Path $PSScriptRoot 'bg\showroom.jpg' | Resolve-Path

$code = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;
using System.Runtime.InteropServices;

public static class DealershipMontage {
  public static void Process(string rawDir, string outDir, string lotPath, string showroomPath, string cutDir) {
    using (var lot = (Bitmap)Image.FromFile(lotPath))
    using (var showroom = (Bitmap)Image.FromFile(showroomPath)) {
      var jpeg = GetJpegCodec();
      var enc = new EncoderParameters(1);
      enc.Param[0] = new EncoderParameter(Encoder.Quality, 90L);

      foreach (var file in Directory.GetFiles(rawDir, "*.jpg")) {
        var name = Path.GetFileNameWithoutExtension(file);
        if (name.IndexOf("hatch", StringComparison.OrdinalIgnoreCase) >= 0) continue;
        if (name.IndexOf("debug", StringComparison.OrdinalIgnoreCase) >= 0) continue;
        if (name.StartsWith("bg-", StringComparison.OrdinalIgnoreCase)) continue;

        var prefix = System.Text.RegularExpressions.Regex.Replace(name, @"-\d+$", "");
        int seed;
        if (!Seeds.TryGetValue(prefix, out seed)) continue;

        var isRear = name.EndsWith("-2");
        var bg = name.EndsWith("-2") ? showroom : lot;

        var cutPath = Path.Combine(cutDir, name + ".png");
        using (var cut = File.Exists(cutPath) ? (Bitmap)Image.FromFile(cutPath) : CutCar((Bitmap)Image.FromFile(file))) {
          CoverPlate(cut, name);
          using (var canvas = Compose(bg, cut, isRear)) {
            var dest = Path.Combine(outDir, Path.GetFileName(file));
            var tmp = dest + ".tmp.jpg";
            canvas.Save(tmp, jpeg, enc);
            for (int attempt = 0; attempt < 6; attempt++) {
              try {
                File.Copy(tmp, dest, true);
                break;
              } catch (IOException) {
                System.Threading.Thread.Sleep(200);
                if (attempt == 5) Console.WriteLine("LOCKED " + name);
              }
            }
            try { File.Delete(tmp); } catch {}
            Console.WriteLine(name + " covered");
          }
        }
      }
    }
  }

  static readonly Dictionary<string, int> Seeds = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase) {
    {"strada",11},{"polo",12},{"onix",13},{"hb20",14},{"argo",15},
    {"tcross",16},{"compass",17},{"creta",18},{"pulse",19},{"corolla",20},
    {"corolla-cross",21},{"saveiro",22},{"tracker",23},{"kwid",24},{"mobi",25},
    {"hrv",26},{"kicks",27},{"nivus",28},{"virtus",29},{"city",30},
    {"cronos",31},{"renegade",32},{"onix-plus",33},{"montana",34},{"dolphin",35},
    {"versa",36},{"toro",37}
  };

  static string FakePlate(int seed) {
    const string letters = "ABCDEFGHJKLMNPRSTUVXYZ";
    var digit = ((seed % 9) + 1).ToString();
    var series = letters[seed % 20];
    var last = (seed % 100).ToString("00");
    return "BCA" + digit + series + last;
  }

  static Bitmap CutCar(Bitmap src) {
    var tight = CutCarWithThreshold(src, 28);
    if (OpaqueRatio(tight) >= 0.18) return tight;
    tight.Dispose();
    var loose = CutCarWithThreshold(src, 18);
    if (OpaqueRatio(loose) >= 0.18) return loose;
    loose.Dispose();
    return CopyOpaque(src);
  }

  static Bitmap CopyOpaque(Bitmap src) {
    var copy = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(copy)) g.DrawImage(src, 0, 0, src.Width, src.Height);
    return copy;
  }

  static float OpaqueRatio(Bitmap cut) {
    var b = OpaqueBounds(cut);
    return (float)(b.Width * b.Height) / (cut.Width * cut.Height);
  }

  static Bitmap CutCarWithThreshold(Bitmap src, int thresh) {
    int w = src.Width, h = src.Height;
    var data = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = data.Stride;
    byte[] px = new byte[Math.Abs(stride) * h];
    Marshal.Copy(data.Scan0, px, 0, px.Length);
    src.UnlockBits(data);

    bool[] bg = new bool[w * h];
    var q = new Queue<int>();
    Action<int,int> enqueue = (x, y) => {
      int i = y * w + x;
      if (bg[i]) return;
      bg[i] = true;
      q.Enqueue(i);
    };

    int m = Math.Max(8, Math.Min(w, h) / 18);
    for (int y = 0; y < m; y++) {
      for (int x = 0; x < m; x++) {
        enqueue(x, y);
        enqueue(w - 1 - x, y);
        enqueue(x, h - 1 - y);
        enqueue(w - 1 - x, h - 1 - y);
      }
    }

    int[] dx = { -1, 1, 0, 0 };
    int[] dy = { 0, 0, -1, 1 };
    int limit = thresh * thresh;
    while (q.Count > 0) {
      int i = q.Dequeue();
      int x = i % w, y = i / w;
      int o = y * stride + x * 4;
      int b = px[o], g = px[o + 1], r = px[o + 2];
      for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        int ni = ny * w + nx;
        if (bg[ni]) continue;
        int no = ny * stride + nx * 4;
        int db = b - px[no];
        int dg = g - px[no + 1];
        int dr = r - px[no + 2];
        if (db * db + dg * dg + dr * dr < limit) enqueue(nx, ny);
      }
    }

    var cut = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    var cd = cut.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    byte[] outPx = new byte[Math.Abs(cd.Stride) * h];
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        int i = y * w + x;
        int o = y * stride + x * 4;
        int oo = y * cd.Stride + x * 4;
        if (bg[i]) {
          outPx[oo + 3] = 0;
        } else {
          outPx[oo] = px[o];
          outPx[oo + 1] = px[o + 1];
          outPx[oo + 2] = px[o + 2];
          outPx[oo + 3] = 255;
        }
      }
    }
    Marshal.Copy(outPx, 0, cd.Scan0, outPx.Length);
    cut.UnlockBits(cd);
    return cut;
  }

  static Rectangle OpaqueBounds(Bitmap cut) {
    int w = cut.Width, h = cut.Height;
    var data = cut.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int minX = w, minY = h, maxX = 0, maxY = 0;
    int stride = data.Stride;
    byte[] px = new byte[Math.Abs(stride) * h];
    Marshal.Copy(data.Scan0, px, 0, px.Length);
    cut.UnlockBits(data);
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        if (px[y * stride + x * 4 + 3] < 128) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX <= minX || maxY <= minY) return new Rectangle(0, 0, w, h);
    return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
  }

  static Bitmap Compose(Bitmap bg, Bitmap cut, bool indoor) {
    int cw = 1600, ch = 900;
    var canvas = new Bitmap(cw, ch, PixelFormat.Format24bppRgb);
    using (var g = Graphics.FromImage(canvas)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.SmoothingMode = SmoothingMode.HighQuality;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.DrawImage(bg, new Rectangle(0, 0, cw, ch));

      var bounds = OpaqueBounds(cut);
      float carW = cw * (indoor ? 0.74f : 0.80f);
      float scale = carW / Math.Max(1, bounds.Width);
      int dw = (int)(bounds.Width * scale);
      int dh = (int)(bounds.Height * scale);
      int dx = (cw - dw) / 2;
      int dy = ch - dh - (indoor ? 36 : 14);

      using (var shadow = new SolidBrush(Color.FromArgb(70, 0, 0, 0))) {
        g.FillEllipse(shadow, dx + dw * 0.08f, dy + dh * 0.88f, dw * 0.84f, dh * 0.14f);
      }

      var dest = new Rectangle(dx, dy, dw, dh);
      g.DrawImage(cut, dest, bounds, GraphicsUnit.Pixel);
    }
    return canvas;
  }

  static void CoverPlate(Bitmap cut, string name) {
    var bounds = OpaqueBounds(cut);
    float[] box = PlateBox(name);
    int x = bounds.X + (int)(bounds.Width * box[0]);
    int y = bounds.Y + (int)(bounds.Height * box[1]);
    int w = Math.Max(80, (int)(bounds.Width * box[2]));
    int h = Math.Max(28, (int)(bounds.Height * box[3]));
    using (var g = Graphics.FromImage(cut)) {
      g.SmoothingMode = SmoothingMode.AntiAlias;
      using (var cover = new SolidBrush(Color.FromArgb(255, 18, 20, 24))) {
        g.FillRectangle(cover, x - w / 4, y - h / 2, w + (int)(w * 0.7), h + h);
      }
    }
  }

  static float[] PlateBox(string name) {
    switch (name) {
      case "onix-1": return new float[] { 0.32f, 0.50f, 0.38f, 0.18f };
      case "onix-2": return new float[] { 0.40f, 0.70f, 0.22f, 0.10f };
      case "polo-1": return new float[] { 0.16f, 0.70f, 0.30f, 0.12f };
      case "polo-2": return new float[] { 0.16f, 0.70f, 0.30f, 0.12f };
      case "strada-1": return new float[] { 0.20f, 0.73f, 0.18f, 0.08f };
      case "strada-2": return new float[] { 0.42f, 0.70f, 0.18f, 0.08f };
      case "hb20-1": return new float[] { 0.22f, 0.74f, 0.17f, 0.07f };
      case "hb20-2": return new float[] { 0.40f, 0.70f, 0.18f, 0.08f };
      case "saveiro-1": return new float[] { 0.20f, 0.72f, 0.18f, 0.08f };
      case "montana-1": return new float[] { 0.18f, 0.74f, 0.20f, 0.08f };
      case "corolla-1": return new float[] { 0.24f, 0.76f, 0.18f, 0.07f };
      case "corolla-cross-1": return new float[] { 0.22f, 0.74f, 0.18f, 0.07f };
      case "tracker-1": return new float[] { 0.22f, 0.72f, 0.18f, 0.08f };
      case "dolphin-1": return new float[] { 0.28f, 0.70f, 0.18f, 0.08f };
      case "kicks-1": return new float[] { 0.28f, 0.72f, 0.17f, 0.07f };
      case "pulse-2": return new float[] { 0.34f, 0.68f, 0.16f, 0.07f };
      default:
        return name.EndsWith("-2")
          ? new float[] { 0.38f, 0.70f, 0.18f, 0.08f }
          : new float[] { 0.22f, 0.74f, 0.18f, 0.07f };
    }
  }

  static void DrawStorePlate(Graphics g, int x, int y, int w, int h, string code) {
    using (var tape = new SolidBrush(Color.FromArgb(250, 8, 8, 8)))
      g.FillRectangle(tape, x - 2, y - 2, w + 4, h + 4);
    int storeH = Math.Max(10, (int)(h * 0.26));
    int bandH = Math.Max(8, (int)(h * 0.18));
    using (var red = new SolidBrush(Color.FromArgb(196, 18, 32)))
    using (var blue = new SolidBrush(Color.FromArgb(0, 51, 153)))
    using (var white = new SolidBrush(Color.FromArgb(244, 246, 248)))
    using (var ink = new SolidBrush(Color.FromArgb(18, 22, 28)))
    using (var whiteT = new SolidBrush(Color.White))
    using (var center = new StringFormat()) {
      center.Alignment = StringAlignment.Center;
      center.LineAlignment = StringAlignment.Center;
      g.FillRectangle(red, x, y, w, storeH);
      g.FillRectangle(white, x, y + storeH, w, h - storeH);
      g.FillRectangle(blue, x, y + storeH, w, bandH);
      using (var storeFont = new Font("Arial", Math.Max(7, storeH * 0.48f), FontStyle.Bold, GraphicsUnit.Pixel))
      using (var bandFont = new Font("Arial", Math.Max(6, bandH * 0.42f), FontStyle.Bold, GraphicsUnit.Pixel))
      using (var codeFont = new Font("Arial", Math.Max(11, (h - storeH - bandH) * 0.55f), FontStyle.Bold, GraphicsUnit.Pixel)) {
        g.DrawString("BRASIL CARS", storeFont, whiteT, new RectangleF(x, y, w, storeH), center);
        g.DrawString("BR  BRASIL  MERCOSUL", bandFont, whiteT, new RectangleF(x, y + storeH, w, bandH), center);
        g.DrawString(code, codeFont, ink, new RectangleF(x, y + storeH + bandH, w, h - storeH - bandH), center);
      }
    }
  }

  static void DrawBanner(Bitmap canvas) {
    using (var g = Graphics.FromImage(canvas))
    using (var bar = new SolidBrush(Color.FromArgb(210, 12, 16, 24)))
    using (var red = new SolidBrush(Color.FromArgb(196, 18, 32)))
    using (var white = new SolidBrush(Color.White))
    using (var muted = new SolidBrush(Color.FromArgb(220, 220, 220)))
    using (var left = new StringFormat()) {
      g.SmoothingMode = SmoothingMode.AntiAlias;
      g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
      g.FillRectangle(bar, 0, 0, canvas.Width, 54);
      g.FillRectangle(red, 0, 54, canvas.Width, 4);
      left.Alignment = StringAlignment.Near;
      left.LineAlignment = StringAlignment.Center;
      using (var title = new Font("Arial", 22, FontStyle.Bold, GraphicsUnit.Pixel))
      using (var sub = new Font("Arial", 13, FontStyle.Bold, GraphicsUnit.Pixel)) {
        g.DrawString("BRASIL CARS", title, white, new RectangleF(24, 0, 420, 54), left);
        left.Alignment = StringAlignment.Far;
        g.DrawString("BLUMENAU / SC  ·  PATIO DA LOJA", sub, muted, new RectangleF(0, 0, canvas.Width - 24, 54), left);
      }
    }
  }

  static ImageCodecInfo GetJpegCodec() {
    foreach (var c in ImageCodecInfo.GetImageEncoders()) {
      if (c.MimeType == "image/jpeg") return c;
    }
    return null;
  }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[DealershipMontage]::Process($rawDir, $outDir, $lotPath, $showroomPath, $cutDir)
