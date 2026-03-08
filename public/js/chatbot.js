;(function () {
  const FAQS = [
    {
      keywords: ['treadmill', 'maintenance', 'service'],
      answer:
        'For treadmills we recommend preventive service every 2–3 months in commercial gyms and every 4–6 months in society / home gyms. This includes cleaning, belt alignment, lubrication, motor and deck checks.'
    },
    {
      keywords: ['amc', 'contract', 'annual'],
      answer:
        "KING'S FITNESS provides customised AMC plans for treadmills, cross trainers, bikes and strength machines. Share your equipment list on WhatsApp and we will suggest an AMC plan and quotation."
    },
    {
      keywords: ['setup', 'new gym', 'open gym', 'start gym'],
      answer:
        'For a new gym setup we help with layout design, equipment selection (premium & budget), flooring, mirrors and staffing. You can start by sharing your area (sq.ft) and budget and we will guide you.'
    },
    {
      keywords: ['apps', 'software', 'member app'],
      answer:
        'We can guide you on popular gym management apps for member check-in, plans, renewals and workout tracking. During consultation we will suggest options that match your gym size and budget.'
    },
    {
      keywords: ['manpower', 'trainer', 'reception', 'staff', 'manager'],
      answer:
        "KING'S FITNESS can support with certified trainers, reception/front desk team and experienced managers so your gym runs smoothly. Share your location and timing and we will suggest options."
    },
    {
      keywords: ['contact', 'phone', 'call', 'whatsapp'],
      answer:
        'You can call +91-8850081223 or +91-9321859324, or WhatsApp us using the green buttons on the site. Primary email is rajsakpal4@gmail.com.'
    }
  ]

  function getBotReply(message) {
    if (!message) {
      return "Hi! I'm the KING'S FITNESS assistant. Ask me about gym equipment, AMC, repairs, new setups or manpower."
    }

    const text = message.toLowerCase()

    for (const faq of FAQS) {
      if (faq.keywords.some((k) => text.includes(k))) {
        return faq.answer
      }
    }

    return "Thank you for your question. For detailed guidance it is best if we speak directly. Please use the WhatsApp or Call buttons on the site and we will help you personally."
  }

  function createChatbot() {
    const root = document.getElementById('chatbot-root')
    if (!root) return

    root.innerHTML = `
      <div class="fixed bottom-3 right-3 md:bottom-4 md:right-4 z-40">
        <div id="chatbot-panel" class="hidden flex-col w-72 md:w-80 max-h-[70vh] md:h-96 rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40 overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-gradient-to-r from-kingsRed to-red-700">
            <div>
              <p class="text-xs font-semibold text-white">KING'S FITNESS Assistant</p>
              <p class="text-[10px] text-red-100">Gym equipment & setup questions</p>
            </div>
            <button id="chatbot-close" class="text-slate-100 hover:text-white text-lg leading-none">&times;</button>
          </div>
          <div id="chatbot-messages" class="flex-1 px-3 py-2 space-y-2 overflow-y-auto text-[11px] text-slate-100">
            <div class="flex justify-start">
              <div class="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-900/90 px-3 py-2">
                <p class="font-semibold text-[11px] text-red-200 mb-0.5">KING'S FITNESS</p>
                <p>Hi! I can help with gym equipment, AMC, repairs, new setups and manpower questions. What would you like to know?</p>
              </div>
            </div>
          </div>
          <form id="chatbot-form" class="border-t border-slate-800 px-2 py-2 flex items-center gap-2">
            <input id="chatbot-input" autocomplete="off" placeholder="Ask about equipment, AMC, apps..."
              class="flex-1 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-[11px] text-slate-50 placeholder-slate-500 focus:border-kingsRed focus:outline-none" />
            <button type="submit" class="rounded-full bg-kingsRed px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-700">
              Send
            </button>
          </form>
        </div>

        <button id="chatbot-toggle"
          class="flex items-center justify-center h-11 w-11 rounded-full bg-kingsRed text-xs font-semibold text-white shadow-lg shadow-red-900/50 hover:bg-red-700">
          ?
        </button>
      </div>
    `

    const panel = document.getElementById('chatbot-panel')
    const toggle = document.getElementById('chatbot-toggle')
    const closeBtn = document.getElementById('chatbot-close')
    const form = document.getElementById('chatbot-form')
    const input = document.getElementById('chatbot-input')
    const messages = document.getElementById('chatbot-messages')

    if (!panel || !toggle || !closeBtn || !form || !input || !messages) return

    toggle.addEventListener('click', () => {
      panel.classList.remove('hidden')
      toggle.classList.add('hidden')
      input.focus()
    })

    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden')
      toggle.classList.remove('hidden')
    })

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const text = input.value.trim()
      if (!text) return

      const userBubble = document.createElement('div')
      userBubble.className = 'flex justify-end'
      userBubble.innerHTML = `
        <div class="max-w-[80%] rounded-2xl rounded-br-sm bg-kingsRed/80 px-3 py-2 text-[11px]">
          <p>${text}</p>
        </div>
      `
      messages.appendChild(userBubble)

      const replyText = getBotReply(text)
      const botBubble = document.createElement('div')
      botBubble.className = 'flex justify-start'
      botBubble.innerHTML = `
        <div class="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-900/90 px-3 py-2 text-[11px]">
          <p class="font-semibold text-[11px] text-red-200 mb-0.5">KING'S FITNESS</p>
          <p>${replyText}</p>
        </div>
      `

      setTimeout(() => {
        messages.appendChild(botBubble)
        messages.scrollTop = messages.scrollHeight
      }, 400)

      input.value = ''
      messages.scrollTop = messages.scrollHeight
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbot)
  } else {
    createChatbot()
  }
})()

