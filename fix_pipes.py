import re

file_path = 'tech-docs/undergrad_guide/index.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replacement(match):
    text = match.group(0)
    # If it is a math block (starts with $), replace | with \vert
    if text.startswith('$'):
        return text.replace('|', r'\vert')
    return text

# Pattern explanation:
# 1. ```[\s\S]*?``` : Match code blocks (ignore content inside)
# 2. `[^`\n]*`      : Match inline code (ignore content inside)
# 3. \$\$[\s\S]*?\$\$ : Match display math (process this)
# 4. \$[^$\n]*\$     : Match inline math (process this)

# We want to match code blocks first to "consume" them and prevent math matching inside them.
pattern = r'(```[\s\S]*?```|`[^`\n]*`)|(\$\$[\s\S]*?\$\$|\$[^$\n]*\$)'

def callback(match):
    if match.group(1):
        # This is a code block or inline code. Return as is.
        return match.group(1)
    elif match.group(2):
        # This is math. Replace | with \vert
        return match.group(2).replace('|', r'\vert')
    return match.group(0) # Should not happen

new_content = re.sub(pattern, callback, content)

# Check if changes were made
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed pipes in math expressions.")
else:
    print("No changes needed or regex failed.")
