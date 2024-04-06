"use client"

import { apiClient } from '@/lib/apiClient';
import { urlBase64ToUint8Array } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Root() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      apiClient.GET("/api/push-credential/public-key")
        .then(({ data: applicationServerKey }) =>
          navigator.serviceWorker
            .register("/push-notification-listener.js")
            .then((registration) => registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(applicationServerKey!),
        })))
    }
  }, []);

  if (typeof window !== "undefined") {
    if (localStorage.getItem('loggedin')) {
      redirect('/home');
    } else {
      redirect('/login');
    }
  }
}
