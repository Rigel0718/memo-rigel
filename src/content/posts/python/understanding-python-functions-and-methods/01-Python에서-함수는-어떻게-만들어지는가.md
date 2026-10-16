---
title: "01. Python에서 함수는 어떻게 만들어지는가?"
description: "Python에서 def 문을 통해 Function Object가 생성되고 이름에 바인딩되는 과정을 살펴보고, Code Object와 Callable의 개념을 이해합니다."
pubDatetime: 2026-10-16T11:00:00+09:00
tags:
  - Python
  - 파이썬 함수와 Method에 대한 이해
  - Function Object
  - Name Binding
  - Callable
draft: False
---

# 01. Python에서 함수는 어떻게 만들어지는가?

Python에서 함수를 정의할 때는 `def` 키워드를 사용한다.

```python
def add(a, b):
    return a + b

result = add(1, 2)
```

익숙한 코드다. `def`로 함수를 정의하고, `add(1, 2)`로 함수를 호출하면 `3`이 반환된다.

그런데 조금 다른 관점에서 생각해 보자.

`def`를 실행하면 Python 내부에서는 무엇이 만들어질까? `add`는 함수 자체일까, 아니면 함수를 가리키는 이름일까?

이 질문에 답하려면 먼저 Python에서 **함수 역시 하나의 객체(Object)** 라는 사실을 이해해야 한다.

이번 글에서는 `def`가 실행될 때 Function Object가 어떻게 만들어지고, 이름에 바인딩되며, 호출 가능한 객체로 사용되는지 살펴보자.

## 1. `def`는 무엇을 만드는가?

Python에서 `def`는 단순히 함수의 형태를 선언하는 문법이 아니다. **실행 가능한 문장(Statement)** 이다.

```python
def add(a, b):
    return a + b
```

이 문장이 실행되면 Python은 크게 두 가지 작업을 수행한다.

1. 새로운 Function Object를 생성한다.
2. 생성한 Function Object를 `add`라는 이름에 바인딩한다.

여기서 Function Object는 Python의 사용자 정의 함수를 나타내는 객체다. 정수나 문자열, 리스트처럼 함수도 하나의 객체로 취급된다.

실제로 확인해 보자.

```python
def add(a, b):
    return a + b

print(type(add))
# <class 'function'>
```

`add`를 통해 참조하는 객체의 타입은 `function`이다.

그렇다면 `def`를 실행하는 순간 함수 본문의 `return a + b`까지 실행되는 것일까?

그렇지는 않다.

**함수 정의(Function Definition)와 함수 호출(Function Call)은 서로 다른 동작**이기 때문이다.

```python
def add(a, b):
    print("함수 본문 실행")
    return a + b

print("함수 정의 완료")
```

이 코드를 실행하면 다음 결과가 출력된다.

```text
함수 정의 완료
```

`def`가 실행되면서 Function Object는 만들어졌지만, 함수 본문에 있는 `print()`는 실행되지 않았다.

함수 본문은 이후 `add(1, 2)`처럼 함수를 호출할 때 실행된다.

다만 함수의 기본 인자 표현식은 정의 시점에 평가될 수 있다. 함수 본문을 실행하지 않는다는 것과 함수 정의 과정에서 아무 표현식도 평가하지 않는다는 것은 구분해야 한다.

결국 `def`는 나중에 호출할 수 있는 함수 객체를 생성하고, 그 객체에 이름을 연결하는 작업이라고 이해할 수 있다.

## 2. 함수 이름과 Function Object는 같은 것일까?

앞에서 `def`가 Function Object를 생성하고 `add`라는 이름에 바인딩한다고 설명했다.

그렇다면 다음 코드는 어떻게 동작할까?

```python
def add(a, b):
    return a + b

x = add
```

`x = add`는 새로운 Function Object를 생성할까?

그렇지 않다. `x`는 `add`가 참조하는 기존 Function Object에 바인딩된다.

```python
print(add is x)  # True
```

`is` 연산자는 두 표현식이 동일한 객체를 참조하는지 확인한다.

따라서 `add is x`가 `True`라는 것은 두 이름이 같은 Function Object를 가리킨다는 뜻이다.

```text
Name              Object

add ─────┐
         ├─────► Function Object
x ───────┘
```

여기서 중요한 것은 **이름(Name)과 객체(Object)가 서로 다른 개념**이라는 점이다.

- `add`는 Function Object에 바인딩된 이름이다.
- `x` 역시 같은 Function Object에 바인딩된 이름이다.
- Function Object는 두 이름과 별개로 존재하는 객체다.

