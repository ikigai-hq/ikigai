from typing import Dict, Any

from dotenv import load_dotenv

load_dotenv()

# Logging & Tracing LLM
import llama_index.core

llama_index.core.set_global_handler("simple")

from fastapi import FastAPI
from enum import Enum
from pydantic import BaseModel

from ikigai_ai.src.quiz_generator.single_choice import generate_single_choice_quizzes
from ikigai_ai.src.quiz_generator.multiple_choice import (
    generate_multiple_choice_quizzes,
)
from ikigai_ai.src.quiz_generator.fill_in_blank import generate_fill_in_blank_quizzes
from ikigai_ai.src.quiz_generator.select_option import generate_select_options_quizzes

app = FastAPI()


@app.get("/ping")
def read_root():
    return "pong"


class GenerateQuizRequest(BaseModel):
    user_context: str
    subject: str
    total_quizzes: int


class QuizType(str, Enum):
    SingleChoice = "single_choice"
    MultipleChoice = "multiple_choice"
    FillInBlank = "fill_in_blank"


class GenerateQuizResponse(BaseModel):
    quiz_type: QuizType
    single_choice_data: Dict[str, Any] | None = None
    multiple_choice_data: Dict[str, Any] | None = None
    fill_in_blank_data: Dict[str, Any] | None = None
    select_options_data: Dict[str, Any] | None = None


@app.post("/quizzes/generate-single-choice")
def gen_single_choice_quizzes(req: GenerateQuizRequest) -> GenerateQuizResponse:
    single_choice_data = generate_single_choice_quizzes(
        req.user_context,
        req.subject,
        req.total_quizzes,
    ).dict()
    return GenerateQuizResponse(
        quiz_type=QuizType.SingleChoice, single_choice_data=single_choice_data
    )


@app.post("/quizzes/generate-multiple-choice")
def gen_single_choice_quizzes(req: GenerateQuizRequest):
    multiple_choice_data = generate_multiple_choice_quizzes(
        req.user_context,
        req.subject,
        req.total_quizzes,
    ).dict()

    return GenerateQuizResponse(
        quiz_type=QuizType.MultipleChoice, multiple_choice_data=multiple_choice_data
    )


@app.post("/quizzes/generate-fill-in-blank")
def gen_single_choice_quizzes(req: GenerateQuizRequest):
    fill_in_blank_data = generate_fill_in_blank_quizzes(
        req.user_context,
        req.subject,
        req.total_quizzes,
    ).dict()
    return GenerateQuizResponse(
        quiz_type=QuizType.FillInBlank, fill_in_blank_data=fill_in_blank_data
    )


@app.post("/quizzes/generate-select-options")
def gen_single_choice_quizzes(req: GenerateQuizRequest):
    select_options_data = generate_select_options_quizzes(
        req.user_context,
        req.subject,
        req.total_quizzes,
    ).dict()
    return GenerateQuizResponse(
        quiz_type=QuizType.FillInBlank, select_options_data=select_options_data
    )
