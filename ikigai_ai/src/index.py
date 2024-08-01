from dotenv import load_dotenv
from pydantic import BaseModel
from enum import Enum

load_dotenv()


from fastapi import FastAPI
from ikigai_ai.src.quiz_generator.llm import generate_single_choice_quizzes, generate_multiple_choice_quizzes

app = FastAPI()


@app.get("/ping")
def read_root():
    return "pong"


class QuizType(str, Enum):
    single_choice = "single_choice"
    multiple_choice = "multiple_choice"


class GenerateQuizRequest(BaseModel):
    user_context: str
    subject: str
    total_quizzes: int
    quiz_type: QuizType = QuizType.single_choice


@app.post("/quizzes/generate")
def gen_quizzes(req: GenerateQuizRequest):
    if req.quiz_type == QuizType.single_choice:
        return generate_single_choice_quizzes(
            req.user_context,
            req.subject,
            req.total_quizzes,
        )
    else:
        return generate_multiple_choice_quizzes(
            req.user_context,
            req.subject,
            req.total_quizzes,
        )