이러한 관계는 이름을 삭제하면 더욱 명확해진다.

```python
def add(a, b):
    return a + b

x = add

del add

print(x(1, 2))  # 3
```

`del add`를 실행했는데도 `x(1, 2)`는 정상적으로 동작한다.

`del add`는 `add`라는 이름의 바인딩을 제거하는 것이지, Function Object 자체를 직접 삭제하는 작업이 아니기 때문이다.

`add`라는 이름은 사라졌지만 `x`는 여전히 해당 Function Object를 참조하고 있다.

### 함수 객체가 가진 이름, `__name__`

여기서 한 가지 궁금증이 생긴다.

함수 이름과 Function Object가 별개라면, Function Object 자체에도 이름이 있을까?

Python의 사용자 정의 Function Object는 `__name__`이라는 속성을 가지고 있다.

```python
def add(a, b):
    return a + b

x = add

print(add.__name__)  # add
print(x.__name__)    # add
```

`x`라는 이름으로 접근했는데도 `__name__`은 `"add"`다.

이유는 간단하다. `__name__`은 변수가 아니라 **Function Object에 저장된 문자열 속성**이기 때문이다.

또한 이 속성은 수정할 수 있다.

```python
x.__name__ = "calculate"

print(add.__name__)  # calculate
print(x.__name__)    # calculate
```

두 이름이 같은 객체를 참조하므로 어느 이름을 통해 접근하든 변경된 속성을 확인할 수 있다.

하지만 `__name__`을 수정했다고 해서 `add`라는 변수 이름이 `calculate`로 바뀌는 것은 아니다.

즉, 다음 두 개념은 구분해야 한다.

- **Name Binding**: 이름이 특정 객체를 참조하도록 연결되는 관계
- **`__name__`**: Function Object가 가진 이름 정보

`__name__`은 함수의 고유 식별자가 아니며, 서로 다른 함수 객체가 동일한 `__name__`을 가질 수도 있다.

## 3. Function Object는 어떤 정보를 가지고 있을까?

지금까지는 Function Object를 하나의 객체로 취급하면서 이름과의 관계를 살펴봤다.

그런데 함수 객체는 이름 외에도 여러 정보를 가지고 있다.

함수를 호출하려면 실행할 코드뿐 아니라 매개변수, 기본 인자, 전역 이름 공간 등의 정보가 필요하기 때문이다.

대표적인 속성을 살펴보자.

| 속성 | 역할 |
|---|---|
| `__name__` | 함수 객체의 이름 |
| `__code__` | 컴파일된 함수 코드를 나타내는 Code Object |
| `__defaults__` | 위치 인자 및 위치 전용 인자의 기본값 |
| `__globals__` | 함수가 참조하는 전역 네임스페이스 |

이 속성들 가운데 먼저 살펴볼 것은 `__code__`다.

### Function Object와 Code Object

```python
def add(a, b):
    return a + b

print(type(add))
print(type(add.__code__))
```

실행 결과는 다음과 같다.

```text
<class 'function'>
<class 'code'>
```

`add`가 참조하는 객체는 Function Object지만, `add.__code__`는 Code Object다.

**Function Object와 Code Object는 서로 다른 객체**인 것이다.

Code Object는 컴파일된 코드와 실행에 필요한 메타데이터를 담고 있다.

```python
code = add.__code__

print(code.co_name)      # add
print(code.co_argcount)  # 2
print(code.co_varnames)  # ('a', 'b')
```

여기서 `co_name`은 코드의 이름, `co_argcount`는 위치 인자의 개수, `co_varnames`는 지역 변수의 이름들을 나타낸다.

이외에도 Code Object에는 상수, Bytecode 등 여러 정보가 저장되어 있다.

그런데 Code Object에 실행할 코드가 들어 있다면, 굳이 Function Object가 따로 필요한 이유는 무엇일까?

### Function Object와 Code Object는 왜 구분될까?

Code Object에는 컴파일된 코드와 메타데이터가 담겨 있지만, 함수 실행에 영향을 주는 모든 상태가 들어 있는 것은 아니다.

기본 인자를 예로 들어 보자.

```python
def greet(name="Alice"):
    return f"Hello, {name}"

print(greet.__defaults__)  # ('Alice',)
```

`__defaults__`는 Function Object가 가진 속성으로, 기본 인자 값들을 튜플 형태로 저장한다.

이 값을 변경해 보자.

```python
greet.__defaults__ = ("Bob",)

print(greet())  # Hello, Bob
```

함수 본문은 변경하지 않았지만 실행 결과가 달라졌다.

