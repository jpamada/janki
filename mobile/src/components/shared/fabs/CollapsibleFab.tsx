import { Pressable, View } from "react-native";
import { Plus, X } from "lucide-react-native";
import { type ReactNode } from "react";
import { useColorScheme } from "nativewind";

type CollapsibleFabProps = {
  visible: boolean;
  children?: ReactNode;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CollapsibleFab({
  visible,
  children,
  setVisible,
}: CollapsibleFabProps) {

  const { colorScheme } = useColorScheme();

  return (
    <>
      {visible && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setVisible(false)}
        />
      )}

      <View className="absolute bottom-6 right-6 items-end">
        {visible && (
          <View className="mb-3 items-end gap-3">
            {children}
          </View>
        )}

        <Pressable
          onPress={() => setVisible((prev) => !prev)}
          style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}
          className="
            flex items-center justify-center 
            rounded-full h-16 w-16
            bg-white active:bg-gray-50
            dark:bg-neutral-800 dark:active:bg-neutral-700
          "
        >
          {visible ? (
            <X size={24} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
          ) : (
            <Plus size={24} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
          )}
        </Pressable>
      </View>
    </>
  );
}