import React, { useEffect } from 'react';
import { oidcService } from '../../../services/oidcService';

export const SilentCallback: React.FC = () => {
  useEffect(() => {
    const processSilentCallback = async () => {
      try {
        const userManager = oidcService.getUserManager();
        await userManager.signinSilentCallback();
      } catch (error) {
        console.error('Silent callback failed:', error);
      }
    };

    processSilentCallback();
  }, []);

  // This component is loaded in a hidden iframe, so no UI is needed
  return null;
};

// Export a version that can be used as a standalone page
export const SilentCallbackPage: React.FC = () => {
  useEffect(() => {
    const processSilentCallback = async () => {
      try {
        const userManager = oidcService.getUserManager();
        await userManager.signinSilentCallback();
      } catch (error) {
        console.error('Silent callback failed:', error);
      }
    };

    processSilentCallback();
  }, []);

  return (
    <div style={{ display: 'none' }}>
      Silent renewal in progress...
    </div>
  );
};
