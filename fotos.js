const FOTO_JUEGO = '5bf9771fdf528ef3c1c33a3c21b78fcd.jpg';
const FOTO_CAJA = '0143be3c29a332a7b72af2691b6207ad.jpg';

document.querySelectorAll('.game-banner-card').forEach(e => {
  e.style.backgroundImage = `linear-gradient(180deg,rgba(3,6,20,.1) 0%,rgba(3,6,20,.85) 100%),url('${FOTO_JUEGO}')`;
  e.style.backgroundPosition = 'center 8%';
});

document.querySelectorAll('.pk img').forEach(i => {
  i.onerror = () => { i.onerror = null; i.src = FALLBACK; };
  i.src = FOTO_CAJA;
});
