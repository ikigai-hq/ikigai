from typing import List

from pydantic import BaseModel
from llama_index.llms.openai import OpenAI
from llama_index.program.openai import OpenAIPydanticProgram


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
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    
    Generate {total_question} single choice question
    """
    program = OpenAIPydanticProgram.from_defaults(
        output_cls=SingleChoiceList, prompt_template_str=prompt, verbose=True
    )

    output = program(
        subject=subject,
        user_context=user_context,
        total_question=total_question,
    )
    return output
