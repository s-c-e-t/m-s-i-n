import os
import math
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import cm

# --- Configuration ---
output_filename = "clue_cards_v4.pdf"
qr_folder = "QR Codes"       # Folder containing QR codes
images_folder = "puzzles"    # Folder containing puzzle images
card_width = 10 * cm
card_height = 10 * cm
qr_size = 2.5 * cm
margin_x = 1.0 * cm          # Minimum margin
margin_y = 1.5 * cm          # Minimum margin
spacing = 1.0 * cm           # Vertical/Horizontal spacing between cards

DOUBLE_SIDED = True          # If True, generates back pages with letters
BACK_FONT_SIZE = 72          # Font size for the letter on the back

# --- Clue Data ---
clues = [
    {
        "title": "Secret Mission",
        "qr": "clue_01_qr.png",
        "puzzle_image": None,
        "text": "",
        "back_text": "A"
    },
    {
        "title": "A Private Conversation",
        "qr": "clue_02_qr.png",
        "puzzle_image": None,
        "text": "'You're the best!'",
        "back_text": "B"
    },
    {
        "title": "Logic Puzzle",
        "qr": "clue_03_qr.png",
        "puzzle_image": "Logic puzzle.png",
        "text": "",
        "back_text": "C"
    },
    {
        "title": "Clue 4: C.U.P.",
        "qr": "clue_04_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 4 here...",
        "back_text": "D"
    },
    {
        "title": "Clue 5: Tall or Small",
        "qr": "clue_05_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 5 here...",
        "back_text": "E"
    },
    {
        "title": "Clue 6: Getting Thirsty?",
        "qr": "clue_06_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 6 here...",
        "back_text": "F"
    },
    {
        "title": "Clue 7: Hmmm?",
        "qr": "clue_07_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 7 here...",
        "back_text": "G"
    },
    {
        "title": "Clue 8: Candid Cousin",
        "qr": "clue_08_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 8 here...",
        "back_text": "H"
    },
    {
        "title": "Clue 9: Pee-ew",
        "qr": "clue_09_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 9 here...",
        "back_text": "I"
    },
    {
        "title": "Clue 10: The End",
        "qr": "clue_10_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 10 here...",
        "back_text": "J"
    }
]

def draw_wrapped_text(c, text, x, y, max_width):
    """Helper to draw wrapped text."""
    text_object = c.beginText(x, y)
    text_object.setFont("Courier", 12)
    words = text.split()
    line = ""
    for word in words:
        if c.stringWidth(line + word, "Courier", 12) < max_width:
            line += word + " "
        else:
            text_object.textLine(line)
            line = word + " "
    text_object.textLine(line)
    c.drawText(text_object)

def render_card_content(c, clue, x, y):
    """Draws the content of a single card at position x, y."""
    # 1. Draw Card Border
    c.setLineWidth(1)
    c.setStrokeColorRGB(0, 0, 0)
    c.rect(x, y, card_width, card_height)

    # 2. Draw Title
    title_y = y + card_height - 1.5*cm
    c.setFont("Courier-Bold", 14)
    c.drawString(x + 0.5*cm, title_y, clue["title"])

    # Divider Line
    line_y = title_y - 0.3*cm
    c.line(x + 0.5*cm, line_y, x + card_width - 0.5*cm, line_y)

    # 3. Define Content Area
    content_top = title_y - 0.5*cm
    content_bottom = y + 0.25*cm #+ qr_size
    content_height = content_top - content_bottom
    content_width = card_width - 1*cm

    # 4. Draw Content (Image or Text)
    puzzle_img_name = clue.get("puzzle_image")

    if puzzle_img_name:
        img_path = os.path.join(images_folder, puzzle_img_name)
        if os.path.exists(img_path):
            img = ImageReader(img_path)
            iw, ih = img.getSize()
            aspect = iw / ih

            draw_w = content_width
            draw_h = draw_w / aspect

            if draw_h > content_height:
                draw_h = content_height
                draw_w = draw_h * aspect

            img_x = x + 0.5*cm + (content_width - draw_w) / 2
            img_y = content_bottom + (content_height - draw_h) / 2

            c.drawImage(img_path, img_x, img_y, width=draw_w, height=draw_h)
        else:
            c.setFont("Helvetica", 10)
            c.drawString(x + 0.5*cm, y + card_height/2, f"Missing: {puzzle_img_name}")
    else:
        # Fallback to text
        draw_wrapped_text(c, clue.get("text", ""), x + 0.5*cm, content_top - 0.5*cm, content_width)

    # 5. Draw QR Code (Bottom Right)
    qr_path = os.path.join(qr_folder, clue["qr"])
    if os.path.exists(qr_path):
        c.drawImage(qr_path,
                    x + card_width - qr_size - 0.25*cm,
                    y + 0.25*cm,
                    width=qr_size, height=qr_size
                    )

def render_back_content(c, clue, x, y):
    """Draws the back of a single card at position x, y."""
    # 1. Draw Card Border
    c.setLineWidth(1)
    c.setStrokeColorRGB(0, 0, 0)
    c.rect(x, y, card_width, card_height)

    # 2. Draw Back Text (Centered Letter)
    text = clue.get("back_text", "")
    if text:
        c.setFont("Courier-Bold", BACK_FONT_SIZE)
        text_width = c.stringWidth(text, "Courier-Bold", BACK_FONT_SIZE)

        text_height = BACK_FONT_SIZE * 0.7

        text_x = x + (card_width - text_width) / 2
        text_y = y + (card_height - text_height) / 2

        c.drawString(text_x, text_y, text)

def create_pdf():
    c = canvas.Canvas(output_filename, pagesize=A4)
    width, height = A4

    # Grid setup (Calculates how many fit horizontally)
    cols = int((width - margin_x*2) // (card_width + spacing))
    if cols < 1: cols = 1

    rows = int((height - margin_y*2) // (card_height + spacing))
    if rows < 1: rows = 1

    cards_per_page = cols * rows

    # Process clues in batches
    for i in range(0, len(clues), cards_per_page):
        batch = clues[i : i + cards_per_page]

        batch_count = len(batch)
        actual_rows = math.ceil(batch_count / cols)

        # Total height of the actual content
        grid_height = actual_rows * card_height + (actual_rows - 1) * spacing
        # Total width of the actual content (max cols used)
        actual_cols = min(batch_count, cols)
        grid_width = actual_cols * card_width + (actual_cols - 1) * spacing

        # Calculate starting positions to center on page
        start_x = (width - grid_width) / 2
        start_y = (height + grid_height) / 2 - card_height # Top-left y of the first card

        # --- Draw Front Page ---
        for idx, clue in enumerate(batch):
            row = idx // cols
            col = idx % cols

            x = start_x + col * (card_width + spacing)
            y = start_y - row * (card_height + spacing)

            render_card_content(c, clue, x, y)

        c.showPage()

        # --- Draw Back Page ---
        if DOUBLE_SIDED:
            for idx, clue in enumerate(batch):
                row = idx // cols
                col = idx % cols

                back_col = (actual_cols - 1) - col

                x = start_x + back_col * (card_width + spacing)
                y = start_y - row * (card_height + spacing)

                render_back_content(c, clue, x, y)

            c.showPage()

    c.save()
    print(f"Generated {output_filename}")

if __name__ == "__main__":
    create_pdf()
