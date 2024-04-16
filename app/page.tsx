"use client"

import { redirect } from 'next/navigation';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { useEffect, useTransition } from 'react';

export default function Root() {
  const [loggedIn] = useLocalStorage<undefined | boolean>("loggedIn", undefined);
  const [, startTransition] = useTransition();
  useEffect(() => {
    if (loggedIn) {
      startTransition(() => redirect('/home'));
    } else {
      startTransition(() => redirect('/login'));
    }
  }, [loggedIn]);

  return <></>
}
