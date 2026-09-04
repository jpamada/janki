import { FileText, FolderClosed, Folders, PenLine, Plus, SearchX, SquarePen, Trash2, X } from 'lucide-react-native';
import { createFolder, deleteFolder, getFoldersByCategory, updateFolder } from '@/repositories/folder.repository';
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { createSubfolder, deleteSubfolder, updateSubfolder } from '@/repositories/subfolder.repository';
import { createNote, deleteNote, getNotes, updateNote } from '@/repositories/note.repository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '@/repositories/category.repository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubfolderFormData } from '@/schemas/subfolder.schema';
import { FolderFormData } from '@/schemas/folder.schema';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { NoteFormData } from '@/schemas/note.schema';
import { router } from 'expo-router';
import { useState } from 'react';

import SubfolderForm from '@/components/subfolders/SubfolderForm';
import FolderForm from '@/components/folders/FolderForm';
import FolderItem from '@/components/folders/FolderItem';
import NoteItem from '@/components/notes/NoteItem';
import NoteForm from '@/components/notes/NoteForm';
import Header from '@/components/shared/Header';

export default function NotesScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const {
    backdropOpacity,
    open: openBottomSheet,
    close: closeBottomSheet,
    visible: bottomSheetVisible,
    translateY: bottomSheetTranslateY,
  } = useBottomSheet();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [fabVisible, setFabVisible] = useState(false);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [subfolderModalVisible, setSubfolderModalVisible] = useState(false);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubfolderId, setSelectedSubfolderId] = useState<string | null>(null);

  const { data: notes = [], isLoading: notesIsLoading, error: notesError } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  const { data: folders = [], isLoading: foldersIsLoading, error: foldersError } = useQuery({
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

  const allNotes = [
    ...notes,
    ...folders.flatMap((folder) => folder.notes ?? []),
    ...folders.flatMap((folder) => folder.subfolders.flatMap((subfolder) => subfolder.notes ?? [])
    ),
  ];

  const selectedNote = allNotes.find(
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
        await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
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
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
      });
      setIsEditing(false);
      setSelectedFolderId(null);
      setFolderModalVisible(false);
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
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
      });
      setIsDeleting(false);
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
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
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
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
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
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
      });
      setIsDeleting(false);
      setSelectedSubfolderId(null);
      setSubfolderModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: createNote,

    onSuccess: async ({id, title}) => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
      });
      setNoteModalVisible(false);
      router.push({
        pathname: '/notes/[id]',
        params: { id: id, title: title }
      });
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteFormData }) =>
      updateNote(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
      });
      setIsEditing(false);
      setSelectedNoteId(null);
      setNoteModalVisible(false);
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
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
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

  const handleNoteSubmit = async (data: NoteFormData) => {
    if (isEditing && selectedNoteId) {
      await updateNoteMutation.mutateAsync({
        id: selectedNoteId,
        data: {
          title: data.title,
          folderId: selectedNote?.folderId ?? selectedFolderId ?? null,
          subfolderId: selectedNote?.subfolderId ?? selectedSubfolderId ?? null
        },
      });

    } else {
      await createNoteMutation.mutateAsync({
        title: data.title,
        folderId: selectedFolderId ?? undefined,
        subfolderId: selectedSubfolderId ?? undefined
      });
    }
  };

  const handleFolderLongPress = (id: string) => {
    setSelectedFolderId(id);
    setSelectedSubfolderId(null);
    openBottomSheet();
  };

  const handleSubfolderLongPress = (id: string) => {
    setSelectedSubfolderId(id);
    setSelectedFolderId(null);
    openBottomSheet();
  };

  const handleNoteLongPress = (id: string) => {
    setSelectedNoteId(id);
    openBottomSheet();
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
          disabled={selectedCategoryId == null}
          className={`rounded-full px-4 py-2 ${
            selectedCategoryId == null ? "bg-gray-600" : "bg-gray-50 active:bg-gray-100"
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
              selectedCategoryId === category.id ? "bg-gray-600" : "bg-gray-50 active:bg-gray-100"
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
          className="flex flex-row items-center gap-1 bg-gray-50 rounded-full px-4 py-2 active:bg-gray-100"
        >
          <Plus color="#4b5563" strokeWidth={2} size={16} />
          <Text className='text-gray-600 text-sm font-semibold'>
            New Category
          </Text>
        </Pressable>
      </ScrollView>

      <View className="flex-1 px-6 py-4">
        {notesIsLoading || foldersIsLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ) : notesError || foldersError ? (
          <View className="flex-1 justify-center items-center">
            <Text>Failed to load notes</Text>
          </View>

        ) : notes.length > 0 || folders.length > 0 ? (
          <FlatList
            data={notes}
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
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
          />

        ) : (
          <View className="flex-1 items-center justify-center">
            <SearchX size={64} color="#9ca3af" />
            <Text className="text-gray-400 font-semibold">
              No notes found
            </Text>
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
              className="flex-row items-center gap-2 rounded-full bg-white px-4 py-3 active:bg-gray-50"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <FolderClosed size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Folder</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setFabVisible(false);
                setNoteModalVisible(true);
              }}
              className="flex-row items-center gap-2 rounded-full bg-white px-4 py-3 active:bg-gray-50"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <FileText size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">
                New Note
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => setFabVisible((prev) => !prev)}
          className="h-16 w-16 items-center justify-center rounded-full bg-white active:bg-gray-50"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          {fabVisible ? (
            <X size={24} color="#4b5563" strokeWidth={2.5} />
          ) : (
            <Plus size={24} color="#4b5563" strokeWidth={2.5} />
          )}
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="none"
        visible={bottomSheetVisible}
        onRequestClose={() => closeBottomSheet()}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: backdropOpacity }}
          >
            <Pressable
              className="flex-1"
              onPress={() => {
                setSelectedNoteId(null);
                setSelectedFolderId(null);
                closeBottomSheet();
              }}
            />
          </Animated.View>

          <Animated.View
            style={{ transform: [{ translateY: bottomSheetTranslateY }] }}
            className="rounded-t-3xl bg-gray-50 px-4 py-8"
          >
            <View className="rounded-3xl bg-white">
              {selectedFolderId && (
                <View>
                  <Pressable
                    onPress={() => {
                      closeBottomSheet(() => {
                        setNoteModalVisible(true);
                      });
                    }}
                    className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
                  >
                    <SquarePen size={16} />
                    <Text className="text-xl">
                      New Note
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (!selectedFolderId) return;
                      setSelectedSubfolderId(null);
                      setIsEditing(false);
                      setIsDeleting(false);
                      setFabVisible(false);
                      closeBottomSheet(() => {
                        setSubfolderModalVisible(true);
                      });
                    }}
                    className="flex-row items-center gap-2 p-4 active:bg-gray-100"
                  >
                    <Folders size={16} />
                    <Text className="text-xl">New Subfolder</Text>
                  </Pressable>
                </View>
              )}

              {selectedSubfolderId && (
                <Pressable
                  onPress={() => {
                    closeBottomSheet(() => {
                      setNoteModalVisible(true);
                    });
                  }}
                  className="flex-row items-center gap-2 p-4 active:bg-gray-100"
                >
                  <SquarePen size={16} />
                  <Text className="text-xl">New Note</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  setIsEditing(true);

                  if (selectedFolderId) {
                    closeBottomSheet(() => {
                      setFolderModalVisible(true);
                    });

                  } else if (selectedSubfolderId) {
                    closeBottomSheet(() => {
                      setSubfolderModalVisible(true);
                    });

                  } else if (selectedNoteId) {
                    closeBottomSheet(() => {
                      setNoteModalVisible(true);
                    });
                  }
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <PenLine size={16} />
                <Text className="text-xl">
                  Update
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsDeleting(true);

                  if (selectedFolderId) {
                    closeBottomSheet(() => {
                      setFolderModalVisible(true);
                    });

                  } else if (selectedSubfolderId) {
                    closeBottomSheet(() => {
                      setSubfolderModalVisible(true);
                    });

                  } else if (selectedNoteId) {
                    closeBottomSheet(() => {
                      setNoteModalVisible(true);
                    });
                  }
                }}
                className="flex-row items-center gap-2 rounded-b-3xl p-4 active:bg-gray-100"
              >
                <Trash2 color="#f87171" size={16} />
                <Text className="text-xl text-red-400">
                  Delete
                </Text>
              </Pressable>
            </View>

            <View style={{ height: insets.bottom }} />
          </Animated.View>
        </View>
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
                <Text className="text-xl font-bold">
                  Delete Folder
                </Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this folder. This action
                  cannot be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedFolderId(null);
                      setFolderModalVisible(false);
                    }}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleDelete}
                    disabled={deleteFolderMutation.isPending}
                    className="rounded-full bg-red-500 px-6 py-3 active:bg-red-400"
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
                  categoryId: selectedFolder?.categoryId ?? selectedCategoryId ?? null,
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
                <Text className="text-xl font-bold">
                  Delete Subfolder
                </Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this subfolder. This action
                  cannot be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedFolderId(null);
                      setSelectedSubfolderId(null);
                      setSubfolderModalVisible(false);
                    }}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteSubfolderMutation.isPending}
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-6 py-3 active:bg-red-400"
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
                  folderId: selectedSubfolder?.folderId ?? selectedFolderId ?? '',
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
                <Text className="text-xl font-bold">
                  Delete Note
                </Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this note. This action cannot
                  be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedNoteId(null);
                      setNoteModalVisible(false);
                    }}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteNoteMutation.isPending}
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-6 py-3 active:bg-red-400"
                  >
                    <Text className="font-semibold text-white">
                      {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>

            ) : (
              <NoteForm
                onSubmit={handleNoteSubmit}
                isEditing={isEditing}
                defaultValues={{
                  title: selectedNote?.title ?? 'Untitled',
                  folderId: selectedNote?.folderId ?? selectedFolderId ?? null,
                  subfolderId: selectedNote?.subfolderId ?? selectedSubfolderId ?? null,
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
