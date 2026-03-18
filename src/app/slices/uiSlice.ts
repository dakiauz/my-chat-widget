import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { IContact } from '../features/Calls/models/calls';

interface UIState {
    selectedContact: IContact | null;
    isMobile: boolean;
    currentView: 'contacts' | 'contact-detail' | 'dialer';
    sidebarCollapsed: boolean;
    dialerPosition: { x: number; y: number };
    dialerMinimized: boolean;
}

// Calculate initial position for bottom right (Facebook chat style)
const getInitialDialerPosition = () => {
    if (typeof window !== 'undefined') {
        const padding = 20; // Distance from edges
        const dialerWidth = 420;
        const dialerHeight = 750; // Approximate height

        return {
            x: window.innerWidth - dialerWidth - padding,
            y: window.innerHeight - dialerHeight - padding,
        };
    }

    // Fallback for SSR
    return { x: 0, y: 0 };
};

const initialState: UIState = {
    selectedContact: null,
    isMobile: false,
    currentView: 'contacts',
    sidebarCollapsed: false,
    dialerPosition: getInitialDialerPosition(),
    dialerMinimized: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setSelectedContact: (state, action: PayloadAction<IContact>) => {
            state.selectedContact = action.payload;
            if (state.isMobile) {
                state.currentView = 'contact-detail';
            }
        },
        setMobile: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
            if (!action.payload) {
                state.currentView = 'contacts';
                // Reset dialer position when switching to desktop
                state.dialerPosition = getInitialDialerPosition();
            }
        },
        setCurrentView: (state, action: PayloadAction<'contacts' | 'contact-detail' | 'dialer'>) => {
            state.currentView = action.payload;
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.sidebarCollapsed = action.payload;
        },
        setDialerPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
            state.dialerPosition = action.payload;
        },
        setDialerMinimized: (state, action: PayloadAction<boolean>) => {
            state.dialerMinimized = action.payload;
        },
        resetDialerPosition: (state) => {
            state.dialerPosition = getInitialDialerPosition();
        },
        goBack: (state) => {
            if (state.isMobile) {
                if (state.currentView === 'contact-detail') {
                    state.currentView = 'contacts';
                } else if (state.currentView === 'dialer') {
                    state.currentView = 'contacts';
                }
            }
        },
    },
});

export const { setSelectedContact, setMobile, setCurrentView, setSidebarCollapsed, setDialerPosition, setDialerMinimized, resetDialerPosition, goBack } = uiSlice.actions;

export default uiSlice.reducer;
