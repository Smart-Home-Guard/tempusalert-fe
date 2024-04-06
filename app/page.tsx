"use client"

import { redirect } from 'next/navigation';

export default function Root() {
  if (localStorage.getItem('loggedin')) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
