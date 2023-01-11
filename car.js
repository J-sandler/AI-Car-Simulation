class Car{
    constructor(x,y,width,height,controlType,maxSpeed){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed=maxSpeed;
        this.friction=0.05;
        this.angle=0;

        this.damaged=false;

        if (controlType!="DUMMY") {
          this.sensor=new Sensor(this);
          this.mind=new NeuralNetwork(
            [this.sensor.rayCount,4,6,8,16,8,4]
          );
        }
        this.controls=new Controls(controlType);
        this.useMind=controlType=="AI";
    }

    update(roadBorders,traffic) {
        if(this.damaged) return;

        this.#move();
        this.polygon=this.#createPolygon();
        if(this.sensor) {
          this.sensor.update(roadBorders,traffic);
          const offsets=this.sensor.readings.map(
            s=>s==null?0:1-s.offset
          );

          const outputs=NeuralNetwork.feedForward(
            offsets,
            this.mind
          );

          if (this.useMind) {
            this.controls.forward=outputs[0];
            this.controls.left=outputs[1];
            this.controls.right=outputs[2];
            this.controls.reverse=outputs[3];
          }
        }
        this.damaged=this.#assesDamage(roadBorders,traffic);
    }

    #assesDamage(roadBorders,traffic) {
      for (let i=0;i<roadBorders.length;i++) {
        if(polysIntersect(this.polygon,roadBorders[i])) {
          return true;
        }
      }

      for (let i=0;i<traffic.length;i++) {
        if(polysIntersect(this.polygon,traffic[i].polygon)) {
          return true;
        }
      }
      return false;
    }

    #move(){
      //update speed and cap speed
      this.speed=(this.controls.forward&&this.speed<this.maxSpeed)?this.speed+this.acceleration:this.speed;
      this.speed=(this.controls.reverse&&this.speed>this.maxReverse)?this.speed-this.acceleration:this.speed;
    
      //implement friction
      this.speed=(this.speed>0)?this.speed-this.friction:this.speed;
      this.speed=this.speed<0?this.speed+this.friction:this.speed;

      //implement turning
      if(this.speed!=0) {
        const flip=this.speed>0?1:-1;
        this.angle=this.controls.left?this.angle+0.03*flip:this.angle;
        this.angle=this.controls.right?this.angle-0.03*flip:this.angle;
      }

      //update x and y
      this.x-=Math.sin(this.angle)*this.speed;
      this.y-=Math.cos(this.angle)*this.speed;
    }

    draw(ctx,defaultColor,sensors=false){
        ctx.fillStyle=(this.damaged)?"red":defaultColor;

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for(let i=1;i<this.polygon.length;i++) {
          ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        }
        ctx.fill();

        if(this.sensor&&sensors) this.sensor.draw(ctx);
    }

    #createPolygon() {
      const points=[];
      const rad=Math.hypot(this.width,this.height)/2;
      const alpha=Math.atan2(this.width,this.height);
      points.push({
        x:this.x-Math.sin(this.angle-alpha)*rad,
        y:this.y-Math.cos(this.angle-alpha)*rad
      });

      points.push({
        x:this.x-Math.sin(this.angle+alpha)*rad,
        y:this.y-Math.cos(this.angle+alpha)*rad
      });

      points.push({
        x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
        y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
      });
      
      points.push({
        x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
        y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
      });
      return points;
    }
}