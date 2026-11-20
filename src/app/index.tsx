import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MovieTag = '2D' | '3D' | 'IMAX' | '4D';
type ActiveTab = 'home' | 'details' | 'add' | 'saved' | 'profile';

interface Movie {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: MovieTag[];
  genre: string[];
  imdbRating: number;
  duration: string;
  rotten: string;
  saved: boolean;
}

const ALL_TAGS: MovieTag[] = ['2D', '3D', 'IMAX', '4D'];
const GENRE_OPTIONS = ['Action', 'Sci-Fi', 'Adventure', 'Drama', 'Crime'];

const INITIAL_MOVIES: Movie[] = [
  {
    id: '1',
    name: 'Inception',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    imageUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    tags: ['2D', 'IMAX'],
    genre: ['Action', 'Sci-Fi'],
    imdbRating: 8.8,
    duration: '2h 28m',
    rotten: '87%',
    saved: false,
  },
  {
    id: '2',
    name: 'Interstellar',
    description:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity is survival.',
    imageUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    tags: ['2D', '3D'],
    genre: ['Adventure', 'Drama'],
    imdbRating: 8.6,
    duration: '2h 49m',
    rotten: '72%',
    saved: false,
  },
  {
    id: '3',
    name: 'The Dark Knight',
    description:
      'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.',
    imageUrl:
      'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80',
    tags: ['2D', 'IMAX', '4D'],
    genre: ['Action', 'Crime'],
    imdbRating: 9.0,
    duration: '2h 32m',
    rotten: '94%',
    saved: false,
  },
];

