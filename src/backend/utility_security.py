import re
import html


def sanitize_input(user_input, *, field_type="generic", max_length=100):
    """
    Sanitize user input to prevent injection, scripting, and formatting attacks.

    Args:
        user_input (str): The raw input string to be sanitized.
        field_type (str): Context for specific sanitization rules (e.g., "username", "campaign", "password").
        max_length (int): Maximum length for the sanitized result.

    Returns:
        str: The cleaned and safe version of the input.
    """
    if not isinstance(user_input, str):
        raise ValueError("sanitize_input expects a string")

    # Normalize whitespace and remove invisible/null characters
    cleaned = user_input.strip()
    cleaned = cleaned.replace('\x00', '')  # Null byte
    cleaned = cleaned.replace('\r', '').replace('\n', ' ')  # Line breaks to space
    cleaned = html.escape(cleaned)  # Escape special HTML chars for UI safety

    # Remove characters that could lead to command/script injection
    blacklist_pattern = r'[<>\"\'`;\\]'
    cleaned = re.sub(blacklist_pattern, '', cleaned)

    # Field-specific tightening
    if field_type == "username":
        cleaned = re.sub(r'[^a-zA-Z0-9_\-]', '', cleaned)
        cleaned = cleaned.lower()

    elif field_type == "campaign":
        cleaned = re.sub(r'[^a-zA-Z0-9 \-]', '', cleaned)

    elif field_type == "password":
        return user_input.strip()

    return cleaned[:max_length]
