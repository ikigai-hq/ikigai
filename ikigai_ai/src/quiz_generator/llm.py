from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage

from ikigai_ai.src.quiz_generator.type import SingleChoiceList, MultipleChoiceList

llm = OpenAI(model="gpt-4o-mini")


def generate_single_choice_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> SingleChoiceList:
    sllm = llm.as_structured_llm(output_cls=SingleChoiceList)
    prompt = f"""
    {user_context}
    
    Generate {total_question} single choice question
    """

    if subject != "":
        prompt = f"""
        {user_context}
        
        Generate {total_question} single choice question about {subject}
        """

    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw


def generate_multiple_choice_quizzes(
    user_context: str,
    subject: str,
    total_question: int,
) -> MultipleChoiceList:
    sllm = llm.as_structured_llm(output_cls=MultipleChoiceList)
    prompt = f"""
    {user_context}
    
    Generate {total_question} multiple choice with 2 correct answers question
    """

    if subject != "":
        prompt = f"""
        {user_context}
        
        Generate {total_question} multiple choice with 2 correct answers question about {subject}
        """

    input_msg = ChatMessage.from_str(prompt)
    output = sllm.chat([input_msg])
    return output.raw
