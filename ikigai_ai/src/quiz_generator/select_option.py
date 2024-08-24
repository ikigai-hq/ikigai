from typing import List

from pydantic import BaseModel, Field
from llama_index.llms.openai import OpenAI
from llama_index.program.openai import OpenAIPydanticProgram


class SelectOption(BaseModel):
    """Data Model for Select Option Question"""

    position: int
    answers: List[str] = Field(..., description="Potential answers of the question")
    correct_answer: str = Field(..., description="Correct answer")


class SelectOptionList(BaseModel):
    """Data Model for Select Option Question List. Include content and select options list"""

    content: str = Field(
        ..., description="The paragraph content Select Option questions"
    )
    quizzes: List[SelectOption] = Field(
        ..., description="Select Option Questions in Content"
    )


llm = OpenAI(model="gpt-4o-mini")


def generate_select_options_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> SelectOptionList:
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    You must Wrap position of the quiz in paragraph with [Q.[position]], example: [Q.1], [Q.2]. 
    
    Generate a paragraph with maximum {total_question} Select Option quizzes, remember to wrap the quiz
    """

    program = OpenAIPydanticProgram.from_defaults(
        output_cls=SelectOptionList, prompt_template_str=prompt, verbose=True
    )

    output = program(
        subject=subject,
        user_context=user_context,
        total_question=total_question,
    )
    return output
