---
title: "04. Decorator는 함수를 어떻게 감싸고 바꾸는가?"
description: "Python Decorator가 Function Object를 인자로 받아 Wrapper로 감싸고 이름에 다시 바인딩하는 과정을 살펴보고, Closure와 functools.wraps를 통해 원래 함수를 유지하는 원리를 이해합니다."
pubDatetime: 2026-11-02T12:00:00+09:00
tags:
  - Python
  - 파이썬 함수와 Method에 대한 이해
  - Decorator
  - Higher-order Function
  - functools.wraps
draft: False
---

앞선 글에서는 외부 함수의 실행이 끝난 뒤에도 내부 함수가 Cell Object를 통해 외부 변수의 바인딩을 유지한다는 사실을 살펴봤다.

이번에는 이 원리가 실제로 자주 쓰이는 곳을 보자.

```python
def trace(func):
    def wrapper(*args, **kwargs):
        print(f"call {func.__name__}")
        return func(*args, **kwargs)

    return wrapper


@trace
def add(a, b):
    return a + b


print(add(1, 2))
print(add.__name__)
```

실행 결과는 다음과 같다.

```text
call add
3
wrapper
```

`add(1, 2)`를 호출했더니 함수 본문을 실행하기 전에 `call add`가 먼저 출력됐다. 그런데 `add.__name__`을 확인하면 `add`가 아니라 `wrapper`다.

`@trace` 한 줄을 붙였을 뿐인데 `add`라는 이름은 더 이상 우리가 정의한 함수를 가리키지 않는다.

`@trace`는 함수에 무엇을 한 것일까? 그리고 원래의 `add` 함수는 어디로 갔을까?

이 질문을 따라가다 보면 Decorator가 새로운 문법 기능이라기보다 지금까지 살펴본 Function Object, Name Binding, Closure를 조합한 방식이라는 것을 알 수 있다.

## 1. 함수를 인자로 받고 반환하는 함수

첫 번째 글에서 Python의 함수는 하나의 객체이며, 이름은 그 객체에 바인딩된 것이라고 설명했다.

함수가 객체라면 정수나 문자열처럼 다른 함수에 인자로 전달할 수 있고, 함수의 반환값으로 돌려줄 수도 있다.

```python
def call_twice(func):
    func()
    func()


def hello():
    print("hello")


call_twice(hello)
```

```text
hello
hello
```

`call_twice`는 `hello`라는 이름에 바인딩된 Function Object를 인자로 받아 두 번 호출한다. 이때 `hello()`처럼 괄호를 붙이지 않았다는 점에 주의하자. 함수를 호출한 결과가 아니라 Function Object 자체를 전달한 것이다.

앞선 글의 `make_multiplier()`는 반대로 함수를 반환하는 함수였다.

이처럼 함수를 인자로 받거나 함수를 반환하는 함수를 **Higher-order Function**이라고 부른다.

Decorator는 이 두 가지를 한 번에 한다. 함수를 인자로 받고, 그 함수를 감싸는 새로운 함수를 반환한다.

## 2. 함수를 감싸는 Wrapper 만들기

처음 예제에서 `@` 문법을 빼고 같은 일을 직접 해 보자.

```python
def trace(func):
    def wrapper(*args, **kwargs):
        print(f"call {func.__name__}")
        return func(*args, **kwargs)

    return wrapper


def add(a, b):
    return a + b


original = add
add = trace(add)

print(add(1, 2))
```

```text
call add
3
```

`trace(add)`는 전달받은 함수를 호출하기 전에 메시지를 출력하는 `wrapper` 함수를 만들어 반환한다. `wrapper`는 `*args`와 `**kwargs`로 받은 인자를 그대로 원래 함수에 넘기고, 원래 함수의 반환값을 다시 돌려준다.

이렇게 원래 함수를 대신 호출해 주면서 앞뒤에 동작을 덧붙이는 함수를 **Wrapper**라고 부른다.

여기서 중요한 줄은 `add = trace(add)`다. 이 대입으로 `add`라는 이름은 `trace`가 반환한 `wrapper` Function Object에 다시 바인딩된다.

```python
print(add is original)  # False
print(add.__name__)     # wrapper
```

`add`와 `original`은 더 이상 같은 객체를 가리키지 않는다. 원래 함수는 `original`이라는 이름으로 남아 있고, `add`는 새로 만들어진 `wrapper`를 가리킨다.

```text
Name              Object

add ────────────► wrapper (Function Object)

original ───────► add (Function Object)
```

처음 예제에서 `add.__name__`이 `wrapper`였던 이유도 여기에 있다. `__name__`은 이름에 붙는 정보가 아니라 Function Object가 가진 속성이다. `add`라는 이름이 가리키는 객체가 `wrapper`로 바뀌었으니 `wrapper`의 `__name__`이 보이는 것이다.

## 3. Wrapper는 원래 함수를 어떻게 기억하는가

그런데 `original`이라는 이름을 만들지 않았다면 어떻게 될까?

```python
add = trace(add)
```

이렇게만 작성해도 `add(1, 2)`는 정상적으로 `3`을 반환한다. 원래 함수를 가리키던 `add`라는 이름은 `wrapper`로 넘어갔는데, `wrapper`는 여전히 원래 함수를 호출할 수 있다.

앞선 글을 떠올리면 이유를 짐작할 수 있다. `wrapper`는 `trace` 안에서 정의된 함수이고, `trace`의 매개변수 `func`를 참조한다. `wrapper` 입장에서 `func`는 Closure Variable이다.

```python
def add(a, b):
    return a + b


original = add
add = trace(add)

print(add.__code__.co_freevars)
print(add.__closure__[0].cell_contents is original)
```

```text
('func',)
True
```

`co_freevars`는 `wrapper`가 외부 Scope에서 가져다 쓰는 변수 이름을 보여 준다. 그리고 `__closure__`의 Cell Object가 참조하는 객체는 원래의 `add` Function Object와 같다.

`trace(add)` 호출이 끝나면 `trace`의 실행은 종료된다. 하지만 반환된 `wrapper`가 Cell Object를 통해 `func`의 바인딩을 유지하므로, 원래 함수는 사라지지 않고 `wrapper`가 호출될 때마다 사용된다.

```text
add (Name)
  │
  ▼
wrapper (Function Object)
  └── __closure__
        └── Cell Object (func)
              │
              ▼
            원래 add (Function Object)
```

Decorator가 원래 함수를 기억하는 방법은 새로운 장치가 아니라 앞선 글에서 살펴본 Closure다.

## 4. `@decorator`는 무엇을 줄여 쓴 것인가

이제 `@` 문법으로 돌아가 보자.

```python
@trace
def add(a, b):
    return a + b
```

이 코드는 다음 코드와 결과가 같다.

```python
def add(a, b):
    return a + b


add = trace(add)
```

`def` 문이 Function Object를 만들면, Python은 그 객체를 Decorator에 인자로 전달해 호출한다. 그리고 Decorator의 반환값을 함수 이름에 바인딩한다.

다만 Python 공식 문서는 두 코드가 완전히 같지는 않다고 설명한다. `@` 형태에서는 원래 Function Object가 `add`라는 이름에 잠시 바인딩되는 단계가 없다. Function Object가 만들어지면 곧바로 Decorator에 전달되고, 이름에는 Decorator가 반환한 객체만 바인딩된다.

또 하나 확인할 점은 **Decorator가 언제 실행되는가**다.

```python
def show(func):
    print(f"decorating {func.__name__}")
    return func


print("before def")


@show
def greet():
    print("hello")


print("after def")
```

```text
before def
decorating greet
after def
```

`greet()`를 한 번도 호출하지 않았는데 `decorating greet`가 출력됐다. Decorator는 함수를 호출할 때가 아니라 **`def` 문이 실행될 때** 한 번 호출된다.

첫 번째 글에서 `def`가 실행 가능한 문장이라고 했던 것과 연결해 보자. `def` 문이 실행되면 Function Object를 만들고, Decorator가 있다면 그 결과를 Decorator에 넘긴 다음 이름에 바인딩한다. 함수가 호출될 때마다 실행되는 것은 Decorator가 반환한 `wrapper`의 본문이다.

위의 `show`처럼 받은 함수를 그대로 반환하는 Decorator도 가능하다. Decorator가 반드시 Wrapper를 만들어야 하는 것은 아니다. 함수를 받아 어떤 객체를 반환하든, 그 반환값이 이름에 바인딩될 뿐이다.

## 5. 감싸면 잃어버리는 것과 `functools.wraps`

Wrapper로 감싸면 이름이 가리키는 객체가 바뀐다. 그래서 원래 함수가 가지고 있던 정보도 겉으로 드러나지 않는다.

```python
@trace
def sub(a, b):
    """두 수의 차를 반환한다."""
    return a - b


print(sub.__name__)  # wrapper
print(sub.__doc__)   # None
```

`__name__`은 `wrapper`가 되었고, 원래 함수에 작성한 docstring은 보이지 않는다. 함수 이름을 로그에 남기거나 `help()`로 문서를 확인할 때 엉뚱한 정보가 나온다.

이 문제를 해결하기 위해 표준 라이브러리는 `functools.wraps`를 제공한다.

```python
import functools


def trace(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"call {func.__name__}")
        return func(*args, **kwargs)

    return wrapper


@trace
def sub(a, b):
    """두 수의 차를 반환한다."""
    return a - b


print(sub.__name__)
print(sub.__doc__)
print(sub.__wrapped__)
```

```text
sub
두 수의 차를 반환한다.
<function sub at 0x...>
```

`functools.wraps(func)`는 원래 함수의 `__name__`, `__qualname__`, `__doc__`, `__module__` 같은 속성을 `wrapper`에 복사한다. 그리고 `__wrapped__` 속성에 원래 Function Object를 저장한다.

여기서 `wraps` 역시 Decorator로 사용되었다는 점이 흥미롭다. `@functools.wraps(func)`는 `wrapper`를 정의하는 시점에 적용되어 `wrapper`의 속성을 고친 뒤 `wrapper`를 반환한다.

중요한 점은 `wraps`를 사용해도 `sub`라는 이름이 가리키는 객체는 여전히 `wrapper`라는 것이다. `wraps`는 Wrapper를 원래 함수처럼 보이도록 메타데이터를 옮겨 줄 뿐, 감싸는 구조 자체를 바꾸지는 않는다.

## 6. 마무리

처음 질문으로 돌아가 보자.

> `@trace`를 붙이면 함수에 무슨 일이 일어날까?

`def` 문이 실행되어 Function Object가 만들어지면, Python은 이를 Decorator에 전달하고 Decorator가 반환한 객체를 함수 이름에 바인딩한다. `@trace`가 붙은 `add`라는 이름은 원래 함수가 아니라 `trace`가 만든 `wrapper`를 가리키게 된다.

원래 함수는 `wrapper`의 Closure Variable로 남아 Cell Object를 통해 유지된다. 그래서 `trace`의 실행이 끝난 뒤에도 `wrapper`는 원래 함수를 호출할 수 있다.

Decorator를 구성하는 요소는 모두 앞선 글에서 살펴본 것이다. 함수가 객체이기 때문에 인자로 전달하고 반환할 수 있고, Name Binding 덕분에 이름이 새로운 객체를 가리킬 수 있으며, Closure 덕분에 Wrapper가 원래 함수를 기억한다.

`classmethod`, `staticmethod`처럼 Class 안에서 `@`로 사용하는 기능도 있다. 다만 이들이 Method의 동작을 어떻게 바꾸는지는 Class 안의 함수가 어떻게 Method가 되는지를 먼저 알아야 이해할 수 있다. 다음 글에서는 Class 안에서 `def`로 만든 Function Object가 Instance를 통해 접근될 때 무엇이 달라지는지 살펴보자.

**참고 문서**

- [Python Language Reference — Function definitions](https://docs.python.org/3/reference/compound_stmts.html#function-definitions)
- [Python Glossary — Decorator](https://docs.python.org/3/glossary.html#term-decorator)
- [Python Standard Library — functools.wraps](https://docs.python.org/3/library/functools.html#functools.wraps)
- [PEP 318 — Decorators for Functions and Methods](https://peps.python.org/pep-0318/)
