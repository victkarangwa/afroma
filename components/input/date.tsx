import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { tw } from "react-native-tailwindcss";

interface CustomDatePickerProps {
  onDateChange: (date: Date) => void;
}
export default function CustomDatePicker({
  onDateChange,
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Handle date selection
  const onChange = (date) => {
    setSelectedDate(date);
    setModalVisible(false); // Close the modal after selection
    onDateChange(date);
  };

  // Format the date for display (e.g., "March 24, 1990")
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "January 1, 2000";

  return (
    <View style={[]}>
      {/* Input field to trigger the calendar */}
      <TouchableOpacity
        style={[tw.border, tw.borderPink700, tw.rounded, tw.mY2, tw.p3]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[{ color: "gray" }]}>Date of Birth</Text>
        <Text style={[tw.textWhite, tw.pT1]}>{formattedDate}</Text>
      </TouchableOpacity>

      {/* Modal with CalendarPicker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer]}>
          <View style={styles.calendarContainer}>
            <CalendarPicker
              onDateChange={onChange}
              maxDate={new Date()} // Restrict to today or earlier
              initialDate={new Date(2000, 0, 1)} // Default to Jan 1, 2000
              selectedDayColor="#00adf5"
              selectedDayTextColor="#FFFFFF"
              textStyle={styles.calendarText}
            />
            <TouchableOpacity
              style={[tw.mT4, tw.bgPink100, tw.rounded, tw.p3]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBox: {
    width: "80%",
    padding: 15,
    borderWidth: 1,
    borderColor: '"#757fb4',
    borderRadius: 5,
  },
  inputText: {
    fontSize: 16,
    color: "#333333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  calendarText: {
    fontSize: 16,
    color: "#333333",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#00adf5",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  confirmationText: {
    marginTop: 20,
    fontSize: 16,
    color: "#333333",
  },
});
