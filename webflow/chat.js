// chat.js
// Depends on: window.supabaseClient and RV_UTILS
// Assumes elements: #chatForm, #chatInput, #chatList
// Single room 'lobby' by default.

(function (global) {
  const supabase = window.supabaseClient;
  const { sanitize, createThrottler, appendTextNode } = global.RV_UTILS;

  const ROOM = 'lobby';
  // Chat throttle: 1 message per 3 seconds
  const chatThrottler = createThrottler(3000);
  let channel = null;

  async function loadRecent() {
    const list = document.getElementById('chatList');
    if (!list) return;
    list.innerHTML = '<em>Loading chat...</em>';

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id,content,created_at,room_id')
      .eq('room_id', ROOM)
      .order('created_at', { ascending: true })
      .limit(200);

    list.innerHTML = '';
    if (error) {
      appendTextNode(list, 'Failed to load chat.', 'error');
      console.error(error);
      return;
    }
    if (!data || data.length === 0) {
      appendTextNode(list, 'No messages yet.', 'muted');
      return;
    }
    data.forEach(msg => {
      const when = new Date(msg.created_at).toLocaleTimeString();
      const el = document.createElement('div');
      el.className = 'chat-message';
      el.textContent = `[${when}] ${msg.content}`;
      list.appendChild(el);
    });
    // Scroll to bottom
    list.scrollTop = list.scrollHeight;
  }

  function handleIncoming(payload) {
    try {
      const list = document.getElementById('chatList');
      if (!list) return;
      const msg = payload.new;
      const when = new Date(msg.created_at).toLocaleTimeString();
      const el = document.createElement('div');
      el.className = 'chat-message';
      el.textContent = `[${when}] ${msg.content}`;
      list.appendChild(el);
      // keep a reasonable max children length
      while (list.children.length > 500) list.removeChild(list.children[0]);
      list.scrollTop = list.scrollHeight;
    } catch (err) {
      console.error('Error handling incoming chat payload', err);
    }
  }

  async function subscribe() {
    if (channel) return;
    // Supabase v2 realtime subscription using postgres_changes
    channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${ROOM}` },
        (payload) => handleIncoming(payload)
      )
      .subscribe((status) => {
        // status can be 'SUBSCRIBED', 'ERROR', 'TIMED_OUT', etc.
        console.log('chat subscription status', status);
      });
  }

  async function submitChat(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input) return;
    const raw = input.value || '';
    const content = sanitize(raw, 500);
    if (!content) {
      alert('Please type a message.');
      return;
    }
    if (!chatThrottler.allow()) {
      alert('You are sending messages too quickly. Please slow down.');
      return;
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert([{ content, room_id: ROOM }]);

    if (error) {
      console.error('Chat insert error', error);
      alert(error.message || 'Failed to send message.');
      return;
    }
    input.value = '';
  }

  function init() {
    document.addEventListener('DOMContentLoaded', async () => {
      const form = document.getElementById('chatForm');
      if (form) form.addEventListener('submit', submitChat);

      await loadRecent();
      await subscribe();
    });
  }

  // Expose for debugging
  global.RV_CHAT = {
    init, loadRecent, subscribe, submitChat
  };

  init();
})(window);
