from typing import List

from pydantic.v1 import BaseModel
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage


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
    sllm = llm.as_structured_llm(output_cls=MultipleChoiceList)
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

    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw
