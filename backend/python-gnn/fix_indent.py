"""Fix indentation in gradio_god_mode.py after adding if __name__ wrapper"""

with open('gradio_god_mode.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "with gr.Row():" after the if __name__ block
in_blocks = False
fixed_lines = []
for i, line in enumerate(lines):
    if 'if __name__ == "__main__":' in line and 'with gr.Blocks(' in lines[i+1] if i+1 < len(lines) else False:
        in_blocks = True
        fixed_lines.append(line)
        continue
    
    if in_blocks and line.strip() and not line.strip().startswith('#'):
        # Inside the if __name__ block, add 4 spaces to UI code
        if i > 1170 and i < 1400:  # Approximate range of UI code
            if line.startswith('    ') and not line.startswith('        '):
                # Lines with 4 spaces need to become 8 spaces
                if 'with gr.' in line or 'gr.HTML' in line or 'gr.Textbox' in line or 'gr.Dropdown' in line or 'gr.Button' in line or 'gr.Slider' in line or 'gr.Markdown' in line or 'gr.DownloadButton' in line or line.strip().startswith('node_') or line.strip().startswith('fail_') or line.strip().startswith('severity_') or line.strip().startswith('predict_') or line.strip().startswith('from_') or line.strip().startswith('to_') or line.strip().startswith('add_') or line.strip().startswith('load_') or line.strip().startswith('clear_') or line.strip().startswith('pdf_') or line.strip().startswith('result_') or line.strip().startswith('status_') or line.strip().startswith('network_') or '# ===' in line:
                    fixed_lines.append('    ' + line)
                    continue
    
    fixed_lines.append(line)

with open('gradio_god_mode.py', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("✓ Fixed indentation")
