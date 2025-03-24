from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()

emotion_classifier = pipeline("text-classification", model="bhadresh-savani/bert-base-multilingual-emotion")

@app.post("/analyze")
def analyze_text(data: dict):
    result = emotion_classifier(data["text"])
    return {"emotion": result[0]["label"], "confidence": result[0]["score"]}