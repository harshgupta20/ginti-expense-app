import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useConfigStore } from '../../src/stores/configStore';
import { CategoryConfig } from '../../src/types';
import { FAB } from '../../src/components/ui/FAB';

const COLOR_CHOICES = [
  '#F97316', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444',
  '#A855F7', '#10B981', '#F59E0B', '#22C55E', '#6B7280', '#14B8A6', '#9CA3AF',
];

const ICON_CHOICES: (keyof typeof Ionicons.glyphMap)[] = [
  'fast-food', 'car', 'bag-handle', 'receipt', 'phone-portrait', 'film',
  'refresh-circle', 'heart', 'book', 'trending-up', 'swap-horizontal',
  'arrow-down-circle', 'cafe', 'cart', 'home', 'airplane', 'gift', 'paw',
  'fitness', 'school', 'wallet', 'ellipsis-horizontal-circle',
];

export default function CategoriesConfigScreen() {
  const { categories, load, addCategory, editCategory, removeCategory } = useConfigStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CategoryConfig | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>(ICON_CHOICES[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setColor(COLOR_CHOICES[0]);
    setIcon(ICON_CHOICES[0]);
    setModalVisible(true);
  };

  const openEdit = (cat: CategoryConfig) => {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon as keyof typeof Ionicons.glyphMap);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (
      categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editing?.id
      )
    ) {
      Alert.alert('Duplicate', 'A category with this name already exists.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await editCategory(editing.id, { name: trimmed, color, icon });
      } else {
        await addCategory(trimmed, color, icon);
      }
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: CategoryConfig) => {
    Alert.alert(
      'Delete category',
      `Delete "${cat.name}"? Existing transactions in this category will move to "Others".`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeCategory(cat.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Card padding={12}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}22` }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={item.color}
                />
              </View>
              <Text style={styles.catName}>{item.name}</Text>
              <TouchableOpacity onPress={() => openEdit(item)} hitSlop={8} style={styles.actionBtn}>
                <Ionicons name="pencil" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      <FAB icon="add" label="New" onPress={openAdd} />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{editing ? 'Edit Category' : 'New Category'}</Text>

            <Text style={styles.label}>Name</Text>
            <View style={styles.nameInput}>
              <Ionicons name={icon} size={20} color={color} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Groceries"
                placeholderTextColor={Colors.textMuted}
                autoFocus={!editing}
              />
            </View>

            <Text style={styles.label}>Color</Text>
            <View style={styles.swatchGrid}>
              {COLOR_CHOICES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Text style={styles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {ICON_CHOICES.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconChoice, icon === ic && { backgroundColor: `${color}33`, borderColor: color }]}
                  onPress={() => setIcon(ic)}
                >
                  <Ionicons name={ic} size={22} color={icon === ic ? color : Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sheetActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button
                label={editing ? 'Save' : 'Add'}
                onPress={handleSave}
                loading={saving}
                disabled={!name.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  actionBtn: { padding: 6 },

  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
    paddingBottom: 36,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  nameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  input: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: Colors.textPrimary },
  iconScroll: { flexGrow: 0 },
  iconChoice: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
