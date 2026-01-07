// wall.js
// Depends on: window.supabaseClient and RV_UTILS
// Assumes elements: #wallForm, #wallInput, #wallList

(function (global) {
  const supabase = window.supabaseClient;
  const { sanitize, createThrottler, appendTextNode } = global.RV_UTILS;

  // Basic client throttle: 1 submission per 30 seconds
  const wallThrottler = createThrottler(30 * 1000);

  async function loadWall() {
    const list = document.getElementById('wallList');
    if (!list) return;
    list.innerHTML = '<em>Loading...</em>';
    const { data, error } = await supabase
      .from('wall_items')
      .select('id,content,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(200);

    list.innerHTML = '';
    if (error) {
      appendTextNode(list, 'Failed to load wall items.', 'error');
      console.error(error);
      return;
    }
    if (!data || data.length === 0) {
      appendTextNode(list, 'No items yet.', 'muted');
      return;
    }
    data.forEach(item => {
      const node = document.createElement('div');
      node.className = 'wall-item';
      const when = new Date(item.created_at).toLocaleString();
      // Use textContent to avoid HTML injection
      node.textContent = `${item.content} — ${when}`;
      list.appendChild(node);
    });
  }

  async function submitWall(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('wallInput');
    if (!input) return;
    const raw = input.value || '';
    const content = sanitize(raw, 1000);
    if (!content) {
      alert('Please enter some text.');
      return;
    }
    if (!wallThrottler.allow()) {
      alert('Slow down: please wait before submitting again.');
      return;
    }

    // Insert with status 'pending' (RLS enforces this)
    const { error } = await supabase
      .from('wall_items')
      .insert([{ content, status: 'pending' }]);

    if (error) {
      console.error('Wall insert error', error);
      alert(error.message || 'Failed to submit. Try again later.');
      return;
    }

    input.value = '';
    alert('Thanks — your item is submitted and awaiting approval.');
  }

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('wallForm');
      if (form) form.addEventListener('submit', submitWall);

      // initial load
      loadWall();

      // Optionally poll every 30s for updates (wall is not realtime)
      setInterval(loadWall, 30 * 1000);
    });
  }

  // Expose for debugging and manual control
  global.RV_WALL = {
    init,
    loadWall,
    submitWall
  };

  init();
})(window);
