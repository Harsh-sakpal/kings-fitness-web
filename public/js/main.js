document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year')
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear())
  }

  const mobileToggle = document.getElementById('mobile-menu-toggle')
  const mobileMenu = document.getElementById('mobile-menu')
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const open = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px'
      mobileMenu.style.maxHeight = open ? '0px' : mobileMenu.scrollHeight + 'px'
    })

    const mobileLinks = mobileMenu.querySelectorAll('a[href^="#"]')
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.style.maxHeight = '0px'
      })
    })
  }

  const contactForm = document.getElementById('contact-form')
  const contactStatus = document.getElementById('contact-status')

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      if (!contactStatus) return

      contactStatus.textContent = 'Sending enquiry...'

      const formData = new FormData(contactForm)
      const payload = Object.fromEntries(formData.entries())

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send')
        }

        contactStatus.textContent = data.message || 'Thank you! We will contact you shortly.'
        contactStatus.classList.remove('text-red-300')
        contactStatus.classList.add('text-emerald-300')
        contactForm.reset()
      } catch (err) {
        console.error(err)
        contactStatus.textContent =
          'Could not send from server right now, but you can call or WhatsApp us directly using the buttons above.'
        contactStatus.classList.remove('text-emerald-300')
        contactStatus.classList.add('text-red-300')
      }
    })
  }

  const mediaGrid = document.getElementById('media-grid')
  const overviewMediaCount = document.getElementById('overview-media-count')

  async function loadContent() {
    if (!mediaGrid) return

    try {
      const res = await fetch('/api/content')
      if (!res.ok) return
      const data = await res.json()

      const { videos = [], images = [], highlights = [] } = data || {}
      const totalMedia = videos.length + images.length
      if (overviewMediaCount) {
        overviewMediaCount.textContent = String(totalMedia)
      }

      if (totalMedia === 0 && (!highlights || !highlights.length)) return

      mediaGrid.innerHTML = ''

      videos.slice(0, 3).forEach((url) => {
        if (!url) return
        const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/)
        const videoId = videoIdMatch ? videoIdMatch[1] : null
        if (!videoId) return

        const div = document.createElement('div')
        div.className =
          'rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-lg shadow-black/40'
        div.innerHTML = `
          <div class="aspect-video">
            <iframe class="w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>
          <div class="px-3 py-2 text-[11px] text-slate-200">
            KING'S FITNESS video update
          </div>
        `
        mediaGrid.appendChild(div)
      })

      images.slice(0, 3).forEach((url) => {
        if (!url) return
        const div = document.createElement('div')
        div.className =
          'rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-lg shadow-black/40 flex flex-col'
        div.innerHTML = `
          <div class="aspect-video bg-slate-900">
            <img src="${url}" alt="KING'S FITNESS project image" class="w-full h-full object-cover" />
          </div>
          <div class="px-3 py-2 text-[11px] text-slate-200">
            Recent gym setup / maintenance work by KING'S FITNESS.
          </div>
        `
        mediaGrid.appendChild(div)
      })

      if (highlights && highlights.length) {
        const div = document.createElement('div')
        div.className =
          'rounded-2xl border border-red-500/40 bg-red-950/40 px-3 py-3 text-[11px] text-red-100 md:col-span-3'
        div.innerHTML = `
          <p class="font-semibold mb-1">Highlights</p>
          <ul class="list-disc list-inside space-y-0.5">
            ${highlights.map((h) => `<li>${h}</li>`).join('')}
          </ul>
        `
        mediaGrid.appendChild(div)
      }
    } catch (err) {
      console.error('Failed to load content', err)
    }
  }

  loadContent()

  const revealElements = document.querySelectorAll('.scroll-reveal')
  if (revealElements.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            obs.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    revealElements.forEach((el) => observer.observe(el))
  }

  const statEls = document.querySelectorAll('.stat-value[data-stat-target]')

  function animateStat(el) {
    const target = Number(el.dataset.statTarget || '0')
    if (!target) return
    const suffix = el.dataset.statSuffix || ''
    let current = 0
    const duration = 1000
    const start = performance.now()

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1)
      current = Math.floor(target * progress)
      el.textContent = `${current}${suffix}`
      if (progress < 1) {
        requestAnimationFrame(frame)
      }
    }

    requestAnimationFrame(frame)
  }

  if (statEls.length) {
    const statObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStat(entry.target)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.6 }
    )

    statEls.forEach((el) => statObserver.observe(el))
  }
})

