import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/dracula.css'
import './styles.css'
import Reveal from 'reveal.js'
import RevealMarkdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import RevealMath from 'reveal.js/plugin/math/math.esm.js';
import markdownfile from './markdown.md'

document.querySelector('.reveal').innerHTML = `
      <div class="slides">
        <section data-markdown="${markdownfile}" data-separator="^\\r?\\n---\\r?\\n" data-separator-vertical="^\\r?\\n----\\r?\\n">
      </div>
`
Reveal.initialize({
    hash: true,
    width: 1920,
    height: 1080,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.0,
    slideNumber: false,
    plugins: [RevealMarkdown, RevealMath.KaTeX]
});