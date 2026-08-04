# harang-nextcloud

🌐 [English](README.md) | **한국어**

📖 **[문서](https://search5.github.io/harang-nextcloud/ko/)** (English / 한국어)

Nextcloud 내부 링크를 붙여넣으면 파일 크기, 업로드 날짜, 브라우저에서 파일을 바로 열 수 있는 바로가기까지 보여주는 서식 있는 블록으로 바꿔주는 [Obsidian](https://obsidian.md) 플러그인입니다.

Nextcloud 내부 링크(예: `https://cloud.example.com/f/12345`)를 노트에 붙여넣으면 파일 이름, 경로, 크기, 날짜와 **브라우저에서 열기** 버튼을 보여주는 작은 카드로 렌더링되는 `nextcloud-file` 코드 블록으로 바뀝니다. `nc-folder` 프런트매터 속성이 설정된 노트에 이미지가 아닌 파일을 바로 붙여넣으면 해당 Nextcloud 폴더로 자동 업로드되기도 합니다.

## 기능

- **붙여넣으면 바로 블록으로** — Nextcloud 내부 링크를 붙여넣으면 자동으로 `nextcloud-file` 코드 블록으로 바뀌어, 파일 이름·경로·크기·날짜와 **브라우저에서 열기** 버튼이 있는 카드로 렌더링됩니다.
- **Login Flow v2 인증** — 브라우저에서 로그인해 Nextcloud 계정을 연결합니다. 공식 Nextcloud 클라이언트와 같은 방식으로 앱 비밀번호를 발급받으며, 실제 계정 비밀번호는 묻거나 저장하지 않습니다.
- **여러 Nextcloud 프로필 지원** — 프로필 이름으로 구분되는 Nextcloud 계정을 원하는 만큼 연결할 수 있고, 붙여넣은 링크는 알맞은 프로필과 자동으로 매칭됩니다.
- **`nc-folder`를 통한 첨부 파일 업로드** — 노트에 `nc-folder: <프로필이름>/<경로>` 프런트매터 속성을 설정한 뒤 이미지가 아닌 파일을 바로 붙여넣으면 해당 Nextcloud 폴더로 업로드되고 파일마다 블록이 삽입됩니다.
- **삭제 추적** — 노트에서 `nextcloud-file` 블록을 제거하면(편집으로 지우거나 노트 자체를 삭제) 실제 파일도 Nextcloud 휴지통으로 옮길지 물어봅니다.
- **원클릭 열기** — 렌더링된 모든 블록에는 Nextcloud 서버의 파일로 바로 이동하는 **브라우저에서 열기** 버튼이 있습니다.

## 사전 요구 사항

- 표준 Login Flow v2 핸드셰이크를 지원하는, HTTP(S)로 접속 가능한 Nextcloud 인스턴스(어지간히 최신 Nextcloud 서버라면 기본 내장).
- Obsidian 1.13.4 이상.

자세한 내용은 [사전 준비 사항](https://search5.github.io/harang-nextcloud/ko/prerequisites.html) 페이지를 참고하세요.

## 설치

Obsidian에서 **설정 → 커뮤니티 플러그인 → 찾아보기**를 열고 **"Harang Nextcloud"**를 검색한 뒤 **설치**와 **활성화**를 클릭하세요.

커뮤니티 플러그인 찾아보기를 사용하고 싶지 않다면 미리 빌드된 파일로 수동 설치하거나 소스에서 직접 빌드하는 방법도 있습니다 — 자세한 내용은 [설치](https://search5.github.io/harang-nextcloud/ko/installation.html) 페이지를 참고하세요.

## 사용법

1. **설정 → Harang Nextcloud**에서 프로필(이름, 서버 URL)을 추가하고 **로그인하여 연결**을 클릭해 브라우저에서 Login Flow v2 핸드셰이크를 완료하세요.
2. 노트에 Nextcloud 내부 링크를 붙여넣으면 자동으로 파일 정보 블록으로 렌더링됩니다.
3. 필요하다면 노트 프런트매터에 `nc-folder: 프로필이름/경로`를 추가해 해당 노트에 첨부 파일을 직접 붙여넣을 수 있게 하세요.

삭제 추적과 수동 변환 명령을 포함한 전체 가이드는 [사용법](https://search5.github.io/harang-nextcloud/ko/usage.html) 문서를 참고하세요.

## 알려진 제한 사항

- 이 워크플로에 필요한 Nextcloud/WebDAV API 일부만 구현되어 있습니다 — 범용 Nextcloud 파일 브라우저나 동기화 클라이언트가 아닙니다.
- 삭제 추적은 현재 세션 동안 Obsidian이 실제로 열거나 수정한 노트에만 적용됩니다. Obsidian이 지켜보고 있지 않을 때 이루어진 편집은 감지되지 않습니다.

## 라이선스

MIT — [LICENSE](LICENSE) 참고.
