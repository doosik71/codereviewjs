# TODO for codereviewjs

## Application Setup

- [x] Initialize Next.js project.
- [x] Set up project structure for a Single Page Application.

## Main Page UI

- [x] Create the main layout with a left sidebar and a main content area.
- [x] Implement the left sidebar for prompt management.
- [x] Add an input field or editor in the sidebar to modify prompts.
- [x] Create a text area in the main content area for pasting source code.
- [x] Add a "Review" button.
- [x] Implement the side-by-side view for code comparison (left: original, right: reviewed).

## Core Functionality

- [x] Implement the logic to send the source code and prompt to the GPT OSS API at `http://127.0.0.1:11434/`.
- [x] Handle the API response from the GPT OSS.
- [x] Display the reviewed code in the right-side view of the comparison.
- [x] Implement state management for prompts, source code, and reviewed code.

## Enhancements

- [x] Add syntax highlighting to the code editors.
- [x] Implement loading and error states for the API request.
- [x] Add a feature to copy the reviewed code.

## 기타

- 코드가 길면 좌측의 코드 에디터과 우측의 Reivew에 각각의 스크롤바가 표시되어야 한다.
- 여전히 좌측의 코드 에디터가 세로로 지나치게 길어지면서 전체 화면에 스크롤바가 나타나고 있다. 전체 화면은 스크롤되면 안된다.
- Default Prompt, Code Refactoring, Bug Detection, Performance Improvement 각각에 대한 기본 프롬프트를 제공해야 한다.
- 여전히 textarea에 내용이 많아지면 화면의 높이를 넘어가고 전체 화면이 스크롤된다. 디버깅을 시도하여 문제의 원인을 분석하라.
- 전체 화면에 스크롤되지는 않지만 여전히 textarea의 높이가 화면 범위를 넘어가버린다.
- textarea에 내용이 많아지면 높이가 약 2줄 정도 더 커져서 하단의 "Review Code" 버튼을 가려버린다.
- 여전히 textarea의 scrollHeight가 clientHeight보다 커지는 문제가 있다.
- 스크롤바가 두개가 겹친다. textarea에도 스크롤바가 나타나고, textarea의 컨테이너에도 스크롤바가 나타난다. 블록을 일부 선택하고 스크롤하면 선택된 블록만 스크롤되고 선택되지 않은 텍스트는 스크롤되지 않는 문제도 있다.
- 스크롤이 전혀 안된다. react-simple-code-editor의 문제인 것 같다. 다른 컴포넌트를 사용하라.
- Reviewed code에 수직 스크롤바가 두개가 나타난다.
- 오른쪽 Reviewed code의 상하단에 margin을 없애라.
- 신텍스 하이라이트를 위한 언어를 선택할 수 있게 하라. Java, C/C++, Python, HTML, Javascript, Rust, Golang 등.
- 언어 선택 기능은 사이드바에 두어라.
- 네개의 프롬프트에 대한 기본값을 생성하라. 사용자가 프롬프트를 변경하면 설정파일에 저장해야 한다.
- 리뷰를 요청했지만 결과가 화면에 표시되지 않고 있다. 로그 메시지를 출력하고 원인을 분석하라.
- ollama 의 서버 주소를 설정 파일에서 읽도록 수정하라.
