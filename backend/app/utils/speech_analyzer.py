import re

# Common English filler words to detect
FILLER_WORDS = [
    "um", "uh", "er", "ah", "like", "you know", "basically", "literally",
    "actually", "honestly", "right", "so", "well", "kind of", "sort of",
    "i mean", "you see", "okay so", "just", "really", "very very",
]


def analyze_speech_text(text: str, duration_seconds: float = 60.0) -> dict:
    """
    Analyze a speech transcript for quality metrics.

    Returns:
        dict with keys: word_count, words_per_minute, filler_count,
                        filler_words_found, clarity_score, speech_score
    """
    if not text:
        return _empty_result()

    words = text.strip().split()
    word_count = len(words)

    # Words per minute
    duration_minutes = max(duration_seconds / 60, 0.1)
    wpm = round(word_count / duration_minutes, 1)

    # Filler word detection
    text_lower = text.lower()
    filler_count = 0
    found_fillers = []
    for filler in FILLER_WORDS:
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, text_lower)
        if matches:
            filler_count += len(matches)
            found_fillers.append(filler)

    # Pause estimation: multiple spaces or sentence breaks suggest natural pauses
    pause_count = len(re.findall(r'[.!?]\s+', text))

    # Clarity score (0-100): penalise filler words and extreme WPM
    filler_penalty = min(filler_count * 3, 30)
    wpm_penalty = 0
    if wpm < 80:
        wpm_penalty = (80 - wpm) * 0.3
    elif wpm > 180:
        wpm_penalty = (wpm - 180) * 0.2

    clarity_score = max(0.0, min(100.0, 100 - filler_penalty - wpm_penalty))

    # Speech score (0-100): combine clarity with naturalness
    naturalness = min(pause_count * 5, 20)  # reward natural pauses
    speech_score = min(100.0, clarity_score + naturalness)

    return {
        "word_count": word_count,
        "words_per_minute": wpm,
        "filler_count": filler_count,
        "filler_words_found": found_fillers,
        "pause_count": pause_count,
        "clarity_score": round(clarity_score, 1),
        "speech_score": round(speech_score, 1),
    }


def _empty_result() -> dict:
    return {
        "word_count": 0,
        "words_per_minute": 0,
        "filler_count": 0,
        "filler_words_found": [],
        "pause_count": 0,
        "clarity_score": 50.0,
        "speech_score": 50.0,
    }
