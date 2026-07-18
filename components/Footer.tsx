// SamsunKent footer — sosyal butonlar.
// URL'leri kendi hesaplarınla değiştir (handle: @samsunkentcom).
const INSTAGRAM_URL = "https://www.instagram.com/samsunkentcom";
const TIKTOK_URL = "https://www.tiktok.com/@samsunkentcom";
const YOUTUBE_URL = "https://www.youtube.com/@samsunkentcom";

export default function Footer() {
  return (
    <footer className="foot">
      <a className="social instagram" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zM12 7.2A4.8 4.8 0 1012 16.8 4.8 4.8 0 0012 7.2zm0 7.9a3.1 3.1 0 110-6.2 3.1 3.1 0 010 6.2zm5-8.1a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z" />
        </svg>
        Instagram
      </a>
      <a className="social tiktok" href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.5 3c.3 2.1 1.5 3.4 3.5 3.6v2.4c-1.2.1-2.3-.3-3.5-1v6.3c0 3.5-2.8 5.9-5.9 5.7-3-.2-5.1-2.7-4.8-5.8.3-2.8 2.7-4.7 5.4-4.4v2.5c-.5-.1-1-.2-1.5-.1-1.2.2-2 1.1-1.9 2.3.1 1.2 1.1 2 2.3 1.9 1.2-.1 2-1 2-2.3V3h2.9z" />
        </svg>
        TikTok
      </a>
      <a className="social youtube" href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23 12c0-1.9-.2-3.3-.4-4.2-.2-.9-.9-1.6-1.8-1.8C19 5.6 12 5.6 12 5.6s-7 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1.2 8.7 1 10.1 1 12s.2 3.3.4 4.2c.2.9.9 1.6 1.8 1.8 1.8.4 8.8.4 8.8.4s7 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.2-.9.4-2.3.4-4.2zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z" />
        </svg>
        YouTube
      </a>
      <span className="foot-note">© {new Date().getFullYear()} samsunkent</span>
    </footer>
  );
}
