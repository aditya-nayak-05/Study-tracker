Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\adity\.gemini\antigravity\brain\16260f51-2503-4656-bcb5-b049d28963bd\media__1785247679907.jpg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

$w = $bmp.Width
$h = $bmp.Height
$side = [Math]::Min($w, $h)

# Create 32-bit ARGB PNG with smooth circular clip
$finalBmp = New-Object System.Drawing.Bitmap($side, $side, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($finalBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Circular path
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $side, $side)
$g.SetClip($path)

# Draw original image
$g.DrawImage($bmp, 0, 0, $side, $side)

# Save to public and assets
$dst1 = "a:\DS\public\logo.png"
$dst2 = "a:\DS\src\assets\logo.png"

$finalBmp.Save($dst1, [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Save($dst2, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$finalBmp.Dispose()

Write-Host "New logo processed, clipped to transparent circle, and saved to public & assets!"
