import {sleep} from '../utils';

export class RobotI {
    constructor(robotId) {
        const defaultDistanceDetection = 10;
        const defaultNumOfRays = 31;

        this.myRobotID = robotId;
        this.robot = document.getElementById(robotId);
        this.initialPosition = {x: 0, y: 0, z: 0};
        this.initialRotation = {x: 0, y: 0, z: 0};
        this.activeRays = false;
        this.camerasData = [];
        //this.activeCamera = 0;
        this.raycastersArray = [];
        this.distanceArray = {
            center: [],
            left: [],
            right: []
        };
        this.understandedColors = {
            blue: {low: [0, 0, 235, 0], high: [0, 0, 255, 255]},
            green: {low: [0, 235, 0, 0], high: [0, 255, 0, 255]},
            red: {low: [110, 0, 0, 0], high: [255, 30, 30, 255]},
            white: {low: [230, 230, 230, 0], high: [255, 255, 255, 255]},
            black: {low: [0, 0, 0, 255], high: [105, 105, 105, 255]}
        };
        this.velocity = {x: 0, y: 0, z: 0, ax: 0, ay: 0, az: 0};
        this.simulationEnabled = true;

        this.storeInitialPosition(this.robot.getAttribute('position'));
        this.findCameras();
        this.motorsStarter()
        this.startCamera();
        this.startRaycasters(defaultDistanceDetection, defaultNumOfRays);
        var robotEvent = new CustomEvent('robot-loaded', {
            'detail': this
        });
        document.dispatchEvent(robotEvent);
    }

    changeSimulationState(state) {
        /**
         * Change the simulation state (SIM-API)
         *
         * @param {boolean} state State of the simulation to be set up
         */
        if (typeof state === 'boolean') {
            this.simulationEnabled = state;
        }
    }

    getID() {
        return this.myRobotID;
    }

    findCameras() {
        /**
         * This function searchs for camera entities that has robotID
         * contained in cameraID which means the camera belongs to
         * the body of the robot (attached). This ID is stored in an array
         * with the camera wrapper id that must be same as cameraID + 'Wrapper'
         *
         */
        var sceneCameras = document.getElementsByTagName('a-camera');
        for (var i = 0; i < sceneCameras.length; i++) {
            var cameraID = sceneCameras[i].getAttribute('id');
            if (cameraID.includes(this.myRobotID)) {
                this.camerasData.push(
                    {
                        'wrapperID': cameraID + 'Wrapper',
                        'cameraID': cameraID,
                        'canvasID': cameraID + 'Canvas'
                    })
            }
        }
    }

    motorsStarter() {
        /*
          This function starts motors
        */

        console.log("LOG ---------------- Setting up motors.")
        this.setVelocity();
    }

    getRotation() {
        /*
          Returns an object with rotation properties.
        */
        return this.robot.getAttribute('rotation');
    }

    resetRobot() {
        this.velocity = {x: 0, y: 0, z: 0, ax: 0, ay: 0, az: 0};
        this.robot.body.position.set(this.robot.body.initPosition.x, this.robot.body.initPosition.y, this.robot.body.initPosition.z);
        this.robot.body.quaternion.set(this.robot.body.initQuaternion.x, this.robot.body.initQuaternion.y, this.robot.body.initQuaternion.z, this.robot.body.initQuaternion.w)
    }

    storeInitialPosition(positionObject) {
        this.initialPosition.x = positionObject.x;
        this.initialPosition.y = positionObject.y;
        this.initialPosition.z = positionObject.z;
    }

    setV(v) {
        if (this.simulationEnabled) {
            this.velocity.x = v;
        }
    }

    setW(w) {
        if (this.simulationEnabled) {
            this.velocity.ay = w * 10;
        }
    }

    setL(l) {
        if (this.simulationEnabled) {
            this.velocity.y = l;
        }
    }

    move(v, w, h) {
        this.setV(v);
        this.setW(w);
        this.setL(h);
    }

    advance(linearSpeed) {
        this.setV(linearSpeed);
    }

