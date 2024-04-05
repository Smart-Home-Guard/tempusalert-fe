import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Root() {
  if (cookies().get('isLoggedIn')) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
