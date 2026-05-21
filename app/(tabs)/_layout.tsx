import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return <Ionicons name={focused ? name : (`${name}-outline` as IconName)} size={24} color={color} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 8);
  const tabHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: Platform.OS === 'android' ? 0 : 2 },
        tabBarItemStyle: { paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name="learning"
        options={{
          title: '필기 준비',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="flash" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wrong-answers"
        options={{
          title: '오답노트',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bookmark" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mock-exam"
        options={{
          title: '모의고사',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-text" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="ranking" options={{ href: null }} />
    </Tabs>
  );
}
