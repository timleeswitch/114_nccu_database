from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    student_id: int = Field(ge=1)
    name: str = Field(min_length=1)
    password: str = Field(min_length=1)

class LoginRequest(BaseModel):
    student_id: int = Field(ge=1)
    password: str = Field(min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class StudentResponse(BaseModel):
    student_id: int
    name: str

    class Config:
        from_attributes = True