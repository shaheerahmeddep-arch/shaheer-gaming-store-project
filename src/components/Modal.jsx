import React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} glass rounded-xl border border-gaming-border shadow-neon-purple max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gaming-border">
              <h3 className="font-display font-semibold text-lg text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gaming-surface text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
