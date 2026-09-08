import os
from dotenv import load_dotenv
from strands import Agent

from prompts import SYSTEM_PROMPT
from tools import (
    find_available_locations,
    create_event,
    create_task,
    get_pending_tasks,
    add_budget_item,
    get_budget_status,
    request_approval,
    get_pending_approvals,
    record_agent_action,
)

load_dotenv()


def build_model():
    """Pick a model provider based on MODEL_PROVIDER in .env.

    "groq" — free, no card, no daily-quota problem like Gemini's free tier.
      Get a key at console.groq.com. Recommended if Gemini's 20/day limit
      or Bedrock's approval process is blocking you.
    "gemini" — free via Google AI Studio, no card needed, but capped at
      20 requests/day per model on the free tier, easy to exhaust while testing.
    "anthropic" — direct Anthropic API, needs an API key and prepaid credit.
    "bedrock" — uses your AWS hackathon credits, needs AWS credentials
      configured and Claude model access enabled and approved in Bedrock.
    "ollama" — fully free, runs locally, no account needed, but weaker at
      reliable multi-step tool calling than the hosted options above.
    """
    provider = os.getenv("MODEL_PROVIDER", "bedrock").lower()

    if provider == "groq":
        from strands.models.openai import OpenAIModel

        return OpenAIModel(
            client_args={
                "api_key": os.getenv("GROQ_API_KEY"),
                "base_url": "https://api.groq.com/openai/v1",
            },
            model_id=os.getenv("GROQ_MODEL_ID", "openai/gpt-oss-120b"),
            params={"temperature": 0.3, "max_tokens": 2048},
        )

    if provider == "gemini":
        from strands.models.gemini import GeminiModel

        return GeminiModel(
            client_args={"api_key": os.getenv("GOOGLE_API_KEY")},
            model_id=os.getenv("GEMINI_MODEL_ID", "gemini-3.6-flash"),
            params={"temperature": 0.3, "max_output_tokens": 2048},
        )

    if provider == "anthropic":
        from strands.models.anthropic import AnthropicModel

        return AnthropicModel(
            client_args={"api_key": os.getenv("ANTHROPIC_API_KEY")},
            max_tokens=2048,
            model_id=os.getenv("ANTHROPIC_MODEL_ID", "claude-sonnet-4-6"),
            params={"temperature": 0.3},
        )

    if provider == "ollama":
        from strands.models.ollama import OllamaModel

        return OllamaModel(
            host=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
            model_id=os.getenv("OLLAMA_MODEL_ID", "llama3.1"),
        )

    # default: bedrock
    from strands.models import BedrockModel

    return BedrockModel(
        model_id=os.getenv(
            "BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-20250514-v1:0"
        ),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        temperature=0.3,
    )


def build_agent() -> Agent:
    model = build_model()

    return Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            find_available_locations,
            create_event,
            create_task,
            get_pending_tasks,
            add_budget_item,
            get_budget_status,
            request_approval,
            get_pending_approvals,
            record_agent_action,
        ],
    )


if __name__ == "__main__":
    agent = build_agent()
    print("OrbitOne agent ready. Type a request (or 'quit').\n")
    while True:
        user_input = input("You: ")
        if user_input.strip().lower() in ("quit", "exit"):
            break
        response = agent(user_input)
        print(f"\nOrbitOne: {response}\n")
