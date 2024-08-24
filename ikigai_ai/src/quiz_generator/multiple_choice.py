from typing import List

from pydantic import BaseModel
from llama_index.llms.openai import OpenAI
from llama_index.program.openai import OpenAIPydanticProgram


class MultipleChoice(BaseModel):
    """Data Model for Multiple Choice Question"""

    question: str
    answers: List[str]
    correct_answers: List[str]


class MultipleChoiceList(BaseModel):
    """Data model for a Multiple Choice List."""

    subject: str
    quizzes: List[MultipleChoice]


llm = OpenAI(model="gpt-4o-mini")


def generate_multiple_choice_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> MultipleChoiceList:
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    
    Generate {total_question} multiple choice with at least 2 correct answers question
    """

    if subject != "":
        prompt = f"""
        {user_context}
        
        Generate {total_question} multiple choice with 2 correct answers question about {subject}
        """

    program = OpenAIPydanticProgram.from_defaults(
        output_cls=MultipleChoiceList, prompt_template_str=prompt, verbose=True
    )

    output = program(
        subject=subject,
        user_context=user_context,
        total_question=total_question,
    )
    return output
