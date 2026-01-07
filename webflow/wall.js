// wall.js (realtime)
// Depends on: window.supabaseClient and RV_UTILS
// Assumes elements: #wallForm, #wallInput, #wallList

(function (global) {
  const supabase = window.supabaseClient;
  const { sanitize, createThrottler, appendTextNode } = global.RV_UTILS;

  // Basic client throttle: 1 submission per 30 seconds
  const wallThrottler = createThrottler(30 * 1000);

  const MAX_ITEMS = 200;
  let wallChannel = null;

  function getList() {
    return document.getElementById("wallList");
  }

  function renderWallItem(item) {
    const node = document.createElement("div");
    node.className = "wall-item";
    node.dataset.id = item.id;

    const contentEl = document.createElement("div");
    contentEl.className = "wall-content";
    contentEl.textContent = item.content;

    const metaEl = document.createElement("div");
    metaEl.className = "wall-meta";
    metaEl.textContent = new Date(item.created_at).toLocaleString();

    node.appendChild(contentEl);
    node.appendChild(metaEl);
    return node;
  }

  function hasItem(id) {
    const list = getList();
    if (!list) return false;
    return Boolean(list.querySelector(`[data-id="${id}"]`));
  }

  function removeItem(id) {
    const list = getList();
    if (!list) return;
    const el = list.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
  }

  function prependItem(item) {
    const list = getList();
    if (!list) return;

    if (hasItem(item.id)) return;

    const node = renderWallItem(item);
    list.prepend(node);

    // Trim DOM to MAX_ITEMS
    while (list.children.length > MAX_ITEMS) {
      list.removeChild(list.lastElementChild);
    }
  }

  function updateOrInsert(item) {
    const list = getList();
    if (!list) return;

    const existing = list.querySelector(`[data-id="${item.id}"]`);
    if (!existing) {
      prependItem(item);
      return;
    }

    // Update content/meta if it already exists
    const contentEl = existing.querySelector(".wall-content");
    const metaEl = existing.querySelector(".wall-meta");
    if (contentEl) contentEl.textContent = item.content;
    if (metaEl) metaEl.textContent = new Date(item.created_at).toLocaleString();
  }

  async function loadWall() {
    const list = getList();
    if (!list) return;

    // Avoid innerHTML injection; "Loading..." is safe, but keep consistent
    list.textContent = "";
    const loading = document.createElement("em");
    loading.textContent = "Loading...";
    list.appendChild(loading);

    const { data, error } = await supabase
      .from("wall_items")
      .select("id,content,created_at,status")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(MAX_ITEMS);

    list.textContent = "";

    if (error) {
      appendTextNode(list, "Failed to load wall items.", "error");
      console.error(error);
      return;
    }
    if (!data || data.length === 0) {
      appendTextNode(list, "No items yet.", "muted");
      return;
    }

    for (const item of data) {
      const node = renderWallItem(item);
      list.appendChild(node);
    }
  }

  async function submitWall(event) {
    if (event) event.preventDefault();
    const input = document.getElementById("wallInput");
    if (!input) return;

    const raw = input.value || "";
    const content = sanitize(raw, 1000);

    if (!content) {
      alert("Please enter some text.");
      return;
    }
    if (!wallThrottler.allow()) {
      alert("Slow down: please wait before submitting again.");
      return;
    }

    // Insert with status 'pending' (RLS enforces this)
    const { error } = await supabase
      .from("wall_items")
      .insert([{ content, status: "pending" }]);

    if (error) {
      console.error("Wall insert error", error);
      alert(error.message || "Failed to submit. Try again later.");
      return;
    }

    input.value = "";
    alert("Thanks — your item is submitted and awaiting approval.");
  }

  function startRealtime() {
    // Prevent double-subscribing (Webflow can load scripts twice in some cases)
    if (wallChannel) return;

    wallChannel = supabase
      .channel("wall-items")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_items" },
        (payload) => {
          const item = payload.new;
          if (item && item.status === "approved") {
            prependItem(item);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wall_items" },
        (payload) => {
          const item = payload.new;
          const old = payload.old;

          if (!item) return;

          // If it became approved, show it
          const becameApproved =
            item.status === "approved" && (!old || old.status !== "approved");

          if (becameApproved) {
            prependItem(item);
            return;
          }

          // If it is approved and content changed, update it
          if (item.status === "approved") {
            updateOrInsert(item);
            return;
          }

          // If it was approved but is no longer approved, remove it
          const noLongerApproved =
            old && old.status === "approved" && item.status !== "approved";

          if (noLongerApproved) {
            removeItem(item.id);
          }
        }
      )
      .subscribe((status) => {
        // Optional: console.log("Wall realtime:", status);
      });
  }

  function stopRealtime() {
    if (!wallChannel) return;
    supabase.removeChannel(wallChannel);
    wallChannel = null;
  }

  function init() {
    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("wallForm");
      if (form) form.addEventListener("submit", submitWall);

      loadWall();
      startRealtime();
    });
  }

  // Expose control and helpers
  global.RV_WALL = {
    init,
    loadWall,
    submitWall,
    startRealtime,
    stopRealtime
  };

  init();
})(window);