    async advanceTo(distance) {
        let initial_position_x = this.getPosition().x;
        let initial_position_z = this.getPosition().z;
        distance > 0 ? this.setV(1) : this.setV(-1);
        while (Math.sqrt(Math.pow(initial_position_x-this.getPosition().x,2)
            + Math.pow(initial_position_z-this.getPosition().z,2)) <= Math.abs(distance)) {
            await sleep(0.01);
        }
        this.setV(0);
    }



    async upTo(distance) {
        let initial_position = this.getPosition().y;
        this.setL(1);
        while (Math.abs(initial_position-this.getPosition().y) <= Math.abs(distance)) {
          await sleep(0.01);
        }
        this.setL(0);
    }

    async downTo(distance) {
        let initial_position = this.getPosition().y;
        this.setL(-1);
        while (Math.abs(initial_position-this.getPosition().y) <= Math.abs(distance)) {
            await sleep(0.01);
        }
        this.setL(0);
    }

    async turnUpTo(angle) {
        let initial_position = this.getPosition().theta + 180.0; // [0, 360]
        angle > 0 ? this.setW(-0.15) : this.setW(0.15);
        var current_position = this.getPosition().theta + 180.0; // [0, 360]
        if (initial_position -angle < 0.0) {
            angle = angle - 360.0; // discontinuity
        }
        while (Math.abs(current_position - ((initial_position - angle)%360.0)) >= 5.0) {
            await sleep(0.0001);
            current_position = this.getPosition().theta + 180.0; // [0, 360]
        }
        this.setW(0);
    }


    async land() {
        let position = this.getPosition();
        if (position.y > 2) {
            while (this.getPosition().y > 2) {
                this.setL(-2);
				await sleep(0.2);
            }
            this.setL(0);
        }
    }

    async takeOff() {
        let position = this.getPosition();
        if (position.y < 10) {
            while (this.getPosition().y < 10) {
                this.setL(2);
				await sleep(0.2);
            }
            this.setL(0);
        }
    }

    getV() {
        return this.velocity.x;
    }

    getW() {
        return this.velocity.ay;
    }

    getL() {
        return this.velocity.y;
    }

    getPositionX() {
        return this.getPosition().x;
    }

    getPositionY() {
        return this.getPosition().y;
    }

    getPositionZ() {
        return this.getPosition().z;
    }

  setPositionY(n) {
      let Z=this.getPosition().z;
      while (Z-n)!=  {


      }
  }


    setVelocity() {
        /*
          This code run continiously, setting the speed of the robot every 30ms
          This function will not be callable, use setV, setW or setL
        */
        if (this.simulationEnabled) {
            if (this.robot.body.position.y > 1) { //to activate animation of drone
                var robot = document.querySelector("#" + this.myRobotID);
                robot.setAttribute('animation-mixer', "clip:*;timeScale:1.5");
            } else {
                var robot = document.querySelector("#" + this.myRobotID);
                robot.setAttribute('animation-mixer', "clip:None");
            }
            let rotation = this.getRotation();
            let newpos = this.updatePosition(rotation, this.velocity, this.robot.body.position);
            this.robot.body.position.set(newpos.x, newpos.y, newpos.z);
            this.robot.body.angularVelocity.set(this.velocity.ax, this.velocity.ay, this.velocity.az);
        } else {
            this.robot.body.angularVelocity.set(0.0, 0.0, 0.0);
        }
        this.timeoutMotors = setTimeout(this.setVelocity.bind(this), 50);
    }

    updatePosition(rotation, velocity, robotPos) {
        let x = velocity.x / 10 * Math.cos(rotation.y * Math.PI / 180);
        let z = velocity.x / 10 * Math.sin(-rotation.y * Math.PI / 180);
        let y = (velocity.y / 10);
        robotPos.x += x;
        robotPos.z += z;
        robotPos.y += y;
        return robotPos;
    }

    getCameraDescription() {
    /*
      Returns width and height for the robot camera.
    */
        return {width: this.canvas2d.width, height: this.canvas2d.height};
    }

