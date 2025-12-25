// Attractive Confirmation Modal
// Beautiful confirmation dialog with smooth animations

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          gradient: 'from-red-500 to-red-600',
          icon: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'danger',
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500 to-yellow-600',
          icon: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          button: 'warning',
        };
      case 'info':
        return {
          gradient: 'from-blue-500 to-blue-600',
          icon: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          button: 'primary',
        };
    }
  };

  const colors = getColors();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                      </div>
                      <Dialog.Title className="text-xl font-bold text-white">
                        {title}
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                      disabled={isLoading}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 mb-6`}>
                    <p className="text-gray-700 text-base leading-relaxed">{message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {cancelText}
                    </Button>
                    <Button
                      variant={colors.button as any}
                      onClick={onConfirm}
                      isLoading={isLoading}
                      className="flex-1"
                    >
                      {confirmText}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

