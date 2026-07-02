import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { ALL_CATEGORIES } from '../../src/constants/categories';
import { CategoryIcon } from '../../src/components/CategoryIcon';
import { Card } from '../../src/components/ui/Card';

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Categories are automatically assigned based on merchant name and notification content.
        Edit a transaction to change its category.
      </Text>
      <FlatList
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card padding={14}>
            <View style={styles.row}>
              <CategoryIcon category={item} size={20} />
              <Text style={styles.catName}>{item}</Text>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    padding: 16,
    paddingBottom: 8,
    lineHeight: 18,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
});
