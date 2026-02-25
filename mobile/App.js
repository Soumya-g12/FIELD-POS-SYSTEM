```javascript
/**
 * Main app component for field service POS.
 * Handles offline storage and sync queue.
 */
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import HomeScreen from './screens/HomeScreen';
import VisitScreen from './screens/VisitScreen';
import ContractScreen from './screens/ContractScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);

  useEffect(() => {
    // Monitor connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected && syncQueue.length > 0) {
        processSyncQueue();
      }
    });

    // Load pending operations from storage
    loadSyncQueue();

    return () => unsubscribe();
  }, []);

  const loadSyncQueue = async () => {
    const queue = await AsyncStorage.getItem('syncQueue');
    if (queue) setSyncQueue(JSON.parse(queue));
  };

  const addToQueue = async (operation) => {
    const newQueue = [...syncQueue, { ...operation, timestamp: Date.now() }];
    setSyncQueue(newQueue);
    await AsyncStorage.setItem('syncQueue', JSON.stringify(newQueue));
  };

  const processSyncQueue = async () => {
    // Upload pending operations
    for (const op of syncQueue) {
      try {
        await uploadOperation(op);
      } catch (err) {
        console.error('Sync failed:', err);
        return; // Stop, will retry later
      }
    }
    
    // Clear queue on success
    setSyncQueue([]);
    await AsyncStorage.removeItem('syncQueue');
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Visit" component={VisitScreen} />
        <Stack.Screen name="Contract" component={ContractScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
