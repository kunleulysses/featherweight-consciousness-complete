import { useEffect } from 'react';
import { oidcService } from '../services/oidcService';

export default function SilentCallback() {
  useEffect(() => {
    oidcService.signinSilentCallback().catch(error => {
      console.error('Silent renew error:', error);
    });
  }, []);

  return null;
}
