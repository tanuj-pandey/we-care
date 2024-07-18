import React, { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import { Block, GalioProvider } from "galio-framework";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';


// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
import Toast from 'react-native-toast-message';

enableScreens();

import Screens from "../navigation/Screens";
import { Images, articles, argonTheme } from "../constants";

import { FontAwesome } from '@expo/vector-icons';


// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.Logo,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo,
];
// cache product images
articles.map((article) => assetImages.push(article.image));

function cacheImages(images: string[]) {
  return images.map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default function Index() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        //Load Resources
        await _loadResourcesAsync();
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ArgonExtra: require("../assets/font/argon.ttf"),
          Galio: require("../node_modules/galio-framework/src/fonts/galio.ttf"),
          ...FontAwesome.font,
        });

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access notifications was denied');
        }

      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const _loadResourcesAsync = async () => {
    return Promise.all([...cacheImages(assetImages)]);
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
      <NavigationContainer onReady={onLayoutRootView} independent={true}>
        <GalioProvider theme={argonTheme}>
          <Block flex>
            <Screens />
          </Block>
        </GalioProvider>
        <Toast />
      </NavigationContainer>
  );
}
