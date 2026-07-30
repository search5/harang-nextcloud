import { TranslationKey } from "./en";

export const ko: Record<TranslationKey, string> = {
	// Settings tab
	"settings.heading": "Nextcloud 프로필",
	"settings.description":
		"Nextcloud 서버에 로그인하여 프로필을 등록하면, 붙여넣은 내부 링크를 자동으로 파일 정보 블록으로 렌더링합니다.",
	"settings.noProfiles": "등록된 프로필이 없습니다. 아래에서 새 프로필을 추가하세요.",
	"settings.addProfileHeading": "새 프로필 추가",
	"settings.profileNameLabel": "프로필 이름",
	"settings.profileNameDesc": "여러 Nextcloud 계정을 구분하기 위한 이름입니다.",
	"settings.profileNamePlaceholder": "예: 회사, 개인",
	"settings.serverUrlLabel": "서버 주소",
	"settings.serverUrlDesc": "예: https://cloud.example.com",
	"settings.cancelConnect": "연결 취소",
	"settings.connectButton": "로그인하여 연결",
	"settings.reconnectButton": "다시 연결",
	"settings.deleteProfileTooltip": "프로필 삭제",
	"settings.errNameRequired": "프로필 이름을 입력하세요.",
	"settings.errNameTaken": "이미 사용 중인 프로필 이름입니다.",
	"settings.errInvalidUrl": "올바른 서버 주소를 입력하세요 (http:// 또는 https://로 시작).",
	"settings.noticeCompleteLogin": "브라우저에서 Nextcloud 로그인을 완료해주세요.",
	"settings.noticeConnected": "Nextcloud 연결이 완료되었습니다.",
	"settings.noticeCancelled": "연결이 취소되었습니다.",
	"settings.noticeTimeout": "로그인 시간이 초과되었습니다. 다시 시도해주세요.",
	"settings.noticeConnectFailed": "연결 실패: {message}",

	// Code block renderer
	"block.unrecognizedLink": "인식할 수 없는 Nextcloud 내부 링크입니다.",
	"block.noProfile": "이 링크에 해당하는 Nextcloud 프로필이 없습니다. 설정에서 프로필을 추가하세요.",
	"block.loading": "불러오는 중...",
	"block.dateCreated": "등록일",
	"block.dateModified": "수정일",
	"block.openInBrowser": "브라우저에서 열기",
	"block.retry": "다시 시도",

	// Nextcloud client errors
	"error.authFailed": "인증에 실패했습니다. 설정에서 프로필을 다시 연결하세요.",
	"error.fileNotFound": "파일을 찾을 수 없습니다. 접근 권한이 없거나 삭제되었을 수 있습니다.",
	"error.fetchFailed": "Nextcloud 조회 중 오류가 발생했습니다 (HTTP {status}).",
	"error.metaNotFound": "파일 정보를 확인할 수 없습니다.",
	"error.metaNotFoundHttp": "파일 정보를 확인할 수 없습니다 (HTTP {status}).",
	"error.folderCreateFailed": "폴더를 만들 수 없습니다: {path} (HTTP {status})",
	"error.uploadFailed": "업로드에 실패했습니다: {filename} (HTTP {status})",
	"error.deleteFailed": "Nextcloud에서 삭제하지 못했습니다 (HTTP {status}).",

	// Login flow
	"login.startFailed": "로그인 시작에 실패했습니다 (HTTP {status}). 서버 주소를 확인하세요.",
	"login.unexpectedInitResponse": "서버로부터 예상치 못한 응답을 받았습니다. Nextcloud 서버 주소를 확인하세요.",
	"login.cancelled": "로그인이 취소되었습니다.",
	"login.unexpectedPollResponse": "서버로부터 예상치 못한 로그인 응답을 받았습니다.",
	"login.pollError": "로그인 확인 중 오류가 발생했습니다 (HTTP {status}).",
	"login.timeout": "로그인 시간이 초과되었습니다. 다시 시도하세요.",

	// Profile / folder resolution
	"link.noProfiles": "등록된 Nextcloud 프로필이 없습니다. 설정에서 프로필을 추가하세요.",
	"link.specifyProfile":
		'nc-folder 값 앞에 프로필 이름을 지정하세요 (예: "{example}"). 등록된 프로필: {profiles}',

	// Paste handler (link)
	"paste.noProfile":
		"이 Nextcloud 서버에 대한 프로필이 없습니다. 설정에서 프로필을 추가하면 파일 정보가 자동으로 표시됩니다.",

	// Attachment upload
	"attachment.noActiveFile": "현재 파일을 확인할 수 없어 첨부파일을 업로드할 수 없습니다.",
	"attachment.ncFolderMissing":
		"프론트매터에 nc-folder 속성(업로드 위치)이 없어 첨부파일을 붙여넣을 수 없습니다. 예: nc-folder: 프로필이름/경로",
	"attachment.folderPrepFailed": "폴더 준비 실패: {message}",
	"attachment.uploading": "{filename} 업로드 중...",
	"attachment.uploadFailed": "{filename} 업로드 실패: {message}",

	// Deletion tracking / modal
	"delete.movedToTrash": "{filename} 파일을 Nextcloud 휴지통으로 이동했습니다.",
	"delete.moveFailed": "Nextcloud 휴지통 이동 실패: {message}",
	"delete.modalTitle": "Nextcloud 첨부파일 삭제",
	"delete.modalBody": "노트에서 아래 첨부파일 링크가 삭제되었습니다. Nextcloud 휴지통으로 이동할까요?",
	"delete.modalRetention":
		"휴지통으로 이동된 파일은 Nextcloud의 보관 기간(기본 30일) 동안 그곳에서 복구할 수 있습니다.",
	"delete.keepButton": "Nextcloud에는 남기기",
	"delete.moveButton": "휴지통으로 이동",

	// Commands
	"command.convertSelection": "선택한 Nextcloud 내부 링크를 파일 블록으로 변환",
	"command.noticeInvalidSelection": "선택한 텍스트가 Nextcloud 내부 링크 형식이 아닙니다.",
};
