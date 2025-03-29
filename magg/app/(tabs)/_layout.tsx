import { Tabs } from 'expo-router/tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Message"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={25} name="envelope" color={color} />,
        }}
      />
    </Tabs>
  );
}