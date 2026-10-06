# AGENTS.md

## 프로젝트

이 저장소는 AstroPaper를 기반으로 한 개인 기술 블로그다.

주요 목적은 Python, Backend, AI Agent 등을 공부하며 작성한 기술 글을 Markdown 기반으로 게시하는 것이다.

AstroPaper를 사이트의 기반 구조로 유지한다. 기존 구조를 새로 설계하기보다 AstroPaper가 제공하는 구조와 기능을 설정하거나 확장하는 방식을 우선한다.

## 작업 원칙

요청된 작업에 필요한 범위만 작게 수정한다.

새로운 구조나 추상화를 만들기 전에 기존 AstroPaper의 component, utility, configuration, convention을 우선 확인하고 재사용한다.

현재 작업과 관계없는 refactoring은 하지 않는다.

설정 변경이나 작은 수정으로 해결할 수 있는 문제라면 프로젝트 구조를 변경하는 것보다 이를 우선한다.

블로그의 콘텐츠 작성 방식은 Markdown 중심으로 유지한다. 사이트 기능을 추가하기 위해 일반적인 Markdown 작성 및 게시 과정이 불필요하게 복잡해져서는 안 된다.

## 작업 시작

작업을 시작하기 전에 PROJECT.md를 읽고 현재 프로젝트의 구조, 주요 설정, 기존 기능과 각 영역의 책임을 파악한다.

PROJECT.md를 프로젝트 탐색의 기준으로 사용하고, 현재 작업과 관련된 영역과 파일을 우선 확인한다. 이미 PROJECT.md에 정리된 내용을 파악하기 위해 프로젝트 전체를 반복해서 조사하지 않는다.

구현에 필요한 세부 동작은 관련 source를 직접 확인한다. 필요한 정보가 PROJECT.md에 없거나 불충분한 경우에만 탐색 범위를 확장한다.

PROJECT.md와 실제 source가 다르다면 실제 source를 기준으로 판단한다.

작업으로 인해 프로젝트의 구조, 주요 설정, 기존 기능 또는 책임이 변경되었다면 PROJECT.md도 함께 갱신한다.


## GitHub Pages

이 사이트는 GitHub Pages의 Project Site 형태로 배포된다.

Repository:

```text id="jzt9pj"
memo-rigel
```

Deployment base path:

```text id="9x5j9m"
/memo-rigel
```

`astro.config.ts`의 배포 설정은 이 base path와 호환되어야 한다.

사이트가 `/`에서 서비스된다고 가정하지 않는다.

내부 링크, asset, navigation, route 등을 추가할 때는 AstroPaper의 기존 base-path 처리 방식을 유지한다.

다음과 같은 root-relative path를 직접 hardcoding하기보다 AstroPaper에 이미 존재하는 utility 또는 Astro가 제공하는 base URL 처리 방식을 우선 사용한다.

```text id="o58yn7"
/about
/posts
/_astro/...
```

프로젝트에 이미 적절한 base-path 처리 방식이 존재한다면 같은 기능을 다시 구현하지 않는다.

## AstroPaper

AstroPaper를 교체해야 할 boilerplate가 아니라 현재 프로젝트의 기반 구조로 취급한다.

기능을 구현하기 전에 다음 순서를 따른다.

1. 관련된 AstroPaper의 기존 구현을 먼저 확인한다.
2. 사용할 수 있는 기존 component와 utility가 있다면 재사용한다.
3. 요청을 만족하는 가장 작은 범위의 변경을 선택한다.
4. 명시적으로 변경이 요구되지 않은 기존 동작은 유지한다.

관련 없는 작업을 수행하면서 navigation, layout, routing, content collection, styling system 또는 configuration 구조를 함께 재설계하지 않는다.

## 콘텐츠

기술 글은 기본적으로 Markdown으로 작성한다.

사이트 변경 이후에도 다음과 같은 단순한 작성 흐름을 유지하는 것을 우선한다.

```text id="ocfltp"
Markdown 작성
→ 글 추가
→ Preview
→ Build
→ Publish
```

Astro의 Content Collections와 기존 AstroPaper의 post 구조에서 자연스럽게 동작하는 방식을 우선한다.

일반적인 블로그 글을 작성하기 위해 불필요한 custom markup이나 component 사용을 요구하지 않는다.

### 콘텐츠 계층과 명칭

블로그 콘텐츠는 Collection → Series → Episode 계층으로 부른다.

- Collection(컬렉션): 관련 시리즈를 묶는 단위. 예: `Python 개념 톺아보기`.
- Series(시리즈): 하나의 주제를 순서대로 다루는 글 묶음. 예: `파이썬 객체에 대한 이해`.
- Episode(에피소드): 시리즈의 개별 글. 예: `01. Python은 왜 모든 것을 객체로 다룰까`.

이 명칭은 블로그의 콘텐츠 분류이며, Astro의 Content Collections(`posts`, `pages`)와 구분한다. 컬렉션과 시리즈의 메타데이터는 `src/config/postTopics.ts`에서 관리한다.

- `Python 개념 톺아보기`(`POST_TOPICS.python`, `python`): 파이썬 객체, 실행, 함수와 Method 시리즈.
- `Python으로 이해하기`(`POST_TOPICS.understandingWithPython`, `understanding-with-python`): `Python으로 이해하는 운영체제` 시리즈. 설명은 `Python을 통해 개발의 기반이 되는 원리와 구조를 이해합니다.`로 사용한다.

시리즈 route와 에피소드 디렉터리는 소속 컬렉션의 slug 아래에 둔다.

### Python 시리즈 추가

새 Python 시리즈는 소속 컬렉션을 선택하고 기존 시리즈와 같은 구조로 추가한다. 아래의 `<collection-slug>`는 `python` 또는 `understanding-with-python`이다.

