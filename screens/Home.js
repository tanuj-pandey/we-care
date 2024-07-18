import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import ImageView from 'react-native-image-viewing';
import { Button, Card, MapViewComponent, ReminderComponent, ImageUpload, Schedule } from '../components';
//argon
import { Images, argonTheme, articles } from "../constants/";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

class Home extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      userDetails: {},
      isImageViewVisible: false,
      imageIndex: 0,
    };
  }

  async componentDidMount() {
    const userDetails = await AsyncStorage.getItem('userDetails');
    this.setState({ userDetails: JSON.parse(userDetails) });
  }

  renderArticles = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}>
        <Block flex>
          <Card item={articles[0]} horizontal  />
          <Block flex row>
            <Card item={articles[1]} style={{ marginRight: theme.SIZES.BASE }} />
            <Card item={articles[2]} />
          </Block>
          <Card item={articles[3]} horizontal />
          <Card item={articles[4]} full />
        </Block>
      </ScrollView>
    );
  }

  renderUploadImg = () => {
    return (
        <View style={styles.imageUploadContainer}>
          <ImageUpload />
        </View> 
    );
  }

  renderAlbum = () => {
    const { userDetails } = this.state;
    const isPatient = (userDetails.isPatient === 'Patient');
    return (
      <Block
        flex
        style={[styles.group, { paddingBottom: theme.SIZES.BASE * 5 }]}
      >
        <Block style={{ marginHorizontal: theme.SIZES.BASE * 2 }}>
        {isPatient && (
          <Block style={styles.createButton}>
            <Button color="primary" onPress={() => this.props.navigation.navigate('Home', { tabId: 'UploadImage' })}>
                <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                  Upload Image <FontAwesome style={styles.uploadIcon} name="upload" size={12} color="white" />
                </Text>
            </Button>
          </Block>
          )}
          <Block
            row
            space="between"
            style={{ marginTop: theme.SIZES.BASE, flexWrap: "wrap" }}
          >
            {Images.Viewed.map((img, index) => (
              <TouchableOpacity key={`viewed-${img}`} style={styles.boxShadow} onPress={() => this.setState({ isImageViewVisible: true, imageIndex: index })}>
                <Image
                  resizeMode="cover"
                  source={{ uri: img }}
                  style={styles.albumThumb}
                />
              </TouchableOpacity>
            ))}
          </Block>
        </Block>
        <ImageView
          images={Images.Viewed.map(img => ({ uri: img }))}
          imageIndex={this.state.imageIndex}
          visible={this.state.isImageViewVisible}
          onRequestClose={() => this.setState({ isImageViewVisible: false })}
        />
      </Block>
    );
  };

  render() {
    const tabId = this.props.route.params?.tabId || 'Memories';
    const { userDetails } = this.state;
    const isPatient = (userDetails.isPatient === 'Patient');
    
    switch(tabId) {
      case 'Memories':
        return (
          <Block flex center style={styles.home}>
            {this.renderAlbum()}
          </Block>
        );
      case 'UploadImage':
        return (
          <Block flex center style={styles.home}>
            {this.renderUploadImg()}
          </Block>
        );
      case 'Routine':
        return (
          <Block flex center style={styles.home}>
          {isPatient && (
            <ReminderComponent />
          )}
          {!isPatient && (
            <Schedule />
          )}
          </Block>
        );
      case 'Location':
        return (
          <Block flex center style={styles.home}>
            <MapViewComponent />
          </Block>
        );
    }
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

export default Home;
