/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CaballeroRegistro, getSavedCaballero } from './data/experienceConfig';
import FacilitatorPanelView from './views/FacilitatorPanelView';
import LandingView from './views/LandingView';
import MaestroQrView from './views/MaestroQrView';
import PreacherView from './views/PreacherView';
import RegistroView from './views/RegistroView';
import RoomExperienceView from './views/RoomExperienceView';

function normalizeRoute(rawPath: string): { path: string; isDemo: boolean } {
  const url = new URL(rawPath, window.location.origin);
  const clean = url.pathname.replace(/\/+$/, '') || '/';
  const isDemo = url.searchParams.get('demo') === '1';
  return { path: clean, isDemo };
}

export default function App() {
  const [route, setRoute] = useState(() =>
    normalizeRoute(`${window.location.pathname}${window.location.search}`)
  );
  const [caballero, setCaballero] = useState<CaballeroRegistro | null>(() => getSavedCaballero());

  useEffect(() => {
    const onPopState = () => {
      setRoute(normalizeRoute(`${window.location.pathname}${window.location.search}`));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((target: string) => {
    window.history.pushState({}, '', target);
    setRoute(normalizeRoute(target));
    window.scrollTo(0, 0);
  }, []);

  const refreshCaballero = useCallback(() => {
    setCaballero(getSavedCaballero());
  }, []);

  // Gate /ar behind registration unless ?demo=1
  if (route.path === '/ar') {
    if (!caballero && !route.isDemo) {
      return <RegistroView onNavigate={navigate} onRegistered={refreshCaballero} />;
    }
    return (
      <RoomExperienceView
        onNavigate={navigate}
        caballero={caballero}
        isDemo={route.isDemo}
      />
    );
  }

  if (route.path === '/entrar') {
    return <RegistroView onNavigate={navigate} onRegistered={refreshCaballero} />;
  }

  if (route.path === '/m') {
    return <MaestroQrView onNavigate={navigate} />;
  }

  if (route.path === '/p') {
    return <PreacherView onNavigate={navigate} />;
  }

  if (route.path === '/panel') {
    return <FacilitatorPanelView onNavigate={navigate} onDataCleared={refreshCaballero} />;
  }

  return <LandingView onNavigate={navigate} hasRegistered={Boolean(caballero)} />;
}
