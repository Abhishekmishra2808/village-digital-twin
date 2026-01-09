"""
Comprehensive indentation fix for gradio_god_mode.py
Fix all lines with 8 spaces that should have 4 spaces (after function definitions)
"""
import re

with open('gradio_god_mode.py', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
fixed_lines = []
in_function = False
function_indent = 0

for i, line in enumerate(lines):
    # Detect function definitions
    if line.strip().startswith('def ') and line.strip().endswith(':'):
        in_function = True
        function_indent = len(line) - len(line.lstrip())
        fixed_lines.append(line)
    elif in_function:
        # Check if we're still in the function
        if line.strip() and not line.startswith(' '):
            # New top-level code, exit function
            in_function = False
            fixed_lines.append(line)
        elif line.strip().startswith('def ') and line.strip().endswith(':'):
            # Nested function or new function
            in_function = True
            function_indent = len(line) - len(line.lstrip())
            fixed_lines.append(line)
        elif line.startswith(' ' * (function_indent + 8)) and not line.startswith(' ' * (function_indent + 12)):
            # Line has 8 extra spaces, remove 4
            fixed_lines.append(line[4:])
            print(f"Fixed line {i+1}: {line[:20]}...")
        else:
            fixed_lines.append(line)
    else:
        fixed_lines.append(line)

with open('gradio_god_mode.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(fixed_lines))

print("\nDone! Fixed indentation errors.")
