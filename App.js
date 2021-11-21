import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";
/*
1. Loading 시 work / travel tap기억해서 띄어줄 것
2. completed 아이콘 표시
3. 유저가 text 수정하게 만들기
*/
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [finished, setFinished] = useState(false);
  const [onUpdating, setOnUpdating] = useState(false);
  const [list, setList] = useState({});
  useEffect(async () => {
    await getlist();
    await getMode();
  }, []);
  const getMode = async () => {
    try {
      const mode = await AsyncStorage.getItem("@working");
      setWorking(JSON.parse(mode));
    } catch (e) {}
  };
  const work = async () => {
    setWorking(true);
    try {
      await AsyncStorage.setItem("@working", JSON.stringify(true));
    } catch (e) {
      console.log(e);
    }
  };
  const travel = async () => {
    setWorking(false);
    try {
      await AsyncStorage.setItem("@working", JSON.stringify(false));
    } catch (e) {
      console.log(e);
    }
  };
  const changeInput = (text) => setText(text);
  const saveItem = async (newList) => {
    try {
      await AsyncStorage.setItem("@list", JSON.stringify(newList));
    } catch (e) {
      console.log(e);
    }
  };
  const getlist = async () => {
    try {
      const list = await AsyncStorage.getItem("@list");
      if (list) {
        setList(JSON.parse(list));
      }
    } catch (e) {
      console.log(e);
    }
  };
  const addItem = async () => {
    if (text === "") return;
    const newList = {
      ...list,
      [Date.now()]: { text, working, finished, onUpdating },
    };
    setList(newList);
    await saveItem(newList);
    setText("");
  };
  const deleteItem = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("삭제할거야?");
      if (ok) {
        const newList = { ...list };
        delete newList[key];
        setList(newList);
        await saveItem(newList);
      }
    } else {
      Alert.alert("삭제할거야?", "진짜로?", [
        {
          text: "취소해!",
          onPress: async () => {
            const newList = { ...list };
            delete newList[key];
            setList(newList);
            await saveItem(newList);
          },
        },
        { text: "아니지?" },
      ]);
    }
  };

  const finishedItem = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("완료했나요?");
      if (ok) {
        const newList = { ...list };
        newList[key].finished = !newList[key].finished;
        setList(newList);
        await saveItem(newList);
      }
    } else {
      Alert.alert("완료했나요?", "완성됐으면 확인을 눌러주세요", [
        {
          text: "완료",
          onPress: async () => {
            const newList = { ...list };
            newList[key].finished = !newList[key].finished;
            setList(newList);
            await saveItem(newList);
          },
        },
        { text: "미완료" },
      ]);
    }
  };
  const updateItem = async (key) => {
    const newList = { ...list };
    if (newList[key].onUpdating === true) {
      newList[key].onUpdating = false;
      setList(newList);
      await saveItem(newList);
      return;
    }

    newList[key].onUpdating = true;
    setList(newList);
    await saveItem(newList);
  };
  const updateTextInput = (text) => {
    setUpdateText(text);
  };
  const submitUpdateItem = async (key) => {
    const newList = { ...list };
    newList[key].text = updateText;
    newList[key].onUpdating = false;
    setList(newList);
    await saveItem(newList);
    setUpdateText("");
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.headerButton,
              color: working ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.headerButton,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          autoCorrect
          returnKeyType="send"
          onChangeText={changeInput}
          onSubmitEditing={addItem}
          placeholder={
            working ? "오늘 할 일은 무엇인가요?" : "어디로 여행가나요?"
          }
          value={text}
          style={styles.input}
        ></TextInput>
      </View>
      <ScrollView style={styles.listContainer}>
        {Object.keys(list).map((key) =>
          list[key].working === working ? (
            <View style={styles.item} key={key}>
              {list[key].onUpdating === false ? (
                <Text
                  style={
                    list[key].finished
                      ? {
                          ...styles.itemText,
                          textDecorationLine: "line-through",
                          color: "black",
                        }
                      : styles.itemText
                  }
                >
                  {list[key].text}
                </Text>
              ) : (
                <TextInput
                  style={styles.updateInput}
                  defaultValue="asd"
                  onSubmitEditing={() => submitUpdateItem(key)}
                  value={updateText}
                  onChangeText={updateTextInput}
                ></TextInput>
              )}

              <View style={styles.checkBox}>
                <TouchableOpacity onPress={() => finishedItem(key)} alert>
                  {list[key].finished === true ? (
                    <Fontisto name="checkbox-active" size={18} color="green" />
                  ) : (
                    <Fontisto name="checkbox-passive" size={18} color="white" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateItem(key)} alert>
                  <Fontisto name="eraser" size={18} color="brown" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(key)} alert>
                  <Fontisto name="trash" size={18} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 70,
  },
  headerButton: { color: "white", fontWeight: "300", fontSize: 25 },
  inputContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: theme.bgWhite,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    width: "80%",
    marginTop: 40,
    fontSize: 15,
  },
  listContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  item: {
    backgroundColor: "gray",
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 20,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: { fontSize: 15, fontWeight: "700", color: "white", flex: 0.7 },
  checkBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 0.3,
  },
  updateInput: {
    backgroundColor: "white",
    flex: 0.6,
    fontSize: 15,
    borderRadius: 10,
    color: "black",
    paddingLeft: 10,
  },
});
