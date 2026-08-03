# GEMINI Configuration and CLI Documentation

This file (`GEMINI.md`) is used to define custom, persistent rules and instructions for your AI coding assistant. Any instructions you place in this file will automatically be read and strictly followed across all conversations within this workspace.

## Custom AI Rules & Coding Standards
*Add your project-specific rules, architectural preferences, or formatting guidelines below this line.*

- Example: "Always use double quotes for strings."
- Example: "Ensure all React components use function declarations, not arrow functions."

---

## Gemini CLI Reference
If you are integrating with Gemini via a Command Line Interface (CLI), here is a quick reference guide to get started.

### Installation
Depending on the specific CLI tool you are using (e.g., npm or pip), installation typically looks like:
```bash
# Example for a Node-based CLI
npm install -g @google/generative-ai-cli
```

### Common Commands
- **Start a chat session:** 
  `gemini chat`
- **Generate text or code from a prompt:**
  `gemini generate "Write a Python script to parse JSON"`
- **List available models:**
  `gemini models list`
- **Configure authentication/API keys:**
  `gemini setup` or `gemini config set api_key <YOUR_API_KEY>`

*(Note: Command syntax may vary slightly depending on the exact Gemini CLI package or Google Cloud SDK you are utilizing. Use `gemini --help` for the specific options available in your environment.)*
