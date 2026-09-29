#!/bin/zsh
# Import generated category images into public/categories as optimized JPEGs
set -e
SRC="$HOME/.qoder/vibe_images"
DST="/Users/abdullahalsakib/Documents/my/ecom/client/public/categories"
mkdir -p "$DST"
slugs=(mobiles laptops tablets computers tv-audio gaming cameras smart-devices accessories home-appliances)
for s in $slugs; do
  f=$(ls "$SRC"/cat-${s}_*.png | tail -1)
  sips -s format jpeg -s formatOptions 78 --resampleWidth 640 "$f" --out "$DST/$s.jpg" > /dev/null
  echo "ok $s <- $(basename "$f")"
done
du -sh "$DST"
