FROM python:3.12-slim

RUN pip install poetry

WORKDIR /ikigai_ai

COPY poetry.lock /ikigai_ai
COPY pyproject.toml /ikigai_ai
RUN poetry export -f requirements.txt --output requirements.txt
RUN pip install --no-cache-dir --upgrade -r /ikigai_ai/requirements.txt

ADD ./src /ikigai_ai/src
ADD __init__.py /ikigai_ai

EXPOSE 8001
CMD ["fastapi", "run", "src/index.py", "--port", "8001"]
