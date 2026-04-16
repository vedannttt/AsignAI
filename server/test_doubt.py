import g4f
import time
from g4f.client import Client

def measure(model_name):
    print(f"Testing {model_name}...")
    start = time.time()
    try:
        client = Client()
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": "Explain calculus very short"}],
            stream=False,
        )
        print(f"Response ({model_name}):", response.choices[0].message.content[:50], "...")
        print("Time:", time.time() - start)
    except Exception as e:
        print(f"Error ({model_name}):", e)

measure("")
measure("gpt-3.5-turbo")
measure("llama-3.1-70b")
measure("llama-3-8b")
