import React, { useState, useEffect }  from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight
} from "react-native";
import { Camera } from 'expo-camera'
import Modal from 'react-native-modal';
import { Container, Content, Header, Item, Icon, Input, Button } from 'native-base'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Classification from '../Components/Classification'


export default function App() {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [cameraRef, setCameraRef] = useState(null)
    const [isModalVisible, setModalVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState({})

    // const toggleModal = () => {
    //     setModalVisible(!isModalVisible);
    //   };

  
    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);
  
    if (hasPermission === null) {
      return <View />;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    return (
        <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1, justifyContent: 'space-between' }} 
                    type={type} ref={ref => {
                        setCameraRef(ref)}}>
                <Header searchBar rounded
                    style={{
                        position: 'absolute', backgroundColor: 'transparent',
                        left: 0, top: 0, right: 0, zIndex: 100, alignItems: 'center'
                    }}
                    >
                    <View style={{ flexDirection: 'row', flex: 4 }}>
                        <Icon name="ios-leaf" style={{ color: 'white' }} />
                        <Item style={{ backgroundColor: 'transparent' }}>
                            <Icon name="ios-search" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}></Icon>
                            <Input
                                placeholder="Search"
                                placeholderTextColor="white"
                            />
                        </Item>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 2, justifyContent: 'space-around' }}>
                        <Icon name="ios-flash" style={{ color: 'white', fontWeight: 'bold' }} />
                        <Icon
                            onPress={() => {
                                setType(
                                    type === Camera.Constants.Type.back ?
                                        Camera.Constants.Type.front :
                                        Camera.Constants.Type.back
                                )
                            }}
                            name="ios-reverse-camera" style={{ color: 'white', fontWeight: 'bold' }} />
                    </View>
                </Header>




                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Classification image={capturedImage}/>
                            <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={() => {
                                setModalVisible(!isModalVisible);
                            }}>
                                <Text style={styles.textStyle}>Hide results</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>




                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 15, alignItems: 'flex-end' }}>
                    <MaterialCommunityIcons name="message-reply"
                        style={{ color: 'white', fontSize: 36 }}/>
                    <TouchableOpacity style={{alignSelf: 'center'}} onPress={async() => {
                            if(cameraRef){
                            let photo = await cameraRef.takePictureAsync();
                            cameraRef.pausePreview()
                            setCapturedImage(photo)
                            setModalVisible(!isModalVisible);
                            cameraRef.resumePreview()
                            console.log('photo', photo);
                            }}}>
                        <View style={{ alignItems: 'center' }}>
                            <MaterialCommunityIcons name="circle-outline"
                                style={{ color: 'white', fontSize: 100 }}
                            ></MaterialCommunityIcons>
                            <Icon name="ios-images" style={{ color: 'white', fontSize: 36 }} 
                            />
                        </View>
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="google-circles-communities"
                        style={{ color: 'white', fontSize: 36 }}/>
                </View>
            </Camera>
        </View>
    );

  }

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     alignItems: 'center',
    //     justifyContent: 'center'
    // },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});

