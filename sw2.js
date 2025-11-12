self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('threejs').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/main.js',

      '/models/Dodecahedron.obj',
      '/models/Icosahedron.gltf',
      '/models/Icosahedron.obj',

      '/textures/bunny_thickness_2.jpg',
      '/textures/bunny_thickness.jpg',
      '/textures/texture_default.jpg',
      '/textures/white.jpg',

      '/textures/cube/skybox/nx.png',
      '/textures/cube/skybox/ny.png',
      '/textures/cube/skybox/nz.png',
      '/textures/cube/skybox/px.png',
      '/textures/cube/skybox/py.png',
      '/textures/cube/skybox/pz.png',

      '/shaders/fragment1.js',
      '/shaders/vertex1.js',

        '/helpers/helper_camera_rotation.js',
        '/helpers/helper_generation_hud.js',
        '/helpers/helper_generation_planet.js',
        '/helpers/helper_mesh.js',

        '/img/icon.png',
        '/css/styles.css',
        '/js/app.js',

    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});