1. `src/config/postTopics.ts`의 `POST_TOPICS.<collection-key>.series`에 slug, title, description, metaDescription, 전체 episodeCount를 등록한다.
2. `src/pages/posts/<collection-slug>/<series-slug>.astro`에 기존 Python 시리즈 상세 페이지를 재사용한 목차 route를 추가하고, 등록한 series key와 게시물 경로 prefix만 새 시리즈에 맞춘다.
3. `src/content/posts/<collection-slug>/<series-slug>/` 디렉터리와 `_episode-template.md`를 만든다. 템플릿에는 해당 시리즈 tag를 기본으로 넣고 `draft: true`로 둔다.
4. 에피소드는 템플릿을 복사해 `01-주제.md`, `02-주제.md`처럼 두 자리 번호로 시작하는 파일명으로 작성한다. 파일명 순서가 목차 순서가 되며, `_`로 시작하는 템플릿은 Content Collection에서 제외된다.
5. 계획한 전체 편수가 바뀌면 `episodeCount`를 함께 갱신한다. 링크에는 Astro의 locale/base-path 처리 방식을 유지한다.

시리즈 추가는 configuration과 route 변경을 포함하므로 `npm run build`로 검증하고, 구조나 책임이 달라졌다면 `PROJECT.md`도 갱신한다.

## 브랜드 에셋

`src/assets/brands/`의 브랜드 에셋은 Agent 관련 글에서 공식 문서 등의 출처를 식별하기 위한 작은 아이콘 용도로 사용한다. 블로그의 자체 로고나 제휴·후원 표시로 사용하지 않는다. 각 상표의 소유자는 OpenAI와 Anthropic이다.

- `src/assets/brands/openai.svg`: OpenAI Blossom의 검정 원본 `OpenAI-black-monoblossom.svg`. 출처는 [공식 Design Guidelines](https://openai.com/brand/)와 [공식 로고 다운로드](https://cdn.openai.com/brand/OpenAI-Logos-2025.zip)이며, ZIP 내부 `OpenAI-logos(new)/SVGs/`에서 가져왔다.
- `src/assets/brands/anthropic.svg`: Anthropic symbol의 Slate 원본 `Anthropic symbol - Slate.svg`. 출처는 [공식 Newsroom](https://www.anthropic.com/news)의 [Download press kit](https://anthropic.com/press-kit)이며, ZIP 내부 `Anthropic media resources/Anthropic logos/Anthropic logos/2 Anthropic symbol/SVG/`에서 가져왔다. Claude 로고와 구분한다.

공식 SVG는 파일명만 바꾸고 내용은 그대로 보관한다. 로고를 다시 그리거나 형태, 비율, path를 수정하지 않으며 제3자 아이콘으로 교체하지 않는다. 색상 변경, `currentColor` 치환, CSS filter, 효과, 자르기 등 브랜드 가이드라인과 충돌할 수 있는 수정은 공식 가이드 확인 없이 하지 않는다. 라이트/다크 모드에서도 임의로 재색칠하지 않고 필요한 공식 색상 버전의 원본을 확인한다.

OpenAI는 Blossom에 색상을 추가하거나 주요 브랜드 표시로 사용하는 것을 금지하며, 지정된 여백과 충분한 빈 공간을 요구한다. OpenAI와 직접 관련된 문맥에서 제공된 모습 그대로 사용하고, 소유권을 인정하며 제휴·보증·후원을 암시하지 않는다. 사용 시 공식 페이지의 최신 Marks usage terms를 따른다.

확인한 Anthropic Press Kit에는 Slate/Ivory 원본이 있으나 별도 브랜드 사용 가이드나 라이선스 문서는 포함되어 있지 않았다(확인일: 2026-10-06). 다운로드 가능하다는 사실을 임의 변형이나 무제한 사용 허가로 해석하지 않는다. 추가 사용 조건이나 변형 허용 여부가 필요하면 공식 자료 또는 `press@anthropic.com`을 통해 확인한다.

## 검증

Code 또는 configuration을 변경한 뒤에는 다음 명령을 실행한다.

```bash id="kh0u6u"
npm run build
```

변경으로 인해 build가 실패한다면 작업이 완료된 것으로 간주하지 않는다.

Markdown 콘텐츠만 수정한 경우에는 전체 build를 기본적으로 실행하지 않는다.

대상 파일의 `git diff -- <파일>`와 Markdown 문법 및 포맷을 확인한다.

단, frontmatter, Content Collection schema, Markdown integration 또는 렌더링 동작에 영향을 주는 변경은 `npm run build`로 검증한다.

UI 또는 동작을 변경한 경우 필요하면 development server를 사용해 로컬에서 실제 동작을 확인한다.

작업을 완료하기 전에 diff를 확인하고 변경 범위가 요청된 작업에 한정되어 있는지 확인한다.

`dist/`와 같은 생성된 build output을 source code처럼 직접 수정하지 않는다.

## 공식 문서

Astro 공식 문서:

https://docs.astro.build

Astro의 동작에 의존하는 작업을 수행하거나 기존 구현만으로 의도를 명확히 판단하기 어려운 경우 관련 공식 문서를 확인한다.

관련 문서:

* Routing: https://docs.astro.build/en/guides/routing/
* Astro Components: https://docs.astro.build/en/basics/astro-components/
* Framework Components: https://docs.astro.build/en/guides/framework-components/
* Content Collections: https://docs.astro.build/en/guides/content-collections/
* Styling / Tailwind: https://docs.astro.build/en/guides/styling/
* Internationalization: https://docs.astro.build/en/guides/internationalization/

Astro의 동작을 추측하기보다 프로젝트의 기존 구현과 현재 Astro 공식 문서를 우선한다.
