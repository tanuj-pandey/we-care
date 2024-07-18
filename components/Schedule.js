import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Modal, TextInput } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Localization from 'expo-localization';
import { FontAwesome } from '@expo/vector-icons';
import { Block } from 'galio-framework';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPI } from '../services/api'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Schedule = () => {
  const [reminderList, setReminderList] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false); // State for add modal visibility

  state = {
    reminders: [],
    userDetails: {}
  };

  fetchReminders = async () => {
    console.log("inside fetchReminders")
    const userDetails = await AsyncStorage.getItem('userDetails');
    this.state.userDetails = JSON.parse(userDetails);
    console.log("this.state.userDetails", this.state.userDetails )
    const id = this.state.userDetails.adminProfileId || this.state.userDetails.id;
    const reminders = await getAPI('/api/schedules/admin/'+id);
    console.log("reminders", reminders )
    this.state.reminders = reminders.schedules;
  };

  useEffect(() => {
    (async () => {
        console.log("inside useEffect")
        await fetchReminders();
        setReminderList(this.state.reminders);
        scheduleAllReminders(this.state.reminders);

        const subscription = Notifications.addNotificationReceivedListener(handleNotification);
        return () => {
        subscription.remove();
        };
    })();
  }, []);

  const handleNotification = (notification) => {
    const reminder = this.state.reminders.find(reminder => reminder.title === notification.request.content.title);
    if (reminder) {
      setActiveReminder(reminder);
      // playAlarmSound(); // Uncomment if needed
    }
  };

  const scheduleAllReminders = (reminders) => {
    this.state.reminders.forEach((reminder) => {
      const [reminderHour, reminderMinute] = reminder.timeWindow.split(':').map(Number);
      const now = new Date();
      const triggerDate = new Date(now);

      triggerDate.setHours(reminderHour);
      triggerDate.setMinutes(reminderMinute);
      triggerDate.setSeconds(0);
      triggerDate.setMilliseconds(0);

      // Adjust for timezone (IST in this case)
      const timeZoneOffset = Localization.timezone === 'Asia/Kolkata' ? 5.5 * 60 * 60 * 1000 : 0;
      const localTriggerDate = new Date(triggerDate.getTime());

      // If the trigger time has already passed for today, set it for tomorrow
      if (localTriggerDate <= now) {
        localTriggerDate.setDate(localTriggerDate.getDate() + 1);
      }

      const secondsUntilTrigger = (localTriggerDate - now) / 1000;

      Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.description,
          sound: true, // Ensure the notification plays a sound
        },
        trigger: { seconds: secondsUntilTrigger },
      });
    });
  };

  const editReminderItem = (id) => {
    const reminder = reminderList.find(rem => rem.id === id);
    setEditReminder(reminder);
    setEditModalVisible(true);
  };

  const deleteReminderItem = (id) => {
    const updatedReminders = reminderList.filter(rem => rem.id !== id);
    setReminderList(updatedReminders);
    // Optionally, cancel the scheduled notification for the deleted reminder
    // Notifications.cancelScheduledNotificationAsync(id);
  };

  const saveEditedReminder = () => {
    // Implement save logic here
    setEditModalVisible(false);
    setEditReminder(null);
  };

  const handleAddSchedule = () => {
    // Set the state to show the add modal
    setAddModalVisible(true);
  };


  return (
    <View style={styles.container}>
      

      <FlatList
        data={reminderList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <View>
              <FontAwesome name="check" size={14} color="green" />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.description}</Text>
              <Text>Time: {item.timeWindow}</Text>
            </View>
            <Block style={styles.blockContainer}>
            <FontAwesome
                style={styles.iconContainer}
                name="edit"
                size={14}
                color="black"
                onPress={() => editReminderItem(item.id)}
            />
            <FontAwesome
                style={styles.iconContainer}
                name="trash"
                size={14}
                color="black"
                onPress={() => deleteReminderItem(item.id)}
            />
            </Block>
          </View>
        )}
      />
<Button
        title="Add Schedule"
        onPress={handleAddSchedule}
        style={styles.addButton}
      />
      {/* Edit Reminder Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Reminder</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={editReminder?.title}
              onChangeText={(text) =>
                setEditReminder({ ...editReminder, title: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={editReminder?.description}
              onChangeText={(text) =>
                setEditReminder({ ...editReminder, description: text })
              }
            />
            <View style={styles.modalButtons}>
              <Button title="Save" onPress={saveEditedReminder} />
              <Button
                title="Cancel"
                onPress={() => setEditModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Schedule</Text>
            {/* Your input fields for adding a new schedule */}
            {/* Example: */}
            <TextInput
              style={styles.input}
              placeholder="Title"
              onChangeText={(text) => {/* Handle title input */}}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={(text) => {/* Handle description input */}}
            />
            <TextInput
              style={styles.input}
              placeholder="Time"
              onChangeText={(text) => {/* Handle description input */}}
            />
            <Button title="Add" onPress={() => {/* Handle add logic */}} />
            <Button
              title="Cancel"
              onPress={() => setAddModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  blockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconContainer: {
    marginLeft: 10,
  },
  container: {
    width: '100%',
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%',
    borderRadius: 5,
  },
});

export default Schedule;