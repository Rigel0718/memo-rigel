---
title: "02. Agent의 실행이 중단되면 누가 다시 이어가야 하는가?"
description: "HITL과 Resume을 구현하는 과정을 살펴보고, Agent Loop와 Orchestration Loop 사이의 책임 분리와 실행 재개 구조를 이해합니다."
pubDatetime: 2026-10-16T09:00:00+09:00
tags:
  - AI Agent
  - Agent 설계 노트
  - HITL
  - Resume
  - Orchestration
draft: False
---

Agent를 처음 구현한다면 아마 가장 먼저 떠올리는 구조가 있을 것이다.

사용자의 Input을 받아 LLM을 호출하고, 필요한 경우 Tool을 실행한다. Tool의 실행 결과는 다시 LLM에게 전달되고, 이 과정이 반복되다가 최종 Output을 반환한다.

```text
Input
  ↓
Agent Loop
  ├── LLM
  └── Tool
  ↓
Output
```

가장 기본적인 Agent Loop다.

`tool-mcp-skill-lab` 프로젝트에서도 이 구조를 바탕으로 Agent를 구현했다.

그런데 Tool 실행에 Approval을 추가하면서 한 가지 문제가 생겼다.

Agent가 Tool을 호출했지만, 사용자 승인이 필요해 바로 실행할 수 없는 상황이다.

이때 Agent는 어떻게 해야 할까?

사용자에게 승인을 요청하고 응답을 기다리는 과정까지 Agent Loop 안에서 처리해야 할까? 아니면 Agent Loop의 역할은 그대로 두고, 바깥에서 이 과정을 관리할 수 있을까?

여기서 고민할 부분은 단순히 사용자에게 승인 여부를 묻는 방법만은 아니었다.

기존 Agent Loop는 LLM과 Tool을 반복해서 실행하는 역할을 가지고 있었다.

그렇다면 HITL이라는 새로운 요구사항이 생겼을 때, 사용자 입력과 승인 이후의 흐름까지 Agent Loop가 담당하도록 역할을 확장해야 할까?

아니면 기존 역할을 유지하면서 새로운 요구사항을 처리할 방법이 있을까?

**새로운 기능이 필요하다는 이유만으로, 기존 컴포넌트의 책임까지 바뀌어야 하는 것은 아닐 것이다.**

이번에는 이 질문에서 출발해 HITL을 구현하는 구조를 고민했다.

## Agent Loop는 어디까지 담당해야 할까?

기존 Agent Loop의 역할은 비교적 명확했다.

LLM이 다음 행동을 판단하고, Tool Call이 발생하면 Tool을 실행한다. 실행 결과를 다시 LLM에 전달하고, 작업이 완료될 때까지 이 과정을 반복한다.

그런데 HITL이 추가되면서 새로운 작업이 필요해졌다.

사용자에게 승인 여부를 묻고, 그 결정에 따라 원래 Tool Call을 실행하거나 거부해야 한다. 이후 Agent가 작업을 계속할지, 현재 요청을 종료할지도 처리해야 한다.

물론 이 과정을 모두 Agent Loop 내부에 구현할 수도 있다.

하지만 여기서 한 가지 생각해 볼 필요가 있었다.

**새로운 기능이 추가되었다고 해서 그 기능을 기존 Agent Loop가 반드시 책임져야 할까?**

Agent Loop에 사용자 승인 처리까지 추가한다면, LLM과 Tool을 반복하는 기존 역할에 HITL의 실행 흐름을 관리하는 역할까지 더해진다.

반면 Agent Loop는 기존 역할을 유지하고, 사용자 승인과 실행 재개를 별도의 영역에서 처리하도록 설계할 수도 있다.

나는 후자가 이번 프로젝트에 더 적절하다고 생각했다.

Agent Loop의 역할을 명확하게 유지하면서도 HITL을 구현할 수 있다면, 굳이 그 안에 새로운 책임을 추가할 이유는 없었다.

그렇다면 남은 문제는 하나였다.

**Agent Loop가 사용자 결정을 직접 처리하지 않는다면, 그 흐름을 누가 관리해야 할까?**

이 질문에서 상위 Orchestration Loop를 도입하게 되었다.

## Agent Loop 바깥에 흐름을 만들다

기존에는 사용자의 요청을 받으면 Agent Loop를 실행하고, 결과가 반환되면 다시 다음 사용자 입력을 받는 구조였다.

하지만 HITL이 추가되면서 하나의 사용자 요청이 반드시 한 번의 Agent Loop 실행으로 끝나지는 않게 되었다.

예를 들어 사용자가 기존 파일의 수정을 요청했다고 생각해 보자.

Agent가 `write_file`을 호출했지만, Approval이 필요해 실행을 진행할 수 없다.

이때 Agent Loop를 중단하고 사용자에게 승인 여부를 묻는다.

