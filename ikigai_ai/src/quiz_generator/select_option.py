from typing import List

from pydantic.v1 import BaseModel, Field
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage


class SelectOption(BaseModel):
    """Data Model for Select Option Question"""

    position: int
    answers: List[str] = Field(..., description="Potential answers of the question")
    correct_answer: str = Field(..., description="Correct answer")


class FillInBlankList(BaseModel):
    """Data Model for Select Option Question List"""

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
) -> FillInBlankList:
    sllm = llm.as_structured_llm(output_cls=FillInBlankList)
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    Wrap select option quiz in paragraph with [Q.[position]], example: [Q.1], [Q.2]. 
    Should not content ____ in content
    
    Generate a short paragraph 5-15 sentences with {total_question} Select Option questions. 
    """

    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw
