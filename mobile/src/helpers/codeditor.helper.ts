export function getEditorHeight(content: string) {
  const lines = content ? content.split(/\r\n|\r|\n/).length : 1;
  return Math.max(280, lines * 21);
}