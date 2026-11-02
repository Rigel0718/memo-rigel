# memo-rigel 시리즈 및 에피소드 문맥

**시리즈는 콘텐츠의 범위**, **Writing Mode는 사용자와 함께 작업하는 방식**을 결정한다. 시리즈명으로 Mode를 고정하지 않는다. 에피소드의 앞뒤 연결은 자료로 확인된 범위만 사용한다.

## 사유·설계 중심 시리즈 (기본값: 사유형 기술 에세이)
### Agent에 대한 고찰
- Agent의 정의·필요성·역할과 설계에 대한 문제의식을 탐색한다.
- 제공된 참고 원고 「01. Agent란 무엇인가?」에서는 LLM/Workflow/Agent를 비교한 뒤 Ownership이라는 개인적 관점에 도달한다. **이는 해당 글의 결론이지 모든 글의 의무 주제가 아니다.**

### Agent 설계 노트
- 실제 `tool-mcp-skill-lab` 구현과 복습을 통해 문제, 선택 이유, 책임 경계, 한계, 이후 새롭게 이해한 것을 다룬다.
- 「01. Agent에게 Tool을 사용할 권한을 어디까지 줄 것인가?」는 Permission/Approval과 `write_file` 사례로 전개했다.
- 「02. Agent의 실행이 중단되면 누가 다시 이어가야 하는가?」 대화에서는 기존 Agent Loop의 책임을 유지할지, HITL을 어디에 배치할지가 핵심 메시지였다. 이때의 구성은 다음 글의 고정 형식이 아니다.
- 기술 내용 자체를 배우려는 요청이라면 같은 시리즈에서도 개념 학습형을 선택할 수 있다.

## 개념 이해 중심 시리즈 (기본값: 개념 학습형 해설)
### Python 개념 톺아보기
- Python 동작의 개념·내부 원리·연관 관계를 사용자와 먼저 공부하고, 검증한 이해를 학습 가능한 설명으로 정리한다.
- 하위 시리즈 예: 「파이썬 실행에 대한 이해」. 01 Source→Token/Lexer/Parser/AST, 02 AST→Compiler/Code Object/Bytecode, 03 Interpreter/VM, 04 Frame/실행 상태, 05 함수 호출, 06 Iterator, 07 Generator, 08 Coroutine, 09 Event Loop, 10 Thread, 11 GIL.
- 제공된 11편 GIL 원고는 OS Scheduling과 CPython GIL을 구분하고 CPU/I-O bound, Native Code, free-threaded CPython을 연결한다. 긴 중복 도식·반복 요약은 **개선 후보**이지 따라야 할 문체가 아니다.
- 관련 버전·구현 세부 사항은 집필 시 현재 공식 자료로 확인한다. 제공된 원고 자체만으로 최신 사실을 확정하지 않는다.

### Python으로 이해하는 운영체제
- Python 프로그램의 실행 현상에서 Process, System Call, File Descriptor, 표준 입출력, Pipe, Event Loop, MCP stdio 등의 OS 개념으로 연결하는 학습형 시리즈.
- 실제 원고 분석에 기초한 문체 규칙은 아직 없으므로 구성 템플릿을 강제하지 않는다.

## 시리즈 문맥 활용
- 앞선 글의 선수 개념과 현재 글의 학습 목표를 확인한다. 실제 텍스트가 없으면 이미 읽었다고 가장하지 않는다.
- 사용자가 특정 시리즈의 핵심 주장/학습 범위를 수정하면 목록보다 사용자 지시를 우선한다.
- 에피소드 순서를 반드시 따라가며 집필해야 하는 것은 아니다.
