import { FC, lazy } from 'react';
import { wait } from '../../_theme/theme.utils';

const SuspenseTrigger: FC = lazy(async () => {
    await wait(10000);
    return { default: () => null };
});

export default SuspenseTrigger;
