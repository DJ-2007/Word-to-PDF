#!/usr/bin/env python3
"""
Convertly Python Conversion Service
Provides high-fidelity format conversions for PDF, DOCX, XLSX, PPTX, CSV, TXT, and Images.
Accepts JSON parameters via stdin or command line arguments, outputs structured JSON.
"""

import sys
import os
import json
import traceback

def log(msg):
    print(f"[CONVERT_SERVICE] {msg}", file=sys.stderr)

def handle_pdf_to_images(params):
    import fitz  # PyMuPDF
    input_path = params["input_path"]
    output_dir = params["output_dir"]
    fmt = params.get("format", "jpg").lower()
    dpi = int(params.get("dpi", 150))
    
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(input_path)
    page_count = len(doc)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    
    generated_files = []
    for page_idx in range(page_count):
        page = doc.load_page(page_idx)
        pix = page.get_pixmap(matrix=mat, alpha=False if fmt in ("jpg", "jpeg") else True)
        out_name = f"page_{page_idx + 1:03d}.{fmt}"
        out_full = os.path.join(output_dir, out_name)
        pix.save(out_full)
        generated_files.append({
            "page": page_idx + 1,
            "filename": out_name,
            "path": out_full,
            "size": os.path.getsize(out_full)
        })
    doc.close()
    return {"page_count": page_count, "files": generated_files}

def handle_pdf_to_docx(params):
    from pdf2docx import Converter
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv = Converter(input_path)
    cv.convert(output_path, start=0, end=None)
    cv.close()
    
    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise RuntimeError("PDF to DOCX conversion produced an empty or missing output file.")
        
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_pdf_to_text(params):
    import fitz
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    doc = fitz.open(input_path)
    full_text = []
    for idx, page in enumerate(doc):
        text = page.get_text("text")
        full_text.append(f"--- Page {idx + 1} ---\n" + text)
    doc.close()
    
    content = "\n\n".join(full_text)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_pdf_to_html(params):
    import fitz
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    doc = fitz.open(input_path)
    html_parts = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'>",
        "<title>Converted PDF Document</title>",
        "<style>",
        "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px auto; max-width: 860px; line-height: 1.6; color: #1e293b; background: #f8fafc; }",
        ".page-card { background: #ffffff; padding: 48px; margin-bottom: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }",
        ".page-num { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; font-weight: 600; }",
        "p { margin-bottom: 1em; white-space: pre-wrap; }",
        "</style></head><body>"
    ]
    
    for idx, page in enumerate(doc):
        page_html = page.get_text("html")
        html_parts.append(f"<div class='page-card'><div class='page-num'>Page {idx + 1}</div>{page_html}</div>")
    doc.close()
    
    html_parts.append("</body></html>")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(html_parts))
        
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_pdf_compress(params):
    import fitz
    input_path = params["input_path"]
    output_path = params["output_path"]
    level = params.get("level", "medium")
    
    initial_size = os.path.getsize(input_path)
    doc = fitz.open(input_path)
    
    # Garbage collection levels
    # deflate=True compresses stream objects
    garbage_level = 4 if level in ("medium", "high") else 2
    doc.save(
        output_path,
        garbage=garbage_level,
        deflate=True,
        clean=True,
        deflate_images=True if level == "high" else False,
        deflate_fonts=True
    )
    doc.close()
    
    final_size = os.path.getsize(output_path)
    # If final size did not reduce (rare case where original was already highly packed), copy original
    if final_size > initial_size:
        import shutil
        shutil.copyfile(input_path, output_path)
        final_size = initial_size
        
    reduction_pct = round(((initial_size - final_size) / initial_size) * 100, 1) if initial_size > 0 else 0
    return {
        "output_path": output_path,
        "original_size": initial_size,
        "compressed_size": final_size,
        "reduction_percentage": reduction_pct
    }

