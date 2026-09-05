import { Icon } from './icons';
import { site } from '@/lib/content';

export function GitHubButton({ className = '', label = 'View source' }: { className?: string; label?: string }) {
  return (
    <a
      href={site.github}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-ghost ${className}`}
      aria-label="View Ginti source on GitHub"
    >
      <Icon name="github" className="h-5 w-5" />
      {label}
    </a>
  );
}
