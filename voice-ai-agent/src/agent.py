import logging
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    inference,
    room_io,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.
            
            You can also generate music for the user. When they ask for music, use the generate_music tool with a detailed description of what they want.""",
        )
        
        # Initialize ElevenLabs client for music generation
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            logger.warning("ELEVENLABS_API_KEY not found. Music generation will not be available.")
            self.elevenlabs = None
        else:
            self.elevenlabs = ElevenLabs(api_key=api_key)
        
        # Create directory for saved music if it doesn't exist
        self.music_dir = Path("generated_music")
        self.music_dir.mkdir(exist_ok=True)

    @function_tool
    async def generate_music(self, context: RunContext, prompt: str, duration_seconds: int = 30):
        """Generate music based on a text prompt and save it locally.
        
        Use this tool when the user asks you to create, generate, or make music for them.
        The prompt should describe the style, mood, instruments, and any other characteristics they want.
        
        Args:
            prompt: A detailed description of the music to generate (e.g., "upbeat electronic dance music with synthesizers", "calm piano melody for relaxation")
            duration_seconds: Length of the music in seconds (default: 30, max: 120)
        """
        
        if not self.elevenlabs:
            return "Sorry, music generation is not available. The ELEVENLABS_API_KEY environment variable is not set."
        
        # Limit duration to reasonable range
        duration_seconds = max(10, min(duration_seconds, 120))
        duration_ms = duration_seconds * 1000
        
        logger.info(f"Generating music: {prompt} ({duration_seconds}s)")
        
        try:
            # Generate music using ElevenLabs API
            stream = self.elevenlabs.music.stream(
                prompt=prompt,
                music_length_ms=duration_ms,
            )
            
            # Collect audio data
            audio_chunks = []
            for chunk in stream:
                if chunk:
                    audio_chunks.append(chunk)
            
            if not audio_chunks:
                return "Sorry, I couldn't generate any music. Please try a different prompt."
            
            # Combine all chunks
            audio_data = b"".join(audio_chunks)
            
            # Save to file with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"music_{timestamp}.mp3"
            filepath = self.music_dir / filename
            
            with open(filepath, "wb") as f:
                f.write(audio_data)
            
            logger.info(f"Music saved to {filepath}")
            
            return f"I've created your music and saved it to {filepath}. The track is {duration_seconds} seconds long. Enjoy!"
            
        except Exception as e:
            logger.error(f"Music generation failed: {e}")
            return f"Sorry, I encountered an error while generating music: {str(e)}"

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=inference.STT(model="assemblyai/universal-streaming", language="en"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=inference.LLM(model="openai/gpt-4.1-mini"),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=inference.TTS(
            model="cartesia/sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"
        ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony()
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                else noise_cancellation.BVC(),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
