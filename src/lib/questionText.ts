/** 보기 텍스트 앞의 (1), ①, 1. 등 중복 번호 제거 */
export function stripOptionPrefix(text: string): string {
  let s = text.trim();
  s = s.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/u, '');
  s = s.replace(/^\s*[\(（]\s*\d+\s*[\)）]\s*/u, '');
  s = s.replace(/^\s*\d+\s*[\.\)、．]\s*/u, '');
  return s.trim();
}
