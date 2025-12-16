import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { safeRouter } from "../utils/SafeRouter";

export default function Welcome() {


  return (
    <View style={styles.container}>


      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to ServiceFinder!</Text>
        <Text style={styles.subtitle}>Your platform for service management!</Text>
      </View>

      <View style={styles.buttonSection}>
        <View style={styles.boxContainer}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => safeRouter.push('/signup')}>
            <Text style={styles.btnPrimaryText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => safeRouter.push('/login')}>
            <Text style={styles.btnSecondaryText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Image
        source={require('../assets/hero.png')}
        style={styles.image}
        resizeMode="cover"
      />

    </View>
  );
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3595ff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.04,
    position: 'relative',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
    marginBottom: height * 0.05,
  },
  title: {
    color: 'white',
    fontSize: width * 0.07,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: height * 0.1,
  },
  subtitle: {
    color: 'white',
    fontSize: width * 0.045,
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  image: {
    width: width,
    height: height * 0.4,
    marginTop: -height * 0.03,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  boxContainer: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimary: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: '#545050e4',
    fontSize: width * 0.045,
    fontWeight: '600',
    textAlign: 'center',
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 25,
    width: '100%',
    paddingVertical: 12,
  },
  btnSecondaryText: {
    color: 'white',
    fontSize: width * 0.045,
    fontWeight: '500',
    textAlign: 'center',
  },

});  