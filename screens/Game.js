import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const shapes = ['circle', 'square', 'triangle'];
const colors = ['#1abc9c', '#2ecc71', '#9b59b6', '#c0392b'];

const getRandomShape = () => shapes[Math.floor(Math.random() * shapes.length)];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const Shape = ({ type }) => {
  const size = 50;
  const styles = {
    circle: { borderRadius: size / 2 },
    square: {},
    triangle: {
      width: 0,
      height: 0,
      borderLeftWidth: size / 2,
      borderRightWidth: size / 2,
      borderBottomWidth: size,
      borderStyle: 'solid',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      backgroundColor: 'white'
    },
  };

  return (
    <View
      style={[
        {
          width: type === 'triangle' ? 0 : size,
          height: type === 'triangle' ? 0 : size,
          backgroundColor: getRandomColor(),
          alignSelf: 'center',
        },
        styles[type],
        type === 'triangle' && { borderBottomColor: 'blue' },
      ]}
    />
  );
};

const Game = () => {
  const [currentShape, setCurrentShape] = useState(getRandomShape());
  const [score, setScore] = useState(0);
  const shapePosition = useSharedValue(-50);

  useEffect(() => {
    shapePosition.value = withRepeat(
      withTiming(height / 2 - 50, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: shapePosition.value }],
    };
  });

  const handlePress = (shape) => {
    console.log(`Clicked shape: ${shape}, Current shape: ${currentShape}`);
    if (shape === currentShape) {
      setScore(score + 1);
    } else {
      setScore(score - 1);
    }
    setCurrentShape(getRandomShape());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Animated.View style={[styles.shapeContainer, animatedStyle]}>
        <Shape type={currentShape} />
      </Animated.View>
      <View style={styles.buttonsContainer}>
        {shapes.map((shape) => (
          <Button key={shape} title={shape} onPress={() => handlePress(shape)} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shapeContainer: {
    position: 'absolute',
    top: 0,
    width: width,
    alignItems: 'center',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
  },
});

export default Game;
