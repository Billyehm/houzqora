'use client';

import { useRouter } from 'next/navigation';
import { getCurrentUser, setPendingPath } from '@/lib/queries';

// A link to the agents page with the auth door on the click
// itself. Tapping it checks login straight away: if the visitor
// is not signed in, they go to login first and come back to this
// agents link afterwards. If they are signed in, they go straight
// to the agents page. The agents page itself keeps a fallback
// check for direct visits, but the door here is the click, not
// the WhatsApp button on the agents page.
export default function AgentLink({
  href,
  className,
  children,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate?.();
    const user = await getCurrentUser();
    if (!user) {
      setPendingPath(href);
      router.push('/login');
      return;
    }
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
