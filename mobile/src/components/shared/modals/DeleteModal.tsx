import { Modal, Pressable, Text, View } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { type ReactNode } from "react";

type DeleteModalProps = {
  header: string;
  icon: LucideIcon;
  isVisible: boolean;
  description?: string;
  children?: ReactNode;
  onConfirmLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function DeleteModal({
  icon: Icon,
  header,
  onClose,
  children,
  isVisible,
  description,
  onConfirm,
  onConfirmLabel = "Cancel",
}: DeleteModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 dark:bg-black/60"
        onPress={onClose}
      >
        <Pressable
          className="w-[90%] rounded-2xl bg-white p-6 dark:bg-neutral-900"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="
            flex items-center justify-center self-center
             w-32 h-32 mb-4
            bg-gray-100 rounded-full
            dark:bg-neutral-800
          ">
            <Icon size={72} color="#ef4444" />
          </View>

          <Text className="text-xl font-bold text-center dark:text-neutral-300">
            {header}
          </Text>

          {description && (
            <Text className="mt-2 text-center text-gray-500">
              {description}
            </Text>
          )}
          
          <View className="mt-6 gap-2">
            {onConfirm && (
              <Pressable
                onPress={onConfirm}
                className="rounded-full bg-red-500 px-6 py-4 active:bg-red-400"
              >
                <Text className="text-center font-semibold text-white">
                  {onConfirmLabel}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={onClose}
              className="
                bg-none rounded-full px-6 py-4 
                active:bg-gray-100 dark:active:bg-neutral-700
              "
            >
              <Text className="text-center font-semibold text-gray-600">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}