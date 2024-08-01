from typing import List

from pydantic.v1 import BaseModel


class SingleChoice(BaseModel):
    """Data Model for Single Choice Question"""

    question: str
    answers: List[str]
    correct_answer: str


class SingleChoiceList(BaseModel):
    """Data model for a Single Choice List."""

    subject: str
    quizzes: List[SingleChoice]


class MultipleChoice(BaseModel):
    """Data Model for Multiple Choice Question"""

    question: str
    answers: List[str]
    correct_answers: List[str]


class MultipleChoiceList(BaseModel):
    """Data model for a Multiple Choice List."""

    subject: str
    quizzes: List[MultipleChoice]