    getImageDescription() {
    /*
      Returns an object with width and height of the robot image.
    */
        return {width: this.imagedata.cols, height: this.imagedata.rows};
    }

    startCamera() {
        // Starts camera from robot
        console.log("LOG ---------> Starting camera.");
        if (($('#spectatorDiv').length) && (document.querySelector("#spectatorDiv").firstChild != undefined)) {
            for (var i = 0; i < this.camerasData.length; i++) {
                var canvasID = '#' + this.camerasData[i]['canvasID'];
                this.canvas2d = document.querySelector(canvasID);
                this.camerasData[i]['canvasElement'];
            }
            this.getImageData_async();
        } else {
            setTimeout(this.startCamera.bind(this), 100);
        }
    }

    /*toggleCamera(){
      var availableCameras = this.camerasData.length;
      if (this.activeCamera + 1 + 1 <= availableCameras) {
        this.activeCamera += 1;
      } else {
        this.activeCamera = 0;
      }
      console.log(this.activeCamera);
    }*/

    getImage(cameraID) {
        /**
         * Returns a screenshot from the robot camera
         */
        /*for(var i = 0; i <= this.camerasData.length; i++){
            console.log(this.camerasData[i]);

        }*/
        if (!cameraID || (this.camerasData.length == 1) || (cameraID > this.camerasData.length - 1)) {
            // Robots with one camera get the only one available
            // Requests for cameras that don't exist returns default camera
            return this.camerasData[0]['image'];

        } else {
            // Robots with two or more cameras
            return this.camerasData[cameraID]['image'];
        }

    }

    getImageData_async(cameraID) {
    /*
      This function stores image from the robot in the variable
      "imagedata", this allows to obtain image from the robot
      with getImage() function.
    */
        if (this.simulationEnabled) {
            for (var i = 0; i < this.camerasData.length; i++) {
                this.camerasData[i]['image'] = cv.imread(this.camerasData[i]['canvasID']);
            }
        }
        this.timeoutCamera = setTimeout(this.getImageData_async.bind(this), 60);
    }

    startRaycasters(distance, numOfRaycasters) {
    /*
      This function enables/disbles raycasters (position sensors)
      for the robot.

      @distance (Number): Distance which the rays will detect objects.
      @numOfRaycasters (Numbrer): Number of Raycaster.
    */
        if (!this.activeRays) {
            console.log("LOG ---------> Starting sound sensors");
            let emptyEntity = document.querySelector("a-scene");
            // offsetAngle: angle between one raycaster and the next one.
            if ((numOfRaycasters % 2) == 0) {
                numOfRaycasters += 1;
            }
            var offsetAngle = 180 / numOfRaycasters;
            var angle = -90;
            for (var i = 0; i < numOfRaycasters; i++) {
                if (i == (numOfRaycasters - 1) / 2) {
                    angle += offsetAngle;
                    var group = "center";
                } else if (i < (numOfRaycasters - 1) / 2) {
                    angle = angle * 1;
                    angle += offsetAngle;
                    group = "left";
                } else if (i > (numOfRaycasters - 1) / 2) {
                    angle = angle * 1;
                    angle += offsetAngle;
                    group = "right";
                }
                this.createRaycaster(distance, angle, emptyEntity, group, i);
            }
            this.activeRays = true;
            this.setListener();
        } else {
            this.stopRaycasters();
        }
    }

