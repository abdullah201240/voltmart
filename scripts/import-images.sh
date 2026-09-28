#!/bin/zsh
# Import generated product images into public/products as optimized JPEGs
set -e
SRC="$HOME/.qoder/vibe_images"
DST="/Users/abdullahalsakib/Documents/my/ecom/client/public/products"
mkdir -p "$DST"
ids=(iphone-15-pro galaxy-s24-ultra pixel-8 oneplus-12 nothing-phone-2a ipad-air macbook-pro-14 dell-xps-13 asus-rog-strix lenovo-thinkpad hp-spectre acer-predator lg-oled-c4 samsung-neo-qled xiaomi-smart-tv sony-wh-1000xm5 jbl-flip-6 samsung-galaxy-buds3 sony-ps5 logitech-g-pro dell-g27-monitor apple-watch-9 sony-a7iv anker-charger)
for id in $ids; do
  f=$(ls "$SRC"/${id}_*.png | tail -1)
  sips -s format jpeg -s formatOptions 78 --resampleWidth 800 "$f" --out "$DST/$id.jpg" > /dev/null
  echo "ok $id <- $(basename "$f")"
done
du -sh "$DST"
