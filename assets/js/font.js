"use strict"

const font_size_select = document.getElementById("font-size-select")
const font_config = load_font_config()

document.documentElement.style.fontSize = font_config.font_size
font_size_select.addEventListener("change", change_font_size)

const select_options = Array.from(font_size_select.querySelectorAll("option"))
const selected_option = select_options.find(option => option.value === font_config.font_size)
selected_option.setAttribute("selected", "")

// Functions:

function change_font_size(change_ev) {
   const percentage = change_ev.target.value
   document.documentElement.style.fontSize = percentage
   font_config.font_size = percentage
   save_font_config()
}

function load_font_config() {
   let font_config = localStorage.getItem("didache_font_config")
   if (font_config === null || font_config === undefined)
   {
      return { font_size: "100%" }
   }
   font_config = JSON.parse(font_config)
   return font_config
}

function save_font_config() {
   localStorage.setItem("didache_font_config", JSON.stringify(font_config))
}
