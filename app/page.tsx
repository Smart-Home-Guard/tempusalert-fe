"use client"

import { redirect } from 'next/navigation';
import { useLocalStorage } from 'usehooks-ts';

export default function Root() {
  const [loggedIn] = useLocalStorage("loggedIn", false);
  if (loggedIn) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
