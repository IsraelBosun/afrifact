import './globals.css';
import { Nav } from './Nav';

export const metadata = {
  title: 'AfriFacts Studio',
  description: 'The content pipeline and its review gates.',
};

/**
 * The shell every page sits in.
 *
 * The masthead carries the nav because the three review pages used to be
 * separate URLs you had to know existed. Making them one app with one
 * header is most of why this stopped being three HTML files.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="masthead">
            <h1 className="wordmark">
              Afri<span>Facts</span> studio
            </h1>
            <Nav />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