사용자가 승인하면 원래 Tool Call을 실행하고, 결과를 Agent에게 전달해 작업을 이어가야 한다.

반대로 거부했다면 Tool을 실행하지 않고 다른 방법을 찾도록 하거나, 현재 작업을 종료할 수도 있다.

이처럼 하나의 요청을 처리하는 과정에서 Agent Loop가 여러 번 실행될 수 있다.

```text
Conversation Loop
    │
    └── Agent Run Orchestration Loop
            │
            ├── Agent Loop
            │      └── Approval 필요
            │
            ├── 사용자 결정
            │
            └── Agent Loop
                   └── 작업 계속
```

그래서 이번 구현에서는 실행 흐름을 세 단계로 구분했다.

**Conversation Loop**는 사용자의 입력을 받고 대화 전체의 맥락을 유지한다.

**Agent Loop**는 LLM과 Tool의 실행을 반복한다.

그리고 그 사이에 **Agent Run Orchestration Loop**를 두어 하나의 요청에서 발생하는 HITL과 Resume을 관리하도록 했다.

여기서 중요한 것은 Agent Loop를 계속 실행 상태로 유지하는 것이 아니라는 점이다.

Approval이 필요해지면 현재 Agent Loop는 종료된다.

대신 상위 Orchestration Loop가 사용자 결정을 처리하고, 필요한 경우 새로운 Agent Loop를 시작한다.

이렇게 하면 Agent Loop의 기존 역할을 유지하면서도, 하나의 사용자 요청 안에서 중단과 재개를 처리할 수 있다.

## 중단된 실행은 어떻게 이어지는가?

그렇다면 Agent Loop를 종료한 뒤 어떻게 이전 작업을 이어갈 수 있을까?

먼저 중단이 필요한 상황을 Application에 알려야 한다.

이번 구현에서는 Approval이 필요한 Tool Call을 만나면 Gateway가 `ApprovalRequiredError`를 발생시킨다.

Agent Loop는 이를 일반적인 Tool 실행 실패로 LLM에 전달하지 않고, `PendingApproval`이라는 결과로 변환해 반환한다.

```text
Agent Loop
    │
    └── Tool Call
            │
            ▼
          Gateway
            │
            └── ApprovalRequiredError
                        │
                        ▼
                 PendingApproval
                        │
                        ▼
                Orchestration Loop
```

`PendingApproval`은 Tool 실행이 실패했다는 의미가 아니다.

**Tool을 실행하기 전에 사용자 결정이 필요하므로, 현재 흐름을 중단한다는 의미**다.

Orchestration Loop는 이 결과를 받아 사용자에게 승인 여부를 묻는다.

이번 프로젝트에서는 세 가지 선택지를 제공했다.

- `APPROVE`: 원래 Tool Call을 승인하고 실행한다.
- `REJECT + CONTINUE`: 실행을 거부하지만 Agent가 다른 방법을 찾을 수 있도록 이어간다.
- `REJECT + STOP`: 실행을 거부하고 현재 Agent Run을 종료한다.

여기서 승인 여부만 처리하면 끝나는 것은 아니다.

Agent가 작업을 이어가려면 이전에 요청했던 Tool Call이 어떻게 처리되었는지도 알아야 한다.

이를 위해 사용자 결정 이후의 결과를 기존 대화 기록에 추가했다.

### 기존 대화 기록으로 Resume하기

이번 구현을 복습하면서 가장 새롭게 이해한 부분은 Resume이었다.

이전에는 Checkpoint를 이용해 실행 상태를 저장하고 복구하는 방식으로 Resume을 접한 적이 있었다.

그런데 이번 프로젝트에서는 별도의 Checkpoint를 구현하지 않았다.

대신 Application이 `messages`라는 리스트로 대화 기록을 메모리에 유지하고 있었다.

Agent Loop가 중단되더라도 이 기록은 사라지지 않는다.

예를 들어 Agent가 다음과 같은 Tool Call을 요청했다고 생각해 보자.

```text
User: 기존 파일을 수정해 줘.
Assistant: write_file(...) 호출
```

여기서 Approval이 발생하면 Agent Loop는 종료되지만, Tool Call이 포함된 대화 기록은 그대로 보존된다.

사용자가 승인하면 원래 Tool Call을 실행한 뒤 그 결과를 추가한다.

```text
User: 기존 파일을 수정해 줘.
Assistant: write_file(...) 호출
Tool: 파일 수정 완료
```

그리고 새로운 Agent Loop를 실행한다.

LLM 입장에서는 이전 Python 함수가 종료되었다는 사실보다, 자신이 요청했던 Tool Call의 결과가 무엇인지가 중요하다.

기존 대화 기록에 결과가 추가되어 있으므로 이를 바탕으로 다음 행동을 판단할 수 있다.

이때 Tool Call과 결과는 `call_id`로 연결된다.

사용자가 거부한 경우에도 마찬가지다.

