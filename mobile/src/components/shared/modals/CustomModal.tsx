import { Modal, Pressable, Text } from "react-native";
import { type ReactNode } from "react";

type CustomModalProps = {
  header?: string;
  isVisible: boolean;
  children?: ReactNode;
  onClose: () => void;
}

export default function CustomModal({
  header,
  onClose,
  children,
  isVisible,
}: CustomModalProps) {
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
          className="w-[90%] max-h-[70%] min-h-[30%] bg-white rounded-2xl p-6 dark:bg-neutral-900"
          onPress={(event) => event.stopPropagation()}
        >
          {header && (
            <Text className="
            text-gray-900 text-xl font-bold mb-4
            dark:text-neutral-300 
            ">
              {header}
            </Text>
          )}

          {children}
        </Pressable>
      </Pressable>
    </Modal>
  )
}