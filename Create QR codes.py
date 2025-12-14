import qrcode
from pathlib import Path

# Define output directory
output_dir = Path("QR Codes")
output_dir.mkdir(parents=True, exist_ok=True)

base_url = "https://s-c-e-t.github.io/m-s-i-n/clues/"

for i in range(1, 11):
    file_name = f"clue_{i:02d}.html"
    full_url = f"{base_url}{file_name}"
    
    # ERROR_CORRECT_H allows ~30% of the code to be damaged/covered and still scan
    qr = qrcode.QRCode(
        version=None,  # Auto-determine smallest size possible
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=0
    )
    qr.add_data(full_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    save_path = output_dir / f"clue_{i:02d}_qr.png"
    img.save(save_path)
    
    print(f"Saved {save_path} (High Error Correction)")