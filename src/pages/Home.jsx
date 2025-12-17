import React from 'react';
import DynamicHome from '../components/DynamicHome';

/**
 * Home page - uses DynamicHome component to fetch from CMS
 * Falls back to static components if CMS has no sections
 */
export default function Home() {
  return <DynamicHome />;
}
