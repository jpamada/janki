import { createFolder, deleteFolder, getFoldersByCategory, updateFolder } from '@/repositories/folder.repository';
import { Folders, PenLine, Plus, SearchX, SquarePen, StickyNote, Trash2, X } from 'lucide-react-native';
import { createSubfolder, deleteSubfolder, updateSubfolder } from '@/repositories/subfolder.repository';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteNote, getNotes } from '@/repositories/note.repository';
import { getCategories } from '@/repositories/category.repository';
import { SubfolderFormData } from '@/schemas/subfolder.schema';
import { FolderFormData } from '@/schemas/folder.schema';
import { router } from 'expo-router';
import { useState } from 'react';

import SubfolderForm from '@/components/subfolders/SubfolderForm';
import FolderForm from '@/components/folders/FolderForm';
import FolderItem from '@/components/folders/FolderItem';
import NoteItem from '@/components/notes/NoteItem';
import Header from '@/components/shared/Header';

export default function NotesScreen() {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [fabVisible, setFabVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [subfolderModalVisible, setSubfolderModalVisible] = useState(false);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubfolderId, setSelectedSubfolderId] = useState<string | null>(null);

  const {
    data: notes = [],
    isLoading: notesIsLoading,
    error: notesError,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  const {
    data: folders = [],
    isLoading: foldersIsLoading,
    error: foldersError,
  } = useQuery({
    queryKey: ['folders', selectedCategoryId],
    queryFn: () => getFoldersByCategory(selectedCategoryId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const selectedFolder = folders.find(
    (folder) => folder.id === selectedFolderId,
  );

  const selectedSubfolder = folders
    .flatMap((folder) => folder.subfolders)
    .find((subfolder) => subfolder.id === selectedSubfolderId);

  const selectedNote = notes.find(
    (note) => note.id === selectedNoteId
  );

  const createFolderMutation = useMutation({
    mutationFn: createFolder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setFolderModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FolderFormData }) =>
      updateFolder(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setFolderModalVisible(false);
      setIsEditing(false);
      setSelectedFolderId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setSelectedFolderId(null);
      setFolderModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const createSubfolderMutation = useMutation({
    mutationFn: createSubfolder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setSelectedFolderId(null);
      setSubfolderModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateSubfolderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubfolderFormData }) =>
      updateSubfolder(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setIsEditing(false);
      setSelectedFolderId(null);
      setSelectedSubfolderId(null);
      setSubfolderModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteSubfolderMutation = useMutation({
    mutationFn: deleteSubfolder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setIsDeleting(false);
      setSelectedSubfolderId(null);
      setSubfolderModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      setIsDeleting(false);
      setSelectedNoteId(null);
      setNoteModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleFolderSubmit = async (data: FolderFormData) => {
    if (isEditing && selectedFolderId) {
      await updateFolderMutation.mutateAsync({
        id: selectedFolderId,
        data: {
          name: data.name,
          categoryId: data.categoryId,
        },
      });

    } else {
      await createFolderMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId,
      });
    }
  };

  const handleSubfolderSubmit = async (data: SubfolderFormData) => {
    if (isEditing && selectedSubfolderId) {
      await updateSubfolderMutation.mutateAsync({
        id: selectedSubfolderId,
        data: {
          name: data.name,
          folderId: data.folderId,
        },
      });

    } else if (selectedFolderId) {
      await createSubfolderMutation.mutateAsync({
        name: data.name,
        folderId: selectedFolderId,
      });
    }
  };

  const handleFolderLongPress = (id: string) => {
    setSelectedFolderId(id);
    setBottomSheetVisible(true);
  };

  const handleSubfolderLongPress = (id: string) => {
    setSelectedSubfolderId(id);
    setBottomSheetVisible(true);
  };

  const handleNoteLongPress = (id: string) => {
    setSelectedNoteId(id);
    setBottomSheetVisible(true);
  };

  const handleDelete = async () => {
    if (selectedFolderId) {
      await deleteFolderMutation.mutateAsync(selectedFolderId);

    } else if (selectedSubfolderId) {
      await deleteSubfolderMutation.mutateAsync(selectedSubfolderId);

    } else if (selectedNoteId) {
      await deleteNoteMutation.mutateAsync(selectedNoteId);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="Notes" />

      <ScrollView
        horizontal
        className="max-h-12"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-2 px-6"
      >
        <Pressable
          onPress={() => setSelectedCategoryId(null)}
          className={`rounded-full px-4 py-2 ${
            selectedCategoryId == null ? "bg-gray-600" : "bg-gray-50"
          }`}
        >
          <Text
            className={`text-gray-600 text-sm ${
              selectedCategoryId == null ? 'text-white font-bold' : 'font-semibold'
            }`}
          >
            Default
          </Text>
        </Pressable>

        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategoryId(category.id)}
            className={`rounded-full px-4 py-2 ${
              selectedCategoryId === category.id ? "bg-gray-600" : "bg-gray-50"
            }`}
          >
            <Text
              className={`text-gray-600 text-sm ${
                selectedCategoryId === category.id ? 'text-white font-bold' : 'font-semibold'
              }`}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push('/categories')}
          className="bg-gray-50 rounded-full px-4 py-2"
        >
          <Plus size={16} />
        </Pressable>
      </ScrollView>

      <View className="flex-1 px-6 py-4">
        {notesIsLoading || foldersIsLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ) : notesError || foldersError ? (
          <View className="flex-1 justify-center items-center">
            <Text>Failed to load notes.</Text>
          </View>

        ) : notes.length > 0 || folders.length > 0 ? (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View className="gap-2">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    onFolderLongPress={handleFolderLongPress}
                    onSubfolderLongPress={handleSubfolderLongPress}
                    onNoteLongPress={handleNoteLongPress}
                  />
                ))}
              </View>
            }
            renderItem={({ item }) => (
              <NoteItem
                id={item.id}
                title={item.title}
                createdAt={item.createdAt}
                onLongPress={handleNoteLongPress}
              />
            )}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
          />

        ) : (
          <View className="flex-1 items-center justify-center">
            <SearchX size={64} color="#9ca3af" />
            <Text className="text-gray-400 font-semibold">No notes found</Text>
          </View>
        )}
      </View>

      {fabVisible && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setFabVisible(false)}
        />
      )}

      <View className="absolute bottom-6 right-6 items-end">
        {fabVisible && (
          <View className="mb-3 items-end gap-3">
            <Pressable
              onPress={() => {
                setFabVisible(false);
                setIsEditing(false);
                setSelectedFolderId(null);
                setFolderModalVisible(true);
              }}
              className="flex-row items-center gap-1 rounded-full bg-white px-4 py-3"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <Folders size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Folder</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setFabVisible(false);
                router.push('/notes/create');
              }}
              className="flex-row items-center gap-1 rounded-full bg-white px-4 py-3"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <StickyNote size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Note</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => setFabVisible((prev) => !prev)}
          className="h-14 w-14 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
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
            <View className="bg-white rounded-3xl">
              {selectedFolderId && (
                <View>
                  <Pressable
                    onPress={() => {
                      setBottomSheetVisible(false);
                      router.push({
                        pathname: `/notes/create`,
                        params: { folderId: selectedFolderId },
                      });
                    }}
                  >
                    <View className="flex flex-row items-center gap-2 p-4">
                      <SquarePen size={16} />
                      <Text className="text-center text-xl">New Note</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (!selectedFolderId) return;
                      setIsEditing(false);
                      setIsDeleting(false);
                      setFabVisible(false);
                      setSelectedSubfolderId(null);
                      setBottomSheetVisible(false);
                      setSubfolderModalVisible(true);
                    }}
                  >
                    <View className="flex flex-row items-center gap-2 p-4">
                      <Folders size={16} />
                      <Text className="text-center text-xl">New Subfolder</Text>
                    </View>
                  </Pressable>
                </View>
              )}

              {selectedSubfolderId && (
                <Pressable
                  onPress={() => {
                    setBottomSheetVisible(false);
                    router.push({
                      pathname: `/notes/create`,
                      params: { subfolderId: selectedSubfolderId },
                    });
                  }}
                >
                  <View className="flex flex-row items-center gap-2 p-4">
                    <SquarePen size={16} />
                    <Text className="text-center text-xl">New Note</Text>
                  </View>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  if (selectedFolderId) {
                    setIsEditing(true);
                    setBottomSheetVisible(false);
                    setFolderModalVisible(true);

                  } else if (selectedSubfolderId) {
                    setIsEditing(true);
                    setBottomSheetVisible(false);
                    setSubfolderModalVisible(true);
                  }
                }}
              >
                <View className="flex flex-row items-center gap-2 p-4">
                  <PenLine size={16} />
                  <Text className="text-center text-xl">Rename</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (selectedFolderId) {
                    setIsDeleting(true);
                    setFolderModalVisible(true);
                    setBottomSheetVisible(false);

                  } else if (selectedSubfolderId) {
                    setIsDeleting(true);
                    setBottomSheetVisible(false);
                    setSubfolderModalVisible(true);
                    
                  } else if (selectedNoteId) {
                    setIsDeleting(true);
                    setNoteModalVisible(true);
                    setBottomSheetVisible(false);
                  }
                }}
              >
                <View className="flex flex-row items-center gap-2 p-4">
                  <Trash2 color="#f87171" size={16} />
                  <Text className="text-red-400 text-center text-xl">
                    Delete
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={folderModalVisible}
        onRequestClose={() => setFolderModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => {
            setIsEditing(false);
            setIsDeleting(false);
            setSelectedFolderId(null);
            setFolderModalVisible(false);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">Delete Folder</Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this folder. This action
                  cannot be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-3">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedFolderId(null);
                      setFolderModalVisible(false);
                    }}
                    className="rounded-full px-4 py-2"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleDelete}
                    disabled={deleteFolderMutation.isPending}
                    className="rounded-full bg-red-500 px-4 py-2"
                  >
                    <Text className="font-semibold text-white">
                      {deleteFolderMutation.isPending
                        ? 'Deleting...'
                        : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <FolderForm
                onSubmit={handleFolderSubmit}
                isEditing={isEditing}
                defaultValues={{
                  name: selectedFolder?.name ?? 'Untitled',
                  categoryId: selectedFolder?.categoryId ?? null,
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={subfolderModalVisible}
        onRequestClose={() => setSubfolderModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => {
            setIsEditing(false);
            setIsDeleting(false);
            setSelectedFolderId(null);
            setSelectedSubfolderId(null);
            setSubfolderModalVisible(false);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">Delete Subfolder</Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this subfolder. This action
                  cannot be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-3">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedFolderId(null);
                      setSelectedSubfolderId(null);
                      setSubfolderModalVisible(false);
                    }}
                    className="rounded-full px-4 py-2"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteSubfolderMutation.isPending}
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-4 py-2"
                  >
                    <Text className="font-semibold text-white">
                      {deleteSubfolderMutation.isPending
                        ? 'Deleting...'
                        : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <SubfolderForm
                onSubmit={handleSubfolderSubmit}
                isEditing={isEditing}
                defaultValues={{
                  name: selectedSubfolder?.name ?? 'Untitled',
                  folderId:
                    selectedSubfolder?.folderId ?? selectedFolderId ?? '',
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => {
            setIsEditing(false);
            setIsDeleting(false);
            setSelectedNoteId(null);
            setNoteModalVisible(false);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">Delete Note</Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this note. This action cannot
                  be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-3">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedNoteId(null);
                      setNoteModalVisible(false);
                    }}
                    className="rounded-full px-4 py-2"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteNoteMutation.isPending}
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-4 py-2"
                  >
                    <Text className="font-semibold text-white">
                      {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
