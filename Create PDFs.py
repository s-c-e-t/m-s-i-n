import os
import math
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import cm

# --- Configuration ---
output_filename = "clue_cards.pdf"
qr_folder = "QR Codes"       # Folder containing QR codes
images_folder = "puzzles"    # Folder containing puzzle images
card_width = 10 * cm
card_height = 10 * cm
qr_size = 2.5 * cm
margin_x = 1.0 * cm          # Minimum margin
margin_y = 1.0 * cm          # Minimum margin
spacing = 1.0 * cm           # Vertical/Horizontal spacing between cards

DOUBLE_SIDED = True          # If True, generates back pages with letters
BACK_FONT_SIZE = 72          # Font size for the letter on the back

# --- Clue Data ---
clues = [
    {
        "title": "Secret Mission",
        "qr": "clue_01_qr.png",
        "puzzle_image": None,
        "text": "ALEX!\n \
                 You've been selected for a very important mission. A great reward awaits you, should you succeed.\n \
                 There are others here that will help you, but they know less than you so don't expect much.\n \
                 Now, didn't Grandma ask you to do something...",
        "back_text": "C",
        "note": "on door to crawl space"
    },
    {
        "title": "A Private Conversation",
        "qr": "clue_02_qr.png",
        "puzzle_image": None,
        "text": "Oh look, another one of these things.\n \
                Now, when you get upstairs exclaim that you've brought up this chair and listen closely for\n \
                'You're the best!'",
        "back_text": "U",
        "note": "in crawl space, on chair"
    },
    {
        "title": "I Can't see yoU",
        "qr": "clue_03_qr.png",
        "puzzle_image": None,
        "text": "Did you notice, there's something on the back of these...\n \
                \n \
                \n \
                \n \
                \n \
                \n \
                If you haven't tried it yet, you can scan the QR code to get help.",
        "back_text": "P",
        "note": "in Susan's pocket"
    },
    {
        "title": "Logic Puzzle",
        "qr": "clue_04_qr.png",
        "puzzle_image": "Logic puzzle.png",
        "text": "",
        "back_text": "D",
        "note": "in a bathroom mirror"
    },
    {
        "title": "Clue 5: Tall or Small",
        "qr": "clue_05_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 5 here...",
        "back_text": "E",
        "note": "under Alex's dinner plate"
    },
    {
        "title": "Clue 6: Getting Thirsty?",
        "qr": "clue_06_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 6 here...",
        "back_text": "F",
        "note": "in Jacob's pocket"
    },
    {
        "title": "Clue 7: Hmmm?",
        "qr": "clue_07_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 7 here...",
        "back_text": "G",
        "note": "in the drink's cabinet"
    },
    {
        "title": "Clue 8: Candid Cousin",
        "qr": "clue_08_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 8 here...",
        "back_text": "H",
        "note": "upstairs living room, under a cushion?"
    },
    {
        "title": "Clue 9: Pee-ew",
        "qr": "clue_09_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 9 here...",
        "back_text": "I",
        "note": "in Kate's pocket"
    },
    {
        "title": "Clue 10: The End",
        "qr": "clue_10_qr.png",
        "puzzle_image": None,
        "text": "Type your puzzle text for Clue 10 here...",
        "back_text": "J",
        "note": "in Benjamin's diaper... bag"
    }
]

def draw_wrapped_text(c, text, x_text_start_abs, y_text_start_abs, overall_content_width, qr_abs_bbox=None):
    """Helper to draw wrapped text, handling newlines and wrapping around a QR code."""
    text_object = c.beginText(x_text_start_abs, y_text_start_abs)
    font_name = "Courier"
    font_size = 12
    text_object.setFont(font_name, font_size)

    # Approximate line height including leading (ReportLab default leading is typically 1.2 * font_size)
    line_height = font_size * 1.2

    paragraphs = text.split('\n')

    qr_left, qr_bottom, qr_width, qr_height = (0,0,0,0)
    qr_top = 0
    qr_present = False
    if qr_abs_bbox:
        qr_left, qr_bottom, qr_width, qr_height = qr_abs_bbox
        qr_top = qr_bottom + qr_height
        qr_present = True

    for para_idx, para in enumerate(paragraphs):
        words = para.split()
        line = ""
        for word in words:
            current_y_baseline = text_object.getY() # Get current Y baseline before drawing this line

            effective_max_width = overall_content_width
            if qr_present:
                # Check for vertical overlap of the current line with the QR code.
                # A line drawing from current_y_baseline occupies space roughly from (current_y_baseline - line_height) to current_y_baseline.
                line_bottom_y = current_y_baseline - line_height
                line_top_y = current_y_baseline # Simplistic, could be current_y_baseline + font_ascender

                # If the line's vertical span overlaps with the QR's vertical span
                # (line_bottom < qr_top) AND (line_top > qr_bottom)
                if (line_bottom_y < qr_top) and (line_top_y > qr_bottom):
                    # If text starts left of QR and would extend into it horizontally
                    if x_text_start_abs < qr_left: # Text is expected to be on the left of the QR code
                        # Calculate the maximum width available before hitting the QR code
                        available_width_left_of_qr = qr_left - x_text_start_abs - 0.2*cm # Small buffer
                        effective_max_width = min(overall_content_width, available_width_left_of_qr)
                        effective_max_width = max(0.1*cm, effective_max_width) # Ensure minimum width to avoid issues

            if c.stringWidth(line + word + " ", font_name, font_size) < effective_max_width:
                line += word + " "
            else:
                text_object.textLine(line.strip())
                line = word + " " # Start new line with current word

        text_object.textLine(line.strip()) # Draw the last line of the paragraph

        # Add a small gap between paragraphs if there are multiple
        if para_idx < len(paragraphs) - 1:
             text_object.textLine("") # This will move Y down by leading, creating a gap.
    c.drawText(text_object)

