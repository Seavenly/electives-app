import fs from 'fs';
import path from 'path';

import { Logs, Log } from './logger';

let body: string = '';
const style: string = `<style>
  * {
    margin: 0;
    padding: 0;
  }
  body {
    background: #2d2d2d;
    font-family: 'Roboto', sans-serif;
  }
  div.container {
    max-width: 70rem;
    margin: auto;
  }
  header {
    text-align:center;
    background: #888;
    position: fixed;
    max-width: 70rem;
    width: 100%;
    z-index: 2;
  }
  h1 {
    background: #2196F3;
    color: white;
    padding: 0.3rem;
    font-size: 1.6rem;
  }
  div.links { position: relative; }
  div.links li {
    display: inline-block;
  }
  div.links li a {
    display: block;
    padding: 0.3rem 1rem;
    text-decoration: none;
    color: white;
  }
  div.links li a:hover { text-decoration: underline; }
  div.links input {
    position: absolute;
    right: 0.3rem;
    bottom: 116%;
  }
  div.anchor {
    position: relative;
    top: -4.3rem;
  }
  li.head:first-child div.anchor { top: -10rem; }
  div.log {
    background: #444;
    color: white;
    margin-bottom: 2rem;
    padding-top: 4rem;
  }
  div.log li { border-bottom: 1px solid #555; }
  li {
    display: flex;
    align-items: flex-start;
    color: #FFC107;
    position: relative;
  }
  li span { padding: 0 1rem; }
  span.c1 { flex: 1; align-self: stretch; text-align: right; background: #555; }
  span.c2 { flex: 2; text-align: right; font-weight: bold; }
  span.c3 { flex: 20; padding: 0 2rem 0 0; }
  li:first-child span.c1 { padding-top: 2rem; }
  li:first-child { align-items: flex-end; }
  li:last-child span.c1 { padding-bottom: 2rem; }
  li span.c1 { color: #ccc; }
  li.head { color: white; }
  li.text { color: #B3E5FC; }
  li.head span.c3 { font-weight: bold; }
  li.info { color: #00BCD4; }
  li.success { color: #8BC34A; }
  li.error { color: #f44336; }
  div.log li:hover:after {
    content: '';
    position: absolute;
    display: block;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1;
    background: rgba(255,255,255,0.1);
    pointer-events: none;
  }
  div.top { text-align: center; padding: 0.5rem 0; background: #888; }
  div.top a { color: white; }
</style>`;

export default (logs: Logs): void => {
  let links: string = '';

  logs.forEach((line, index) => {
    let anchor: string = '';
    const [type, message]: [string, string] = line;

    if (type === Log.HEAD) {
      const id = message.replace(/ /g, '-').toLowerCase();
      links += `
        <li>
          <a href="#${id}">
            ${message.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </a>
        </li>
      `;
      anchor = `<div id="${id}" class="anchor"></div>`;
    }
    body += `
      <li class="${type.toLowerCase()}">
        ${anchor}
        <span class="c1">
          ${index + 1}
        </span>
        <span class="c2">
          ${type}
        </span>
        <span class="c3">${
          type === Log.HEAD ? `=== ${message} ===` : message
        }</span>
      </li>
    `;
  });

  const listjs: Buffer = fs.readFileSync(
    path.resolve('node_modules/list.js/dist/list.min.js'),
  );
  const [, month, day, year]: string[] = new Date().toDateString().split(' ');
  fs.writeFileSync(
    `${process.env.HOME}/electives_log_${year.slice(2)}${month}${day}.html`,
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Electives Log</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700" rel="stylesheet"> 
        ${style}
      </head>
      <body id="top">
        <div id="log" class="container">
          <header>
            <h1>Electives Log</h1>
            <div class="links">
              <ul>${links}</ul>
              <input class="search" placeholder="Filter Log" />
            </div>
          </header>
          <div class="log">
            <ul class="list">
              ${body}
            </ul>
            <div class="top">
              <a href="#top">Back to the top</a>
            </div>
          </div>
        </div>
        <script type="text/javascript">
          ${listjs}
        </script>
        <script type="text/javascript">
          var list = new List('log', { valueNames: ['c2', 'c3'] });
          list.on('updated', function() {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
          });
        </script>
      </body>
    </html>`,
  );
};
