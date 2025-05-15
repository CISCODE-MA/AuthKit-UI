// src/components/auth/SessionExpiredModal.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useT } from '@ciscode-template-model/translate-core';

interface Props {
    onConfirm: () => void; // runs hardLogout()
}

export const SessionExpiredModal: React.FC<Props> = ({ onConfirm }) => {
    const t = useT('authLib'); // assuming translations under "auth" namespace

    /* disable scroll & clicks behind the modal */
    useEffect(() => {
        const { body } = document;
        const prevOverflow = body.style.overflow;
        const prevPointer = body.style.pointerEvents;

        body.style.overflow = 'hidden';
        body.style.pointerEvents = 'none';

        return () => {
            body.style.overflow = prevOverflow;
            body.style.pointerEvents = prevPointer;
        };
    }, []);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="pointer-events-auto w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-gray-800 ltr:text-left rtl:text-center">
                    {t('sessionExpired.title')}
                </h2>

                <p className="mb-8 text-sm text-gray-600 ltr:text-left rtl:text-center">
                    {t('sessionExpired.message')}
                </p>

                <div className="flex justify-end">
                    <button
                        onClick={onConfirm}
                        className="
              rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white
              hover:bg-red-700 focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-red-600
            "
                    >
                        {t('sessionExpired.button')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
