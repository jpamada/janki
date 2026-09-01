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
        back={true}
        right={
          <View className="flex flex-row items-center">
            {todoVisible && (
              <Controller
                name="todo"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    className="p-3 rounded-full active:bg-gray-100"
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

            <Pressable 
              onPress={() => setBottomSheetVisible(true)}
              className="p-3 rounded-full active:bg-gray-100"
            >
              <EllipsisVertical />
            </Pressable>
          </View>
        }
      />

      <KeyboardAwareScrollView
        bottomOffset={80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-4 pb-24"
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
            className="bg-gray-600 rounded-full px-4 py-4 w-full active:bg-gray-500"
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
                className="flex flex-row items-center gap-2 p-4 rounded-t-3xl active:bg-gray-100"
              >
                <TextInitial size={16} />
                <Text className="text-center text-xl">
                  {titleVisible ? "Remove title" : "Add title"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleToggleTodo();
                  setBottomSheetVisible(false);
                }}
                className="flex flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <CalendarCheck size={16} />
                <Text className="text-center text-xl">
                  {todoVisible ? "Remove Todo" : "Add Todo"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleToggleUrl();
                  setBottomSheetVisible(false);
                }}
                className="flex flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <Link size={16} />
                <Text className="text-center text-xl">
                  {urlVisible ? "Remove URL link" : "Add URL link"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleToggleRemarks();
                  setBottomSheetVisible(false);
                }}
                className="flex flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <ScrollText size={16} />
                <Text className="text-center text-xl">
                  {remarksVisible ? "Remove remarks" : "Add remarks"}
                </Text>
              </Pressable>
              
              {(defaultValues.id && onDelete) && (
                <Pressable
                  onPress={() => {
                    if (!defaultValues.id) return;
                    setBottomSheetVisible(false);
                    onDelete(defaultValues.id);
                  }}
                  className="flex flex-row items-center gap-2 p-4 rounded-b-3xl active:bg-gray-100"
                >
                  <Trash2 color="#f87171" size={16} />
                  <Text className="text-red-400 text-center text-xl">
                    Delete Content
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}