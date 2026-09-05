import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { FAB } from '../../src/components/ui/FAB';
import { useConfigStore } from '../../src/stores/configStore';
import { Member, MemberRelation } from '../../src/types';

const RELATIONS: { key: MemberRelation; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'self', label: 'Me', icon: 'person', color: Colors.primary },
  { key: 'family', label: 'Family', icon: 'home', color: '#22C55E' },
  { key: 'friend', label: 'Friend', icon: 'people', color: '#EC4899' },
];

function relationMeta(rel: MemberRelation) {
  return RELATIONS.find((r) => r.key === rel) ?? RELATIONS[0];
}

export default function MembersScreen() {
  const { members, load, addMember, editMember, removeMember } = useConfigStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<MemberRelation>('family');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setRelation('family');
    setModalVisible(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setName(m.name);
    setRelation(m.relation);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase() && m.id !== editing?.id)) {
      Alert.alert('Duplicate', 'A person with this name already exists.');
      return;
    }
    setSaving(true);
    try {
      if (editing) await editMember(editing.id, { name: trimmed, relation });
      else await addMember(trimmed, relation);
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (m: Member) => {
    Alert.alert(
      'Delete person',
      `Delete "${m.name}"? Transactions paid by them will keep their amount but lose the "paid by" tag.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeMember(m.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Tag who actually paid for a transaction — yourself, family or a friend.
      </Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const meta = relationMeta(item.relation);
          return (
            <Card padding={12}>
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.relation}>{meta.label}</Text>
                </View>
                <TouchableOpacity onPress={() => openEdit(item)} hitSlop={8} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />

      <FAB icon="add" label="New" onPress={openAdd} />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{editing ? 'Edit Person' : 'New Person'}</Text>

            <Text style={styles.label}>Name</Text>
            <View style={styles.nameInput}>
              <Ionicons name="person" size={20} color={Colors.primary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Dad, Priya"
                placeholderTextColor={Colors.textMuted}
                autoFocus={!editing}
              />
            </View>

            <Text style={styles.label}>Relation</Text>
            <View style={styles.relationRow}>
              {RELATIONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.relChip, relation === r.key && { backgroundColor: `${r.color}22`, borderColor: r.color }]}
                  onPress={() => setRelation(r.key)}
                >
                  <Ionicons name={r.icon} size={16} color={relation === r.key ? r.color : Colors.textSecondary} />
                  <Text style={[styles.relChipText, relation === r.key && { color: r.color }]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
  subtitle: { fontSize: 13, color: Colors.textSecondary, padding: 16, paddingBottom: 4, lineHeight: 18 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  relation: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
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
  relationRow: { flexDirection: 'row', gap: 10 },
  relChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  relChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
