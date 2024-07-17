import React from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, Alert } from 'react-native';
import { Block, Text, theme } from 'galio-framework';

import { Card, MapViewComponent, ReminderComponent } from '../components';
//argon
import { Images, articles } from "../constants/";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;


class Home extends React.Component {


  constructor(props){
    super(props)
    
    this.state = {
      userType: ''
    }
  }

  async componentDidMount() {
    const userType = await AsyncStorage.getItem('userType');
    this.setState({userType});
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
    )
  }

  renderAlbum = () => {
    return (
      <Block
        flex
        style={[styles.group, { paddingBottom: theme.SIZES.BASE * 5 }]}
      >
        <Block style={{ marginHorizontal: theme.SIZES.BASE * 2 }}>
          <Block
            row
            space="between"
            style={{ marginTop: theme.SIZES.BASE, flexWrap: "wrap" }}
          >
            {Images.Viewed.map((img, index) => (
              <Block key={`viewed-${img}`} style={styles.boxShadow}>
                <Image
                  resizeMode="cover"
                  source={{ uri: img }}
                  style={styles.albumThumb}
                />
              </Block>
            ))}
          </Block>
        </Block>
      </Block>
    );
  };

  render() {
    const tabId = this.props.route.params?.tabId || 'Memories';
    const userType = this.state.userType;
    switch(tabId) {
      case 'Memories':
        return (
          <Block flex center style={styles.home}>
            <Text>{userType}</Text>
            {this.renderAlbum()}
          </Block>
        );
      case 'Routine':
        return (
          <Block flex center style={styles.home}>
            <Text>{userType}</Text>
            <ReminderComponent />
          </Block>
        );
      case 'Location':
        return (
          <Block flex center style={styles.home}>
            <Text>{userType}</Text>
            <MapViewComponent />
          </Block>
        );
    }

    
  }
}

const styles = StyleSheet.create({
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