Code Object는 그대로이고 Function Object가 가진 기본 인자 정보만 달라졌기 때문이다.

즉, 함수 실행은 Code Object만으로 결정되지 않는다.

Function Object는 Code Object뿐 아니라 기본 인자와 전역 네임스페이스 등의 실행 관련 정보를 함께 참조한다.

이 관계를 표현하면 다음과 같다.

```text
greet
  │
  ▼
Function Object
  ├── __name__     = "greet"
  ├── __code__     ─────► Code Object
  ├── __defaults__ ─────► ("Bob",)
  └── __globals__  ─────► 전역 네임스페이스
```

여기서 핵심은 **Function Object가 코드와 실행에 필요한 상태를 연결하는 역할을 한다**는 것이다.

실제로 서로 다른 Function Object가 동일한 Code Object를 참조하면서, 기본 인자나 전역 네임스페이스 등 서로 다른 상태를 가질 수도 있다.

Code Object의 구체적인 Bytecode 구조나 Interpreter의 실행 과정은 별도의 주제다. 이번에는 Function Object와 Code Object의 역할을 구분하는 데 집중하자.

## 4. Callable은 무엇을 의미하는가?

마지막으로 Function Object의 중요한 특징을 살펴보자.

우리는 앞에서 Function Object가 하나의 객체라는 사실을 확인했다.

그런데 정수나 문자열 등의 객체와 달리 Function Object는 다음과 같이 호출할 수 있다.

```python
def add(a, b):
    return a + b

print(add(1, 2))  # 3
```

Python에서는 이렇게 **호출 연산을 적용할 수 있는 객체를 Callable**이라고 부른다.

`callable()` 내장 함수를 사용하면 객체가 호출 가능한지 확인할 수 있다.

```python
def add(a, b):
    return a + b

number = 10

print(callable(add))     # True
print(callable(number))  # False
```

`add`가 참조하는 Function Object는 Callable이지만, 일반적인 `int` 객체는 그렇지 않다.

그렇다면 모든 Callable이 Function Object일까?

그렇지는 않다.

```python
class Person:
    pass

print(callable(Person))  # True
```

클래스 역시 Callable이다. `Person()`처럼 호출하면 일반적으로 새로운 인스턴스를 생성할 수 있다.

즉, Callable은 특정 객체 타입의 이름이 아니라 **객체가 호출 가능한지를 나타내는 개념**이다.

여기서 앞서 공부한 Name Binding과 연결해 보자.

```python
def add(a, b):
    return a + b

x = add

print(callable(x))  # True
print(x(1, 2))      # 3
```

`x`라는 이름이 특별한 호출 기능을 가진 것은 아니다.

`x`가 참조하는 Function Object가 Callable이기 때문에 `x(1, 2)`처럼 호출할 수 있는 것이다.

Python의 호출 가능성은 Function Object에만 한정되지 않는다. 다른 객체도 호출을 지원할 수 있으며, 이후 다룰 `__call__`과 Method 개념으로 연결된다.

## 마무리

처음에는 `def`를 단순히 함수를 정의하는 문법으로 생각하기 쉽다.

하지만 Python의 객체 모델에서 바라보면 조금 다른 구조가 보인다.

`def` 문이 실행되면 Function Object가 생성되고, 해당 객체가 이름에 바인딩된다. 이후 다른 이름을 같은 객체에 바인딩하거나, 함수 객체의 속성에 접근할 수도 있다.

Function Object는 `__code__`를 통해 Code Object를 참조하며, 기본 인자나 전역 네임스페이스 등 함수 실행에 필요한 상태와 연결되어 있다. 또한 Function Object는 Callable이므로 이름이 무엇이든 해당 객체를 참조하고 있다면 호출할 수 있다.

결국 Python에서 함수는 **코드에 붙여진 이름 그 자체가 아니라, 코드를 포함한 실행 정보와 연결되어 있는 하나의 객체**다.

이러한 특징 덕분에 함수는 다른 변수에 할당하거나, 함수의 인자로 전달하거나, 다른 함수에서 반환할 수도 있다.

이후 살펴볼 Closure와 Decorator 역시 함수가 하나의 객체라는 사실에서 출발한다.

---

**참고 문서**

- [Python Language Reference — Function definitions](https://docs.python.org/3/reference/compound_stmts.html#function-definitions)
- [Python Data Model — Callable types](https://docs.python.org/3/reference/datamodel.html#callable-types)
- [Python Built-in Functions — callable()](https://docs.python.org/3/library/functions.html#callable)