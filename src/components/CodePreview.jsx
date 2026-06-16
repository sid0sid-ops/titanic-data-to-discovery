import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function CodePreview({ code, label = 'Notebook code' }) {
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();

  const copyCode = async () => {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="code-preview">
      <div className="code-toolbar">
        <span>{label}</span>
        <motion.button
          type="button"
          onClick={copyCode}
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
