import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Modal } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Localization from 'expo-localization';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPI } from '../services/api'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ReminderComponent = () => {
  const [reminderList, setReminderList] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const soundRef = useRef(null);

  state = {
    reminders: [],
    userDetails: {}
  };

  fetchReminders = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails');
    this.state.userDetails = JSON.parse(userDetails);
    const id = this.state.userDetails.adminProfileId || this.state.userDetails.id;
    const reminders = await getAPI('/api/schedules/admin/'+id);
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
      playAlarmSound();
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

  // const playAlarmSound = () => {
  //   soundRef.current = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, (error) => {
  //     if (error) {
  //       console.log('Failed to load the sound', error);
  //       return;
  //     }
  //     soundRef.current.play();
  //   });
  // };

  // Example of playing audio
  async function playAlarmSound() {
    soundRef.current = new Audio.Sound();
    try {
        await soundRef.current.loadAsync(require('../assets/sound/alarm.mp3'));
        await soundRef.current.playAsync();
        // Your logic after playing the sound
    } catch (error) {
        console.log('Error playing sound:', error);
    }
  }

  const stopAlarmSound = () => {
    if (soundRef.current) {
      soundRef.current.stopAsync();
      //soundRef.current.release();
      soundRef.current = null;
    }
  };

  const snoozeReminder = (id) => {
    stopAlarmSound();
    const reminder = reminderList.find((rem) => rem.id === id);
    const snoozeTime = 5 * 60; // 5 minutes in seconds
    Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description,
        sound: true,
      },
      trigger: { seconds: snoozeTime },
    });
    setActiveReminder(null);
  };

  const dismissReminder = (id) => {
    stopAlarmSound();
    // Alert.alert('Dismiss', `Dismissed reminder with ID: ${id}`);
    setActiveReminder(null);
  };

  return (
    
    <View style={styles.container}>
      <FlatList
        data={reminderList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <View style={styles.reminderItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Time: {item.timeWindow}</Text>
            {/* <View style={styles.buttons}>
              <Button title="Snooze" onPress={() => snoozeReminder(item.id)} />
              <Button title="Dismiss" onPress={() => dismissReminder(item.id)} />
            </View> */}
          </View>
        )}
      />
      {activeReminder && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={!!activeReminder}
          onRequestClose={() => setActiveReminder(null)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{activeReminder.title}</Text>
              <Text>{activeReminder.description}</Text>
              <View style={styles.modalButtons}>
                <Button title="Snooze" onPress={() => snoozeReminder(activeReminder.id)} />
                <Button title="Dismiss" onPress={() => dismissReminder(activeReminder.id)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  reminderItem: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    gap: 20
  }
});

export default ReminderComponent;
