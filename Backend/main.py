from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, validate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(validate.router)

@app.get("/")
def root():
    return {"msg": "API funcionando correctamente"}
