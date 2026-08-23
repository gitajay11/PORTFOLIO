import { profile } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <span>
        &copy; {new Date().getFullYear()} {profile.shortName}
      </span>
      <span className="footer__mid">next.js &mdash; no ui libraries</span>
      <a href="#top" className="footer__top">
        back to top &#8593;
      </a>
    </footer>
  );
}
