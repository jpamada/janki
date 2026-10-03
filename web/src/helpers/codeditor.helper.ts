const codeditorStyle = {
  LINE_HEIGHT: 21,
  MIN_HEIGHT: 280,
};

export function getEditorHeight(content: string) {
  const lines = content ? content.split("\n").length : 1;

  return Math.max(
    codeditorStyle.MIN_HEIGHT,
    lines * codeditorStyle.LINE_HEIGHT
  );
}