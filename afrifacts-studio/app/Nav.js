'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * The three places there are.
 *
 * Ordered by where they sit in the pipeline: the board, the seed list
 * that starts every run, and the one gate at the end. Triage and Images
 * used to sit between them — two queues that had to be emptied before a
 * run produced anything a reader could see. The pipeline runs through
 * now, and the judging happens once, on the finished fact.
 */
const LINKS = [
  { href: '/', label: 'Pipeline' },
  { href: '/sources', label: 'Sources' },
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
