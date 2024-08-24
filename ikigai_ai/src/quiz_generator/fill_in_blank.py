from typing import List

from pydantic import BaseModel, Field
from llama_index.llms.openai import OpenAI
from llama_index.program.openai import OpenAIPydanticProgram


class FillInBlank(BaseModel):
    """Data Model for Fill In Blank Question"""

    position: int
    correct_answer: str


class FillInBlankList(BaseModel):
    """Data Model for Fill In Blank Question"""

    content: str = Field(
        ..., description="The paragraph content fill in blank questions"
    )
    quizzes: List[FillInBlank] = Field(..., description="Fill in blank questions")


llm = OpenAI(model="gpt-4o-mini")


def generate_fill_in_blank_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> FillInBlankList:
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    Wrap fill in blank quiz in paragraph with [Q.[position]], example: [Q.1], [Q.2] 
    
    Generate a short paragraph with {total_question} Fill in Blank questions. 
    """

    program = OpenAIPydanticProgram.from_defaults(
        output_cls=FillInBlankList, prompt_template_str=prompt, verbose=True
    )

    output = program(
        subject=subject,
        user_context=user_context,
        total_question=total_question,
    )
    return output
