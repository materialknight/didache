"use strict"

const toc = document.getElementById("toc")
const headings = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")

const headings_observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
      const heading_id = entry.target.id
      const toc_link = toc.querySelector(`a[href="#${heading_id}"]`)
      const toc_li = toc_link.closest("li")
      if (entry.isIntersecting)
      {
         toc_li.classList.add("visible_toc_entry")
      }
      else
      {
         toc_li.classList.remove("visible_toc_entry")
      }
   })
})

headings.forEach(heading => {
   headings_observer.observe(heading)
})
