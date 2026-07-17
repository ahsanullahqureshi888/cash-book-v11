import html
import re

def round_money(value) -> float:
    try:
        return round(float(value or 0), 2)
    except (TypeError, ValueError):
        return 0.0


def sanitize_xss(value: str | None) -> str:
    if not value or not isinstance(value, str):
        return value or ""
    # Strip dangerous HTML tags like <script>, <iframe/object/embed/style/applet/meta/link> entirely
    tag_re = re.compile(r'<(script|iframe|object|embed|style|applet|meta|link)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>', re.IGNORECASE)
    cleaned = tag_re.sub('', value)
    
    # Strip event handlers like onerror, onload, onclick, javascript: URIs etc.
    handler_re = re.compile(r'\bon[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)', re.IGNORECASE)
    cleaned = handler_re.sub('', cleaned)
    cleaned = re.compile(r'javascript\s*:', re.IGNORECASE).sub('', cleaned)
    
    # Finally, HTML escape the string to prevent raw HTML rendering
    return html.escape(cleaned.strip())

