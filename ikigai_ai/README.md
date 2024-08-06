# Ikigai AI system

An efficient LLM Application that can generate quiz, and feedback by ikigai document and external resources.

## Start Server

### Step 1: Poetry and dependencies

You need to install Poetry to start
https://python-poetry.org/

```bash
# After poetry installed
poetry install
```

### Step 2: Setup OpenAI API key

Currently, we only support Open AI (gpt-4o-mini) model.
https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key

### Step 3: Start

```bash
# Dev
fastapi dev --port 8001 src/index.py

# Production
fastapi run --port 8001 src/index.py
```

Now, you can check API docs at https://localhost:8001/docs


### Code Formatting:

```bash
black src
```
