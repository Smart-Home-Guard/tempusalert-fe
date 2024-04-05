import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default function Root() {
  if (headers().get('isLoggedIn')) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