    createRaycaster(distance, angle, emptyEntity, group, number) {
    /*
      This function appends raycasters entities to the robot.
    */
        let newRaycaster = document.createElement('a-entity');
        newRaycaster.setAttribute('raycaster', 'objects', '.collidable');
        newRaycaster.setAttribute('raycaster', 'far', distance);
        newRaycaster.setAttribute('raycaster', 'showLine', true);
        newRaycaster.setAttribute('raycaster', 'direction', "1 0 0");
        newRaycaster.setAttribute('raycaster', 'interval', 100);
        newRaycaster.setAttribute('raycaster', 'enabled', true);
        newRaycaster.setAttribute('line', 'color', "#ffffff");
        newRaycaster.setAttribute('line', 'opacity', 1);
        newRaycaster.setAttribute('line', 'end', "1 0 0");
        newRaycaster.setAttribute('follow-body', 'entityId', '#' + this.myRobotID);
        newRaycaster.setAttribute('follow-body', "offsetRotation", "0 " + angle + " 0");
        newRaycaster.setAttribute('intersection-handler', 'fps', '10');
        newRaycaster.classList.add(group);
        newRaycaster.id = number.toString();
        this.raycastersArray.push(newRaycaster)
        emptyEntity.appendChild(newRaycaster);
    }

    stopRaycasters() {
    /*
      This function erases all raycasters for the robot.
    */
        var emptyEntity = document.querySelector("#positionSensor");
        while (emptyEntity.firstChild) {
            this.removeListeners(emptyEntity.firstChild);
            emptyEntity.removeChild(emptyEntity.firstChild);
        }
        this.activeRays = false;
        console.log("LOG ---------> Stopping sound sensors");
    }

    setListener() {
    /*
      This function sets up intersection listeners for each raycaster.
    */
        for (var i = 0; i < this.raycastersArray.length; i++) {
            this.raycastersArray[i].addEventListener('intersection-detected-' + this.raycastersArray[i].id,
                this.updateDistance.bind(this));

            this.raycastersArray[i].addEventListener('intersection-cleared-' + this.raycastersArray[i].id,
                this.eraseDistance.bind(this));
        }
    }

    removeListeners(raycaster) {
    /*
      This function disables intersection listeners.
    */
        raycaster.removeEventListener('intersection-detected-' + raycaster.id, () => {
            console.log("removed");
        });
        raycaster.removeEventListener('intersection-cleared-' + raycaster.id, () => {
            console.log("removed");
        });
    }

    updateDistance(evt) {
    /*
      This function is called when an intersection is detected and updates the distance
      to the point of intersection.
    */
        let id = evt.target.id;
        let targetClass = evt.target.classList[0];

        if (this.distanceArray[targetClass].length == 0) {

            this.distanceArray[targetClass].push({id: id, d: evt.detail});
        } else {
            let found = false;
            let j = 0;
            while ((j < this.distanceArray[targetClass].length) && !found) {
                if (this.distanceArray[targetClass][j].id == id) {
                    this.distanceArray[targetClass][j].d = evt.detail;
                    found = true;
                }
                j += 1;
            }
            if (!found) {
                this.distanceArray[targetClass].push({id: id, d: evt.detail});
            }
        }
    }

    eraseDistance(evt) {
    /*
      This function is called when the intersection is cleared and
      removes the distance from the array.
    */
        let id = evt.target.id;
        let targetClass = evt.target.classList[0];

        for (var i = 0; i < this.distanceArray[targetClass].length; i++) {
            if (this.distanceArray[targetClass][i].id == id) {
                this.distanceArray[targetClass].splice(i, 1);
            }
        }
    }



    getDistance() {
      /*
       This function returns the distance for the raycaster in the center of the arc of rays.
     */
         if (this.distanceArray["center"][0] != null) {
             return this.distanceArray["center"][0].d;
         } else {
             return 10;
         }
     }

    getDistances() {
    /*
      This function returns an array with all the distances detected by the rays.
    */
        var distances = []
        for (var i = 0; i <= 31; i++) {
            distances.push(10);
        }
        var groups = ["center", "right", "left"];
        for (var i = 0; i < groups.length; i++) {
            this.distanceArray[groups[i]].forEach((obj) => {
                if (typeof obj.d != "undefined") {
                    distances[obj.id] = obj.d;
                }
            });
        }
        return distances;
    }

    isTouching() {
        return (this.getDistance()<3);
    }

