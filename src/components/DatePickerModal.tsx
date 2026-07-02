import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  value: string; // 'YYYY-MM-DD'
  onSelect: (date: string) => void;
  onClose: () => void;
  maxDate?: string; // 'YYYY-MM-DD' — dates after this are disabled
  title?: string;
}

/** Bottom-sheet date picker backed by react-native-calendars (no native dep). */
export function DatePickerModal({ visible, value, onSelect, onClose, maxDate, title = 'Select date' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Calendar
            current={value}
            maxDate={maxDate}
            onDayPress={(d: DateData) => {
              onSelect(d.dateString);
              onClose();
            }}
            markedDates={{ [value]: { selected: true, selectedColor: Colors.primary } }}
            theme={{
              backgroundColor: Colors.surface,
              calendarBackground: Colors.surface,
              textSectionTitleColor: Colors.textSecondary,
              monthTextColor: Colors.textPrimary,
              dayTextColor: Colors.textPrimary,
              todayTextColor: Colors.primary,
              arrowColor: Colors.primary,
              indicatorColor: Colors.primary,
              textDisabledColor: Colors.textDisabled,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#fff',
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 8,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
});
