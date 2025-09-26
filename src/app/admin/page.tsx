
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Home from '../page'; // Assuming your main page component is here

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This logic forwards any query params from /admin to the main page's client component
    // This is a workaround to handle the TikTok auth callback which needs to land on a server-routable page
    // before we can interact with client-side state.
    const params = new URLSearchParams(searchParams.toString());
    params.set('hub', 'admin'); // Ensure the admin hub is active
    
    // We are using a client-side navigation to the root `page.tsx`
    // and passing parameters via the URL to be handled by the root client component.
    // This is not ideal but necessary given the constraints.
    router.replace(`/?${params.toString()}`);
  }, [router, searchParams]);
  
  // Render your main page component. It will be quickly replaced by the redirect.
  return <Home />;
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPageContent />
        </Suspense>
    )
}
