"use strict"

if ("serviceWorker" in navigator)
{
   try
   {
      navigator.serviceWorker.register("sw.js")
   } catch (error)
   {
      console.error(`Your browser seems to support service workers, but the registration of this app's worker failed with error: ${error}`)
   }
} else
{
   console.error("This app's service worker couldn't be installed because you're in Private Mode or your browser doesn't support service workers!")
}

let marked_verses = load_marked_verses()
const highlight_menu = document.getElementById("highlight-menu")
const color_picker = document.getElementById("color-picker")
const annotation_box = document.getElementById("annotation")
const reset_picker_btn = document.getElementById("reset-picker")
const close_btn = document.getElementById("close-btn")
let checked_radio_btn = null
let clicked_verse = null
let lastPointerUp = 0
const verses = Array.from(document.querySelectorAll("p[id]"))

verses.forEach(markable_elem => {
   markable_elem.addEventListener("pointerup", pointerup_ev => {
      const now = Date.now()
      if (now - lastPointerUp < 400)
      {
         open_highlight_menu(pointerup_ev)
         return
      }
      lastPointerUp = now
   })
})

color_picker.addEventListener("synch_picker", () => {
   const prev_selection = color_picker.querySelector(":checked")
   if (prev_selection)
   {
      prev_selection.checked = false
   }
   if (clicked_verse.dataset.color)
   {
      const new_selection = color_picker.querySelector(`[value=${clicked_verse.dataset.color}]`)
      if (new_selection)
      {
         new_selection.checked = true
      }
   }
})

reset_picker_btn.addEventListener("click", () => {
   clicked_verse.removeAttribute("data-color")
   marked_verses[clicked_verse.id].color = ""
   color_picker.dispatchEvent(new CustomEvent("synch_picker"))
   save_marked_verses()
})

annotation_box.addEventListener("synch_annotation", () => {
   annotation_box.value = marked_verses[clicked_verse.id].annotation
})

color_picker.querySelectorAll("[name=color]").forEach(color_input => {
   color_input.addEventListener("change", () => {
      clicked_verse.setAttribute("data-color", color_input.value)
      marked_verses[clicked_verse.id].color = color_input.value
      save_marked_verses()
   })
})

annotation_box.addEventListener("input", () => {
   marked_verses[clicked_verse.id].annotation = annotation_box.value.trim()
   if (marked_verses[clicked_verse.id].annotation)
   {
      clicked_verse.classList.add("outlined")
   }
   else
   {
      clicked_verse.classList.remove("outlined")
   }
})

annotation_box.addEventListener("change", save_marked_verses)

close_btn.addEventListener("click", () => {
   highlight_menu.hidePopover()
})

Object.keys(marked_verses).forEach(verse_id => {
   const verse_elem = document.getElementById(verse_id)
   if (marked_verses[verse_id].color)
   {
      verse_elem.setAttribute("data-color", marked_verses[verse_id].color)
   }
   if (marked_verses[verse_id].annotation)
   {
      verse_elem.classList.add("outlined")
   }
})

// Marked verses table of contents:

const marked_verses_toc = document.getElementById("verses-list")

marked_verses_toc.addEventListener("sync_marked_verses_toc", () => {
   marked_verses_toc.textContent = ""
   for (const verse of verses)
   {
      const verse_data = marked_verses[verse.id]
      if (!verse_data?.color && !verse_data?.annotation)
      {
         continue
      }
      const verse_clone = verse.cloneNode(true)
      verse_clone.removeAttribute("id")
      marked_verses_toc.appendChild(verse_clone)
   }
})

marked_verses_toc.dispatchEvent(new CustomEvent("sync_marked_verses_toc"))

// Functions:

function open_highlight_menu(dblclick_ev) {
   clicked_verse = dblclick_ev.target
   if (!marked_verses[clicked_verse.id])
   {
      marked_verses[clicked_verse.id] = { color: "", annotation: "" }
   }
   color_picker.dispatchEvent(new CustomEvent("synch_picker"))
   annotation_box.dispatchEvent(new CustomEvent("synch_annotation"))
   highlight_menu.showPopover()
   close_btn.focus()
}
function load_marked_verses() {
   let saved_verses = localStorage.getItem("didache_marked_verses")
   if (saved_verses === null || saved_verses === undefined)
   {
      return {}
   }
   saved_verses = JSON.parse(saved_verses)
   // Delete data-less keys:
   for (const id in saved_verses)
   {
      if (saved_verses[id].color === "" && saved_verses[id].annotation === "")
      {
         delete saved_verses[id]
      }
   }
   return saved_verses
}
function save_marked_verses() {
   marked_verses_toc.dispatchEvent(new CustomEvent("sync_marked_verses_toc"))
   localStorage.setItem("didache_marked_verses", JSON.stringify(marked_verses))
}
