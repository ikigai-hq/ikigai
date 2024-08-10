from typing import List

from pydantic.v1 import BaseModel
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage


class SingleChoice(BaseModel):
    """Data Model for Single Choice Question"""

    question: str
    answers: List[str]
    correct_answer: str


class SingleChoiceList(BaseModel):
    """Data model for a Single Choice List."""

    subject: str
    quizzes: List[SingleChoice]


llm = OpenAI(model="gpt-4o-mini")


def generate_single_choice_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> SingleChoiceList:
    sllm = llm.as_structured_llm(output_cls=SingleChoiceList)
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    
    Generate {total_question} single choice question
    """

    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw
