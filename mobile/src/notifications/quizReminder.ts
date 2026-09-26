import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const QUIZ_REMINDER_ID = "daily-quiz-reminder";

export async function requestNotificationPermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("quiz-reminders", {
      name: "Quiz Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  return status === "granted";
}

export async function scheduleDailyQuizReminder(
  hour: number,
  minute: number,
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return false;
  }

  await Notifications.cancelScheduledNotificationAsync(
    QUIZ_REMINDER_ID,
  );

  await Notifications.scheduleNotificationAsync({
    identifier: QUIZ_REMINDER_ID,
    content: {
      title: "Time for your daily quiz",
      body: "Keep your learning streak going!",
      data: {
        type: "daily-quiz",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "quiz-reminders",
    },
  });

  return true;
}

export async function cancelDailyQuizReminder() {
  await Notifications.cancelScheduledNotificationAsync(
    QUIZ_REMINDER_ID,
  );
}