import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { ClipboardList, Home, UserCog, CircleUser as UserCircle, Users } from 'lucide-react-native';
import { AuthContext } from 'context/AuthContext';

export default function TabLayout() {
  const { user } = useContext(AuthContext);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="questions"
        options={{
          title: 'Votaciones',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: user?.rol === 'administrador' ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <UserCog size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          href: user?.rol === 'administrador' ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}