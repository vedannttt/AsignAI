import g4f
from g4f.client import Client
try:
    client = Client()
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "What is 2+2? Reply short"}],
    )
    print(response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
