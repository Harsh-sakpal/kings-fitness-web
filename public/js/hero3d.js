;(function () {
  const container = document.getElementById('hero-3d')
  if (!container || !window.THREE) return

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 0, 7)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)

  const group = new THREE.Group()
  scene.add(group)

  const mainGeo = new THREE.TorusKnotGeometry(1.5, 0.45, 256, 32)
  const mainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f97373'),
    emissive: new THREE.Color('#7f1d1d'),
    metalness: 0.55,
    roughness: 0.25
  })
  const mainMesh = new THREE.Mesh(mainGeo, mainMat)
  group.add(mainMesh)

  const particleGeo = new THREE.SphereGeometry(0.02, 8, 8)
  const particleMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#fca5a5')
  })
  const particles = new THREE.Group()
  for (let i = 0; i < 90; i++) {
    const m = new THREE.Mesh(particleGeo, particleMat)
    const radius = 3 + Math.random() * 2
    const angle = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 3
    m.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    particles.add(m)
  }
  scene.add(particles)

  const ambient = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambient)

  const keyLight = new THREE.PointLight(0xff4b6a, 1.4, 30)
  keyLight.position.set(6, 5, 6)
  scene.add(keyLight)

  const fillLight = new THREE.PointLight(0x60a5fa, 0.9, 25)
  fillLight.position.set(-5, -4, 4)
  scene.add(fillLight)

  let mouseX = 0
  let mouseY = 0
  let scrollFactor = 0

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    mouseX = x * 2 - 1
    mouseY = y * 2 - 1
  }

  function onScroll() {
    const heroSection = document.getElementById('home')
    if (!heroSection) return
    const rect = heroSection.getBoundingClientRect()
    const vh = window.innerHeight || 1
    const center = rect.top + rect.height / 2
    const progress = 1 - Math.min(Math.max(center / vh, 0), 1)
    scrollFactor = progress
  }

  function onResize() {
    if (!container) return
    const width = container.clientWidth || 400
    const height = container.clientHeight || 300
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)

  onResize()
  onScroll()

  let lastTime = performance.now()

  function animate(now) {
    requestAnimationFrame(animate)
    const delta = (now - lastTime) / 1000
    lastTime = now

    const baseSpeed = 0.4
    mainMesh.rotation.y += (baseSpeed + mouseX * 0.6) * delta
    mainMesh.rotation.x += (0.15 - mouseY * 0.4) * delta

    group.rotation.y += mouseX * 0.15 * delta
    group.rotation.x += -mouseY * 0.1 * delta
    group.position.z = -0.6 + scrollFactor * 0.7

    particles.rotation.y -= 0.06 * delta
    particles.rotation.x += 0.02 * delta

    renderer.render(scene, camera)
  }

  requestAnimationFrame(animate)
})()

