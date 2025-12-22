"use strict"

const toc = document.getElementById("toc")
const text_sections = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6, p"))
// const headings = text_sections.filter(txt_sec => /^h[1-6]$/i.test(txt_sec.tagName))

// Map every <p>, <h1>, <h2>, etc. to a <li> in the table of contents.
const zip = []
let toc_heading = null
let href = window.location.pathname.split("/").at(-1)
for (const txt_section of text_sections)
{
   if (/^h1$/i.test(txt_section.tagName)) // txt_section is <h1>
   {
      toc_heading = toc.querySelector(`[href="${href}"]`)?.closest("li")
   }
   else if (/^h[2-6]$/i.test(txt_section.tagName))// txt_section is <h2>, <h3>... or <h6>
   {
      const toc_li = toc.querySelector(`[href="${href}#${txt_section.id}"]`)?.closest("li")
      if (toc_li)
      {
         toc_heading = toc_li
      }
   }
   if (toc_heading)
   {
      zip.push([txt_section, toc_heading])
   }
}

const toc_map = new Map(zip)
const headings = Array.from(toc_map.keys())
let cleanup = []

window.addEventListener("scrollend", mark_toc)
toc.addEventListener("toggle", scroll_toc)

mark_toc()

function mark_toc() {
   // De-highlight from the table of contents all previously highlighted <li>.
   cleanup.forEach(li => {
      li.classList.remove("visible_toc_entry")
   })
   // Collect headings within viewport.
   const visible_headings = headings.filter(heading => {
      const rect = heading.getBoundingClientRect()
      return rect.top >= -5 && rect.bottom <= window.innerHeight
   })

   // Highlight in the table of contents all visible headings.
   console.log(visible_headings) // modify below:
   cleanup = visible_headings.map(heading => {
      const toc_li = toc_map.get(heading)
      toc_li.classList.add("visible_toc_entry")
      return toc_li
   })
   // If any heading was highlighted, there's nothing else to do.
   if (visible_headings.length > 0) return
   // Get the index of 1st element below the viewport's top, even if it goes past the viewport's bottom.
   const txt_elem_i = text_sections.findIndex(txt_sec => {
      const rect = txt_sec.getBoundingClientRect()
      return rect.top >= 0
   })
   // Get the last heading that is before the 1st visible element.
   const current_heading = text_sections
      .filter((txt_elem, i) => /^h[1-6]$/i.test(txt_elem.tagName) && parseInt(i) <= parseInt(txt_elem_i))
      .at(-1)

   if (current_heading)
   {
      const toc_li = toc_map.get(current_heading)
      toc_li.classList.add("visible_toc_entry")
      cleanup.push(toc_li)
   }
   else
   {
      console.warn("There seems to be some <p> before the <h1>.")
   }
}

function scroll_toc(toggle_ev) {
   if (toggle_ev.newState === "open")
   {
      toc.querySelector(".visible_toc_entry").scrollIntoView({ block: "center" })
   }
}
