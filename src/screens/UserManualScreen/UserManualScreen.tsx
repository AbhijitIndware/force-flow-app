/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {Divider} from '@rneui/themed';
import {PlayCircle, Search} from 'lucide-react-native';
import {
  useGetManualCategoriesQuery,
  useGetUserManualQuery,
} from '../../features/user-manual/user-manual-api';
import ReusableDropdown from '../../components/ui-lib/resusable-dropdown';
import {UserManualCategory, UserManualVideo} from '../../types/userManualType';
import {SoAppStackParamList} from '../../types/Navigation';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'UserManualScreen'
>;

type Props = {navigation: NavigationProp; route: any};

const ALL_CATEGORIES = 'all';

const UserManualScreen = ({navigation}: Props) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORIES);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(
    undefined,
  );
  const [search, setSearch] = useState('');

  // Debounce search input so each keystroke doesn't refire the request
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const {data: categoriesData} = useGetManualCategoriesQuery(undefined);
  console.log('🚀 ~ UserManualScreen ~ categoriesData:', categoriesData);

  const {data: manualData, isFetching: manualLoading} = useGetUserManualQuery({
    category:
      selectedCategory === ALL_CATEGORIES ? undefined : selectedCategory,
    language: selectedLanguage,
    search: debouncedSearch || undefined,
  });
  console.log('🚀 ~ UserManualScreen ~ manualData:', manualData);

  // Normalize the categories endpoint across plausible response shapes.
  const rawCategoriesData = categoriesData as unknown as
    | Record<string, any>
    | undefined;
  const rawCategories: unknown =
    rawCategoriesData?.data?.categories ??
    rawCategoriesData?.message?.data?.categories ??
    rawCategoriesData?.categories ??
    rawCategoriesData?.data ??
    rawCategoriesData?.message?.categories ??
    rawCategoriesData?.message?.data;

  const apiCategories: UserManualCategory[] = Array.isArray(rawCategories)
    ? (rawCategories as UserManualCategory[])
    : [];

  const sections = manualData?.data?.sections ?? [];
  const languages = manualData?.data?.languages ?? [];

  // Fall back to categories derived from the manual's own sections so the
  // chips/dropdown still populate if the categories endpoint is empty.
  const sectionCategories: UserManualCategory[] = sections
    .filter(s => !apiCategories.some(c => c.category === s.category))
    .map(s => ({
      category: s.category,
      category_name: s.category_name,
      icon: s.icon,
      sequence: s.sequence,
      video_count: s.video_count,
    }));

  const categories: UserManualCategory[] = [
    ...apiCategories,
    ...sectionCategories,
  ];
  console.log('🚀 ~ UserManualScreen ~ categories:', categories);

  const openVideo = (video: UserManualVideo) =>
    navigation.navigate('UserManualVideoScreen', {video});

  const activeManualLoading = manualLoading || debouncedSearch !== search;

  return (
    <SafeAreaView style={[flexCol, styles.safeArea]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={Colors.greyDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Manual</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Search + category */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search strokeWidth={1.8} color={Colors.gray} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search the manual"
              placeholderTextColor={Colors.gray}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.categoryDropdown}>
            <ReusableDropdown
              label=""
              field="category"
              value={selectedCategory}
              data={[
                {label: 'All Categories', value: ALL_CATEGORIES},
                ...categories.map(c => ({
                  label: c.category_name,
                  value: c.category,
                })),
              ]}
              onChange={value => setSelectedCategory(value || ALL_CATEGORIES)}
              marginBottom={0}
              height={46}
            />
          </View>
        </View>

        {/* Category chips */}
        {/* {categories.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedCategory === ALL_CATEGORIES && styles.chipActive,
                ]}
                onPress={() => setSelectedCategory(ALL_CATEGORIES)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === ALL_CATEGORIES &&
                      styles.chipTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(cat => {
                const active = selectedCategory === cat.category;
                return (
                  <TouchableOpacity
                    key={cat.category}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSelectedCategory(cat.category)}>
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}>
                      {cat.category_name}
                    </Text>
                    {cat.video_count ? (
                      <View
                        style={[
                          styles.chipCount,
                          active && styles.chipCountActive,
                        ]}>
                        <Text
                          style={[
                            styles.chipCountText,
                            active && styles.chipCountTextActive,
                          ]}>
                          {cat.video_count}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )} */}

        {/* Language chips */}
        {languages.length > 1 && (
          <View>
            <Text style={styles.sectionLabel}>Language</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !selectedLanguage && styles.chipActive]}
                onPress={() => setSelectedLanguage(undefined)}>
                <Text
                  style={[
                    styles.chipText,
                    !selectedLanguage && styles.chipTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>
              {languages.map(lang => {
                const active = selectedLanguage === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() =>
                      setSelectedLanguage(active ? undefined : lang)
                    }>
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Loading */}
        {activeManualLoading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={Colors.orange} />
          </View>
        )}

        {/* Empty state */}
        {!activeManualLoading && sections.length === 0 && (
          <View style={styles.emptyBox}>
            <PlayCircle strokeWidth={1.5} color={Colors.gray} size={42} />
            <Text style={styles.emptyTitle}>No clips found</Text>
            <Text style={styles.emptyText}>
              Try a different search, category or language.
            </Text>
          </View>
        )}

        {/* Sections grouped by category, in server order */}
        {sections.map(section => (
          <View key={section.category} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBox}>
                <Ionicons
                  name={
                    section.icon === 'play-circle'
                      ? 'play-circle-outline'
                      : 'videocam-outline'
                  }
                  size={20}
                  color={Colors.white}
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>{section.category_name}</Text>
                {section.description ? (
                  <Text style={styles.sectionDesc} numberOfLines={2}>
                    {section.description}
                  </Text>
                ) : null}
              </View>
              {section.video_count > 0 && (
                <Text style={styles.sectionCount}>{section.video_count}</Text>
              )}
            </View>

            {section.videos.map((video, idx) => (
              <View key={video.video_id}>
                {idx > 0 && (
                  <Divider
                    width={1}
                    color={Colors.lightGray}
                    style={{borderStyle: 'dashed'}}
                  />
                )}
                <TouchableOpacity
                  style={styles.videoRow}
                  onPress={() => openVideo(video)}>
                  <View style={styles.videoIconBox}>
                    <PlayCircle
                      strokeWidth={1.8}
                      color={Colors.white}
                      size={18}
                    />
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={1}>
                      {video.title}
                    </Text>
                    {video.description ? (
                      <Text style={styles.videoDesc} numberOfLines={1}>
                        {video.description}
                      </Text>
                    ) : null}
                    <View style={styles.videoMetaRow}>
                      {video.duration ? (
                        <Text style={styles.videoMeta}>{video.duration}</Text>
                      ) : null}
                      {video.file_size ? (
                        <Text style={styles.videoMeta}>
                          · {video.file_size}
                        </Text>
                      ) : null}
                      {video.language ? (
                        <Text style={styles.videoMeta}>· {video.language}</Text>
                      ) : null}
                      {video.is_external ? (
                        <Text style={styles.videoMeta}>· External</Text>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserManualScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  headerSpacer: {width: 24},
  content: {padding: 16, paddingBottom: 30},
  searchRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  categoryDropdown: {width: 150},
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 46,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  searchInput: {
    flex: 1,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    paddingVertical: 0,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  chipRow: {gap: 8, paddingRight: 8},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  chipActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkGray,
  },
  chipTextActive: {color: Colors.white},
  chipCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipCountActive: {backgroundColor: 'rgba(255,255,255,0.3)'},
  chipCountText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.darkGray,
  },
  chipCountTextActive: {color: Colors.white},
  loaderBox: {paddingVertical: 30, alignItems: 'center'},
  emptyBox: {alignItems: 'center', paddingVertical: 50, gap: 6},
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.Orangelight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {flex: 1},
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  sectionDesc: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    lineHeight: 16,
  },
  sectionCount: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.orange,
    backgroundColor: Colors.lightOrange,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  videoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.darkButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {flex: 1},
  videoTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
    lineHeight: 18,
  },
  videoDesc: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    lineHeight: 15,
  },
  videoMetaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  videoMeta: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.darkGray,
  },
});
