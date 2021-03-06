import React, {useState} from 'react'
import { StyleSheet, Text, View, StatusBar, ActivityIndicator, Image } from 'react-native';
import PropTypes from 'prop-types';

import * as tf from '@tensorflow/tfjs'
import { fetch } from '@tensorflow/tfjs-react-native'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as jpeg from 'jpeg-js'


class Classification extends React.Component {

    state = {
        isTfReady: false,
        isModelReady: false,
        predictions: null,
      }

    static propTypes = {
        image: PropTypes.shape({
            uri: PropTypes.string,
            width: PropTypes.integer,
            height: PropTypes.integer,
          }),
      };

    async componentDidMount() {
        await tf.ready()
        this.setState({
            isTfReady: true
        })
        this.model = await mobilenet.load()
        this.setState({ isModelReady: true })
        this.classifyImage()
        // this.getPermissionAsync()
    }

    imageToTensor(rawImageData) {
        const TO_UINT8ARRAY = true
        const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
        // Drop the alpha channel info for mobilenet
        const buffer = new Uint8Array(width * height * 3)
        let offset = 0 // offset into original data
        for (let i = 0; i < buffer.length; i += 3) {
            buffer[i] = data[offset]
            buffer[i + 1] = data[offset + 1]
            buffer[i + 2] = data[offset + 2]

            offset += 4
        }

        return tf.tensor3d(buffer, [height, width, 3])
    }

    classifyImage = async () => {
        try {
            const imageAssetPath = Image.resolveAssetSource(this.props.image)
            const response = await fetch(imageAssetPath.uri, {}, { isBinary: true })
            const rawImageData = await response.arrayBuffer()
            const imageTensor = this.imageToTensor(rawImageData)
            const predictions = await this.model.classify(imageTensor)
            this.setState({ predictions })
            console.log(predictions)
        } catch (error) {
            console.log(error)
        }
    }

    renderPrediction = prediction => {
        return (
            <Text key={prediction.className} style={styles.text}>
            {prediction.className} {prediction.probability}
            </Text>
        )
    }

    render() {
        const { isTfReady, isModelReady, predictions } = this.state
        const { image } = this.props
        return (
        <View>
        {/* <Text style={styles.modalText}>{image.uri}</Text> */}
            <View style={styles.loadingContainer}>
                <Text style={styles.text}>
                    TFJS ready? {isTfReady ? <Text>✅</Text> : ''}
                </Text>
                <View style={styles.loadingModelContainer}>
                    <Text style={styles.text}>Model ready? </Text>
                    {isModelReady ? (
                        
                    <Text style={styles.text}>✅</Text>
                    ) : (
                    <ActivityIndicator size='small' />
                    )}
                </View>
            </View>
            <View style={styles.predictionWrapper}>
                {isModelReady && image.uri &&  (
                    <Text style={styles.text}>
                    Predictions: {predictions ? '' : 'Predicting...'}
                    </Text>
                )}
                {isModelReady &&
                    predictions &&
                    predictions.map(p => this.renderPrediction(p))}
            </View>
        </View>)
    }        
    
}




const styles = StyleSheet.create({
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    container: {
        flex: 1,
        backgroundColor: '#171f24',
        alignItems: 'center'
    },
    loadingContainer: {
        marginTop: 5,
        justifyContent: 'center'
    },
    text: {
        color: '#000000',
        fontSize: 16
    },
    loadingModelContainer: {
        flexDirection: 'row',
        marginTop: 5
    },
    imageWrapper: {
        width: 280,
        height: 280,
        padding: 10,
        borderColor: '#cf667f',
        borderWidth: 5,
        borderStyle: 'dashed',
        marginTop: 40,
        marginBottom: 10,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContainer: {
        width: 250,
        height: 250,
        position: 'absolute',
        top: 10,
        left: 10,
        bottom: 10,
        right: 10
    },
    predictionWrapper: {
        height: 100,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
    },
    transparentText: {
        color: '#000000',
        opacity: 0.7
    },
    footer: {
        marginTop: 40
    },
    poweredBy: {
        fontSize: 20,
        color: '#e69e34',
        marginBottom: 6
    },
    tfLogo: {
        width: 125,
        height: 70
    }
});

export default Classification
