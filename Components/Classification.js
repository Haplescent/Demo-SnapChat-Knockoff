import React, {useState} from 'react'
import { StyleSheet, Text, View } from 'react-native';
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
          const imageAssetPath = Image.resolveAssetSource(this.state.image)
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
            {prediction.className}
          </Text>
        )
      }

      render() {
        const { isTfReady, isModelReady, predictions } = this.state
        const { image } = this.props
          return (<Text style={styles.modalText}>{image.uri}</Text>)
      }        
    
}




const styles = StyleSheet.create({
modalText: {
    marginBottom: 15,
    textAlign: "center"
}
});

export default Classification
