import { Modal, Pressable, Text, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';

import BottomSheet from '@/components/shared/BottomSheet';

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

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const trigger = (
    <Text className={`
      min-w-0 shrink
      ${selectedOption ? 'text-gray-700 dark:text-neutral-300' : 'text-gray-400 dark:text-neutral-400'}
      ${contentContainerClassName ?? ''}
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
};

function SheetPicker<T extends string | number | null>({
  title,
  options,
  trigger,
  className,
  selectedValue,
  onValueChange,
}: VariantProps<T>) {
  const { colorScheme } = useColorScheme();
  const sheet = useBottomSheet();

  const iconColor = colorScheme === 'light' ? '#4b5563' : '#d4d4d4';

  return (
    <>
      <Pressable
        onPress={() => sheet.open()}
        className={`
          flex-row items-center gap-2
          rounded-xl px-3 py-2
          bg-gray-100 active:bg-gray-200
          dark:bg-neutral-600 dark:active:bg-neutral-700
          ${className ?? ''}
        `}
      >
        {trigger}
        <ChevronDown size={16} color={iconColor} />
      </Pressable>

      <BottomSheet sheet={sheet} title={title} className="px-4 pb-4">
        <View>
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
                  flex-row items-center justify-between gap-2 p-4 
                  bg-white active:bg-gray-100 
                  dark:bg-neutral-700 dark:active:bg-neutral-600
                  ${isFirst ? 'rounded-t-xl' : ''}
                  ${isLast ? 'rounded-b-xl' : ''}
                `}
              >
                <Text className={`
                  min-w-0 shrink
                  ${isSelected 
                    ? 'text-gray-900 font-semibold dark:text-neutral-200' 
                    : 'text-gray-600 dark:text-neutral-400'
                  }
                `}>
                  {option.label}
                </Text>

                {isSelected && <Check size={20} color={iconColor} />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
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
  const { colorScheme } = useColorScheme();

  const [visible, setVisible] = useState(false);

  const iconColor = colorScheme === 'light' ? '#4b5563' : '#d4d4d4';

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        className={`
          flex-row items-center gap-1 
          rounded-xl px-3 py-2
          bg-gray-100 active:bg-gray-200
          dark:bg-neutral-600 dark:active:bg-neutral-700
          ${className ?? ''}
        `}
      >
        {trigger}
        <ChevronDown size={16} color={iconColor} />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 dark:bg-black/60"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="w-[90%] max-h-[70%] min-h-[30%] bg-white rounded-2xl p-6 dark:bg-neutral-900"
            onPress={(event) => event.stopPropagation()}
          >
            {title && (
              <Text className="
                text-gray-900 text-xl font-bold mb-4
                dark:text-neutral-300 
              ">
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
                    className="
                      flex flex-row justify-between items-center rounded-xl p-3
                      bg-gray-50 active:bg-gray-100 
                      dark:bg-neutral-800 dark:active:bg-neutral-700
                    "
                  >
                    <Text className={`text-lg min-w-0 shrink ${isSelected ? 'font-semibold text-gray-800 dark:text-neutral-300' : 'text-gray-600 dark:text-neutral-400'}`}>
                      {option.label}
                    </Text>

                    {isSelected && <Check size={20} color={iconColor} />}
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