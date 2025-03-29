import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
} from "react-native";
import io from "socket.io-client";
import { Audio } from "expo-av";

const socket = io("https://mag-8a5m.onrender.com");

const Message = () => {
  const { name } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<
    { user: string; message: string; position: "left" | "right" }[]
  >([]);

  const notificationSound = useRef(new Audio.Sound());
  const newUserSound = useRef(new Audio.Sound());
  const userLeftSound = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await notificationSound.current.loadAsync(require("../assets/notification.mp3"));
        await newUserSound.current.loadAsync(require("../assets/new-user.wav"));
        await userLeftSound.current.loadAsync(require("../assets/left.wav"));
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    };

    loadSounds();

    return () => {
      notificationSound.current.unloadAsync();
      newUserSound.current.unloadAsync();
      userLeftSound.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (name) socket.emit("join", name);

    const handleReceive = (data: { user: string; message: string }) => {
      setReceivedMessages((prev) => [...prev, { ...data, position: "left" }]);
      notificationSound.current.playAsync().catch(console.error);
    };

    const handleNewUser = (userName: string) => {
      if (userName !== name) {
        Alert.alert(`${userName} has joined the chat!`);
        newUserSound.current.playAsync().catch(console.error);
      }
    };

    const handleUserLeft = (userName: string) => {
      Alert.alert(`${userName} has left the chat!`);
      userLeftSound.current.playAsync().catch(console.error);
    };

    socket.on("user-join", handleNewUser);
    socket.on("reciver", handleReceive);
    socket.on("left", handleUserLeft);

    return () => {
      socket.off("user-join", handleNewUser);
      socket.off("reciver", handleReceive);
      socket.off("left", handleUserLeft);
    };
  }, [name]);

  const handleSend = () => {
    if (!message.trim()) return;

    setReceivedMessages((prev) => [
      ...prev,
      { user: name as string, message, position: "right" },
    ]);

    socket.emit("send", message);
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center bg-gray-100 p-4">
          <Text className="text-2xl font-semibold text-blue-500 mb-4">Welcome: {name}</Text>

          {/* Chat Box - Adjusts width based on screen size */}
          <View className="w-full max-w-3xl flex-1 border-2 border-blue-500 p-3 rounded-lg bg-white ">
            <FlatList
              data={receivedMessages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  className={`p-3 m-2 min-w-[150px] max-w-xs rounded-lg ${
                    item.position === "right" ? "self-end bg-gray-100 " : "self-start bg-gray-300"
                  }`}
                >
                  <Text className="font-bold text-blue-500">{item.user}</Text>
                  <Text>{item.message}</Text>
                </View>
              )}
            />
          </View>

          {/* Input Section - Centered on all screen sizes */}
          <View className="bottom-5 w-full max-w-3xl px-4">
            <TextInput
              className="border-2 border-blue-500 p-3 w-full text-lg rounded-lg bg-white shadow-md"
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              onSubmitEditing={handleSend}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Message;