def handle_txt_to_pdf(params):
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
        
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    normal_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e293b')
    )
    
    story = []
    lines = text.split("\n")
    for line in lines:
        sanitized = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        if not sanitized.strip():
            story.append(Spacer(1, 8))
        else:
            story.append(Paragraph(sanitized, normal_style))
            
    doc.build(story)
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_csv_to_pdf(params):
    import csv
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    rows = []
    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        for r in reader:
            rows.append(r)
            if len(rows) > 500: # safety limit for PDF table
                break
                
    if not rows:
        rows = [["(Empty CSV)"]]
        
    styles = getSampleStyleSheet()
    table_data = []
    for r_idx, row in enumerate(rows):
        formatted_row = []
        for cell in row:
            p_style = styles['Heading4'] if r_idx == 0 else styles['Normal']
            formatted_row.append(Paragraph(cell.replace("<", "&lt;").replace(">", "&gt;"), p_style))
        table_data.append(formatted_row)
        
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=30,
        rightMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    
    t = Table(table_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4f46e5')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    
    doc.build([t])
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_markdown_to_pdf(params):
    from markdown_it import MarkdownIt
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        md_text = f.read()
        
    doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=45, rightMargin=45, topMargin=45, bottomMargin=45)
    styles = getSampleStyleSheet()
    
    h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#1e1b4b'), spaceAfter=12)
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=15, leading=19, textColor=colors.HexColor('#312e81'), spaceAfter=8)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#1e293b'), spaceAfter=6)
    
    story = []
    lines = md_text.split("\n")
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("# "):
            story.append(Paragraph(stripped[2:], h1_style))
        elif stripped.startswith("## "):
            story.append(Paragraph(stripped[3:], h2_style))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            story.append(Paragraph(f"&bull; {stripped[2:]}", body_style))
        elif not stripped:
            story.append(Spacer(1, 6))
        else:
            story.append(Paragraph(stripped, body_style))
            
    doc.build(story)
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_docx_to_pdf(params):
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    # Parse DOCX structure with python-docx and build clean PDF via reportlab
    import docx
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    
    d = docx.Document(input_path)
    pdf_doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=45, rightMargin=45, topMargin=45, bottomMargin=45)
    styles = getSampleStyleSheet()
    
    story = []
    for p in d.paragraphs:
        text = p.text.strip()
        if not text:
            story.append(Spacer(1, 6))
            continue
        p_style = styles['Heading1'] if p.style.name.startswith('Heading 1') else styles['Normal']
        story.append(Paragraph(text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), p_style))
        
    pdf_doc.build(story if story else [Paragraph("Empty Document", styles['Normal'])])
    return {"output_path": output_path, "size": os.path.getsize(output_path), "engine": "python_docx_reportlab"}

def handle_pptx_to_pdf(params):
    from pptx import Presentation
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    prs = Presentation(input_path)
    pdf_doc = SimpleDocTemplate(output_path, pagesize=landscape(letter), leftMargin=50, rightMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
    slide_title_style = ParagraphStyle('SlideTitle', parent=styles['Heading1'], fontSize=22, leading=26, textColor=colors.HexColor('#312e81'), spaceAfter=14)
    body_style = ParagraphStyle('SlideBody', parent=styles['Normal'], fontSize=12, leading=16, textColor=colors.HexColor('#1e293b'), spaceAfter=8)
    
    story = []
    for idx, slide in enumerate(prs.slides):
        story.append(Paragraph(f"Slide {idx + 1}", styles['Italic']))
        story.append(Spacer(1, 10))
        for shape in slide.shapes:
            if shape.has_text_frame:
                for paragraph in shape.text_frame.paragraphs:
                    txt = paragraph.text.strip()
                    if txt:
                        story.append(Paragraph(txt.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), body_style))
        if idx < len(prs.slides) - 1:
            story.append(PageBreak())
            
    pdf_doc.build(story if story else [Paragraph("Empty Presentation", styles['Normal'])])
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

def handle_xlsx_to_pdf(params):
    import openpyxl
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    
    input_path = params["input_path"]
    output_path = params["output_path"]
    
    wb = openpyxl.load_workbook(input_path, data_only=True)
    sheet = wb.active
    
    table_data = []
    styles = getSampleStyleSheet()
    for r_idx, row in enumerate(sheet.iter_rows(values_only=True)):
        if r_idx > 300: break
        formatted_row = []
        for val in row:
            txt = "" if val is None else str(val)
            p_style = styles['Heading4'] if r_idx == 0 else styles['Normal']
            formatted_row.append(Paragraph(txt.replace("<", "&lt;").replace(">", "&gt;"), p_style))
        table_data.append(formatted_row)
        
    wb.close()
    if not table_data:
        table_data = [[Paragraph("Empty Sheet", styles['Normal'])]]
        
    doc = SimpleDocTemplate(output_path, pagesize=landscape(letter), leftMargin=30, rightMargin=30, topMargin=30, bottomMargin=30)
    t = Table(table_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#059669')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    doc.build([t])
    return {"output_path": output_path, "size": os.path.getsize(output_path)}

ACTIONS = {
    "pdf_to_images": handle_pdf_to_images,
    "pdf_to_docx": handle_pdf_to_docx,
    "pdf_to_text": handle_pdf_to_text,
    "pdf_to_html": handle_pdf_to_html,
    "pdf_compress": handle_pdf_compress,
    "txt_to_pdf": handle_txt_to_pdf,
    "csv_to_pdf": handle_csv_to_pdf,
    "markdown_to_pdf": handle_markdown_to_pdf,
    "docx_to_pdf": handle_docx_to_pdf,
    "pptx_to_pdf": handle_pptx_to_pdf,
    "xlsx_to_pdf": handle_xlsx_to_pdf,
}

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"success": False, "error": "No input JSON received"}))
            return
            
        data = json.loads(raw_input)
        action = data.get("action")
        params = data.get("params", {})
        
        if action not in ACTIONS:
            print(json.dumps({"success": False, "error": f"Unknown action: {action}"}))
            return
            
        handler = ACTIONS[action]
        result = handler(params)
        print(json.dumps({"success": True, "result": result}))
    except Exception as e:
        log(f"Error: {e}\n{traceback.format_exc()}")
        print(json.dumps({"success": False, "error": str(e), "trace": traceback.format_exc()}))

if __name__ == "__main__":
    main()
