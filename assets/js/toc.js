"use strict"

const toc = document.getElementById("toc")
const headings = Array.from(document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"))
const text_sections = Array.from(document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], p[id]"))

const zip = []
let toc_heading = null
for (const txt_section of text_sections)
{
   // txt_section is <h1>, <h2>... or <h6>
   if (/h\d/i.test(txt_section.tagName))
   {
      toc_heading = toc.querySelector(`[href="#${txt_section.id}"]`).closest("li")
      zip.push([txt_section, toc_heading])
   }
   else // txt_section is a <p>
   {
      zip.push([txt_section, toc_heading])
   }
}
const toc_map = new Map(zip)
let cleanup = []

window.addEventListener("scrollend", () => {
   cleanup.forEach(li => {
      li.classList.remove("visible_toc_entry")
   })

   const visible_headings = headings.filter(heading => {
      const rect = heading.getBoundingClientRect()
      return rect.top >= -5 && rect.bottom <= window.innerHeight
   })

   cleanup = visible_headings.map(heading => {
      const toc_li = toc_map.get(heading)
      toc_li.classList.add("visible_toc_entry")
      return toc_li
   })

   if (visible_headings.length > 0) return

   let txt_elem = text_sections.find(txt_sec => {
      const rect = txt_sec.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
   })

   while (txt_elem = txt_elem.previousElementSibling)
   {
      if (/h\d/i.test(txt_elem.tagName))
      {
         const toc_li = toc_map.get(txt_elem)
         toc_li.classList.add("visible_toc_entry")
         cleanup.push(toc_li)
         break
      }
   }
})
