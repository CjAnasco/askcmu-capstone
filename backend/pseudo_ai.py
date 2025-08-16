import sys
import os
import random
import firebase_admin
from firebase_admin import credentials, firestore
import spacy

nlp = spacy.load("en_core_web_sm")

cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Accept userName as second argument (if provided)
query = sys.argv[1].lower().strip() if len(sys.argv) > 1 else ""
user_name = sys.argv[2].strip() if len(sys.argv) > 2 else ""

doc = nlp(query)
tokens = [token.lemma_ for token in doc if not token.is_stop]

intents = {}
faqs_ref = db.collection('faqs')
for doc_snap in faqs_ref.stream():
    intents[doc_snap.id] = doc_snap.to_dict()

matched_intent = None
for intent, data in intents.items():
    for keyword in data.get("keywords", []):
        for word in tokens:
            if keyword in word or word in keyword:
                matched_intent = intent
                break

if matched_intent:
    responses = intents[matched_intent].get("responses")
    if responses and isinstance(responses, list):
        response = random.choice(responses)
    else:
        response = intents[matched_intent].get("response", "")
    followup = intents[matched_intent].get("followup", "")
    print(response + (" " + followup if followup else ""))
else:
    print("I'm not sure about that yet. You can ask about enrollment, requirements, schedule, or tuition. What would you like to know?")

sys.exit()
