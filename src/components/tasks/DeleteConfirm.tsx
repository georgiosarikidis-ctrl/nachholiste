'use client'

import { Modal, Button } from '@/components/ui'

interface DeleteConfirmProps {
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirm({ onConfirm, onClose }: DeleteConfirmProps) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6 text-center max-w-sm mx-auto">
        <div className="text-4xl mb-3">🗑</div>
        <h3 className="text-base font-semibold mb-1">Aufgabe löschen?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Die Aufgabe wird in den Papierkorb verschoben und kann nicht mehr wiederhergestellt werden.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Löschen
          </Button>
        </div>
      </div>
    </Modal>
  )
}
