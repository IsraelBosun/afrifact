import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/src/components/HapticTab';
import { brandGreen, fonts, metrics, spacing, useTheme } from '@/src/theme';

/** Four items, no more. */
export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // A phone with gesture navigation and no home indicator reports a bottom
  // inset of zero, which puts the labels flat against the edge of the
  // screen. The floor is what keeps them off it.
  const bottomInset = Math.max(insets.bottom, metrics.tabBarMinInset);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: brandGreen,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: metrics.tabBarHeight + bottomInset,
          paddingTop: spacing.sm,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 11,
        },
        // Without this the icon and label crowd each other once the bar
        // has real height to spread into.
        tabBarIconStyle: { marginBottom: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flash' : 'flash-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'game-controller' : 'game-controller-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
