from fastapi import APIRouter
import os  # <-- ¡Importación necesaria para usar os.path.exists!
import json  # <-- ¡Importación necesaria para usar json.load y json.dump!

router = APIRouter()

DB_FILE = "users.json"

def load_users():
    """Carga los datos de usuarios desde el archivo JSON."""
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        # En caso de que el archivo esté vacío o corrupto
        return {}

def save_users(users):
    """Guarda los datos de usuarios en el archivo JSON."""
    with open(DB_FILE, "w") as f:
        json.dump(users, f, indent=4)

@router.post("/register")
def register(data: dict):
    users = load_users()
    # Se recomienda usar un modelo Pydantic en lugar de dict para validar
    try:
        email = data["email"]
        passwd = data["password"]
    except KeyError:
        return {"ok": False, "msg": "Faltan campos 'email' o 'password'"}

    if email in users:
        return {"ok": False, "msg": "Usuario ya existe"}

    # NOTA: En un proyecto real, DEBES hashear la contraseña (p.ej., con bcrypt)
    users[email] = {"password": passwd}
    save_users(users)

    return {"ok": True, "msg": "Cuenta creada"}

@router.post("/login")
def login(data: dict):
    users = load_users()
    # Se recomienda usar un modelo Pydantic en lugar de dict para validar
    try:
        email = data["email"]
        passwd = data["password"]
    except KeyError:
        return {"ok": False, "msg": "Faltan campos 'email' o 'password'"}

    if email not in users:
        return {"ok": False, "msg": "Usuario no existe"}

    # NOTA: Aquí se compararía el hash de la contraseña en un proyecto real
    if users[email]["password"] != passwd:
        return {"ok": False, "msg": "Contraseña incorrecta"}

    return {"ok": True, "msg": "Login correcto"}