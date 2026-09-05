import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCountries, setCountry, useCountry } from '@/src/data';
import {
  brandGreen,
  categoryColors,
  deepGreen,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

/**
 * Opens from the country button in the home top bar.
 *
 * "Africa (all)" is pinned at the top, then the country list. In phase 1
 * only Nigeria has content, so the rest read "Coming soon" and do not
 * select. The detected country is pre-selected: this sheet is never a gate
 * in front of the first fact.
 */
export default function CountryPickerScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  // The live choice, not a copy of it. The sheet used to hold its own
  // `useState('NG')`, so picking a country set a variable that was thrown
  // away the moment this screen unmounted.
  const selected = useCountry();

  const countries = useMemo(() => getCountries(), []);
  const pinned = countries.filter((c) => c.code === 'AFR');
  const rest = useMemo(() => {
    const q = query.trim().toLowerCase();
    return countries
      .filter((c) => c.code !== 'AFR')
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true));
  }, [countries, query]);

  function choose(code: string) {
    setCountry(code);
    router.back();
  }

  return (
    <View style={styles.root}>
      <Pressable style={styles.scrim} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={[styles.grabber, { backgroundColor: colors.border }]} />
        <Text style={[typeScale.screenTitle, styles.title, { color: colors.text }]}>
          Choose a country
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search countries"
          placeholderTextColor={colors.textFaint}
          style={[
            typeScale.option,
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
        />

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {pinned.map((c) => (
            <Pressable
              key={c.code}
              onPress={() => choose(c.code)}
              style={[styles.row, { backgroundColor: categoryColors.Culture.light }]}>
              <Text style={[typeScale.label, { color: deepGreen }]}>{c.name}</Text>
              <Text style={[typeScale.caption, { color: categoryColors.Culture.mid }]}>
                Pan-African
              </Text>
            </Pressable>
          ))}

          {rest.map((c) => {
            const isSelected = c.code === selected;
            return (
              <Pressable
                key={c.code}
                disabled={!c.hasContent}
                onPress={() => choose(c.code)}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.background,
                    borderColor: isSelected ? brandGreen : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: c.hasContent ? 1 : 0.5,
                  },
                ]}>
                {/* §4.6 asks for flags. The field existed and was never
                    rendered; it is derived from the code now, so every
                    country added later arrives with one. */}
                <Text style={styles.flag}>{c.flag}</Text>
                <Text style={[typeScale.option, styles.countryName, { color: colors.text }]}>
                  {c.name}
                </Text>

                {isSelected ? (
                  <View style={[styles.check, { backgroundColor: brandGreen }]}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : !c.hasContent ? (
                  <Text style={[typeScale.caption, { color: colors.textMuted }]}>Coming soon</Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: metrics.screenPadding,
    paddingTop: spacing.md,
  },
  grabber: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, marginBottom: spacing.lg },
  title: { marginBottom: spacing.lg },
  search: {
    height: 46,
    borderRadius: radius.tile,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.tile,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  flag: { fontSize: 20, marginRight: spacing.md },
  // Takes the middle so the check or "Coming soon" stays pinned right.
  countryName: { flex: 1 },
  check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
