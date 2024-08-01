from dotenv import load_dotenv
from pydantic import BaseModel

from ikigai_ai.src.quiz_generator.type import SingleChoiceList

load_dotenv()


from fastapi import FastAPI
from ikigai_ai.src.quiz_generator.llm import generate_quiz_by_text

app = FastAPI()


@app.get("/ping")
def read_root():
    return "pong"


class GenerateQuizRequest(BaseModel):
    user_context: str
    subject: str
    total_quizzes: int


@app.post("/quizzes/generate")
def gen_quizzes(req: GenerateQuizRequest):
    quizzes = generate_quiz_by_text(
        req.user_context,
        req.subject,
        req.total_quizzes,
    )

    return quizzes
