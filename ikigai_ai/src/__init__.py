from dotenv import load_dotenv
import dspy

# Load envs
load_dotenv()

# Set up the LM.
lm = dspy.OpenAI(model='gpt-3.5-turbo-instruct', max_tokens=250)
dspy.settings.configure(lm=lm)