    getMinorDistance() {
      /*
        This function returns the minor distance of an array with all distances
      */

      var distances = []
      let ray = 32;
      let distance=5;
      for (var i = 0; i <= 31; i++) {
          distances.push(10);
      }
      var groups = ["center", "right", "left"];
      for (var i = 0; i < groups.length; i++) {
          this.distanceArray[groups[i]].forEach((obj) => {
              if (typeof obj.d != "undefined") {
                  distances[obj.id] = obj.d;
              }
          });
      }
      for (var i=0; i<distances.length; i++){
        if (distances[i]<distance){
          distance=distance[i]
          ray=i;
        }
      }
      if (ray > 15 && ray < 32) {
          return groups[1];

      }else if(ray == 15){
          return groups[0];

      } else if (ray < 15) {
          return groups[2];

      }else {
          return "unhindered";
      }
    }

    getPosition() {
    /*
      This function returns an object with X-Y-Z positions and rotation (theta)
      for the Y axis.
    */
        let x = this.robot.object3D.position.x;
        let y = this.robot.object3D.position.y;
        let z = this.robot.object3D.position.z;
        let rot = THREE.Math.radToDeg(this.robot.object3D.rotation.y);

        return {x: x, y: y, z: z, theta: rot};
    }

    getPositionValue(position) {
        let position_value = this.getPosition();
        if (position === 'POSX') {
            return position_value.x;
        } else if (position === 'POSY') {
            return position_value.z;
        } else if (position === 'POSZ') {
            return position_value.y;
        } else {
            return position_value.theta;
        }
    }

