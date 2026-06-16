import { links } from '../data/projectContent.js';

export default function Footer() {
  return (
    <footer className="footer">
      <p>From Data to Discovery — Lessons from the Titanic Project</p>
      <div>
        <a href={links.colab} target="_blank" rel="noreferrer">Open in Colab</a>
        <a href={links.notebook} target="_blank" rel="noreferrer">View Notebook</a>
        <a href={links.github} target="_blank" rel="noreferrer">GitHub Repository</a>
      </div>
    </footer>
  );
}
