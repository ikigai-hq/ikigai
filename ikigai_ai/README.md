# Ikigai AI system

An efficient AI (LLM Application) that can generate quiz, and feedback by resources.

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
fast dev __init__.py

# Production
fast run __init__.py
```

Now, you can check API docs at https://localhost:8000/docs
