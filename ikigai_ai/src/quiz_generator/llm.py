from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage

from ikigai_ai.src.quiz_generator.type import SingleChoice, SingleChoiceList

llm = OpenAI(model="gpt-4o-mini")


def generate_quiz_by_text(
    user_context: str,
    subject: str,
    total_question: int,
) -> SingleChoiceList:
    sllm = llm.as_structured_llm(output_cls=SingleChoiceList)
    prompt = f"""
    {user_context}
    
    Generate {total_question} single choice question about {subject}
    """
    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw
