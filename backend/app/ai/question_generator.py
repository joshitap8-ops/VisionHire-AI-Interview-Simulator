from typing import List, Optional
from app.ai.ollama_client import chat_with_ollama


def _difficulty_guidance(difficulty: str) -> str:
    guides = {
        "easy": "Use simple language and ask introductory-level questions.",
        "medium": "Ask moderately complex questions that test practical knowledge.",
        "hard": "Ask advanced, in-depth questions that challenge deep expertise.",
    }
    return guides.get(difficulty, guides["medium"])


def _type_guidance(interview_type: str) -> str:
    guides = {
        "hr": (
            "Focus on personality, motivation, cultural fit, and soft skills. "
            "Ask questions like 'Tell me about yourself', salary expectations, etc."
        ),
        "technical": (
            "Focus on technical knowledge, problem-solving, algorithms, system design, "
            "and domain-specific expertise."
        ),
        "behavioral": (
            "Use the STAR method (Situation, Task, Action, Result). "
            "Ask about past experiences, teamwork, conflict resolution, leadership."
        ),
    }
    return guides.get(interview_type, guides["hr"])


async def generate_first_question(
    role: str,
    topic: str,
    difficulty: str,
    interview_type: str,
    resume_context: Optional[str] = None,
) -> str:
    """Generate the opening interview question."""
    resume_part = ""
    if resume_context:
        resume_part = f"\n\nCandidate's resume context:\n{resume_context[:500]}"

    system_prompt = f"""You are an expert AI interviewer conducting a {interview_type} interview.
Role being interviewed: {role}
Topic focus: {topic}
Difficulty: {difficulty} – {_difficulty_guidance(difficulty)}
Interview style: {_type_guidance(interview_type)}
{resume_part}

Rules:
- Ask ONE clear question at a time.
- Be professional and encouraging.
- Do NOT include any preamble like "Question 1:" or numbering.
- Just output the question text directly.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": (
                "Please start the interview by introducing yourself briefly "
                "and asking the first question."
            ),
        },
    ]
    return await chat_with_ollama(messages)


async def generate_follow_up_question(
    role: str,
    topic: str,
    difficulty: str,
    interview_type: str,
    conversation_history: List[dict],
    question_number: int,
    total_questions: int,
) -> str:
    """Generate a follow-up question based on conversation history."""
    system_prompt = f"""You are an expert AI interviewer conducting a {interview_type} interview.
Role: {role} | Topic: {topic} | Difficulty: {difficulty}
{_type_guidance(interview_type)}

This is question {question_number} of {total_questions}.
- If this is the last question, let the candidate know it's the final one.
- Base your next question on the previous answer.
- Ask follow-up questions if the answer needs clarification, or move to a new relevant topic.
- Ask ONE question only. No numbering prefixes.
- Keep a professional and supportive tone.
"""

    messages = [{"role": "system", "content": system_prompt}] + conversation_history
    messages.append(
        {
            "role": "user",
            "content": "Please ask the next interview question based on the conversation so far.",
        }
    )
    return await chat_with_ollama(messages)


async def evaluate_answer(
    question: str,
    answer: str,
    role: str,
    topic: str,
    interview_type: str,
) -> dict:
    """
    Evaluate a candidate answer and return a score + brief feedback.
    Returns: {"score": float, "feedback": str}
    """
    prompt = f"""You are an expert interviewer evaluating a candidate's answer.

Role: {role}
Topic: {topic}
Interview Type: {interview_type}

Question: {question}
Candidate Answer: {answer}

Evaluate the answer and provide:
1. A score from 0 to 10 (decimals allowed)
2. Two sentences of constructive feedback

Respond in EXACTLY this JSON format:
{{"score": 7.5, "feedback": "Your answer was clear and showed solid understanding. Consider adding more specific examples next time."}}
"""

    messages = [{"role": "user", "content": prompt}]
    raw = await chat_with_ollama(messages)

    # Parse JSON from response
    import json
    import re
    try:
        # Extract JSON object from the response
        match = re.search(r'\{.*?\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
            return {
                "score": float(data.get("score", 6.0)),
                "feedback": data.get("feedback", "Good attempt."),
            }
    except Exception:
        pass

    return {"score": 6.0, "feedback": raw[:200] if raw else "Good attempt."}


async def generate_comprehensive_feedback(
    role: str,
    interview_type: str,
    transcript: str,
    scores: dict,
) -> dict:
    """
    Generate a full post-interview feedback report.
    Returns strengths, weaknesses, tips, and improvement suggestions.
    """
    score_summary = "\n".join([f"- {k}: {v}" for k, v in scores.items()])

    prompt = f"""You are an expert career coach reviewing a completed {interview_type} interview for the role of {role}.

Interview Scores:
{score_summary}

Interview Transcript (last 3000 chars):
{transcript[-3000:]}

Provide a detailed, actionable feedback report with EXACTLY this JSON structure:
{{
  "overall_feedback": "2-3 sentences of overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "communication_tips": ["tip 1", "tip 2", "tip 3"],
  "improvement_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "recommended_resources": ["resource 1", "resource 2"]
}}
"""

    messages = [{"role": "user", "content": prompt}]
    raw = await chat_with_ollama(messages)

    import json
    import re
    try:
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass

    # Fallback structure if parsing fails
    return {
        "overall_feedback": raw[:300] if raw else "Good interview performance overall.",
        "strengths": ["Clear communication", "Professional demeanor", "Subject knowledge"],
        "weaknesses": ["Could provide more examples", "Improve response depth"],
        "communication_tips": ["Speak clearly", "Maintain eye contact", "Pause before answering"],
        "improvement_suggestions": [
            "Practice STAR method",
            "Research the company more",
            "Work on technical depth",
        ],
        "recommended_resources": ["LeetCode for technical prep", "Mock interview platforms"],
    }
