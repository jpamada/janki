import type { WebViewAPI } from '@actualwave/react-native-codeditor';

export async function setEditorLanguage(
  api: WebViewAPI | null | undefined,
  lang: string
): Promise<void> {
  if (!api) return;

  if (lang !== 'csharp') {
    await api.editor.setLanguage(lang);
    return;
  }

  try {
    const clikeExports = await api.editor.loadExtension('@codemirror/legacy-modes/mode/clike');
    const languageExports = await api.editor.loadExtension('@codemirror/language');

    const csharpParser = (clikeExports as any)?.csharp;
    const StreamLanguage = (languageExports as any)?.StreamLanguage;

    if (!csharpParser || !StreamLanguage?.define) {
      throw new Error('csharp legacy mode or StreamLanguage export not found');
    }

    const csharpExtension = StreamLanguage.define(csharpParser);
    await api.editor.setExtensions([csharpExtension]);
  } catch (err) {
    console.warn('[setEditorLanguage] real csharp mode failed, falling back to java:', err);
    await api.editor.setLanguage('java');
  }
}