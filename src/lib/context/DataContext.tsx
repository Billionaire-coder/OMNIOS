
import { createContext } from 'react';

/**
 * DataContext: Provides the current collection item data to child elements.
 * Used by Repeater components to pass down "current item" context.
 */
export const DataContext = createContext<any>(null);
