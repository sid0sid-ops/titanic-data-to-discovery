import { motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';
import { links } from '../data/projectContent.js';

const downloads = [
  {
    label: 'Download Notebook',
    href: 'notebooks/Titanic_Data_to_Discovery.ipynb',
    description: 'Colab-ready notebook generated with nbformat.',
    download: true,
  },
  {
    label: 'Open in Colab',
    href: links.colab,
    description: 'Run the complete analysis in Google Colab.',
  },
  {
    label: 'Download OpenML Dataset',
    href: 'https://www.openml.org/data/get_csv/16826755/phpMYEkMl',
    description: 'Main 1309-row Titanic dataset.',
  },
  {
    label: 'Download Graph ZIP',
    href: 'assets/titanic_graphs.zip',
    description: 'All generated graph PNG files.',
    download: true,
  },
  {
    label: 'View GitHub Repo',
    href: links.github,
    description: 'Review source code, docs, notebook, and deployment files.',
  },
];

export default function DownloadCenter() {
  const reduceMotion = useReducedMotion();
  const withBase = (href) => (href.startsWith('http') ? href : `${import.meta.env.BASE_URL}${href}`);

  return (
    <Section id="downloads" eyebrow="Project assets" title="Download Center">
      <div className="download-grid">
        {downloads.map((item) => (
          <motion.a
            className="download-card"
            href={withBase(item.href)}
            key={item.label}
            download={item.download}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </motion.a>
        ))}
      </div>
    </Section>
  );
}
