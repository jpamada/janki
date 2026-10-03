import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useState } from 'react';

type PickerOption<T> = {
  label: string;
  value: T;
};

type CustomPickerProps<T> = {
  title?: string;
  selectedValue: T;
  className?: string;
  placeholder?: string;
  triggerLabel?: string;
  options: PickerOption<T>[];
  variant?: 'sheet' | 'modal';
  contentContainerClassName?: string;
  onValueChange: (value: T) => void;
};

export default function CustomPicker<T extends string | number | null>({
  title,
  options,
  className,
  placeholder,
  triggerLabel,
  selectedValue,
  onValueChange,
  variant = 'sheet',
  contentContainerClassName,
}: CustomPickerProps<T>) {
  const selectedOption = options.find((option) => option.value === selectedValue);

  const trigger = (
    <Text className={`
      ${selectedOption ? 'text-gray-700' : 'text-gray-400'}
      ${contentContainerClassName}
    `}>
      {triggerLabel ?? selectedOption?.label ?? placeholder ?? '—'}
    </Text>
  );

  if (variant === 'modal') {
    return (
      <CenteredModalPicker
        title={title}
        options={options}
        trigger={trigger}
        className={className}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
      />
    );
  }

  return (
    <SheetPicker
      title={title}
      options={options}
      trigger={trigger}
      className={className}
      selectedValue={selectedValue}
      onValueChange={onValueChange}
    />
  );
}

type VariantProps<T> = {
  options: PickerOption<T>[];
  title?: string;
  selectedValue: T;
  className?: string;
  trigger: React.ReactNode;
  onValueChange: (value: T) => void;
  contentContainerClassname?: string;
};

function SheetPicker<T extends string | number | null>({
  title,
  options,
  trigger,
  className,
  selectedValue,
  onValueChange,
}: VariantProps<T>) {
  const insets = useSafeAreaInsets();
  const sheet = useBottomSheet();

  return (
    <>
      <Pressable
        onPress={() => sheet.open()}
        className={`
          flex-row items-center gap-1 
          rounded-xl bg-gray-100 active:bg-gray-200
          px-3 py-2
          ${className}
        `}
      >
        {trigger}
        <ChevronDown size={16} color="#6b7280" />
      </Pressable>

      <Modal
        transparent
        animationType="none"
        visible={sheet.visible}
        onRequestClose={() => sheet.close()}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: sheet.backdropOpacity }}
          >
            <Pressable className="flex-1" onPress={() => sheet.close()} />
          </Animated.View>

          <Animated.View
            style={{ transform: [{ translateY: sheet.translateY }] }}
            className="rounded-t-3xl bg-gray-50 px-4 py-8"
          >
            {title && (
              <Text className="mb-2 px-2 text-lg font-bold text-gray-700">
                {title}
              </Text>
            )}

            <View className="rounded-3xl bg-white">
              {options.map((option, index) => {
                const isSelected = option.value === selectedValue;
                const isFirst = index === 0;
                const isLast = index === options.length - 1;

                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => {
                      onValueChange(option.value);
                      sheet.close();
                    }}
                    className={`
                      flex-row items-center justify-between p-4 active:bg-gray-100
                      ${isFirst ? 'rounded-t-3xl' : ''}
                      ${isLast ? 'rounded-b-3xl' : ''}
                    `}
                  >
                    <Text className={`text-xl ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {option.label}
                    </Text>

                    {isSelected && <Check size={20} color="#4b5563" />}
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: insets.bottom }} />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function CenteredModalPicker<T extends string | number | null>({
  title,
  options,
  trigger,
  className,
  selectedValue,
  onValueChange,
}: VariantProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        className={`
          flex-row items-center gap-1 
          rounded-xl bg-gray-100 active:bg-gray-200
          px-3 py-2
          ${className}
        `}
      >
        {trigger}
        <ChevronDown size={16} color="#6b7280" />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="w-[85%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {title && (
              <Text className="mb-4 text-xl font-bold text-gray-800">
                {title}
              </Text>
            )}

            <View className="gap-1">
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => {
                      onValueChange(option.value);
                      setVisible(false);
                    }}
                    className="flex-row items-center justify-between rounded-xl px-4 py-3 active:bg-gray-100"
                  >
                    <Text className={`text-lg ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {option.label}
                    </Text>

                    {isSelected && <Check size={20} color="#4b5563" />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}