export default function MovieAppScreen() {
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<string>('2');

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<MovieTag[]>(['2D']);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Adventure', 'Drama']);
  const [imdbRating, setImdbRating] = useState('');
  const [rotten, setRotten] = useState('');
  const [duration, setDuration] = useState('');

  const selectedMovie = useMemo(
    () => movies.find((m) => m.id === selectedMovieId) ?? movies[0],
    [movies, selectedMovieId]
  );

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genre.some((g) => g.toLowerCase().includes(q)) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [movies, searchQuery]);

  const savedMovies = useMemo(() => movies.filter((m) => m.saved), [movies]);

  const toggleSaved = (id: string) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, saved: !m.saved } : m))
    );
  };

  const openDetails = (movie: Movie) => {
    if (activeTab !== 'details') {
      setPreviousTab(activeTab);
    }
    setSelectedMovieId(movie.id);
    setActiveTab('details');
  };

  const toggleFormTag = (tag: MovieTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFormGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAddMovie = () => {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const parsedImdb = parseFloat((imdbRating || '8.6').replace(',', '.'));
    const trimmedRotten = (rotten || '72%').trim();
    const trimmedDuration = (duration || '2h 49m').trim();
    const finalImage =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80';

    if (!trimmedName || !trimmedDesc) {
      Alert.alert('Missing Fields', 'Please enter both movie name and description.');
      return;
    }

    if (isNaN(parsedImdb) || parsedImdb < 0 || parsedImdb > 10) {
      Alert.alert('Invalid Rating', 'IMDb rating must be a number between 0 and 10.');
      return;
    }

    const newMovie: Movie = {
      id: Date.now().toString(),
      name: trimmedName,
      description: trimmedDesc,
      imageUrl: finalImage,
      tags: selectedTags.length > 0 ? selectedTags : ['2D'],
      genre: selectedGenres.length > 0 ? selectedGenres : ['Action', 'Sci-Fi'],
      imdbRating: parsedImdb,
      duration: trimmedDuration,
      rotten: trimmedRotten.endsWith('%') ? trimmedRotten : `${trimmedRotten}%`,
      saved: false,
    };

    setMovies((prev) => [newMovie, ...prev]);
    setImageUrl('');
    setName('');
    setDescription('');
    setImdbRating('');
    setRotten('');
    setDuration('');
    setSelectedTags(['2D']);
    setGenreDropdownOpen(false);
    setActiveTab('home');
  };

  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('home')}
        activeOpacity={0.8}
      >
        <Ionicons
          name={activeTab === 'home' || activeTab === 'details' ? 'home' : 'home-outline'}
          size={20}
          color={activeTab === 'home' || activeTab === 'details' ? '#2563eb' : '#475569'}
        />
        <Text
          style={[
            styles.navLabel,
            (activeTab === 'home' || activeTab === 'details') && styles.navLabelActive,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('add')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add"
          size={22}
          color={activeTab === 'add' ? '#2563eb' : '#0f172a'}
        />
        <Text style={[styles.navLabel, activeTab === 'add' && styles.navLabelActive]}>
          Add Movie
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('saved')}
        activeOpacity={0.8}
      >
        <Ionicons
          name={activeTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={activeTab === 'saved' ? '#2563eb' : '#475569'}
        />
        <Text style={[styles.navLabel, activeTab === 'saved' && styles.navLabelActive]}>
          Saved
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab('profile')}
        activeOpacity={0.8}
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={20}
          color={activeTab === 'profile' ? '#2563eb' : '#475569'}
        />
        <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMovieListItem = (movie: Movie, showSavedBookmark = false) => (
    <TouchableOpacity
      key={movie.id}
      style={styles.movieRowCard}
      onPress={() => openDetails(movie)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: movie.imageUrl }} style={styles.rowPoster} />

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {movie.name}
        </Text>
        <Text style={styles.rowGenre} numberOfLines={1}>
          {movie.genre.join(', ')}
        </Text>

        <View style={styles.rowStats}>
          <Ionicons name="star" size={13} color="#f59e0b" />
          <Text style={styles.rowStatText}>{movie.imdbRating.toFixed(1)}</Text>
          <Ionicons name="time-outline" size={13} color="#64748b" />
          <Text style={styles.rowStatText}>{movie.duration}</Text>
        </View>

        <View style={styles.rowTags}>
          {movie.tags.map((tag) => (
            <View key={tag} style={styles.rowTagChip}>
              <Text style={styles.rowTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {showSavedBookmark ? (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            toggleSaved(movie.id);
          }}
          style={styles.rowActionIcon}
        >
          <Ionicons name="bookmark" size={20} color="#2563eb" />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#475569" />
      )}
    </TouchableOpacity>
  );

  const renderHomeScreen = () => (
    <ScrollView contentContainerStyle={styles.lightPad} showsVerticalScrollIndicator={false}>
      <View style={styles.homeTopBar}>
        <Text style={styles.homeHeaderTitle}>Movies</Text>
        <TouchableOpacity
          onPress={() => setSearchVisible((prev) => !prev)}
          style={styles.iconTouch}
        >
          <Ionicons name="search" size={22} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <TextInput
          style={styles.searchBox}
          placeholder="Search movies..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      {filteredMovies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No movies matching your search.</Text>
        </View>
      ) : (
        filteredMovies.map((m) => renderMovieListItem(m, false))
      )}
    </ScrollView>
  );

  const renderDetailsScreen = () => (
    <ScrollView
      style={styles.detailsBg}
      contentContainerStyle={styles.detailsPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailsTopRow}>
        <TouchableOpacity
          onPress={() => setActiveTab(previousTab)}
          style={styles.detailsBackBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          <Text style={styles.detailsTopTitle}>Movie Details</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleSaved(selectedMovie.id)}>
          <Ionicons
            name={selectedMovie.saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={selectedMovie.saved ? '#60a5fa' : '#f8fafc'}
          />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: selectedMovie.imageUrl }} style={styles.detailsCover} />

      <View style={styles.detailsNameRow}>
        <Text style={styles.detailsName}>{selectedMovie.name}</Text>
        <TouchableOpacity onPress={() => toggleSaved(selectedMovie.id)}>
          <Ionicons
            name={selectedMovie.saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color="#f8fafc"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsFormatRow}>
        {selectedMovie.tags.map((tag) => (
          <View key={tag} style={styles.detailsFormatBadge}>
            <Text style={styles.detailsFormatText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.detailsMetricsRow}>
        <View style={styles.metricItem}>
          <View style={styles.metricTop}>
            <Ionicons name="star" size={15} color="#f59e0b" />
            <Text style={styles.metricValue}>{selectedMovie.imdbRating.toFixed(1)}</Text>
          </View>
          <Text style={styles.metricSub}>IMDb</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricTop}>
            <Ionicons name="flame" size={15} color="#ef4444" />
            <Text style={styles.metricValue}>{selectedMovie.rotten}</Text>
          </View>
          <Text style={styles.metricSub}>Rotten</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricTop}>
            <Ionicons name="time-outline" size={15} color="#cbd5e1" />
            <Text style={styles.metricValue}>{selectedMovie.duration}</Text>
          </View>
          <Text style={styles.metricSub}>Duration</Text>
        </View>
      </View>

      <Text style={styles.detailsHeading}>Genre</Text>
      <View style={styles.detailsGenreRow}>
        {selectedMovie.genre.map((g) => (
          <View key={g} style={styles.detailsGenrePill}>
            <Text style={styles.detailsGenreText}>{g}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.detailsHeading}>Description</Text>
      <Text style={styles.detailsBody}>{selectedMovie.description}</Text>
    </ScrollView>
  );

  const renderAddMovieScreen = () => (
    <ScrollView contentContainerStyle={styles.lightPad} showsVerticalScrollIndicator={false}>
      <View style={styles.addTopBar}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.addBackRow}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
          <Text style={styles.addHeaderTitle}>Add Movie</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageUrlRow}>
        <View style={styles.imageSlotBox}>
          {imageUrl.trim() ? (
            <Image source={{ uri: imageUrl.trim() }} style={styles.imageSlotPreview} />
          ) : (
            <Ionicons name="image-outline" size={26} color="#94a3b8" />
          )}
        </View>

        <View style={styles.imageUrlInputCol}>
          <Text style={styles.labelText}>Image URL</Text>
          <TextInput
            style={styles.textField}
            placeholder="https://..."
            placeholderTextColor="#94a3b8"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
        </View>
      </View>

      <Text style={styles.labelText}>Name *</Text>
      <TextInput
        style={styles.textField}
        placeholder="Movie name"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.labelText}>Description *</Text>
      <TextInput
        style={[styles.textField, styles.descField]}
        placeholder="Movie description"
        placeholderTextColor="#94a3b8"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.labelText}>Tags *</Text>
      <View style={styles.tagsCheckboxRow}>
        {ALL_TAGS.map((tag) => {
          const isChecked = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={styles.checkWrap}
              onPress={() => toggleFormTag(tag)}
            >
              <View style={[styles.checkBox, isChecked && styles.checkBoxActive]}>
                {isChecked && <Ionicons name="checkmark" size={13} color="#ffffff" />}
              </View>
              <Text style={styles.checkLabel}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.labelText}>Genre *</Text>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setGenreDropdownOpen((prev) => !prev)}
      >
        <Text style={styles.dropdownText}>
          {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Select genres'}
        </Text>
        <Ionicons
          name={genreDropdownOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#64748b"
        />
      </TouchableOpacity>

      {genreDropdownOpen && (
        <View style={styles.dropdownMenu}>
          {GENRE_OPTIONS.map((g) => {
            const active = selectedGenres.includes(g);
            return (
              <TouchableOpacity
                key={g}
                style={styles.dropdownOption}
                onPress={() => toggleFormGenre(g)}
              >
                <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionActive]}>
                  {g}
                </Text>
                {active && <Ionicons name="checkmark" size={16} color="#2563eb" />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.ratingPairRow}>
        <View style={styles.ratingCol}>
          <Text style={styles.labelText}>IMDb Rating *</Text>
          <TextInput
            style={styles.textField}
            placeholder="8.6"
            placeholderTextColor="#94a3b8"
            value={imdbRating}
            onChangeText={setImdbRating}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.ratingCol}>
          <Text style={styles.labelText}>Rotten *</Text>
          <TextInput
            style={styles.textField}
            placeholder="72%"
            placeholderTextColor="#94a3b8"
            value={rotten}
            onChangeText={setRotten}
          />
        </View>
      </View>

      <Text style={styles.labelText}>Duration *</Text>
      <TextInput
        style={styles.textField}
        placeholder="2h 49m"
        placeholderTextColor="#94a3b8"
        value={duration}
        onChangeText={setDuration}
      />

      <TouchableOpacity style={styles.primaryAddBtn} onPress={handleAddMovie} activeOpacity={0.85}>
        <Text style={styles.primaryAddBtnText}>Add Movie</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSavedScreen = () => (
    <ScrollView contentContainerStyle={styles.lightPad} showsVerticalScrollIndicator={false}>
      <Text style={[styles.homeHeaderTitle, styles.mb16]}>Saved Movies</Text>

      {savedMovies.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={38} color="#94a3b8" />
          <Text style={styles.emptyStateText}>No saved movies yet.</Text>
        </View>
      ) : (
        savedMovies.map((m) => renderMovieListItem(m, true))
      )}
    </ScrollView>
  );

  const renderProfileScreen = () => (
    <ScrollView contentContainerStyle={styles.lightPad} showsVerticalScrollIndicator={false}>
      <Text style={[styles.homeHeaderTitle, styles.mb16]}>Profile</Text>

      <View style={styles.profileTop}>
        <View style={styles.profileAvatarBg}>
          <Ionicons name="person" size={44} color="#60a5fa" />
        </View>
        <Text style={styles.profileTitleName}>John Doe</Text>
        <View style={styles.profileSubtitleRow}>
          <Text style={styles.profileSubtitleText}>Movie Lover</Text>
          <Ionicons name="film-outline" size={14} color="#64748b" />
        </View>
      </View>

      <TouchableOpacity style={styles.profileItem} onPress={() => setActiveTab('saved')}>
        <View style={styles.profileItemLeft}>
          <Ionicons name="heart-outline" size={20} color="#e11d48" />
          <Text style={styles.profileItemLabel}>My Saved Movies</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileItem}
        onPress={() => Alert.alert('About App', 'React Native Movie App.')}
      >
        <View style={styles.profileItemLeft}>
          <Ionicons name="information-circle-outline" size={20} color="#334155" />
          <Text style={styles.profileItemLabel}>About App</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileItem}
        onPress={() => Alert.alert('Settings', 'App settings are up to date.')}
      >
        <View style={styles.profileItemLeft}>
          <Ionicons name="settings-outline" size={20} color="#334155" />
          <Text style={styles.profileItemLabel}>Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileItem}
        onPress={() => Alert.alert('Logout', 'Logged out.')}
      >
        <View style={styles.profileItemLeft}>
          <Ionicons name="log-out-outline" size={20} color="#475569" />
          <Text style={styles.profileItemLabel}>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <StatusBar barStyle={activeTab === 'details' ? 'light-content' : 'dark-content'} />
      <View style={styles.deviceShell}>
        <View style={styles.bodyFlex}>
          {activeTab === 'home' && renderHomeScreen()}
          {activeTab === 'details' && renderDetailsScreen()}
          {activeTab === 'add' && renderAddMovieScreen()}
          {activeTab === 'saved' && renderSavedScreen()}
          {activeTab === 'profile' && renderProfileScreen()}
        </View>
        {renderBottomNav()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  deviceShell: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
  },
  bodyFlex: {
    flex: 1,
  },
  lightPad: {
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 92,
  },
  detailsBg: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  detailsPad: {
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 92,
  },
  homeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  homeHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  mb16: {
    marginBottom: 16,
  },
  iconTouch: {
    padding: 4,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 14,
  },
  movieRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  rowPoster: {
    width: 66,
    height: 92,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowGenre: {
    fontSize: 13,
    color: '#475569',
    marginTop: 1,
  },
  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  rowStatText: {
    fontSize: 12,
    color: '#334155',
    marginRight: 8,
  },
  rowTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  rowTagChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rowTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb',
  },
  rowActionIcon: {
    padding: 6,
  },
  detailsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailsTopTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  detailsCover: {
    width: '100%',
    height: 215,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: '#1e293b',
  },
  detailsNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  detailsFormatRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  detailsFormatBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  detailsFormatText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  metricSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  detailsHeading: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsGenreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailsGenrePill: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  detailsGenreText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  addTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  imageUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  imageSlotBox: {
    width: 62,
    height: 76,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageSlotPreview: {
    width: '100%',
    height: '100%',
  },
  imageUrlInputCol: {
    flex: 1,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textField: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  descField: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  tagsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 6,
  },
  checkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxActive: {
    backgroundColor: '#4338ca',
  },
  checkLabel: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  dropdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 13,
    color: '#475569',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#334155',
  },
  dropdownOptionActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  ratingPairRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingCol: {
    flex: 1,
  },
  primaryAddBtn: {
    marginTop: 18,
    backgroundColor: '#4338ca',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryAddBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileTop: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 14,
  },
  profileAvatarBg: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileTitleName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  profileSubtitleText: {
    fontSize: 13,
    color: '#475569',
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  navLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
});