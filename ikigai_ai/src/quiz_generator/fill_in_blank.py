from typing import List

from pydantic.v1 import BaseModel, Field
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage


class FillInBlank(BaseModel):
    """Data Model for Fill In Blank Question"""

    position: int
    correct_answer: str


class FillInBlankList(BaseModel):
    """Data Model for Fill In Blank Question"""

    content: str = Field(..., description="The paragraph content fill in blank questions")
    quizzes: List[FillInBlank] = Field(..., description="Fill in blank questions")


llm = OpenAI(model="gpt-4o-mini")


def generate_fill_in_blank_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> FillInBlankList:
    sllm = llm.as_structured_llm(output_cls=FillInBlankList)
    prompt = f"""
    Subject:\n {subject}
    More detail:\n {user_context}
    Wrap fill in blank quiz in paragraph with [Q.[position]], example: [Q.1], [Q.2] 
    
    Generate a short paragraph 5-10 sentences with {total_question} Fill in Blank questions. 
    """

    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw
