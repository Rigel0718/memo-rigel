---
title: "05. Class 안에 정의한 함수는 어떻게 Method가 되는가?"
description: "Class 안에 정의한 함수가 Class Namespace에 Function Object로 저장되는 과정을 살펴보고, Instance를 통해 접근할 때 __get__()이 Bound Method를 만드는 원리를 이해합니다."
pubDatetime: 2026-11-02T15:00:00+09:00
tags:
  - Python
  - 파이썬 함수와 Method에 대한 이해
  - Method
  - Class Namespace
  - Descriptor
draft: False
---

지금까지 이 시리즈에서는 함수를 독립된 객체로 다뤘다. `def`가 Function Object를 만들고, 함수는 정의된 위치를 기준으로 이름을 찾으며, Closure로 바깥 변수를 기억한다. 앞선 글의 Decorator도 이 Function Object를 받아 다른 함수로 감싸는 방식이었다.

하지만 Python 코드에서 함수는 대부분 Class 안에 정의된다. 그리고 Class 안에 정의한 함수를 우리는 Method라고 부른다.

그렇다면 Class 안에 정의한 함수는 처음부터 Method라는 특별한 객체일까? 같은 함수를 Class와 Instance를 통해 각각 꺼내 보자.

```python
class Person:
    def hello(self):
        return f"hello, {self.name}"


p = Person()
p.name = "Alice"

print(Person.hello)
print(p.hello)
```

```text
<function Person.hello at 0x...>
<bound method Person.hello of <__main__.Person object at 0x...>>
```

Class를 통해 꺼내면 지금까지 다뤄 온 평범한 `function`이다. Instance를 통해 꺼낼 때만 `bound method`가 나온다.

같은 `def`로 만든 같은 함수가 어떻게 꺼내느냐에 따라 다른 객체로 나타난다. Class 안에 정의했다는 사실만으로 Method가 되는 것은 아니라는 뜻이다.

이번 글에서는 Class 안의 `def`가 무엇을 만드는지부터 시작해, 그 함수가 언제 Method가 되는지 살펴보자.

## 1. Class 본문도 실행되는 코드다

`def`가 실행되는 문장이라면, `class` 문은 어떨까?

01편에서 살펴봤듯이 `def`는 실행되면 Function Object를 만들고 이름에 바인딩한다. `class` 문도 실행되는 문장이다. Class 본문은 위에서 아래로 실제로 실행된다.

```python
print("before class")


class Person:
    greeting = "hello"
    print("class body runs")

    def hello(self):
        return f"{self.greeting}, {self.name}"

    print(type(hello))


print("after class")
```

```text
before class
class body runs
<class 'function'>
after class
```

Class 본문 안의 `print()`가 Class를 정의하는 시점에 실행됐다. 그리고 본문 안에서 `hello`의 타입을 확인하면 평범한 `function`이다.

Class 본문 안의 `def`도 다른 곳의 `def`와 똑같이 Function Object를 만든다. 다른 점은 그 객체가 바인딩되는 장소다. 모듈에서 실행된 `def`는 Global Namespace에 이름을 만들지만, Class 본문에서 실행된 `def`는 **Class Namespace**에 이름을 만든다.

Class 본문의 실행이 끝나면 Python은 이 Namespace로 Class 객체를 만든다. 그래서 완성된 Class의 `__dict__`를 보면 `hello`가 Function Object로 들어 있다.

```python
print(type(Person.__dict__["hello"]))  # <class 'function'>
```

이 시점까지 Method라는 별도의 객체는 어디에도 없다. Class Namespace에 Function Object 하나가 저장되어 있을 뿐이다.

## 2. Class Namespace는 함수의 Enclosing Scope가 아니다

Class 본문에서 정의한 함수가 Class Namespace에 저장된다면, 그 함수는 같은 Class 본문에 정의된 다른 이름도 바로 쓸 수 있을까?

02편의 LEGB 규칙을 떠올리면 그럴 것 같다. 함수 바깥의 Class 본문이 Enclosing Scope 역할을 할 것처럼 보이기 때문이다.

```python
class Counter:
    step = 1

    def inc(self, n):
        return n + step


Counter().inc(1)
```

```text
NameError: name 'step' is not defined
```

결과는 `NameError`다. `step`은 분명 같은 Class 본문에 정의되어 있지만 `inc` 안에서는 찾을 수 없다.

Python 공식 문서는 Class 블록에서 정의한 이름의 Scope가 그 Class 블록으로 한정되며, Method의 코드 블록까지 확장되지 않는다고 설명한다. Class Namespace는 LEGB의 E에 해당하지 않는다. `inc` 안에서 `step`을 찾으면 Local, Global, Built-in 순서로 탐색할 뿐 Class Namespace는 건너뛴다.

03편의 Closure와 비교하면 차이가 더 분명하다. 함수 안에 정의한 함수는 바깥 함수의 변수를 Closure Variable로 캡처할 수 있었다. 하지만 Class 본문 안에 정의한 함수는 Class 본문의 변수를 캡처하지 않는다.

그래서 Class의 값에 접근하려면 이름을 직접 쓰는 대신 Attribute로 접근해야 한다.

```python
class Counter:
    step = 1

    def inc(self, n):
        return n + self.step


print(Counter().inc(1))  # 2
```

`self.step`은 Scope에서 이름을 찾는 것이 아니라 `self`라는 객체에서 `step`이라는 Attribute를 찾는 것이다. 함수 안에서 Class의 값을 쓰려면 반드시 이 Attribute 접근을 거쳐야 한다.

그리고 Function이 Method가 되는 일도 바로 이 Attribute 접근 과정에서 일어난다.

## 3. Function은 언제 Method가 되는가

처음 예제로 돌아가 보자. Class Namespace에 저장된 객체와 `Person.hello`로 꺼낸 객체를 비교해 보면 둘은 같은 객체다.

```python
print(Person.__dict__["hello"] is Person.hello)  # True
```

Class를 통해 꺼내면 Class Namespace에 저장된 Function Object가 그대로 나온다. 그래서 이 함수를 호출할 때는 첫 번째 인자를 직접 넘겨야 한다.

```python
print(Person.hello(p))  # hello, Alice
```

달라지는 것은 `p.hello`처럼 Instance를 통해 꺼낼 때다. 이때 Python은 `p`의 Attribute를 찾다가 Class 쪽에서 `hello`라는 Function Object를 발견한다. 그리고 Function Object가 가진 `__get__()` Method를 호출한다.

Function Object에는 실제로 `__get__()`이 있다.

```python
func = Person.__dict__["hello"]

print(hasattr(func, "__get__"))  # True
```

이 `__get__()`을 직접 호출해 보면 `p.hello`로 얻은 것과 같은 종류의 객체가 나온다.

```python
method = func.__get__(p, Person)

print(method)    # <bound method Person.hello of <__main__.Person object at 0x...>>
print(method())  # hello, Alice
```

`__get__(p, Person)`은 Function Object와 Instance `p`를 묶은 Bound Method를 만든다. 그래서 `method()`를 인자 없이 호출해도 `hello, Alice`가 반환된다.

이처럼 `__get__()`을 가진 객체를 **Descriptor**라고 부르고, Function Object는 Descriptor다. Instance를 통해 Attribute를 꺼낼 때 Class 쪽에서 Descriptor를 발견하면 Python은 값을 그대로 돌려주지 않고 `__get__()`의 결과를 돌려준다.

Descriptor가 Attribute 탐색 순서에서 어디에 끼어드는지, Data Descriptor와 Non-data Descriptor가 어떻게 다른지는 「파이썬 객체에 대한 이해」의 [06. Attribute를 읽으면 내부에서 어떤 일이 일어나는가](../../understanding-python-objects/06-attribute를-읽으면-내부에서-어떤-일이-일어나는가/)에서 자세히 다뤘다. 이번 글에서는 한 가지 사실만 기억하면 된다.

