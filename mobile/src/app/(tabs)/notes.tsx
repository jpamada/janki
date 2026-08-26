import { createNoteFolder, deleteNoteFolder, getNoteFolders, updateNoteFolder } from '@/repositories/folder.repository';
import { Folders, PenLine, Plus, SearchX, SquarePen, StickyNote, Trash2, X } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { deleteNote, getNotes } from '@/repositories/note.repository';
import { getCategories } from '@/repositories/category.repository';
import { FolderFormData } from '@/schemas/folder.schema';
import { router } from 'expo-router';
import { useState } from 'react';

import NoteFolderForm from '@/components/note-folders/NoteFolderForm';
import NoteFolderItem from '@/components/note-folders/NoteFolderItem';
import NoteItem from '@/components/notes/NoteItem';
import Header from '@/components/shared/Header';

export default function NotesScreen() {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [fabVisible, setFabVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: notes = [], isLoading: notesIsLoading, error: notesError } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  const { data: noteFolders = [], isLoading: noteFoldersIsLoading, error: noteFoldersError } = useQuery({
    queryKey: ['noteFolders'],
    queryFn: getNoteFolders,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  const selectedFolder = noteFolders.find(
    (folder) => folder.id === selectedFolderId,
  );

  const selectedNote = notes.find(
    (note) => note.id === selectedNoteId
  );

  const createNoteFolderMutation = useMutation({
    mutationFn: createNoteFolder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['noteFolders'],
      });
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const updateNoteFolderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FolderFormData }) =>
      updateNoteFolder(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['noteFolders'],
      });
      setModalVisible(false);
      setIsEditing(false);
      setSelectedFolderId(null);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['noteFolders'],
      });
      setSelectedNoteId(null);
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const deleteNoteFolderMutation = useMutation({
    mutationFn: deleteNoteFolder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['noteFolders'],
      });
      setSelectedFolderId(null);
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleNoteFolderSubmit = async (data: FolderFormData) => {
    if (isEditing && selectedFolderId) {
      await updateNoteFolderMutation.mutateAsync({
        id: selectedFolderId,
        data: {
          name: data.name,
          categoryId: data.categoryId,
        },
      });

    } else {
      await createNoteFolderMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId,
      });
    }
  };

  const handleFolderLongPress = (id: string) => {
    setSelectedFolderId(id);
    setBottomSheetVisible(true);
  };

  const handleNoteLongPress = (id: string) => {
    setSelectedNoteId(id);
    setBottomSheetVisible(true);
  };

  const handleDelete = async () => {
    if (selectedFolderId) {
      await deleteNoteFolderMutation.mutateAsync(selectedFolderId);

    } else if (selectedNoteId) {
      await deleteNoteMutation.mutateAsync(selectedNoteId);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="Notes" />

      <View className="flex-1 px-6 py-4">
        <Text className="text-gray-400 text-sm font-semibold mb-2">
          All Notes
        </Text>

        <View className='flex flex-row items-center gap-2 mb-4'>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              className='bg-gray-50 rounded-full px-4 py-2'
            >
              <Text className='text-gray-600 text-sm font-semibold'>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {notesIsLoading || noteFoldersIsLoading ? (
          <Text>Loading...</Text>

        ) : notesError || noteFoldersError ? (
          <Text>Failed to load notes.</Text>

        ) : notes.length > 0 || noteFolders.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex gap-2"
          >
            {noteFolders.length > 0 && (
              <View className="gap-2">
                {noteFolders.map((folder) => (
                  <NoteFolderItem
                    key={folder.id}
                    id={folder.id}
                    name={folder.name}
                    onLongPress={handleFolderLongPress}
                    onNoteLongPress={handleNoteLongPress}
                  />
                ))}
              </View>
            )}

            {notes.length > 0 && (
              <View className="gap-2">
                {notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    createdAt={note.createdAt}
                    onLongPress={handleNoteLongPress}
                  />
                ))}
              </View>
            )}
          </ScrollView>

        ) : (
          <View className="flex-1 items-center justify-center">
            <SearchX size={64} color="#9ca3af" />
            <Text className="text-gray-400 font-semibold">No notes found</Text>
          </View>
        )}
      </View>

      <View className="absolute bottom-6 right-6 items-end">
        {fabVisible && (
          <View className="mb-3 items-end gap-3">
            <Pressable
              onPress={() => {
                setFabVisible(false);
                setIsEditing(false);
                setSelectedFolderId(null);
                setModalVisible(true);
              }}
              className={`
                flex-row items-center gap-1 rounded-full bg-white px-4 py-3
              `}
              style={{
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Folders size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Folder</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setFabVisible(false);
                router.push('/notes/create');
              }}
              className={`
                flex-row items-center gap-1 rounded-full bg-white px-4 py-3
              `}
              style={{
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
              }}
            >
              <StickyNote size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Note</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => setFabVisible((prev) => !prev)}
          className="h-14 w-14 items-center justify-center rounded-full bg-white"
          style={{
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          {fabVisible ? (
            <X size={24} color="#4b5563" />
          ) : (
            <Plus size={24} color="#4b5563" />
          )}
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="none"
        visible={bottomSheetVisible}
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => {
            setSelectedNoteId(null);
            setSelectedFolderId(null);
            setBottomSheetVisible(false);
          }}
        >
          <View className="bg-gray-50 rounded-t-3xl px-4 py-8 h-auto">
            {selectedFolderId && (
              <>
                <Pressable
                  onPress={() => {
                    setBottomSheetVisible(false);
                    router.push({
                      pathname: `/notes/create`,
                      params: { folderId: selectedFolderId },
                    });
                  }}
                >
                  <View className="flex flex-row items-center gap-2 bg-white p-4">
                    <SquarePen size={16} />
                    <Text className="text-center text-xl">New Note</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setBottomSheetVisible(false);
                    setFabVisible(false);
                    setModalVisible(true);
                  }}
                >
                  <View className="flex flex-row items-center gap-2 bg-white p-4">
                    <Folders size={16} />
                    <Text className="text-center text-xl">New Folder</Text>
                  </View>
                </Pressable>
              </>
            )}

            <Pressable
              onPress={() => {
                if (!selectedFolderId) return;
                setBottomSheetVisible(false);
                setIsEditing(true);
                setModalVisible(true);
              }}
            >
              <View className="flex flex-row items-center gap-2 bg-white p-4">
                <PenLine size={16} />
                <Text className="text-center text-xl">Rename</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                if (selectedFolderId) {
                  setIsDeleting(true);
                  setBottomSheetVisible(false);
                  setModalVisible(true);

                } else if (selectedNoteId) {
                  setIsDeleting(true);
                  setBottomSheetVisible(false);
                  setModalVisible(true);
                }
              }}
            >
              <View className="flex flex-row items-center gap-2 bg-white p-4">
                <Trash2 color="#f87171" size={16} />
                <Text className="text-red-400 text-center text-xl">Delete</Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => {
            setIsEditing(false);
            setIsDeleting(false);
            setModalVisible(false);
            setSelectedNoteId(null);
            setSelectedFolderId(null);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">
                  {selectedNoteId
                    ? 'Delete Note?'
                    : selectedFolderId
                      ? 'Delete Folder?'
                      : ''}
                </Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete. This action cannot be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-3">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setModalVisible(false);
                      setSelectedNoteId(null);
                      setSelectedFolderId(null);
                    }}
                    className="rounded-full px-4 py-2"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    disabled={
                      deleteNoteFolderMutation.isPending ||
                      deleteNoteMutation.isPending
                    }
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-4 py-2"
                  >
                    <Text className="font-semibold text-white">
                      {deleteNoteFolderMutation.isPending ||
                      deleteNoteMutation.isPending
                        ? 'Deleting...'
                        : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View>
                <NoteFolderForm
                  onSubmit={handleNoteFolderSubmit}
                  isEditing={isEditing}
                  defaultValues={{
                    id: selectedFolder?.id,
                    name: selectedFolder?.name ?? '',
                    categoryId: selectedFolder?.categoryId ?? '',
                  }}
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
