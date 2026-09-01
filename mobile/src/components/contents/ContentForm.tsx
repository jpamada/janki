import { CalendarCheck, EllipsisVertical, Link, ScrollText, Square, SquareCheck, TextInitial, Trash2, X } from "lucide-react-native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { ContentFormData, contentSchema } from "@/schemas/content.schema";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";

import Header from "../shared/Header";

type ContentFormProps = {
  onSubmit: (data: ContentFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void> | void;
  defaultValues?: ContentFormData;
};

export default function ContentForm({
  onSubmit,
  onDelete,
  defaultValues = {
    id: undefined,
    title: "",
    content: "",
    remarks: "",
    url: "",
    todo: null,
    position: null
  },
}: ContentFormProps) {

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const [titleVisible, setTitleVisible] = useState(
    !!defaultValues?.title?.trim()
  );

  const [todoVisible, setTodoVisible] = useState(
    defaultValues?.todo !== null
  );

  const [urlVisible, setUrlVisible] = useState(
    !!defaultValues?.url?.trim()
  );

  const [remarksVisible, setRemarksVisible] = useState(
    !!defaultValues?.remarks?.trim()
  );

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting }} = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: ContentFormData) => {
    await onSubmit(data);
  };

  const handleToggleTitle = () => {
    setTitleVisible((prev) => {
      const next = !prev;
      if (!next) {
        setValue("title", "");
      }
      return next;
    });
  };

const handleToggleTodo = () => {
  setTodoVisible((prev) => {
    const next = !prev;
    if (next) {
      setValue("todo", false);
    } else {
      setValue("todo", null);
    }
    return next;
  });
};

  const handleToggleUrl = () => {
    setUrlVisible((prev) => {
      const next = !prev;
      if (!next) {
        setValue("url", "");
      }
      return next;
    });
  };

  const handleToggleRemarks = () => {
    setRemarksVisible((prev) => {
      const next = !prev;
      if (!next) {
        setValue("remarks", "");
      }
      return next;
    });
  };

  return (
    <View className="flex-1 bg-white">
      <Header
        back={
          <Pressable onPress={() => router.back()}>
            <X />
          </Pressable>
        }
        right={
          <View className="flex flex-row items-center gap-2">
            {todoVisible && (
              <Controller
                name="todo"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    className="active:opacity-70"
                  >
                    {value ? (
                      <SquareCheck size={24} color="#4b5563" />
                    ) : (
                      <Square size={24} color="#4b5563" />
                    )}
                  </Pressable>
                )}
              />
            )}

            <Pressable onPress={() => setBottomSheetVisible(true)}>
              <EllipsisVertical />
            </Pressable>
          </View>
        }
      />

      <KeyboardAwareScrollView
        bottomOffset={80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        {titleVisible && (
          <Controller
            name="title"
            control={control}
            render={({ field: { onChange, onBlur, value }}) => (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  Title
                </Text>

                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter title"
                  className="rounded-xl bg-gray-50 px-3 py-4 font-semibold"
                />

                {errors.title && (
                  <Text className="text-red-400">
                    {errors.title.message}
                  </Text>
                )}
              </View>
            )}
          />
        )}

        <Controller
          name="content"
          control={control}
          render={({ field: { onChange, onBlur, value }}) => (
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-gray-600">
                Content
              </Text>

              <TextInput
                multiline
                textAlignVertical="top"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Write your content..."
                className="min-h-64 rounded-xl bg-gray-50 px-3 py-4"
              />

              {errors.content && (
                <Text className="text-red-400">
                  {errors.content.message}
                </Text>
              )}
            </View>
          )}
        />

        {urlVisible && (
          <Controller
            name="url"
            control={control}
            render={({ field: { onChange, onBlur, value }}) => (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  URL
                </Text>

                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="https://..."
                  autoCapitalize="none"
                  keyboardType="url"
                  className="rounded-xl bg-gray-50 px-3 py-4"
                />
              </View>
            )}
          />
        )}

        {remarksVisible && (
          <Controller
            name="remarks"
            control={control}
            render={({ field: { onChange, onBlur, value }}) => (
              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  Remarks
                </Text>

                <TextInput
                  multiline
                  textAlignVertical="top"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Add remarks..."
                  className="min-h-32 rounded-xl bg-gray-50 px-3 py-4"
                />
              </View>
            )}
          />
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyView>
        <View className="flex-row items-center border-t border-gray-200 bg-white px-4 py-6">
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(handleFormSubmit)}
            className="bg-gray-600 rounded-full px-4 py-4 w-full active:opacity-70"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Save Changes
            </Text>
          </Pressable>
        </View>
      </KeyboardStickyView>

      <Modal
        transparent
        animationType="none"
        visible={bottomSheetVisible}
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => {
            setBottomSheetVisible(false);
          }}
        >
          <View className="bg-gray-50 rounded-t-3xl px-4 py-8 h-auto">
            <View className="bg-white rounded-3xl">
              <Pressable
                onPress={() => {
                  handleToggleTitle();
                  setBottomSheetVisible(false);
                }}
              >
                <View className="flex flex-row items-center gap-2 p-4">
                  <TextInitial size={16} />
                  <Text className="text-center text-xl">
                    {titleVisible ? "Remove title" : "Add title"}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleToggleTodo();
                  setBottomSheetVisible(false);
                }}
              >
                <View className="flex flex-row items-center gap-2 p-4">
                  <CalendarCheck size={16} />
                  <Text className="text-center text-xl">
                    {todoVisible ? "Remove Todo" : "Add Todo"}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleToggleUrl();
                  setBottomSheetVisible(false);
                }}
              >
                <View className="flex flex-row items-center gap-2 p-4">
                  <Link size={16} />
                  <Text className="text-center text-xl">
                    {urlVisible ? "Remove URL link" : "Add URL link"}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleToggleRemarks();
                  setBottomSheetVisible(false);
                }}
              >
                <View className="flex flex-row items-center gap-2 p-4">
                  <ScrollText size={16} />
                  <Text className="text-center text-xl">
                    {remarksVisible ? "Remove remarks" : "Add remarks"}
                  </Text>
                </View>
              </Pressable>
              
              {(defaultValues.id && onDelete) && (
                <Pressable
                  onPress={() => {
                    if (!defaultValues.id) return;
                    setBottomSheetVisible(false);
                    onDelete(defaultValues.id);
                  }}
                >
                  <View className="flex flex-row items-center gap-2 p-4">
                    <Trash2 color="#f87171" size={16} />
                    <Text className="text-red-400 text-center text-xl">
                      Delete Content
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}