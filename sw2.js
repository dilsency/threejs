self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('threejs').then((cache) => cache.addAll([
      '/threejs/',
      '/threejs/index.html',
      '/threejs/main.js',

      '/threejs/models/Dodecahedron.obj',
      '/threejs/models/Icosahedron.gltf',
      '/threejs/models/Icosahedron.obj',

      '/threejs/textures/bunny_thickness_2.jpg',
      '/threejs/textures/bunny_thickness.jpg',
      '/threejs/textures/texture_default.jpg',
      '/threejs/textures/white.jpg',

      '/threejs/textures/cube/skybox/nx.png',
      '/threejs/textures/cube/skybox/ny.png',
      '/threejs/textures/cube/skybox/nz.png',
      '/threejs/textures/cube/skybox/px.png',
      '/threejs/textures/cube/skybox/py.png',
      '/threejs/textures/cube/skybox/pz.png',

      '/threejs/shaders/fragment1.js',
      '/threejs/shaders/vertex1.js',

        '/threejs/helpers/helper_camera_rotation.js',
        '/threejs/helpers/helper_generation_hud.js',
        '/threejs/helpers/helper_generation_planet.js',
        '/threejs/helpers/helper_mesh.js',

        '/threejs/img/icon 192x192.png',
        '/threejs/img/icon 512x512.png',

    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});