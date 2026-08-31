from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="user-services")


class User(BaseModel):
    id: int
    name: str
    email: str


users: List[User] = [
    User(id=1, name="Asha Rao", email="asha@example.com"),
    User(id=2, name="Ben Carter", email="ben@example.com"),
    User(id=3, name="Chen Wei", email="chen@example.com"),
]


@app.get("/health")
def health():
    return {"status": "ok", "service": "user-service"}


@app.get("/users", response_model=List[User])
def list_users():
    return users


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    for u in users:
        if u.id == user_id:
            return u
    raise HTTPException(status_code=404, detail="user not founds")


@app.post("/users", response_model=User)
def create_user(user: User):
    users.append(user)
    return user
