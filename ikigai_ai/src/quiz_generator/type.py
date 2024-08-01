from typing import List

from pydantic.v1 import BaseModel


class SingleChoice(BaseModel):
    """Data Model for Single Choice Question"""

    question: str
    answers: List[str]
    correct_answer: str


class SingleChoiceList(BaseModel):
    """Data model for an album."""

    subject: str
    quizzes: List[SingleChoice]
