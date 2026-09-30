'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * The two places there are: the agent, which finds and checks facts, and
 * the review page, where a live fact is corrected, held back or pulled.
 */
const LINKS = [
  { href: '/agent', label: 'Agent' },
  { href: '/review', label: 'Review' },
];

export function Nav() {
  const pathname = usePathname();
  const ref = useRef(null);

  /*
    Tell the page how tall the header is.

    The masthead sticks to the top, and so does the review page's row of
    filters. Two things stuck at zero land on each other, and the second
    one cannot be told where to sit because the header's height is not a
    constant — the wordmark and the nav wrap onto two lines on a narrow
    window, and the number changes.

    So it is measured and published as `--masthead-h`. This lives in Nav
    rather than the layout because the layout is a server component and
    cannot hold an effect, and Nav is the client component already inside
    the header it needs to measure.
  */
  useEffect(() => {
    const masthead = ref.current?.closest('.masthead');
    if (!masthead) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        '--masthead-h',
        `${Math.round(masthead.getBoundingClientRect().height)}px`,
      );
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(masthead);
    return () => observer.disconnect();
  }, []);

  return (
    <nav ref={ref}>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} data-active={pathname === link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
