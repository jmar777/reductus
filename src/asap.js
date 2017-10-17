export default window.requestAnimationFrame ?
    fn => window.requestAnimationFrame(fn) :
    fn => setTimeout(fn, 0);
