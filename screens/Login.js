import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Block, Checkbox, Text, theme } from 'galio-framework';
import { Button, Icon, Input } from '../components';
import { Images, argonTheme } from '../constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { authenticateUser } from '../services/authService';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('screen');

class Login extends React.Component {

  state = {
    email: '',
    password: '',
  };

  handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
      fallbackLabel: 'Enter Password',
    });

    if (result.success) {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          this.navigateToHome('Memories');
        }
        else {
          Alert.alert('Authentication Failed', 'Please try again');
        }
      } catch (e) {
        // saving error
      }
    } else {
      Alert.alert('Authentication Failed', 'Please try again');
    }
  };

  handleLogin = async () => {
    const { email, password } = this.state;
    const result = await authenticateUser(email, password);

    if (result.success) {
      try {
        await AsyncStorage.setItem('userDetails', JSON.stringify(result.user));
      } catch (e) {
        // saving error
      }
      this.navigateToHome('Memories');
    } else {
      Alert.alert('Authentication Failed', result.message);
    }
  };

  navigateToHome = (tabId) => {
    // Navigate to home or wherever needed
    this.props.navigation.navigate('Home', { tabId });
  };

  render() {
    // return (
    //   <View style={styles.faceDetectionContainer}>
    //     <FaceDetection />
    //   </View>
    // );

    return (
      <Block flex middle>
        <StatusBar hidden />
        <ImageBackground
          source={Images.RegisterBackground}
          style={{ width, height, zIndex: 1 }}
        >
          <Block safe flex middle>
            <Block style={styles.registerContainer}>
              <Block flex>
                <Block flex={0.17} middle>
                  <Text color="#8898AA" size={25}>
                    Login
                  </Text>
                </Block>
                <Block flex center>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Email"
                        value={this.state.email}
                        onChangeText={(text) =>
                          this.setState({ email: text })
                        }
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ic_mail_24px"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8}>
                      <Input
                        password
                        borderless
                        placeholder="Password"
                        value={this.state.password}
                        onChangeText={(text) =>
                          this.setState({ password: text })
                        }
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="padlock-unlocked"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                      <Block row style={styles.passwordCheck}>
                        <Text
                          size={12}
                          color={argonTheme.COLORS.MUTED}
                        >
                          password strength:
                        </Text>
                        <Text
                          bold
                          size={12}
                          color={argonTheme.COLORS.SUCCESS}
                        >
                          {' '}
                          strong
                        </Text>
                      </Block>
                    </Block>
                    <Block row width={width * 0.75}>
                      <Checkbox
                        checkboxStyle={{
                          borderWidth: 3,
                        }}
                        color={argonTheme.COLORS.PRIMARY}
                        label="Are you the primary user"
                      />
                    </Block>
                    <Block middle>
                      <Button
                        color="primary"
                        style={styles.createButton}
                        onPress={this.handleLogin}
                      >
                        <Text
                          bold
                          size={14}
                          color={argonTheme.COLORS.WHITE}
                        >
                          LOGIN
                        </Text>
                      </Button>
                    </Block>
                    <Block middle>
                      <Button
                        color="WARNING"
                        style={styles.createButton}
                        onPress={this.handleBiometricLogin}
                      >
                        <Text
                          bold
                          size={14}
                          color={argonTheme.COLORS.WHITE}
                        >
                          LOGIN WITH BIOMETRICS
                        </Text>
                      </Button>
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </Block>
            </Block>
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  faceDetectionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },  
  registerContainer: {
    width: width * 0.9,
    height: height * 0.875,
    backgroundColor: '#F4F5F7',
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: 'hidden',
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#8898AA',
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: '#fff',
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: '800',
    fontSize: 14,
  },
  inputIcons: {
    marginRight: 12,
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30,
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25,
  },
});

export default Login;
