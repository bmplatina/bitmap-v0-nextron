import log from "electron-log";

// 1. 초기 설정 (앱 실행 시 한 번만 설정)
log.errorHandler.startCatching();

// 로그 포맷 설정
log.transports.console.format =
  "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

// 파일 저장 임계값 설정: 'info'로 설정하면 info, warn, error가 모두 파일에 기록됩니다.
log.transports.file.level = "info";

export default log;
