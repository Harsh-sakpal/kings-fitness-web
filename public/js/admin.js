;(function () {
  const loginSection = document.getElementById('login-section')
  const dashboardSection = document.getElementById('dashboard-section')
  const loginForm = document.getElementById('login-form')
  const loginStatus = document.getElementById('login-status')
  const logoutBtn = document.getElementById('logout-btn')
  const backToSite = document.getElementById('back-to-site')
  const sidebarNav = document.getElementById('sidebar-nav')
  const mediaForm = document.getElementById('media-form')
  const mediaStatus = document.getElementById('media-status')
  const mediaPreview = document.getElementById('media-preview')
  const overviewMediaCount = document.getElementById('overview-media-count')
  const billingForm = document.getElementById('billing-form')
  const billingStatus = document.getElementById('billing-status')
  const addLineItemBtn = document.getElementById('add-line-item')
  const lineItemsBody = document.getElementById('line-items-body')
  const subtotalDisplay = document.getElementById('subtotal-display')
  const taxDisplay = document.getElementById('tax-display')
  const totalDisplay = document.getElementById('total-display')

  function getToken() {
    return localStorage.getItem('kings_admin_token')
  }

  function setToken(token) {
    localStorage.setItem('kings_admin_token', token)
  }

  function clearToken() {
    localStorage.removeItem('kings_admin_token')
  }

  function showDashboard(show) {
    if (!loginSection || !dashboardSection) return
    if (show) {
      loginSection.classList.add('hidden')
      dashboardSection.classList.remove('hidden')
    } else {
      loginSection.classList.remove('hidden')
      dashboardSection.classList.add('hidden')
    }
  }

  async function tryLoadContentForAdmin() {
    try {
      const res = await fetch('/api/content')
      if (!res.ok) return
      const data = await res.json()
      const { videos = [], images = [], highlights = [] } = data || {}
      if (overviewMediaCount) overviewMediaCount.textContent = String(videos.length + images.length)
      if (mediaPreview) {
        mediaPreview.textContent = JSON.stringify(data, null, 2)
      }
    } catch (err) {
      console.error('Failed to load admin content', err)
    }
  }

  function setActiveSection(name) {
    const sections = document.querySelectorAll('.dashboard-section')
    sections.forEach((s) => {
      s.classList.toggle('hidden', s.id !== `section-${name}`)
    })

    if (!sidebarNav) return
    const buttons = sidebarNav.querySelectorAll('button[data-section]')
    buttons.forEach((btn) => {
      if (btn.dataset.section === name) {
        btn.classList.add('bg-slate-900/70', 'border-slate-700/80', 'text-slate-200')
        btn.classList.remove('hover:bg-slate-900/60', 'text-slate-300')
      } else {
        btn.classList.remove('bg-slate-900/70', 'border-slate-700/80', 'text-slate-200')
        btn.classList.add('hover:bg-slate-900/60', 'text-slate-300')
      }
    })
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginForm || !loginStatus) return

    const formData = new FormData(loginForm)
    const payload = Object.fromEntries(formData.entries())

    loginStatus.textContent = 'Signing in...'
    loginStatus.classList.remove('text-emerald-300')
    loginStatus.classList.add('text-slate-300')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Invalid credentials')
      }

      setToken(data.token)
      loginStatus.textContent = ''
      showDashboard(true)
      setActiveSection('overview')
      tryLoadContentForAdmin()
    } catch (err) {
      console.error(err)
      loginStatus.textContent = 'Login failed. Check username/password from .env.'
      loginStatus.classList.remove('text-slate-300')
      loginStatus.classList.add('text-red-300')
    }
  }

  function buildLineItemRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td class="px-2 py-1">
        <input name="description" class="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-[11px] text-slate-50" />
      </td>
      <td class="px-2 py-1 text-right">
        <input name="quantity" type="number" step="0.01" value="1"
          class="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-[11px] text-right text-slate-50" />
      </td>
      <td class="px-2 py-1 text-right">
        <input name="rate" type="number" step="0.01" value="0"
          class="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-[11px] text-right text-slate-50" />
      </td>
      <td class="px-2 py-1 text-right align-middle">
        <span class="amount-display">0.00</span>
      </td>
      <td class="px-2 py-1 text-center align-middle">
        <button type="button" class="remove-item text-[11px] text-slate-400 hover:text-red-300">×</button>
      </td>
    `
    return tr
  }

  function recalcTotals() {
    if (!lineItemsBody || !subtotalDisplay || !taxDisplay || !totalDisplay) return

    let subtotal = 0
    const rows = lineItemsBody.querySelectorAll('tr')
    rows.forEach((tr) => {
      const qtyInput = tr.querySelector('input[name="quantity"]')
      const rateInput = tr.querySelector('input[name="rate"]')
      const amountSpan = tr.querySelector('.amount-display')
      const qty = parseFloat(qtyInput && qtyInput.value ? qtyInput.value : '0') || 0
      const rate = parseFloat(rateInput && rateInput.value ? rateInput.value : '0') || 0
      const amount = qty * rate
      subtotal += amount
      if (amountSpan) amountSpan.textContent = amount.toFixed(2)
    })

    const tax = 0
    const total = subtotal + tax
    subtotalDisplay.textContent = subtotal.toFixed(2)
    taxDisplay.textContent = tax.toFixed(2)
    totalDisplay.textContent = total.toFixed(2)
  }

  function ensureAtLeastOneRow() {
    if (!lineItemsBody) return
    if (!lineItemsBody.querySelector('tr')) {
      lineItemsBody.appendChild(buildLineItemRow())
    }
    recalcTotals()
  }

  async function handleMediaSubmit(e) {
    e.preventDefault()
    if (!mediaForm || !mediaStatus) return

    const fd = new FormData(mediaForm)
    const videoUrl = fd.get('videoUrl')
    const imageUrl = fd.get('imageUrl')
    const highlight = fd.get('highlight')

    mediaStatus.textContent = 'Saving...'

    try {
      const resExisting = await fetch('/api/content')
      const existing = resExisting.ok ? await resExisting.json() : { videos: [], images: [], highlights: [] }

      const updated = {
        videos: [...(existing.videos || [])],
        images: [...(existing.images || [])],
        highlights: [...(existing.highlights || [])]
      }

      if (videoUrl) updated.videos.push(String(videoUrl))
      if (imageUrl) updated.images.push(String(imageUrl))
      if (highlight) updated.highlights.push(String(highlight))

      const token = getToken()
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(updated)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      mediaStatus.textContent = 'Saved successfully.'
      mediaStatus.classList.remove('text-red-300')
      mediaStatus.classList.add('text-emerald-300')
      if (mediaPreview) mediaPreview.textContent = JSON.stringify(data.content || updated, null, 2)
      mediaForm.reset()
    } catch (err) {
      console.error(err)
      mediaStatus.textContent = 'Could not save – please check server is running and login is valid.'
      mediaStatus.classList.remove('text-emerald-300')
      mediaStatus.classList.add('text-red-300')
    }
  }

  async function handleBillingSubmit(e) {
    e.preventDefault()
    if (!billingForm || !billingStatus) return

    billingStatus.textContent = 'Generating PDF...'
    billingStatus.classList.remove('text-red-300')
    billingStatus.classList.add('text-slate-300')

    const formData = new FormData(billingForm)
    const payload = Object.fromEntries(formData.entries())

    const lineItems = []
    if (lineItemsBody) {
      const rows = lineItemsBody.querySelectorAll('tr')
      rows.forEach((tr) => {
        const descriptionInput = tr.querySelector('input[name="description"]')
        const qtyInput = tr.querySelector('input[name="quantity"]')
        const rateInput = tr.querySelector('input[name="rate"]')
        const description = descriptionInput && descriptionInput.value ? descriptionInput.value.trim() : ''
        if (!description) return
        const quantity = qtyInput && qtyInput.value ? qtyInput.value : '0'
        const rate = rateInput && rateInput.value ? rateInput.value : '0'
        lineItems.push({
          description,
          quantity,
          rate
        })
      })
    }

    payload.lineItems = lineItems

    if (!payload.clientName || lineItems.length === 0) {
      billingStatus.textContent = 'Please add client name and at least one line item.'
      billingStatus.classList.remove('text-slate-300')
      billingStatus.classList.add('text-red-300')
      return
    }

    try {
      const res = await fetch('/api/bill/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate PDF')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const type = payload.type === 'quotation' ? 'quotation' : 'invoice'
      link.href = url
      link.download = `${type}-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      billingStatus.textContent = 'PDF ready – downloaded to your device.'
      billingStatus.classList.remove('text-red-300')
      billingStatus.classList.add('text-emerald-300')
    } catch (err) {
      console.error(err)
      billingStatus.textContent = 'Could not generate PDF. Check server is running.'
      billingStatus.classList.remove('text-emerald-300')
      billingStatus.classList.add('text-red-300')
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin)
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken()
      showDashboard(false)
    })
  }

  if (backToSite) {
    backToSite.addEventListener('click', () => {
      window.location.href = '/'
    })
  }

  if (sidebarNav) {
    sidebarNav.addEventListener('click', (e) => {
      const target = e.target
      if (target && target.matches('button[data-section]')) {
        const section = target.dataset.section
        if (section) setActiveSection(section)
      }
    })
  }

  if (mediaForm) {
    mediaForm.addEventListener('submit', handleMediaSubmit)
  }

  if (addLineItemBtn) {
    addLineItemBtn.addEventListener('click', () => {
      if (!lineItemsBody) return
      lineItemsBody.appendChild(buildLineItemRow())
      recalcTotals()
    })
  }

  if (lineItemsBody) {
    lineItemsBody.addEventListener('input', (e) => {
      const target = e.target
      if (target && (target.name === 'quantity' || target.name === 'rate')) {
        recalcTotals()
      }
    })

    lineItemsBody.addEventListener('click', (e) => {
      const target = e.target
      if (target && target.classList.contains('remove-item')) {
        const row = target.closest('tr')
        if (row && lineItemsBody.children.length > 1) {
          row.remove()
          recalcTotals()
        }
      }
    })
  }

  if (billingForm) {
    billingForm.addEventListener('submit', handleBillingSubmit)
    ensureAtLeastOneRow()
  }

  const existingToken = getToken()
  if (existingToken) {
    showDashboard(true)
    setActiveSection('overview')
    tryLoadContentForAdmin()
  } else {
    showDashboard(false)
  }
})()

