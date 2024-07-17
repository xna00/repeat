const { readFileSync } = require('fs');

(async () => {
  const dict = await fetch("https://cn.bing.com/dict/search?q=" + "repeat");
  const text = await dict.text();
  // const text = readFileSync('/tmp/e.html', { encoding: 'utf8' })
  console.log(text.match(/hd_prUS b_primtxt.+?\[(.+?)\]/))
  console.log([...text.matchAll(/<span class="pos.*?">(.+?)<\/span><span class="def b_regtxt"><span>(.+?)<\/span><\/span>/g)])
  // const dom = new JSDOM(text);
  // console.log(dom.window.document.body.querySelector('.qdef .hd_prUS')?.textContent);
})()