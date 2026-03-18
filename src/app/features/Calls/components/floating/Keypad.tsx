import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconBackspace } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import audioManager from '../../utils/audio-manager';

const Keypad = ({ onDigitClick, disabled, onDTMF }: { onDigitClick: (digit: string) => void; disabled: boolean; onDTMF?: (digit: string) => void }) => {
    const digits = useMemo(() => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#', '+'], []);

    const handleDigitClick = useCallback(
        (digit: string) => {
            onDigitClick(digit);
            // Play DTMF tone for digit (except backspace)
            if (audioManager) {
                audioManager.playDTMF(digit);
            }
            // Send DTMF tone if in active call
            if (onDTMF) {
                onDTMF(digit);
            }
        },
        [onDigitClick, onDTMF]
    );

    return (
        <div className="grid grid-cols-3 gap-4 px-3">
            {digits.map((digit, index) => (
                <motion.div key={index} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                    <Button className="px-[12px] py-[18px] text-lg w-full text-black font-normal bg-gray-200 hover:bg-gray-300" onClick={() => handleDigitClick(digit)} disabled={disabled}>
                        {digit}
                    </Button>
                </motion.div>
            ))}
            <motion.div className="col-span-2 grid grid-cols-2 flex justify-end gap-4 " whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                <div />
                <Button className="!ml-auto px-[12px] py-[18px] text-lg w-full text-black font-normal bg-gray-200 hover:bg-gray-300" onClick={() => handleDigitClick('⌫')} disabled={disabled}>
                    <IconBackspace size={20} />
                </Button>
            </motion.div>
        </div>
    );
};

Keypad.displayName = 'Keypad';
export default Keypad;
