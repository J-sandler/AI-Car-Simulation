//globals:
var GenerationSize=180;
var autoTrain=localStorage.getItem("trainState")?JSON.parse(localStorage.getItem("trainState")):false;
const numTraffic=400;
const learningRate=0.01;
var mutationFactor=0.2;
var recordModel=localStorage.getItem("recordState")?JSON.parse(localStorage.getItem("recordState")):false;
const carCanvas=document.getElementById("carCanvas");
carCanvas.width=350;

const netCanvas=document.getElementById("netCanvas");
netCanvas.width=550;

const carCtx = carCanvas.getContext("2d");
const netCtx = netCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
let cars=createGeneration(GenerationSize);
let bestChild=cars[0]; //randomly initialize this child

//compile next generation:
if (localStorage.getItem("bestChild")) {
  bestChild.mind=JSON.parse(
    localStorage.getItem("bestChild")
  );

  for (let i=1;i<cars.length;i++) {
    cars[i].mind=JSON.parse(
      localStorage.getItem("bestChild")
    );
    NeuralNetwork.birth(cars[i].mind,mutationFactor); //adjust mutation factor here
  }
}

if (recordModel) {
	cars=[new Car(
      road.getLaneCenter(1),
      100,
      30,
      40,
      "Record",
      4
    )];
	bestChild=cars[0];
	if(localStorage.getItem("bestChild")) localStorage.removeItem("bestChild");
}

const traffic=[];

compileTraffic(traffic,numTraffic);

animate();

function createGeneration(N) {
  const cars=[];
  for (let i=0;i<N;i++) {
    cars.push(new Car(
      road.getLaneCenter(1),
      100,
      30,
      40,
      "AI",
      4
    ));
  }
  return cars;
}

function compileTraffic(traffic,numCars) {
    for (let i=0;i<numCars;i++) {
        const randLane=Math.round(Math.random()*(3));//lane count -1
        const randY=Math.round(Math.random()*-(135*numCars));
		const trafficCar=new Car(road.getLaneCenter(randLane),randY,30,50,"DUMMY",2);
        traffic.push(trafficCar);
    }    
}

function preserve() {
  localStorage.setItem(
    "bestChild",
    JSON.stringify(bestChild.mind)
  );
}

function destroy() {
  localStorage.removeItem("bestChild");
}

function animate(time) {
    for (let i=0;i<traffic.length;i++) {
		traffic[i].update(road.borders,[]);
		if (autoTrain) {
			traffic[i].maxSpeed=40;
			traffic[i].acceleration=2;
		}
	}
    for (let i=0;i<cars.length;i++) {
		cars[i].update(road.borders,traffic);
		if(autoTrain) {
			cars[i].maxSpeed=60;
			cars[i].acceleration=2;
		}
	}

	//alternative reward would be implemented here:
    bestChild=cars.find(
      c=>c.y==Math.min(
        ...cars.map(
          c=>c.y
        )
      )
    );

    carCanvas.height=window.innerHeight;
    netCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestChild.y+carCanvas.height*0.7);

    road.draw(carCtx);
    carCtx.globalAlpha=0.1;
    for (let i=0;i<cars.length;i++) cars[i].draw(carCtx,"blue");
    carCtx.globalAlpha=1;
    for (let i=0;i<traffic.length;i++) {traffic[i].draw(carCtx,"green");}
    
    bestChild.draw(carCtx,"blue",true);
    carCtx.restore();

    netCtx.lineDashOffset=-time*0.04;
    Visualizer.drawNetwork(netCtx,bestChild.mind);
    requestAnimationFrame(animate);
	if(time>=5000&&autoTrain) {

		mutationFactor=(bestChild.damaged)?mutationFactor+learningRate:mutationFactor-learningRate;
		mutationFactor=Math.abs(mutationFactor);

		preserve();
		location.reload();
	}
}

function toggleAutoTrain() {
	if (localStorage.getItem("trainState")) {
		autoTrain=JSON.parse(localStorage.getItem("trainState"));
		autoTrain=!autoTrain;
		localStorage.removeItem("trainState");
	} else {
		autoTrain=!autoTrain;
	}
	localStorage.setItem("trainState",JSON.stringify(autoTrain));
}

function toggleRecord() {
	if (localStorage.getItem("recordState")) {
		recordModel=JSON.parse(localStorage.getItem("recordState"));
		recordModel=!recordModel;
		localStorage.removeItem("recordState");
	} else {
		recordModel=!recordModel;
	}
	localStorage.setItem("recordState",JSON.stringify(recordModel));
	if (!recordModel) localStorage.setItem("bestChild",JSON.stringify(bestChild.mind));
}
