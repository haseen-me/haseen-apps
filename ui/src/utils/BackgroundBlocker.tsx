/**
 * Haseen UI — Background Blocker
 *
 * A fixed full-viewport overlay used to block interactions behind modals/dropdowns.
 */

import React from 'react';

import { zIndex } from '../tokens';

export interface BackgroundBlockerProps {
  onClick?: (e: React.MouseEvent) => void;
  zIndexOverride?: number;
}

const BackgroundBlocker: React.FC<BackgroundBlockerProps> = ({ onClick, zIndexOverride }) => (
  <div
    onClick={onClick}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: zIndexOverride ?? zIndex.modal,
    }}
  />
);

export default BackgroundBlocker;