    getObjectColor(colorAsString)
    /*
      This function filters an object in the scene with a given color passed as string, uses OpenCVjs
      to filter by color and calculates the center of the object and the area.

      Returns center: CenterX (cx), CenterY (cy) and the area of the object detected in the image.
    */ {
        var image = this.getImage();
        var colorCodes = this.getColorCode(colorAsString);
        var binImg = new cv.Mat();
        var M = cv.Mat.ones(5, 5, cv.CV_8U);
        var anchor = new cv.Point(-1, -1);
        var lowThresh = new cv.Mat(image.rows, image.cols, image.type(), colorCodes[0]);
        var highThresh = new cv.Mat(image.rows, image.cols, image.type(), colorCodes[1]);
        var contours = new cv.MatVector();
        var hierarchy = new cv.Mat();

        cv.morphologyEx(image, image, cv.MORPH_OPEN, M, anchor, 2,
            cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue()); // Erosion followed by dilation

        cv.inRange(image, lowThresh, highThresh, binImg);
        cv.findContours(binImg, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        if (contours.size() > 0) {

            let stored = contours.get(0);
            var objArea = cv.contourArea(stored, false);

            let moments = cv.moments(stored, false);
            var cx = moments.m10 / moments.m00;
            var cy = moments.m01 / moments.m00;

        }
        return {center: [parseInt(cx), parseInt(cy)], area: parseInt(objArea)};
    }

    getObjectColorRGB(lowval, highval) {
    /*
      This function filters an object in the scene with a given color, uses OpenCVjs to filter
      by color and calculates the center of the object.

      Returns center: CenterX (cx), CenterY (cy) and the area of the object detected in the image.
    */

        if(lowval.length == 3){
          lowval.push(0);
        }
        if(highval.length == 3){
          highval.push(255);
        }
        var image = this.getImage();
        var binImg = new cv.Mat();
        var M = cv.Mat.ones(5, 5, cv.CV_8U);
        var anchor = new cv.Point(-1, -1);
        var lowThresh = new cv.Mat(image.rows, image.cols, image.type(), lowval);
        var highThresh = new cv.Mat(image.rows, image.cols, image.type(), highval);
        var contours = new cv.MatVector();
        var hierarchy = new cv.Mat();

        cv.morphologyEx(image, image, cv.MORPH_OPEN, M, anchor, 2,
            cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue()); // Erosion followed by dilation

        cv.inRange(image, lowThresh, highThresh, binImg);
        cv.findContours(binImg, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        if (contours.size() > 0) {

            let stored = contours.get(0);
            var objArea = cv.contourArea(stored, false);

            let moments = cv.moments(stored, false);
            var cx = moments.m10 / moments.m00;
            var cy = moments.m01 / moments.m00;

        }
        return {center: [parseInt(cx), parseInt(cy)], area: parseInt(objArea)};
    }

    getObjectColorPosition(position, color) {
        let image = this.getObjectColor(color);
        if (position === 'X') {
            return image.center[0];
        } else if (position === 'Y') {
            return image.center[1];
        } else {
            return image.area;
        }
    }
    getObjectColorPositionRGB(position, valuemin,valuemax) {
        let image = this.getObjectColorRGB(valuemin,valuemax);
        if (position === 'X') {
            return image.center[0];
        } else if (position === 'Y') {
            return image.center[1];
        } else {
            return image.area;
        }
    }

    getColorCode(color) {
    /*
      This function returns binary values for the color if the color is on the
      array of colors that robot can filter.
    */
        if (this.understandedColors[color]) {
            var low = this.understandedColors[color].low;
            var high = this.understandedColors[color].high;
            return [low, high];
        }
    }

    followLine(lowval, highval, speed) {
    /*
      This function is a simple implementation of follow line algorithm, the robot filters an object with
      a given color and follows it.
    */
        if (this.simulationEnabled) {
            var data = this.getObjectColorRGB(lowval, highval); // Filters image

            this.setV(speed);

            if (data.center[0] >= 75 && data.center[0] < 95) {
                this.setW(-0.2);
            } else if (data.center[0] <= 75 && data.center[0] >= 55) {
                this.setW(0.2);
            } else if (data.center[0] >= 95) {
                this.setW(-0.35);
            } else if (data.center[0] <= 55) {
                this.setW(0.35)
            }
        }
    }

    readIR(reqColor) {
    /*
      This function filters an object on the robot image and returns 0-1-2-3 depending of the
      position of the center on X axis for the detected object.
    */
        var outputVal = 3;
        var image = this.getImage();
        var binImg = new cv.Mat();
        var colorCodes = this.getColorCode(reqColor);
        var contours = new cv.MatVector();
        var hierarchy = new cv.Mat();
        let dst = new cv.Mat();
        let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, 0, 0, 1, -95]);
        let dsize = new cv.Size(image.cols, image.rows - 95);
        // You can try more different parameters
        cv.warpAffine(image, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        var lowTresh = new cv.Mat(dst.rows, dst.cols, dst.type(), colorCodes[0]);
        var highTresh = new cv.Mat(dst.rows, dst.cols, dst.type(), colorCodes[1]);

        cv.inRange(dst, lowTresh, highTresh, binImg);
        cv.findContours(binImg, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        if (contours.size() > 0) {
            let stored = contours.get(0);
            let moments = cv.moments(stored, false);

            var cx = moments.m10 / moments.m00;

            if (isNaN(cx)) {
                outputVal = 3;
            } else if ((cx <= 150) && (cx >= 93)) {
                outputVal = 2;
            } else if ((cx >= 0) && (cx <= 57)) {
                outputVal = 1;
            } else {
                outputVal = 0;
            }

        }
        return outputVal;
    }

    /*
      SPANISH API: This methods calls the same method in english
    */

    leerIRSigueLineas() {
        return this.readIR();
    }

    avanzar(linearSpeed) {
        this.advance(linearSpeed);
    }

    async avanzarHasta(distance) {
        this.advanceTo(distance);
    }

    girar(turningSpeed) {
        return this.setW(turningSpeed);
    }

    async girarHasta(angle) {
        this.turnUpTo(angle);
    }

    async subir(distance){
      this.upTo(distance)
    }

    async bajar(distance){
      this.downTo(distance);
    }

    async aterrizar() {
        this.land();
    }

    async despegar() {
        this.takeOff();
    }

    parar() {
        this.move(0, 0, 0);
    }

    leerUltrasonido() {
        return this.getDistance();
    }

    dameObjeto(lowFilter, highFilter) {
        return this.getObjectColorRGB(lowFilter, highFilter);
    }

    dameImagen() {
        return this.getImage();
    }
}
