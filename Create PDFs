import os
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
margin_x = 1.0 * cm
margin_y = 1.5 * cm          # Top/Bottom margin
spacing = 1.0 * cm           # Vertical spacing between cards

# --- Clue Data ---
clues = [
    {
        "title": "Secret Mission",
        "qr": "clue_01_qr.png",
        "puzzle_image": None,
        "text": ""
    },
    {
        "title": "A Private Conversation",
        "qr": "clue_02_qr.png",
        "puzzle_image": None,
        "text": "'You're the best!'"
    },
    {
        "title": "Logic Puzzle",
        "qr": "clue_03_qr.png",
        "puzzle_image": "Logic puzzle.png", 
        "text": ""
    },
    {
        "title": "Clue 4: C.U.P.",
        "qr": "clue_04_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 4 here..."
    },
    {
        "title": "Clue 5: Tall or Small",
        "qr": "clue_05_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 5 here..."
    },
    {
        "title": "Clue 6: Getting Thirsty?",
        "qr": "clue_06_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 6 here..."
    },
    {
        "title": "Clue 7: Hmmm?",
        "qr": "clue_07_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 7 here..."
    },
    {
        "title": "Clue 8: Candid Cousin",
        "qr": "clue_08_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 8 here..."
    },
    {
        "title": "Clue 9: Pee-ew",
        "qr": "clue_09_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 9 here..."
    },
    {
        "title": "Clue 10: The End",
        "qr": "clue_10_qr.png",
        "puzzle_image": None, 
        "text": "Type your puzzle text for Clue 10 here..."
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

def create_pdf():
    c = canvas.Canvas(output_filename, pagesize=A4)
    width, height = A4
    
    # Grid setup (Calculates how many fit horizontally)
    # A4 width (21cm) - 2cm margins = 19cm.
    # Card (10cm). Only 1 fits per row.
    cols = int((width - margin_x*2) // (card_width + spacing))
    if cols < 1: cols = 1 # Safety default
    
    rows = int((height - margin_y*2) // (card_height + spacing))
    
    x_offset = margin_x
    y_offset = height - margin_y - card_height
    count_on_page = 0
    
    for i, clue in enumerate(clues):
        # 1. Draw Card Border
        c.setLineWidth(1)
        c.setStrokeColorRGB(0, 0, 0)
        c.rect(x_offset, y_offset, card_width, card_height)
        
        # 2. Draw Title
        title_y = y_offset + card_height - 1.5*cm
        c.setFont("Courier-Bold", 14)
        c.drawString(x_offset + 0.5*cm, title_y, clue["title"])
        
        # Divider Line
        line_y = title_y - 0.3*cm
        c.line(x_offset + 0.5*cm, line_y, x_offset + card_width - 0.5*cm, line_y)
        
        # 3. Define Content Area
        # ADJUSTED: Started content lower (0.8cm below title) to avoid line overlap
        content_top = title_y - 1.0*cm 
        content_bottom = y_offset + 0.25*cm + qr_size
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
                
                img_x = x_offset + 0.5*cm + (content_width - draw_w) / 2
                img_y = content_bottom + (content_height - draw_h) / 2
                
                c.drawImage(img_path, img_x, img_y, width=draw_w, height=draw_h)
            else:
                c.setFont("Helvetica", 10)
                c.drawString(x_offset + 0.5*cm, y_offset + card_height/2, f"Missing: {puzzle_img_name}")
        else:
            # Fallback to text
            draw_wrapped_text(c, clue.get("text", ""), x_offset + 0.5*cm, content_top, content_width)

        # 5. Draw QR Code (Bottom Right)
        qr_path = os.path.join(qr_folder, clue["qr"])
        if os.path.exists(qr_path):
            c.drawImage(qr_path, 
                        x_offset + card_width - qr_size - 0.25*cm, 
                        y_offset + 0.25*cm, 
                        width=qr_size, height=qr_size)
            
        # 6. Pagination & Wrapping Logic
        count_on_page += 1
        
        # Move to next position
        x_offset += card_width + spacing
        
        # Check if we need to wrap to next line
        if x_offset + card_width > width - margin_x:
            x_offset = margin_x
            y_offset -= (card_height + spacing)
            
        # Check if we need a new page
        # If the next card would fall below the bottom margin
        if y_offset < margin_y:
            if i < len(clues) - 1: # Only new page if there are more clues
                c.showPage()
                x_offset = margin_x
                y_offset = height - margin_y - card_height
                count_on_page = 0

    c.save()
    print(f"Generated {output_filename}")

if __name__ == "__main__":
    create_pdf()
