import os
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

class QueryRequest(BaseModel):
    question: str


# --- Database Connection ---
# Make sure this is your correct Supabase connection string
DATABASE_URL = "postgresql://postgres:nishchhal12345@db.otsablanmtjgmovdpgxu.supabase.co:5432/postgres" 

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Security (JWT, Password Hashing) ---
SECRET_KEY = "a_super_secret_key_that_is_long_and_random" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency to get the current user from a JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: sessionmaker = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if username is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_query = text("SELECT user_id, username FROM users WHERE user_id = :user_id")
    user = db.execute(user_query, {"user_id": user_id}).first()

    if user is None:
        raise credentials_exception
    return user

# --- FastAPI App ---
app = FastAPI(title="Contract Analysis API")

origins = [
    "http://localhost:5173",
    "https://ai-contract.vercel.app", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---
@app.post("/signup", status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def signup(form_data: OAuth2PasswordRequestForm = Depends(), db: sessionmaker = Depends(get_db)):
    user_query = text("SELECT username FROM users WHERE username = :username")
    user = db.execute(user_query, {"username": form_data.username}).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    hashed_password = get_password_hash(form_data.password)
    insert_query = text("INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)")
    db.execute(insert_query, {"username": form_data.username, "password_hash": hashed_password})
    db.commit()
    return {"message": f"User '{form_data.username}' created successfully."}

@app.post("/token", tags=["Authentication"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: sessionmaker = Depends(get_db)):
    user_query = text("SELECT user_id, username, password_hash FROM users WHERE username = :username")
    user = db.execute(user_query, {"username": form_data.username}).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.user_id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/upload", status_code=status.HTTP_201_CREATED, tags=["Contracts"])
def upload_contract(
    file: UploadFile = File(...), 
    db: sessionmaker = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    user_id = current_user.user_id
    filename = file.filename

    doc_insert_query = text("""
        INSERT INTO documents (user_id, filename, status, risk_score, parties, expiry_date)
        VALUES (:user_id, :filename, 'Processing', 'Medium', 'Party A, Party B', '2026-12-31')
        RETURNING doc_id;
    """)
    result = db.execute(doc_insert_query, {"user_id": user_id, "filename": filename})
    doc_id = result.first()[0]
    
    mock_chunks = [
        {"text_chunk": "Termination clause: Either party may terminate with 90 days notice.", "embedding": [0.12, -0.45, 0.91] + [0.0] * 381, "metadata": {"page": 2}},
        {"text_chunk": "Liability cap: Limited to 12 months fees.", "embedding": [0.01, 0.22, -0.87] + [0.0] * 381, "metadata": {"page": 5}}
    ]

    for chunk in mock_chunks:
        chunk_insert_query = text("""
            INSERT INTO chunks (doc_id, user_id, text_chunk, embedding, metadata)
            VALUES (:doc_id, :user_id, :text_chunk, :embedding, :metadata)
        """)
        db.execute(chunk_insert_query, {"doc_id": doc_id, "user_id": user_id, "text_chunk": chunk["text_chunk"], "embedding": chunk["embedding"], "metadata": json.dumps(chunk["metadata"])})

    db.commit()
    return {"message": "File uploaded and processed successfully", "doc_id": doc_id}

@app.get("/contracts", tags=["Contracts"])
def get_user_contracts(
    db: sessionmaker = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Retrieves a list of all contracts uploaded by the current user.
    """
    user_id = current_user.user_id

    # Query the documents table for all entries matching the user_id
    contracts_query = text("""
        SELECT doc_id, filename, uploaded_on, status, risk_score, parties, expiry_date 
        FROM documents 
        WHERE user_id = :user_id 
        ORDER BY uploaded_on DESC;
    """)
    
    result = db.execute(contracts_query, {"user_id": user_id})
    contracts = result.fetchall()

    # The result from the database needs to be converted into a list of dictionaries
    # that can be easily sent as JSON.
    contracts_list = [
        {
            "doc_id": contract.doc_id,
            "filename": contract.filename,
            "uploaded_on": contract.uploaded_on,
            "status": contract.status,
            "risk_score": contract.risk_score,
            "parties": contract.parties,
            "expiry_date": contract.expiry_date,
        }
        for contract in contracts
    ]

    return contracts_list
@app.post("/ask", tags=["Queries"])
def ask_question(
    query: QueryRequest,
    db: sessionmaker = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Accepts a natural language question and returns the most relevant text chunks
    from the user's documents using vector similarity search.
    """
    user_id = current_user.user_id

    # 1. Mock embedding for the user's question.
    # In a real app, this would be generated by an AI model.
    # We'll use a vector similar to one of our stored chunks to ensure we get a match.
    mock_question_embedding = [0.12, -0.45, 0.91] + [0.0] * 381 

    # 2. Perform vector similarity search in the database.
    # The '<=>' operator from pgvector calculates the cosine distance.
    # A lower distance means higher similarity. We order by this distance.
    search_query = text("""
        SELECT 
            text_chunk, 
            metadata, 
            1 - (embedding <=> CAST(:query_embedding AS vector)) AS similarity
        FROM chunks
        WHERE user_id = :user_id
        ORDER BY similarity DESC
        LIMIT 5;
    """)

    result = db.execute(search_query, {
        "query_embedding": str(mock_question_embedding), # Pass embedding as a string
        "user_id": user_id
    })
    
    relevant_chunks = result.fetchall()

    # 3. Format the results into a JSON-friendly list of dictionaries.
    results_list = [
        {
            "text_chunk": chunk.text_chunk,
            "metadata": chunk.metadata,
            "similarity": round(chunk.similarity, 4) # Round for readability
        }
        for chunk in relevant_chunks
    ]

    return {
        "ai_answer": "Based on the documents, here are the most relevant clauses:",
        "results": results_list
    }



