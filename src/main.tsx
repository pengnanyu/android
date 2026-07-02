import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { isWeb } from './utils/platform';
import './styles/globals.css';
import './styles/breakpoints.css';
import './styles/card.css';
import './styles/themes/light.css';
import './styles/themes/dark.css';
import './i18n';

document.documentElement.setAttribute('data-theme', 'light');

function setupViewportUnit() {
  const update = () => {
    const vh = window.visualViewport ? window.visualViewport.height * 0.01 : window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  update();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', update);
    window.visualViewport.addEventListener('scroll', update);
  } else {
    window.addEventListener('resize', update);
  }
}

function hideMobileAddressBar() {
  if (!/Mobi|Android/i.test(navigator.userAgent)) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.documentElement.style.height = 'calc(var(--vh, 1vh) * 100 + 1px)';
      window.scrollTo(0, 1);
    }, 100);
  });
}

function showViewportDebug() {
  if (!/Mobi|Android/i.test(navigator.userAgent)) return;
  const panel = document.createElement('div');
  panel.id = 'vp-debug';
  panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(0,0,0,0.85);color:#0f0;font:11px/1.4 monospace;padding:6px 10px;pointer-events:none;';
  document.body.appendChild(panel);

  const update = () => {
    const de = document.documentElement;
    const body = document.body;
    const vv = window.visualViewport;
    const cs = (el: Element) => {
      const s = getComputedStyle(el);
      return { overflow: s.overflow, overflowY: s.overflowY, height: s.height, position: s.position };
    };
    const htmlCs = cs(de);
    const bodyCs = cs(body);
    const rootEl = document.getElementById('root');
    const rootCs = rootEl ? cs(rootEl) : null;

    const lines = [
      `innerH=${window.innerHeight} scrollY=${window.scrollY}`,
      `vv.height=${vv?.height} vv.offsetTop=${vv?.offsetTop}`,
      `--vh=${de.style.getPropertyValue('--vh') || 'N/A'}`,
      `html: overflow=${htmlCs.overflow}/${htmlCs.overflowY} h=${htmlCs.height}`,
      `body: overflow=${bodyCs.overflow}/${bodyCs.overflowY} h=${bodyCs.height}`,
      `#root: overflow=${rootCs?.overflow}/${rootCs?.overflowY} h=${rootCs?.height}`,
      `docScrollable=${document.documentElement.scrollHeight > window.innerHeight} scrollH=${document.documentElement.scrollHeight}`,
      `standalone=${window.matchMedia('(display-mode: standalone)').matches}`,
    ];
    panel.textContent = lines.join('\n');
  };

  update();
  setInterval(update, 1000);
  window.addEventListener('resize', update);
  window.addEventListener('scroll', update);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', update);
    window.visualViewport.addEventListener('scroll', update);
  }
}

setupViewportUnit();
hideMobileAddressBar();
showViewportDebug();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (isWeb() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { });
  });
}