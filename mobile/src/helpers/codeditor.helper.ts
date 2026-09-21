const codeditorStyle = {
  LINE_HEIGHT: 21,
  MIN_HEIGHT: 280,
  MAX_HEIGHT: 500,
}

export function getEditorHeight(content: string) {
  const lines = content ? content.split("\n").length : 1;

  const height = Math.min(
    codeditorStyle.MAX_HEIGHT, 
    Math.max(
      codeditorStyle.MIN_HEIGHT, 
      lines * codeditorStyle.LINE_HEIGHT + 24
    )
  );

  return height;
}