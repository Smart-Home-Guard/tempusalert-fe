"use client"

import { useLoggedInStore } from '@/store';
import { redirect } from 'next/navigation';
import { useEffect, useTransition } from 'react';

export default function Root() {
  const { ready, loggedIn } = useLoggedInStore();
  const [, startTransition] = useTransition();
  useEffect(() => {
    if (!ready) {
      return;
    }

    if (loggedIn) {
      startTransition(() => redirect('/home'));
    } else {
      startTransition(() => redirect('/login'));
    }
  }, [loggedIn]);

  return <></>
}
