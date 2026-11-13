/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import LandingView from './views/LandingView';
import MaestroQrView from './views/MaestroQrView';
import PreacherView from './views/PreacherView';
import RoomExperienceView from './views/RoomExperienceView';

/** Ruta base de Vite ('/' en local, '/REUNION-DE-CABALLEROS/' en GitHub Pages). */
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, '');

interface RouteState {
  path: string;
  isDemo: boolean;
}

function normalizeRoute(rawPath: string): RouteState {
  const url = new URL(rawPath, window.location.origin);
  let pathname = url.pathname;

  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length);
  }

  const clean = pathname.replace(/\/+$/, '') || '/';
  const isDemo = url.searchParams.get('demo') === '1';
  return { path: clean, isDemo };
}

function toBrowserPath(target: string): string {
  if (/^https?:\/\//i.test(target)) return target;
  const clean = target.startsWith('/') ? target : `/${target}`;
  return `${BASE_PATH}${clean}`;
}

export default function App() {
  const [route, setRoute] = useState(() =>
    normalizeRoute(`${window.location.pathname}${window.location.search}`)
  );

  useEffect(() => {
    const onPopState = () => {
      setRoute(normalizeRoute(`${window.location.pathname}${window.location.search}`));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((target: string) => {
    window.history.pushState({}, '', toBrowserPath(target));
    setRoute(normalizeRoute(target));
    window.scrollTo(0, 0);
  }, []);

  if (route.path === '/ar') {
    return <RoomExperienceView onNavigate={navigate} />;
  }

  if (route.path === '/m') {
    return <MaestroQrView onNavigate={navigate} />;
  }

  if (route.path === '/p') {
    return <PreacherView onNavigate={navigate} />;
  }

  return <LandingView onNavigate={navigate} />;
}
