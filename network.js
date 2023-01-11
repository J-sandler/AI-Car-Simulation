class NeuralNetwork {
  constructor(layerData) {
    this.layers=[]; //array of layers
    for (let i=0;i<layerData.length-1;i++) {
      this.layers.push(new Layer(
        layerData[i],
        layerData[i+1]
      ));
    }
  }

  static birth(network,disimilarity=1) {
     network.layers.forEach(
      layer=>{
        for(let i=0;i<layer.biases.length;i++){
          layer.biases[i]=lerp(
            layer.biases[i],
            (Math.random()*2)-1,
            disimilarity
          );
        }
        for(let i=0;i<layer.weights.length;i++) {
          for (let j=0;j<layer.weights[i].length;j++) {
            layer.weights[i][j]=lerp(
              layer.weights[i][j],
              (Math.random()*2)-1,
              disimilarity
            );
          }
        }
      });

  }

  static feedForward(inputs,network) {
    //instantiate first output given inputs
    let outputs=Layer.feedForward(
      inputs,
      network.layers[0]
    );

    for (let i=1;i<network.layers.length;i++) {
      //update output using previous output as input
      outputs=Layer.feedForward(outputs,network.layers[i]);
    }
    return outputs;
  }
}

class Layer {
  constructor(numInputs,numOutputs) {
    this.inputs=new Array(numInputs);
    this.outputs=new Array(numOutputs);
    
    this.biases=new Array(numOutputs);
    this.weights=[];

    for(let i=0;i<numInputs;i++) this.weights[i]=new Array(numOutputs);

    Layer.#randomize(this);
  }

  static #randomize(layer) {
    for (let i=0;i<layer.inputs.length;i++) {
      for (let j=0;j<layer.outputs.length;j++) {
        layer.weights[i][j]=(Math.random()*2)-1;
        layer.biases[j]=(Math.random()*2)-1;
      }
    }
  }

  static feedForward(layerInputs,layer) {
    for (let i=0;i<layer.inputs.length;i++) {layer.inputs[i]=layerInputs[i];}
    for (let i=0;i<layer.outputs.length;i++) {
      let sum=0;
      for (let j=0;j<layer.inputs.length;j++) {
        sum+=layer.inputs[j]*layer.weights[j][i];
        if (sum>layer.biases[i]) break;
      }
      //this would otherwise be replaced with a non-binary method
      //e.g [layer.outputs[i]=Math.sigmoid(sum-layer.biases[i])]
      layer.outputs[i]=(sum>layer.biases[i])?1:0; 
    }
    return layer.outputs;
  }
}