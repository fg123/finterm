FROM python:latest
COPY app/ /

CMD python -m http.server ${PORT}