import { Text, TextInput, View, Button } from "react-native";
import React from "react";
import { Link} from "expo-router";

export default function Index() {
  const [name, setName] = React.useState('')
    const handleChange = (value :any) => {
      setName(value)
    }
  return (
    <View className="flex items-center justify-center h-screen">
      <TextInput
        className= "text-center p-2 m-2"
        placeholder="Enter your name"
        value={name}
        onChangeText={handleChange}
      />
      <Link 
            href={{pathname:'/Message', params:{name}}}  
            className="text-xl text-blue-500 p-4">
          <Text>onBord</Text>
      </Link>
    </View>
  );
}
