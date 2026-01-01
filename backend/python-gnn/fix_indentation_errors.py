"""
Fix indentation errors in gradio_god_mode.py
"""
with open('gradio_god_mode.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed_lines = []
for i, line in enumerate(lines, 1):
    # Check if line starts with more than 4 spaces after a function definition
    if i > 1 and lines[i-2].strip().startswith('def ') and lines[i-2].strip().endswith(':'):
        # This is inside a function, should have 4 spaces max for first level
        if line.startswith('        ') and not lines[i-2].strip().startswith('    '):
            # Remove 4 extra spaces
            fixed_lines.append(line[4:])
            print(f"Fixed line {i}: removed 4 spaces")
        else:
            fixed_lines.append(line)
    else:
        fixed_lines.append(line)

with open('gradio_god_mode.py', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("Done!")
