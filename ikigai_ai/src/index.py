from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

# Logging & Tracing LLM
import llama_index.core

llama_index.core.set_global_handler("simple")

from fastapi import FastAPI
from ikigai_ai.src.quiz_generator.llm import (
    generate_single_choice_quizzes,
    generate_multiple_choice_quizzes,
)

app = FastAPI()


@app.get("/ping")
def read_root():
    return "pong"


class GenerateQuizRequest(BaseModel):
    user_context: str
    subject: str
    total_quizzes: int


@app.post("/quizzes/generate-single-choice")
def gen_single_choice_quizzes(req: GenerateQuizRequest):
    return generate_single_choice_quizzes(
        req.user_context,
        req.subject,
        req.total_quizzes,
    )


@app.post("/quizzes/generate-multiple-choice")
def gen_single_choice_quizzes(req: GenerateQuizRequest):
    return generate_multiple_choice_quizzes(
        req.user_context,
        req.subject,
        req.total_quizzes,
    )
