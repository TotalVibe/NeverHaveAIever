from PIL import Image
import os
import shutil

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
IMAGES_DIR = os.path.join(ROOT, 'images')
BACKUP_DIR = os.path.join(ROOT, 'images_backup')
MAX_DIM = 800  # max width/height in px (displayed max ~520px, so this is ~1.5x retina)

os.makedirs(BACKUP_DIR, exist_ok=True)

total_before = 0
total_after = 0
results = []

for f in sorted(os.listdir(IMAGES_DIR)):
    if not f.lower().endswith(('.png', '.jpg', '.jpeg')):
        continue

    src = os.path.join(IMAGES_DIR, f)
    backup = os.path.join(BACKUP_DIR, f)

    # Backup original if not already backed up
    if not os.path.exists(backup):
        shutil.copy2(src, backup)

    im = Image.open(src)
    orig_size = os.path.getsize(src)
    total_before += orig_size

    # Resize if larger than MAX_DIM (keep .png extension so HTML/JS refs don't break)
    if max(im.size) > MAX_DIM:
        im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)

    # Save optimized PNG in-place (same filename/extension)
    im.save(src, 'PNG', optimize=True, compress_level=9)
    final_size = os.path.getsize(src)
    total_after += final_size
    savings = (1 - final_size / orig_size) * 100
    results.append((f, orig_size, final_size, savings, 'PNG', im.size))

print(f"{'File':<20} {'Before':>10} {'After':>10} {'Save':>7}  Format  Size")
print("-" * 65)
for name, before, after, save, fmt, size in results:
    print(f"{name:<20} {before/1024/1024:>8.2f}MB {after/1024/1024:>8.2f}MB {save:>6.1f}%   {fmt:<6} {size}")

print("-" * 65)
print(f"{'TOTAL':<20} {total_before/1024/1024:>8.2f}MB {total_after/1024/1024:>8.2f}MB {(1-total_after/total_before)*100:>6.1f}%")
print(f"\nBackups saved in ./{BACKUP_DIR}/")