def render_card_content(c, clue, x, y):
    """Draws the content of a single card at position x, y."""
    # 1. Draw Card Border
    c.setLineWidth(1)
    c.setStrokeColorRGB(0, 0, 0)
    c.rect(x, y, card_width, card_height)

    # 2. Draw Title
    title_y = y + card_height - 0.75*cm
    c.setFont("Courier-Bold", 14)
    c.drawString(x + 0.5*cm, title_y, clue["title"])

    # Divider Line
    line_y = title_y - 0.3*cm
    c.line(x + 0.5*cm, line_y, x + card_width - 0.5*cm, line_y)

    # 3. Define Overall Content Area for text/image
    content_top = title_y - 0.5*cm
    content_width_for_text_image = card_width - 1*cm

    # Initialize QR bounding box information - calculated early for text wrapping
    qr_abs_bbox = None
    qr_path = os.path.join(qr_folder, clue["qr"])
    if os.path.exists(qr_path):
        # Calculate absolute QR bounding box coordinates
        qr_abs_left = x + card_width - qr_size - 0.25*cm
        qr_abs_bottom = y + 0.25*cm
        qr_abs_width = qr_size
        qr_abs_height = qr_size
        qr_abs_bbox = (qr_abs_left, qr_abs_bottom, qr_abs_width, qr_abs_height)

    # 4. Draw Content (Image or Text)
    puzzle_img_name = clue.get("puzzle_image")

    if puzzle_img_name:
        # For images, they take up the full available space, QR code can be on top.
        visual_content_bottom = y + 0.25*cm # Standard minimum bottom margin
        visual_content_height = content_top - visual_content_bottom

        img_path = os.path.join(images_folder, puzzle_img_name)
        if os.path.exists(img_path):
            img = ImageReader(img_path)
            iw, ih = img.getSize()
            aspect = iw / ih

            draw_w = content_width_for_text_image
            draw_h = draw_w / aspect

            if draw_h > visual_content_height: # Use the full height
                draw_h = visual_content_height
                draw_w = draw_h * aspect

            img_x = x + 0.5*cm + (content_width_for_text_image - draw_w) / 2
            img_y = visual_content_bottom + (visual_content_height - draw_h) / 2 # Use full bottom/height

            c.drawImage(img_path, img_x, img_y, width=draw_w, height=draw_h)
        else:
            c.setFont("Helvetica", 10)
            c.drawString(x + 0.5*cm, y + card_height/2, f"Missing: {puzzle_img_name}")
    else:
        # For text, calculate content area considering QR code if present.
        text_content_bottom = y + 0.25*cm # Minimum bottom margin
        if qr_abs_bbox:
            # If QR is present, ensure text does not overlap it
            # Add a small buffer above the QR code for clarity
            text_content_bottom = max(text_content_bottom, qr_abs_bottom + qr_abs_height + 0.25*cm)

        # The actual y for the text_object's initial drawing is `content_top - 0.5*cm`.
        # `draw_wrapped_text` will handle wrapping around the QR code below this point.
        draw_wrapped_text(c, clue.get("text", ""), x + 0.5*cm, content_top - 0.5*cm, content_width_for_text_image, qr_abs_bbox)

    # 5. Draw QR Code (Bottom Right) - Drawn last to ensure it's on top of other content
    if qr_abs_bbox:
        c.drawImage(qr_path,
                    qr_abs_bbox[0],
                    qr_abs_bbox[1],
                    width=qr_abs_bbox[2], height=qr_abs_bbox[3]
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

    for i in range(0, len(clues), cards_per_page):
        batch = clues[i : i + cards_per_page]

        batch_count = len(batch)
        actual_rows = math.ceil(batch_count / cols)

        # Total height of the actual content
        # Account for potential note height above cards
        note_line_height = 0.5 * cm # Approximate height for the note
        additional_height_for_notes = note_line_height if any(clue.get("note", "") for clue in batch) else 0

        grid_height = actual_rows * (card_height + additional_height_for_notes) + (actual_rows - 1) * spacing

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

            # Draw the note above the card
            note_text = clue.get("note")
            if note_text:
                c.setFont("Helvetica-Oblique", 9)
                c.setFillColorRGB(0.5, 0.5, 0.5) # Gray color for notes
                c.drawString(x + 0.5*cm, y + card_height + 0.2*cm, f"Setup Note: {note_text}")
                c.setFillColorRGB(0, 0, 0) # Reset color to black for card content

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
