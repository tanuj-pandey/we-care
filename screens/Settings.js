import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Block, theme } from 'galio-framework';
import { AddressForm } from '../components';
//argon

const { width } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

class Settings extends React.Component {
  

  render() {
    return (
        <Block flex center style={styles.home}>
            <AddressForm />
        </Block>
      );
  }
}

const styles = StyleSheet.create({
  createButton: {
    
  },
  uploadIcon: {

  },
  imageUploadContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  home: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  group: {
    paddingTop: theme.SIZES.BASE,
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

export default Settings;
