const MIN_SPEAK_INTERVAL_MS = 1200

let lastSpokenText = ''
let lastSpokenAt = 0

function resolveVoice() {
  const voices = window.speechSynthesis.getVoices()
  const ptBrVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('pt-br'))
  return ptBrVoice ?? null
}

export function canUseSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakTranslation(text: string) {
  if (!text || !canUseSpeechSynthesis()) {
    return
  }

  const now = Date.now()
  if (text === lastSpokenText && now - lastSpokenAt < MIN_SPEAK_INTERVAL_MS) {
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = 0.95
  utterance.pitch = 1
  utterance.voice = resolveVoice()

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)

  lastSpokenText = text
  lastSpokenAt = now
}
