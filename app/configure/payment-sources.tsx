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
import { FAB } from '../../src/components/ui/FAB';
import { useConfigStore } from '../../src/stores/configStore';
import { PaymentSource } from '../../src/types';

const ICON_CHOICES: (keyof typeof Ionicons.glyphMap)[] = [
  'cash', 'card', 'wallet', 'phone-portrait', 'qr-code', 'logo-google',
  'business', 'swap-horizontal', 'globe', 'gift', 'ellipsis-horizontal-circle',
];

export default function PaymentSourcesScreen() {
  const { paymentSources, load, addPaymentSource, editPaymentSource, removePaymentSource } =
    useConfigStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<PaymentSource | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>(ICON_CHOICES[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setIcon(ICON_CHOICES[0]);
    setModalVisible(true);
  };

  const openEdit = (ps: PaymentSource) => {
    setEditing(ps);
    setName(ps.name);
    setIcon(ps.icon as keyof typeof Ionicons.glyphMap);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (paymentSources.some((p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.id !== editing?.id)) {
      Alert.alert('Duplicate', 'A payment source with this name already exists.');
      return;
    }
    setSaving(true);
    try {
      if (editing) await editPaymentSource(editing.id, { name: trimmed, icon });
      else await addPaymentSource(trimmed, icon);
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (ps: PaymentSource) => {
    Alert.alert('Delete payment source', `Delete "${ps.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePaymentSource(ps.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={paymentSources}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Card padding={12}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.name}>{item.name}</Text>
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
            <Text style={styles.sheetTitle}>{editing ? 'Edit Payment Source' : 'New Payment Source'}</Text>

            <Text style={styles.label}>Name</Text>
            <View style={styles.nameInput}>
              <Ionicons name={icon} size={20} color={Colors.primary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Amazon Pay"
                placeholderTextColor={Colors.textMuted}
                autoFocus={!editing}
              />
            </View>

            <Text style={styles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {ICON_CHOICES.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconChoice, icon === ic && styles.iconChoiceActive]}
                  onPress={() => setIcon(ic)}
                >
                  <Ionicons name={ic} size={22} color={icon === ic ? Colors.primary : Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sheetActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button label={editing ? 'Save' : 'Add'} onPress={handleSave} loading={saving} disabled={!name.trim()} style={{ flex: 1 }} />
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDim,
  },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
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
  iconChoiceActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
