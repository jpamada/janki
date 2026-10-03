import { webSettings } from "./web-data";

export async function getSettings() {
  return { ...webSettings };
}

export async function initializeSettings() {
  return;
}

export async function updateSoundEnabled(
  soundEnabled: boolean,
) {
  webSettings.soundEnabled = soundEnabled;
}

export async function updateCaseSensitivity(
  caseSensitive: boolean,
) {
  webSettings.caseSensitive = caseSensitive;
}

export async function updateHapticsEnabled(
  hapticsEnabled: boolean,
) {
  webSettings.hapticsEnabled = hapticsEnabled;
}

export async function updateShowExplanation(
  showExplanation: boolean,
) {
  webSettings.showExplanation = showExplanation;
}

export async function updateFontSize(
  questionFontSize: number,
) {
  webSettings.questionFontSize = questionFontSize;
}

export async function updateShowCorrectAnswer(
  showCorrectAnswer: boolean,
) {
  webSettings.showCorrectAnswer = showCorrectAnswer;
}

export async function updateTheme(
  theme: "system" | "light" | "dark",
) {
  webSettings.theme = theme;
}

export async function updateTextAlign(
  questionTextAlign: "left" | "center" | "justify",
) {
  webSettings.questionTextAlign = questionTextAlign;
}