> Function이 Method가 되는 시점은 Class 안에 정의될 때가 아니라, Instance를 통해 Attribute로 꺼내질 때다.

## 4. 정의한 위치가 아니라 찾은 위치가 결정한다

그렇다면 Class 안에 정의하지 않은 함수는 Method가 될 수 없을까?

Class를 만든 뒤에 바깥에서 정의한 함수를 Class에 붙여 보자.

```python
def bye(self):
    return f"bye, {self.name}"


Person.bye = bye

print(p.bye)
print(p.bye())
```

```text
<bound method bye of <__main__.Person object at 0x...>>
bye, Alice
```

`bye`는 Class 본문 밖에서 정의된 함수다. 출력된 이름도 `Person.bye`가 아니라 그냥 `bye`다. 그런데도 `p.bye`는 Bound Method가 되었고, 인자 없이 호출해도 `p`가 전달되었다.

이번에는 반대로 같은 함수를 Instance에 직접 넣어 보자.

```python
p.shout = bye

print(type(p.shout))  # <class 'function'>
p.shout()
```

```text
TypeError: bye() missing 1 required positional argument: 'self'
```

이번에는 Bound Method가 만들어지지 않았다. `p.shout`은 Instance의 `__dict__`에서 바로 찾아졌기 때문에 `__get__()`이 호출되지 않고, Function Object가 그대로 반환되었다. 그래서 `self`에 들어갈 인자가 없다는 오류가 발생한다.

같은 `bye` 함수인데 결과가 다르다.

- Class에 저장하고 Instance를 통해 꺼내면 Bound Method가 된다.
- Instance에 저장하고 Instance를 통해 꺼내면 Function 그대로다.

함수가 어디에서 정의되었는지는 상관이 없다. Attribute를 찾는 과정에서 Function Object가 **Class 쪽에서 발견되었는가**가 Method 여부를 결정한다.

## 5. 마무리

처음 질문으로 돌아가 보자.

> Class 안에 정의한 함수는 어떻게 Method가 되는가?

Class 본문에서 실행된 `def`는 다른 곳의 `def`와 똑같이 Function Object를 만들고, 그 객체를 Class Namespace에 바인딩한다. 이 단계에서 Method라는 객체는 아직 없다.

Class Namespace는 함수의 Enclosing Scope가 아니기 때문에, 함수 안에서 Class의 값을 쓰려면 `self`를 통해 Attribute로 접근해야 한다.

Method는 이 Attribute 접근 과정에서 만들어진다. Instance를 통해 Attribute를 꺼낼 때 Class 쪽에서 Function Object가 발견되면, Function의 `__get__()`이 Function과 Instance를 묶어 Bound Method를 만든다. 그래서 Class 밖에서 정의한 함수도 Class에 붙이면 Method처럼 동작하고, Class 안에서 정의한 함수라도 Instance에 직접 넣으면 Method가 되지 않는다.

그렇다면 `__get__()`이 만든 Bound Method 안에는 무엇이 들어 있고, 호출할 때 Instance를 어떻게 첫 번째 인자로 넘겨줄까? 다음 글에서는 Bound Method의 내부를 열어 보고 `self`가 전달되는 과정을 살펴보자.

**참고 문서**

- [Python Language Reference — Class definitions](https://docs.python.org/3/reference/compound_stmts.html#class-definitions)
- [Python Language Reference — Execution Model: Resolution of names](https://docs.python.org/3/reference/executionmodel.html#resolution-of-names)
- [Python Data Model — Instance methods](https://docs.python.org/3/reference/datamodel.html#instance-methods)
- [Descriptor Guide — Functions and methods](https://docs.python.org/3/howto/descriptor.html#functions-and-methods)
