// authService.js
import mockUsers from '../mockUsers.json';

export const authenticateUser = async (email, password) => {
  // Mock authentication
  const user = mockUsers.users.find(user => user.email === email && user.password === password);
  if (user) {
    return { success: true, userType: user.type };
  } else {
    return { success: false, message: 'Invalid email or password' };
  }

  // Future implementation for API call
  /*
  try {
    const response = await fetch('https://yourapi.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
  */
};
