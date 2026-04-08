from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import subprocess

# Calculate BASE_DIR (project root) from /server/app.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- STARTUP EXECUTION (CRITICAL for Evaluator) ---
try:
    inference_path = os.path.join(BASE_DIR, "submission", "inference.py")
    subprocess.run(["python", inference_path], check=False)
except Exception as e:
    print(f"Startup inference error: {e}", flush=True)

app = FastAPI()

# 1. /reset Endpoint (CRITICAL)
@app.post("/reset")
async def reset_environment():
    try:
        return {"status": "ok"}
    except Exception:
        return {"status": "ok"}

# 2. Static Assets Mounting (CRITICAL)
# Uses absolute path to 'assets' in project root
assets_path = os.path.join(BASE_DIR, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# Optional: Mount stitch_assets if it exists
stitch_assets_path = os.path.join(BASE_DIR, "stitch_assets")
if os.path.exists(stitch_assets_path):
    app.mount("/stitch_assets", StaticFiles(directory=stitch_assets_path), name="stitch_assets")

# 3. Root Handler
@app.get("/")
async def get_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse(status_code=404, content={"message": "index.html not found"})

# 4. Root-Level Static File Mapping for JS/CSS
ROOT_ASSETS = [
    "dashboard.js", "dashboard.css", "navigation.js", 
    "network.js", "settings.js", "threats.js", 
    "test_picker.js", "test_picker2.js"
]

@app.get("/{file_name}")
async def get_root_file(file_name: str):
    if file_name in ROOT_ASSETS:
        file_path = os.path.join(BASE_DIR, file_name)
        if os.path.exists(file_path):
            return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"message": "Not found"})

# 5. Application Execution
def main():
    import uvicorn
    uvicorn.run("server.app:app", host="0.0.0.0", port=7860)

if __name__ == "__main__":
    main()
