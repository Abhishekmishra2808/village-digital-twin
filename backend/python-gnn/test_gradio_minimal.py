"""
Minimal Gradio Interface - Just to test if Gradio works
"""
import gradio as gr

def predict(text):
    return f"You entered: {text}"

demo = gr.Interface(
    fn=predict,
    inputs=gr.Textbox(label="Input"),
    outputs=gr.Textbox(label="Output"),
    title="Test Gradio"
)

if __name__ == "__main__":
    demo.launch(server_port=7875)
