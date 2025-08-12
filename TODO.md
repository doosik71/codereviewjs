# TODO for codereviewjs

## Remaining Tasks

- [ ] Support streaming output.

## Completed Tasks

### Project Setup

- [x] Initialize Next.js project.
- [x] Set up project structure for a Single Page Application.
- [x] Read the Ollama server address from a configuration file (e.g., `env.local`).

### UI & Layout

- [x] Create the main layout with a left sidebar and a main content area.
- [x] Implement the side-by-side view for code comparison (left: original, right: reviewed).
- [x] Ensure scrollbars appear on both left and right editors when code is long.
- [x] Fix vertical resizing issue of the code editors.
- [x] Implement the left sidebar for prompt management.
- [x] Add an input field or editor in the sidebar to modify prompts.
- [x] Create a text area in the main content area for pasting source code.
- [x] Add a "Review" button.

### Core Functionality

- [x] Implement the logic to send the source code and prompt to the GPT OSS API.
- [x] Handle the API response from the GPT OSS.
- [x] Display the reviewed code in the right-side view of the comparison.
- [x] Implement state management for prompts, source code, and reviewed code.

### Features & Enhancements

- [x] Add syntax highlighting to the code editors.
- [x] Allow selecting the language for syntax highlighting.
- [x] Implement loading and error states for the API request.
- [x] Add a feature to copy the reviewed code.
- [x] Provide default prompts for "Code Refactoring", "Bug Detection", and "Performance Improvement".
- [x] Save user-defined prompts to local storage.
