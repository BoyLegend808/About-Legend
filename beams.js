(function () {
  "use strict";

  // Configuration matching your React Beams props exactly
  var BEAM_WIDTH = 3;
  var BEAM_HEIGHT = 30;
  var BEAM_NUMBER = 20;
  var LIGHT_COLOR = 0xffffff;
  var SPEED = 2.0;
  var NOISE_INTENSITY = 1.75;
  var SCALE = 0.2;
  var ROTATION = 30; // Rotation in degrees

  var canvas = document.getElementById("beams-canvas");
  if (!canvas) return;

  function initBeams() {
    if (typeof THREE === "undefined") {
      // Retry in case CDN loading has a sub-millisecond delay
      setTimeout(initBeams, 20);
      return;
    }

    var scene = new THREE.Scene();

    // Camera setup (fov: 30, positioned at z = 20)
    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

    // Renderer
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Ambient lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Directional light (creating glossy metallic specular highlights)
    var dirLight = new THREE.DirectionalLight(LIGHT_COLOR, 1.0);
    dirLight.position.set(0, 3, 10);
    dirLight.castShadow = true;
    
    var cam = dirLight.shadow.camera;
    cam.top = 24;
    cam.bottom = -24;
    cam.left = -24;
    cam.right = 24;
    cam.far = 64;
    dirLight.shadow.bias = -0.004;
    
    scene.add(dirLight);

    // 3D Simplex noise shader source
    var noiseShader = "\n    float random (in vec2 st) {\n        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\n    }\n    float noise (in vec2 st) {\n        vec2 i = floor(st);\n        vec2 f = fract(st);\n        float a = random(i);\n        float b = random(i + vec2(1.0, 0.0));\n        float c = random(i + vec2(0.0, 1.0));\n        float d = random(i + vec2(1.0, 1.0));\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\n    }\n    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\n    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\n    vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}\n    float cnoise(vec3 P){\n      vec3 Pi0 = floor(P);\n      vec3 Pi1 = Pi0 + vec3(1.0);\n      Pi0 = mod(Pi0, 289.0);\n      Pi1 = mod(Pi1, 289.0);\n      vec3 Pf0 = fract(P);\n      vec3 Pf1 = Pf0 - vec3(1.0);\n      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n      vec4 iy = vec4(Pi0.yy, Pi1.yy);\n      vec4 iz0 = Pi0.zzzz;\n      vec4 iz1 = Pi1.zzzz;\n      vec4 ixy = permute(permute(ix) + iy);\n      vec4 ixy0 = permute(ixy + iz0);\n      vec4 ixy1 = permute(ixy + iz1);\n      vec4 gx0 = ixy0 / 7.0;\n      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n      gx0 = fract(gx0);\n      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n      vec4 sz0 = step(gz0, vec4(0.0));\n      gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n      gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n      vec4 gx1 = ixy1 / 7.0;\n      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n      gx1 = fract(gx1);\n      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n      vec4 sz1 = step(gz1, vec4(0.0));\n      gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n      gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n      vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));\n      g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;\n      vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));\n      g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;\n      float n000 = dot(g000, Pf0);\n      float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));\n      float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));\n      float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));\n      float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));\n      float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));\n      float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));\n      float n111 = dot(g111, Pf1);\n      vec3 fade_xyz = fade(Pf0);\n      vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);\n      vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);\n      float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);\n      return 2.2 * n_xyz;\n    }\n    ";

    // Clone standard physical shader structure
    var physical = THREE.ShaderLib.physical;
    var uniforms = THREE.UniformsUtils.clone(physical.uniforms);

    // Setup base standard properties (obsidian dark mirror)
    uniforms.diffuse.value = new THREE.Color(0.005, 0.005, 0.008);
    uniforms.roughness.value = 0.28;
    uniforms.metalness.value = 0.85;
    uniforms.envMapIntensity.value = 8;

    // Define custom uniforms
    uniforms.time = { value: 0 };
    uniforms.uSpeed = { value: SPEED };
    uniforms.uNoiseIntensity = { value: NOISE_INTENSITY };
    uniforms.uScale = { value: SCALE };

    // Inject custom shader lines
    var vertexShader = "\n      varying vec3 vEye;\n      varying float vNoise;\n      varying vec2 vUv;\n      varying vec3 vPosition;\n      uniform float time;\n      uniform float uSpeed;\n      uniform float uNoiseIntensity;\n      uniform float uScale;\n      " + noiseShader + "\n      \n      float getPos(vec3 pos) {\n        vec3 noisePos = vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;\n        return cnoise(noisePos);\n      }\n      vec3 getCurrentPos(vec3 pos) {\n        vec3 newpos = pos;\n        newpos.z += getPos(pos);\n        return newpos;\n      }\n      vec3 getNormal(vec3 pos) {\n        vec3 curpos = getCurrentPos(pos);\n        vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));\n        vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));\n        vec3 tangentX = normalize(nextposX - curpos);\n        vec3 tangentZ = normalize(nextposZ - curpos);\n        return normalize(cross(tangentZ, tangentX));\n      }\n      \n      " + physical.vertexShader + "\n    ";

    vertexShader = vertexShader
      .replace("#include <begin_vertex>", "transformed.z += getPos(transformed.xyz);")
      .replace("#include <beginnormal_vertex>", "objectNormal = getNormal(position.xyz);");

    var fragmentShader = "\n      varying vec3 vEye;\n      varying float vNoise;\n      varying vec2 vUv;\n      varying vec3 vPosition;\n      uniform float time;\n      uniform float uSpeed;\n      uniform float uNoiseIntensity;\n      uniform float uScale;\n      " + noiseShader + "\n      \n      " + physical.fragmentShader + "\n    ";

    fragmentShader = fragmentShader.replace("#include <dithering_fragment>", "\n      #include <dithering_fragment>\n      float randomNoise = noise(gl_FragCoord.xy);\n      gl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;\n    ");

    var material = new THREE.ShaderMaterial({
      defines: Object.assign({}, physical.defines),
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      lights: true,
      fog: true
    });

    // Create stacked planes geometry
    function createStackedPlanesBufferGeometry(n, width, height, spacing, heightSegments) {
      var geom = new THREE.BufferGeometry();
      var numVertices = n * (heightSegments + 1) * 2;
      var numFaces = n * heightSegments * 2;
      var positions = new Float32Array(numVertices * 3);
      var indices = new Uint32Array(numFaces * 3);
      var uvs = new Float32Array(numVertices * 2);

      var vertexOffset = 0;
      var indexOffset = 0;
      var uvOffset = 0;
      var totalWidth = n * width + (n - 1) * spacing;
      var xOffsetBase = -totalWidth / 2;

      for (var i = 0; i < n; i++) {
        var xOffset = xOffsetBase + i * (width + spacing);
        var uvXOffset = Math.random() * 300;
        var uvYOffset = Math.random() * 300;

        for (var j = 0; j <= heightSegments; j++) {
          var y = height * (j / heightSegments - 0.5);
          var v0 = [xOffset, y, 0];
          var v1 = [xOffset + width, y, 0];
          positions.set([].concat(v0, v1), vertexOffset * 3);

          var uvY = j / heightSegments;
          uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset);

          if (j < heightSegments) {
            var a = vertexOffset;
            var b = vertexOffset + 1;
            var c = vertexOffset + 2;
            var d = vertexOffset + 3;
            indices.set([a, b, c, c, b, d], indexOffset);
            indexOffset += 6;
          }
          vertexOffset += 2;
          uvOffset += 4;
        }
      }

      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
      geom.setIndex(new THREE.BufferAttribute(indices, 1));
      geom.computeVertexNormals();
      return geom;
    }

    var geometry = createStackedPlanesBufferGeometry(BEAM_NUMBER, BEAM_WIDTH, BEAM_HEIGHT, 0, 100);
    var mesh = new THREE.Mesh(geometry, material);

    var group = new THREE.Group();
    group.rotation.set(0, 0, ROTATION * Math.PI / 180);
    group.add(mesh);
    scene.add(group);

    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var delta = clock.getDelta();
      material.uniforms.time.value += 0.1 * delta;
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBeams);
  } else {
    initBeams();
  }
})();
