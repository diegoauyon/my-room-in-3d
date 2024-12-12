import * as THREE from "three";
import Experience from "./Experience";
import Time from "./Utils/Time";

export class CameraKeyframeInstance {
  constructor(keyframe) {
    this.position = keyframe.position;
    this.focalPoint = keyframe.focalPoint;
  }

  update() {}
}

const keys = {
  idle: {
    position: new THREE.Vector3(
      -31.561057370818336,
      24.378237925579467,
      31.4985747917354551
    ),
    focalPoint: new THREE.Vector3(0, 2, 0),
  },
  monitor: {
    position: new THREE.Vector3(
      -3.9999988871752135,
      4.000000000000002,
      0.002583979008661607
    ),
    focalPoint: new THREE.Vector3(
      0.3067377805709839,
      3.360666036605835,
      -4.590847492218018
    ),
    quaternion: new THREE.Quaternion(
      -0.4996154010295868,
      0.4996153712272644,
      -0.042695833567610704,
      -0.5003843307495117,
      0.5003843307495117
    ),
  },
  tv: {
    position: new THREE.Vector3(
      -2.9999988871752135,
      3.000000000000002,
      0.002583979008661607
    ),
    focalPoint: new THREE.Vector3(4.2, 2.6, 1.8),
    quaternion: new THREE.Quaternion(
      -0.04347517922103461,
      -0.6993808914249738,
      -0.042695833567610704,
      0.7121469955685236
    ),
  },
  loading: {
    position: new THREE.Vector3(
      -27.561057370818336,
      25.378237925579467,
      35.4985747917354551
    ),
    focalPoint: new THREE.Vector3(4.2, 2.6, 1.8),
  },
  orbitControlsStart: {
    position: new THREE.Vector3(
      -27.561057370818336,
      3.378237925579467,
      0.4985747917354551
    ),
    focalPoint: new THREE.Vector3(4.2, 2.6, 1.8),
  },
};

export class MonitorKeyframe extends CameraKeyframeInstance {
  constructor() {
    const keyframe = keys.monitor;
    super(keyframe);
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.origin = new THREE.Vector3().copy(keyframe.position);
    this.targetPos = new THREE.Vector3().copy(keyframe.position);
  }

  update() {
    const aspect = this.sizes.height / this.sizes.width;
    const additionalZoom = this.sizes.width < 768 ? 0 : 0.6;
    this.targetPos.z = this.origin.z + aspect * 1.2 - additionalZoom;
    this.position.copy(this.targetPos);
  }
}

export class TVKeyframe extends CameraKeyframeInstance {
  constructor() {
    const keyframe = keys.tv;
    super(keyframe);
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.origin = new THREE.Vector3().copy(keyframe.position);
    this.targetPos = new THREE.Vector3().copy(keyframe.position);
  }

  update() {
    const aspect = this.sizes.height / this.sizes.width;
    const additionalZoom = this.sizes.width < 768 ? 27 : 15;
    this.targetPos.x = this.origin.x + aspect * 12 - additionalZoom;
    this.position.copy(this.targetPos);
  }
}

export class LoadingKeyframe extends CameraKeyframeInstance {
  constructor() {
    const keyframe = keys.loading;
    super(keyframe);
  }

  update() {}
}

export class IdleKeyframe extends CameraKeyframeInstance {
  constructor() {
    const keyframe = keys.idle;
    super(keyframe);
    this.origin = new THREE.Vector3().copy(keyframe.position);
    this.time = new Time();
  }

  update() {

    const posx = Math.sin((this.time.elapsed + 2.8000) * 0.00004) * this.origin.x -30;
    this.position.x = posx

    this.position.y =
      Math.sin((this.time.elapsed + 1) * 0.0004) * 2 + this.origin.y - 2;
    this.position.z = this.position.z;
  }
}

export class OrbitControlsStart extends CameraKeyframeInstance {
  constructor() {
    const keyframe = keys.orbitControlsStart;
    super(keyframe);
  }

  update() {}
}
