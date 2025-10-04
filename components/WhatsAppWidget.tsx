      {ready && showBubble ? (
        <div className="fixed z-50 max-w-xs text-sm" style={{ right: 28, bottom: 128 }} role="dialog" aria-label="Bot message">
          <div className="chat-bubble shadow-lg">
            <div className="chat-meta">
              <span className="chat-name">Showtime Bot</span>
              <span className="chat-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="chat-text">{t.bubble}</div>
            <button
              onClick={closeBubble}
              aria-label="Cerrar"
              className="chat-close"
            >
              ×
            </button>
          </div>
        </div>
       ) : null}
       <style jsx>{`
         .chat-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
         .chat-name { font-weight: 700; font-size: 0.8rem; color: #111827; opacity: 0.9; }
         .chat-time { font-size: 0.75rem; color: #6b7280; } /* gray-500 */
         .chat-text { font-size: 0.95rem; line-height: 1.25rem; }
         .chat-close {
           position: absolute;
           top: -8px; right: -8px;
           background: #111827; /* gray-900 */
           color: #fff;
           width: 20px; height: 20px;
           border-radius: 9999px;
           font-size: 12px;
           line-height: 18px;
         }