```text
Assistant
    └── function_call
         call_id: call_123
         name: write_file
               │
               ▼
         사용자 REJECT
               │
               ▼
    function_call_output
         call_id: call_123
         output: "Tool call rejected by the user."
```

Agent는 자신이 요청한 Tool Call이 거부되었다는 사실을 전달받는다.

이후 다른 방법을 찾거나, 사용자에게 상황을 설명하거나, 작업을 마무리할 수 있다.

결국 이번 구현에서 Resume은 **중단된 Python 함수의 실행 위치로 돌아가는 것이 아니라, 기존 대화 기록에 실행 결과를 추가하고 새로운 Agent Loop를 시작하는 것**이었다.

이 방식을 사용하면서 별도의 Checkpoint 없이도 작업의 연속성을 유지할 수 있었다.

## 이번 구조에서 선택한 범위

물론 이번에 구현한 방식으로 모든 중단과 재개 상황을 처리할 수 있는 것은 아니다.

우선 `messages`를 메모리에 보존하고 있기 때문에 프로세스가 종료되면 해당 기록도 사라진다.

사용자 승인을 기다리는 동안 프로세스가 종료되거나, 며칠 뒤에 승인 결과가 도착하는 상황까지 지원하려면 실행 상태를 별도로 보존하고 복구하는 구조가 필요할 것이다.

이번에는 그런 Durable Execution을 구현하지 않았다.

또한 한 모델 턴에서 여러 Tool Call을 처리하지 않도록 제한했다.

예를 들어 다음과 같은 상황을 생각해 보자.

```text
LLM Response
    ├── Tool A → 실행 완료
    ├── Tool B → Approval 필요
    └── Tool C → 아직 실행하지 않음
```

Tool B에서 실행을 중단한다면, 아직 처리하지 않은 Tool C도 관리해야 한다.

어떤 Tool Call이 완료되었고, 어떤 호출이 승인을 기다리고 있는지, 이후 남은 호출을 어떤 순서로 처리할 것인지에 대한 상태가 추가로 필요해진다.

이번에는 `parallel_tool_calls=False`를 설정해 한 모델 턴의 Tool Call을 하나로 제한했다.

이러한 제약 덕분에 별도의 Pending Queue나 실행 Cursor 없이 HITL과 Resume을 구현할 수 있었다.

하지만 이것이 HITL에서 여러 Tool Call을 지원할 수 없다는 의미는 아니다.

앞으로 여러 Tool Call을 처리하거나, 프로세스가 종료된 이후에도 실행을 재개해야 한다면 지금과는 다른 상태 관리가 필요할 수 있다.

그때는 새로운 기능을 추가하는 것뿐 아니라, **현재 나누어 놓은 책임과 역할이 여전히 적절한지도 다시 검토해야 할 것이다.**

이번 구현에서는 그 문제까지 다루지 않았다.

## Agent Loop를 유지하면서 확장한다는 것

가장 기본적인 Agent Loop는 Input을 받아 LLM과 Tool의 반복을 거쳐 Output을 반환하는 구조다.

이번에는 여기에 HITL이라는 새로운 요구사항이 추가되었다.

사용자의 승인을 받고, 실행을 중단했다가 다시 이어가는 기능이 필요해진 것이다.

이를 모두 Agent Loop 내부에서 처리할 수도 있었겠지만, 이번 프로젝트에서는 다른 방법을 선택했다.

Agent Loop는 기존처럼 LLM과 Tool의 실행에 집중하도록 두고, 상위 Orchestration Loop가 사용자 결정과 Resume을 관리하도록 했다.

그 과정에서 `PendingApproval`이라는 중단 결과를 사용했고, 기존 `messages`를 보존해 새로운 Agent Loop에서도 작업의 연속성을 유지할 수 있었다.

돌아보면 이번에 고민했던 것은 HITL을 어떻게 구현할 것인가뿐만은 아니었다.

**새로운 기능을 추가할 때 기존 구조의 책임을 어디까지 유지하고, 새롭게 필요한 역할을 어디에 둘 것인가.**

Agent Loop라는 기본적인 구조는 단순하다.

하지만 실제 Application에서 요구하는 기능이 늘어나면 그만큼 해결해야 할 문제도 많아진다.

그때마다 Agent Loop에 새로운 책임을 추가하는 것이 적절할 수도 있고, 이번처럼 다른 영역에 책임을 분리하는 편이 나을 수도 있다.

중요한 것은 기능이 추가된다는 이유만으로 기존 컴포넌트의 역할을 당연하게 확장하지 않는 것이라고 생각한다.

이번 HITL 구현에서는 Orchestration Loop를 통해 Agent Loop의 기본 역할을 유지하는 방식을 선택했다.

앞으로 더 복잡한 실행 구조를 다루게 된다면 이 책임 경계도 달라질 수 있을 것이다.

다만 그때도 먼저 고민해야 할 질문은 비슷하지 않을까.