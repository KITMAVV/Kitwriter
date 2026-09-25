import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Alert,
} from "react-native";


import { FlatList } from "react-native-gesture-handler";

import ListCard from "../components/cards/ListCard";
import PrimaryButton from "../components/ui/PrimaryButton";

import { getDeletedChaptersByBookId, restoreChapter, deleteChapterHard } from "../repositories/chaptersRepository";

const Trash = ({ navigation, route }) => {

    const { bookId } = route.params;
    const [deletedChapters, setDeletedChapters] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);


    async function loadDeletedChapters(){
            const data = await getDeletedChaptersByBookId(bookId);
            setDeletedChapters(data);
    }

    useFocusEffect(
            useCallback(() => {

                loadDeletedChapters();

            }, [bookId])
    );

    function handleBack() {
        navigation.goBack();
    }

    function handleSelect(id) {
      setSelectedIds(prev =>
          prev.includes(id)
              ? prev.filter(selectedId => selectedId !== id)
              : [...prev, id]
      );
    }

    function handleSelectAll() {
      const allSelected =
          selectedIds.length === deletedChapters.length;

      if (allSelected) {
          setSelectedIds([]);
      } else {
          setSelectedIds(deletedChapters.map(item => item.id));
      }
    }


    async function handleRestore(id) {
        await restoreChapter(id);
        await loadDeletedChapters();
    }

    function handleDeletePress() {
        if (!selectedIds?.length) return;

        Alert.alert(
            "Delete selected chapters?",
            "This action cannot be undone.",
            [
                {
                    text: "Cancel",
                },

                {
                    text: "Delete",
                    onPress: () => handleHardDelete(selectedIds),
                },
            ]

        )
    }

    async function handleHardDelete(ids) {
        if (!ids?.length) return false;

        for (const id of ids) {
            const deleted = await deleteChapterHard(id);

            if (!deleted) {
                return false;
            }
        }

        await loadDeletedChapters();
        return true;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.Toolbar}>
                <View style={styles.leftTools}>
                    <PrimaryButton
                        btnText={"<--"}
                        btnWidth={45}
                        onPress={handleBack}
                    />

                    <Text style={styles.title}>Trash</Text>
                </View>

                <PrimaryButton
                    btnText={"Select All"}
                    btnWidth={"35%"}
                    onPress={handleSelectAll}
                />
            </View>

            <View style={styles.listContainer}>
                <View style={styles.listFlatListWrap}>
                    {deletedChapters.length === 0 ? (
                        <View style={styles.listEmptyWrap}>
                            <Text>
                                ㄟ( ▔, ▔ )ㄏ
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            style={styles.delList}
                            data={deletedChapters}
                            extraData={selectedIds}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <ListCard
                                    title={item.title}
                                    content={item.preview}
                                    mode="trash"

                                    isSelected={selectedIds.includes(item.id)}
                                    onSelectPress={() => handleSelect(item.id)}
                                    onTrashRestorePress={() => handleRestore(item.id)}

                                >
                                </ListCard>
                            )}
                        />
                    )}
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSelectAll}>
                    <Text style={styles.buttonText}>
                        Select All
                    </Text>
                </TouchableOpacity>

                <PrimaryButton
                    btnText={"Delete"}
                    btnWidth={"25%"}
                    onPress={handleDeletePress}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#bcbcbc",
    },

    actionsContainer: {
        flexDirection: "row",
        backgroundColor: "#bcbcbc",
        height: 85,
        gap: 10,
        padding: 15,
        alignItems: "center",
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        justifyContent: "center",
    },

    Toolbar: {
        height: 55,
        padding: 5,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    leftTools: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },

    title: {
        flexShrink: 1,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 3,
    },

    listContainer: {
        backgroundColor: "#d5d5d5",
        padding: 20,
        gap: 10,
        flex: 1,
        borderRadius: 15,
    },

    button: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        backgroundColor: "#e4e4e4",
        borderColor: "#878787",
        borderWidth: 1,
        borderRadius: 30,
    },

    buttonText: {
        color: "#000000",
        fontSize: 16,
    },

    listFlatListWrap: {
        flex: 1,
        backgroundColor: "#e8e8e8",
        borderRadius: 15,
    },

    delList: {
        flex: 1,
        borderRadius: 15,
    },

    listEmptyWrap: {
        flex: 1,
        margin: 10,
        borderRadius: 15,
        backgroundColor: "#d5d5d5",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default Trash;




// ToDo сделать логику ВОСТАНОВЛЕНИЕ кнопочкой(корзинку убрать нах), удаление селектнутых, и востановление главы
