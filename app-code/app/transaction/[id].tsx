import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Transaction, Category } from '../../src/types';
import { getTransactionById } from '../../src/db/database';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useConfigStore } from '../../src/stores/configStore';
import { CategoryIcon } from '../../src/components/CategoryIcon';
import { AmountDisplay } from '../../src/components/AmountDisplay';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../src/utils/formatters';
import { currencySymbol } from '../../src/utils/currency';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editMerchant, setEditMerchant] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Others');
  const [editAmount, setEditAmount] = useState('');
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const { correctTransaction, removeTransaction } = useTransactionStore();
  const categories = useConfigStore((s) => s.categories);
  const memberName = useConfigStore((s) => s.memberName);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;
    const data = await getTransactionById(parseInt(id));
    setTx(data);
    if (data) {
      setEditMerchant(data.normalized_merchant_name || data.merchant_name);
      setEditCategory(data.category);
      setEditAmount(data.amount.toString());
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!tx) return;
    setSaving(true);
    const amount = parseFloat(editAmount);
    await correctTransaction(tx.id, tx.raw_notification_id, {
      merchant: editMerchant || undefined,
      category: editCategory !== tx.category ? editCategory : undefined,
      amount: amount !== tx.amount ? amount : undefined,
    });
    setSaving(false);
    setEditing(false);
    loadTransaction();
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!tx) return;
          await removeTransaction(tx.id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!tx) return (
    <View style={styles.centered}>
      <Text style={styles.notFound}>Transaction not found</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card style={styles.headerCard} padding={24}>
        <View style={styles.headerTop}>
          <CategoryIcon category={editing ? editCategory : tx.category} size={28} />
          {tx.needs_review === 1 && !editing && (
            <Badge label="Needs Review" color={Colors.warning} />
          )}
        </View>
        <AmountDisplay
          amount={editing ? (parseFloat(editAmount) || 0) : tx.amount}
          transactionType={tx.transaction_type}
          size="xl"
        />
        <Text style={styles.merchantDisplay}>
          {editing ? editMerchant || '—' : (tx.normalized_merchant_name || tx.merchant_name || 'Unknown')}
        </Text>
        <Text style={styles.dateDisplay}>
          {formatDate(tx.transaction_timestamp)} · {formatTime(tx.transaction_timestamp)}
        </Text>
      </Card>

      {/* Edit form */}
      {editing ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Details</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={editMerchant}
              onChangeText={setEditMerchant}
              placeholder="What was this for?"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>{currencySymbol()}</Text>
              <TextInput
                style={[styles.fieldInput, { flex: 1 }]}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity
              style={styles.catPicker}
              onPress={() => setCatModalVisible(true)}
            >
              <CategoryIcon category={editCategory} size={16} showBackground={false} />
              <Text style={styles.catPickerText}>{editCategory}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.editActions}>
            <Button label="Cancel" onPress={() => setEditing(false)} variant="ghost" style={{ flex: 1 }} />
            <Button label="Save" onPress={handleSave} loading={saving} style={{ flex: 2 }} />
          </View>
        </Card>
      ) : (
        /* Detail rows */
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {[
            { label: 'Name', value: tx.normalized_merchant_name || tx.merchant_name || '—' },
            { label: 'Amount', value: formatCurrency(tx.amount) },
            { label: 'Category', value: tx.category },
            { label: 'Type', value: tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1) },
            { label: 'Date', value: `${formatDate(tx.transaction_timestamp)} · ${formatTime(tx.transaction_timestamp)}` },
            { label: 'Paid via', value: tx.payment_source || tx.source_app || '—' },
            ...(memberName(tx.paid_by_member_id) ? [{ label: 'Paid by', value: memberName(tx.paid_by_member_id)! }] : []),
            ...(tx.note ? [{ label: 'Note', value: tx.note }] : []),
            ...(tx.subscription_id != null ? [{ label: 'Recurring', value: 'Subscription charge' }] : []),
            { label: 'Added on', value: formatDate(tx.created_at, 'DD MMM YYYY, hh:mm A') },
          ].map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </Card>
      )}

      {!editing && (
        <View style={styles.actions}>
          <Button
            label="Edit"
            onPress={() => setEditing(true)}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            label="Delete"
            onPress={handleDelete}
            variant="danger"
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Category picker modal */}
      <Modal visible={catModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setCatModalVisible(false)} activeOpacity={1}>
          <View style={styles.catSheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select Category</Text>
            <ScrollView>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catRow, editCategory === cat.name && styles.catRowSelected]}
                  onPress={() => { setEditCategory(cat.name); setCatModalVisible(false); }}
                >
                  <CategoryIcon category={cat.name} size={18} />
                  <Text style={[styles.catRowText, editCategory === cat.name && { color: Colors.primary }]}>{cat.name}</Text>
                  {editCategory === cat.name && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: Colors.textSecondary, fontSize: 16 },

  headerCard: { gap: 8, alignItems: 'center' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  merchantDisplay: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  dateDisplay: { fontSize: 13, color: Colors.textMuted },

  section: { gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary, maxWidth: '60%', textAlign: 'right' },

  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  fieldInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { fontSize: 20, color: Colors.textSecondary },

  catPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  catPickerText: { flex: 1, color: Colors.textPrimary, fontSize: 15 },

  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },

  actions: { flexDirection: 'row', gap: 12 },

  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  catSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
    gap: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catRowSelected: { opacity: 1 },
  catRowText: { flex: 1, fontSize: 15, color: Colors.textPrimary },
});
