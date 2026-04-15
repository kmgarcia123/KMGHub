'use client';
// src/components/layout/WhatsAppBot.tsx
import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '573000000000';

interface Message { id: number; text: string; isBot: boolean; time: string; }

const BOT_RESPONSES: Record<string, string> = {
  envio:   '📦 Enviamos a todo Colombia en 24-48h hábiles.\n• Bogotá: $8.000\n• Otras ciudades: $12.000\n• Compras +$100.000: ¡ENVÍO GRATIS! 🎉',
  precio:  '💰 Nuestros pocillos están entre $32.000 y $45.000.\nAlgunos están en oferta por tiempo limitado 🔥\n¿Quieres info de un personaje específico?',
  pedido:  '📋 Para consultar tu pedido necesito tu número de orden (ej: MH-2025-12345).\nEscríbelo y lo reviso enseguida.',
  pago:    '💳 Aceptamos:\n• Wompi (todas las tarjetas)\n• PSE\n• Nequi / Daviplata\n• Contraentrega (Bogotá)',
  batman:  '🦇 ¡Sí tenemos el pocillo de Batman!\nPrecio: $38.000 (antes $45.000)\nStock disponible ✅\n¿Lo quieres apartar?',
  marvel:  '🕷️ Tenemos varios pocillos Marvel:\n• Spider-Man — $38.000\n• Iron Man — $42.000\n• Capitán América — $38.000\nTodos disponibles ✅',
  default: '¡Gracias por escribirnos! 🙏 Un asesor te responderá pronto. También puedes ver todos nuestros productos en el catálogo.',
};

const QUICK_OPTIONS = [
  { label: '🚚 Envíos',     key: 'envio' },
  { label: '💰 Precios',    key: 'precio' },
  { label: '💳 Pagos',      key: 'pago' },
  { label: '📦 Mi pedido',  key: 'pedido' },
  { label: '🦇 Batman',     key: 'batman' },
  { label: '👤 Asesor',     key: 'human' },
];

const getTime = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

export default function WhatsAppBot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([
    { id: 1, text: '¡Hola! 👋 Soy el asistente de MugHero.\n¿En qué te puedo ayudar hoy?', isBot: true, time: getTime() },
  ]);
  const [input, setInput]         = useState('');
  const [showQuick, setShowQuick] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMsg = (text: string, isBot: boolean) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isBot, time: getTime() }]);
  };

  const handleQuick = (key: string) => {
    if (key === 'human') {
      const label = '👤 Hablar con un asesor';
      addMsg(label, false);
      setShowQuick(false);
      setTimeout(() => {
        addMsg('¡Con mucho gusto! Te conecto con nuestro equipo ahora mismo... 🙋', true);
        setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}?text=Hola, quiero hablar con un asesor de MugHero`, '_blank'), 1200);
      }, 600);
      return;
    }
    const label = QUICK_OPTIONS.find(o => o.key === key)?.label || key;
    addMsg(label, false);
    setShowQuick(false);
    setTimeout(() => addMsg(BOT_RESPONSES[key] || BOT_RESPONSES.default, true), 700);
  };

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    addMsg(txt, false);
    setInput('');
    setShowQuick(false);

    setTimeout(() => {
      const lower = txt.toLowerCase();
      let reply = BOT_RESPONSES.default;
      if (lower.includes('envio') || lower.includes('envío') || lower.includes('domicilio')) reply = BOT_RESPONSES.envio;
      else if (lower.includes('precio') || lower.includes('vale') || lower.includes('costo') || lower.includes('cuánto')) reply = BOT_RESPONSES.precio;
      else if (lower.includes('pago') || lower.includes('pagar') || lower.includes('tarjeta')) reply = BOT_RESPONSES.pago;
      else if (lower.includes('pedido') || lower.includes('orden') || lower.includes('compra')) reply = BOT_RESPONSES.pedido;
      else if (lower.includes('batman')) reply = BOT_RESPONSES.batman;
      else if (lower.includes('marvel') || lower.includes('spider') || lower.includes('iron')) reply = BOT_RESPONSES.marvel;
      addMsg(reply, true);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat bubble */}
      {isOpen && (
        <div className="w-80 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">

          {/* Header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-400 flex items-center justify-center text-lg">🦸</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">MugHero · Soporte</p>
              <p className="text-green-200 text-xs">🟢 En línea</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-neutral-950/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${
                  msg.isBot
                    ? 'bg-neutral-800 text-dark-50 rounded-tl-sm'
                    : 'bg-[#005C4B] text-white rounded-tr-sm'
                }`}>
                  {msg.text}
                  <div className={`text-xs mt-1 ${msg.isBot ? 'text-neutral-500' : 'text-green-200/60'}`}>{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick options */}
          {showQuick && (
            <div className="px-3 py-2 border-t border-neutral-800 flex flex-wrap gap-1.5">
              {QUICK_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => handleQuick(opt.key)}
                  className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full transition-colors">
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2 border-t border-neutral-800 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-2 text-sm outline-none focus:border-green-500 text-dark-50 placeholder-neutral-500"
            />
            <button onClick={handleSend}
              className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-green-400 transition-colors shrink-0">
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-green-400 transition-all active:scale-95 shadow-lg shadow-green-900/40 flex items-center justify-center"
        aria-label="Chat WhatsApp"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
