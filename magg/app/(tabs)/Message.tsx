import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import io from 'socket.io-client';
import { Audio } from 'expo-av';

const socket = io('http://localhost:5000');

const Message = () => {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<{ user: string; message: string, Position : string }[]>([]);
  const { name } = useLocalSearchParams();
  const notification = new Audio.Sound();
  const newUser = new Audio.Sound();
  const left = new Audio.Sound();


  useEffect(() => {
    async function loadSound() {
      await notification.loadAsync(require('../assets/notification.mp3'));
      await newUser.loadAsync(require('../assets/new-user.wav'));
      await left.loadAsync(require('../assets/left.wav'));
    }
    loadSound();
  }, []);

  useEffect(() => {
    if (name) {
      socket.emit('join', name);
    }

    const handleReceive = (data : any) => {
      console.log('Received:', data);
      setReceivedMessages((prevMessages) => [...prevMessages, { user: data.user, message: data.message, Position: 'left' }]);
      // Play notification sound
      notification.playAsync().catch((error) => console.error('Error playing sound:', error));
    };

    const handleNewUser = (userName : any) => {
      if (userName !== name) { // Prevent alert for the user who joined
        alert(`${userName} has joined the chat!`);
        newUser.playAsync().catch((error) =>
          console.error("Error playing new user sound:", error)
        );
      }
    };

    const handleUserLeft = (userName : any) => {
      alert(`${userName} has left the chat!`);
      // Play notification sound
      left.playAsync().catch((error) => console.error('Error playing sound:', error));
    }
  
    socket.on('user-join', handleNewUser);
    socket.on('reciver', handleReceive);
    socket.on('left', handleUserLeft);

    return () => {
      socket.off('user-join', handleNewUser);
      socket.off('reciver', handleReceive);
      socket.off('left', handleUserLeft);
    };
  }, [name]);

  const handleSend = () => {
    if (message.trim() !== '') {
      setReceivedMessages((prevMessages) => [...prevMessages, { user: name as string, message, Position: 'right' }]);
      socket.emit('send', message);
      setMessage('');
    }
  };

  console.log('receivedMessages', receivedMessages);
  

  return (
    <View className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <Text className="text-5xl text-blue-500 p-4">Welcome: {name}</Text>
      <View className="h-2/3 w-3/4 border-2 border-blue-500 p-2">
        <FlatList
          data={receivedMessages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[item.Position === 'right' ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} className="p-3 m-2 min-w-[150px] max-w-xs  rounded-lg text-white shadow-md">
              <Text className="text-blue-500">{item.user}</Text>
              <Text>{item.message}</Text>
            </View>
          )}
        />
      </View>
      <TextInput
        className="border-2 border-blue-500 p-2 w-3/4"
        value={message}
        onChangeText={setMessage}
        placeholder="Enter your message"
        onSubmitEditing={handleSend}
      />
    </View>
  );
};

export default Message;