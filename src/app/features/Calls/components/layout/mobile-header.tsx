import React from 'react';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import { Button } from '../../components/ui/button';
import { goBack } from '../../../../slices/uiSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { getInitials } from '../../../../shared/utils/utils';
import { getContactName, getContactNameWithoutFormatting } from '../contacts/ContactList';

const MobileHeader = React.memo(() => {
    const dispatch = useDispatch();
    const { currentView, selectedContact } = useSelector((state: IRootState) => state.ui);

    // if (currentView === 'contacts') return null;

    return (
        <div className={`${currentView === 'contacts' ? ' border-b border-gray-200 ' : ' border-b border-gray-200 '} bg-white  p-4 py-3 flex items-center justify-between sticky top-0`}>
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => dispatch(goBack())} className="sm:hidden p-2 -ml-2">
                    <IconArrowLeft size={20} />
                </Button>
                {selectedContact && (
                    <>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-md font-bold text-green-800/80 ">{getInitials(getContactNameWithoutFormatting(selectedContact))}</span>
                        </div>
                        <span className="font-semibold text-gray-900 truncate">{getContactName(selectedContact)}</span>
                    </>
                )}
            </div>
            {/* <IconDots size={20} className="text-gray-400" /> */}
        </div>
    );
});

MobileHeader.displayName = 'MobileHeader';

export { MobileHeader };
