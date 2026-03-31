'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';
import { Auth } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<{
    app: FirebaseApp;
    db: Firestore;
    rtdb: Database;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const { app, db, rtdb, auth } = initializeFirebase();
    setInstances({ app, db, rtdb, auth });
  }, []);

  if (!instances) {
    return null;
  }

  return (
    <FirebaseProvider
      app={instances.app}
      db={instances.db}
      rtdb={instances.rtdb}
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
