const GenerationSize=800;
const carCanvas=document.getElementById("carCanvas");
carCanvas.width=300;

const netCanvas=document.getElementById("netCanvas");
netCanvas.width=450;

const carCtx = carCanvas.getContext("2d");
const netCtx = netCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
const cars=createGeneration(GenerationSize);
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
    NeuralNetwork.birth(cars[i].mind,0.1); //adjust mutation factor here
  }
}

const traffic=[
  new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(3),-300,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(0),-100,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(1),-200,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(2),-500,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(3),-700,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(0),-700,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(2),-900,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(3),-1000,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(1),-1000,30,50,"DUMMY",2),
  new Car(road.getLaneCenter(3),-1100,30,50,"DUMMY",2)  
];

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
    for (let i=0;i<traffic.length;i++) {traffic[i].update(road.borders,[]);}
    for (let i=0;i<cars.length;i++) cars[i].update(road.borders,traffic);

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
    carCtx.globalAlpha=0.2;
    for (let i=0;i<cars.length;i++) cars[i].draw(carCtx,"blue");
    carCtx.globalAlpha=1;
    for (let i=0;i<traffic.length;i++) {traffic[i].draw(carCtx,"green");}
    
    bestChild.draw(carCtx,"blue",true);
    carCtx.restore();

    netCtx.lineDashOffset=-time*0.020;
    Visualizer.drawNetwork(netCtx,bestChild.mind);
    requestAnimationFrame(animate);
}