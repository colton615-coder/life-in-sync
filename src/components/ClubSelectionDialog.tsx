import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GolfClub } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check } from '@phosphor-icons/react'

interface ClubSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectClub: (club: GolfClub) => void
}

const CLUB_CATEGORIES = {
  'Woods': ['Driver', '3-Wood', '5-Wood'] as GolfClub[],
  'Hybrids': ['3-Hybrid', '4-Hybrid', '5-Hybrid'] as GolfClub[],
  'Irons': ['3-Iron', '4-Iron', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron'] as GolfClub[],
  'Wedges': ['PW', 'GW', 'SW', 'LW'] as GolfClub[],
  'Putter': ['Putter'] as GolfClub[]
}

export function ClubSelectionDialog({ open, onOpenChange, onSelectClub }: ClubSelectionDialogProps) {
  const handleSelect = (club: GolfClub) => {
    onSelectClub(club)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Club Used</DialogTitle>
          <DialogDescription>
            Tag this swing analysis with the club you used
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(CLUB_CATEGORIES).map(([category, clubs]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {clubs.map((club) => (
                  <Button
                    key={club}
                    variant="outline"
                    className="h-auto py-3 px-4 text-sm hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => handleSelect(club)}
                  >
                    {club}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
