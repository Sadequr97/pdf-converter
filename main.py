from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2docx import Converter
import os
import shutil
import uuid

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity in this demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("index.html", "r") as f:
        return f.read()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/convert")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    # Generate unique filenames
    file_id = str(uuid.uuid4())
    pdf_filename = f"{file_id}.pdf"
    docx_filename = f"{file_id}.docx"
    pdf_path = os.path.join(UPLOAD_DIR, pdf_filename)
    docx_path = os.path.join(UPLOAD_DIR, docx_filename)

    try:
        # Save uploaded file
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert PDF to DOCX
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()

        return FileResponse(
            docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{os.path.splitext(file.filename)[0]}.docx"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

    finally:
        # Clean up files (optional: can be done in a background task)
        # For now, we keep them for debugging or delete them immediately after response?
        # Since FileResponse runs after this function returns, we can't delete immediately here easily without a background task.
        # For simplicity, we'll leave them or use a background task if needed.
        # Let's add a simple cleanup for the PDF at least.
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
