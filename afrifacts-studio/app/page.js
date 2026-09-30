import { redirect } from 'next/navigation';

/** The agent is where work starts, so the studio opens on it. */
export default function Home() {
  redirect('/agent');
}
