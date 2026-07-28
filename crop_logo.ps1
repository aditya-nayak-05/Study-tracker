Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\adity\.gemini\antigravity\brain\16260f51-2503-4656-bcb5-b049d28963bd\media__1785245042570.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

$w = $bmp.Width
$h = $bmp.Height

# Find bounding box of the non-background circular emblem
$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

# Sample pixels to find circle bounds
for ($y = 0; $y -lt $h; $y += 2) {
    for ($x = 0; $x -lt $w; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        # Check if color is not neutral grey background (grey bg has R~=G~=B in range 80..150)
        # The rainbow ring around the logo has vibrant neon colors or high contrast
        $isBg = ($c.R -gt 70 -and $c.R -lt 140 -and [Math]::Abs($c.R - $c.G) -lt 15 -and [Math]::Abs($c.G - $c.B) -lt 15)
        if (-not $isBg) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Detected bounds: X=$minX..$maxX, Y=$minY..$maxY"

# Ensure bounding box is square and valid
$cropW = $maxX - $minX
$cropH = $maxY - $minY
$side = [Math]::Max($cropW, $cropH)

# Center crop
$centerX = [int]($minX + $cropW / 2)
$centerY = [int]($minY + $cropH / 2)
$cropX = [Math]::Max(0, [int]($centerX - $side / 2))
$cropY = [Math]::Max(0, [int]($centerY - $side / 2))
$side = [Math]::Min($side, [Math]::Min($w - $cropX, $h - $cropY))

Write-Host "Cropping rect: X=$cropX, Y=$cropY, Side=$side"

# Create cropped image
$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $side, $side)
$croppedBmp = $bmp.Clone($rect, $bmp.PixelFormat)

# Make transparent outside circle
$finalBmp = New-Object System.Drawing.Bitmap($side, $side, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($finalBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $side, $side)
$g.SetClip($path)
$g.DrawImage($croppedBmp, 0, 0)

# Save to logo targets
$dst1 = "a:\DS\public\logo.png"
$dst2 = "a:\DS\src\assets\logo.png"

$finalBmp.Save($dst1, [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Save($dst2, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$croppedBmp.Dispose()
$bmp.Dispose()
$finalBmp.Dispose()

Write-Host "Successfully cropped and saved circular logo!"
