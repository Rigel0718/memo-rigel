# 파이썬 함수와 Method에 대한 이해 — 시리즈 계획

- 컬렉션: `Python 개념 톺아보기` (`python`)
- 에피소드 디렉터리: `src/content/posts/python/understanding-python-functions-and-methods/`
- 전체 편수: 7편 (`src/config/postTopics.ts`의 `episodeCount`)
- 진행 상황: 01~05편 게시

에피소드마다 하나의 핵심 질문이 분명하게 드러나도록 구성한다.

## 목차

### 01. Python에서 함수는 어떻게 만들어지는가?

`def` → Function Object → Name Binding → `__name__` → `__code__` → Callable

`def`가 실행되면 무엇이 생성되고, 함수 이름은 무엇을 가리키는지 이해한다.

### 02. 함수는 변수를 어디에서 찾아오는가?

Scope → Namespace → Local → Enclosing → Global → Built-in → LEGB

함수 내부에서 이름을 찾는 규칙과 Scope의 관계를 이해한다.

### 03. 함수가 끝났는데 변수는 어떻게 살아남는가?

Nested Function → Free Variable → Closure → Cell → `__closure__`

외부 함수의 호출이 끝난 뒤에도 내부 함수가 변수를 참조할 수 있는 이유를 살펴본다.

### 04. Decorator는 함수를 어떻게 감싸고 바꾸는가?

Function Object → Higher-order Function → Wrapper → Closure → `@decorator`

함수를 다른 함수에 전달하고 반환하는 구조를 Decorator와 연결한다.

- 범위에서 뺀 것: 인자를 받는 Decorator, 여러 Decorator의 적용 순서, Class Decorator와 `__call__` 기반 Decorator. `classmethod`/`staticmethod`는 07편에서 다룬다.

### 05. Class 안에 정의한 함수는 어떻게 Method가 되는가?

Class Body 실행 → Class Namespace ≠ Enclosing Scope → `__get__()` → Lookup 위치와 Binding

Class 내부의 Function이 Instance를 통해 접근될 때 무엇이 달라지는지 이해한다.

- 관점: Method 여부는 정의한 위치가 아니라 Attribute Lookup에서 Function을 Class 쪽에서 찾았는가로 정해진다.
- 「파이썬 객체에 대한 이해」 06편이 Descriptor, Data/Non-data 우선순위, Bound Method 개념, instance attribute로 method를 가리는 예를 이미 다룬다. 이 내용은 반복하지 않고 06편을 링크한다.
- 06편으로 넘긴 것: `__func__`/`__self__`, 호출 시 인자 전달 구조, `p.hello is p.hello`가 `False`인 이유, `self` 이름 관례.

### 06. Bound Method는 Instance를 어떻게 전달하는가?

Function → Descriptor → `__get__()` → Bound Method → `__func__` → `__self__` → Method Call

`self`가 특별한 문법이 아니라 Binding 과정에서 연결된 객체가 전달되는 방식임을 살펴본다.

### 07. Instance Method, Class Method, Static Method는 무엇이 다른가?

Instance Binding → `self` / `classmethod` → Class Binding → `cls` / `staticmethod` → No Binding

세 방식의 Attribute Access와 Binding 차이를 비교하고 Function과 Method의 관계를 정리한다.

## 05편과 06편의 구분

두 편은 유사해 보이지만 학습 목표를 분리한다.

- 05편: Class의 Function이 왜 Method처럼 동작하는가.
- 06편: Bound Method가 실제로 Instance를 어떻게 전달하는가.
