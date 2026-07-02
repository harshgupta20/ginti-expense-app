import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useMerchantStore } from '../../src/stores/merchantStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { MerchantAlias } from '../../src/types';

export default function MerchantAliasesScreen() {
  const { aliases, isLoading, fetchAliases, addAlias, removeAlias } = useMerchantStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [original, setOriginal] = useState('');
  const [normalized, setNormalized] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAliases();
  }, []);

  const handleAdd = async () => {
    if (!original.trim() || !normalized.trim()) return;
    setSaving(true);
    await addAlias(original.trim(), normalized.trim());
    setSaving(false);
    setModalVisible(false);
    setOriginal('');
    setNormalized('');
  };

  const handleDelete = (alias: MerchantAlias) => {
    Alert.alert('Remove Alias', `Remove "${alias.original_name}" → "${alias.normalized_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeAlias(alias.id) },
    ]);
  };

  const filtered = aliases.filter(
    (a) =>
      a.original_name.toLowerCase().includes(search.toLowerCase()) ||
      a.normalized_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search aliases..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.aliasRow}>
            <View style={styles.aliasInfo}>
              <Text style={styles.originalName} numberOfLines={1}>{item.original_name}</Text>
              <View style={styles.arrowRow}>
                <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
                <Text style={styles.normalizedName}>{item.normalized_name}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="pricetag-outline"
              title="No aliases"
              description="Add merchant aliases to improve name normalization."
            />
          ) : null
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Add Merchant Alias</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Original Name (from notification)</Text>
              <TextInput
                style={styles.input}
                value={original}
                onChangeText={setOriginal}
                placeholder="AMAZON SELLER SERVICES"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Normalized Name</Text>
              <TextInput
                style={styles.input}
                value={normalized}
                onChangeText={setNormalized}
                placeholder="Amazon"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <Button
              label="Add Alias"
              onPress={handleAdd}
              loading={saving}
              fullWidth
              disabled={!original.trim() || !normalized.trim()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },

  aliasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  aliasInfo: { flex: 1, gap: 4 },
  originalName: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  arrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  normalizedName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    paddingBottom: 44,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 14,
  },
});
