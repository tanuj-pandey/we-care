// authService.js
import mockUsers from '../mockUsers.json';

import { postAPI } from '../services/api'; 

export const authenticateUser = async (email, password) => {
  // Mock authentication
  // const user = mockUsers.users.find(user => user.email === email && user.password === password);
  // if (user) {
  //   return { success: true, userType: user.type };
  // } else {
  //   return { success: false, message: 'Invalid email or password' };
  // }

  // Future implementation for API call
  try {
    const data = await postAPI('/api/profiles/login', {
      emailId: email,
      password: password
    });
    console.log("LOGin DATA--------", data)
    if (data.id) {
      return { success: true, message: 'Success', user: data };
    } else {
      return { success: false, message: 'Wrong user' };
    }
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
